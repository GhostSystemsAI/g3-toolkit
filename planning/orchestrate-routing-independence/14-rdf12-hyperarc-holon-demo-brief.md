---
project: g3_toolkit
part_of: https://forge.tail515200.ts.net/ontology/kb/g3_toolkit/Plan/orchestrate-routing-quality-dense-scene-legibility-dependenc-33ea5324
supersedes_note: refines brief 13 (13-holon-rdf12-examples-brief.md) with current ground truth — the RDF 1.2 parser is now LIVE on this branch, so this is a real rendered demo, not doc-first.
---

# Brief 14: RDF 1.2 triple terms as hyperarcs — a separate holon demo

Owner ask (Jake, A79): "yes [build the RDF 1.2 demo], look at hyperarcs,
and build separate holon."

## Ground truth (verified this session, not brief-13's stale assumption)

Brief 13 assumed RDF 1.2 parsing was gated behind PR #4 on another
branch. That is NO LONGER TRUE — it is live on THIS branch:

- `packages/core/src/adapter/sparql-adapter.ts` parses RDF 1.2 triple
  terms today (`RdfTerm` union has a `triple` variant; `TripleTerm`
  interface; `tripleTermToValue` recurses losslessly). Commits
  1a9555a / 97df361 / d96546d.
- BUT triple terms never become graph STRUCTURE. In `bindingsToUGM`:
  - a triple-typed SUBJECT is SKIPPED outright (line 235: "a
    triple-typed subject would need its own reification handling —
    out of scope here");
  - a triple-typed OBJECT is stored as a serialized PROPERTY on the
    subject node (lines 256–262), never drawn.
  So `<< s p o >>` round-trips into data but renders as nothing.

- "Hyperarcs" as a first-class concept DO NOT EXIST in the toolkit.
  The only "hyper" in the tree is `elk-import.ts`, where multi-endpoint
  hyperedges are explicitly REDUCED to their first two endpoints with a
  BAD_SHAPE diagnostic (line 108) because "the document's edge model is
  binary." The UGM edge model is source→target binary; there is no
  n-ary edge primitive.

- Reference machinery already present: `reificationCollapse`
  (projection/transforms.ts:212) folds classic rdf:Statement reification
  INTO edge metadata — the exact inverse of what we want. It is the
  model for statement↔edge projection.

- Demo architecture (Demo.tsx + DemoLanding.tsx): a scenario = an entry
  in `SCENARIOS` or `CAPABILITY_SURFACES` (id/title/subtitle/…/tags) +
  a lazy shell in `SHELL_MAP`. The existing holon demo is a TAB inside
  `OntologyShell`, not its own scenario. "Separate" per the owner ask =
  its own top-level card + shell.

## The core idea (hyperarc == holon-shaped statement)

Because the edge model is binary, a hyperarc renders as a **reified
statement pseudo-node**: the quoted triple `<< s p o >>` becomes one
node (glyph: diamond, `_rdfStatement: true`) with binary arcs
statement→subject and statement→object, predicate as the statement
label. Meta-assertions ABOUT the triple (`<< s p o >> :confidence 0.9`,
`:source …`, `:validFrom …`) attach to that statement node — which is
precisely a hyperarc (an assertion whose endpoint is itself an
assertion).

This is holon-shaped: the statement node is a BOUNDARY; its s/p/o is the
INTERIOR. Drill-in on a statement hyperarc opens the s-p-o triple. That
fuses the owner's two words ("hyperarcs" + "holon") into one surface.

## Work

1. **Core: a hyperarc projection (pure, testable, additive).**
   New function in core (e.g. `packages/core/src/projection/hyperarc.ts`)
   `projectTripleTermsToHyperarcs(dataset) -> UGM`: emits statement
   pseudo-nodes + subject/object arcs + meta-property folding. Do NOT
   mutate `bindingsToUGM`'s existing binary behavior (adapter tests
   depend on it) — this is an opt-in projection. Nested triple terms
   (`<< << … >> p o >>`) recurse.

2. **Data: one dataset, two encodings.** `constellation.trig` (RDF 1.2
   `<< >>` triple terms — forward form) and `constellation-reified.ttl`
   (standard reification — the migration twin). ~30 triples: a small
   satellite constellation with confidence/provenance/effective-time
   meta-assertions on the inter-holon portal edges.

3. **Demo: a separate scenario.** New card in `CAPABILITY_SURFACES`
   (id `rdf12-hyperarcs`) + `src/demo/rdf12/Rdf12Shell.tsx` +
   `SHELL_MAP` entry. Renders the constellation with statement hyperarcs
   drawn as diamonds; meta-confidence drives the existing
   `edge[_confidence]` opacity channel; clicking a statement drills to
   its s/p/o interior (holon framing).

4. **Wiring guide + CI twin.** A `docs/wiring-guide.md` section with a
   CI-executable twin in `examples/wiring/` (channel rule), showing an
   adopter the hyperarc projection call.

## Constraints

- No new runtime dependencies. Reuse UGM, projection, existing style
  channels.
- No-legacy: add the hyperarc projection alongside; do not fork or
  weaken `bindingsToUGM`.
- Data-mapped style props stay on `[field]`-scoped selectors
  (`node[_rdfStatement]`, `edge[_confidence]`) per CLAUDE.md — never a
  bare `node`/`edge` rule (per-frame Cytoscape warning flood).
- Same-graph camera/position stability holds (CLAUDE.md doctrine).

## Acceptance

- `pnpm run gates` green (typecheck && lint && verify && test),
  including the new wiring twin and a `hyperarc.test.ts` unit oracle
  (statement node count, arc endpoints, meta fold, nested recursion).
- `constellation.trig` verified parseable by pyoxigraph 0.5.9 (command +
  output recorded in the doc, with date/version); `-reified.ttl`
  round-trips the projection pipeline in the twin.
- Statement hyperarcs render as pseudo-nodes; confidence visibly drives
  opacity; drill-in opens the s/p/o interior.
- New scenario is a landing-page card reachable in the playground.

## Rollback

Additive: new files + two array entries + one guide section. Single
revert.
