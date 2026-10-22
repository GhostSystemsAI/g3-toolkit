#!/usr/bin/env node
// Install this checkout's own node_modules, including in a fresh plan
// worktree under a sandbox whose shared pnpm store is mounted read-only.
//
// A git worktree carries no node_modules (gitignored), so vitest and tsc
// fail ERR_MODULE_NOT_FOUND until something provides them (heal 09cf2530).
// The tempting fix, symlinking node_modules from the main checkout, is
// wrong: pnpm's workspace links are relative (`@g3t/core ->
// ../../packages/core`), so through the symlink every `@g3t/*` import and
// every workspace package's own node_modules resolve into the MAIN
// checkout, and the worktree tests code it did not change. This script
// replaces such a symlink with a real install.
//
// `pnpm install` always registers the project in `<store>/projects`, which
// dies EROFS when the store is read-only. In that case the install runs
// against an overlay store: `files/` and `links/` symlinked to the real
// store (read-only is fine for them), the index database copied, and a
// writable `projects/` and `.tmp/`. --offline keeps it network-free.
//
// Usage: node scripts/install-deps.mjs [--dry-run]
import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const STORE_LINKED = ["files", "links", ".pnpm-needs-build-marker"];
const STORE_COPIED = ["index.db", "index.db-wal", "index.db-shm"];
const STORE_WRITABLE = ["projects", ".tmp"];

/** State of `<root>/node_modules`: "missing", "symlink" or "installed". */
export function nodeModulesState(root) {
  const nm = join(root, "node_modules");
  let st;
  try {
    st = lstatSync(nm);
  } catch {
    return "missing";
  }
  if (st.isSymbolicLink()) return "symlink";
  return existsSync(join(nm, ".modules.yaml")) ? "installed" : "missing";
}

/** True when `<storeVersionDir>/projects` accepts a write. */
export function storeWritable(storeVersionDir) {
  const probe = join(storeVersionDir, "projects", `.g3t-probe-${process.pid}`);
  try {
    mkdirSync(join(storeVersionDir, "projects"), { recursive: true });
    writeFileSync(probe, "");
    unlinkSync(probe);
    return true;
  } catch {
    return false;
  }
}

/**
 * Build an overlay of the read-only store `storeVersionDir` (a `.../v11`
 * directory) under `overlayRoot`. Returns the value for `--store-dir`,
 * which is the parent of the version directory, as pnpm appends it.
 */
export function buildOverlayStore(storeVersionDir, overlayRoot) {
  const version = storeVersionDir.split(/[\\/]/).filter(Boolean).pop();
  const dir = join(overlayRoot, version);
  rmSync(overlayRoot, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  for (const name of STORE_LINKED) {
    if (existsSync(join(storeVersionDir, name))) {
      symlinkSync(join(storeVersionDir, name), join(dir, name));
    }
  }
  for (const name of STORE_COPIED) {
    if (existsSync(join(storeVersionDir, name))) {
      copyFileSync(join(storeVersionDir, name), join(dir, name));
    }
  }
  for (const name of STORE_WRITABLE) mkdirSync(join(dir, name));
  return overlayRoot;
}

/** Scratch location for the overlay: the job's work dir when dispatched. */
export function overlayRootFor(env) {
  const base = env.WEAVER_JOB_DIR ? join(env.WEAVER_JOB_DIR, "work") : tmpdir();
  return join(base, "g3t-pnpm-store-overlay");
}

/**
 * Decide what to do. Pure apart from the filesystem reads passed in, so
 * the policy is testable without running pnpm.
 */
export function planInstall({ state, writable }) {
  if (state === "installed") return { action: "none" };
  return {
    action: "install",
    unlinkSymlink: state === "symlink",
    overlay: !writable,
  };
}

function main(argv) {
  const dryRun = argv.includes("--dry-run");
  const root = resolve(fileURLToPath(import.meta.url), "../..");
  const state = nodeModulesState(root);
  if (state === "installed") {
    console.log("install-deps: node_modules already installed");
    return 0;
  }
  const storeVersionDir = execFileSync("pnpm", ["store", "path"], {
    cwd: root,
    encoding: "utf8",
  }).trim();
  const plan = planInstall({ state, writable: storeWritable(storeVersionDir) });
  const args = ["install", "--frozen-lockfile", "--offline"];
  if (plan.unlinkSymlink) {
    console.log(
      `install-deps: replacing node_modules symlink -> ${readlinkSync(join(root, "node_modules"))}`,
    );
  }
  if (plan.overlay) {
    const overlayRoot = overlayRootFor(process.env);
    console.log(
      `install-deps: store ${storeVersionDir} is read-only; overlay at ${overlayRoot}`,
    );
    if (!dryRun)
      args.push("--store-dir", buildOverlayStore(storeVersionDir, overlayRoot));
  }
  console.log(`install-deps: pnpm ${args.join(" ")}`);
  if (dryRun) return 0;
  // Unlink only the link itself; the main checkout's tree is untouched.
  if (plan.unlinkSymlink) unlinkSync(join(root, "node_modules"));
  execFileSync("pnpm", args, { cwd: root, stdio: "inherit" });
  return nodeModulesState(root) === "installed" ? 0 : 1;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  process.exit(main(process.argv.slice(2)));
}
