/**
 * Route nudging post-pass (parallel-run separation).
 *
 * Consumes the polylines emitted by `routeStructuralEdges` (any
 * variant: simple template, grid escalation, detour) and separates
 * parallel interior segments that would otherwise land in the same
 * corridor pixels. Producer-agnostic: runs on the final route map.
 *
 * Algorithm (see roadmap brief 04 for the corridor-supply contract
 * this pass feeds): normalize, decompose into axis-aligned segments,
 * group parallel segments into corridors, order by corridor-local
 * divergence, place tracks with a min-displacement two-sweep at
 * `trackGap` spacing, degrade evenly when the corridor is narrower
 * than requested, revert per-group on validation failure. All groups
 * plan against ONE immutable input snapshot then commit atomically.
 *
 * The pass measures corridor demand (max tracks per corridor) and
 * exposes it as `corridorDemand` so a later phase (dummy chains,
 * channel router) can reserve layout space in the corridors that
 * ran out of room.
 */
import type { RouteBox } from "../../route/orthogonal-router";
import { polylineIntersectsBoxes } from "../../route/orthogonal-router";
import { dedupeCollinear, type Pt } from "./g3t-polyline-utils";

export interface NudgingOptions {
  /** Target inter-track separation, px. Default 8. */
  trackGap?: number;
  /** Minimum clearance from an obstacle box face, px. Default 8. */
  clearance?: number;
  /** Capture-band multiplier: two segments group when their perpendicular
   *  coordinates are within `trackGap * captureBandFactor`. Default 2. */
  captureBandFactor?: number;
  /** Layout bounding box; used to clamp open-corridor spread. When
   *  absent the pass derives it from the obstacle box union plus
   *  one trackGap margin. */
  layoutBounds?: { x: number; y: number; width: number; height: number };
}

export interface CorridorDemandBase {
  axis: "h" | "v";
  corridorKey: string;
  midline: number;
  extent: [number, number];
  edgeIds: string[];
  tracksRequired: number;
  spanAvailable: number;
  spanRequired: number;
  deficit: number;
}
export type CorridorDemand =
  | (CorridorDemandBase & {
      blocked: true;
      blockedReason: "occluded" | "reverted";
    })
  | (CorridorDemandBase & { blocked: false; blockedReason?: never });

export interface NudgeResult {
  routes: Record<string, { points: Pt[] }>;
  corridorDemand: CorridorDemand[];
}

interface MovableSeg {
  edgeId: string;
  segIndex: number;
  axis: "h" | "v";
  perp: number;
  extent: [number, number];
  fixed: boolean;
}

interface LayoutBound {
  xLo: number;
  xHi: number;
  yLo: number;
  yHi: number;
}

/**
 * Nudge a route map so parallel interior segments spread across
 * distinct tracks. Idempotent: a route with no group members is
 * emitted as `dedupeCollinear(input)` and never modified further.
 */
export function nudgeRoutes(
  input: Record<string, { points: Pt[] }>,
  obstacles: readonly RouteBox[],
  options?: NudgingOptions,
): NudgeResult {
  const trackGap = options?.trackGap ?? 8;
  const clearance = options?.clearance ?? 8;
  const bandFactor = options?.captureBandFactor ?? 2;
  const captureBand = trackGap * bandFactor;

  // Step 0: normalize. Idempotent, does not mutate.
  const normalized: Record<string, Pt[]> = {};
  for (const [id, route] of Object.entries(input)) {
    normalized[id] = dedupeCollinear(route.points.map((p) => ({ ...p })));
  }

  const layoutBound = deriveLayoutBound(
    obstacles,
    options?.layoutBounds,
    trackGap,
  );

  // Step 1: decompose into axis-aligned segments.
  const segments: MovableSeg[] = [];
  for (const [edgeId, pts] of Object.entries(normalized)) {
    if (pts.length < 3) continue; // 2-point straight: never nudged
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      if (a === undefined || b === undefined) continue;
      const dx = Math.abs(b.x - a.x);
      const dy = Math.abs(b.y - a.y);
      if (dx < 1e-6 && dy < 1e-6) continue;
      if (dx > 1e-6 && dy > 1e-6) continue;
      const axis: "h" | "v" = dx >= dy ? "h" : "v";
      const perp = axis === "h" ? a.y : a.x;
      const along1 = axis === "h" ? a.x : a.y;
      const along2 = axis === "h" ? b.x : b.y;
      const extent: [number, number] = [
        Math.min(along1, along2),
        Math.max(along1, along2),
      ];
      const fixed = i === 0 || i === pts.length - 2;
      segments.push({ edgeId, segIndex: i, axis, perp, extent, fixed });
    }
  }

  // Step 2: group by union-find with split rule.
  const movable = segments.filter((s) => !s.fixed);
  const parent: number[] = movable.map((_, i) => i);
  const parentAt = (i: number): number => {
    const v = parent[i];
    return v === undefined ? i : v;
  };
  const find = (i: number): number => {
    let cur = i;
    while (parentAt(cur) !== cur) {
      const p = parentAt(cur);
      const g = parentAt(p);
      parent[cur] = g;
      cur = g;
    }
    return cur;
  };
  const union = (a: number, b: number): void => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[ra] = rb;
  };
  for (let i = 0; i < movable.length; i++) {
    const a = movable[i];
    if (a === undefined) continue;
    for (let j = i + 1; j < movable.length; j++) {
      const b = movable[j];
      if (b === undefined) continue;
      if (a.axis !== b.axis) continue;
      if (a.edgeId === b.edgeId && a.segIndex === b.segIndex) continue;
      if (Math.abs(a.perp - b.perp) > captureBand) continue;
      const oMin = Math.max(a.extent[0], b.extent[0]);
      const oMax = Math.min(a.extent[1], b.extent[1]);
      if (oMax <= oMin) continue;
      const pLo = Math.min(a.perp, b.perp);
      const pHi = Math.max(a.perp, b.perp);
      let split = false;
      for (const box of obstacles) {
        const bPerpLo = a.axis === "h" ? box.y : box.x;
        const bPerpHi = bPerpLo + (a.axis === "h" ? box.height : box.width);
        const bAlongLo = a.axis === "h" ? box.x : box.y;
        const bAlongHi = bAlongLo + (a.axis === "h" ? box.width : box.height);
        if (bPerpHi <= pLo || bPerpLo >= pHi) continue;
        if (bAlongHi <= oMin || bAlongLo >= oMax) continue;
        split = true;
        break;
      }
      if (split) continue;
      union(i, j);
    }
  }
  const groups = new Map<number, number[]>();
  for (let i = 0; i < movable.length; i++) {
    const r = find(i);
    const list = groups.get(r);
    if (list) list.push(i);
    else groups.set(r, [i]);
  }

  interface Placement {
    memberIdx: number;
    newPerp: number;
  }
  interface PlannedGroup {
    axis: "h" | "v";
    memberIdxs: number[];
    placements: Placement[];
    demand: CorridorDemand;
    attemptRewrite: boolean;
  }
  const planned: PlannedGroup[] = [];
  const usedKeys = new Set<string>();

  // Deterministic iteration order for reproducible corridorKey suffixes.
  const groupList = Array.from(groups.values())
    .filter((m) => m.length >= 2)
    .map((memberIdxs) => {
      const first = movable[memberIdxs[0] ?? -1];
      return { memberIdxs, first };
    })
    .filter(
      (g): g is { memberIdxs: number[]; first: MovableSeg } =>
        g.first !== undefined,
    );
  groupList.sort((ga, gb) => {
    if (ga.first.axis !== gb.first.axis)
      return ga.first.axis < gb.first.axis ? -1 : 1;
    if (Math.round(ga.first.perp) !== Math.round(gb.first.perp))
      return Math.round(ga.first.perp) - Math.round(gb.first.perp);
    return Math.round(ga.first.extent[0]) - Math.round(gb.first.extent[0]);
  });

  for (const { memberIdxs, first } of groupList) {
    const axis = first.axis;

    let extLo = Infinity;
    let extHi = -Infinity;
    let ownLo = Infinity;
    let ownHi = -Infinity;
    for (const i of memberIdxs) {
      const s = movable[i];
      if (s === undefined) continue;
      extLo = Math.min(extLo, s.extent[0]);
      extHi = Math.max(extHi, s.extent[1]);
      ownLo = Math.min(ownLo, s.perp);
      ownHi = Math.max(ownHi, s.perp);
    }

    let perpMin = -Infinity;
    let perpMax = Infinity;
    for (const box of obstacles) {
      const bAlongLo = axis === "h" ? box.x : box.y;
      const bAlongHi = bAlongLo + (axis === "h" ? box.width : box.height);
      if (bAlongHi <= extLo || bAlongLo >= extHi) continue;
      const bPerpLo = axis === "h" ? box.y : box.x;
      const bPerpHi = bPerpLo + (axis === "h" ? box.height : box.width);
      if (bPerpHi <= ownLo && bPerpHi > perpMin) perpMin = bPerpHi;
      if (bPerpLo >= ownHi && bPerpLo < perpMax) perpMax = bPerpLo;
    }
    const openLo = axis === "h" ? layoutBound.yLo : layoutBound.xLo;
    const openHi = axis === "h" ? layoutBound.yHi : layoutBound.xHi;
    if (perpMin === -Infinity) perpMin = Math.max(openLo, ownLo - trackGap);
    if (perpMax === Infinity) perpMax = Math.min(openHi, ownHi + trackGap);

    const faceLo = perpMin + clearance;
    const faceHi = perpMax - clearance;
    const spanAvailable = faceHi - faceLo;
    const midline = (faceLo + faceHi) / 2;
    const n = memberIdxs.length;
    const spanRequired = (n + 1) * trackGap;
    const deficit = Math.max(0, spanRequired - spanAvailable);

    const rawKey = `${axis}:${Math.round(midline)}:${Math.round(extLo)}..${Math.round(extHi)}`;
    let corridorKey = rawKey;
    let suffix = 0;
    while (usedKeys.has(corridorKey)) {
      corridorKey = `${rawKey}:${++suffix}`;
    }
    usedKeys.add(corridorKey);

    const ordered = orderByDivergence(memberIdxs, movable, normalized, axis);

    let placements: Placement[] = [];
    let attemptRewrite = true;
    let blocked = false;
    if (spanAvailable <= 0) {
      blocked = true;
      attemptRewrite = false;
    } else if (spanAvailable >= (n + 1) * trackGap) {
      const spread = (n - 1) * trackGap;
      const start = midline - spread / 2;
      placements = ordered.map((memberIdx, k) => ({
        memberIdx,
        newPerp: start + k * trackGap,
      }));
    } else {
      const gap = spanAvailable / (n + 1);
      const spread = (n - 1) * gap;
      const start = midline - spread / 2;
      placements = ordered.map((memberIdx, k) => ({
        memberIdx,
        newPerp: start + k * gap,
      }));
    }

    const base: CorridorDemandBase = {
      axis,
      corridorKey,
      midline,
      extent: [extLo, extHi],
      edgeIds: ordered
        .map((i) => movable[i]?.edgeId)
        .filter((id): id is string => id !== undefined),
      tracksRequired: n,
      spanAvailable,
      spanRequired,
      deficit,
    };
    const demand: CorridorDemand = blocked
      ? { ...base, blocked: true, blockedReason: "occluded" }
      : { ...base, blocked: false };

    planned.push({
      axis,
      memberIdxs: ordered,
      placements,
      demand,
      attemptRewrite,
    });
  }

  // Step 5: snapshot-plan / atomic-commit.
  const committed: Record<string, Pt[]> = {};
  for (const [id, pts] of Object.entries(normalized)) {
    committed[id] = pts.map((p) => ({ ...p }));
  }
  const finalDemand: CorridorDemand[] = [];

  for (const group of planned) {
    if (!group.attemptRewrite) {
      finalDemand.push(group.demand);
      continue;
    }
    const attemptResult = attemptGroupRewrite(
      group.placements,
      movable,
      normalized,
      obstacles,
    );
    if (attemptResult.ok) {
      for (const [edgeId, pts] of Object.entries(attemptResult.rewritten)) {
        committed[edgeId] = pts;
      }
      finalDemand.push(group.demand);
      continue;
    }
    if (attemptResult.failureKind === "crossing") {
      finalDemand.push(makeRevertedDemand(group.demand));
      continue;
    }
    // Box-check failure: retry once at trackGap/2.
    const halvedGap = trackGap / 2;
    const halvedPlacements = replanPlacements(
      group.memberIdxs,
      movable,
      obstacles,
      halvedGap,
      clearance,
      options?.layoutBounds,
      group.axis,
    );
    if (halvedPlacements === null) {
      finalDemand.push(makeRevertedDemand(group.demand));
      continue;
    }
    const retry = attemptGroupRewrite(
      halvedPlacements,
      movable,
      normalized,
      obstacles,
    );
    if (retry.ok) {
      for (const [edgeId, pts] of Object.entries(retry.rewritten)) {
        committed[edgeId] = pts;
      }
      finalDemand.push(group.demand);
    } else {
      finalDemand.push(makeRevertedDemand(group.demand));
    }
  }

  finalDemand.sort((a, b) => b.deficit - a.deficit);

  const outRoutes: Record<string, { points: Pt[] }> = {};
  for (const [id, pts] of Object.entries(committed)) {
    outRoutes[id] = { points: pts };
  }
  return { routes: outRoutes, corridorDemand: finalDemand };
}

function deriveLayoutBound(
  obstacles: readonly RouteBox[],
  supplied: NudgingOptions["layoutBounds"],
  trackGap: number,
): LayoutBound {
  if (supplied) {
    return {
      xLo: supplied.x,
      xHi: supplied.x + supplied.width,
      yLo: supplied.y,
      yHi: supplied.y + supplied.height,
    };
  }
  if (obstacles.length === 0) {
    return { xLo: -Infinity, xHi: Infinity, yLo: -Infinity, yHi: Infinity };
  }
  let xLo = Infinity;
  let xHi = -Infinity;
  let yLo = Infinity;
  let yHi = -Infinity;
  for (const b of obstacles) {
    xLo = Math.min(xLo, b.x);
    xHi = Math.max(xHi, b.x + b.width);
    yLo = Math.min(yLo, b.y);
    yHi = Math.max(yHi, b.y + b.height);
  }
  return {
    xLo: xLo - trackGap,
    xHi: xHi + trackGap,
    yLo: yLo - trackGap,
    yHi: yHi + trackGap,
  };
}

function orderByDivergence(
  memberIdxs: number[],
  movable: MovableSeg[],
  normalized: Record<string, Pt[]>,
  axis: "h" | "v",
): number[] {
  const keyOf = (i: number): [number, number, string] => {
    const s = movable[i];
    if (s === undefined) return [0, 0, ""];
    const pts = normalized[s.edgeId];
    if (pts === undefined) return [s.perp, s.perp, s.edgeId];
    const beforePt = pts[s.segIndex];
    const afterPt = pts[s.segIndex + 2];
    const perpOf = (p: Pt | undefined, fallback: number): number => {
      if (p === undefined) return fallback;
      return axis === "h" ? p.y : p.x;
    };
    return [perpOf(beforePt, s.perp), perpOf(afterPt, s.perp), s.edgeId];
  };
  return [...memberIdxs].sort((a, b) => {
    const ka = keyOf(a);
    const kb = keyOf(b);
    if (ka[0] !== kb[0]) return ka[0] - kb[0];
    if (ka[1] !== kb[1]) return ka[1] - kb[1];
    return ka[2] < kb[2] ? -1 : ka[2] > kb[2] ? 1 : 0;
  });
}

interface RewriteAttempt {
  ok: boolean;
  rewritten: Record<string, Pt[]>;
  failureKind?: "box" | "crossing";
}

function attemptGroupRewrite(
  placements: { memberIdx: number; newPerp: number }[],
  movable: MovableSeg[],
  normalized: Record<string, Pt[]>,
  obstacles: readonly RouteBox[],
): RewriteAttempt {
  const bySeg = new Map<
    string,
    { segIndex: number; newPerp: number; axis: "h" | "v" }[]
  >();
  for (const pl of placements) {
    const s = movable[pl.memberIdx];
    if (s === undefined) continue;
    const entry = { segIndex: s.segIndex, newPerp: pl.newPerp, axis: s.axis };
    const list = bySeg.get(s.edgeId);
    if (list) list.push(entry);
    else bySeg.set(s.edgeId, [entry]);
  }
  const edgeIds = Array.from(bySeg.keys());
  const originalCrossings = new Map<string, number>();
  for (let i = 0; i < edgeIds.length; i++) {
    for (let j = i + 1; j < edgeIds.length; j++) {
      const idI = edgeIds[i];
      const idJ = edgeIds[j];
      if (idI === undefined || idJ === undefined) continue;
      const a = normalized[idI];
      const b = normalized[idJ];
      if (a === undefined || b === undefined) continue;
      originalCrossings.set(`${idI}|${idJ}`, countCrossings(a, b));
    }
  }
  const rewritten: Record<string, Pt[]> = {};
  for (const [edgeId, edits] of bySeg) {
    const src = normalized[edgeId];
    if (src === undefined) continue;
    const pts = src.map((p) => ({ ...p }));
    for (const edit of edits) {
      const a = pts[edit.segIndex];
      const b = pts[edit.segIndex + 1];
      if (a === undefined || b === undefined) continue;
      if (edit.axis === "h") {
        a.y = edit.newPerp;
        b.y = edit.newPerp;
      } else {
        a.x = edit.newPerp;
        b.x = edit.newPerp;
      }
    }
    const compact = pts.filter((p, idx) => {
      if (idx === 0) return true;
      const prev = pts[idx - 1];
      if (prev === undefined) return true;
      return p.x !== prev.x || p.y !== prev.y;
    });
    rewritten[edgeId] = dedupeCollinear(compact);
  }
  for (const pts of Object.values(rewritten)) {
    if (polylineIntersectsBoxes(pts, obstacles)) {
      return { ok: false, rewritten: {}, failureKind: "box" };
    }
  }
  for (let i = 0; i < edgeIds.length; i++) {
    for (let j = i + 1; j < edgeIds.length; j++) {
      const idI = edgeIds[i];
      const idJ = edgeIds[j];
      if (idI === undefined || idJ === undefined) continue;
      const a = rewritten[idI];
      const b = rewritten[idJ];
      if (a === undefined || b === undefined) continue;
      const now = countCrossings(a, b);
      const before = originalCrossings.get(`${idI}|${idJ}`) ?? 0;
      if (now > before) {
        return { ok: false, rewritten: {}, failureKind: "crossing" };
      }
    }
  }
  return { ok: true, rewritten };
}

function replanPlacements(
  memberIdxs: number[],
  movable: MovableSeg[],
  obstacles: readonly RouteBox[],
  gap: number,
  clearance: number,
  layoutBoundsOpt: NudgingOptions["layoutBounds"],
  axis: "h" | "v",
): { memberIdx: number; newPerp: number }[] | null {
  const layoutBound = deriveLayoutBound(obstacles, layoutBoundsOpt, gap);
  let extLo = Infinity;
  let extHi = -Infinity;
  let ownLo = Infinity;
  let ownHi = -Infinity;
  for (const i of memberIdxs) {
    const s = movable[i];
    if (s === undefined) continue;
    extLo = Math.min(extLo, s.extent[0]);
    extHi = Math.max(extHi, s.extent[1]);
    ownLo = Math.min(ownLo, s.perp);
    ownHi = Math.max(ownHi, s.perp);
  }
  let perpMin = -Infinity;
  let perpMax = Infinity;
  for (const box of obstacles) {
    const bAlongLo = axis === "h" ? box.x : box.y;
    const bAlongHi = bAlongLo + (axis === "h" ? box.width : box.height);
    if (bAlongHi <= extLo || bAlongLo >= extHi) continue;
    const bPerpLo = axis === "h" ? box.y : box.x;
    const bPerpHi = bPerpLo + (axis === "h" ? box.height : box.width);
    if (bPerpHi <= ownLo && bPerpHi > perpMin) perpMin = bPerpHi;
    if (bPerpLo >= ownHi && bPerpLo < perpMax) perpMax = bPerpLo;
  }
  const openLo = axis === "h" ? layoutBound.yLo : layoutBound.xLo;
  const openHi = axis === "h" ? layoutBound.yHi : layoutBound.xHi;
  if (perpMin === -Infinity) perpMin = Math.max(openLo, ownLo - gap);
  if (perpMax === Infinity) perpMax = Math.min(openHi, ownHi + gap);
  const faceLo = perpMin + clearance;
  const faceHi = perpMax - clearance;
  const spanAvailable = faceHi - faceLo;
  const midline = (faceLo + faceHi) / 2;
  const n = memberIdxs.length;
  if (spanAvailable <= 0) return null;
  let effGap = gap;
  if (spanAvailable < (n + 1) * gap) effGap = spanAvailable / (n + 1);
  const spread = (n - 1) * effGap;
  const start = midline - spread / 2;
  return memberIdxs.map((memberIdx, k) => ({
    memberIdx,
    newPerp: start + k * effGap,
  }));
}

function makeRevertedDemand(demand: CorridorDemand): CorridorDemand {
  return {
    axis: demand.axis,
    corridorKey: demand.corridorKey,
    midline: demand.midline,
    extent: demand.extent,
    edgeIds: demand.edgeIds,
    tracksRequired: demand.tracksRequired,
    spanAvailable: demand.spanAvailable,
    spanRequired: demand.spanRequired,
    deficit: demand.deficit,
    blocked: true,
    blockedReason: "reverted",
  };
}

function orient(a: Pt, b: Pt, c: Pt): number {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}
function segmentsCrossProper(a1: Pt, a2: Pt, b1: Pt, b2: Pt): boolean {
  const d1 = orient(b1, b2, a1);
  const d2 = orient(b1, b2, a2);
  const d3 = orient(a1, a2, b1);
  const d4 = orient(a1, a2, b2);
  return d1 * d2 < 0 && d3 * d4 < 0;
}
function countCrossings(a: readonly Pt[], b: readonly Pt[]): number {
  let n = 0;
  for (let i = 1; i < a.length; i++) {
    for (let j = 1; j < b.length; j++) {
      const a1 = a[i - 1];
      const a2 = a[i];
      const b1 = b[j - 1];
      const b2 = b[j];
      if (a1 && a2 && b1 && b2 && segmentsCrossProper(a1, a2, b1, b2)) n++;
    }
  }
  return n;
}
