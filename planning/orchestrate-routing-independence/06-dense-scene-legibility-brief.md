---
project: g3_toolkit
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
   gains `hubBurst`): for nodes whose **total degree** (in-degree +
   out-degree, undirected count of incident edges) exceeds k (default
   12), group all incident edges by (edge type, direction) and insert
   one pseudo "satellite" node per group at projection time.
   Satellites carry `pseudo: true`, owner id, the group key, and a
   `weight: 1.0` property (required by the LOD machinery so they
   remain visible at medium LOD; `applyLod` in
   `packages/core/src/style/lod.ts` gates on resolved features, not
   on a `weight` attribute directly, but satellite nodes must not
   lack attributes that downstream LOD consumers key on). The hub
   keeps one edge per satellite; satellites fan out to the real
   neighbors. Same UGM-in/UGM-out shape as typeCollapse/listCollapse
   -- it composes in the existing ProjectionPipeline
   (`packages/core/src/projection/pipeline.ts`), no new pipeline
   concept. **Tie-breaking rule**: an edge whose both endpoints have
   total degree > k is assigned to the satellite group of its source
   node. This makes the invert mapping deterministic and guarantees
   that each original edge appears in exactly one satellite group.
2. **Bus/trunk transform** (`busCollapse`): many-to-one bundles
   (the Fan-In Bus shape) collapse to one trunk edge into a pseudo
   junction node + short taps. Junction node IDs use the scheme
   `pseudo:bus:{stable-hash-of-edge-group-key}` to prevent collision
   with real node IDs. Junction placement is layout's job (it is an
   ordinary node after projection).
3. **Rendering contract**: pseudo nodes render as small connector
   dots (a reserved style class, themeable, LOD-aware via the
   existing lod machinery -- `resolveLod`/`applyLod` in
   `packages/core/src/style/lod.ts`). Hit-testing maps a pseudo
   element back to its owner hub/edge-group for selection and
   context-menu purposes -- selecting a satellite selects the edge
   group. The hit-test layer consumes a `SatelliteMap`
   (`Map<string, {hub: string; groupKey: string}>`) returned
   alongside the UGM by the pipeline step, so there is no
   implementation-detail coupling between projection and hit-test.
   **Encoding channels vs. direct properties**: encoding channels
   (the attribute-mapping system declared through EncodingSpec and
   guarded by `RESERVED_CHANNELS`/`ReservedChannelError` in
   `packages/react/src/interaction/encoding/encoding-spec.ts`)
   never bind to pseudo nodes -- the owner-name guard is extended to
   cover them. Direct node property rendering (e.g., `properties._color`
   set on the satellite node at projection time) does pass through,
   because satellites are ordinary UGM nodes with their own
   VisualAttributes bag. The adopter evidence in §1 ("pseudo nodes
   below must respect the same encoding-channel precedence") refers to
   this direct-property rendering path, not to the EncodingSpec
   attribute-mapper. These two mechanisms are orthogonal: one is a
   query-time mapping from UGM attributes to visual channels; the
   other is a value already in the node's properties bag.
4. **Pipeline ordering and composition safety**: hubBurst and
   busCollapse must be added to the ProjectionPipeline **after** any
   type-expansion steps and **before** collapse transforms (typeCollapse,
   listCollapse). Downstream collapse transforms that key on node
   attributes must skip nodes where `pseudo === true`; this guard is
   implemented inside each transform step, not as a pipeline-level
   concern. hubBurst and busCollapse are opt-in pipeline steps -- an
   adopter adds them explicitly; omitting them from the pipeline is
   the rollback path. No feature flag is added to the library.
5. **Export and algorithm-adapter isolation**: `exportSubgraphJson`,
   `exportSubgraphTurtle`, and `exportSubgraphCsv` in
   `packages/core/src/export/subgraph-export.ts`, and
   `ingestAlgorithmResults` in
   `packages/core/src/algorithm-adapter/algorithm-adapter.ts`,
   filter out `pseudo: true` nodes and any edges incident on them
   before processing. These are the designated filter call-sites; the
   filter is not applied anywhere else.
6. **Reversibility**: transforms are pure projection; the raw graph
   is untouched. Toggling the transform re-projects -- and per the
   haunt lesson, the demo wiring documents the UGM identity swap as
   THE way to trigger re-layout, promoted into the wiring guide as a
   named doc snippet ("re-layout via identity swap") instead of
   adopter folklore. This is a documentation deliverable (a snippet in
   the wiring guide), not a new exported function.
7. **Demo**: Routing Lab gains a "spread" knob on Port Storm and
   Fan-In Bus; one general shell (Supply Chain, which has real
   fan-ins) enables hubBurst to show it beyond the lab.

## Verification

- Oracle: add a local-density metric (max edges incident within a
  radius r of any point, sampled on **post-layout** geometry --
  Cytoscape canvas coordinates after the layout engine has run, not
  projection output coordinates). Pin current Port Storm / Fan-In Bus
  values; assert spread values drop by a stated factor. The crossing
  gate is a **per-region crossing count relative to the pre-spread
  baseline** (not an absolute non-increase, because pseudo-node
  injection expands the node and edge set and may increase crossings
  in absolute terms for dense scenes such as Port Storm). Box
  violations do not increase.
- Unit (hubBurst): transform round-trip -- project then apply invert
  mapping; assert the invert mapping covers every original edge
  exactly once (including edges where both endpoints have degree > k,
  which must land in the source-node satellite group per the
  tie-breaking rule). Pseudo flag isolation: no pseudo id leaks into
  export/subgraph or algorithm-adapter ingestion. Encoding-channel
  rejection: EncodingSpec attribute-mapper raises ReservedChannelError
  when a pseudo node is the target. Direct property pass-through:
  `properties._color` set on a satellite at projection time reaches
  VisualAttributes unchanged.
- Unit (busCollapse): transform round-trip -- project then apply
  invert mapping; assert every original edge is recoverable and
  junction IDs do not collide with real node IDs. Pseudo flag
  isolation: no junction id leaks into export or algorithm-adapter
  ingestion. Junction ID uniqueness: generate two independent
  busCollapse projections on graphs with overlapping edge-group keys
  and assert no ID collision.
- Wiring guide snippet + executable twin (adoption-channel rule);
  visual acceptance by Zach on the Pages playground (checklist:
  Port Storm fan visible as satellite ring, Fan-In Bus shows junction
  node, Supply Chain shell hub count readable, no satellite visible in
  exported subgraph).
