import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Fence for heal b4a780b8: a wall-clock ceiling on a ~45 ms Cytoscape init
// read 3.7 s on a saturated host because wall time counts the time the
// worker sat descheduled. The benchmark measures process CPU time instead.
// (The optimizer's budget test is fenced by its own injected clock.)
const root = resolve(__dirname, "../..");
const read = (p: string) => readFileSync(resolve(root, p), "utf8");

describe("perf ceilings do not measure host load", () => {
  it("the 500-node canvas benchmark times CPU, not wall clock", () => {
    const src = read("packages/react/src/views/canvas/canvas.test.ts");
    const bench = src.slice(src.indexOf("CytoscapeCanvas benchmark"));
    expect(bench).toContain("const start = process.cpuUsage();");
    expect(bench).toContain("process.cpuUsage(start)");
    expect(bench).not.toContain("performance.now()");
  });
});
