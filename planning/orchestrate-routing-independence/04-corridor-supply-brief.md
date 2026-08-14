---
project: g3_toolkit
part_of: https://forge.tail515200.ts.net/ontology/kb/g3_toolkit/Plan/orchestrate-routing-quality-dense-scene-legibility-dependenc-33ea5324
---

# Brief 04: corridor supply contract (layout provides router headroom)

Phase 2 of the engine-quality roadmap. The dagre negative lesson:
corridor width is layout's job, not the router's.

## Problem

Inter-layer gaps are fixed by spacing options; when n parallel routes
need n tracks at 8px, a too-narrow corridor forces the nudging pass
into ELK-style even-distribution degradation (span/(n+1) < target
gap). The router cannot widen the gap; only layout can.

## Design

1. Before placement, `g3tLayoutFlat` and `g3tLayoutStructural` run a
   structural demand estimate: count chain segments (from post-03 dummy
   chains) crossing each inter-layer boundary. That count is the
   estimated track demand for the corridor. This estimate is computed
   entirely from the structural graph and never from a previous routing
   run, keeping the data flow loop-free.

   After routing completes, `nudgeRoutes` returns a `corridorDemand`
   measurement (max tracks actually used per corridor). This measured
   value is consumed by the dev-mode drift assertion described in point
   3 below -- it does not feed back into gap sizing.

   The structural estimate drives gap sizing. The measured demand
   verifies the estimate. There is no runtime branch that selects
   between estimate and measurement for gap sizing: the estimate is
   always used.

   Caveat: chain-segment counting is a proxy. Actual routing may
   produce more tracks per corridor than chain-segment count implies,
   due to bend avoidance, bundle splitting, or shared-segment reuse.
   The drift assertion is the safeguard against systematic
   underestimation.

2. Gap sizing: `gap = max(baseGap, demand * trackGap + 2 * clearance)`
   per corridor, applied in layer y-placement for N/S corridors and
   layer x-placement for E/W corridors. The demand formula and
   clearance constants are the same for both axes; if the structural
   layout treats row-spanning differently from column-spanning, a
   separate calibration run is needed to confirm the constants transfer.
   Bounded: a `maxGapFactor` (default 3x baseGap) caps pathological
   fan-ins so one bus cannot triple the drawing height.

3. Contract is one-directional and loop-free: layout estimates from
   structure, the router measures actuals, and a dev-mode assertion
   compares the two. The assertion tolerance must be calibrated: the
   estimate is expected to be at or above the actual demand (never
   below by more than one track), so the tolerance is asymmetric.
   A failing assertion is a test signal that the structural proxy is
   underestimating for a new class of diagram; it does not trigger a
   runtime re-layout.

## Verification

- Oracle: `coincidentRuns` reaches 0 on Fan-In Bus and Port Storm
  scenarios where 01 alone had to degrade, asserting the degradation
  branch is no longer hit. This oracle is scoped to lab scenarios
  explicitly constructed so that no corridor's estimated demand exceeds
  `maxGapFactor * baseGap / trackGap` tracks. For these scenarios the
  cap is not the active constraint, so undersized corridors indicate a
  formula error, not a cap hit. High-fan-in scenarios beyond the cap
  are tested separately and are expected to hit the degradation branch;
  the oracle does not apply to them.
- Layout-area guard: total drawing area growth per scenario is pinned
  and reviewed. The guard must record whether maxGapFactor or baseGap
  is the active constraint for each corridor so that a too-low
  maxGapFactor default can be detected from area metrics rather than
  inferred from router output.
- Drift assertion test: at least one lab scenario must measure
  structural-estimate vs. post-routing actual demand and assert the
  tolerance bound (estimate >= actual - 1 track). This test catches
  systematic underestimation before it reaches oracle scenarios.
- Determinism, gates green, bundle ledger if core grows.

## Open question

If real-world diagrams routinely have corridors whose demand exceeds
3x baseGap / trackGap, the maxGapFactor default is too restrictive and
the degradation branch remains reachable. The layout-area guard's
active-constraint annotation (above) is the detection mechanism; the
default should be revisited after the first batch of real diagrams is
run through the lab suite.
