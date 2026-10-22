import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Fence for heal 627ca85d: `gates:spec` invoked bare `python`, which is
// absent on hosts that ship only python3 (the forge worker pools among
// them), so `pnpm run gates` died at its fifth step there. python3 is
// present everywhere `python` is, including GitHub's setup-python.
const root = resolve(__dirname, "../..");
const BARE_PYTHON = /(^|[\s&;|(])python(?=\s)/;

describe("package scripts", () => {
  it("never invoke bare python (python3 only)", () => {
    const pkg = JSON.parse(
      readFileSync(resolve(root, "package.json"), "utf8"),
    ) as {
      scripts: Record<string, string>;
    };
    const offenders = Object.entries(pkg.scripts).filter(([, cmd]) =>
      BARE_PYTHON.test(cmd),
    );
    expect(offenders).toEqual([]);
  });

  it("ci.yml runs the spec scripts through python3", () => {
    const ci = readFileSync(resolve(root, ".github/workflows/ci.yml"), "utf8");
    const runs = ci.split("\n").filter((l) => /^\s*-?\s*run:/.test(l));
    expect(
      runs.filter((l) => BARE_PYTHON.test(l.replace(/^\s*-?\s*run:/, " "))),
    ).toEqual([]);
  });

  // Fence for heal 4912fc90: pnpm 11 defaults verifyDepsBeforeRun to
  // "install", so `pnpm run <anything>` wrote the shared store first and
  // died EROFS wherever that store is mounted read-only.
  it("pnpm run never installs as a side effect", () => {
    const ws = readFileSync(resolve(root, "pnpm-workspace.yaml"), "utf8");
    const setting = ws.match(/^verifyDepsBeforeRun:\s*(\S+)/m)?.[1];
    expect(setting).toBeDefined();
    expect(["warn", "error", "false"]).toContain(setting);
  });

  // Fence for heal e615d5a8: the one docs-out artifact is served at two
  // mount points (g3.ghostsystems.ai at /, GitHub Pages at /g3-toolkit/).
  // An absolute base fits one and white-screens the other: the entry
  // module 404s and #root never mounts. /g3-toolkit/playground/ broke the
  // root serve; its replacement /playground/ broke Pages. Only a relative
  // base loads under both, which is safe because the playground routes by
  // query string, never by pathname.
  it("docs:demo builds the playground with a mount-agnostic base", () => {
    const pkg = JSON.parse(
      readFileSync(resolve(root, "package.json"), "utf8"),
    ) as {
      scripts: Record<string, string>;
    };
    const cmd = pkg.scripts["docs:demo"];
    expect(cmd).toBeDefined();
    const base = cmd?.match(/--base[=\s]+(\S+)/)?.[1];
    expect(base).toBe("./");
  });

  // A worktree that links node_modules to a main checkout gets a symlink,
  // which the directory-only pattern `node_modules/` does not match.
  it(".gitignore ignores node_modules symlinks, not only directories", () => {
    const lines = readFileSync(resolve(root, ".gitignore"), "utf8")
      .split("\n")
      .map((l) => l.trim());
    expect(lines).toContain("node_modules");
  });
});
