---
title: "ACT Diagrams + Routing Flowcharts for MBSE Workbench"
model: claude-sonnet-4-6
kind: implementation
---

# ACT Diagrams + Drill-Down Routing Flowcharts

Add `"act"` (activity) diagram support to the MBSE workbench and populate it
with two faithful routing-engine flowcharts — one for the scene router and one
for the structural (g3t layered) router — so the library documents its own
engine inside the workbench it ships. Also wire glyph-based drill-down so a
BDD block that owns an act diagram shows a `▶` affordance the user can click
to open it.

## Current state (verified by reading source)

The following are ALREADY DONE:
- `StructuralNode.shape` field exists (`structural.ts:139`), with values
  `"rect" | "diamond" | "ellipse" | "initial" | "final" | "fork"`.
- `nodeShapeElement` in `structural-svg-view.tsx:189` already renders all six shapes.
- `DiagramType` already includes `"act"` (`model.ts:17`).
- `Diagram.activityGraph?` field already exists (`model.ts:121`).

The following are NOT YET DONE:
1. `diagrams.ts` has no `"act"` case in the switch (falls through to EMPTY).
2. `model.ts` has no `"act"` diagrams or "Routing Engine" package in the fixture.
3. `MbseShell.tsx` `DIRECTION` and `NOTATION` records have no `"act"` entries.
4. `MbseShell.tsx` `SizedStructuralSvg` passes no `glyphs` or `onElementClick`.
5. `ContainmentTree.tsx` `DIAGRAM_BADGE` has no `"act"` entry.
6. `styles.ts` has no `.mbse-badge-act` class.
7. `docs/wiring-guide.md` has no flowchart/activity-shapes section.
8. `examples/wiring/flowchart-activity.ts` does not exist.

## § 1  diagrams.ts — add `projectACT` and `"act"` case

<!-- kb:order=1 kb:model=claude-sonnet-4-6 -->

File: `src/demo/mbse/diagrams.ts`

Add a `projectACT` function that returns `diagram.activityGraph ?? EMPTY`.
Add `"act"` to the switch in `projectDiagram`:

```
case "act":
  return projectACT(model, diagram);
```

Where `projectACT` is:
```ts
function projectACT(
  _model: SysMLModel,
  diagram: Diagram,
): StructuralGraphInput {
  return diagram.activityGraph ?? EMPTY;
}
```

Also update the `default:` branch comment to note that `"act"` is now handled.

**Verification**: run `pnpm run typecheck` — the exhaustive DiagramType switch
must not have an implicit fallthrough warning. Run the existing `diagrams.test.ts`
to confirm no regression.

## § 2  model.ts — add "Routing Engine" package + two act diagrams

<!-- kb:order=2 kb:model=claude-sonnet-4-6 -->

File: `src/demo/mbse/model.ts`

### 2a. Scene Router activity graph (`dg.act.scene`)

Add to the `diagrams` record. Layout direction for this diagram is `"DOWN"`
(flowchart reads top-to-bottom). Use `shape` on plain nodes.

Node shapes:
- `initial` node for start
- `"rect"` for action nodes (default, no explicit shape needed)
- `"diamond"` for decision nodes
- `"final"` for the terminal

The Scene Router pipeline (faithfully from `route-scene-edges.ts`):

```
initial → "Collect node boxes & edge endpoint pairs"
         → [decision: self-loop?]
           → YES → "Skip edge (no route emitted)" → final
           → NO  → "Resolve source + target centers"
                  → "Infer cardinal side from relative position"
                  → "Inset obstacle boxes by grazeTolerance"
                  → [decision: mode = 'always'?]
                    → YES → "routeOrthogonal (A* with bend penalty)"
                    → NO  → [decision: straight line crosses inset box?]
                             → NO  → "Emit bezier (unrouted)"
                             → YES → "routeOrthogonal (A* with bend penalty)"
                  → final
```

Node IDs (use short kebab slugs):
- `sr.start`, `sr.collect`, `sr.selfloop`, `sr.skip`, `sr.resolve`,
  `sr.infer-side`, `sr.inset`, `sr.mode-check`, `sr.route-ortho`,
  `sr.cross-check`, `sr.bezier`, `sr.end`

Edge IDs: `sr.e1` through `sr.e12` (sequential).

Suggested node sizes: initial/final = `{ width: 20, height: 20 }`,
diamond = `{ width: 140, height: 60 }`, action rects get default sizing
(no explicit width/height — let the layout measure the header text).

### 2b. Structural Router activity graph (`dg.act.structural`)

The Structural Router pipeline (faithfully from `g3t-routing.ts`):

```
initial → "Collect obstacles (top-level boxes, not rows)"
         → "Sort edges; filter self-loops"
         → "Fan assignment: group by (node, side)"
         → "anchorOf: port vs. body attachment, VR-7f exposed-border walk"
         → "Three snap passes (box-box LR-21, port-port, mixed VR-8)"
         → "Compute stub endpoints"
         → [decision: useChannelRouter AND channelPlan?]
           → YES → "emitChannelRoute (additive channel router)"
           → NO  → "Build near-obstacle set"
                  → [decision: near.length ≥ longEdgeNear?]
                    → YES → "Perimeter detour (detourAround, VR-9/VR-10)"
                           → [decision: detour found?]
                             → YES → "Emit perimeter route (queue stagger)"
                             → NO  → "Escalation ladder (3 attempts, 80 ms)"
                    → NO  → [decision: bendHints exist for edge?]
                             → YES → "Seed interior route from LAY-005 hints"
                             → NO  → "Gap-midline simple route"
                          → [decision: intersects boxes?]
                             → NO  → "Accept simple route"
                             → YES → "Escalation ladder (3 attempts, 80 ms)"
         → [decision: escalation succeeded?]
           → YES → "Emit escalated route"
           → NO  → "VR-9 detour attempt"
                  → [decision: detour found?]
                    → YES → "Emit detour route"
                    → NO  → "Honest fallback: simple route stands"
         → "Post-pass: stagger coincident perimeter tracks"
         → [decision: nudge option?]
           → YES → "nudgeRoutes: corridor grouping + track separation"
           → NO  → (done)
         → final
```

Node IDs: `str.start`, `str.collect`, `str.sort`, `str.fan`,
`str.anchor`, `str.snap`, `str.stub`, `str.chan-check`, `str.emit-channel`,
`str.near`, `str.long-check`, `str.perimeter`, `str.perim-found`,
`str.emit-perim`, `str.escalate1`, `str.hint-check`, `str.hint-seed`,
`str.gap-simple`, `str.intersect-check`, `str.accept-simple`, `str.escalate2`,
`str.esc-found`, `str.emit-esc`, `str.vr9`, `str.vr9-found`, `str.emit-vr9`,
`str.honest-fallback`, `str.stagger`, `str.nudge-check`, `str.nudge`,
`str.end`

Diamond nodes: `str.chan-check`, `str.long-check`, `str.perim-found`,
`str.hint-check`, `str.intersect-check`, `str.esc-found`, `str.vr9-found`,
`str.nudge-check`

Assign `{ width: 160, height: 60 }` to all diamond nodes.
Initial/final: `{ width: 20, height: 20 }`.
Action nodes: no explicit size.

### 2c. "Routing Engine" package in the model root

Add to the `root.packages` array:
```ts
{
  id: "pkg.routing",
  name: "Routing Engine",
  diagrams: ["dg.act.scene", "dg.act.structural"],
}
```

Add `"dg.act.scene"` and `"dg.act.structural"` to the `diagrams` record.

Both diagrams have `type: "act"`. Use `context: "pkg.routing"` (the package id)
since act diagrams are not owned by a specific block.

**Verification**: `pnpm run typecheck`. The `activityGraph` field is
`StructuralGraphInput` — all node ids referenced in edges must exist in nodes.
Double-check the edge list before committing.

## § 3  MbseShell.tsx — `"act"` in DIRECTION + NOTATION + glyph drill-down

<!-- kb:order=3 kb:model=claude-sonnet-4-6 -->

File: `src/demo/mbse/MbseShell.tsx`

### 3a. Add `"act"` to DIRECTION

```ts
const DIRECTION: Record<DiagramType, "DOWN" | "RIGHT"> = {
  bdd: "DOWN",
  req: "DOWN",
  ibd: "RIGHT",
  par: "RIGHT",
  act: "DOWN",
};
```

### 3b. Add `"act"` to NOTATION

```ts
act: {
  title: "Activity Diagram",
  blurb:
    "Control flow through the g3t routing engine. Diamond = decision, filled circle = start, ringed dot = end. Two diagrams: Scene Router (direct-unless-crossing) and Structural Router (layered gap + escalation).",
  legend: [
    { mark: "◆", text: "decision node" },
    { mark: "●", text: "initial (start)" },
    { mark: "◎", text: "final (end)" },
    { mark: "──", text: "control flow" },
  ],
},
```

### 3c. Glyph drill-down

Build a reverse index: block id → diagram id for act diagrams that live in
the current satellite model. The `"act"` context field is set to the package
id (`"pkg.routing"`), so the drill-down affordance goes on the PACKAGE row in
the BDD, but the BDD doesn't show packages — skip that path for now. Instead,
expose a simple static glyphs map that adds a `▶` to any block in the current
BDD whose name matches a package with act diagrams. The simplest correct
approach: check every diagram, find `"act"` ones, map `context → diagramId`.

```ts
// Compute once per model (model is a static import, so this is module-level):
const glyphMap = useMemo(() => {
  const m = new Map<string, { slot: GlyphSlot; text: string; title?: string }>();
  for (const dg of Object.values(satelliteModel.diagrams)) {
    if (dg.type === "act") {
      // The act diagram context is the package id; we expose a ▶ glyph
      // on any node id that matches the context. Since the BDD shows blocks,
      // not packages, we add it to the "Routing Engine" package drill-in
      // by wiring the glyph on the structural diagram root block where
      // the user can spot it. For now, expose on EVERY node whose id
      // matches dg.context if present.
      m.set(dg.context, {
        slot: "top-right",
        text: "▶",
        title: `Open ${dg.name}`,
      });
    }
  }
  return m;
}, []);
```

NOTE: The BDD doesn't render the routing package nodes. The cleanest
integration is to add a static "Routing Engine" block to the BDD diagram
fixture (or a dedicated top-level "Router" node visible on the BDD) with an
owned act diagram. Simplest: add a plain placeholder block `router` to the BDD
(no compartments, just a header), add it to `dg.bdd.blocks`, and set
`dg.act.scene.context = "router"` / create a second act diagram owning
`dg.act.structural.context = "router"`. Then the glyph map puts `▶` on the
`router` block in the BDD. The user clicks it and the first act diagram opens.

**Simpler alternative**: skip the BDD integration for now. Add a "Routing
Engine" section to the containment tree (via the pkg.routing package), and
wire `SizedStructuralSvg` with a `onElementClick` handler for `"glyph"` zone
clicks. The model browser already shows the act diagram rows; clicking them
opens the diagram. The glyph drill-down is then a bonus layer, not the primary
path. Implement glyph drill-down ONLY if a block in the BDD has a matching
`context` in some act diagram.

**Implementation (full)**:

1. Add `glyphs` and `onElementClick` props to `SizedStructuralSvg` and thread
   them into `StructuralSvgView`:

```ts
function SizedStructuralSvg({
  scene,
  direction,
  glyphs,
  onElementClick,
}: {
  scene: { input: StructuralGraphInput; geometry: StructuralGeometry };
  direction: "RIGHT" | "LEFT" | "DOWN" | "UP";
  glyphs?: ReadonlyMap<string, { slot: GlyphSlot; text: string; title?: string }>;
  onElementClick?: ElementPointerHandlers<StructuralHit>["onElementClick"];
}) { ... }
```

Pass `glyphs` and `onElementClick` to `<StructuralSvgView ... />`.

2. In `MbseShell`, build the context-to-diagram reverse index and the glyph
   map. Wire `onElementClick`:

```ts
const actGlyphs = useMemo(() => {
  const m = new Map<string, { slot: GlyphSlot; text: string; title?: string }>();
  for (const dg of Object.values(satelliteModel.diagrams)) {
    if (dg.type === "act") {
      m.set(dg.context, {
        slot: "top-right",
        text: "▶",
        title: `Open: ${dg.name}`,
      });
    }
  }
  return m;
}, []);

const contextToDiagram = useMemo(() => {
  const m = new Map<string, string>();
  for (const dg of Object.values(satelliteModel.diagrams)) {
    if (dg.type === "act") m.set(dg.context, dg.id);
  }
  return m;
}, []);

const handleElementClick = useCallback(
  (hit: StructuralHit) => {
    if (hit.zone === "glyph") {
      const dgId = contextToDiagram.get(hit.elementId);
      if (dgId) setDiagramId(dgId);
    }
  },
  [contextToDiagram],
);
```

3. Add required imports: `GlyphSlot` from `@g3t/core`, `useCallback` from react,
   `ElementPointerHandlers` from `@g3t/react` (or from the pointer-events module).

**Verification**: `pnpm run typecheck`. In the browser (playground): the BDD
opens by default; if the `router` placeholder block appears in the fixture and
has its context matched, a `▶` glyph should be visible in its header. Clicking
it should switch to the first act diagram. The containment tree always works as
the primary navigation path for act diagrams.

## § 4  ContainmentTree.tsx — `"act"` in DIAGRAM_BADGE

<!-- kb:order=4 kb:model=claude-sonnet-4-6 -->

File: `src/demo/mbse/ContainmentTree.tsx`

```ts
const DIAGRAM_BADGE: Record<DiagramType, { label: string; hint: string }> = {
  bdd: { label: "BDD", hint: "Block Definition Diagram" },
  ibd: { label: "IBD", hint: "Internal Block Diagram" },
  par: { label: "PAR", hint: "Parametric Diagram" },
  req: { label: "REQ", hint: "Requirement Diagram" },
  act: { label: "ACT", hint: "Activity Diagram" },
};
```

**Verification**: `pnpm run typecheck`. The "Routing Engine" package and its
two act diagrams will appear in the model browser with `ACT` badges.

## § 5  styles.ts — `.mbse-badge-act`

<!-- kb:order=5 kb:model=claude-sonnet-4-6 -->

File: `src/demo/mbse/styles.ts`

Add after `.mbse-badge-req`:
```css
.mbse-badge-act { background: #4ade80; color: #052b0c; }
```

Green distinguishes activity diagrams from the existing blue/teal/purple/amber
palette.

**Verification**: `pnpm run lint`.

## § 6  Wiring guide + executable example

<!-- kb:order=6 kb:model=claude-sonnet-4-6 -->

### 6a. `docs/wiring-guide.md`

Add a new section "Flowchart / Activity shapes" after the existing structural
layout section. Content:

```md
## Flowchart / Activity shapes

`StructuralNode.shape` turns any plain node (no compartments) into a UML
activity glyph. The layout and hit-testing stay bounding-box regardless of
shape, so diamond decisions, ellipse actions, initial/final terminals, and
fork/join bars all participate in obstacle-aware routing exactly as rectangles
do.

\`\`\`ts
// See examples/wiring/flowchart-activity.ts for the executable twin.
import type { StructuralGraphInput } from "@g3t/core";

const graph: StructuralGraphInput = {
  nodes: [
    { id: "start", shape: "initial", width: 20, height: 20 },
    { id: "action", header: { name: "Do something" } },
    { id: "decide", shape: "diamond", header: { name: "OK?" }, width: 120, height: 56 },
    { id: "end", shape: "final", width: 20, height: 20 },
  ],
  edges: [
    { id: "e1", source: "start", target: "action" },
    { id: "e2", source: "action", target: "decide" },
    { id: "e3", source: "decide", target: "end", label: "yes" },
    { id: "e4", source: "decide", target: "action", label: "no" },
  ],
};
\`\`\`

Pass this as `activityGraph` on any `Diagram` with `type: "act"` in the MBSE
shell, or feed it directly to `layoutStructural` in your own shell.
```

### 6b. `examples/wiring/flowchart-activity.ts`

Create a new file — the CI-executed twin. It must:
- Import `StructuralGraphInput` from `@g3t/core`.
- Build a small valid flowchart graph (start → action → decision → end).
- Assert the node count and edge count.
- Run `layoutStructural` on it and assert the geometry has entries for all
  four node ids.

Template:
```ts
import { layoutStructural } from "@g3t/core";
import type { StructuralGraphInput } from "@g3t/core";
import assert from "node:assert";

const graph: StructuralGraphInput = {
  nodes: [
    { id: "start", shape: "initial", width: 20, height: 20 },
    { id: "action", header: { name: "Do something" } },
    { id: "decide", shape: "diamond", header: { name: "OK?" }, width: 120, height: 56 },
    { id: "end", shape: "final", width: 20, height: 20 },
  ],
  edges: [
    { id: "e1", source: "start", target: "action" },
    { id: "e2", source: "action", target: "decide" },
    { id: "e3", source: "decide", target: "end", label: "yes" },
    { id: "e4", source: "decide", target: "action", label: "no" },
  ],
};

assert.strictEqual(graph.nodes.length, 4, "4 nodes");
assert.strictEqual(graph.edges.length, 4, "4 edges");

const geo = await layoutStructural(graph, { direction: "DOWN" });
for (const id of ["start", "action", "decide", "end"]) {
  assert.ok(geo.nodes[id], `geometry entry for ${id}`);
}

console.log("flowchart-activity: OK");
```

**Verification**: `pnpm run verify` runs the wiring snippets in CI.

## § 7  Tests

<!-- kb:order=7 kb:model=claude-sonnet-4-6 -->

### 7a. `src/demo/mbse/diagrams.test.ts`

Add a test:
```ts
describe("projectACT", () => {
  it("returns activityGraph verbatim", () => {
    const g: StructuralGraphInput = {
      nodes: [{ id: "n1", header: { name: "A" } }],
      edges: [],
    };
    const model = {
      ...satelliteModel,
      diagrams: {
        ...satelliteModel.diagrams,
        "dg.test.act": {
          id: "dg.test.act",
          name: "Test ACT",
          type: "act" as const,
          context: "pkg.test",
          activityGraph: g,
        },
      },
    };
    const result = projectDiagram(model as SysMLModel, "dg.test.act");
    expect(result).toBe(g);
  });

  it("returns empty graph when activityGraph is absent", () => {
    const model = {
      ...satelliteModel,
      diagrams: {
        ...satelliteModel.diagrams,
        "dg.test.act2": {
          id: "dg.test.act2",
          name: "Test ACT empty",
          type: "act" as const,
          context: "pkg.test",
        },
      },
    };
    const result = projectDiagram(model as SysMLModel, "dg.test.act2");
    expect(result.nodes).toHaveLength(0);
    expect(result.edges).toHaveLength(0);
  });
});
```

### 7b. `src/demo/mbse/ContainmentTree.test.tsx`

Verify `"act"` renders a badge. Add a smoke test that renders a model with a
single act diagram and checks that the text "ACT" appears in the output.

### 7c. `src/demo/mbse/MbseShell.test.tsx`

If there is an existing test for diagram switching, add a case that selects an
act diagram from the containment tree and asserts the `ACT` badge appears in
the topbar.

**Verification**: `pnpm run test` passes all tests.

## § 8  Gates

<!-- kb:order=8 kb:model=claude-sonnet-4-6 -->

Run in order:
```sh
pnpm run typecheck
pnpm run lint
pnpm run verify
pnpm run test
python3 scripts/lint_specs.py specs/
python3 scripts/sync_spec_status.py
python3 scripts/check_roadmap_coverage.py
```

Or all at once: `pnpm run gates`.

Check `$?` directly — do NOT pipe through head/tail.

Bundle ledger: the `activityGraph` data is demo-local (not in packages/), so
there is no bundle impact. The `shape` field addition to `StructuralNode` is a
zero-cost optional field on an existing type. Verify the ledger script passes.

## § 9  CHANGELOG + planning log entry

<!-- kb:order=9 kb:model=claude-sonnet-4-6 -->

Add to `CHANGELOG.md` under the next unreleased heading:

```md
- feat(mbse): `"act"` activity diagram type with UML activity shapes
  (diamond/ellipse/initial/final/fork) and two routing-engine flowcharts
  (scene router, structural router) in the satellite model workbench;
  glyph `▶` drill-down from blocks that own an act diagram
```

Add a planning log entry to STATUS.md open-threads section summarizing what
landed and what is deferred (e.g. deeper escalation-ladder sub-diagram,
fork/join nodes for concurrent flows).
