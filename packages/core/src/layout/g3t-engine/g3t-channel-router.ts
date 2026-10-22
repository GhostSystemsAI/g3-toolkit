/**
 * PRF-003 (brief 05a, owner Jake, 2026-08-14): channel router
 * (additive slice).
 *
 * Corridor/channel model: in a layered layout the inter-layer gaps
 * sized by brief 04 are first-class channels. An edge's path is a
 * sequence of channel traversals plus node-side stubs; ordering
 * inside a channel is combinatorial at construction time (libavoid
 * divergence sort) so crossings inside a channel are minimized by
 * ordering, not discovered by collision.
 *
 * SCOPE (05a): pure additive module. Reachable through
 * `routeStructuralEdges` behind the OFF-BY-DEFAULT `useChannelRouter`
 * flag and only when the caller supplies a `channelPlan`. 05b flips
 * the flag on inside `g3tLayoutStructural`, deletes the escalation
 * ladder, and re-pins the six-scenario LAY005_BASELINE. The
 * `useChannelRouter` flag is transient scaffolding that goes away
 * with 05b; it is NOT a permanent dual-path (no-legacy applies).
 */
import type { RouteBox } from "../../route/orthogonal-router";
import { routeOrthogonal, type RouteSide } from "../../route/orthogonal-router";
import { dedupeCollinear, type Pt } from "./g3t-polyline-utils";

/** One inter-layer channel. `axis` names the orientation of the jogs
 *  the channel hosts: "v" for a horizontal-flow layout (the channel
 *  sits between layer i and layer i+1 along x; an edge crosses it
 *  moving in x and makes its vertical jog inside it), "h" for
 *  vertical-flow. Tracks are parallel jog lines, so track offsets are
 *  applied along the FLOW axis to `midline` (heal 2144aa96). */
export interface Channel {
  /** Boundary index (between layer i and layer i+1). */
  boundary: number;
  /** Jog orientation inside this channel. "v" = vertical jogs, tracks
   *  offset along x (horizontal-flow layout); "h" = horizontal jogs,
   *  tracks offset along y. */
  axis: "v" | "h";
  /** Gap centre on the FLOW axis (x for "v", y for "h"): the
   *  coordinate halfway between layer i's far face and layer i+1's
   *  near face, the same quantity the corridor-supply midlines and
   *  nudging's corridor midline measure. Owner ruling (heal 2144aa96):
   *  it is NOT a cross coordinate; reading it as one turned every
   *  multi-boundary edge into a single cross-axis bus. */
  midline: number;
  /** Layout's supply for this channel: the maximum number of tracks
   *  the channel width can host (from brief 04's
   *  `computeCorridorGap`). Track assignments overflowing this bound
   *  are routed via `routeOrthogonal` instead. */
  demand: number;
  /** Inter-track spacing, px. Matches `nudgeRoutes` default 8. */
  trackGap: number;
}

/** Layered-scene channel plan the router consumes. */
export interface ChannelPlan {
  /** Channels indexed by boundary (0 = between layers 0 and 1). */
  channels: readonly Channel[];
  /** Layer index per node id. Edges are ordered by SOURCE layer;
   *  edges spanning k boundaries traverse channels
   *  [min(sL,tL), max(sL,tL)). */
  layerOf: ReadonlyMap<string, number>;
  /** Flow direction of the layered scene. RIGHT/LEFT stack layers
   *  along x with channels sitting between them (axis "v"); DOWN/UP
   *  stack along y (axis "h"). */
  direction: "RIGHT" | "LEFT" | "DOWN" | "UP";
}

/** Edge in the channel model (id + endpoints + optional entry/exit
 *  cross-coord hints from anchor selection). */
export interface ChannelEdge {
  id: string;
  source: string;
  target: string;
  /** Cross-coord where the edge enters each channel it traverses.
   *  When omitted, defaults to source node's cross center (caller
   *  supplies once anchors resolve). */
  entryCross?: number;
  /** Cross-coord where the edge exits (target-side). Defaults to
   *  target node's cross center. */
  exitCross?: number;
  /** Cross-coord at which the edge passes each INTERMEDIATE layer, in
   *  source-to-target order (length = boundaries spanned - 1), e.g.
   *  from LAY-005 dummy-chain bend hints. Channel k jogs from the
   *  cross at its near layer to the cross at its far layer. Omitted
   *  (or the wrong length): the edge holds its entry cross through
   *  the intermediate layers and jogs in the last channel. */
  layerCross?: readonly number[];
}

/** Cross coordinate per layer the edge touches, source-to-target:
 *  [entry, ...intermediate layers, exit]. One cross step per channel
 *  traversed, so channel k jogs from seq[k] to seq[k+1]. */
function crossSequence(
  entry: number,
  exit: number,
  span: number,
  layerCross: readonly number[] | undefined,
): number[] {
  const mid =
    layerCross !== undefined && layerCross.length === span - 1
      ? [...layerCross]
      : Array.from({ length: Math.max(0, span - 1) }, () => entry);
  return [entry, ...mid, exit];
}

/** Per-channel track assignment: edge id -> integer track index
 *  (0..demand-1 inside the channel). Edges whose assignment would
 *  exceed the channel's demand land in `overflow` and are routed via
 *  `routeOrthogonal` by the emitter. */
export interface TrackAssignment {
  /** channelBoundary -> Map<edgeId, trackIndex>. */
  tracks: Map<number, Map<string, number>>;
  /** Edge ids the plan could not host inside the channel budget. */
  overflow: Set<string>;
}

/** Libavoid divergence sort key: (entry cross, exit cross, edge id).
 *  Fully-tied entry+exit is crossing-equivalent under any stable
 *  sort; id gives determinism. */
function at(seq: readonly number[], i: number): number {
  const v = seq[i];
  if (v === undefined) throw new Error(`channel router: no cross at ${i}`);
  return v;
}

function divergenceCompare(
  a: ChannelEdge,
  b: ChannelEdge,
  entry: (e: ChannelEdge) => number,
  exit: (e: ChannelEdge) => number,
): number {
  const ea = entry(a);
  const eb = entry(b);
  if (ea !== eb) return ea - eb;
  const xa = exit(a);
  const xb = exit(b);
  if (xa !== xb) return xa - xb;
  return a.id < b.id ? -1 : 1;
}

/**
 * Assign integer track indices to edges inside each channel they
 * traverse. Ordering is the libavoid divergence sort (entry, exit,
 * id); track count in a channel is bounded by that channel's
 * `demand`. Edges whose assigned index would land at or beyond
 * `demand` join the overflow set; the emitter falls back to
 * `routeOrthogonal` for those.
 *
 * Pure: builds and returns fresh maps.
 */
export function assignTracks(
  edges: readonly ChannelEdge[],
  plan: ChannelPlan,
): TrackAssignment {
  const tracks = new Map<number, Map<string, number>>();
  const overflow = new Set<string>();
  const byBoundary = new Map<number, ChannelEdge[]>();
  for (const e of edges) {
    const sL = plan.layerOf.get(e.source);
    const tL = plan.layerOf.get(e.target);
    if (sL === undefined || tL === undefined) continue;
    const lo = Math.min(sL, tL);
    const hi = Math.max(sL, tL);
    if (lo === hi) continue; // same-layer: caller routes as fallback
    // Sort keys are per GAP: the cross the edge enters and leaves THIS
    // channel at, matching what emitChannelRoute draws there.
    const seq = crossSequence(
      e.entryCross ?? 0,
      e.exitCross ?? 0,
      hi - lo,
      e.layerCross,
    );
    for (let b = lo; b < hi; b++) {
      const k = sL < tL ? b - lo : hi - 1 - b;
      const list = byBoundary.get(b) ?? [];
      list.push({
        ...e,
        entryCross: at(seq, k),
        exitCross: at(seq, k + 1),
      });
      byBoundary.set(b, list);
    }
  }
  const channelByBoundary = new Map(plan.channels.map((c) => [c.boundary, c]));
  for (const [boundary, list] of byBoundary) {
    const channel = channelByBoundary.get(boundary);
    if (channel === undefined) {
      // No channel plan for this boundary: every edge overflows.
      for (const e of list) overflow.add(e.id);
      continue;
    }
    const crossOf = (e: ChannelEdge, end: "entry" | "exit"): number => {
      const v = end === "entry" ? e.entryCross : e.exitCross;
      return v ?? 0;
    };
    const sorted = [...list].sort((a, b) =>
      divergenceCompare(
        a,
        b,
        (e) => crossOf(e, "entry"),
        (e) => crossOf(e, "exit"),
      ),
    );
    const assigned = new Map<string, number>();
    sorted.forEach((e, i) => {
      if (i < channel.demand) assigned.set(e.id, i);
      else overflow.add(e.id);
    });
    tracks.set(boundary, assigned);
  }
  return { tracks, overflow };
}

/**
 * Emit a track-anchored polyline for a single edge that crosses one
 * or more channels. The route leaves the source anchor along the
 * source stub and runs along the flow axis; inside EACH channel it
 * traverses it jogs on its own track (flow coordinate `midline +
 * offset`) from the cross it holds at that channel's near layer to the
 * cross at its far layer (`ChannelEdge.layerCross`), then continues
 * along the flow axis and enters the target anchor.
 *
 * Heal 2144aa96: this used to read `midline` as a cross coordinate
 * and run the first channel all the way to `targetTip.x`, so a
 * multi-boundary edge became one cross-axis bus and every later
 * boundary jogged at the target column, outside its own channel.
 *
 * Track separation is expressed as GENUINE ORTHOGONAL BENDS (distinct
 * jog lines a trackGap apart): `dedupeCollinear` never collapses a
 * properly separated track. Two edges assigned the same integer track
 * in the same channel are a bug in `assignTracks`, not something the
 * emitter tolerates.
 *
 * Caller MUST supply the source/target anchors; the channel plan
 * decides only the interior geometry.
 */
export function emitChannelRoute(
  edge: ChannelEdge,
  anchors: {
    source: { point: Pt; side: RouteSide };
    sourceTip: Pt;
    target: { point: Pt; side: RouteSide };
    targetTip: Pt;
  },
  plan: ChannelPlan,
  assignment: TrackAssignment,
): Pt[] {
  const sL = plan.layerOf.get(edge.source);
  const tL = plan.layerOf.get(edge.target);
  if (sL === undefined || tL === undefined) {
    // No layer info: caller should have classified as fallback.
    return dedupeCollinear([
      anchors.source.point,
      anchors.sourceTip,
      anchors.targetTip,
      anchors.target.point,
    ]);
  }
  const ascending = sL < tL;
  const lo = Math.min(sL, tL);
  const hi = Math.max(sL, tL);
  const boundaries: number[] = [];
  for (let b = lo; b < hi; b++) boundaries.push(b);
  const traversed = ascending ? boundaries : [...boundaries].reverse();
  const channelByBoundary = new Map(plan.channels.map((c) => [c.boundary, c]));

  // Offset for a channel: t=0 sits on the midline, t=1 one trackGap
  // off, alternating sides so a saturated channel spreads symmetric
  // around the midline. Alternation is a pure function of the integer
  // track and stays deterministic.
  const offsetFor = (t: number, gap: number): number => {
    // 0 -> 0, 1 -> +gap, 2 -> -gap, 3 -> +2*gap, 4 -> -2*gap ...
    if (t === 0) return 0;
    const magnitude = Math.ceil(t / 2) * gap;
    return t % 2 === 1 ? magnitude : -magnitude;
  };

  const horizontal = plan.direction === "RIGHT" || plan.direction === "LEFT";
  // (flow, cross) -> point in layout space.
  const pt = (flow: number, cross: number): Pt =>
    horizontal ? { x: flow, y: cross } : { x: cross, y: flow };
  const crossOf = (p: Pt): number => (horizontal ? p.y : p.x);
  const flowOf = (p: Pt): number => (horizontal ? p.x : p.y);
  const seq = crossSequence(
    crossOf(anchors.sourceTip),
    crossOf(anchors.targetTip),
    traversed.length,
    edge.layerCross,
  );

  const points: Pt[] = [anchors.source.point, anchors.sourceTip];
  let cross = crossOf(anchors.sourceTip);
  traversed.forEach((b, k) => {
    const channel = channelByBoundary.get(b);
    if (channel === undefined) return;
    const t = assignment.tracks.get(b)?.get(edge.id);
    if (t === undefined) return; // overflow: caller handles
    const flow = channel.midline + offsetFor(t, channel.trackGap);
    const next = at(seq, k + 1);
    points.push(pt(flow, cross));
    points.push(pt(flow, next));
    cross = next;
  });
  // A skipped channel (no plan or no track) leaves a pending cross
  // step; close it at the target tip rather than drawing a diagonal.
  if (cross !== crossOf(anchors.targetTip)) {
    points.push(pt(flowOf(anchors.targetTip), cross));
  }
  points.push(anchors.targetTip);
  points.push(anchors.target.point);
  return dedupeCollinear(points);
}

/**
 * Overflow router: for an edge whose channel assignment landed in
 * `assignment.overflow`, delegate to `routeOrthogonal`. Kept as its
 * own helper so the caller can slot the overflow path in wherever the
 * flag-on branch renders. Returns `null` on router failure; callers
 * fall back to the simple template (matches the ladder's honesty).
 */
export function routeChannelOverflow(
  anchors: {
    source: { point: Pt; side: RouteSide };
    sourceTip: Pt;
    target: { point: Pt; side: RouteSide };
    targetTip: Pt;
  },
  obstacles: readonly RouteBox[],
): Pt[] | null {
  const routed = routeOrthogonal({
    source: { point: anchors.sourceTip, side: anchors.source.side },
    target: { point: anchors.targetTip, side: anchors.target.side },
    obstacles,
  });
  if (routed === null) return null;
  return dedupeCollinear([
    anchors.source.point,
    ...routed.points,
    anchors.target.point,
  ]);
}
