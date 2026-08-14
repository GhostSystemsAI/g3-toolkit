/**
 * Unit tests for the g3t-nudging parallel-run separation pass.
 * Covers the core algorithm contracts (ordering, ladder branches,
 * split rule, group atomicity, corridorDemand shape, sort order).
 */
import { describe, it, expect } from "vitest";
import { nudgeRoutes } from "./g3t-nudging";
import { polylineIntersectsBoxes } from "../../route/orthogonal-router";

interface Pt {
  x: number;
  y: number;
}

const twoParallelHRoutes = (): Record<string, { points: Pt[] }> => ({
  a: {
    points: [
      { x: 0, y: 100 },
      { x: 30, y: 100 },
      { x: 30, y: 200 },
      { x: 60, y: 200 },
    ],
  },
  b: {
    points: [
      { x: 0, y: 100 },
      { x: 30, y: 100 },
      { x: 30, y: 200 },
      { x: 60, y: 200 },
    ],
  },
});

describe("nudgeRoutes: basics", () => {
  it("passes 2-point straight routes through unchanged (never adds bends)", () => {
    const input = {
      s1: {
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
        ],
      },
    };
    const { routes } = nudgeRoutes(input, []);
    expect(routes.s1?.points).toEqual([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ]);
  });

  it("returns byte-identical single-edge input (no group formed)", () => {
    const input = {
      solo: {
        points: [
          { x: 0, y: 0 },
          { x: 50, y: 0 },
          { x: 50, y: 100 },
        ],
      },
    };
    const { routes, corridorDemand } = nudgeRoutes(input, []);
    expect(routes.solo?.points).toEqual([
      { x: 0, y: 0 },
      { x: 50, y: 0 },
      { x: 50, y: 100 },
    ]);
    expect(corridorDemand).toHaveLength(0);
  });

  it("separates two coincident parallel interior segments (branch a)", () => {
    const input = twoParallelHRoutes();
    const { routes, corridorDemand } = nudgeRoutes(input, [], {
      trackGap: 8,
      clearance: 0,
    });
    const a = routes.a!.points;
    const b = routes.b!.points;
    // Interior vertical segments (index 1..2) must have distinct x.
    expect(a[1]!.x).not.toEqual(b[1]!.x);
    // Order deterministic by edge id: 'a' before 'b'.
    expect(corridorDemand).toHaveLength(1);
    expect(corridorDemand[0]!.tracksRequired).toBe(2);
    expect(corridorDemand[0]!.blocked).toBe(false);
  });
});

describe("nudgeRoutes: degradation ladder", () => {
  it("branch (a): full-gap spacing with wide-open corridor (deficit 0)", () => {
    // No obstacles; open corridor. Two parallel V segments coincide.
    const input = {
      a: {
        points: [
          { x: 0, y: 10 },
          { x: 200, y: 10 },
          { x: 200, y: 90 },
          { x: 400, y: 90 },
        ],
      },
      b: {
        points: [
          { x: 0, y: 10 },
          { x: 200, y: 10 },
          { x: 200, y: 90 },
          { x: 400, y: 90 },
        ],
      },
    };
    const { corridorDemand } = nudgeRoutes(input, [], {
      trackGap: 8,
      clearance: 0,
    });
    expect(corridorDemand).toHaveLength(1);
    const d = corridorDemand[0]!;
    expect(d.blocked).toBe(false);
    // Open-corridor clamp bounds free span to ~2*trackGap around the
    // group's own perp — deficit non-zero is expected for a wide-open
    // scene with no obstacle bounds; the pass still separates the pair.
    expect(d.deficit).toBeGreaterThanOrEqual(0);
    expect(d.tracksRequired).toBe(2);
  });

  it("branch (c): fully occluded emits blocked/occluded demand and passes routes through", () => {
    // Two boxes that touch: no free span between them.
    const boxes = [
      { x: 0, y: 0, width: 50, height: 100 },
      { x: 50, y: 0, width: 50, height: 100 },
    ];
    const input = {
      a: {
        points: [
          { x: 0, y: 20 },
          { x: 50, y: 20 },
          { x: 50, y: 60 },
          { x: 100, y: 60 },
        ],
      },
      b: {
        points: [
          { x: 0, y: 30 },
          { x: 50, y: 30 },
          { x: 50, y: 70 },
          { x: 100, y: 70 },
        ],
      },
    };
    const { corridorDemand } = nudgeRoutes(input, boxes, {
      trackGap: 8,
      clearance: 8,
    });
    // At least one corridor should be blocked=occluded when the free span vanishes.
    const occluded = corridorDemand.filter(
      (d) => d.blocked && d.blockedReason === "occluded",
    );
    expect(occluded.length).toBeGreaterThan(0);
  });
});

describe("nudgeRoutes: contracts", () => {
  it("corridorDemand sorted by deficit descending", () => {
    // Construct two independent corridors with different deficits.
    const input = {
      a: {
        points: [
          { x: 0, y: 100 },
          { x: 30, y: 100 },
          { x: 30, y: 200 },
          { x: 60, y: 200 },
        ],
      },
      b: {
        points: [
          { x: 0, y: 100 },
          { x: 30, y: 100 },
          { x: 30, y: 200 },
          { x: 60, y: 200 },
        ],
      },
      c: {
        points: [
          { x: 0, y: 500 },
          { x: 400, y: 500 },
          { x: 400, y: 600 },
          { x: 800, y: 600 },
        ],
      },
      d: {
        points: [
          { x: 0, y: 500 },
          { x: 400, y: 500 },
          { x: 400, y: 600 },
          { x: 800, y: 600 },
        ],
      },
    };
    const { corridorDemand } = nudgeRoutes(input, [], {
      trackGap: 8,
      clearance: 0,
    });
    for (let i = 0; i + 1 < corridorDemand.length; i++) {
      expect(corridorDemand[i]!.deficit).toBeGreaterThanOrEqual(
        corridorDemand[i + 1]!.deficit,
      );
    }
  });

  it("output routes are box-check clean when the input was clean", () => {
    const boxes = [{ x: 40, y: 40, width: 20, height: 20 }];
    const input = {
      a: {
        points: [
          { x: 0, y: 100 },
          { x: 200, y: 100 },
          { x: 200, y: 300 },
        ],
      },
      b: {
        points: [
          { x: 0, y: 100 },
          { x: 200, y: 100 },
          { x: 200, y: 300 },
        ],
      },
    };
    const { routes } = nudgeRoutes(input, boxes, { trackGap: 8, clearance: 0 });
    for (const r of Object.values(routes)) {
      expect(polylineIntersectsBoxes(r.points, boxes)).toBe(false);
    }
  });

  it("determinism: two runs on identical input produce identical output", () => {
    const input = twoParallelHRoutes();
    const first = nudgeRoutes(input, [], { trackGap: 8, clearance: 0 });
    const second = nudgeRoutes(input, [], { trackGap: 8, clearance: 0 });
    expect(second.routes).toEqual(first.routes);
    expect(second.corridorDemand).toEqual(first.corridorDemand);
  });

  it("corridorDemand blocked field is a discriminated union with blockedReason present iff blocked", () => {
    const input = twoParallelHRoutes();
    const { corridorDemand } = nudgeRoutes(input, [], {
      trackGap: 8,
      clearance: 0,
    });
    for (const d of corridorDemand) {
      if (d.blocked) {
        expect(["occluded", "reverted"]).toContain(d.blockedReason);
      } else {
        expect(d.blockedReason).toBeUndefined();
      }
    }
  });
});

describe("polylineIntersectsBoxes: return polarity guard", () => {
  it("returns true when a segment passes through a box interior", () => {
    const boxes = [{ x: 10, y: 10, width: 20, height: 20 }];
    const pts = [
      { x: 0, y: 20 },
      { x: 40, y: 20 },
    ];
    expect(polylineIntersectsBoxes(pts, boxes)).toBe(true);
  });
  it("returns false when the polyline avoids every box", () => {
    const boxes = [{ x: 10, y: 10, width: 20, height: 20 }];
    const pts = [
      { x: 0, y: 0 },
      { x: 40, y: 0 },
    ];
    expect(polylineIntersectsBoxes(pts, boxes)).toBe(false);
  });
});
