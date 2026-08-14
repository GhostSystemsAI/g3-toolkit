---
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

## Design

1. Corridor/channel model: the inter-layer gaps (now demand-sized by
   04) are first-class channels. Every edge's path is a sequence of
   channel traversals + node-side stubs (anchors/fans unchanged).
2. Track assignment inside each channel is combinatorial at
   construction time: edges entering a channel are ordered by the
   libavoid divergence sort (entry cross-coord, exit cross-coord,
   edge id) and assigned integer tracks BEFORE geometry exists —
   crossings inside a channel are minimized by ordering, not
   discovered by collision.
3. Geometry emission: track index -> y (or x) offset from the channel
   midline at trackGap spacing; bend points at channel entry/exit;
   `dedupeCollinear` finish. Dummy-chain bend hints (03) pick the
   channel sequence for long spans.
4. The escalation ladder and its 4px retry are DELETED (no-legacy).
   `routeOrthogonal` (A*) remains only as the off-lattice fallback
   for edges that cannot be expressed as channel traversals (e.g.
   same-layer backedges around a compound), and the 01 nudging pass
   remains as the final polish for exactly those fallback routes.

## Verification

- Oracle on all six lab scenarios: box violations stay 0, crossings
  do not increase anywhere and strictly decrease on Crossing Storm
  and Cycle Tangle, coincidentRuns stays 0, bends do not regress
  beyond a pinned tolerance.
- Drag stability: 3px perturbation keeps channel/track assignment
  (discrete keys) — no flicker.
- Determinism byte-identical; gates green; ledger note for any core
  chunk growth.
