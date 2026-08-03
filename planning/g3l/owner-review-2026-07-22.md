# Owner local review, 2026-07-22 (the held routing/dev notes)

Tracked as LR-N. Disposition per item; nothing closes without an
oracle or an owner check.

## Landing (round 52 batch)
- LR-1 Landing header + sentence. [DONE round 52]
- LR-2 MBSE chip. [DONE round 52]
- LR-3 Repo link + icon. [DONE round 52 with PLACEHOLDER URL; real URL = OWNER INPUT, still open]
- LR-4 Holonic references. [DONE round 52: intro + capability strip]
- LR-5 Scope disclaimer. [DONE round 52]
- LR-6 Renderers stat. [DONE round 52: "3 renderers" in the strip]

## Visibility gating (round 52 batch)
- LR-7 Scale gating. [DONE round 52: hidden in dev; ?e2e=1 override]
- LR-8 Style Lab gating. [DONE round 52: dev-only for users; ?e2e=1 exposes it so the MR-7 oracles and the prod smoke keep their surface]

## Provenance Auditor
- LR-9 Kind/name collision. [DONE round 52: 8px gap]
- LR-10 Inspector container. [DONE round 60, both shells: bare inspector, own close, height cap]
- LR-11 Selection follow. [DONE round 60, both shells: render-time derivation]
- LR-12 SHACL fixture event. [DONE round 61: violation moved to the Hazard log; the timeline keeps its ending]

## MBSE SVG (the elk-style rendering/routing quality cluster)
- LR-13 Container move hit priority. [DONE round 54: row grabs drag their container; border grabs]
- LR-14 Centered sections. [DONE round 54]
- LR-15 Drag route collapse. [DONE round 54: RTE-011 live re-route over offset geometry]
- LR-16 Routes inside nodes. [DONE round 55: own-box obstacle for port ends]
- LR-17 Port-side approach. [DONE round 55: directional stubs]
- LR-18 Port labels + multiplicity. [DONE round 61: multiplicity end to end (type -> projection -> render + fixture values); labels/case from round 55. Deeper fixture research declined as scoped: parts/ports/connectors/multiplicity are all demonstrated]
- LR-19 Ports fully outside. [DONE round 55: engine placement; D2a contract updated]
- LR-20 Termination at port boundary. [DONE round 55: outer-face anchors]
- LR-21 Phantom bends. [DONE round 54: snap-to-alignment pass, both-ways oracle]
- LR-22 Label anchor on drag. [DONE round 54: same fix as LR-15]
- LR-23 Section separators. [DONE round 61: divider lines in the structural SVG]

## Supply Chain Digital Thread
- LR-24 Default zoom unreadable. [DONE round 53: 0.55 clamp]
- LR-25 SVG/Canvas adapters not at cytoscape parity (icons, zoom/pan, minimap link, encodings): SCOPING: adapters are static by design; owner call on interactive adapters. [owner ruling wanted]
- LR-26 Legend size/position. [DONE round 53: top-right, 12px; renderer-sync belongs to LR-25 scoping]
- LR-27 Thickness + color-by-confidence. [DONE round 53: three-mode control]

## Biomedical
- LR-28 Scatter axis labels. [DONE round 53]
- LR-29 Class-dot sync. [DONE round 53: localName keying]
- LR-30 Raw-triples wrap. [DONE round 52: nowrap]

## Analytics Dashboard
- LR-31 Options linkage. [DONE round 57: spacing drives fcose nodeSeparation; Re-run incremental is the round-16 ruling, explained]
- LR-32 Export dropdown. [DONE round 56: .g3t-menu styled; outside-click close for BOTH dropdowns]
- LR-33 Chart heights + axis labels. [DONE round 56]
- LR-34 Matrix under coverage. [DONE round 56: supersedes 8.4 placement, narrows 12.6]
- LR-35 Sankey fixture. [DONE round 61: Channel tier, five-stage branched flows]
- LR-36 Search clears on selection. [DONE round 56]
- LR-37 Icon/pin collision. [DONE round 58: editor icons bypassed composePinStack's _icon-data truth as flat styles; now unified, both symptoms explained by the one mismatch]
- LR-38 Expand Neighbors. [DONE round 52: removed with a removal oracle; View Neighbors covers the intent]
- LR-39 Focus fits the neighborhood. [DONE round 56]
- LR-40 Dot colors. [DONE round 60: inspector half landed r57; the DASHBOARD wiring had silently failed to write and was re-applied + grep-verified r60]
- LR-41 Widget geometry. [DONE round 57: absolute-in-canvas, supersedes 4.13; 260-vs-280 width root cause]
- LR-42 Custom color wheel. [DONE round 57]
- LR-43 Plurality. [DONE round 52: "Any {Type}"]
- LR-44 Status dismiss. [DONE round 57: unified model]

## Ontology Workbench
- LR-45 Inferred-toggle perf. [DONE round 59: same-graph preset replay; single projection build]
- LR-46 Shapes via SVG view. [DONE round 61: interactive StructuralSvgView + severity/closed decorations. Trade recorded: cytoscape context menu on shapes did not carry over]
- LR-47 Type-scope rethink. [DONE round 61: type-scoped overrides match ANY membership, not just primary]
- LR-48 Datagrid height jumps. [DONE round 53: gated filler rows]
- LR-49 Legend missing inferred types. [DONE round 53: all memberships collected]
- LR-50 Hops=1 lag. [PARTIAL round 59: re-init class removed for same-graph cases; hops=1-specific mechanism not pinned statically; stale-viewCore suspicion queued for owner repro]

## Round plan
52: backlog filed + landing batch + gating + small CSS budget items.
53: supply/bio/ontology small-medium batch.
Routing rounds A/B: the MBSE SVG cluster (LR-13..23).
Analytics round(s): LR-31..44.
Perf round: LR-45/50.
Owner rulings wanted: LR-3 URL; LR-25 adapter interactivity scope;
chunk warning a/b/c (standing).
