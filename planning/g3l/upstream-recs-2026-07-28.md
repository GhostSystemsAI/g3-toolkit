# Upstream recommendations from prm-analyzer: dispositions

Source: the consumer slice's report of 2026-07-28, built against
round61 tarballs. Verdicts below are mine; ADOPTED items landed in
round 64b, FILED items carry a concrete plan, and one item is
partially declined with reasoning.

## P1 stylesheet never loads: AGREE, adopted in two parts

The report is right that silent unstyled rendering is a trap.
Adopted now: a dev-only console warning when the g3t design tokens
are absent from the document at first canvas mount, plus the
quickstart line in the README. NOT adopted: auto-injecting CSS
from the bundle entry. Injection breaks strict CSP setups and SSR
and takes the decision away from bundler-managed pipelines; the
loud dev warning gets the discovery benefit without the downside.

## P1 type declarations: AGREE, filed with a plan

Correct and embarrassing: `types` points at nothing. Plan: emit
declarations via a `tsc --emitDeclarationOnly` step per package
into dist (the codebase already typechecks strict), wire it into
the build script, and add a tarball check to verify. Filed rather
than rushed because a half-emitted declaration set is worse than
the consumer's shim; landing it deserves its own verified round.

## P1 element assembly race on ugm churn: AGREE, adopted

Their isolation is convincing (headless passes, browser fails
under prop churn; StrictMode widens the window). Adopted: the
element set is validated immediately before construction; edges
whose endpoints are missing from the assembled node set are
dropped with a console warning naming the edge. This converts a
fatal construction error into a self-healing warning. Their keyed
remount guidance stays valid as the consumer pattern for scene
switches.

## P2 interactionOptions: AGREE, adopted

`interactionOptions` prop on CytoscapeCanvas (wheelSensitivity,
minZoom, maxZoom, userPanningEnabled, boxSelectionEnabled)
forwarded into the constructor; content-keyed in the init deps so
option changes re-init deliberately.

## P2 NeighborhoodPopout encoding + camera: AGREE, adopted

This is also the owner's own VR-24 (popout fit + mismatched
shapes), found independently by both reviewers. Adopted:
`encodingSpec`, `stylesheet`, and `camera` ("fit" default with
padding, "center" opt-in) on the popout, forwarded to its canvas.

## P2 legend channels for line style and borders: AGREE, filed

The right long-term shape is spec channels for edge line style
and node border, which the legend then mirrors for free. Filed as
an encoding-spec extension; the manual-entries fallback is
declined because it turns the legend into a second source of
truth that can drift from the canvas.

## P2 optional peers statically imported: AGREE, filed

Dynamic import behind the timeline entry (or a subpath export) so
`vis-data`/`vis-timeline` become true optionals. Filed: touching
the export map and bundling deserves its own round with a packed
tarball verification.

## P2 distribution story: AGREE on the guide, owner call on publishing

The "consuming outside the monorepo" guide (stylesheet, peers,
overrides, keyed remounts) is adopted as a docs task. Whether to
publish to a registry is a project-owner decision; filed as a
question, not a task.

## P3 TreeView showBreadcrumb: AGREE, adopted

`showBreadcrumb` prop, default true.

## P3 StructuralSvgView fill mode: AGREE, filed

The measuring-host pattern already exists inside the demo shells
(SizedAdapter / SizedShapesSvg); the right move is promoting one
ResizeObserver wrapper into the library as an exported component
rather than adding a mode flag to the view. Filed.

## P3 findShortestPath directedness: AGREE, filed

Document current behavior and add a `directed` option. Filed
with the types round (same touch area, both are API-surface
changes worth shipping together).

## The guarantees section: adopted as documentation targets

All three named behaviors (edge property spread order, flow-axis
port side defaults, the exports map shape) are real invariants
worth pinning; they join the docs task above, and the port-side
default already has oracle coverage in the layout suite.

# Round-6 report dispositions (2026-07-28, second batch)

## P2 FloatingLegend vs spec: ALREADY RESOLVED, documented

The report was cut against round61; FloatingLegend has since been
rebuilt as SpecLegend-in-a-panel (it delegates entirely), so the
swatches ARE the spec now. The relationship note joins the docs.

## P2 multi-type pattern in demo code: AGREE, adopted

stampMultiTypePies, MULTI_TYPE_PIE_RULES, and MAX_SLICES promoted
to @g3t/react; the demo module re-exports from the library so
consumers stop copying it verbatim.

## P2 layout re-runs on prop identity churn: AGREE, adopted

Their static suspicion was half right and found a REAL current
gap: stylesheet identity was already ref-isolated (post-round61),
but the containment prop sat RAW in the init deps, so a host
rebuilding it per render re-initialized the canvas and discarded
positions: exactly the snap-back symptom. containment is now
content-keyed like layoutOptions, and the relayout contract is
documented on the props (only CONTENT changes to ugm, containment,
layout, layoutOptions, interactionOptions, edgeStyle, animate
re-init; stylesheet and encodingSpec changes are style refreshes).

## P2 compound verification matrix: AGREE, adopted (headless half)

compound-interactions.test.tsx verifies against real headless
cytoscape: parent nesting from edge-type containment, cxttap
targeting children not parents, per-element selection without
parent bleed, and sibling edges surviving conversion. Child drag
across parent bounds is renderer-driven and stays with the e2e
layer, noted in the file.

## P3 TreeView onSelect: AGREE, adopted

onSelect?: (id) fires alongside the internal selection store.

## P3 inspector titleAccessory: AGREE, adopted

titleAccessory?: ReactNode renders inline with the title, before
the close button.

## P3 tap-hold overlay: ALREADY RESOLVED

The default stylesheet already carries :active overlay-opacity
0.08 (post-round61); the styling docs note distinguishes
interaction overlays from semantic borders.

## Positives: adopted as documentation

The _color/_shape deterministic escape hatch joins the styling
documentation as the SUPPORTED path that survives spec-apply;
MenuItem icons and SpecLegend's collapsible header noted as
stable.

# Round-17 report dispositions (2026-07-28)

All four adopted. Three land as specified; R-4 lands with a
correction to its diagnosis, stated plainly below.

## R-1 click that ends a pan: AGREE, a real bug, fixed

Confirmed exactly as reported: onClick dispatched unconditionally
with no comparison against the pointer-down point, so a pan
beginning over an element fired onElementClick on release. The
hook now records the pointer-down MODEL point and suppresses a
click that travelled further than clickDragThreshold (default 4
model units, matching their workaround; 0 restores the old
behavior). Model space, not client space, so the threshold means
the same thing at every zoom. Four oracles: fires on a small
move, suppressed after a pan, threshold 0 escape, and a click
with no preceding pointerdown (synthetic/keyboard) still fires.
This was the right call to raise as P1: the SVG view is now the
DEFAULT structural renderer, so every consumer would have hit it.

## R-2 glyph slot with its own hit zone: AGREE, adopted

StructuralSvgView takes glyphs?: ReadonlyMap<string, { slot,
text, title? }>, drawn as a bordered box in the header strip with
class g3t-ssv-glyph (consumers style hover), data-ssv-glyph and
data-ssv-glyph-slot hooks, and a <title> tooltip. StructuralHit
gains zone: "glyph" plus glyphSlot, and GlyphSlot is exported
from core. Seam choice worth noting: the VIEW owns glyph geometry
(it draws them), so it passes a glyphAt probe into
hitTestStructural rather than core duplicating layout math; the
glyph is tested ABOVE the border band so an edge-adjacent glyph
stays reachable.

## R-3 two-line headers: AGREE, adopted

headerLines?: 1 | 2; at 2 the stereotype renders as its own
centred line (10px/500) above the name (12px/700), with
data-ssv-header-stereotype for testing. Default 1 leaves every
existing scene byte-identical.

## R-4 target-anchored routing: ADOPTED, with a corrected diagnosis

The report's premise is that each edge "is routed without knowing
how many others will arrive at the same side". That is not what
the current code does: the fan pass is GLOBAL and already
distributes both ends across their sides before any route is
computed, so arrivals do not stack (an oracle now pins this under
both modes). The REAL residual is the ordering INPUT: each end
sorted by the other node's CENTER, so on many-to-one flow every
source sorted against the same point and the spread carried no
information about where its edge actually arrives.

anchor?: "source" | "target" now selects which end resolves
first; "target" assigns arrivals, then orders source departures
by the ALREADY-ASSIGNED arrival coordinate, which is precisely
the "the source knows how much to spread" property requested.
Default "source" preserves existing scenes. Oracle: under
target-first, four sources converging on one sink arrive in the
same order as the sources themselves (no crossing at the sink).

Their workaround (one declared port per edge end) can be retired
where the port count was inflating high-degree nodes.

## The declaration-gap note: ACCEPTED, and it sharpens the plan

Their observation that three of four findings required reading
delivered SOURCE, and that R-1 was invisible from type signatures
alone, is the strongest argument yet for the d.ts item AND for
its companion: the interaction contracts (what suppresses a
click, what each hit zone means, which props are init-time-only)
cannot be expressed by types at all. The relayout contract is now
documented on the canvas props; the click-suppression and hit-zone
contracts are documented on the hook and the hit types. A
consumer-facing interaction-contracts section joins the
consumption guide when the d.ts round runs (owner queued it
behind polish).
