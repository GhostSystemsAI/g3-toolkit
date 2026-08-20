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
 * Four diagrams, drillable top-down:
 *   - Interaction Overview  (dg.act.interaction)   default view; how the two
 *       routers are SELECTED by scene type. Drills into each router.
 *   - Scene Router          (dg.act.scene)          the compact non-structural
 *       path (route-scene-edges.ts: direct-unless-crossing + grazeTolerance).
 *   - Structural Router     (dg.act.structural)     the layered path
 *       (g3t-routing.ts: fan / anchor / snap / gap / escalate / nudge). Drills
 *       into its escalation-ladder internals.
 *   - Structural Internals  (dg.act.structural.detail)  the escalation ladder
 *       expanded into its individual obstacle attempts (g3t-routing.ts
 *       lines ~1173-1235).
 *
 * Faithful to the code at pipeline-stage granularity (the detail diagram at
 * per-attempt granularity):
 *   packages/core/src/route/route-scene-edges.ts
 *   packages/core/src/layout/g3t-engine/g3t-routing.ts
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
  "dg.act.structural": {
    "st.escalate": "dg.act.structural.detail",
  },
};
