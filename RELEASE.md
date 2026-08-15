# Releasing g3-toolkit

## What the tag does

`.github/workflows/publish.yml` fires on `v*` tags. It installs
frozen, runs typecheck, verify, and test, then publishes in
peer-dependency order (core, react, charts) with npm provenance.
`pnpm --filter ... publish` rewrites `workspace:*` ranges to real
versions, so nothing needs hand-editing before the tag.

## Before tagging

1. Versions agree. Root and all three packages carry the release
   version; `pnpm install --lockfile-only` has been run so the
   lockfile matches. The README title states the same version.
2. `pnpm run gates` is green: typecheck, lint, verify, test, and
   the spec gates. `verify` includes `verify:package` (every entry
   point in every package's exports map exists after a build, and
   files[] claims nothing absent), `verify:types` (consumer type
   resolution under node16 AND bundler), `verify:smoke` (runtime
   subpath resolution through Node), `verify:peers` (no optional
   peer is statically reachable from an entry point that is not
   documented as requiring it), and `verify:snippets` (every README
   code block typechecks as written).
3. `NPM_TOKEN` is present in repository secrets.
4. CHANGELOG has an entry for the version.

## After tagging

Verify the published artifact from outside the monorepo rather
than trusting the build:

```bash
mkdir /tmp/g3t-consumer && cd /tmp/g3t-consumer
pnpm init && pnpm add @g3t/core @g3t/react react react-dom \
  cytoscape cytoscape-fcose zustand graphology echarts
```

That list is the REQUIRED peer set and nothing more. `echarts` is on
it because the stats view is reachable from the root barrel; a recipe
that omits a required peer fails on its first import, which is
exactly the class of break this step exists to catch. Do NOT add
`vis-timeline` or `vis-data` here: they are optional peers, and the
point of the check is that the documented install resolves without
them.

Then confirm, in a scratch file:

- `import "@g3t/react/style.css"` compiles and the tokens land on
  `:root` (the canvas warns in dev when they do not).
- `import { CytoscapeCanvas } from "@g3t/react"` resolves with
  types under the consumer's own `moduleResolution`.
- Every other subpath resolves too: `@g3t/react/views`, `/controls`,
  `/state`, `/theme`, `/a11y`, `/icons`. None of them may need an
  optional peer.
- `import { TimelineView } from "@g3t/react/timeline"` fails with
  `ERR_MODULE_NOT_FOUND` for `vis-timeline`, then succeeds after
  `pnpm add vis-timeline vis-data`. Both directions matter: the
  first proves the optional peers are still isolated, the second
  proves the subpath is not merely unreachable.

`verify:peers` checks the same property against the emitted import
graph on every build, so this step is a confirmation rather than the
primary defense.

## Version policy

Semantic versioning applies to exported components, props, and
core types from 1.0.0. Explicitly outside it: exact layout pixel
positions, route shape beyond the invariants documented in
docs/structural-patterns.md, and anything reached by deep import
past the exports map. Deprecations ship warning-first and are
removed no earlier than the next major; the current deprecation
is `CytoscapeCanvas`'s `structural` prop.
