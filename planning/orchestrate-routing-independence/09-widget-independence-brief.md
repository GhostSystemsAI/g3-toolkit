---
project: g3_toolkit
part_of: https://forge.tail515200.ts.net/ontology/kb/g3_toolkit/Plan/orchestrate-routing-quality-dense-scene-legibility-dependenc-33ea5324
---

# Brief 09: widget independence — charts, timeline, table, demo RDF (Tier 3b)

Companion to 08; removes the remaining shipped runtime deps. Same
rules: clean-room, parity by our own tests, dep deleted when its own
parity gates pass (see staged deletion policy below), bundle ledger
records each deletion's shrink.

**Note on part_of IRI:** All nine briefs in this orchestration series
share the same `part_of` IRI (`orchestrate-routing-quality-dense-scene-legibility-dependenc-33ea5324`).
That IRI is the parent orchestration plan under which widget
independence is one workstream — not a copy-paste artifact. Verified:
every brief in `planning/orchestrate-routing-independence/` carries
the same IRI.

## Prerequisite: Brief 08 display-list API must be stable before W1 starts

W1 builds on the display-list foundation Brief 08 defines
(`canvas2d/display-list.ts` + `canvas-adapter.tsx`,
`buildDisplayList`). W1 does not dispatch until Brief 08 is merged
and its `buildDisplayList` API is stable (no open interface changes
pending). This is a hard prerequisite, not a soft ordering preference.
If Brief 08 is still in-flight when W1 would otherwise start, W1 is
blocked until the merge lands.

## Staged deletion policy (replaces monolithic PR approach)

Each widget's dep deletion is independent. A failing parity gate for
W1 does not block dep deletion for W2, W3, or W4. The PR structure
is per-widget: each widget ships as its own commit or sub-PR so that
any passing widget's dep can be merged independently. The deletion
order within a PR is: W3 and W4 first (lowest complexity), then W2,
then W5, then W1 last (highest complexity). If W1's Sankey parity
gate fails, W2-W5 deletions may still land.

## W1 echarts (+ echarts-for-react) — @g3t/charts and react views

Used by: LinkedChart (bar, scatter, line, pie, parallel),
StatsPanel (histogram), SankeyView.

**Prerequisite:** Brief 08 merged and `buildDisplayList` API stable
(see above).

- Native chart renderer on the display-list foundation Brief 08
  defines (`buildDisplayList` + canvas adapter): axes, scales, and the
  seven plot primitives we actually use.
- **Parity gate:** linked-selection and brush behavioral contracts are
  the parity criteria. The m7 and m11 test suites plus SankeyView tests
  must assert the same observable behaviors (selection propagation,
  brush range, data binding) as the echarts baseline. Assertions that
  tested echarts-specific DOM or canvas internals are rewritten to
  assert the equivalent behavior via display-list ops — the contract
  is the behavior, not the implementation path. Tests that assert
  echarts DOM structure with no behavioral equivalent are replaced with
  display-list op assertions of equivalent scope. Any test removal
  requires a written justification in the PR.
- Sankey layout is clean-room: standard layered band placement
  (Sugiyama-family column ordering). The existing `assignLayers` and
  `orderLayers` machinery from `g3t-layered.ts` is reused for column
  ordering. Bandwidth-proportional lane widths are a separate
  implementation responsibility scoped to this brief; the S1 audit
  (see Non-goals) enumerates the exact lane-width API surface before
  coding starts.
- Delete echarts + echarts-for-react from charts/react/root after W1
  parity gates pass.

## W2 vis-timeline + vis-data — TimelineView

Already OPTIONAL peers with a vendor-css shim (vendor-css.test.ts).
Native lane-based timeline: time scale, item lanes, zoom/pan sharing
the cameraController idiom, range brush integrating the existing
TemporalRangeFilter/TemporalSlider. Parity gate: timeline view tests +
temporal e2e behavior. Delete the optional peers and the css shim
(no-legacy) when W2 parity gates pass independently of W1 status.

## W3 @tanstack/react-table — TableView

TableView needs column defs, sorting, filtering, and density — a
bounded headless-table core (sort comparators, filter predicates,
column sizing state in a zustand store like every other control).
Parity gates: table.test, table-density.test, accessibility
(table-as-fallback, R7.11 posture) unchanged. Delete the dep when W3
parity gates pass independently.

## W4 fuse.js — SearchBar (moved here from 07/W7, unchanged scope)

Brief 07 explicitly deferred W7 (fuse.js/SearchBar) to this brief
with no implementation started (`planning/orchestrate-routing-independence/07-dependency-independence-brief.md:131`:
"No W7 implementation work appears in this brief"). Brief 09 inherits
a clean slate for W4 — there is no intermediate partial state to
resolve.

Clean-room scored subsequence/trigram matcher to replace Fuse.js
(`packages/react/src/interaction/search/SearchBar.tsx:10`). SearchBar
ranking tests gate. Delete the dep when W4 parity gates pass
independently.

## W5 n3 + jsonld — demo app only (src/demo/ontology/import.ts)

**Verified scope:** n3 and jsonld are used exclusively in
`src/demo/ontology/import.ts` via dynamic import (`await import("n3")`
at line 60; `await import("jsonld")` at line 92). No static or dynamic
import of either package exists in any file outside `src/demo/`. Both
packages appear only in the root `package.json`, which is the private
demo app. No library package (`packages/core`, `packages/react`,
`packages/charts`) depends on either. Library consumers cannot be
broken by their removal.

Options at execution, in preference order: (a) clean-room minimal
Turtle + JSON-LD subset reader sufficient for the demo fixtures
(parsers are spec-published: W3C Turtle/JSON-LD grammars — squarely
clean-room-able); (b) precompile the demo ontologies to the JSON
GraphDocument format at build time and delete runtime parsing. If
option (b) is chosen: generated artifacts are build-time only (not
checked in), the precompile step is owned by the demo Vite config,
and a divergence guard (hash comparison) gates the build. Either way
n3/jsonld leave package.json.

## Explicit non-goals

- A general-purpose charting/table/timeline library: we implement
  exactly the surface our views use. The S1-style surface audit runs
  per widget before coding starts and its output is committed to the PR
  description. For Sankey: the audit enumerates the exact lane-width
  and column-ordering API before any layout code is written. "Where
  applicable" in layering reuse means: column ordering reuses
  `assignLayers`/`orderLayers`; bandwidth-proportional widths are
  net-new and explicitly scoped.
- React/zustand replacement (see brief 08 "kept platform").

## Verification

- Every replaced widget's existing test file passes, or its assertions
  are rewritten to assert the same behavioral contract via display-list
  ops with a written justification per removed or rewritten test.
- e2e shells green; visual acceptance by Zach. If Zach is unavailable,
  a screenshot diff against a reference render (captured before
  migration) serves as the automated gate.
- `pnpm run gates`; bundle ledger (`scripts/check-bundle-size.mjs`)
  records each deletion's shrink as a separate ledger entry. A passing
  shrink is any delta that does not increase the current ratchet for
  the affected package. Each widget's deletion is a separate ledger
  entry so partial merges are auditable.
