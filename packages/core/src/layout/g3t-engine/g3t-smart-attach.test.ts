/**
 * RF-B: crossing-aware smart attachment refinement.
 *
 * Two contracts under test:
 *  1. Monotone — with smartAttach on, `countCrossings` is never higher
 *     than the baseline (default) on the same input.
 *  2. Determinism — with smartAttach unset/false, the output is
 *     byte-identical to today (baseline snapshot). This is asserted by
 *     the existing snapshot / geometry test suite; here it is
 *     reasserted by a direct equality check on a fresh fixture.
 */
import { describe, expect, it } from "vitest";
import type { StructuralGraphInput } from "../structural";
import { routeStructuralEdges } from "./g3t-routing";
import { countCrossings } from "../../metrics/layout-metrics";

// Two horizontal boxes on the left column feed two on the right in a
// deliberately crossed order (top-source connects to bottom-target and
// vice versa). The default fan sorts by the OTHER end's coord and lands
// with a crossing; smart-attach's within-side reorder can swap the
// source-side offsets to remove it.
function crossingFixture(): {
  input: StructuralGraphInput;
  geometry: {
    nodes: Record<
      string,
      { x: number; y: number; width: number; height: number; kind: "node" }
    >;
    ports: Record<string, never>;
    edges: Record<string, never>;
  };
} {
  const input: StructuralGraphInput = {
    nodes: [
      { id: "s1", width: 80, height: 40 },
      { id: "s2", width: 80, height: 40 },
      { id: "t1", width: 80, height: 40 },
      { id: "t2", width: 80, height: 40 },
    ],
    edges: [
      { id: "a", source: "s1", target: "t2" },
      { id: "b", source: "s2", target: "t1" },
    ],
  };
  const geometry = {
    nodes: {
      s1: { x: 0, y: 0, width: 80, height: 40, kind: "node" as const },
      s2: { x: 0, y: 80, width: 80, height: 40, kind: "node" as const },
      t1: { x: 260, y: 0, width: 80, height: 40, kind: "node" as const },
      t2: { x: 260, y: 80, width: 80, height: 40, kind: "node" as const },
    },
    ports: {} as Record<string, never>,
    edges: {} as Record<string, never>,
  };
  return { input, geometry };
}

describe("RF-B smart attachment (refinement)", () => {
  it("monotone: crossings never increase with smartAttach on", () => {
    const { input, geometry } = crossingFixture();
    const base = routeStructuralEdges(input, geometry as never, {
      direction: "RIGHT",
    });
    const smart = routeStructuralEdges(input, geometry as never, {
      direction: "RIGHT",
      smartAttach: true,
    });
    const baseCross = countCrossings(
      Object.entries(base).map(([id, r]) => ({ id, points: r.points })),
    );
    const smartCross = countCrossings(
      Object.entries(smart).map(([id, r]) => ({ id, points: r.points })),
    );
    expect(smartCross).toBeLessThanOrEqual(baseCross);
  });

  it("determinism: smartAttach unset is byte-identical to before", () => {
    const { input, geometry } = crossingFixture();
    const a = routeStructuralEdges(input, geometry as never, {
      direction: "RIGHT",
    });
    const b = routeStructuralEdges(input, geometry as never, {
      direction: "RIGHT",
      smartAttach: false,
    });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});
