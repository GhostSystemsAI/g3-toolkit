# Orchestrate: routing quality + dense-scene legibility + dependency independence

Umbrella plan:
https://forge.tail515200.ts.net/ontology/kb/g3_toolkit/Plan/orchestrate-routing-quality-dense-scene-legibility-dependenc-33ea5324

Run order (kb orchestrate runs *.md sorted; README is not a brief —
dispatch the numbered files):

| # | Brief | Depends on | Why this position |
|---|---|---|---|
| 01 | route-nudging | — | Fixes the reported drag-time corridor collapse; exports corridorDemand |
| 02 | smart-routing-everywhere | — | Coverage: routing on all nine examples (parallel-safe with 01) |
| 03 | dummy-chains (LAY-005) | 01 oracle pins | Long-span crossing reduction; activates BK type-1 machinery |
| 04 | corridor-supply | 01 (corridorDemand), 03 | Layout provides the headroom nudging measured |
| 05 | channel-router (PRF-003) | 03, 04 | Construction-time conflict avoidance; deletes the 4px escalation ladder |
| 06 | dense-scene-legibility (pseudo nodes) | 02 | Projection-level hub-burst/bus spreading; haunt adopter lessons folded in |
| 07 | dependency-independence Tier 1+2 | Tier 1 gated on 03-05; Tier 2 free | Clean-room replacement + deletion of dagre/d3/fcose/utility deps |
| 08 | renderer-independence (Tier 3a) | 07 Tier 1 (native layouts), 05 (routing) | Native canvas renderer on RND-004 foundation; cytoscape + fcose deleted at S6 cutover (v2.0.0 breaking: `cy` handle) |
| 09 | widget-independence (Tier 3b) | 08 display-list maturity | echarts, vis-timeline/vis-data, tanstack table, fuse.js, demo n3/jsonld replaced and deleted |

Kept platform (owner-overridable only): react, react-dom, zustand —
they ARE the adopter contract (CLAUDE.md three channels) — plus the
dev-time toolchain (vite, vitest, playwright, storybook, eslint),
which ships no runtime code.

Ground rules binding every brief: techniques from MSAGL/libavoid/ELK/
dagre by published description only, never ported code; no-legacy
(replaced paths deleted in the same PR); oracle metrics pinned before,
asserted after; `pnpm run gates` never piped through tail/head; visual
acceptance stays with Zach on the Pages playground.
