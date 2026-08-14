/**
 * Route-quality oracle for the Routing Lab: pure functions that grade a
 * laid-out scene's routed polylines. This is demo-local scoring built on
 * the core's exported `polylineIntersectsBoxes` collision predicate; the
 * crossing/bend counters mirror the core metrics definitions (proper
 * pairwise crossings, interior direction changes) without widening the
 * public API for a demo surface.
 */
import { isChainEdgeId, polylineIntersectsBoxes } from "@g3t/core";
import type {
  RouteBox,
  StructuralGeometry,
  StructuralGraphInput,
} from "@g3t/core";

export interface RouteQuality {
  /** Edges the geometry carries a routed polyline for. */
  routed: number;
  /** Input edges with no routed polyline (renderer falls back). */
  unrouted: number;
  /** Proper pairwise segment crossings between DIFFERENT edges. */
  crossings: number;
  /** Interior direction changes summed over all routed edges. */
  bends: number;
  /** Sum of routed polyline lengths, px. */
  totalLength: number;
  /** Segments that are not axis-parallel (orthogonality violations). */
  diagonalSegments: number;
  /** Edges whose route passes through a box it neither starts nor ends at. */
  violations: number;
  violatingEdges: string[];
}

interface Pt {
  x: number;
  y: number;
}

function orient(a: Pt, b: Pt, c: Pt): number {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

/** Proper crossing: interiors intersect; touching endpoints do not count. */
function segmentsCrossProper(a1: Pt, a2: Pt, b1: Pt, b2: Pt): boolean {
  const d1 = orient(b1, b2, a1);
  const d2 = orient(b1, b2, a2);
  const d3 = orient(a1, a2, b1);
  const d4 = orient(a1, a2, b2);
  return d1 * d2 < 0 && d3 * d4 < 0;
}

function polylineLength(pts: readonly Pt[]): number {
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    if (a && b) len += Math.hypot(b.x - a.x, b.y - a.y);
  }
  return len;
}

function countBends(pts: readonly Pt[]): number {
  let bends = 0;
  for (let i = 1; i + 1 < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const c = pts[i + 1];
    if (!a || !b || !c) continue;
    if (Math.abs(orient(a, b, c)) > 1e-6) bends++;
  }
  return bends;
}

function countDiagonals(pts: readonly Pt[]): number {
  let n = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    if (!a || !b) continue;
    const dx = Math.abs(b.x - a.x);
    const dy = Math.abs(b.y - a.y);
    if (dx > 0.5 && dy > 0.5) n++;
  }
  return n;
}

/** Grade the routed polylines of a laid-out scene. */
export function gradeRoutes(
  input: StructuralGraphInput,
  geometry: StructuralGeometry,
): RouteQuality {
  const routes = geometry.edges ?? {};
  // Obstacles are the TOP-LEVEL boxes (containers and plain nodes);
  // interior rows and ports are detail inside them.
  const topBoxes = new Map<string, RouteBox>();
  for (const [id, g] of Object.entries(geometry.nodes)) {
    if (g.kind === "row") continue;
    topBoxes.set(id, { x: g.x, y: g.y, width: g.width, height: g.height });
  }
  const endpointsByEdge = new Map<string, { source: string; target: string }>();
  for (const e of input.edges) {
    endpointsByEdge.set(e.id, { source: e.source, target: e.target });
  }

  let routed = 0;
  let bends = 0;
  let totalLength = 0;
  let diagonalSegments = 0;
  const violatingEdges: string[] = [];
  const routedPolylines: { id: string; ends: string[]; pts: Pt[] }[] = [];

  for (const e of input.edges) {
    const route = routes[e.id];
    if (isChainEdgeId(e.id) || !route || route.points.length < 2) continue;
    routed++;
    const pts = route.points;
    bends += countBends(pts);
    totalLength += polylineLength(pts);
    diagonalSegments += countDiagonals(pts);
    routedPolylines.push({ id: e.id, ends: [e.source, e.target], pts });
    const obstacles: RouteBox[] = [];
    for (const [id, box] of topBoxes) {
      if (id === e.source || id === e.target) continue;
      obstacles.push(box);
    }
    if (polylineIntersectsBoxes(pts, obstacles)) violatingEdges.push(e.id);
  }

  let crossings = 0;
  for (let i = 0; i < routedPolylines.length; i++) {
    for (let j = i + 1; j < routedPolylines.length; j++) {
      const a = routedPolylines[i];
      const b = routedPolylines[j];
      if (!a || !b) continue;
      // Edges sharing an endpoint node meet by construction; only
      // proper interior crossings count anyway, but skip the pair
      // entirely when they share BOTH endpoints (parallel edges).
      for (let s = 1; s < a.pts.length; s++) {
        for (let t = 1; t < b.pts.length; t++) {
          const a1 = a.pts[s - 1];
          const a2 = a.pts[s];
          const b1 = b.pts[t - 1];
          const b2 = b.pts[t];
          if (a1 && a2 && b1 && b2 && segmentsCrossProper(a1, a2, b1, b2)) {
            crossings++;
          }
        }
      }
    }
  }

  return {
    routed,
    unrouted: input.edges.length - routed,
    crossings,
    bends,
    totalLength,
    diagonalSegments,
    violations: violatingEdges.length,
    violatingEdges,
  };
}
