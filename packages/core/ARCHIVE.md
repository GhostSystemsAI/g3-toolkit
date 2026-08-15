# Archived public surface

Owner ruling (2026-07-12): **archive, don't delete.** The clusters
below are delivered, tested feature surface that had no in-repo
consumer. They left the ROOT barrel (`src/index.ts`); the MODULES AND
THEIR TESTS REMAIN IN THE TREE AND KEEP RUNNING in every vitest pass,
so the code cannot rot silently.

## Read this before citing anything below as "not shipped"

**Leaving the root barrel is not leaving the API.** `@g3t/core`
publishes thirteen subpaths, and a symbol dropped from `src/index.ts`
is still public if any subpath barrel exports it. This document said
"they no longer ship in dist or appear in the API" for a year, and that
was wrong for most of the list: **27 of the 38 symbols ship from a
subpath**, including every symbol in the middleware, SHACL-report,
pipeline-registry and incremental-layout clusters. The genuinely absent
set is 11.

That is not a defect in the ruling, which was about the root barrel and
about not deleting code. It is a defect in how this document described
the result, and the description is what changed.

The table now carries a status per symbol.
`scripts/check-archive-accuracy.mjs` (wired into `verify`)
cross-references every row against `api-surface.json` and fails the
build when the two disagree, in both directions: a row marked ABSENT
that ships, and a row marked SHIPS that no longer does. Re-exporting an
archived symbol is a fine thing to do deliberately; leaving this file
claiming otherwise is what the gate prevents.

**Restore procedure:** re-add the symbol to `src/index.ts`, regenerate
`api-surface.json` with `node scripts/check-api-surface.mjs --update`,
and run `node scripts/check-archive-accuracy.mjs`, which will tell you
which row to update. Nothing else is required; no files moved.

## Status by symbol

| Symbol                          | Cluster | Status | Exported from                 |
| ------------------------------- | --- | ------ | ----------------------------- |
| `GremlinAdapter`                | T2a | SHIPS  | @g3t/core/adapters            |
| `RestAdapter`                   | T2a | SHIPS  | @g3t/core, @g3t/core/adapters |
| `composeMiddleware`             | T2a | SHIPS  | @g3t/core/middleware          |
| `defaultFetch`                  | T2a | SHIPS  | @g3t/core/middleware          |
| `bearerAuth`                    | T2a | SHIPS  | @g3t/core/middleware          |
| `apiKeyHeader`                  | T2a | SHIPS  | @g3t/core/middleware          |
| `retryOnError`                  | T2a | SHIPS  | @g3t/core/middleware          |
| `requestLogger`                 | T2a | SHIPS  | @g3t/core/middleware          |
| `parseShaclReport`              | T2b | SHIPS  | @g3t/core/shacl               |
| `resultsForShape`               | T2b | SHIPS  | @g3t/core/shacl               |
| `resultTargets`                 | T2b | SHIPS  | @g3t/core/shacl               |
| `resultsForFocusNode`           | T2b | SHIPS  | @g3t/core/shacl               |
| `extractProvOProperties`        | T2c | ABSENT | -                             |
| `PROVO_MAPPINGS`                | T2c | ABSENT | -                             |
| `literalCollapse`               | T2c | SHIPS  | @g3t/core/projection          |
| `blankNodeCollapse`             | T2c | SHIPS  | @g3t/core/projection          |
| `listCollapse`                  | T2c | SHIPS  | @g3t/core/projection          |
| `reificationCollapse`           | T2c | SHIPS  | @g3t/core/projection          |
| `overlayFromDocument`           | T2c | SHIPS  | @g3t/core/algorithms          |
| `PipelineRegistry`              | T2d | SHIPS  | @g3t/core/pipeline            |
| `createCountByProperty`         | T2d | SHIPS  | @g3t/core/pipeline            |
| `createEdgeTypeBreakdown`       | T2d | SHIPS  | @g3t/core/pipeline            |
| `createActivityTimeline`        | T2d | SHIPS  | @g3t/core/pipeline            |
| `createCommunityBreakdown`      | T2d | SHIPS  | @g3t/core/pipeline            |
| `IncrementalLayout`             | T2e | SHIPS  | @g3t/core/layout              |
| `applyIncrementalLayout`        | T2e | SHIPS  | @g3t/core/layout              |
| `computeIncrementalUpdate`      | T2e | SHIPS  | @g3t/core/layout              |
| `ingestEdgeAlgorithmResults`    | T2e | SHIPS  | @g3t/core/algorithms          |
| `parseStyleConfig`              | T2f | ABSENT | -                             |
| `serializeStyleConfig`          | T2f | ABSENT | -                             |
| `STYLE_CONFIG_SCHEMA`           | T2f | ABSENT | -                             |
| `serializeOverrides`            | T2f | ABSENT | -                             |
| `deserializeOverrides`          | T2f | ABSENT | -                             |
| `TypeMenuProvider`              | T2f | ABSENT | -                             |
| `createDefaultTypeMenuProvider` | T2f | ABSENT | -                             |
| `checkRenderPermission`         | T2f | SHIPS  | @g3t/core/projection          |
| `unpinAll`                      | T2f | ABSENT | -                             |
| `DARK_TOKENS`                   | T2f | ABSENT | -                             |

Clusters, for the names used above:

| Tag | Cluster |
| --- | ------- |
| T2a | Gremlin/REST adapters + HTTP middleware |
| T2b | SHACL report tooling |
| T2c | PROV-O extraction + RDF collapse transforms |
| T2d | Pipeline registry + chart pipeline creators |
| T2e | Incremental layout suite |
| T2f | Style-config JSON + overrides + type menu + misc |

Context: the analysis that produced the original table (methods, byte
costs, the rejected-exemption discussion) is
`planning/g3l/dead-code-analysis.md`. Type-only exports associated with
these clusters remain exported: types cost zero dist bytes and removing
them breaks consumers disproportionately.
