---
part_of: https://forge.tail515200.ts.net/ontology/kb/g3_toolkit/Plan/routing-flowchart-depth-smart-attachment-corner-penalty-brie-5962d3f5
project: g3_toolkit
---
# RF-B — smart attachment points (crossing-aware anchor order + side flip)

## Context (verified 2026-08-21 against the live tree — do not re-derive)

Attachment (which face an edge leaves/enters, and where along that face) is decided
in `routeStructuralEdges` (`packages/core/src/layout/g3t-engine/g3t-routing.ts:173`):
- `fanKey(node, side)` (`:341`) groups edges sharing a node face.
- The fan assigns `fanOffset`/`fanSide` on a primary side (`:502-503`), overflowing to
  the other side (`:520-521`).
- Order within a side is by the FAR-END coordinate (VR-7), NOT crossing-minimizing.
- Final anchor resolution reads `fanPreferred`/`assignedSide` (`:666-673`).

For scene (non-structural) edges, sides are chosen by `inferTerminalSides`
(`packages/core/src/route/route-scene-edges.ts:89`).

There is a crossing oracle already: `countCrossings` and `metricsFromStructural`
(`packages/core/src/metrics/layout-metrics.ts:168,269`). This is the SAME oracle
brief-22 (crossing-aware placement) and brief-25 use. This brief is the natural
successor: crossing-aware ATTACHMENT.

Jake's ask (A29/A30): most remaining crossings can be removed by moving/reordering
the start or end attachment. Approved scope (A30 q1a = BOTH): reorder anchors WITHIN
the assigned side AND allow flipping to another face, accepting a change only when it
STRICTLY lowers total crossings by the oracle.

## Hard constraint — preserve determinism (proven repo pattern)

The default layout MUST stay byte-identical; existing structural snapshot/geometry
tests depend on it. Land this OPT-IN behind a new option (unset by default). When
unset, `routeStructuralEdges` / `inferTerminalSides` behave EXACTLY as today. Enable
the option in the routing demos (below) so it is visible without churning snapshots.
Flipping the default is a separate followup (mirrors `nudging-default-flip-followup`).

## Changes required

### packages/core/src/layout/g3t-engine/g3t-routing.ts
- Add an opt-in `smartAttach?: boolean` to the options that reach `routeStructuralEdges`
  (thread from `StructuralLayoutOptions`).
- When on, AFTER the fan assigns `fanOffset`/`fanSide` and BEFORE final anchor
  resolution, run a crossing-aware refinement:
  - (a) within-side reorder: permute the offset assignment among edges sharing a
    `fanKey`, keeping the same set of slot positions, choosing the permutation with the
    fewest crossings (bounded: cap group size / candidate count so worst case stays in
    budget; deterministic tie-break = keep current).
  - (b) side flip: for an edge whose flip to the opposite face strictly lowers total
    crossings (re-measured via the oracle over the resulting polylines), move it; then
    re-run (a) on both affected faces. Guard against oscillation (flip each edge at most
    once; only accept strict improvements).
  - Measure with `countCrossings`/`metricsFromStructural` over the routed polylines.
- When off / unset: zero behavior change.

### packages/core/src/route/route-scene-edges.ts
- Add the same opt-in flag path to `inferTerminalSides` (or a wrapper it calls): when on,
  allow a terminal side to flip when it strictly lowers crossings for the scene edge set,
  gated by the oracle. Default off = today's behavior.

### packages/core/src/layout/structural.ts (StructuralLayoutOptions)
- Add `smartAttach?: boolean`; pass through to `routeStructuralEdges`.

### Demos (enable the opt-in so it is visible)
- Turn `smartAttach` ON in the Routing Lab (`src/demo/routing/RoutingShell.tsx`) — add a
  toggle in the existing engine-controls row (default ON in the lab, matching how `nudge`
  is exposed there), and in the scene-routing demos that already set `routeEdges`.

## Verification / acceptance
- With `smartAttach` unset, `pnpm run gates` green with ZERO structural snapshot changes
  (prove determinism held).
- Add a unit test with a fixture whose default fan order produces a crossing that a
  within-side swap removes; assert `smartAttach` on lowers `countCrossings` and never
  raises it vs off (monotone: refinement only accepts strict improvements).
- Add a fixture where a side flip is the only fix; assert the flip happens and crossings
  drop.
- `pnpm run gates` (all 5 steps) green; bundle ledger respected (rationale line if core grows).

## Sequencing note
RF-B and RF-C both edit `g3t-routing.ts`/`g3t-nudging.ts`. RF-B lands and gates green
BEFORE RF-C starts (serial — concurrent edits to these files are a pinned gotcha).

## Build + deploy
    pnpm run gates
    git add -A && git commit -m "feat(routing): crossing-aware smart attachment (within-side reorder + side flip), opt-in — RF-B"
    pnpm run docs:build
