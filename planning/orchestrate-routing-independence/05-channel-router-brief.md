---
project: g3_toolkit
part_of: https://forge.tail515200.ts.net/ontology/kb/g3_toolkit/Plan/orchestrate-routing-quality-dense-scene-legibility-dependenc-33ea5324
---

# Brief 05: channel router (construction-time conflict avoidance, PRF-003)

Phase 3 of the engine-quality roadmap. ELK-technique orthogonal
generation (EPL project; techniques only, no code) replacing the
escalation ladder.

## Problem

`routeStructuralEdges` (`g3t-routing.ts`) routes edges independently:
simple midpoint template first, then a grid-router escalation ladder
whose retry drops clearance to 4px (g3t-routing.ts:666), with other
edges invisible. 01-nudging separates the results after the fact, but
separation-after-collision is strictly weaker than never colliding:
crossings created by independent routing remain.

## Dependencies and dispatch gates

This brief consumes three upstream briefs as live inputs. Dispatch
gates are required before implementation begins:

- **Brief 03 (dummy chains, LAY-005):** must be shipped (gates green,
  merged to main) before dispatch. Confirm by checking that
  `g3t-layered.ts` emits `intermediate: Pt[]` on long-span edge
  geometry. Interface: the `intermediate` field on emitted edge objects
  as specified in Brief 03 Design step 3. No interface-version pin is
  needed beyond verifying the field exists; do not read dummy-node
  objects after collapse.
- **Brief 04 (corridor supply contract):** must be shipped before
  dispatch. Confirm by verifying that `g3tLayoutFlat` and
  `g3tLayoutStructural` accept and use a `trackGap` / `maxGapFactor`
  option pair and that the gap sizing formula
  `gap = max(baseGap, demand * trackGap + 2 * clearance)` is live in
  both layout functions. If Brief 04 is still in-flight or has pending
  revisions, the channel widths this router reads will be incorrect
  and all track-gap geometry will be wrong; do not proceed.
- **Brief 10 (long-edge perimeter policy, stage A):** must be shipped
  before dispatch. Confirm by verifying that
  `routeStructuralEdges` accepts a `longEdgeNear` option and that the
  accept-site eligibility check (near-set size >= `LONG_EDGE_NEAR`)
  exists at approximately `g3t-routing.ts:642`. Brief 10 stage A is
  deleted by this brief; confirm it exists before deleting it.

## Design

1. Corridor/channel model: the inter-layer gaps (now demand-sized by
   04) are first-class channels. Every edge's path is a sequence of
   channel traversals + node-side stubs (anchors/fans unchanged).

2. Track assignment inside each channel is combinatorial at
   construction time: edges entering a channel are ordered by the
   libavoid divergence sort (entry cross-coord, exit cross-coord,
   edge id) and assigned integer tracks BEFORE geometry exists --
   crossings inside a channel are minimized by ordering, not
   discovered by collision.

   Degenerate tied coordinates: when multiple edges share the same
   entry cross-coord, the exit cross-coord secondary key produces the
   rainbow ordering that minimizes crossings (the "uncrossing" step).
   When multiple edges share both entry and exit cross-coords (fully
   tied), the edges are geometrically coincident for that channel
   traversal; any stable sort is crossing-equivalent, and edge id
   provides the required determinism. Fully tied entry+exit is the
   degenerate case: note it explicitly in the implementation with an
   assertion that the coincident case never produces coincidentRuns
   violations (the tracks assigned are still distinct integers).

3. Geometry emission: track index -> y (or x) offset from the channel
   midline at trackGap spacing; bend points at channel entry/exit;
   `dedupeCollinear` finish pass. Track identity is an assignment-time
   integer record, never encoded as a zero-length or collinear
   polyline artifact. `dedupeCollinear` may safely remove any collinear
   run; the implementation must express track separation as genuine
   orthogonal bends (nonzero y-offset or x-offset), not as collinear
   markers that `dedupeCollinear` would collapse.

   Dummy-chain bend hints (03): Brief 03's dummy-chain collapse emits
   `intermediate: Pt[]` waypoints on long-span edges. This brief's
   channel router reads those waypoints to pick the channel sequence
   for long spans -- the channel path must pass through each waypoint's
   corridor. This is additive: Brief 03's `intermediate` field contract
   is unchanged; the channel router treats the waypoints as corridor
   selection hints, not as geometry literals. If a waypoint falls
   outside any available channel (e.g., it was seeded for the
   escalation-ladder model and does not map to a valid channel
   crossing), the edge falls back to `routeOrthogonal` for that span.
   The Brief 03 guarantee (no crossings increase) still applies because
   the channel router selects channels honoring hint order; repurposing
   the waypoints as channel selectors does not change the crossing
   bound if the channel model covers all hint-accessible corridors.

4. Long-edge perimeter policy (brief 10) is re-expressed natively:
   perimeter-eligible edges prefer the outermost (boundary) channels.
   Brief 10's stage-A accept-site implementation (the
   `!polylineIntersectsBoxes` early-accept with `LONG_EDGE_NEAR`
   eligibility check, approximately `g3t-routing.ts:642`) is deleted
   here alongside the escalation ladder (no-legacy). The policy's
   observable effect is preserved: the channel router's boundary-channel
   preference produces equivalent or better perimeter routing. The
   pinned lab assertion in `src/demo/routing/scenarios.test.ts`
   (prune-wall M and L, `pskip.*` routes outside the row band) must
   remain green. The Brief 10 plan atom must be annotated at
   implementation time to record that stage-A is superseded by this
   brief's channel preference (stage B in Brief 10's Durability
   section); this prevents `kb verify` from treating a deleted
   implementation as a live policy gap.

   Before deleting the stage-A accept-site code, audit all callers of
   `routeStructuralEdges` for any code that branches on the perimeter
   route result format (e.g., checks for a specific point count or
   out-of-band coordinate). Those callers must be updated or removed
   before the deletion lands.

5. Fallback predicate (algorithmic, not by example): `routeOrthogonal`
   (A*) is used iff the edge satisfies at least one of the following
   conditions, all of which are verifiable from the layered graph
   produced by `g3tLayoutStructural` or `g3tLayoutFlat`:

   a. Same-layer edge: `source.layer === target.layer`. No inter-layer
      corridor exists for this edge, so the channel model cannot
      express it. (Cycle arcs and self-layer connections are the
      typical case.)
   b. Anti-monotone edge: the shortest path from source layer to target
      layer in the layer-adjacency graph requires a step in the
      direction opposite to the dominant layout flow (a backward arc).
      These edges cannot be expressed as a monotone sequence of
      inter-layer channel traversals.
   c. Compound-boundary edge: the edge crosses a compound node
      boundary in a direction where the inter-layer channel lies inside
      the compound's bounding box (the channel gap is not accessible
      from outside). The detection criterion is that the edge's channel
      path, if naively computed, would require entering the compound's
      obstacle rectangle.

   All other edges use the channel model. The fallback set is computed
   at the start of the routing pass, logged in debug mode, and verified
   by the compound-boundary oracle in the test matrix.

   The 01 nudging pass operates on fallback routes only. The
   implementation must pass only the fallback-routed edge subset to the
   nudging function; it must not call the existing nudging function on
   all routes. Channel-routed edges have track separation guaranteed by
   construction and do not need nudge separation. If channel-routed
   edges degenerate (same-exit stub with zero track separation), the
   dedupeCollinear finish and coincidentRuns oracle will catch it.

6. The escalation ladder and its 4px retry are DELETED (no-legacy).
   The recovery path if a regression appears outside the six lab
   scenarios is a git-revert of this brief's commit. The verification
   gate in the Verification section (oracle on all six scenarios, gates
   green) is the primary regression barrier before merge. No feature
   flag, phased rollout, or parallel-path is introduced; the no-legacy
   doctrine applies.

## Rollback

Single-commit atomic: the escalation ladder deletion, Brief 10
accept-site deletion, and `routeOrthogonal` contract narrowing land in
one commit. To revert: `git revert <sha>`. The revert restores the
ladder, the accept-site code, and the broad nudging scope. No secondary
state (plan atoms, test fixtures) needs manual cleanup after a revert
because the Brief 10 plan atom annotation (step 4 above) and the
fallback-set log are additive; reverting the code commit leaves them
stale but harmless. The six lab scenarios' oracle values must be
re-pinned if a revert lands after re-pinning under this brief.

## Verification

- Oracle on all six lab scenarios: box violations stay 0, crossings
  do not increase anywhere and strictly decrease on Crossing Storm
  and Cycle Tangle, coincidentRuns stays 0, bends do not regress
  beyond a pinned tolerance.
- Drag stability: 3px perturbation keeps channel/track assignment
  (discrete keys) -- no flicker. Additional: drag an edge to the
  track-assignment threshold boundary (the exact cross-coord where
  the sort key would flip) and assert the discrete key does not
  produce a visible re-render at the intermediate drag position.
- Compound-boundary oracle: at least one lab scenario must include a
  same-layer backedge around a compound boundary. The oracle asserts
  (a) the channel router classifies that edge as a fallback (condition
  5a or 5c above), (b) `routeOrthogonal` handles it, and (c)
  coincidentRuns stays 0. The channel/fallback handoff point is
  logged in the test output.
- Unit: track assignment combinatorics -- given N edges with specified
  (entry, exit) cross-coord pairs, assert assigned track indices match
  the rainbow order expected from the libavoid sort. Pathological
  inputs: all-same entry (ordered by exit), all-same entry and exit
  (any stable order; assert coincidentRuns = 0), single-node-to-many-
  channel fan.
- Unit: dedupeCollinear round-trip -- given track-separated geometry
  with genuine orthogonal bends, assert dedupeCollinear does not
  remove any bend point. Given a polyline with a collinear intermediate
  (three collinear points), assert the middle is removed. This
  confirms the implementation does not rely on collinear markers.
- Determinism byte-identical; gates green; ledger note for any core
  chunk growth.
