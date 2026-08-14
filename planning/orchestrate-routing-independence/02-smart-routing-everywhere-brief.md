---
project: g3_toolkit
part_of: https://forge.tail515200.ts.net/ontology/kb/codex/Plan/brief-obstacle-aware-smart-edge-routing-on-every-example-b0d74e72
---

# Brief: obstacle-aware ("smart") edge routing on every example

Owner ask (Jake, 2026-08-14): "I want smart routing on every example."

## Current coverage (verified against source this session)

Smart routing = the obstacle-aware machinery that already ships:
`layoutStructural` g3t-engine obstacle-aware routes (`routeEdges`,
default on; elkjs itself left the tree 2026-07-19) rendered as
`curve-style: segments` via `g3t-structural-edge-routed`, plus the
generic `routeOrthogonal` A* router (`packages/core/src/route/`,
exported from `@g3t/core`) used for interactive re-routing.

| Example | View / layout | Smart routing today |
|---|---|---|
| Routing Lab | StructuralSvgView (`routeEdges` knob) | YES |
| MBSE Satellite Workbench | layoutStructural -> canvas | YES |
| Ontology Workbench | StructuralSvgView | YES |
| Provenance Auditor | CytoscapeCanvas, fcose default | no (bezier) |
| Supply Chain Digital Thread | CytoscapeCanvas, `layout="breadthfirst"` | no |
| Biomedical KG | CytoscapeCanvas, fcose default | no |
| Analytics Dashboard (examples/decision-dashboards) | CytoscapeCanvas | no |
| Style Lab | CytoscapeCanvas, `layout="grid"` x2 | no |
| Scale (8,000 nodes) | CytoscapeCanvas, preset/fcose | no (see cap below) |

Gap: the general (non-structural) CytoscapeCanvas path has no routing
at all. Closing it is a NEW CAPABILITY, not demo wiring.

## Design

New post-layout routing pass for non-structural scenes.

1. **Pure geometry module** `packages/react/src/views/canvas/route-scene-edges.ts`:
   given node boxes (id, x, y, w, h) + edge endpoint pairs, produce per-edge
   routed polylines via `routeOrthogonal` (per-edge obstacles = all boxes
   except the endpoints'; the router's >64-obstacle pruning already handles
   density). Pure and vitest-testable, no browser.
2. **Canvas wiring** in CytoscapeCanvas: new prop
   `routeEdges?: boolean | { maxEdges?: number; clearance?: number; bendPenalty?: number; minStub?: number }`
   for NON-structural scenes (structural scenes already route; prop is a
   no-op there). On `layoutstop` (and on drag-free), read node bounding
   boxes from cy, run the pass, write `_segDist`/`_segWeight` +
   the routed class per edge — reusing `routeToSegments`, the existing
   `curve-style: segments` rule, and the routed-segment bypass. This is a
   restyle/data write, NEVER a canvas re-init: camera and positions hold
   (CLAUDE.md same-input-graph doctrine).
3. **Fallback semantics**: `routeOrthogonal` returning null leaves that
   edge on its current curve style (bezier) — per-edge graceful
   degradation, no all-or-nothing.
4. **Scale cap**: default `maxEdges` gate (proposed 600 routed edges);
   above it the pass skips and warns once. The Scale shell routes only in
   collapsed/supernode view (post-`collapseByCluster`), never on the raw
   8k scene.
5. **Drag**: incident-edge re-route on drag-free using the same pass
   (grab/drag live re-route is a follow-on; the structural drag machinery
   is port-based and does not transfer directly).
6. **Adoption channel discipline** (CLAUDE.md): prop exposure +
   wiring-guide snippet + executable twin in `examples/wiring/`.

## Work items

- [ ] W1 core/react: `route-scene-edges.ts` pure pass + unit tests
      (routes clear boxes; endpoint anchoring; null fallback; pruning at
      >64 obstacles; maxEdges gate).
- [ ] W2 CytoscapeCanvas `routeEdges` prop: layoutstop hook, data
      write-back, routed-class application, re-route on drag-free,
      structural no-op, test via the canvas test harness.
- [ ] W3 wiring guide: "Route edges around nodes on any layout" snippet +
      examples/wiring executable twin.
- [ ] W4 enable on demos: Auditor, Supply, Bio, Analytics popout+canvas,
      Style Lab (both panes). Each shell gets its CapabilityBubble entry
      updated.
- [ ] W5 Scale shell: routeEdges only when the collapsed view is active.
- [ ] W6 gates + ledger: `pnpm run gates`, bundle-size rationale in
      scripts/check-bundle-size.mjs if the react bundle grows, CHANGELOG
      entry, STATUS.md queue note. NEVER pipe gates through tail/head.

## Non-goals

- Engine-quality work (LAY-005 dummy chains, PRF-003 channel router,
  MSAGL nudging) — separate thread, already roadmapped.
- Live per-tick drag re-routing on force scenes (follow-on).
- Routing the raw 8k Scale scene.

## Verification

- Unit: W1 pure tests; W2 harness tests assert routed data present after
  layoutstop and camera untouched (no fit/re-init).
- Quality oracle: reuse `gradeRoutes` from src/demo/routing/quality.ts in
  a test asserting zero box violations on a representative fcose-like
  fixture.
- Visual: Zach reviews via the Pages playground (routing on force
  layouts reads circuit-diagram orthogonal — flag for his sign-off).

## Defaults taken (overridable)

- D1: orthogonal is the only smart routing we ship; force-layout examples
  get orthogonal segments, accepting the look change.
- D2: routing is ON by default in the listed demo shells, exposed as an
  opt-in prop (default off) in the library itself.
- D3: maxEdges cap 600; Scale routes collapsed view only.
