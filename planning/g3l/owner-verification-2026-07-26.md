# Owner verification results, 2026-07-26 (preview mode)

Tracked as VR-N. Screenshots referenced for IBD routing were NOT
received with the notes; working from described mechanisms until
re-attached.

## Inputs RESOLVED
- LR-3: repo URL = https://github.com/zwelz3/g3-toolkit [swap round 62]
- LR-25: RULED (i): keep static, label "preview", FIX FIT so the
  whole graph is visible. [round 62/63]
- Chunk warning: RULED (a) leave. [CLOSED]

## Regressions (mine, highest priority)
- VR-1 Drag-then-stuck. [DONE round 62: both hit-test call sites
  read the OFFSET geometry, matching the render]
- VR-2 Color by confidence. [DONE round 63, ROOT CAUSE from your
  browser run: rgb(85,91,99) IS the dark theme's edgeColor. The
  theme color rules pushed AFTER the encoding rules in the
  stylesheet merge, and cytoscape gives later rules the property,
  so the theme's plain edge line-color clobbered edge[_ecolor] in
  EVERY theme: the color mode never painted anywhere. The merge is
  now one exported pure function with a documented order contract
  (theme -> ENCODING -> overlay dim -> user), and a permanent
  presentation oracle asserts the COMPUTED amber/green through the
  REAL merge headlessly. Your e2e spec should now pass; a re-run
  confirms.]
- VR-3 Gray class dots. [DONE round 62, REAL root cause: the
  class color map filled via nodeColors.get(NODE id) against a
  TYPE-keyed map, so it was always empty; the type map is now used
  directly and root dots take encoding colors]

## Systemic
- VR-4 Toolbar options. [DONE round 63c, TWO mechanisms: (1)
  sliders only wrote state: NOTHING re-ran until an explicit Run
  or a layout switch, so every option control felt dead: option
  edits now apply LIVE (300ms debounce, incremental so the mental
  map holds); (2) hierarchy consumed only rankSeparation:
  breadthfirst's one spread knob is now driven by BOTH sliders,
  normalized to their defaults. Oracles: a debounce-and-apply
  test and a hierarchy both-sliders test.]
- VR-5 Dropdown truth. [DONE round 63c: GraphToolbar takes
  initialLayout; the ontology Hierarchy tab passes it (keyed on
  the inferred toggle, whose fcose switch remounts the toolbar in
  the matching state).]
- VR-6 Palettes: categorical colors too close beyond ~25 values;
  need a large-count palette strategy with sane small-count
  defaults (cat10-like). [round 64]

## MBSE SVG routing (round 63 cluster)
- VR-7 BDD routing. [DONE round 62, all three mechanisms plus
  four found beneath them: (a) universal 14px stubs and endpoint
  boxes as obstacles everywhere; (b) DOMINANT-AXIS side selection
  with side-relative fan tangents (E/W reachable under DOWN
  flow); (c) fans already sort by destination: the crossings came
  from (a)/(b). Beneath: the router's terminal check is now
  POINT-based (was cell-midpoint), its stub ladder ends at zero,
  the canvas reroute gained roomy-first clearance retries plus a
  FIXED-FACE SWING for jammed corridors, and the settle pass is
  wired identically to the drag pass (the two-call-site trap).
  Oracles: the screenshot-geometry test in g3t-layered.test.ts;
  the drag-integration suite passes the deliberate overlap drop
  clean]
- VR-7d/e/f. [DONE round 63b. The shared root was the SAME
  flow-vs-side residue as round 62's fan fix: (d) the simple
  TEMPLATE branched on the flow axis, so an E/W pair under DOWN
  flow got the four-bend vertical Z by construction; it now
  follows the side pair (horizontal Z / vertical Z / one-corner L
  for mixed), and near-aligned adjacent pairs collapse to a
  STRAIGHT line. (e) the snap pass likewise snapped the flow's
  cross coordinate; it is now side-relative (E/W pairs snap the
  shared Y, N/S the shared X). (f) sides now come from SIGNED
  BORDER GAPS (subsumes dominant-axis; correct under overlap),
  and anchors are EXPOSURE-AWARE: they slide to an uncovered
  stretch of the border and fall to the next-best side when a
  border is fully covered by the counterpart. Four new oracles
  pin the exact complaints, including straight-line collapse and
  the overlap escape.]
- VR-8 Straightening across views. [DONE round 63d for what is
  unifiable: MIXED pairs (one port, one box: the parametric
  bindings) now straighten, with the BOX anchor sliding to the
  declared port's tangent (ports stay put, the LR-21 principle).
  Pure port-to-port pairs keep their small jog by design: both
  ends are declared positions and cannot move; the 63b
  side-driven template keeps that jog minimal and centered. All
  four MBSE tabs share one router and one default set.]
- VR-9 IBD routing. [IBD SCREENSHOTS RECEIVED 2026-07-28, default
  view + post-move, both inadequate: long bus-like wraps into pin
  ports, doubled/overlapping parallel Power runs sharing
  corridors, and label collisions (Imagery/Cmd over din [1]; pout
  [1..3] under edges: the VR-10 case). round 63 with the VR-7d/e/f
  work]
- VR-10 Port labels vs edges. [LARGELY ADDRESSED round 63b by
  the inside placement: the wire exits the port OUTWARD while the
  label now sits INWARD, off the exit stub's path by
  construction. Owner check in IBD/parametric decides if a
  residual offset is still wanted.]
- VR-11 Padding scaling. [DONE round 63d, mechanism: not padding
  at all: the 7px/char width ESTIMATE is calibrated safe-high for
  short strings, so its overshoot vs a real proportional font
  accumulates absolutely with text length: sentence-length
  requirement rows gained ~60px of phantom width while OBC's
  short rows stayed tight. The estimate now tapers (24 chars at
  7, remainder at 5.8), with an oracle.]
- VR-12 BACKLOG (owner-scoped, not immediate): "compact"
  container row option so short labels don't waste row height.

## Supply (round 62/63)
- VR-13 Overall scale +40%: text, legend, node sizes; reduce
  node spacing.
- VR-14 Right panel wider by ~25% default.
- VR-15 (from LR-25 ruling) adapter fit: entire graph visible;
  "preview" label on SVG/Canvas adapters.

## Analytics (round 63/64)
- VR-16 Export dropdown STILL not matching layout dropdown style.
- VR-17 Chart axis names. [DONE round 63b: explicit nameTextStyle in primary ink, 12px semibold, all five axes; charts budget 7 -> 7.5 KB with rationale]
- VR-18 Matrix fill. [DONE round 63c: MatrixView fill prop (width 100%, fixed table layout, cells share columns); the rail passes it]
- VR-19 Inspector: toolbar-aware positioning (collides today) +
  width wide enough to avoid horizontal overflow (properties).
- VR-20 Inspector type chip color mismatch vs graph (persists in
  preview with default type coloring).
- VR-21 Inspector + Edit Appearance collide when both open; no
  repositioning affordance.
- VR-22 Pin clipped by node shape/boundary (may be a cytoscape
  constraint; investigate, may close as-designed).
- VR-23 Custom color lost when a node appearance is re-edited
  (editor does not initialize from the existing override).
- VR-24 View Neighbors popout: center-on-subject instead of fit;
  node shapes don't match the main graph.

## Auditor (round 62)
- VR-25 Kind chips. [DONE round 63b, real mechanism: the grid TRACK was 74px under an 88px-min-width chip, so the chip overflowed its track into the name; the track is now 96px and carries the gap]

## Shapes tab (round 62/63)
- VR-26 Shapes port labels. [DONE round 63b: local name cut at
  the last of #, /, or dot (URIs carry dots in the domain); and
  labels moved INSIDE their own container (UML convention), which
  also removes the run-over-adjacent-containers overflow]
- VR-27 Closed shapes. [DONE round 63d: the header now SAYS it
  («closed» keyword, the standard notation) on top of the heavier
  border; the shapes-tab oracle asserts both.]
- VR-28 Same drag-then-stuck as VR-1 (same root).

## Landing (round 62)
- VR-29 Landing spacing. [DONE round 63b: the removed header WAS the separation; a divider rule + 28px breathing above and below restores it without reintroducing text]

## Confirmed by the owner (no action)
Landing/gating content, supply zoom/legend baseline, ontology
datagrid/legend/SPARQL, MBSE ports-outside + multiplicity
content, auditor timeline ending, analytics items not commented.

## Owner batch 2026-07-28 (evening)

DONE this round (64a):
- VR-2b color-mode REVERT: a spec change dropping a channel now
  CLEARS that channel's stale element data (_ecolor/_ewidth,
  _color/_icon/_size), so leaving Color actually reverts; oracle
  extended to assert the revert through the real merge.
- VR-2c legend: the edge COLOR channel had no legend
  representation at all; SpecLegend now renders categorical edge
  color rows (line swatches with band labels).
- VR-27 v2: keyword dropped per ruling; OPEN shapes draw a dashed
  border (6 3), closed stays solid + heavier; oracle asserts the
  dash and the keyword's absence. Scoped to scenes that
  distinguish (closedContainers provided): MBSE unaffected.
- G1 port labels v3: OUTSIDE the container beside the port
  (inside placement sat on container rows), offset PERPENDICULAR
  to the port axis to clear the wire.
- G2: userSelect none on the structural SVG root (drag no longer
  sweeps text into the browser selection).
- VR-29 v2: divider line removed, breathing room kept (40px).
- Toolbar: the popover's "Run layout" removed as redundant under
  live apply; the toolbar Re-run stays as the explicit control.
  The stale-premise test (edits inert until Run) rewritten.
- VR-17b: axis TICK labels also to primary ink (all six sites).

FILED for round 64b:
- G3 Analytics fills: degree/scatter/table not filling parent
  vertical space; datagrid clipped horizontally; matrix cells
  should square UP (height follows column width when space
  allows).
- G4 Ontology neighborhood tab should DEFAULT to hierarchy; and
  the hierarchy layout does not rank by hops the way the class
  tree does (breadthfirst ranks need roots/eval: investigate
  against the tree view).
- G5 legend rectangle swatch off-scale vs other icons.
- Shapes edge predicates: still full URIs, and placed at route
  bends; wanted at source/target ends with offset/alignment
  (label placement mode + projection localName).
- Parametric demo enhancement: represent value properties (e.g.
  payload.powerDraw) as container + port for demonstration.
- VR-2d: owner re-verify of Off/Dim revert + legend rows in
  preview.

VR-9 IBD (screenshots RECEIVED 2026-07-28 evening, default +
post-move): three mechanisms filed: (1) mid-height edges pass
THROUGH intermediate containers (power's pout runs through
payload and obc bodies): consistent with the scene router
failing in dense port corridors and the escalation FALLING BACK
to the unrouted simple template, which ignores obstacles: the
fallback must detour, not surrender; (2) edge labels at bends
collide (Imagery over Cmd at the adcs corner): the end-anchored
label placement item, general, not shapes-only; (3) parallel
Power runs share corridors along the bottom sweep. Owner notes
routing "much improved" overall (BDD). [ROUND 64c: mechanism (1)
FIXED: the router-failure fallback now detours around the
near-obstacle band instead of surrendering to the obstacle-blind
simple template; unit + integration oracles. (2) end-anchored
labels remain filed for 64d. (3) expected to improve with (1):
the corridor-sharing runs were the fallback's product; owner
re-verify on a fresh IBD look.]

Upstream prm-analyzer report (same date): dispositions in
upstream-recs-2026-07-28.md; adopted subset landed in 64b.
