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
// Usage: node scripts/install-deps.mjs [extra pnpm install args]
//   G3T_PNPM_OVERLAY_STORE=<dir>  overlay location (default: a temp dir)

import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Entries pnpm writes during an install that is fully satisfied offline.
const WRITABLE_DIRS = ["projects", ".tmp"];
const isIndexFile = (name) => /^index\.db(-wal|-shm)?$/.test(name);

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

function main(args) {
  const storeDir = execFileSync("pnpm", ["store", "path"], {
    encoding: "utf8",
  }).trim();
  let installArgs = ["install", "--frozen-lockfile", ...args];
  if (!storeIsWritable(storeDir)) {
    const root =
      process.env.G3T_PNPM_OVERLAY_STORE ??
      fs.mkdtempSync(path.join(os.tmpdir(), "g3t-pnpm-overlay-"));
    buildOverlayStore(storeDir, root);
    console.log(
      `install-deps: store ${storeDir} is read-only; installing offline through overlay ${root}`,
    );
    installArgs = [...installArgs, "--offline", "--store-dir", root];
  }
  const res = spawnSync("pnpm", installArgs, { stdio: "inherit" });
  return res.status ?? 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exit(main(process.argv.slice(2)));
}
