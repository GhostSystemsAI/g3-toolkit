---
part_of: https://forge.tail515200.ts.net/ontology/kb/g3_toolkit/Plan/orchestrate-routing-quality-dense-scene-legibility-dependenc-33ea5324
---

# Brief 09: widget independence — charts, timeline, table, demo RDF (Tier 3b)

Companion to 08; removes the remaining shipped runtime deps. Same
rules: clean-room, parity by our own tests, dep deleted in the same
PR, bundle ledger records the shrink.

## W1 echarts (+ echarts-for-react) — @g3t/charts and react views

Used by: LinkedChart (bar, scatter, line, pie, parallel),
StatsPanel (histogram), SankeyView.

- Native chart renderer on the SAME display-list foundation brief 08
  matures (buildDisplayList + canvas adapter): axes, scales, and the
  seven plot primitives we actually use — not a general charting
  library, exactly our surface.
- Linked-selection and brush contracts are the parity gates: the m7
  and m11 test suites plus SankeyView tests pass unchanged where they
  assert behavior (render-internal assertions are rewritten against
  the display list, which makes charts MORE testable than the echarts
  DOM was — headless op assertions instead of canvas snapshots).
- Sankey layout is clean-room: standard layered band placement
  (Sugiyama-family column ordering reusing our own g3t layered
  ordering machinery where applicable).
- Delete echarts + echarts-for-react from charts/react/root.

## W2 vis-timeline + vis-data — TimelineView

Already OPTIONAL peers with a vendor-css shim (vendor-css.test.ts).
Native lane-based timeline: time scale, item lanes, zoom/pan sharing
the cameraController idiom, range brush integrating the existing
TemporalRangeFilter/TemporalSlider. Parity gate: timeline view tests +
temporal e2e behavior. Delete the optional peers and the css shim
(no-legacy).

## W3 @tanstack/react-table — TableView

TableView needs column defs, sorting, filtering, and density — a
bounded headless-table core (sort comparators, filter predicates,
column sizing state in a zustand store like every other control).
Parity gates: table.test, table-density.test, accessibility
(table-as-fallback, R7.11 posture) unchanged. Delete the dep.

## W4 fuse.js — SearchBar (moved here from 07/W7, unchanged scope)

Clean-room scored subsequence/trigram matcher; SearchBar ranking
tests gate. Delete the dep.

## W5 n3 + jsonld — demo app only (src/demo/ontology/import.ts)

Not shipped library code (root package.json is the private demo).
Options at execution, in preference order: (a) clean-room minimal
Turtle + JSON-LD subset reader sufficient for the demo fixtures
(parsers are spec-published: W3C Turtle/JSON-LD grammars — squarely
clean-room-able); (b) precompile the demo ontologies to the JSON
GraphDocument format at build time and delete runtime parsing. Either
way n3/jsonld leave package.json.

## Explicit non-goals

- A general-purpose charting/table/timeline library: we implement
  exactly the surface our views use, enumerated by the S1-style audit
  per widget before coding.
- React/zustand replacement (see brief 08 "kept platform").

## Verification

- Every replaced widget's existing test file passes or is rewritten
  to assert the same behavior against display-list ops.
- e2e shells green; visual acceptance by Zach.
- `pnpm run gates`; bundle ledger records each deletion's shrink.
