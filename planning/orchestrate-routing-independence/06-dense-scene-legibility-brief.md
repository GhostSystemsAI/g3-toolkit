---
part_of: https://forge.tail515200.ts.net/ontology/kb/g3_toolkit/Plan/orchestrate-routing-quality-dense-scene-legibility-dependenc-33ea5324
---

# Brief 06: dense-scene legibility — pseudo-node spreading (challenge problem)

Owner ask (Jake, 2026-08-14): "look at this as a challenge problem —
how to display and render this; it may take pseudo nodes to spread
it." Distinct from 03's LAYOUT-internal dummies: these pseudo nodes
are PROJECTION-level, user-visible spreading devices.

## Adopter evidence (haunt / GExplore, read from the haunt graph)

Decision `kb/haunt/Decision/gexplore-g3-swap-bff-routed-select-ugm-
identity-swap-pattern-499d98ba` records what a real adopter had to
invent: (a) all SPARQL through their BFF, never `SparqlAdapter`
against raw Fuseki (auth + graph scoping) — adapter docs should say
this posture is expected, not a workaround; (b) `UGM.fromJSON` copy to
force a CytoscapeCanvas identity swap for re-layout — the identity
contract works but adopters DISCOVER it; it needs a named, documented
affordance; (c) `properties._color` to override Okabe-Ito — pseudo
nodes below must respect the same encoding-channel precedence.

## Design

1. **Hub-burst transform** (`packages/core/src/projection/transforms.ts`
   gains `hubBurst`): for nodes with degree > k (default 12), group
   incident edges by (edge type, direction) and insert one pseudo
   "satellite" node per group at projection time. Satellites carry
   `pseudo: true`, owner id, and the group key; the hub keeps one
   edge per satellite, satellites fan out to the real neighbors.
   Same UGM-in/UGM-out shape as typeCollapse/listCollapse — it
   composes in the existing ProjectionPipeline, no new pipeline
   concept.
2. **Bus/trunk transform** (`busCollapse`): many-to-one bundles
   (the Fan-In Bus shape) collapse to one trunk edge into a pseudo
   junction node + short taps. Junction placement is layout's job
   (it is an ordinary node after projection).
3. **Rendering contract**: pseudo nodes render as small connector
   dots (a reserved style class, themeable, LOD-aware via the
   existing lod machinery); hit-testing maps a pseudo element back
   to its owner hub/edge-group for selection and context-menu
   purposes — selecting a satellite selects the edge group.
   Encoding channels never bind to pseudo nodes (reserved-channel
   rejection already exists; extend the owner-name rule).
4. **Reversibility**: transforms are pure projection; the raw graph
   is untouched. Toggling the transform re-projects — and per the
   haunt lesson, the demo wiring documents the UGM identity swap as
   THE way to trigger re-layout, promoted into the wiring guide as a
   named snippet ("re-layout via identity swap") instead of adopter
   folklore.
5. **Demo**: Routing Lab gains a "spread" knob on Port Storm and
   Fan-In Bus; one general shell (Supply Chain, which has real
   fan-ins) enables hubBurst to show it beyond the lab.

## Verification

- Oracle: add a local-density metric (max edges incident within a
  radius r of any point, sampled on the emitted geometry). Pin
  current Port Storm / Fan-In Bus values; assert spread values drop
  by a stated factor. Crossings and box violations do not increase.
- Unit: transform round-trip (project, invert mapping covers every
  original edge exactly once), pseudo flag isolation (no pseudo id
  leaks into export/subgraph or algorithm-adapter ingestion),
  encoding-channel rejection on pseudo elements.
- Wiring guide snippet + executable twin (adoption-channel rule);
  visual acceptance by Zach on the Pages playground.
