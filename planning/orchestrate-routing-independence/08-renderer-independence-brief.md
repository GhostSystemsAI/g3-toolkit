---
project: g3_toolkit
part_of: https://forge.tail515200.ts.net/ontology/kb/g3_toolkit/Plan/orchestrate-routing-quality-dense-scene-legibility-dependenc-33ea5324
---

# Brief 08: renderer independence — native canvas replaces cytoscape (Tier 3a)

Owner ruling (Jake, 2026-08-14, A15): complete dependency
independence INCLUDING the renderer. This supersedes brief 07's
"Tier 3 out of scope" clause. Clean-room rule unchanged: no cytoscape
source is read; behavior parity is defined by OUR conformance and e2e
suites, not by matching cytoscape internals.

## What already exists (verified in tree, 2026-08-14)

The native path is not greenfield:

- `canvas2d/display-list.ts` + `canvas-adapter.tsx` — RND-004 stage 1:
  pure buildDisplayList (conformance-tested) + a thin 2D-context
  replayer with HiDPI scaling and `hitTestScene` wiring.
- `views/conformance/adapter-conformance.test.tsx` — the cross-adapter
  contract suite (svg + canvas2d) that DEFINES renderer parity.
- `structural-svg-view.tsx` — the structural path already renders the
  g3t engine output with zero cytoscape.
- Core owns the semantics: StyleEngine/resolveStyles, visual
  attributes, LOD, hit-test, layouts (post 03-05 + 07 Tier 1). The
  cytoscape layer is projection + interaction, not intelligence.
- Public leakage is narrow: `GraphToolbar` imports `type { Core }`
  (the `cy` prop) — the one API contract that must break.

## Stages (each gate-green before the next)

1. **S1 usage audit**: enumerate every cytoscape API call in
   CytoscapeCanvas.tsx and friends (~96 references) into a capability
   matrix: needed / already-native / drop. Output checked into
   roadmap/design/renderer-capability-matrix.md.
2. **S2 scene + camera**: native scene component (force/general path)
   on the canvas2d adapter: nodes/edges from UGM via the existing
   attribute resolution (bypassing visual-attributes-to-cytoscape),
   cameraController pan/zoom (already renderer-agnostic), fit/zoom-to,
   Minimap reuse. Camera/position-stability doctrine (CLAUDE.md) is a
   conformance TEST here, not prose: same-graph prop changes never
   re-init, restyle only.
3. **S3 interaction parity**: element-pointer-events (already
   SceneHit-shaped), drag with routed-segment bypass, box selection
   (box-selection-sync is pure), multi-select, hover, context-menu
   anchoring, compound expand/drag semantics from the structural path.
4. **S4 style parity**: theme/spec/override/overlay/pin precedence
   (the five-mechanism doctrine) resolved entirely by core StyleEngine
   onto display-list ops; the g3t-ov-* class and bypass mechanisms
   become explicit attribute layers. Okabe-Ito + `properties._color`
   precedence per the haunt lesson.
5. **S5 layout wiring**: native scene consumes Tier-1 layouts (g3t
   layered, native force, tidy tree, preset). No fcose. Routing from
   brief 02/05 plugs in as segment ops in the display list.
6. **S6 cutover + deletion**: CytoscapeCanvas props surface moves to
   the native component behind the same name; `cy` escape hatch is
   replaced by a typed native renderer handle (breaking change,
   v2.0.0, migration note in wiring guide). Then cytoscape,
   cytoscape-fcose, @types/cytoscape are deleted from every
   package.json in the SAME PR (no-legacy). Dual-renderer existence
   is allowed only BETWEEN S2 and S6 inside this run.

## Verification

- adapter-conformance suite extended to the full scene component and
  passing on the native adapter (it is the parity definition).
- The e2e Playwright suites (canvas, interaction, selection, drag-
  reroute, toolbar) run against the native renderer and pass.
- render-settle-probe perf budget: native settle time <= cytoscape
  baseline on the Scale shell's collapsed view; record numbers.
- Bundle ledger: expect a large SHRINK (cytoscape+fcose leave the
  peer surface); record it.
- Visual acceptance: Zach on the Pages playground, all shells.

## Kept platform (not "extra" deps — the adoption contract itself)

react, react-dom, zustand stay: CLAUDE.md defines the three adopter
channels as zustand stores + props/callbacks + JSON documents; a React
component library replacing React is scope inversion. Dev-time
toolchain (vite, vitest, playwright, storybook, eslint) is not shipped
code and stays. Overridable by owner ruling only.
