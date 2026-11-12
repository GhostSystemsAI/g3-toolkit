---
project: g3_toolkit
slug: heal-g3_toolkit-verify-drift-db2161cb-20261021t065938z
title: Heal verify-drift in g3_toolkit: I-23: 12 finding(s)
heal_signature: db2161cb7c817cac
heal_kind: verify-drift
seat_pin: jake
merge_target: work/post-rc007
abstract: rev heal report verify-drift in g3_toolkit (sig db2161cb7c817cac): I-23: 12 finding(s)
tags: heal, verify-drift, g3-toolkit
---

# Plan -- heal verify-drift in g3_toolkit (sig db2161cb7c817cac)

Written by `rev heal report` (zero-LLM, self-heal doctrine A6/A9). The defect was recorded as kb:Failure https://loom.ghostsystems.ai/spindle_g3_toolkit/Failure/heal-verify-drift-db2161cb; budget $15.00.

## §1 Investigate, root-cause, fix the mechanism on the real artifact, test, commit, prove
<!-- kb:order 1 kb:kind code kb:executor claude kb:model opus kb:touches docs/plans/heal/g3_toolkit-verify-drift-db2161cb-20261021t065938z.md kb:checkKind fable-judgment -->

Reproduce the defect below on the real artifact (not a fixture), find the mechanism that produced it and fix THAT, not the symptom. Add a regression test that fails before the fix and passes after, bump the project version per its rule, commit, push, and prove the fix by re-running the reproduction. Evidence (verbatim):

> kb verify I-23
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/File/packages-core-src-layout-elk-layout-ts-717b17138b kb:File <https://loom.ghostsystems.ai/spindle_g3_toolkit/File/packages-core-src-layout-elk-layout-ts-717b17138b> path='packages/core/src/layout/elk-layout.ts' not found on disk (soft-warn; code projection may lag)
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/File/packages-core-src-public-api-test-ts-f1299a2c12 kb:File <https://loom.ghostsystems.ai/spindle_g3_toolkit/File/packages-core-src-public-api-test-ts-f1299a2c12> path='packages/core/src/public-api.test.ts' not found on disk (soft-warn; code projection may lag)
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/File/src-demo-demoapp-tsx-879fd422cd kb:File <https://loom.ghostsystems.ai/spindle_g3_toolkit/File/src-demo-demoapp-tsx-879fd422cd> path='src/demo/DemoApp.tsx' not found on disk (soft-warn; code projection may lag)
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/File/src-demo-fixtures-additional-ts-59c948271b kb:File <https://loom.ghostsystems.ai/spindle_g3_toolkit/File/src-demo-fixtures-additional-ts-59c948271b> path='src/demo/fixtures/additional.ts' not found on disk (soft-warn; code projection may lag)
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/File/src-demo-fixtures-analytics-ts-8cadebfc35 kb:File <https://loom.ghostsystems.ai/spindle_g3_toolkit/File/src-demo-fixtures-analytics-ts-8cadebfc35> path='src/demo/fixtures/analytics.ts' not found on disk (soft-warn; code projection may lag)
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/File/src-demo-fixtures-healthcare-ts-93ace633dc kb:File <https://loom.ghostsystems.ai/spindle_g3_toolkit/File/src-demo-fixtures-healthcare-ts-93ace633dc> path='src/demo/fixtures/healthcare.ts' not found on disk (soft-warn; code projection may lag)
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/File/src-demo-fixtures-scenarios-ts-2ae408a4fb kb:File <https://loom.ghostsystems.ai/spindle_g3_toolkit/File/src-demo-fixtures-scenarios-ts-2ae408a4fb> path='src/demo/fixtures/scenarios.ts' not found on disk (soft-warn; code projection may lag)
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/File/src-demo-shells-analyticsdemo-tsx-0ca8f3bfda kb:File <https://loom.ghostsystems.ai/spindle_g3_toolkit/File/src-demo-shells-analyticsdemo-tsx-0ca8f3bfda> path='src/demo/shells/AnalyticsDemo.tsx' not found on disk (soft-warn; code projection may lag)
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/File/src-demo-shells-auditormbsedemo-tsx-152b3f15b7 kb:File <https://loom.ghostsystems.ai/spindle_g3_toolkit/File/src-demo-shells-auditormbsedemo-tsx-152b3f15b7> path='src/demo/shells/AuditorMBSEDemo.tsx' not found on disk (soft-warn; code projection may lag)
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/File/src-demo-shells-cybersupplydemo-tsx-b709eff39f kb:File <https://loom.ghostsystems.ai/spindle_g3_toolkit/File/src-demo-shells-cybersupplydemo-tsx-b709eff39f> path='src/demo/shells/CyberSupplyDemo.tsx' not found on disk (soft-warn; code projection may lag)
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/File/src-demo-shells-datascientistdemo-tsx-64a4a8d2a1 kb:File <https://loom.ghostsystems.ai/spindle_g3_toolkit/File/src-demo-shells-datascientistdemo-tsx-64a4a8d2a1> path='src/demo/shells/DataScientistDemo.tsx' not found on disk (soft-warn; code projection may lag)
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/File/src-demo-shells-healthcaredemo-tsx-9ef1a3d39f kb:File <https://loom.ghostsystems.ai/spindle_g3_toolkit/File/src-demo-shells-healthcaredemo-tsx-9ef1a3d39f> path='src/demo/shells/HealthcareDemo.tsx' not found on disk (soft-warn; code projection may lag)

- Rule: fix the mechanism on the real artifact; no test is deleted, skipped, xfail'd or loosened to make the defect disappear.
- Rule: provisiond's own files (/var/spool/weaverd-provision*, /etc/provisiond*), installed units + drop-ins under /etc/systemd/system, sudo/sudoers, weaver-server unit files, destructive project ops (drop/deinit/force-reinit, history rewrite), pushes off the forge mesh and billing/subscription surfaces are ASK-FIRST: a worker that reaches one writes a kb:Question naming it and says so in `summary` -- never in blockers[].
- Rule: any further failure seen while working is logged (`rev log failure`) and named in `summary` for the foreground to enqueue -- never "pre-existing, skipped".
