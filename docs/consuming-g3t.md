# Consuming g3-toolkit outside the monorepo

Everything a host application needs that is not obvious from the
type signatures. Written because consumers reported losing review
rounds to each item below.

## Install

```bash
pnpm add @g3t/core @g3t/react
# charts are optional
pnpm add @g3t/charts
```

Peer dependencies are NOT installed for you. `@g3t/react` peers:
`react`, `react-dom`, `cytoscape`, `cytoscape-fcose`, `zustand`,
`echarts`, `vis-timeline`, `vis-data`. `@g3t/charts` peers:
`react`, `echarts`. `@g3t/core` peers: `graphology`.

## Import the stylesheet, first

```ts
import "@g3t/react/style.css";
```

The packages ship CSS as a separate file (standard Vite
library-mode output) and the bundle does not import it for you:
auto-injection breaks strict CSP setups and server rendering, so
the decision stays with your bundler. Without this line every view
renders unstyled, with no error and no warning. In development the
canvas logs a one-time warning when the design tokens are absent
from the document, which is the fastest way to spot a missing
import.

## Which props re-run layout

A full re-initialization (layout re-runs; arranged positions are
discarded unless the same-graph preset replay applies) is triggered
ONLY by CONTENT changes to: `ugm` identity, `containment`,
`layout`, `layoutOptions`, `interactionOptions`, `edgeStyle`,
`animate`.

`stylesheet` and `encodingSpec` changes are STYLE REFRESHES and
preserve positions.

`ugm` is compared by IDENTITY: a new instance means "different
graph". Memoize it in the host; do not rebuild it per render. The
object-valued props above are content-keyed internally, so an
inline literal rebuilt each render is safe.

For scene switches (a different diagram, a different subject),
prefer a keyed remount over mutating props:

```tsx
<CytoscapeCanvas key={sceneId} ugm={ugm} />
```

## Interaction contracts

These are the parts of the API consumers most reliably get wrong,
and types cannot express them.

- **Clicks that end a pan are suppressed.** `useElementPointerEvents`
  records the pointer-down point and drops a click whose pointer
  travelled more than `clickDragThreshold` model units (default 4).
  Pass 0 to restore fire-always. Model units, so the threshold
  behaves identically at every zoom.
- **Hit zones.** Structural hits report `zone`: `header`, `body`,
  `border`, `segment`, `port`, `row`, `glyph`. `glyph` is an
  affordance drawn in the header strip and is tested ABOVE the
  border band, so an edge-adjacent glyph stays reachable. Restrict
  navigation to the zone you mean; targeting `body` makes the whole
  box clickable, which readers cannot see.
- **Init-time-only options.** `interactionOptions`
  (`wheelSensitivity`, `minZoom`, `maxZoom`, `userPanningEnabled`,
  `boxSelectionEnabled`) are constructor options in cytoscape;
  changing them re-initializes the canvas by design.

## Styling escape hatch

The `_color` and `_shape` data channels, set through the node
properties spread, are the SUPPORTED deterministic styling path.
They survive whatever the spec-apply pipeline does, so a host that
needs a guaranteed color for a node can set them directly rather
than racing the encoding spec.

Encoding-managed keys (`_ecolor`, `_ewidth`, `_color`, `_icon`,
`_size`) are CLEARED when a spec drops the channel that owns them,
so leaving a mode reverts cleanly.

Stylesheet merge order (later rules win the property): defaults,
curve style, chrome, theme colors, structural theme colors,
ENCODING rules, overlay/dim, YOUR stylesheet, hidden filter. Your
rules beat everything except the visibility filter.

## Structural scenes

Use `StructuralSvgView`. The `structural` prop on `CytoscapeCanvas`
is deprecated and warns in development. See
[structural-patterns.md](./structural-patterns.md) for the five
supported recipes and the behaviors each guarantees.

## Unpublished / vendored consumption

If you are consuming tarballs rather than the registry:

```bash
pnpm pack   # in each package directory
```

`pnpm pack` rewrites `workspace:*` ranges. Because `@g3t/react`
depends on `@g3t/core`, pin both to the same instance in the host's
manifest, or the two packages resolve to different copies and the
theme store silently splits:

```json
{
  "overrides": {
    "@g3t/core": "file:./vendor/g3t-core-1.0.0.tgz"
  }
}
```

## Known limitations

- Typed CJS consumption (`require` from a `.cts` file) is not
  supported pending declaration bundling. Runtime CJS works and is
  smoke-tested; ESM and bundler resolution are gated in CI.
- `vis-timeline` and `vis-data` are statically imported by the
  react bundle, so they must be installed even when no timeline
  view is used. Subpath isolation is planned.
