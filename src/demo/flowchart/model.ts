/**
 * Routing-engine flowchart model: the library's OWN edge routers charted as
 * UML activity diagrams, authored directly as StructuralGraphInput (plain
 * nodes carrying activity `shape` glyphs; guard-labelled control-flow edges).
 *
 * This is the self-documenting demo of the "act" (activity) diagram type and
 * the reusable flowchart capability: the toolkit modeling its own internals
 * with the same structural engine it ships. It reuses the mbse module's
 * SysMLModel container + projectDiagram (projectACT returns an activityGraph
 * verbatim) and the ContainmentTree browser, so no projection or tree code is
 * duplicated; only the diagram data and a node -> sub-diagram drill map are
 * new here.
 *
 * Seven diagrams, drillable top-down:
 *   - Interaction Overview  (dg.act.interaction)   default view; how the two
 *       routers are SELECTED by scene type. Drills into each router.
 *   - Scene Router          (dg.act.scene)          the compact non-structural
 *       path (route-scene-edges.ts: direct-unless-crossing + grazeTolerance).
 *       sr.ortho drills into the shared A* diagram.
 *   - Structural Router     (dg.act.structural)     the layered path
 *       (g3t-routing.ts: fan / anchor / snap / gap / escalate / nudge). Drills
 *       into its escalation-ladder internals, fan, and nudge sub-diagrams.
 *   - Structural Internals  (dg.act.structural.detail)  the escalation ladder
 *       expanded into its individual obstacle attempts (g3t-routing.ts
 *       lines ~1173-1235). Attempt nodes drill into the shared A* diagram.
 *   - routeOrthogonal A*    (dg.act.ortho)          shared across Scene and
 *       Structural: prune, inflate, stub ladder, A*, reconstruct, drop collinear.
 *       Grounded in packages/core/src/route/orthogonal-router.ts:114.
 *   - Nudging two-pass      (dg.act.nudge)          parallel-run separation:
 *       normalize → arms/bars → union-find groups → crowded-run plan →
 *       atomic commit. Second pass for arm overlaps created by pass 1.
 *       Grounded in packages/core/src/layout/g3t-engine/g3t-nudging.ts.
 *   - Fan / anchor          (dg.act.fan)            fanKey grouping, side
 *       selection (largest border gap), sorted placement, overflow onto
 *       perpendicular sides, anchorOf VR-7f slide.
 *       Grounded in packages/core/src/layout/g3t-engine/g3t-routing.ts:341+.
 *
 * Faithful to the code at pipeline-stage granularity (the detail diagram at
 * per-attempt granularity):
 *   packages/core/src/route/route-scene-edges.ts
 *   packages/core/src/route/orthogonal-router.ts
 *   packages/core/src/layout/g3t-engine/g3t-routing.ts
 *   packages/core/src/layout/g3t-engine/g3t-nudging.ts
 */

import type { StructuralGraphInput } from "@g3t/core";
import type { SysMLModel, Diagram, Package } from "../mbse/model";

// ── Interaction overview ─────────────────────────────────────────────────
// The two routers do NOT call each other; the choice is by scene type. A
// structural (layered / MBSE) layout routes through inter-layer gaps via
// routeStructuralEdges; every other scene uses the post-layout
// routeSceneEdges pass. Both feed the same renderer.
const interactionGraph: StructuralGraphInput = {
  nodes: [
    {
      id: "ix.start",
      header: { name: "graph needs edges routed" },
      shape: "initial",
      width: 210,
    },
    {
      id: "ix.kind",
      header: { name: "structural (layered) layout?" },
      shape: "diamond",
      width: 220,
      height: 100,
    },
    {
      id: "ix.struct",
      header: { name: "Structural Router — routeStructuralEdges" },
      shape: "ellipse",
      width: 280,
    },
    {
      id: "ix.scene",
      header: { name: "Scene Router — routeSceneEdges" },
      shape: "ellipse",
      width: 250,
    },
    {
      id: "ix.structnote",
      header: { name: "routes inter-layer gaps into geometry.edges" },
      shape: "ellipse",
      width: 280,
    },
    {
      id: "ix.scenenote",
      header: { name: "direct-unless-crossing post-layout pass (routeEdges)" },
      shape: "ellipse",
      width: 290,
    },
    {
      id: "ix.emit",
      header: { name: "polylines → StructuralSvgView / CytoscapeCanvas" },
      shape: "final",
      width: 290,
    },
  ],
  edges: [
    { id: "ix.e1", source: "ix.start", target: "ix.kind" },
    { id: "ix.e2", source: "ix.kind", target: "ix.struct", label: "yes" },
    { id: "ix.e3", source: "ix.kind", target: "ix.scene", label: "no" },
    { id: "ix.e4", source: "ix.struct", target: "ix.structnote" },
    { id: "ix.e5", source: "ix.scene", target: "ix.scenenote" },
    { id: "ix.e6", source: "ix.structnote", target: "ix.emit" },
    { id: "ix.e7", source: "ix.scenenote", target: "ix.emit" },
  ],
};

// ── Scene router (route-scene-edges.ts) ──────────────────────────────────
const sceneRouterGraph: StructuralGraphInput = {
  nodes: [
    { id: "sr.start", header: { name: "edge" }, shape: "initial" },
    {
      id: "sr.self",
      header: { name: "source === target?" },
      shape: "diamond",
      width: 150,
      height: 80,
    },
    { id: "sr.skip", header: { name: "pass through (skip)" }, shape: "final" },
    {
      id: "sr.sides",
      header: { name: "infer terminal sides" },
      shape: "ellipse",
    },
    {
      id: "sr.obst",
      header: { name: "gather near obstacles" },
      shape: "ellipse",
    },
    {
      id: "sr.inset",
      header: { name: "inset boxes by grazeTolerance" },
      shape: "ellipse",
      width: 190,
    },
    {
      id: "sr.cross",
      header: { name: "straight shot crosses a box?" },
      shape: "diamond",
      width: 190,
      height: 90,
    },
    {
      id: "sr.bezier",
      header: { name: "keep straight (bezier)" },
      shape: "ellipse",
    },
    {
      id: "sr.ortho",
      header: { name: "routeOrthogonal detour" },
      shape: "ellipse",
    },
    { id: "sr.emit", header: { name: "emit polyline" }, shape: "final" },
  ],
  edges: [
    { id: "sr.e1", source: "sr.start", target: "sr.self" },
    { id: "sr.e2", source: "sr.self", target: "sr.skip", label: "yes" },
    { id: "sr.e3", source: "sr.self", target: "sr.sides", label: "no" },
    { id: "sr.e4", source: "sr.sides", target: "sr.obst" },
    { id: "sr.e5", source: "sr.obst", target: "sr.inset" },
    { id: "sr.e6", source: "sr.inset", target: "sr.cross" },
    { id: "sr.e7", source: "sr.cross", target: "sr.bezier", label: "no" },
    { id: "sr.e8", source: "sr.cross", target: "sr.ortho", label: "yes" },
    { id: "sr.e9", source: "sr.bezier", target: "sr.emit" },
    { id: "sr.e10", source: "sr.ortho", target: "sr.emit" },
  ],
};

// ── Structural router (g3t-routing.ts) ───────────────────────────────────
// Pipeline-stage granularity; the escalation-ladder node drills into the
// per-attempt detail diagram below.
const structuralRouterGraph: StructuralGraphInput = {
  nodes: [
    { id: "st.start", header: { name: "edge" }, shape: "initial" },
    {
      id: "st.fan",
      header: { name: "fan + anchor assignment" },
      shape: "ellipse",
      width: 180,
    },
    {
      id: "st.anchor",
      header: { name: "anchorOf (port or exposed border)" },
      shape: "ellipse",
      width: 210,
    },
    {
      id: "st.snap",
      header: { name: "snap passes (box/port/mixed)" },
      shape: "ellipse",
      width: 200,
    },
    {
      id: "st.stub",
      header: { name: "side-aware stub exit" },
      shape: "ellipse",
      width: 170,
    },
    {
      id: "st.channel",
      header: { name: "channel router enabled?" },
      shape: "diamond",
      width: 190,
      height: 90,
    },
    {
      id: "st.channelroute",
      header: { name: "route through channel plan" },
      shape: "ellipse",
      width: 200,
    },
    {
      id: "st.simple",
      header: { name: "gap simple route (jog at midline)" },
      shape: "ellipse",
      width: 220,
    },
    {
      id: "st.near",
      header: { name: "build near-obstacle set" },
      shape: "ellipse",
      width: 180,
    },
    {
      id: "st.perim",
      header: { name: "near ≥ longEdgePerimeter?" },
      shape: "diamond",
      width: 200,
      height: 90,
    },
    {
      id: "st.detour",
      header: { name: "VR-9 perimeter detour (VR-10 band)" },
      shape: "ellipse",
      width: 220,
    },
    {
      id: "st.seed",
      header: { name: "seed LAY-005 bend hints" },
      shape: "ellipse",
      width: 180,
    },
    {
      id: "st.accept",
      header: { name: "simple route clear?" },
      shape: "diamond",
      width: 170,
      height: 90,
    },
    {
      id: "st.escalate",
      header: { name: "escalation ladder (3 tries, 80ms)" },
      shape: "ellipse",
      width: 220,
    },
    {
      id: "st.fallback",
      header: { name: "honest fallback + stagger" },
      shape: "ellipse",
      width: 190,
    },
    {
      id: "st.nudge",
      header: { name: "nudge post-pass (track separation)" },
      shape: "ellipse",
      width: 230,
    },
    { id: "st.emit", header: { name: "emit routes" }, shape: "final" },
  ],
  edges: [
    { id: "st.e1", source: "st.start", target: "st.fan" },
    { id: "st.e2", source: "st.fan", target: "st.anchor" },
    { id: "st.e3", source: "st.anchor", target: "st.snap" },
    { id: "st.e4", source: "st.snap", target: "st.stub" },
    { id: "st.e5", source: "st.stub", target: "st.channel" },
    {
      id: "st.e6",
      source: "st.channel",
      target: "st.channelroute",
      label: "yes",
    },
    { id: "st.e7", source: "st.channel", target: "st.simple", label: "no" },
    { id: "st.e8", source: "st.channelroute", target: "st.nudge" },
    { id: "st.e9", source: "st.simple", target: "st.near" },
    { id: "st.e10", source: "st.near", target: "st.perim" },
    { id: "st.e11", source: "st.perim", target: "st.detour", label: "yes" },
    { id: "st.e12", source: "st.perim", target: "st.seed", label: "no" },
    { id: "st.e13", source: "st.detour", target: "st.nudge" },
    { id: "st.e14", source: "st.seed", target: "st.accept" },
    { id: "st.e15", source: "st.accept", target: "st.nudge", label: "clear" },
    {
      id: "st.e16",
      source: "st.accept",
      target: "st.escalate",
      label: "crosses",
    },
    { id: "st.e17", source: "st.escalate", target: "st.nudge", label: "found" },
    {
      id: "st.e18",
      source: "st.escalate",
      target: "st.fallback",
      label: "budget out",
    },
    { id: "st.e19", source: "st.fallback", target: "st.nudge" },
    { id: "st.e20", source: "st.nudge", target: "st.emit" },
  ],
};

// ── Structural router internals: the escalation ladder ────────────────────
// The single "escalation ladder" box above, expanded to its individual
// obstacle attempts (g3t-routing.ts lines ~1173-1235): a guarded 3-rung
// routeOrthogonal ladder under an 80ms best-so-far budget, then the VR-9
// detour, then an honest simple fallback. Reached by drilling the
// st.escalate node.
const structuralDetailGraph: StructuralGraphInput = {
  nodes: [
    {
      id: "sd.start",
      header: { name: "simple route crosses a box" },
      shape: "initial",
      width: 220,
    },
    {
      id: "sd.guard",
      header: { name: "≤ 64 obstacles AND < 80ms budget?" },
      shape: "diamond",
      width: 250,
      height: 110,
    },
    {
      id: "sd.try1",
      header: { name: "attempt 1 — all boxes, clearance 12" },
      shape: "ellipse",
      width: 250,
    },
    {
      id: "sd.c1",
      header: { name: "routed?" },
      shape: "diamond",
      width: 130,
      height: 80,
    },
    {
      id: "sd.try2",
      header: { name: "attempt 2 — all boxes, clearance 4 (dense packing)" },
      shape: "ellipse",
      width: 300,
    },
    {
      id: "sd.c2",
      header: { name: "routed?" },
      shape: "diamond",
      width: 130,
      height: 80,
    },
    {
      id: "sd.try3",
      header: { name: "attempt 3 — exclude endpoint boxes (last resort)" },
      shape: "ellipse",
      width: 300,
    },
    {
      id: "sd.c3",
      header: { name: "routed?" },
      shape: "diamond",
      width: 130,
      height: 80,
    },
    {
      id: "sd.detour",
      header: { name: "VR-9 detourAround the near band" },
      shape: "ellipse",
      width: 240,
    },
    {
      id: "sd.dcheck",
      header: { name: "detour clears the band?" },
      shape: "diamond",
      width: 190,
      height: 90,
    },
    {
      id: "sd.done",
      header: { name: "emit routed polyline" },
      shape: "final",
      width: 190,
    },
    {
      id: "sd.fallback",
      header: { name: "honest fallback — simple route stands" },
      shape: "final",
      width: 260,
    },
  ],
  edges: [
    { id: "sd.e1", source: "sd.start", target: "sd.guard" },
    { id: "sd.e2", source: "sd.guard", target: "sd.try1", label: "yes" },
    {
      id: "sd.e3",
      source: "sd.guard",
      target: "sd.detour",
      label: "no (skip ladder)",
    },
    { id: "sd.e4", source: "sd.try1", target: "sd.c1" },
    { id: "sd.e5", source: "sd.c1", target: "sd.done", label: "routed" },
    { id: "sd.e6", source: "sd.c1", target: "sd.try2", label: "no" },
    { id: "sd.e7", source: "sd.try2", target: "sd.c2" },
    { id: "sd.e8", source: "sd.c2", target: "sd.done", label: "routed" },
    { id: "sd.e9", source: "sd.c2", target: "sd.try3", label: "no" },
    { id: "sd.e10", source: "sd.try3", target: "sd.c3" },
    { id: "sd.e11", source: "sd.c3", target: "sd.done", label: "routed" },
    { id: "sd.e12", source: "sd.c3", target: "sd.detour", label: "no" },
    { id: "sd.e13", source: "sd.detour", target: "sd.dcheck" },
    { id: "sd.e14", source: "sd.dcheck", target: "sd.done", label: "yes" },
    { id: "sd.e15", source: "sd.dcheck", target: "sd.fallback", label: "no" },
  ],
};

// ── routeOrthogonal A* (orthogonal-router.ts:114) ────────────────────────
// Shared drill target from sr.ortho and from the structural-detail attempt
// nodes. Steps grounded line by line in routeOrthogonal.
const orthoRouterGraph: StructuralGraphInput = {
  nodes: [
    {
      id: "or.start",
      header: { name: "route request (src, tgt, obstacles)" },
      shape: "initial",
      width: 230,
    },
    {
      id: "or.prune",
      header: { name: "> 64 obstacles? prune to bounding region" },
      shape: "diamond",
      width: 250,
      height: 100,
    },
    {
      id: "or.pruneroute",
      header: { name: "route against pruned set" },
      shape: "ellipse",
      width: 210,
    },
    {
      id: "or.prunecheck",
      header: { name: "pruned route clears full set?" },
      shape: "diamond",
      width: 230,
      height: 90,
    },
    {
      id: "or.inflate",
      header: { name: "inflate obstacle boxes by clearance (default 12)" },
      shape: "ellipse",
      width: 280,
    },
    {
      id: "or.stub",
      header: {
        name: "stub ladder per terminal [minStub, minStub/2, clearance, 0]",
      },
      shape: "ellipse",
      width: 310,
    },
    {
      id: "or.grid",
      header: {
        name: "build interesting-coordinate grid (inflated borders + stubs)",
      },
      shape: "ellipse",
      width: 310,
    },
    {
      id: "or.astar",
      header: {
        name: "A* over (grid node, incoming dir) — bendPenalty 30/bend",
      },
      shape: "ellipse",
      width: 310,
    },
    {
      id: "or.found",
      header: { name: "goal reached?" },
      shape: "diamond",
      width: 150,
      height: 80,
    },
    {
      id: "or.reconstruct",
      header: { name: "reconstruct stub-to-stub path; prepend/append anchors" },
      shape: "ellipse",
      width: 300,
    },
    {
      id: "or.collinear",
      header: { name: "drop collinear / duplicate points" },
      shape: "ellipse",
      width: 230,
    },
    { id: "or.emit", header: { name: "return { points }" }, shape: "final" },
    {
      id: "or.null",
      header: { name: "return null (no clear path)" },
      shape: "final",
      width: 200,
    },
  ],
  edges: [
    { id: "or.e1", source: "or.start", target: "or.prune" },
    { id: "or.e2", source: "or.prune", target: "or.pruneroute", label: "yes" },
    { id: "or.e3", source: "or.prune", target: "or.inflate", label: "no" },
    { id: "or.e4", source: "or.pruneroute", target: "or.prunecheck" },
    {
      id: "or.e5",
      source: "or.prunecheck",
      target: "or.emit",
      label: "yes → fast path",
    },
    {
      id: "or.e6",
      source: "or.prunecheck",
      target: "or.inflate",
      label: "no → full set",
    },
    { id: "or.e7", source: "or.inflate", target: "or.stub" },
    { id: "or.e8", source: "or.stub", target: "or.grid" },
    { id: "or.e9", source: "or.grid", target: "or.astar" },
    { id: "or.e10", source: "or.astar", target: "or.found" },
    {
      id: "or.e11",
      source: "or.found",
      target: "or.reconstruct",
      label: "yes",
    },
    { id: "or.e12", source: "or.found", target: "or.null", label: "no" },
    { id: "or.e13", source: "or.reconstruct", target: "or.collinear" },
    { id: "or.e14", source: "or.collinear", target: "or.emit" },
  ],
};

// ── Nudging two-pass (g3t-nudging.ts:105) ────────────────────────────────
// nudgeRoutes runs the separation pass twice: pass 1 spreads bars, pass 2
// fixes the arm overlaps that bar-spread creates.
const nudgingGraph: StructuralGraphInput = {
  nodes: [
    {
      id: "nu.start",
      header: { name: "route map + obstacles" },
      shape: "initial",
    },
    {
      id: "nu.pre",
      header: {
        name: "capture pre-existing arm overlaps (computeRawArmOverlaps)",
      },
      shape: "ellipse",
      width: 290,
    },
    {
      id: "nu.p1norm",
      header: { name: "pass 1 — normalize routes (dedupeCollinear)" },
      shape: "ellipse",
      width: 260,
    },
    {
      id: "nu.p1decomp",
      header: {
        name: "decompose into arms + bars; exclude short arms (< 2×trackGap)",
      },
      shape: "ellipse",
      width: 310,
    },
    {
      id: "nu.p1group",
      header: {
        name: "union-find: group segments by axis, perp proximity, obstacle split",
      },
      shape: "ellipse",
      width: 320,
    },
    {
      id: "nu.p1crowd",
      header: {
        name: "crowdedRuns: cut where spacing ≥ trackGap (spacing < trackGap → crowded)",
      },
      shape: "ellipse",
      width: 340,
    },
    {
      id: "nu.p1plan",
      header: {
        name: "plan: measure corridor span, compute trackGap placements",
      },
      shape: "ellipse",
      width: 290,
    },
    {
      id: "nu.p1commit",
      header: {
        name: "atomic commit via attemptGroupRewrite; crossing guard reverts on failure",
      },
      shape: "ellipse",
      width: 320,
    },
    {
      id: "nu.p2",
      header: {
        name: "pass 2 (arms-only) — same pipeline; skip bars, skip pre-existing arm overlaps",
      },
      shape: "ellipse",
      width: 340,
    },
    {
      id: "nu.emit",
      header: { name: "return { routes, corridorDemand }" },
      shape: "final",
      width: 230,
    },
  ],
  edges: [
    { id: "nu.e1", source: "nu.start", target: "nu.pre" },
    { id: "nu.e2", source: "nu.pre", target: "nu.p1norm" },
    { id: "nu.e3", source: "nu.p1norm", target: "nu.p1decomp" },
    { id: "nu.e4", source: "nu.p1decomp", target: "nu.p1group" },
    { id: "nu.e5", source: "nu.p1group", target: "nu.p1crowd" },
    { id: "nu.e6", source: "nu.p1crowd", target: "nu.p1plan" },
    { id: "nu.e7", source: "nu.p1plan", target: "nu.p1commit" },
    {
      id: "nu.e8",
      source: "nu.p1commit",
      target: "nu.p2",
      label: "pass 1 done",
    },
    { id: "nu.e9", source: "nu.p2", target: "nu.emit" },
  ],
};

// ── Fan / anchor distribution (g3t-routing.ts:341+) ──────────────────────
// fanKey groups edges by (node#side). sidesFor picks the primary side by
// largest border gap (VR-7f). Anchors are placed evenly or at pitch.
// anchorOf (VR-7f) slides a covered spot to the nearest exposed cross.
const fanAnchorGraph: StructuralGraphInput = {
  nodes: [
    {
      id: "fa.start",
      header: { name: "edge list + geometry boxes" },
      shape: "initial",
    },
    {
      id: "fa.key",
      header: { name: "fanKey(node, side) — group edges by node#side" },
      shape: "ellipse",
      width: 260,
    },
    {
      id: "fa.sides",
      header: {
        name: "sidesFor: rank sides by border gap; flow axis breaks ties (VR-7f)",
      },
      shape: "ellipse",
      width: 310,
    },
    {
      id: "fa.sort",
      header: { name: "sort fan by other endpoint's tangent coordinate" },
      shape: "ellipse",
      width: 270,
    },
    {
      id: "fa.pitch",
      header: { name: "anchorPitch set?" },
      shape: "diamond",
      width: 160,
      height: 80,
    },
    {
      id: "fa.pitchplace",
      header: {
        name: "placeAtPitch: place at ≥ pitch spacing, centred on side span",
      },
      shape: "ellipse",
      width: 290,
    },
    {
      id: "fa.overflow",
      header: {
        name: "overflow excess edges onto perpendicular sides (nearest corner first)",
      },
      shape: "ellipse",
      width: 310,
    },
    {
      id: "fa.evenplace",
      header: { name: "even fan: divide side into count+1 intervals" },
      shape: "ellipse",
      width: 260,
    },
    {
      id: "fa.anchor",
      header: {
        name: "anchorOf: fanPreferred + VR-7f slide to nearest exposed cross",
      },
      shape: "ellipse",
      width: 300,
    },
    {
      id: "fa.emit",
      header: { name: "fanOffset + fanSide written for every edge@node" },
      shape: "final",
      width: 260,
    },
  ],
  edges: [
    { id: "fa.e1", source: "fa.start", target: "fa.key" },
    { id: "fa.e2", source: "fa.key", target: "fa.sides" },
    { id: "fa.e3", source: "fa.sides", target: "fa.sort" },
    { id: "fa.e4", source: "fa.sort", target: "fa.pitch" },
    { id: "fa.e5", source: "fa.pitch", target: "fa.pitchplace", label: "yes" },
    { id: "fa.e6", source: "fa.pitch", target: "fa.evenplace", label: "no" },
    { id: "fa.e7", source: "fa.pitchplace", target: "fa.overflow" },
    { id: "fa.e8", source: "fa.overflow", target: "fa.anchor" },
    { id: "fa.e9", source: "fa.evenplace", target: "fa.anchor" },
    { id: "fa.e10", source: "fa.anchor", target: "fa.emit" },
  ],
};

const diagrams: Record<string, Diagram> = {
  "dg.act.interaction": {
    id: "dg.act.interaction",
    name: "Interaction Overview",
    type: "act",
    context: "routingEngine",
    activityGraph: interactionGraph,
  },
  "dg.act.scene": {
    id: "dg.act.scene",
    name: "Scene Router",
    type: "act",
    context: "routingEngine",
    activityGraph: sceneRouterGraph,
  },
  "dg.act.structural": {
    id: "dg.act.structural",
    name: "Structural Router",
    type: "act",
    context: "routingEngine",
    activityGraph: structuralRouterGraph,
  },
  "dg.act.structural.detail": {
    id: "dg.act.structural.detail",
    name: "Structural Router Internals",
    type: "act",
    context: "routingEngine",
    activityGraph: structuralDetailGraph,
  },
  "dg.act.ortho": {
    id: "dg.act.ortho",
    name: "routeOrthogonal A*",
    type: "act",
    context: "routingEngine",
    activityGraph: orthoRouterGraph,
  },
  "dg.act.nudge": {
    id: "dg.act.nudge",
    name: "Nudging Two-Pass",
    type: "act",
    context: "routingEngine",
    activityGraph: nudgingGraph,
  },
  "dg.act.fan": {
    id: "dg.act.fan",
    name: "Fan / Anchor Distribution",
    type: "act",
    context: "routingEngine",
    activityGraph: fanAnchorGraph,
  },
};

const root: Package = {
  id: "pkg.routing-root",
  name: "Routing Engine",
  packages: [
    {
      id: "pkg.overview",
      name: "Overview",
      diagrams: ["dg.act.interaction"],
    },
    {
      id: "pkg.routers",
      name: "Routers",
      diagrams: ["dg.act.scene", "dg.act.structural"],
    },
    {
      id: "pkg.internals",
      name: "Internals",
      diagrams: ["dg.act.structural.detail"],
    },
    {
      id: "pkg.substages",
      name: "Substages",
      diagrams: ["dg.act.ortho", "dg.act.nudge", "dg.act.fan"],
    },
  ],
};

/**
 * The flowchart model reuses the SysMLModel container so the shared
 * ContainmentTree + projectDiagram work unchanged; only the diagrams and the
 * containment packages are populated (no blocks / requirements / etc.).
 */
export const routingFlowchartModel: SysMLModel = {
  root,
  blocks: {},
  requirements: {},
  relationships: {},
  connectors: {},
  bindings: {},
  diagrams,
};

/** The default diagram opened by the shell. */
export const DEFAULT_DIAGRAM = "dg.act.interaction";

/**
 * Drill map: for each diagram, which node id opens which sub-diagram. Drives
 * the ▶ glyph affordance and the click handler in FlowchartShell. This is
 * flowchart-to-flowchart navigation (node -> diagram), distinct from the mbse
 * shell's block-context drill.
 */
export const DRILL_MAP: Record<string, Record<string, string>> = {
  "dg.act.interaction": {
    "ix.scene": "dg.act.scene",
    "ix.struct": "dg.act.structural",
  },
  "dg.act.scene": {
    "sr.ortho": "dg.act.ortho",
  },
  "dg.act.structural": {
    "st.escalate": "dg.act.structural.detail",
    "st.fan": "dg.act.fan",
    "st.nudge": "dg.act.nudge",
  },
  "dg.act.structural.detail": {
    "sd.try1": "dg.act.ortho",
    "sd.try2": "dg.act.ortho",
    "sd.try3": "dg.act.ortho",
  },
};
