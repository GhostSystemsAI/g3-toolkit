# Owner queue

Current as of round 65 (g3-toolkit-g3l-round65.zip). History in
CHANGELOG.md; dispositions in owner-verification-2026-07-26.md,
upstream-recs-2026-07-28.md; the pattern recipes in
docs/structural-patterns.md.

## 0. v1.0.0 release readiness (this round)

I audited the repo for release rather than assuming it was ready.
Everything below is done; what remains is YOURS.

Fixed, and each was a real consumer-facing defect:

- `import "@g3t/react/style.css"`, the line the upstream team
  asked us to put first in the quickstart, did NOT typecheck under
  node16 resolution. The package now ships a typed CSS entry. The
  README snippet gate caught it the instant the line went into the
  quickstart.
- There was no consumer install path at all: the README documented
  monorepo commands only, and nothing anywhere mentioned the
  stylesheet. Added an Install section plus
  docs/consuming-g3t.md, which is the "consuming outside the
  monorepo" guide the upstream reports asked for twice: peers,
  overrides for vendored tarballs, which props re-run layout, the
  interaction contracts, the styling escape hatch, known limits.
- Added verify:package to the verify chain: every entry point in
  every published package must exist after a build and files[]
  must not claim absent files. 77 verified.
- Stated the stability and deprecation policy in the README, and
  wrote RELEASE.md (what the tag does, the pre-tag checklist, and
  a post-publish verification from OUTSIDE the monorepo).
- Bumped rc.2 to 1.0.0 everywhere, refreshed the lockfile,
  de-brittled the stale component-count claim.

Checked and found already sound: .gitignore (root-anchored with a
documented reason, covers every artifact present), LICENSE and
NOTICE per package, the publish workflow (tag-driven, correct
publish order, provenance), no TODO/FIXME in published source, no
stray debug logging outside stories. The round-61 upstream claim
that declarations are unemitted is stale: verify:types has gated
consumer type resolution under both node16 and bundler for some
time, and now proves it every run.

What is still yours before tagging:

1. The deferred review walk. Supply first (my 64b guard
   regression), then MBSE under the SVG default. I would not tag
   before that walk; several rounds of fixes are unverified in a
   browser.
2. The registry decision. You deferred publishing ("not yet"),
   and the workflow only fires on a tag, so v1.0.0 can sit
   tagged-but-unpublished if you prefer.
3. Optional: the d.ts round is no longer release-blocking (it is
   already emitting and gated), so it can stay queued.

## 0a. Earlier: the round-17 downstream requests (all four adopted)

R-1 was a real bug and worth their P1: a pan starting over an
element fired a click on release, on what is now your DEFAULT
structural renderer. Fixed with a zoom-invariant threshold. R-2
adds per-node glyph affordances with their own hit zone (a
consumer can make something visibly clickable); R-3 adds
two-line UML headers behind headerLines=2; R-4 adds
anchor: "source" | "target" to the router. On R-4 I disagreed
with their diagnosis and said so in the dispositions: fans
already spread both ends globally, so arrivals never stacked;
the real gap was that sources sorted against the target's CENTER
rather than against the arrival each edge was assigned. All
defaults preserve existing scenes.

## 0b. Earlier: the round-6 downstream report, dispositioned

All verdicts are appended to upstream-recs-2026-07-28.md. Adopted:
containment content-keying (their snap-back report found a real
gap: a per-render containment object was re-initializing the
canvas and discarding positions), multi-type promoted to
@g3t/react, a headless compound verification matrix, TreeView
onSelect, inspector titleAccessory. Already resolved post-round61,
no code: FloatingLegend now delegates to SpecLegend wholesale;
the tap-hold overlay already ships subtle (0.08).

## 1. Your three directives, landed last round

- Cytoscape-structural is DEPRECATED: the MBSE shell now defaults
  to SVG (cytoscape stays as a labeled deprecated escape hatch
  until you rule removal), and the canvas's structural prop warns
  in dev. One consequence worth checking before anything else:
  the drag-route FLICKER you filed lives in the deprecated
  path's attachment code; the SVG renderer re-routes fully per
  drag and may simply not have the problem. If SVG drags
  smoothly, the flicker closes without a fix.
- Congestion sizing, first increment: sides grow for their
  attachments. Declared ports are exact (five WEST ports force
  the height); box-edge fans get a degree-based floor. If you
  find a case where one side still crowds (the floor assumes at
  most half a node's degree lands on one side), say so and the
  side-exact second pass goes in.
- The pattern catalog: docs/structural-patterns.md names five
  recipes including "containment with ports", each with the
  guaranteed behaviors, and every guarantee runs as an executable
  oracle (structural-patterns.test.ts): pattern regressions fail
  CI, not your reviews.

## 2. The review you deferred: what to walk, in order

- Supply FIRST (my 64b guard ate facility nodes; fixed in 64e).
  Then the Color/Dim/Off revert + confidence legend rows.
- MBSE under the NEW SVG default: BDD/IBD drag, routing,
  labels: this is now the path all four tabs use by default.
  Report flicker here specifically.
- The 64e items: legend star/barrel glyphs + rectangle, matrix
  squares, stats chart ink, parametric straightening, IBD label
  quadrants.

## 3. Standing items

- Registry publishing deferred; d.ts emission queued (your
  calls). Upstream backlog filed: line-style/border channels,
  peer isolation, consumption guide, SVG fill wrapper,
  findShortestPath option.
- Cytoscape-structural REMOVAL awaits your ruling after the SVG
  default proves out.
- VR-12 parked; D3b part 2 queued.

---

If a step here is unclear, say which number; the entry gets
rewritten, not defended.
