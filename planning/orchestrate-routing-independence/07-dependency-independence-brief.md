---
project: g3_toolkit
part_of: https://forge.tail515200.ts.net/ontology/kb/g3_toolkit/Plan/orchestrate-routing-quality-dense-scene-legibility-dependenc-33ea5324
---

# Brief 07: dependency independence, Tier 1+2 (clean-room, no code ported)

Owner ask (Jake, 2026-08-14): "completely replace the github extra
dependencies without stealing their code." Rule for every item:
implement from the published algorithm/paper/spec, never from the
dependency's source; parity is proven by metric or test gate; the
dependency is DELETED from package.json in the same PR (no-legacy);
bundle ledger notes the delta.

## Verified current state (grep of packages/*/src, 2026-08-14)

- `elkjs` -- ALREADY GONE from source (structural.ts:35: "elkjs left
  the tree at D3b part 1, 2026-07-19, owner-authorized"). The root
  devDependency `elkjs ^0.11.1` is a vestige: delete it (W0).
- Runtime deps still imported: `@dagrejs/dagre` (dagre-layout.ts),
  `d3-force` (force-layout.ts), `d3-hierarchy` (hierarchy-layout.ts),
  `graphology` (ugm.ts MultiGraph), `graphology-communities-louvain`
  (collapse-by-cluster.ts:31), `expr-eval` (advanced.ts), `simple-
  statistics` (pipeline.ts:14), `fuse.js` (SearchBar.tsx:10),
  `cytoscape-fcose` (CytoscapeCanvas.tsx:21).

## Tier 1 -- layout engines (gated on briefs 03-05 landing)

- **W1 dagre**: after 03-05, `G3tLayeredLayout` is the layered
  engine. Parity gate: crossings/bends/box-violations within pinned
  tolerance of DagreLayout on the layout-engine test fixtures + all
  six lab scenarios. Then dagre-layout.ts is deleted, callers and
  the LayoutSwitcher entry route to g3t, `@dagrejs/dagre` removed
  from core deps AND root devDeps.

  W1 is a hard external dependency on briefs 03-05 and carries no
  independent timeline. If 03-05 slip, W1 does not ship in this
  brief's window; its unblocked Tier-2 items ship first and W1
  follows when the gate opens. W1 is listed here for ownership
  clarity only.

- **W2 d3-hierarchy**: clean-room tidy tree (Reingold-Tilford with
  Walker/Buchheim linear-time improvements, from the papers) inside
  the g3t engine; replaces hierarchy-layout.ts internals; same
  LayoutResult contract, existing tests are the gate.

- **W3 d3-force**: clean-room velocity-Verlet force sim (many-body
  via Barnes-Hut quadtree, link + center + collide forces, standard
  literature). Deterministic seeded RNG using the mulberry32 PRNG
  already in-tree.

  Parity gate: on the layout-engine test fixtures, node-overlap
  count must be less than or equal to ForceLayout's overlap count
  measured at the same seed; crossings must be within 10% of
  ForceLayout's count on graphs with 20+ nodes; energy convergence
  criterion is < 0.001 mean displacement per node per step at
  termination. These thresholds are pinned as numeric constants in
  the test file at the time W3 ships.

- **W4 cytoscape-fcose**: delivers a standalone ForceLayout engine
  that accepts LayoutInput and returns LayoutResult positions using
  the W3 sim with constraint support. The engine is wired into the
  existing LayoutSwitcher as a named option (replacing the fcose
  path). It does NOT integrate via cytoscape's preset layout
  mechanism; the integration path into any specific renderer is that
  renderer's responsibility.

  Ownership of cytoscape-fcose dep deletion is brief 08 (the native
  canvas2d renderer), consistent with the Tier 3 block below.
  W4's parity gate is settle-time budget (numeric: force iteration
  count measured on the standard fixtures, threshold pinned in test)
  plus visual sign-off (Zach) via the Pages playground. W4 ships
  when both pass; until then the cytoscape-fcose path remains.

## Tier 2 -- utility deps (independent of Tier 1, start immediately)

- **W5 simple-statistics**: pipeline.ts:14 imports exactly
  `linearRegression` and `rSquared` and no other simple-statistics
  symbols (grep-verified 2026-08-14). These are two closed-form
  formulas; implement in a small stats module with golden-value
  tests. Delete dep.

- **W6 expr-eval**: DerivedPropertyEngine needs arithmetic,
  comparison, boolean ops, property refs, and a function whitelist.
  Clean-room Pratt parser + evaluator over exactly that grammar
  (BONUS: closes the eval-surface of an unmaintained dep). Gate:
  existing derived-property tests + new grammar-edge tests (unary
  minus, nested calls, whitespace sensitivity) + a corpus of at
  least 10 real derived-property expressions sampled from the demo
  fixtures and wiring-guide examples, all evaluated identically under
  the clean-room parser as under expr-eval before deletion. Delete
  dep.

- **W8 graphology-communities-louvain** (depends on W9 -- do last in
  Tier 2): collapse-by-cluster.ts:31 feeds a graphology MultiGraph
  directly to the louvain import. The clean-room Louvain must accept
  the internal adjacency-map type defined by W9, not a graphology
  MultiGraph, so W8 cannot be integrated until W9 lands. Sequence is
  W9 first, then W8 against W9's adjacency-map interface.

  Implementation: clean-room from Blondel et al. (modularity + local
  move + aggregate loop), seeded/deterministic.

  Parity gate: planted-partition fixtures in
  collapse-by-cluster.test.ts must recover the planted communities
  exactly (exact partition match) on graphs with 50 or fewer nodes at
  the fixed seed; NMI >= 0.90 on the two larger fixtures (200+ nodes)
  where Louvain's approximate nature is expected. Both thresholds
  pinned as numeric constants in the test file at ship time. Delete
  dep.

- **W9 graphology (MultiGraph)** (do before W8): UGM already wraps
  it behind its own class (ugm.ts:13) -- replace with an internal
  adjacency-map structure implementing exactly the operations UGM
  uses. The audit of which MultiGraph operations UGM calls is a
  formal blocking deliverable for W9: produce an explicit list before
  writing the replacement. The UGM test suite is the gate. Largest
  Tier-2 item; the internal adjacency-map type it defines is the
  interface W8 consumes.

## Tier 3 (superseded 2026-08-14: now IN scope, briefs 08 + 09)

Owner ruling (Jake, A15): complete independence including the
renderer. `cytoscape` + `cytoscape-fcose` are brief 08 (native
renderer on the RND-004 canvas2d foundation); `echarts`,
`vis-timeline`/`vis-data`, `@tanstack/react-table`, `fuse.js` (W7),
and the demo-only `n3`/`jsonld` are brief 09. Only react, react-dom,
zustand, and the dev-time toolchain remain -- they are the adoption
contract, not extra deps (see 08 "kept platform").

fuse.js (SearchBar.tsx:10) is scoped to brief 09, not this brief.
No W7 implementation work appears in this brief.

## Dep deletion ownership (explicit)

Each dep is owned by exactly one brief:

| Dep | Owner brief |
|-----|-------------|
| elkjs (devDep vestige) | 07 (W0) |
| @dagrejs/dagre | 07 (W1) |
| d3-hierarchy | 07 (W2) |
| d3-force | 07 (W3) |
| simple-statistics | 07 (W5) |
| expr-eval | 07 (W6) |
| graphology-communities-louvain | 07 (W8) |
| graphology | 07 (W9) |
| cytoscape-fcose | 08 |
| cytoscape | 08 |
| fuse.js | 09 |

No dep appears in more than one brief's deletion scope.

## Rollback policy

Each W-item ships as an independent PR. If a post-merge regression is
discovered, the PR is reverted atomically; the dep re-enters
package.json with the revert commit. No item is batched with another
to avoid cross-item revert blast radius. For W6 (Pratt parser) and
W8 (Louvain) the existing test suites provide the regression surface;
a silent regression failing tests fails CI before merge.

## Verification (every W item)

- Existing test suite green untouched where the contract is "same
  behavior"; new golden tests where behavior is newly specified.
- `pnpm run gates` + bundle ledger (expect SHRINKAGE; record it).
- License hygiene: no source files from the replaced projects read
  during implementation; techniques cited by paper/doc reference in
  the module header. Attestation: each replacement module carries a
  comment block naming the paper/spec reference and affirming no
  source was read, serving as the per-module compliance record.
