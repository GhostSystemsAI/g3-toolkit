import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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
