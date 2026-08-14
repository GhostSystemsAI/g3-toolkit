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
   node per crossed layer, flagged `dummy: true`, carrying the owner
   edge id. Dummy width and height default to zero; the value is a
   build-time constant exposed as `DUMMY_NODE_SIZE` so spacing and
   box-violation checks have a consistent answer.
2. `orderLayers` and `placeNodes`/`placeBrandesKoepf` receive the
   augmented graph as their normal input -- dummy nodes occupy real
   positions in the layer arrays and participate in the barycenter
   sweeps. Brandes-Koepf type-1 conflict detection
   (`placeBrandesKoepf`, g3t-layered.ts:805) is index-keyed over
   per-layer arrays; inserting dummies shifts those indices, so dummy
   nodes MUST be appended to their layer arrays before calling
   `placeBrandesKoepf` (not injected mid-array) and must carry a
   `dummy: true` flag that the type-1 scan can use to identify inner
   segments. The note at g3t-layered.ts:801 confirms this path is
   currently dormant and activates when dummies land.
3. Post-placement, each chain collapses back: dummy positions become
   ordered bend hints on the owner edge (an `intermediate: Pt[]`
   field on the emitted edge geometry). `routeStructuralEdges`
   (g3t-routing.ts:109) must be modified to read `intermediate` when
   present and seed its polyline from those points instead of the
   single midpoint jog. This modification is an explicit deliverable
   of this brief; without it the hints are written and silently ignored.
4. Parent assignment for the structural (nested) case: a dummy joins
   the container of the tighter of its two endpoint scopes. "Tighter"
   is resolved as follows: (a) if both endpoints share a compound
   ancestor, the dummy joins the innermost shared ancestor; (b) if one
   endpoint is at root scope (no container), the dummy joins the
   container of the other endpoint; (c) for cross-sibling compound
   edges where neither container contains the other, the dummy joins
   the parent of the source endpoint's container (the nearest common
   ancestor). Equal-depth containers that are not in a parent-child
   relationship fall under case (c).
5. No-legacy: the previous long-span handling path is deleted, not
   kept behind a flag. This follows the project no-legacy doctrine.
   The recovery path for a regression discovered post-merge is a
   git-revert of the LAY-005 commit; the verification gate in step 3
   of the Verification section is the primary regression barrier.
6. Perimeter policy precedence (brief 10): edges that brief 10 marks
   perimeter-eligible skip interior bend-hint seeding -- the outside
   route outranks the dummy hints for those edges. Brief 10 runs after
   this brief, so at the time this brief's tests execute the
   perimeter-eligibility flag does not yet exist on edge objects. The
   guard in step 6 MUST treat a missing or undefined flag as
   "not perimeter-eligible" (i.e., default false), so perimeter edges
   are not silently exempted from bend-hint seeding before brief 10
   lands.

## Verification

- Oracle: no scenario's crossings increase on Span Gauntlet or
  Crossing Storm (strict decrease is too strong: pathological
  intermediate layers can force a dummy-induced crossing that the
  direct arc avoided). No scenario's bends or box violations increase.
  Pin before/after values in the test.
- Unit: chain construction (k-span edge yields k-1 dummies), collapse
  round-trip (no dummy leaks into emitted geometry), determinism.
- Unit: step 4 parent-assignment rule -- at minimum one test per case:
  shared ancestor, root-scope endpoint, and cross-sibling compound.
- Unit: step 6 perimeter guard -- verify that an edge with no
  perimeter-eligibility flag is seeded with bend hints (default false
  path), and that the guard is correct when the flag is explicitly false.
- `pnpm run gates` green; never pipe gates through tail/head.
