---
part_of: https://forge.tail515200.ts.net/ontology/kb/codex/Plan/brief-route-nudging-post-pass-parallel-run-separation-f20410d0
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

1. **Decompose** each polyline into maximal axis-aligned segments
   (after `dedupeCollinear`). Interior segments are movable on their
   perpendicular axis; the first/last segments (anchor stubs) are
   FIXED — anchors keep their fan positions.
2. **Group** parallel interior segments into corridors: same axis,
   perpendicular coordinates within a capture band (2x target gap),
   parallel extents overlapping. Union-find over the overlap relation.
3. **Order** each group by (entry-point cross coord, exit-point cross
   coord, edge id) — the libavoid divergence sort. Never by current
   pixel position alone.
4. **Place** tracks with the existing forward/backward two-sweep:
   desired = current position, min separation = `trackGap` (default
   8px), freedom interval = corridor free span from the obstacle boxes
   minus `clearance` (8px). When the span cannot fit n*gap, distribute
   evenly ELK-style (span / (n+1)) — graceful degradation, never
   overlap with a box.
5. **Rewrite** polylines: move each segment to its track, extend or
   trim the two perpendicular neighbor segments, `dedupeCollinear`.
   RULES: a 2-point straight route is never nudged (a straight line
   must not gain bends); a moved segment must not create a box
   intersection (verify with `polylineIntersectsBoxes`; on violation
   the segment keeps its original position — honest fallback).
6. **Wire in** at the end of `routeStructuralEdges` behind option
   `nudge?: boolean` (default ON, matching `routeEdges` posture), and
   thread through `layoutStructural`'s routing options. The SVG view
   and drag path pick it up for free (they call the same engine).

## Verification

- **Oracle metric first:** add `coincidentRuns` to the Routing Lab
  quality oracle (`src/demo/routing/quality.ts`) — pairs of distinct
  edges with parallel overlapping segments closer than 4px. Pin the
  CURRENT (bad) values for Fan-In Bus and Port Storm in a test, then
  assert the nudged values reach 0 where corridor width allows.
- Unit tests on the module: order preservation (no new crossings by
  construction — assert crossings metric does not increase on all six
  lab scenarios), box-violation count does not increase, straight
  routes untouched, determinism (two runs byte-identical), drag
  stability (perturb one node 3px, assert track ORDER unchanged).
- Routing Lab gets a `nudge` on/off knob next to `routeEdges` for
  visual A/B; live check on g3.ghostsystems.ai is the acceptance
  surface (edge rendering is not headlessly verifiable — CLAUDE.md).
- `pnpm run gates` green; bundle delta gets a ledger rationale if the
  core chunk grows.

## Scope guard

No public API widening beyond the `nudge` routing option and the
exported `corridorDemand` shape. No changes to anchor fans, the
escalation ladder, or the simple template — this slice ONLY separates
what they emit. Dummy chains (LAY-005) and the channel router
(PRF-003) remain later phases; corridorDemand is the bridge to them.
