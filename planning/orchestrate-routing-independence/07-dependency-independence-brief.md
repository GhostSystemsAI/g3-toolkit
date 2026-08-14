---
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

- `elkjs` — ALREADY GONE from source (structural.ts:35: "elkjs left
  the tree at D3b part 1, 2026-07-19, owner-authorized"). The root
  devDependency `elkjs ^0.11.1` is a vestige: delete it (W0).
- Runtime deps still imported: `@dagrejs/dagre` (dagre-layout.ts),
  `d3-force` (force-layout.ts), `d3-hierarchy` (hierarchy-layout.ts),
  `graphology` (ugm.ts MultiGraph), `graphology-communities-louvain`
  (collapse-by-cluster.ts), `expr-eval` (advanced.ts), `simple-
  statistics` (pipeline.ts), `fuse.js` (SearchBar.tsx),
  `cytoscape-fcose` (CytoscapeCanvas.tsx).

## Tier 1 — layout engines (gated on briefs 03-05 landing)

- **W1 dagre**: after 03-05, `G3tLayeredLayout` is the layered
  engine. Parity gate: crossings/bends/box-violations within pinned
  tolerance of DagreLayout on the layout-engine test fixtures + all
  six lab scenarios. Then dagre-layout.ts is deleted, callers and
  the LayoutSwitcher entry route to g3t, `@dagrejs/dagre` removed
  from core deps AND root devDeps.
- **W2 d3-hierarchy**: clean-room tidy tree (Reingold-Tilford with
  Walker/Buchheim linear-time improvements, from the papers) inside
  the g3t engine; replaces hierarchy-layout.ts internals; same
  LayoutResult contract, existing tests are the gate.
- **W3 d3-force**: clean-room velocity-Verlet force sim (many-body
  via Barnes-Hut quadtree, link + center + collide forces, standard
  literature). Deterministic seeded RNG — an improvement over d3's
  default; the mulberry32 test PRNG precedent already in-tree.
- **W4 cytoscape-fcose**: last and gated — replace the fcose default
  with the W3 sim + constraint support on the CytoscapeCanvas preset
  path (positions computed outside cytoscape, applied as preset).
  Parity gate is visual (Zach) + settle-time budget; fcose stays
  until BOTH pass.

## Tier 2 — utility deps (independent of Tier 1, start immediately)

- **W5 simple-statistics**: linearRegression + rSquared are two
  closed-form formulas; implement in a small stats module with
  golden-value tests. Delete dep.
- **W6 expr-eval**: DerivedPropertyEngine needs arithmetic,
  comparison, boolean ops, property refs, and a function whitelist.
  Clean-room Pratt parser + evaluator over exactly that grammar
  (BONUS: closes the eval-surface of an unmaintained dep). Existing
  derived-property tests + new grammar-edge tests gate. Delete dep.
- **W7 fuse.js**: SearchBar needs scored fuzzy match over small
  lists. Clean-room subsequence/trigram scorer with the same ranking
  tests. Delete dep.
- **W8 graphology-communities-louvain**: clean-room Louvain from the
  Blondel et al. paper (modularity + local move + aggregate loop),
  seeded/deterministic. Gate: planted-partition fixtures in
  collapse-by-cluster.test.ts recover communities. Delete dep.
- **W9 graphology (MultiGraph)**: UGM already wraps it behind its own
  class — replace with an internal adjacency-map structure
  implementing exactly the operations UGM uses (audit first; the
  UGM test suite is the gate). Largest Tier-2 item; last.

## Explicitly OUT of scope (Tier 3, separate threads)

- `cytoscape` itself — renderer independence is the RND-004/ARC-008
  canvas2d thread (stage 1 already in tree: canvas2d/canvas-adapter
  .tsx + display-list.ts). It proceeds on its own roadmap.
- `echarts`/`echarts-for-react` (charts), `vis-timeline`/`vis-data`
  (timeline, already optional peers), `@tanstack/react-table`,
  `zustand`, React itself: peer/optional surface, not "extra"
  engine deps. Revisit only after Tier 1+2 land.

## Verification (every W item)

- Existing test suite green untouched where the contract is "same
  behavior"; new golden tests where behavior is newly specified.
- `pnpm run gates` + bundle ledger (expect SHRINKAGE; record it).
- License hygiene: no source files from the replaced projects read
  during implementation; techniques cited by paper/doc reference in
  the module header.
