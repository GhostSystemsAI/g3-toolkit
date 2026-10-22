import { describe, it, expect, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  buildOverlayStore,
  overlayRoot,
  storeIsWritable,
} from "../../scripts/install-deps.mjs";

// Fence for heal e793bdc7: pnpm 11 writes <store>/projects and index.db on
// every install, so `pnpm install` died EROFS in worktrees whose store is
// mounted read-only. install-deps.mjs detects that and installs through an
// overlay store; these tests pin the detection and the overlay shape.
const tmp: string[] = [];
function mkTmp(): string {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "g3t-install-deps-"));
  tmp.push(d);
  return d;
}
afterEach(() => {
  for (const d of tmp.splice(0)) {
    fs.chmodSync(d, 0o700);
    for (const e of fs.readdirSync(d, { recursive: true }) as string[]) {
      const p = path.join(d, e);
      if (!fs.lstatSync(p).isSymbolicLink()) fs.chmodSync(p, 0o700);
    }
    fs.rmSync(d, { recursive: true, force: true });
  }
});

function fakeStore(): string {
  const store = path.join(mkTmp(), "v11");
  fs.mkdirSync(path.join(store, "files", "00"), { recursive: true });
  fs.writeFileSync(path.join(store, "files", "00", "blob"), "pkg");
  fs.mkdirSync(path.join(store, "links"));
  fs.mkdirSync(path.join(store, "projects"));
  fs.writeFileSync(path.join(store, "index.db"), "sqlite");
  fs.writeFileSync(path.join(store, "index.db-wal"), "");
  return store;
}

const runAsRoot = process.getuid?.() === 0;

describe("install-deps overlay store", () => {
  it("reports a writable store as writable", () => {
    expect(storeIsWritable(fakeStore())).toBe(true);
  });

  it.skipIf(runAsRoot)("reports a read-only store as not writable", () => {
    const store = fakeStore();
    fs.chmodSync(path.join(store, "projects"), 0o500);
    expect(storeIsWritable(store)).toBe(false);
  });

  it("overlays a read-only store with writable registry and index", () => {
    const store = fakeStore();
    const overlay = buildOverlayStore(store, mkTmp());
    expect(path.basename(overlay)).toBe("v11");
    // Content is shared, never copied.
    expect(fs.lstatSync(path.join(overlay, "files")).isSymbolicLink()).toBe(
      true,
    );
    expect(
      fs.readFileSync(path.join(overlay, "files", "00", "blob"), "utf8"),
    ).toBe("pkg");
    expect(fs.lstatSync(path.join(overlay, "links")).isSymbolicLink()).toBe(
      true,
    );
    // What pnpm writes is private to the overlay.
    for (const name of ["projects", ".tmp"]) {
      const st = fs.lstatSync(path.join(overlay, name));
      expect(st.isDirectory() && !st.isSymbolicLink()).toBe(true);
    }
    for (const name of ["index.db", "index.db-wal"]) {
      const st = fs.lstatSync(path.join(overlay, name));
      expect(st.isFile() && !st.isSymbolicLink()).toBe(true);
    }
    expect(storeIsWritable(overlay)).toBe(true);
    // The read-only store is untouched.
    expect(fs.readdirSync(path.join(store, "projects"))).toEqual([]);
  });

  it("is idempotent over an existing overlay", () => {
    const store = fakeStore();
    const root = mkTmp();
    buildOverlayStore(store, root);
    expect(() => buildOverlayStore(store, root)).not.toThrow();
  });

  // Fence for heal b4083ff3 (gotcha worker-pnpm-install-erofs-shared-store):
  // a pool worker's overlay lives in its job scratch root, not private /tmp.
  it("puts the overlay under the pool worker's scratch root", () => {
    const job = mkTmp();
    const root = overlayRoot({ WEAVER_JOB_DIR: job });
    expect(root).toBe(path.join(job, "work", "pnpm-store"));
    expect(fs.statSync(root).isDirectory()).toBe(true);
    expect(overlayRoot({ WEAVER_JOB_DIR: job })).toBe(root);
  });

  it("prefers an explicit overlay location over the job scratch root", () => {
    expect(
      overlayRoot({ G3T_PNPM_OVERLAY_STORE: "/x", WEAVER_JOB_DIR: mkTmp() }),
    ).toBe("/x");
  });

  it("falls back to a fresh temp dir outside a pool worker", () => {
    const a = overlayRoot({});
    tmp.push(a);
    expect(a.startsWith(os.tmpdir())).toBe(true);
  });

  it("is exposed as a package script", () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "../../package.json"), "utf8"),
    ) as { scripts: Record<string, string> };
    expect(pkg.scripts["install:deps"]).toBe("node scripts/install-deps.mjs");
  });
});
