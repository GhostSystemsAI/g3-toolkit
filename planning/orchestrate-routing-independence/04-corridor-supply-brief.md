---
part_of: https://forge.tail515200.ts.net/ontology/kb/g3_toolkit/Plan/orchestrate-routing-quality-dense-scene-legibility-dependenc-33ea5324
---

# Brief 04: corridor supply contract (layout provides router headroom)

Phase 2 of the engine-quality roadmap. Consumes the `corridorDemand`
measurement exported by the 01-nudging pass (the dagre negative
lesson: corridor width is layout's job, not the router's).

## Problem

Inter-layer gaps are fixed by spacing options; when n parallel routes
need n tracks at 8px, a too-narrow corridor forces the nudging pass
into ELK-style even-distribution degradation (span/(n+1) < target
gap). The router cannot widen the gap; only layout can.

## Design

1. `nudgeRoutes` already returns `corridorDemand` (max tracks per
   inter-layer corridor). Thread a demand-or-estimate function into
   `g3tLayoutFlat`/`g3tLayoutStructural`: BEFORE placement, estimate
   per-corridor track demand from the edge spans (post-03 dummy
   chains make this countable per corridor: chain segments crossing a
   gap = tracks needed).
2. Gap sizing: `gap = max(baseGap, demand * trackGap + 2 * clearance)`
   per corridor, applied in the layer y-placement (or x for E/W).
   Bounded: a `maxGapFactor` (default 3x baseGap) caps pathological
   fan-ins so one bus cannot triple the drawing height.
3. Contract is one-directional and loop-free: layout estimates from
   structure (never from a previous routing run), the router measures
   actuals, and a dev-mode assertion compares the two — drift between
   estimate and actual demand is a test signal, not a runtime loop.

## Verification

- Oracle: `coincidentRuns` reaches 0 on Fan-In Bus and Port Storm
  even where 01 alone had to degrade (assert the degradation branch
  is no longer hit on lab scenarios).
- Layout-area guard: total drawing area growth per scenario is pinned
  and reviewed (bounded by maxGapFactor).
- Determinism, gates green, bundle ledger if core grows.
