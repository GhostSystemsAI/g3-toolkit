---
project: g3_toolkit
part_of: https://forge.tail515200.ts.net/ontology/kb/g3_toolkit/Plan/orchestrate-routing-quality-dense-scene-legibility-dependenc-33ea5324
---

# Brief 12: holon boundary + projection representation

Owner ask (Jake, A29): "is there anything space you can do for holon
representations and boundary/projection space."

## What exists (verified 2026-08-14 against holonic-adapter.ts)

`HolonicAdapter` (packages/core/src/adapter/holonic-adapter.ts) names
the four-graph model — Interior, Boundary, Projection, Context — in
its Holon docstring, but implements only two projections:
`projectToLPG()` (holons as flat nodes, portals as edges, with
`_isHolon`/`_portalCount` marker properties) and
`projectHolonInterior()` (flat interior LPG). **Boundary and
Projection have no data shape and no rendering.** Portals are plain
edges; nothing represents WHERE on the holon's boundary a portal
attaches or WHAT the holon exposes versus hides.

## Design direction (negotiable — iterate with Jake before dispatch)

The structural view already has the exact machinery a boundary needs:
declared ports with port-based body-edge attachment and perpendicular
exit (landed, see CLAUDE.md open threads). Map the holonic model onto
it:

- **Boundary = the block perimeter.** A holon renders as a structural
  block; its boundary graph is the ordered set of ports on that
  perimeter.
- **Portal = a declared port** (not a bare edge endpoint). Portal
  edges attach at their port, giving portals a stable, legible
  location; `_hasConstruct` portals get a distinct port glyph.
- **Projection space = the exposed subgraph.** New
  `projectHolonBoundary(holon)`: what the holon PUBLISHES — boundary
  nodes (port-adjacent interior nodes) + portal stubs — as a UGM,
  sitting between `projectToLPG` (opaque) and
  `projectHolonInterior` (fully open). This is the three-level
  drill: holarchy → boundary/projection → interior.
- **Context stays out of scope** for this brief (it needs the
  backend-connected adapter; R5.1 is honestly tracked as unmet).

## Work

1. **Data shape** — extend `Holon` (additive, optional fields):
   `boundaryNodeIds?: string[]` (interior nodes exposed at the
   boundary) and on `Portal`: `boundaryNodeId?: string` (which
   exposed node the portal transits). No breaking change to
   existing datasets.
2. **Core** — `projectHolonBoundary(holon): UGM` on the adapter;
   holons-as-structural: a `holonsToStructural(dataset)` mapper
   producing structural blocks with one declared port per portal
   (reuse the structural input types from layout/structural.ts).
3. **React** — drill state: holarchy view → double-click/context-menu
   "Open boundary" → boundary view → "Open interior". Wire through
   the existing holonic-portal-menu (R5.4 data side already done).
4. **Demo** — the ontology shell (src/demo/ontology/) gains a small
   holonic fixture exercising all three levels.
5. **Docs** — specs/05-integration-holonic.md status updates (R5.2/
   R5.3 partial-scope notes), wiring-guide section + executable twin.

## Acceptance

- Boundary view renders a holon as a structural block with portals as
  ports; interior/boundary/holarchy round-trip preserves camera per
  the D15 stability doctrine (same-graph = no refit).
- Existing HolonicDataset fixtures (no boundary fields) render
  exactly as today (additive-only proof: adapter tests unchanged).
- `pnpm run gates` green.

## Rollback

New exports + optional fields only; single revert.
