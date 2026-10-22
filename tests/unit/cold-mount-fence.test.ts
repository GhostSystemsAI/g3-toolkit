import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { builtinModules } from "node:module";

// Fence for heal 331177e4: a one-time cold cost (first mount of a heavy
// shell, or a cold import of ECharts) paid INSIDE a test body counts
// against vitest's 5 s default and timed out on a saturated host. These
// files pay it at collection time or in a budgeted beforeAll instead.
const root = resolve(__dirname, "../..");
const read = (p: string) => readFileSync(resolve(root, p), "utf8");
const WARM = /beforeAll\(\(\) => \{\s*render\(<(\w+)[^]*?\},\s*[\d_]+\);/;

describe("cold one-time costs stay out of test bodies", () => {
  it.each([
    [
      "examples/decision-dashboards/src/AnalyticsDashboard.test.tsx",
      "AnalyticsDashboard",
    ],
    ["src/demo/scale/ScaleSurface.test.tsx", "ScaleSurface"],
  ])("%s warms its first mount in a budgeted beforeAll", (file, shell) => {
    expect(read(file).match(WARM)?.[1]).toBe(shell);
  });

  it.each([
    ["StatsPanel", "stats"],
    ["TimelineView", "timeline"],
  ])("%s is imported at collection time", (name, mod) => {
    const src = read("packages/react/src/views/secondary-views.test.tsx");
    expect(src).not.toContain(`await import("../views/${mod}")`);
    expect(src).toContain(`import { ${name} } from "../views/${mod}";`);
  });
});

// Fence for heal b4a780b8, generalised: a dynamic import inside a test body
// is only free when the module is already loaded at collection time (a
// static import or a top-level await import of the same specifier).
// Anything else pays its cold transform against the 5 s test timeout.
// Exemptions carry their reason; computed specifiers are not matched.
const IN_BODY = /^[ \t]+(?![ \t]|\/\/|\*).*?await import\(\s*["']([^"']+)["']\s*\)/gm;
const STATIC = /^import\s+(?!type\b)[^;]*?\bfrom\s+["']([^"']+)["']|^import\s+["']([^"']+)["']|^const\s.*?=\s*await import\(\s*["']([^"']+)["']\s*\)/gm;
const EXEMPT: Record<string, string> = {
  // Imports the BUILT dist by computed path; runs under vitest.dist.config.
  "tests/dist/public-api.test.ts": "dist import by design",
};

describe("in-body dynamic imports name a module loaded at collection time", () => {
  const files = execFileSync(
    "git",
    ["ls-files", "*.test.ts", "*.test.tsx"],
    { cwd: root, encoding: "utf8" },
  )
    .split("\n")
    .filter((f) => f && !(f in EXEMPT));

  it("finds the test corpus", () => {
    expect(files.length).toBeGreaterThan(100);
  });

  it("no cold module is imported inside a test body", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const src = read(file);
      const loaded = new Set(
        [...src.matchAll(STATIC)].map((m) => m[1] ?? m[2] ?? m[3]),
      );
      for (const m of src.matchAll(IN_BODY)) {
        const spec = m[1] as string;
        const bare = spec.replace(/^node:/, "");
        if (spec.includes("${")) continue; // the fence's own templates
        if (loaded.has(spec) || builtinModules.includes(bare)) continue;
        offenders.push(`${file}: await import("${spec}")`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
