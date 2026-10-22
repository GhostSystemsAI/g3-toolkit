import { describe, it, expect, afterEach } from "vitest";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  buildOverlayStore,
  nodeModulesState,
  overlayRootFor,
  planInstall,
} from "../../scripts/install-deps.mjs";

// Fence for heal 09cf2530: plan worktrees had no node_modules, and the
// `install:deps` script pointed at scripts/install-deps.mjs, which did not
// exist, so there was no supported way to provision one. Workers symlinked
// the main checkout's node_modules instead, which resolves every `@g3t/*`
// workspace link into the main checkout.
const root = resolve(__dirname, "../..");
const scratch: string[] = [];
const tmp = () => {
  const d = mkdtempSync(join(tmpdir(), "g3t-install-deps-"));
  scratch.push(d);
  return d;
};
afterEach(() => {
  for (const d of scratch.splice(0))
    rmSync(d, { recursive: true, force: true });
});

describe("install-deps", () => {
  it("every package script that runs node scripts/<file> names a real file", () => {
    const pkg = JSON.parse(
      readFileSync(join(root, "package.json"), "utf8"),
    ) as {
      scripts: Record<string, string>;
    };
    const missing = Object.entries(pkg.scripts).flatMap(([name, cmd]) =>
      [...cmd.matchAll(/\bnode\s+(scripts\/\S+)/g)]
        .flatMap((m) => (m[1] ? [m[1]] : []))
        .filter((p) => !existsSync(join(root, p)))
        .map((p) => `${name}: ${p}`),
    );
    expect(missing).toEqual([]);
  });

  it("classifies node_modules as missing, symlink or installed", () => {
    const d = tmp();
    expect(nodeModulesState(d)).toBe("missing");
    const donor = tmp();
    mkdirSync(join(donor, "node_modules"));
    writeFileSync(join(donor, "node_modules", ".modules.yaml"), "");
    expect(nodeModulesState(donor)).toBe("installed");
    symlinkSync(join(donor, "node_modules"), join(d, "node_modules"));
    expect(nodeModulesState(d)).toBe("symlink");
  });

  it("replaces a borrowed symlink with a real install, never keeps it", () => {
    expect(planInstall({ state: "installed", writable: true })).toEqual({
      action: "none",
    });
    expect(planInstall({ state: "symlink", writable: true })).toEqual({
      action: "install",
      unlinkSymlink: true,
      overlay: false,
    });
    expect(planInstall({ state: "missing", writable: false })).toMatchObject({
      action: "install",
      overlay: true,
    });
  });

  it("overlays a read-only store: content linked, registry writable", () => {
    const store = join(tmp(), "v11");
    mkdirSync(join(store, "files"), { recursive: true });
    mkdirSync(join(store, "links"));
    mkdirSync(join(store, "projects"));
    writeFileSync(join(store, "index.db"), "db");
    const overlay = join(tmp(), "ov");
    expect(buildOverlayStore(store, overlay)).toBe(overlay);
    const v = join(overlay, "v11");
    expect(readlinkSync(join(v, "files"))).toBe(join(store, "files"));
    expect(readlinkSync(join(v, "links"))).toBe(join(store, "links"));
    expect(lstatSync(join(v, "index.db")).isSymbolicLink()).toBe(false);
    expect(readFileSync(join(v, "index.db"), "utf8")).toBe("db");
    expect(lstatSync(join(v, "projects")).isDirectory()).toBe(true);
    expect(lstatSync(join(v, "projects")).isSymbolicLink()).toBe(false);
    expect(existsSync(join(v, ".tmp"))).toBe(true);
  });

  it("puts the overlay in the job work dir when dispatched", () => {
    expect(overlayRootFor({ WEAVER_JOB_DIR: "/j" })).toBe(
      "/j/work/g3t-pnpm-store-overlay",
    );
  });

  it("this checkout's workspace links resolve inside it", () => {
    // A node_modules borrowed from another checkout points @g3t/core there.
    expect(nodeModulesState(root)).toBe("installed");
    const core = join(root, "node_modules", "@g3t", "core");
    expect(
      resolve(join(root, "node_modules", "@g3t"), readlinkSync(core)),
    ).toBe(join(root, "packages", "core"));
  });
});
