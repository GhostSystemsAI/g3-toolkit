import { describe, expect, it } from "vitest";
import {
  inferTerminalSides,
  polylineToCytoscapeSegments,
  routeSceneEdges,
  type SceneEdgeEndpoints,
  type SceneNodeBox,
} from "./route-scene-edges";

const EPS = 1e-6;

function segsClearBox(
  pts: readonly { x: number; y: number }[],
  box: { x: number; y: number; width: number; height: number },
): boolean {
  const x1 = box.x;
  const x2 = box.x + box.width;
  const y1 = box.y;
  const y2 = box.y + box.height;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!;
    const b = pts[i]!;
    const sx1 = Math.min(a.x, b.x);
    const sx2 = Math.max(a.x, b.x);
    const sy1 = Math.min(a.y, b.y);
    const sy2 = Math.max(a.y, b.y);
    const overlapX = sx1 < x2 - EPS && sx2 > x1 + EPS;
    const overlapY = sy1 < y2 - EPS && sy2 > y1 + EPS;
    if (overlapX && overlapY) return false;
  }
  return true;
}

describe("inferTerminalSides", () => {
  it("horizontal dominant: source left of target -> EAST/WEST", () => {
    expect(inferTerminalSides({ x: 0, y: 0 }, { x: 100, y: 10 })).toEqual({
      sourceSide: "EAST",
      targetSide: "WEST",
    });
  });
  it("horizontal dominant: source right of target -> WEST/EAST", () => {
    expect(inferTerminalSides({ x: 100, y: 0 }, { x: 0, y: 10 })).toEqual({
      sourceSide: "WEST",
      targetSide: "EAST",
    });
  });
  it("vertical dominant: source above -> SOUTH/NORTH", () => {
    expect(inferTerminalSides({ x: 0, y: 0 }, { x: 10, y: 100 })).toEqual({
      sourceSide: "SOUTH",
      targetSide: "NORTH",
    });
  });
  it("vertical dominant: source below -> NORTH/SOUTH", () => {
    expect(inferTerminalSides({ x: 0, y: 100 }, { x: 10, y: 0 })).toEqual({
      sourceSide: "NORTH",
      targetSide: "SOUTH",
    });
  });
  it("near-diagonal tie (|dx|==|dy|) resolves to horizontal-dominant", () => {
    expect(inferTerminalSides({ x: 0, y: 0 }, { x: 50, y: 50 })).toEqual({
      sourceSide: "EAST",
      targetSide: "WEST",
    });
  });
  it("zero vector: source EAST, target WEST", () => {
    expect(inferTerminalSides({ x: 5, y: 5 }, { x: 5, y: 5 })).toEqual({
      sourceSide: "EAST",
      targetSide: "WEST",
    });
  });
});

describe("routeSceneEdges", () => {
  it("routes clear of an intervening obstacle", () => {
    const nodes: SceneNodeBox[] = [
      { id: "a", x: 0, y: 40, width: 40, height: 40 },
      { id: "obst", x: 100, y: 0, width: 60, height: 200 },
      { id: "b", x: 240, y: 40, width: 40, height: 40 },
    ];
    const edges: SceneEdgeEndpoints[] = [
      { id: "e1", source: "a", target: "b" },
    ];
    const { routed } = routeSceneEdges(nodes, edges);
    const pts = routed.get("e1");
    expect(pts).toBeDefined();
    if (!pts) return;
    expect(segsClearBox(pts, nodes[1]!)).toBe(true);
  });

  it("first/last segment is perpendicular to the inferred side (horizontal case)", () => {
    const nodes: SceneNodeBox[] = [
      { id: "a", x: 0, y: 0, width: 40, height: 40 },
      { id: "obst", x: 100, y: -20, width: 40, height: 80 },
      { id: "b", x: 200, y: 0, width: 40, height: 40 },
    ];
    const { routed } = routeSceneEdges(nodes, [
      { id: "e1", source: "a", target: "b" },
    ]);
    const pts = routed.get("e1")!;
    // source EAST exit: first segment horizontal
    expect(Math.abs(pts[0]!.y - pts[1]!.y)).toBeLessThan(EPS);
    expect(pts[1]!.x).toBeGreaterThan(pts[0]!.x);
    // target WEST entry: last segment horizontal, approaching from west
    const n = pts.length;
    expect(Math.abs(pts[n - 1]!.y - pts[n - 2]!.y)).toBeLessThan(EPS);
    expect(pts[n - 1]!.x).toBeGreaterThan(pts[n - 2]!.x);
  });

  it("vertical arrangement: first/last segment is vertical", () => {
    const nodes: SceneNodeBox[] = [
      { id: "a", x: 0, y: 0, width: 40, height: 40 },
      { id: "obst", x: -20, y: 100, width: 80, height: 40 },
      { id: "b", x: 0, y: 240, width: 40, height: 40 },
    ];
    const { routed } = routeSceneEdges(nodes, [
      { id: "e1", source: "a", target: "b" },
    ]);
    const pts = routed.get("e1")!;
    // source SOUTH exit: first segment vertical
    expect(Math.abs(pts[0]!.x - pts[1]!.x)).toBeLessThan(EPS);
    expect(pts[1]!.y).toBeGreaterThan(pts[0]!.y);
  });

  it("self-loop edges are omitted (pass-through)", () => {
    const nodes: SceneNodeBox[] = [
      { id: "a", x: 0, y: 0, width: 40, height: 40 },
    ];
    const { routed } = routeSceneEdges(nodes, [
      { id: "loop", source: "a", target: "a" },
    ]);
    expect(routed.has("loop")).toBe(false);
  });

  it("edges with missing endpoints are omitted", () => {
    const nodes: SceneNodeBox[] = [
      { id: "a", x: 0, y: 0, width: 40, height: 40 },
    ];
    const { routed } = routeSceneEdges(nodes, [
      { id: "dangling", source: "a", target: "nonexistent" },
    ]);
    expect(routed.has("dangling")).toBe(false);
  });

  it("handles dense scenes above the router's 64-obstacle pruning threshold", () => {
    const nodes: SceneNodeBox[] = [
      { id: "a", x: 0, y: 500, width: 40, height: 40 },
      { id: "b", x: 2000, y: 500, width: 40, height: 40 },
    ];
    // 80 filler boxes forming a grid AWAY from the direct route
    // (y ranges 0..200, well above the source/target y=500), so pruning
    // can safely drop them and the route succeeds around empty space.
    for (let i = 0; i < 80; i++) {
      const col = i % 10;
      const row = Math.floor(i / 10);
      nodes.push({
        id: `f${i}`,
        x: 200 + col * 60,
        y: row * 30,
        width: 40,
        height: 20,
      });
    }
    const { routed } = routeSceneEdges(nodes, [
      { id: "e1", source: "a", target: "b" },
    ]);
    expect(routed.has("e1")).toBe(true);
  });
});

describe("polylineToCytoscapeSegments", () => {
  it("returns null for a straight polyline", () => {
    expect(
      polylineToCytoscapeSegments([
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ]),
    ).toBeNull();
  });

  it("returns null when interior points are all collinear with endpoints", () => {
    expect(
      polylineToCytoscapeSegments([
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 100, y: 0 },
      ]),
    ).toEqual({ distances: [0], weights: [0.5] });
  });

  it("maps a right-angle detour to non-zero distance", () => {
    const seg = polylineToCytoscapeSegments([
      { x: 0, y: 0 },
      { x: 50, y: -30 },
      { x: 100, y: 0 },
    ]);
    expect(seg).not.toBeNull();
    if (!seg) return;
    expect(seg.weights).toHaveLength(1);
    expect(seg.distances).toHaveLength(1);
    expect(Math.abs(seg.weights[0]! - 0.5)).toBeLessThan(EPS);
    // In a Y-down coordinate frame with source->target along +x, a
    // point above the line (smaller y) sits on the geometric "left" of
    // the direction, which is cytoscape's positive segment-distance.
    expect(seg.distances[0]).toBeGreaterThan(0);
  });
});
