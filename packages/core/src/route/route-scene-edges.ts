/**
 * Post-layout obstacle-aware edge routing for non-structural scenes.
 *
 * Pure geometry: given node boxes and edge endpoint pairs, produce per-edge
 * routed polylines via `routeOrthogonal`. Each edge is routed against the
 * scene's boxes MINUS the endpoint nodes' own boxes; the router's built-in
 * pruning (>64 obstacles) covers dense scenes.
 *
 * The `RouteTerminal.point` is placed at each endpoint's bounding box CENTER
 * (not on the border) and the `RouteTerminal.side` is inferred from the
 * relative position of source and target. The first/last route segments are
 * therefore perpendicular to the inferred cardinal side.
 *
 * Self-loops are excluded from routing entirely (returned as `null` result);
 * callers pass them through unchanged.
 */

import {
  routeOrthogonal,
  polylineIntersectsBoxes,
  type RouteBox,
  type RouteSide,
} from "./orthogonal-router";

export interface SceneNodeBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SceneEdgeEndpoints {
  id: string;
  source: string;
  target: string;
}

export interface RouteSceneOptions {
  /** Router clearance around obstacle borders. Default 12. */
  clearance?: number;
  /** A* cost per bend; higher = straighter. Default 30. */
  bendPenalty?: number;
  /** Minimum length of first/last route segment. Default 28. */
  minStub?: number;
  /**
   * Routing mode. Default "direct-unless-crossing".
   * - "direct-unless-crossing": route orthogonally only when the straight
   *   segment between box centers crosses another node's box; otherwise
   *   leave the edge unrouted (bezier).
   * - "always": route every edge orthogonally regardless of obstacles.
   */
  mode?: "direct-unless-crossing" | "always";
}

export interface SceneRoutedEdge {
  id: string;
  points: { x: number; y: number }[];
}

/** Result of the routing pass: per-edge polylines (only for edges that
 *  routed successfully). Edges with a missing endpoint, self-loops, or a
 *  null router result are OMITTED; callers should clear any stale routing
 *  data from those edges. */
export interface RouteSceneResult {
  routed: Map<string, { x: number; y: number }[]>;
}

/** Decide the exit/entry sides from the relative position of source and
 *  target BOX CENTERS. Horizontal-dominant (|dx| >= |dy|, tie included):
 *  east/west. Vertical-dominant (|dy| > |dx|): south/north. Zero-vector:
 *  source EAST, target WEST (exposed for tests; callers exclude self-loops
 *  before reaching this). */
export function inferTerminalSides(
  sourceCenter: { x: number; y: number },
  targetCenter: { x: number; y: number },
): { sourceSide: RouteSide; targetSide: RouteSide } {
  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0
      ? { sourceSide: "EAST", targetSide: "WEST" }
      : { sourceSide: "WEST", targetSide: "EAST" };
  }
  return dy > 0
    ? { sourceSide: "SOUTH", targetSide: "NORTH" }
    : { sourceSide: "NORTH", targetSide: "SOUTH" };
}

function boxCenter(b: SceneNodeBox): { x: number; y: number } {
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
}

/** Route every edge in the scene around every other node. Self-loops and
 *  edges with unresolved endpoints are omitted from the returned map. */
export function routeSceneEdges(
  nodes: readonly SceneNodeBox[],
  edges: readonly SceneEdgeEndpoints[],
  opts: RouteSceneOptions = {},
): RouteSceneResult {
  const byId = new Map<string, SceneNodeBox>();
  for (const n of nodes) byId.set(n.id, n);
  const routed = new Map<string, { x: number; y: number }[]>();

  const mode = opts.mode ?? "direct-unless-crossing";

  for (const e of edges) {
    if (e.source === e.target) continue; // self-loops passed through
    const s = byId.get(e.source);
    const t = byId.get(e.target);
    if (!s || !t) continue;
    const sc = boxCenter(s);
    const tc = boxCenter(t);
    const { sourceSide, targetSide } = inferTerminalSides(sc, tc);
    const obstacles: RouteBox[] = [];
    for (const n of nodes) {
      if (n.id === s.id || n.id === t.id) continue;
      obstacles.push({ x: n.x, y: n.y, width: n.width, height: n.height });
    }
    // direct-unless-crossing: skip routing when the straight segment
    // between box centers does not pass through any obstacle box. The
    // edge stays unrouted (bezier). Only fall through to routeOrthogonal
    // when the direct shot is blocked OR the mode is "always".
    if (
      mode === "direct-unless-crossing" &&
      !polylineIntersectsBoxes([sc, tc], obstacles)
    ) {
      continue;
    }
    const res = routeOrthogonal({
      source: { point: sc, side: sourceSide },
      target: { point: tc, side: targetSide },
      obstacles,
      clearance: opts.clearance,
      bendPenalty: opts.bendPenalty,
      minStub: opts.minStub,
    });
    if (res && res.points.length >= 2) {
      routed.set(e.id, res.points);
    }
  }

  return { routed };
}

/** Convert a routed polyline into cytoscape `segment-distances` /
 *  `segment-weights` per its `curve-style: segments` contract. Terminal
 *  points (index 0 and last) are dropped; only interior bend points map
 *  onto segment-distances (perpendicular offset from the source-target
 *  line) and segment-weights (parametric position along that line).
 *
 *  Returns `null` when the polyline is straight (no interior bends): the
 *  caller should not stamp the routed class on such edges.
 */
export function polylineToCytoscapeSegments(
  points: readonly { x: number; y: number }[],
): { distances: number[]; weights: number[] } | null {
  if (points.length < 3) return null;
  const src = points[0];
  const tgt = points[points.length - 1];
  if (!src || !tgt) return null;
  const dx = tgt.x - src.x;
  const dy = tgt.y - src.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-6) return null; // degenerate
  const len = Math.sqrt(lenSq);
  const distances: number[] = [];
  const weights: number[] = [];
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i];
    if (!p) continue;
    const px = p.x - src.x;
    const py = p.y - src.y;
    // Weight: parametric projection onto source->target vector.
    const w = (px * dx + py * dy) / lenSq;
    // Distance: perpendicular offset along cytoscape's vectorNormInverse.
    // Cytoscape renders segpt = midpt + vectorNormInverse * d, with
    // vectorNormInverse = (-dy/l, dx/l) (edge-control-points.mjs). Solving
    // segpt == p for d gives (py*dx - px*dy)/len. The prior (px*dy - py*dx)
    // negated this, mirroring every bend across the source->target chord
    // (~2*offset error) and throwing detours back through the node they
    // routed around. routeToSegments (structural path) uses this sign.
    const d = (py * dx - px * dy) / len;
    weights.push(w);
    distances.push(d);
  }
  if (distances.length === 0) return null;
  return { distances, weights };
}
