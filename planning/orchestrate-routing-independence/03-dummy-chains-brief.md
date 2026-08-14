---
project: g3_toolkit
part_of: https://forge.tail515200.ts.net/ontology/kb/g3_toolkit/Plan/orchestrate-routing-quality-dense-scene-legibility-dependenc-33ea5324
---

# Brief 03: dummy chains for long-span edges (LAY-005)

Phase 1 of the engine-quality roadmap (technique from dagre; no code
ported). Runs AFTER 01-nudging and 02-coverage so its effect is
measurable against the pinned oracle values.

## Problem

`g3tLayoutFlat` (`packages/core/src/layout/g3t-engine/g3t-layered.ts`)
treats an edge spanning k>1 layers as a single arc: `orderLayers`
cannot reduce its crossings against intermediate-layer nodes, and the
Brandes-Koepf type-1 conflict machinery in `placeBrandesKoepf`
(g3t-layered.ts:805) is dormant because no inner segments (dummy-dummy
edges) ever exist. Long spans are the dominant crossing source on the
Span Gauntlet and Crossing Storm lab scenarios.

## Design (technique, clean-room)

1. After `assignLayers` (g3t-layered.ts:194), split every edge whose
   endpoints sit more than one layer apart into a chain: one pseudo
   node per crossed layer, zero-width/height-configurable, flagged
   `dummy: true`, carrying the owner edge id.
2. `orderLayers` and `placeNodes`/`placeBrandesKoepf` operate on the
   augmented graph unchanged — dummy nodes participate in the
   barycenter sweeps and inner-segment (type-1) conflict marking now
   activates by construction.
3. Post-placement, each chain collapses back: dummy positions become
   ordered bend hints on the owner edge, exported alongside the layer
   geometry so `routeStructuralEdges` seeds its polyline from them
   instead of the midpoint jog.
4. Parent assignment for the structural (nested) case: a dummy joins
   the container of the tighter of its two endpoint scopes, so chains
   do not escape their compound.
5. No-legacy: the previous long-span handling path is deleted, not
   kept behind a flag.

## Verification

- Oracle: crossings metric strictly decreases on Span Gauntlet and
  Crossing Storm; no scenario's crossings, bends, or box violations
  increase. Pin before/after in a test.
- Unit: chain construction (k-span edge yields k-1 dummies), collapse
  round-trip (no dummy leaks into emitted geometry), determinism.
- `pnpm run gates` green; never pipe gates through tail/head.
