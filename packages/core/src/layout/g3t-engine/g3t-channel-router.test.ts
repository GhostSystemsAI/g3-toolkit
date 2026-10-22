/**
 * PRF-003 brief 05a: channel-router unit oracles (owner Jake,
 * 2026-08-14). Additive slice; the module ships behind the OFF-BY-
 * DEFAULT `useChannelRouter` flag on `routeStructuralEdges`, and 05b
 * flips the flag and re-pins the six-scenario LAY005_BASELINE.
 */
import { describe, expect, it } from "vitest";
import {
  assignTracks,
  emitChannelRoute,
  type ChannelEdge,
  type ChannelPlan,
} from "./g3t-channel-router";
import { dedupeCollinear } from "./g3t-polyline-utils";
import { routeStructuralEdges } from "./g3t-routing";
import type { StructuralGraphInput } from "../structural";
import { g3tLayoutStructural } from "./g3t-structural";

function plan(overrides?: Partial<ChannelPlan>): ChannelPlan {
  return {
    direction: "RIGHT",
    layerOf: new Map<string, number>([
      ["a", 0],
      ["b", 0],
      ["c", 1],
      ["d", 1],
      ["e", 2],
    ]),
    channels: [
      { boundary: 0, axis: "v", midline: 100, demand: 4, trackGap: 8 },
      { boundary: 1, axis: "v", midline: 300, demand: 2, trackGap: 8 },
    ],
    ...overrides,
  };
}

describe("assignTracks (PRF-003 05a)", () => {
  it("orders edges by (entry, exit, id) — rainbow uncrossing", () => {
    const edges: ChannelEdge[] = [
      { id: "e2", source: "a", target: "c", entryCross: 20, exitCross: 40 },
      { id: "e1", source: "b", target: "c", entryCross: 10, exitCross: 50 },
      { id: "e3", source: "a", target: "d", entryCross: 30, exitCross: 30 },
    ];
    const { tracks, overflow } = assignTracks(edges, plan());
    expect(overflow.size).toBe(0);
    const b0 = tracks.get(0);
    expect(b0).toBeDefined();
    // Ordered by entryCross ascending: e1(10), e2(20), e3(30).
    expect(b0?.get("e1")).toBe(0);
    expect(b0?.get("e2")).toBe(1);
    expect(b0?.get("e3")).toBe(2);
  });

  it("ties on entry resolve by exit, ties on both by edge id", () => {
    const edges: ChannelEdge[] = [
      { id: "z", source: "a", target: "c", entryCross: 10, exitCross: 10 },
      { id: "a", source: "a", target: "c", entryCross: 10, exitCross: 10 },
      { id: "m", source: "a", target: "c", entryCross: 10, exitCross: 20 },
    ];
    const { tracks } = assignTracks(edges, plan());
    const b0 = tracks.get(0);
    // entry equal for all; exit: 10,10,20 => (a,z) first by id, then m.
    expect(b0?.get("a")).toBe(0);
    expect(b0?.get("z")).toBe(1);
    expect(b0?.get("m")).toBe(2);
  });

  it("fully-tied entry+exit still yields DISTINCT integer tracks", () => {
    const edges: ChannelEdge[] = [
      { id: "e1", source: "a", target: "c", entryCross: 0, exitCross: 0 },
      { id: "e2", source: "a", target: "c", entryCross: 0, exitCross: 0 },
      { id: "e3", source: "a", target: "c", entryCross: 0, exitCross: 0 },
    ];
    const { tracks } = assignTracks(edges, plan());
    const b0 = tracks.get(0);
    const assigned = ["e1", "e2", "e3"].map((id) => b0?.get(id));
    // All defined, and pairwise distinct — no coincidentRuns violation.
    expect(new Set(assigned).size).toBe(3);
    expect(assigned.every((t) => typeof t === "number")).toBe(true);
  });

  it("N > demand overflows the tail, track count stays <= demand", () => {
    // demand=2 on boundary 1; four edges compete for two tracks.
    const p = plan();
    const edges: ChannelEdge[] = Array.from({ length: 4 }, (_, i) => ({
      id: `e${i}`,
      source: "c",
      target: "e",
      entryCross: i * 10,
      exitCross: i * 10,
    }));
    const { tracks, overflow } = assignTracks(edges, p);
    const b1 = tracks.get(1);
    expect(b1?.size).toBe(2);
    expect(overflow.size).toBe(2);
    // Track count bound oracle: assigned indices in [0, demand).
    for (const t of b1?.values() ?? []) {
      expect(t).toBeGreaterThanOrEqual(0);
      expect(t).toBeLessThan(2);
    }
    // Two smallest-entry edges win; the tail overflows.
    expect(b1?.has("e0")).toBe(true);
    expect(b1?.has("e1")).toBe(true);
    expect(overflow.has("e2")).toBe(true);
    expect(overflow.has("e3")).toBe(true);
  });

  it("single-node-to-many-channel fan spreads across boundaries", () => {
    // Edge a->e spans two boundaries; edge a->c spans one.
    const edges: ChannelEdge[] = [
      { id: "long", source: "a", target: "e", entryCross: 0, exitCross: 0 },
      { id: "short", source: "a", target: "c", entryCross: 5, exitCross: 5 },
    ];
    const { tracks } = assignTracks(edges, plan());
    // long traverses boundaries 0 and 1; short only 0.
    expect(tracks.get(0)?.has("long")).toBe(true);
    expect(tracks.get(0)?.has("short")).toBe(true);
    expect(tracks.get(1)?.has("long")).toBe(true);
    expect(tracks.get(1)?.has("short")).toBe(false);
  });

  it("track count NEVER exceeds demand (invariant oracle)", () => {
    const p = plan({
      channels: [
        { boundary: 0, axis: "v", midline: 100, demand: 3, trackGap: 8 },
        { boundary: 1, axis: "v", midline: 300, demand: 1, trackGap: 8 },
      ],
    });
    const edges: ChannelEdge[] = Array.from({ length: 10 }, (_, i) => ({
      id: `e${i}`,
      source: "a",
      target: "e",
      entryCross: i,
      exitCross: i,
    }));
    const { tracks } = assignTracks(edges, p);
    for (const c of p.channels) {
      const size = tracks.get(c.boundary)?.size ?? 0;
      expect(size).toBeLessThanOrEqual(c.demand);
    }
  });
});

describe("emitChannelRoute (PRF-003 05a)", () => {
  it("track separation is expressed as GENUINE ORTHOGONAL BENDS, not collinear markers", () => {
    // Two edges sharing a channel get track 0 and track 1; the
    // track-1 route must bend at a non-zero offset from the midline so
    // dedupeCollinear does NOT collapse the separation.
    const p = plan({
      channels: [
        { boundary: 0, axis: "v", midline: 100, demand: 4, trackGap: 8 },
      ],
      layerOf: new Map<string, number>([
        ["a", 0],
        ["c", 1],
      ]),
    });
    const edges: ChannelEdge[] = [
      { id: "e1", source: "a", target: "c", entryCross: 0, exitCross: 0 },
      { id: "e2", source: "a", target: "c", entryCross: 10, exitCross: 10 },
    ];
    const asg = assignTracks(edges, p);
    const anchors = {
      source: {
        point: { x: 50, y: 20 },
        side: "EAST" as const,
      },
      sourceTip: { x: 64, y: 20 },
      target: {
        point: { x: 150, y: 60 },
        side: "WEST" as const,
      },
      targetTip: { x: 136, y: 60 },
    };
    const r1 = emitChannelRoute(edges[0]!, anchors, p, asg);
    const r2 = emitChannelRoute(edges[1]!, anchors, p, asg);
    // Track 0 (offset 0) jogs on the midline, x = 100.
    expect(r1.some((pt) => pt.x === 100)).toBe(true);
    // Track 1 (offset +8): the polyline MUST bend at x = midline + 8 =
    // 108 (midline is the gap centre on the FLOW axis, heal 2144aa96;
    // this oracle used to pin y = 108, the cross-axis bus reading).
    // dedupeCollinear preserves it.
    const xs = new Set(r2.map((pt) => pt.x));
    expect(xs.has(108)).toBe(true);
    expect(xs.has(100)).toBe(false);
    // The bend is real: two right-angle turns around the jog.
    expect(r2).toEqual([
      { x: 50, y: 20 },
      { x: 108, y: 20 },
      { x: 108, y: 60 },
      { x: 150, y: 60 },
    ]);
  });

  it("dedupeCollinear round-trip: collinear intermediates collapse, real bends survive", () => {
    // Collinear input: three points on a line -> middle removed.
    const collinear = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 20, y: 0 },
    ];
    const collapsed = dedupeCollinear(collinear);
    expect(collapsed).toEqual([
      { x: 0, y: 0 },
      { x: 20, y: 0 },
    ]);
    // Real orthogonal bend: (0,0)->(10,0)->(10,20) stays 3 points.
    const bent = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 20 },
    ];
    expect(dedupeCollinear(bent)).toEqual(bent);
  });
});

describe("useChannelRouter flag off (byte-identical guarantee)", () => {
  it("routeStructuralEdges output is unchanged when the flag is absent", () => {
    // A small hand-authored structural scene to establish a shipped-
    // path baseline; 05a's flag must not perturb it when off.
    const input: StructuralGraphInput = {
      nodes: [
        { id: "n1", width: 80, height: 40 },
        { id: "n2", width: 80, height: 40 },
        { id: "n3", width: 80, height: 40 },
      ],
      edges: [
        { id: "e1", source: "n1", target: "n2" },
        { id: "e2", source: "n2", target: "n3" },
      ],
    };
    const geometry = g3tLayoutStructural(input, { routeEdges: false });
    const baseline = routeStructuralEdges(input, geometry, {});
    const withFlagButNoPlan = routeStructuralEdges(input, geometry, {
      useChannelRouter: true,
      // Deliberately no channelPlan: flag has no effect.
    });
    expect(withFlagButNoPlan).toEqual(baseline);
    const withFlagFalse = routeStructuralEdges(input, geometry, {
      useChannelRouter: false,
    });
    expect(withFlagFalse).toEqual(baseline);
  });
});

/** Segments of a polyline whose CROSS coordinate changes (the jogs):
 *  vertical segments for horizontal flow. */
function jogs(pts: readonly { x: number; y: number }[]): {
  at: number;
  from: number;
  to: number;
}[] {
  const out: { at: number; from: number; to: number }[] = [];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!;
    const b = pts[i]!;
    if (a.x === b.x && a.y !== b.y) out.push({ at: a.x, from: a.y, to: b.y });
  }
  return out;
}

describe("emitChannelRoute per-gap tracks (heal 2144aa96)", () => {
  // Channel midline is the gap centre on the FLOW axis (x for RIGHT);
  // tracks offset along the flow axis; the cross-axis jog lives inside
  // the channel. The defect read midline as a cross coordinate and ran
  // the first channel to targetTip.x, so a multi-boundary edge became
  // one horizontal bus at y=midline and every later boundary jogged at
  // the target column.
  const anchors = {
    source: { point: { x: 50, y: 20 }, side: "EAST" as const },
    sourceTip: { x: 64, y: 20 },
    target: { point: { x: 350, y: 80 }, side: "WEST" as const },
    targetTip: { x: 336, y: 80 },
  };

  it("a two-boundary edge jogs once inside EACH gap, never at the target column", () => {
    const p = plan();
    const edge: ChannelEdge = {
      id: "long",
      source: "a",
      target: "e",
      entryCross: 20,
      exitCross: 80,
      layerCross: [50],
    };
    const asg = assignTracks([edge], p);
    const r = emitChannelRoute(edge, anchors, p, asg);
    expect(r).toEqual([
      { x: 50, y: 20 },
      { x: 100, y: 20 },
      { x: 100, y: 50 },
      { x: 300, y: 50 },
      { x: 300, y: 80 },
      { x: 350, y: 80 },
    ]);
    // No point sits at a channel midline used as a CROSS coordinate.
    expect(r.some((pt) => pt.y === 100 || pt.y === 300)).toBe(false);
  });

  it("without layer hints the edge holds its source cross and jogs in the last gap", () => {
    const p = plan();
    const edge: ChannelEdge = { id: "long", source: "a", target: "e" };
    const r = emitChannelRoute(edge, anchors, p, assignTracks([edge], p));
    expect(jogs(r)).toEqual([{ at: 300, from: 20, to: 80 }]);
  });

  it("tracks separate jogs along the FLOW axis inside a shared gap", () => {
    const p = plan({
      channels: [
        { boundary: 0, axis: "v", midline: 100, demand: 4, trackGap: 8 },
      ],
      layerOf: new Map<string, number>([
        ["a", 0],
        ["c", 1],
      ]),
    });
    const edges: ChannelEdge[] = [
      { id: "e1", source: "a", target: "c", entryCross: 0, exitCross: 0 },
      { id: "e2", source: "a", target: "c", entryCross: 10, exitCross: 10 },
    ];
    const asg = assignTracks(edges, p);
    const a = {
      ...anchors,
      target: { point: { x: 150, y: 60 }, side: "WEST" as const },
      targetTip: { x: 136, y: 60 },
    };
    expect(jogs(emitChannelRoute(edges[0]!, a, p, asg))).toEqual([
      { at: 100, from: 20, to: 60 },
    ]);
    expect(jogs(emitChannelRoute(edges[1]!, a, p, asg))).toEqual([
      { at: 108, from: 20, to: 60 },
    ]);
  });

  it("real artifact: channel routes through routeStructuralEdges keep every jog in a gap", () => {
    const input: StructuralGraphInput = {
      nodes: [
        { id: "n1", width: 80, height: 40 },
        { id: "n2", width: 80, height: 40 },
        { id: "n3", width: 80, height: 40 },
        { id: "n4", width: 80, height: 40 },
      ],
      edges: [
        { id: "e12", source: "n1", target: "n2" },
        { id: "e23", source: "n2", target: "n3" },
        { id: "e14", source: "n1", target: "n4" },
        { id: "e13", source: "n1", target: "n3" },
      ],
    };
    const geometry = g3tLayoutStructural(input);
    // LAY-005 dummy-chain hints for the long edge, as the layout hands
    // them to the router.
    const bendHints = new Map(
      Object.entries(geometry.edges ?? {})
        .filter(([, g]) => g.intermediate !== undefined)
        .map(([id, g]) => [id, g.intermediate!]),
    );
    expect(bendHints.has("e13")).toBe(true);
    // Derive the plan from the laid-out boxes: layers are x-columns,
    // each channel's midline is its gap centre on x.
    const boxes = input.nodes.map((n) => ({
      id: n.id,
      ...geometry.nodes[n.id]!,
    }));
    const columns = [...new Set(boxes.map((b) => b.x))].sort((u, v) => u - v);
    const layerOf = new Map(boxes.map((b) => [b.id, columns.indexOf(b.x)]));
    expect(layerOf.get("n3")).toBe(2);
    const right = (i: number): number =>
      Math.max(
        ...boxes
          .filter((b) => layerOf.get(b.id) === i)
          .map((b) => b.x + b.width),
      );
    const left = (i: number): number =>
      Math.min(...boxes.filter((b) => layerOf.get(b.id) === i).map((b) => b.x));
    const channels = columns.slice(1).map((_, b) => ({
      boundary: b,
      axis: "v" as const,
      midline: (right(b) + left(b + 1)) / 2,
      demand: 4,
      trackGap: 8,
    }));
    const routed = routeStructuralEdges(input, geometry, {
      useChannelRouter: true,
      channelPlan: { direction: "RIGHT", layerOf, channels },
      bendHints,
    });
    const long = routed["e13"]!.points;
    for (const j of jogs(long)) {
      const inGap = channels.some(
        (c) => j.at > right(c.boundary) && j.at < left(c.boundary + 1),
      );
      expect(inGap, `jog at x=${j.at} outside every gap`).toBe(true);
    }
    // Every jog of every channel-routed edge sits on a track: its
    // channel's midline plus a whole number of trackGaps. The bus
    // reading jogged at the source and target tip columns instead.
    for (const id of ["e12", "e23", "e14", "e13"]) {
      for (const j of jogs(routed[id]!.points)) {
        const onTrack = channels.some((c) =>
          Number.isInteger((j.at - c.midline) / c.trackGap),
        );
        expect(onTrack, `${id} jog at x=${j.at} is on no track`).toBe(true);
      }
    }
    // Per-gap tracks: the long edge jogs exactly once in EACH gap it
    // spans (the hint moves its cross at the middle layer), not twice
    // at the source and target tip columns.
    const gapOf = (x: number): number =>
      channels.findIndex(
        (c) => x > right(c.boundary) && x < left(c.boundary + 1),
      );
    expect(jogs(long).map((j) => gapOf(j.at))).toEqual([0, 1]);
  });
});
