---
project: g3_toolkit
part_of: https://forge.tail515200.ts.net/ontology/kb/g3_toolkit/Plan/orchestrate-routing-quality-dense-scene-legibility-dependenc-33ea5324
---

# Brief: route nudging post-pass (parallel-run separation)

Owner ask (Jake, 2026-08-14): drag-time routes collapse into shared
corridors with "not enough space between the routes"; pull the nudging
pass forward as the FIRST refactor slice (ahead of Phase 1 dummy
chains), and take the lessons/techniques (NOT code) from the surveyed
engines and do it better.

## Problem (verified against source)

`routeStructuralEdges` routes each edge independently with zero
inter-edge awareness (`packages/core/src/layout/g3t-engine/
g3t-routing.ts`):

- The simple template jogs every E/W edge at `midX = (sTip.x +
  tTip.x) / 2` (g3t-routing.ts:592) — edges spanning the same pair of
  layers share near-identical tips, so their jog segments land on the
  same x and run coincident.
- Escalated edges route with boxes as obstacles but OTHER EDGES
  INVISIBLE, and the retry ladder drops clearance to 4px for dense
  post-drag packings (g3t-routing.ts:666) — several escalated routes
  independently discover and stack in the same tight channel.
- The only separation anywhere is the anchor fan ON the node borders;
  nothing separates segments out in the corridor.

## Technique synthesis (lessons, not code)

| Source | Technique taken | How we apply it |
|---|---|---|
| MSAGL `nudging/` (MIT) | Nudging as constrained 1D optimization: free the interior segments, fix the terminals, solve min-displacement subject to min-gap, per parallel group | The core algorithm shape: post-pass over emitted polylines, terminal stubs stay anchored to the fan positions |
| MSAGL | Combinatorial order, not pixel order: segment order inside a group derives from the paths' structure so nudging can never introduce a crossing that wasn't there | Order group members by their neighbor-point cross coordinates (where each path comes from / goes to), tie-break by edge id — deterministic and drag-stable |
| libavoid (Adaptagrams) | Shared-path divergence ordering: edges sharing a channel are sorted by where they eventually diverge, minimizing intra-channel crossings; routes centered in channel free space | The group sort key is (entry cross-coord, exit cross-coord); track positions center on the corridor midline rather than hugging one wall |
| ELK layered routing (EPL) | Track assignment in the inter-layer gap: overlapping segments get distinct integer tracks, spacing = usable gap / (tracks + 1) | Fallback distribution when the corridor is too narrow for the requested 8px: degrade spacing evenly instead of giving up |
| dagre | Corridor supply must be layout's job: dummy columns reserve the space tracks need | OUT OF SCOPE here, but the pass MEASURES demand (max tracks per corridor) and exposes it — the Phase 2 corridor-supply contract consumes that number |
| Existing fan-align pass (this repo) | Forward/backward sweep with clamped span (g3t-routing.ts:278-289) solves exactly the 1D min-displacement problem | Reuse the same two-sweep technique for track placement — no new solver dependency |

**Where we do better than the sources:** (1) the pass is
producer-agnostic — it runs on the final route map, so simple-template,
grid-router, and detour outputs all get separated uniformly (MSAGL/ELK
each nudge only their own router's output); (2) determinism and drag
stability are contract, not accident — ordering keys are combinatorial
(fan order, edge id), so a 3px drag cannot reorder tracks and flicker;
(3) demand measurement feeds the next phase instead of being discarded.

## Design

New pure module `packages/core/src/layout/g3t-engine/g3t-nudging.ts`:

```
nudgeRoutes(routes, obstacles, options?) -> { routes, corridorDemand }
```

0. **Normalize** every input polyline through `dedupeCollinear` as an
   explicit first step. Nudging does NOT assume the router pre-deduped;
   the call is idempotent and cheap, and it guarantees step 1 never
   sees spurious near-zero-length segments.
   SOURCE FACTS (checked 2026-08-14; implementing worker re-verifies
   before coding): `dedupeCollinear` lives at
   packages/core/src/layout/g3t-engine/g3t-routing.ts:30 with signature
   `(points: Pt[]) => Pt[]`; it is PURE — it builds a fresh output
   array and never mutates its argument, so the copy-then-validate /
   revert pattern in step 5 is safe. It is currently MODULE-PRIVATE
   (no `export`); this slice adds `export` to it (or lifts it to a
   shared routing-util module) so g3t-nudging.ts can import it — do
   not duplicate the implementation.
1. **Decompose** each polyline into maximal axis-aligned segments.
   Interior segments are movable on their perpendicular axis. Anchor
   stubs (first/last segments) are FIXED in exactly this sense: the
   stub's own-axis line (its perpendicular coordinate, i.e. the fan
   position on the node border) never changes, but its LENGTH may
   extend or trim along its own axis when an adjacent interior
   segment moves — that length change is what keeps the polyline
   connected. "Fixed" constrains the anchor coordinate, never the
   stub endpoint shared with the moved neighbor.
2. **Group** parallel interior segments into corridors: same axis,
   perpendicular coordinates within a capture band (2x target gap),
   parallel extents overlapping. Union-find over the overlap relation,
   with a SPLIT RULE: two segments are never unioned when an obstacle
   box lies between them on the perpendicular axis within their shared
   extent. This keeps the 16px band from absorbing logically distinct
   corridors in dense 4px post-drag packings (the retry ladder's
   minimum clearance, g3t-routing.ts:666) — a box between two tight
   channels is exactly what distinguishes them.
3. **Order** each group by (entry cross coord, exit cross coord, edge
   id) — the libavoid divergence sort. These are CORRIDOR-LOCAL
   coordinates: for each member segment, the cross coordinates of the
   polyline points immediately adjacent to that segment (where the
   path enters and leaves the corridor) — NOT the route's global
   source/target coordinates, which diverge from the local ones on
   multi-bend paths and would break sort stability. Never order by
   current pixel position alone.
4. **Place** tracks with the existing forward/backward two-sweep:
   desired = current position, min separation = `trackGap` (default
   8px), freedom interval = corridor free span from the obstacle boxes
   minus `clearance` (8px). ONE spacing convention everywhere:
   `spanRequired = (n + 1) * trackGap` — full gap between every
   adjacent track pair PLUS a full-gap margin at each edge of the
   spread (matching the CorridorDemand schema; deficit is 0 exactly
   when the ladder selects case (a)). Degradation ladder, in order:
   (a) span >= (n + 1) * gap: full-gap placement. CENTERING
   CONVENTION: the n tracks are placed symmetric about the FREE-SPAN
   midline — the midpoint between the clearance-adjusted faces of the
   two bounding obstacle boxes; when boxes are asymmetric this midline
   (not any geometric average of the original segment positions) wins.
   (b) 0 < span < (n + 1) * gap: distribute evenly ELK-style
   (span / (n + 1)) — reduced but positive spacing, never overlapping a
   box. (c) span <= 0 (corridor fully occluded): TERMINAL FALLBACK —
   the whole group keeps its original positions untouched, and the
   corridor is recorded in `corridorDemand` with `blocked: true`,
   `blockedReason: 'occluded'`, and its full deficit. No exception,
   no undefined coordinates. OPEN CORRIDORS: when one or both sides
   of a corridor have no bounding obstacle box (edges routed near the
   scene boundary), the free span is bounded by the layout bounds
   (the geometry bounding box plus the routing margin) on that side;
   midline and corridorKey are computed from those substitute bounds,
   so both are always defined.
5. **Rewrite** with SNAPSHOT-PLAN / ATOMIC-COMMIT semantics. ALL of
   steps 2-4 (grouping, sort keys, track placement) are computed from
   ONE immutable snapshot of the input geometry — no group ever sees
   another group's moves, so sort keys can never go stale against the
   geometry they govern. Rewrites for every group are computed on
   COPIES (move each segment to its track, extend/trim the two
   perpendicular neighbor segments, `dedupeCollinear`), validated per
   group, and then committed in ONE final pass. Per-group validity is
   independent by construction: validation is against the STATIC
   obstacle boxes (which no group moves), and distinct corridors are
   separated beyond the capture band (or split by a box), so one
   group's tracks cannot land on another group's. Validate the whole group: every
   rewritten route must pass `polylineIntersectsBoxes`. SOURCE FACTS
   (checked 2026-08-14; implementing worker re-greps before coding and
   adapts import path/signature if it moved): exported from
   packages/core/src/route/orthogonal-router.ts:389 as
   `(points, boxes) => boolean`, already imported by g3t-routing.ts.
   If ANY member fails, first retry the group placement once with
   `trackGap' = trackGap / 2`, RE-RUNNING THE FULL three-branch
   ladder at the halved gap (not a direct fixed-spacing emit); if a
   member still fails, the ENTIRE group reverts to its original
   polylines and the corridor is recorded in `corridorDemand` as
   blocked with `blockedReason: 'reverted'`. All-or-nothing per group:
   no mixed-nudge states, so the pass can never produce a co-located
   pair that was not already in the input — the un-nudged input is the
   guaranteed worst case. A 2-point straight route is never nudged (a
   straight line must not gain bends) and never joins a group.
   Rollback granularity is the GROUP (which contains whole routes'
   corridor segments); a route outside any committed group is
   byte-identical to its input.
6. **Wire in** at the end of `routeStructuralEdges` ITSELF behind
   option `nudge?: boolean` (default ON, matching `routeEdges`
   posture), and thread through `layoutStructural`'s routing options.
   Non-test call sites enumerated (checked 2026-08-14; worker
   re-greps): g3t-structural.ts:295 (the `layoutStructural` flow) and
   packages/react/src/views/svg/structural-svg-view.tsx:408 (a DIRECT
   call bypassing `layoutStructural`). Because the wire-in is inside
   `routeStructuralEdges`, the direct SVG call and any external
   caller of the exported function get nudging by default — no call
   site is silently skipped.
   DRAG-STABILITY CLAIM, precisely scoped: track ORDER within a
   corridor group is drag-stable (combinatorial keys). Group
   MEMBERSHIP is recomputed per pass; a drag that moves a segment
   across the capture-band boundary legitimately re-corridors it —
   that is a real geometry change, not flicker. Membership hysteresis
   is explicitly OUT OF SCOPE for this slice.
   Default-ON changes geometry for every existing structural render:
   the implementing worker MUST re-pin every affected snapshot /
   pixel / geometry assertion in the SAME PR (test churn is expected
   and accepted; a red baseline left for the next brief is not).
   AUDIT RULE: deleting or skipping a test to make the suite pass is
   FORBIDDEN; baseline re-pins land as ONE SEPARATE commit in the
   same PR (implementation commit + re-pin commit), the re-pin commit
   body lists every re-pinned test by file, and the worker reports
   the count in its outcome summary. ROLLBACK PATH: a rendering
   regression after merge is recovered by ONE revert PR that flips
   the default (`nudge: false`) AND reverts the re-pin commit —
   that's why re-pins are a separate, cleanly revertible commit; the
   owner (Jake/Zach) decides the flip, no config atom or infra
   involved.

### corridorDemand schema (the Phase 2 contract — defined, not opaque)

```ts
interface CorridorDemand {
  axis: 'h' | 'v';          // segment orientation in the corridor
  corridorKey: string;       // deterministic id, spec below
  midline: number;           // CLEARANCE-ADJUSTED free-span midline — the
                             // exact value step 4 centers on (midpoint between
                             // clearance-adjusted box faces), NOT the raw
                             // obstacle-face midpoint
  extent: [number, number];  // corridor span along the segment axis
  edgeIds: string[];         // members, in final track order
  tracksRequired: number;    // n = group size
  spanAvailable: number;     // free span between obstacle boxes minus clearance
  spanRequired: number;      // (n + 1) * trackGap — same convention as step 4
  deficit: number;           // max(0, spanRequired - spanAvailable)
  blocked: boolean;          // true for either blockedReason
  blockedReason?: 'occluded' | 'reverted';
                             // 'occluded' = spanAvailable <= 0: a GEOMETRY
                             // deficiency — brief 04 must reserve space here.
                             // 'reverted' = space existed but validation
                             // rejected a member: an ALGORITHM edge case —
                             // brief 04 must NOT treat it as a space request;
                             // it is diagnostic, surfaced for engine work.
}
```

`corridorKey` QUANTIZATION SPEC (deterministic, versioned with the
layout): coordinate space is the layout coordinate space of
`geometry.edges` (the same numbers the polylines carry); quantization
is `Math.round` to integer pixels (round-half-up, JS default); key =
`` `${axis}:${Math.round(midline)}:${Math.round(extent[0])}..${Math.round(extent[1])}` ``.
Two passes over the same geometry produce identical keys; a genuine
layout change legitimately changes them (keys identify corridors
within a layout, they are not stable across relayouts — brief 04
matches by key within one pass, never across passes).

`nudgeRoutes` returns `corridorDemand: CorridorDemand[]` sorted by
deficit descending — brief 04 (corridor supply) consumes exactly this
shape. BLOCKED SEMANTICS for brief 04: `blocked: true` means "this
corridor NEEDS spanRequired but layout supplied spanAvailable" — it is
a space-reservation REQUEST at highest priority, never a
skip-this-corridor signal.

## Verification

- **Oracle metric first:** add `coincidentRuns` to the Routing Lab
  quality oracle (`src/demo/routing/quality.ts`) — pairs of distinct
  edges with parallel overlapping segments closer than 4px. Pin the
  CURRENT values for ALL SIX lab scenarios in a test (Fan-In Bus and
  Port Storm carry the known-bad counts; the others pin whatever
  their current value is), then assert the nudged value reaches 0
  where corridor width allows and never increases on any scenario.
- Unit tests on the module: order preservation (no new crossings by
  construction — assert crossings metric does not increase on all six
  lab scenarios), box-violation count does not increase, straight
  routes untouched, determinism (two runs byte-identical), drag
  stability (perturb one node 3px, assert track ORDER unchanged).
- Degradation-ladder unit tests, one per branch, using the SAME
  boundary convention as step 4: (a) span >= (n+1)*gap asserts
  full-gap spacing exactly `trackGap`, gap-consistent, and every
  track at least `clearance` from both bounding box faces; (b) the
  ELK-degraded branch (0 < span < (n+1)*gap) asserts the emitted
  spacing equals span/(n+1), is strictly positive, no track overlaps
  a box, AND the outermost tracks respect the clearance margin from
  the box faces; plus an explicit boundary case at span exactly
  (n+1)*gap asserting branch (a) is selected and deficit is 0 (the
  off-by-one canary); (c) fully blocked corridor (span <= 0) asserts
  byte-identical passthrough of the group AND a `corridorDemand`
  entry with `blocked: true`, `blockedReason: 'occluded'`, and the
  correct deficit.
- Retry-branch test: a group whose first placement fails validation
  but succeeds at trackGap/2 asserts the retry re-runs the full
  ladder at the halved gap and commits; a group that fails both
  asserts whole-group revert with `blockedReason: 'reverted'`.
- Split-rule test: two segments within the 16px capture band with an
  obstacle box between them on the perpendicular axis assert they are
  NOT grouped (two distinct corridors emitted, neither track set
  crosses the box); removing the box asserts they ARE grouped — the
  test fails if the split rule is omitted or inverted.
- Group-atomicity test: construct a corridor where one member cannot
  move without a box hit; assert the WHOLE group is byte-identical to
  input (no mixed-nudge state) and `coincidentRuns` did not increase.
- Multi-bend ordering test: a path with 3+ bends before and after a
  shared corridor, crossing a second corridor, asserting the
  corridor-local sort keys still yield a crossing count that does not
  increase — the empirical backstop for the combinatorial-order
  argument on exactly the geometry where local and global cross
  coords diverge.
- Routing Lab gets a `nudge` on/off knob next to `routeEdges` for
  visual A/B; live check on g3.ghostsystems.ai is the acceptance
  surface (edge rendering is not headlessly verifiable — CLAUDE.md).
- `pnpm run gates` green; bundle delta gets a ledger rationale if the
  core chunk grows.

## Scope guard

No public API widening beyond the `nudge` routing option and the
exported `corridorDemand` shape. `dedupeCollinear`'s new export is
ENGINE-INTERNAL only: exported from g3t-routing.ts so g3t-nudging.ts
can import it, but NOT re-exported from packages/core/src/index.ts —
it stays out of the package surface and future refactors may still
treat it as internal. No changes to anchor fans, the escalation
ladder, or the simple template — this slice ONLY separates what they
emit. Dummy chains (LAY-005) and the channel router
(PRF-003) remain later phases; corridorDemand is the bridge to them.
