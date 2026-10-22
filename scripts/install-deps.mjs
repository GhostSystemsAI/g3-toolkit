#!/usr/bin/env node
// Install workspace dependencies where the pnpm store is read-only.
//
// pnpm 11 registers every project that installs from a store by writing a
// symlink into <store>/projects (registerProject, unconditional) and keeps
// the package index in a SQLite file (<store>/index.db) it opens for
// writing. Where the store is mounted read-only (sandboxed worker pools,
// heal worktrees) `pnpm install` therefore dies EROFS before it links a
// single package, even when every package it needs is already in the
// store. The workaround was symlinking node_modules from another checkout,
// which ties one tree's dependencies to another tree's lockfile.
//
// This script runs plain `pnpm install --frozen-lockfile` when the store is
// writable. When it is not, it builds an OVERLAY store: writable
// projects/ and .tmp/ directories and a private copy of index.db*, with
// every other entry (files/, links/) symlinked to the read-only store, and
// installs offline from that. Package files are copied into node_modules
// (hardlinks cannot cross the mount), so the overlay is disposable.
//
// A git worktree carries no node_modules (gitignored). The tempting fix,
// symlinking node_modules from the main checkout, is wrong: pnpm's
// workspace links are relative, so every `@g3t/*` import would resolve into
// the MAIN checkout and the worktree would test code it did not change
// (heal 09cf2530). This script removes such a symlink and does a real
// install; it is a no-op when node_modules is already installed.
//
// Usage: node scripts/install-deps.mjs [extra pnpm install args]
//   G3T_PNPM_OVERLAY_STORE=<dir>  overlay location (default:
//   $WEAVER_JOB_DIR/work/pnpm-store in a pool worker, else a temp dir)

import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Entries pnpm writes during an install that is fully satisfied offline.
const WRITABLE_DIRS = ["projects", ".tmp"];
const isIndexFile = (name) => /^index\.db(-wal|-shm)?$/.test(name);

/** State of `<root>/node_modules`: "missing", "symlink" or "installed". */
export function nodeModulesState(root) {
  const nm = path.join(root, "node_modules");
  let st;
  try {
    st = fs.lstatSync(nm);
  } catch {
    return "missing";
  }
  if (st.isSymbolicLink()) return "symlink";
  return fs.existsSync(path.join(nm, ".modules.yaml")) ? "installed" : "missing";
}

/** Decide what to do; pure, so the policy is testable without pnpm. */
export function planInstall({ state, writable }) {
  if (state === "installed") return { action: "none" };
  return {
    action: "install",
    unlinkSymlink: state === "symlink",
    overlay: !writable,
  };
}

/** True when pnpm can register a project in this store. */
export function storeIsWritable(storeDir) {
  const registry = path.join(storeDir, "projects");
  try {
    fs.mkdirSync(registry, { recursive: true });
    const probe = fs.mkdtempSync(path.join(registry, ".g3t-probe-"));
    fs.rmSync(probe, { recursive: true, force: true });
    return true;
  } catch (err) {
    if (["EROFS", "EACCES", "EPERM"].includes(err.code)) return false;
    throw err;
  }
}

/**
 * Build an overlay of the read-only store at storeDir under overlayRoot.
 * storeDir is the versioned directory `pnpm store path` prints (".../v11");
 * the overlay mirrors that last segment so `--store-dir overlayRoot`
 * resolves to it. Returns the overlay's versioned directory.
 */
export function buildOverlayStore(storeDir, overlayRoot) {
  const overlay = path.join(overlayRoot, path.basename(storeDir));
  fs.mkdirSync(overlay, { recursive: true });
  for (const entry of fs.readdirSync(storeDir, { withFileTypes: true })) {
    const target = path.join(overlay, entry.name);
    if (fs.existsSync(target)) continue;
    if (WRITABLE_DIRS.includes(entry.name)) {
      fs.mkdirSync(target);
    } else if (isIndexFile(entry.name)) {
      fs.copyFileSync(path.join(storeDir, entry.name), target);
    } else {
      fs.symlinkSync(path.join(storeDir, entry.name), target);
    }
  }
  for (const dir of WRITABLE_DIRS) {
    fs.mkdirSync(path.join(overlay, dir), { recursive: true });
  }
  return overlay;
}

/**
 * Where the overlay goes: G3T_PNPM_OVERLAY_STORE when set, else
 * $WEAVER_JOB_DIR/work/pnpm-store in a pool worker (its scratch root,
 * visible to `rev jobs status` and reused across installs in one job; the
 * worker's /tmp is private), else a fresh temp dir.
 */
export function overlayRoot(env = process.env) {
  if (env.G3T_PNPM_OVERLAY_STORE) return env.G3T_PNPM_OVERLAY_STORE;
  if (env.WEAVER_JOB_DIR) {
    const root = path.join(env.WEAVER_JOB_DIR, "work", "pnpm-store");
    fs.mkdirSync(root, { recursive: true });
    return root;
  }
  return fs.mkdtempSync(path.join(os.tmpdir(), "g3t-pnpm-overlay-"));
}

function main(args) {
  const root = path.resolve(fileURLToPath(import.meta.url), "../..");
  const state = nodeModulesState(root);
  if (state === "installed") {
    console.log("install-deps: node_modules already installed");
    return 0;
  }
  const storeDir = execFileSync("pnpm", ["store", "path"], {
    encoding: "utf8",
  }).trim();
  let installArgs = ["install", "--frozen-lockfile", ...args];
  const plan = planInstall({ state, writable: storeIsWritable(storeDir) });
  if (plan.unlinkSymlink) {
    console.log(
      `install-deps: replacing node_modules symlink -> ${fs.readlinkSync(path.join(root, "node_modules"))}`,
    );
    // Unlink only the link itself; the donor checkout is untouched.
    fs.unlinkSync(path.join(root, "node_modules"));
  }
  if (plan.overlay) {
    const root = overlayRoot();
    buildOverlayStore(storeDir, root);
    console.log(
      `install-deps: store ${storeDir} is read-only; installing offline through overlay ${root}`,
    );
    installArgs = [...installArgs, "--offline", "--store-dir", root];
  }
  const res = spawnSync("pnpm", installArgs, { stdio: "inherit", cwd: root });
  if (res.status) return res.status;
  return nodeModulesState(root) === "installed" ? 0 : 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exit(main(process.argv.slice(2)));
}
