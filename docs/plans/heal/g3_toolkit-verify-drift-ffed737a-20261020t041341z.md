---
project: g3_toolkit
slug: heal-g3_toolkit-verify-drift-ffed737a-20261020t041341z
title: Heal verify-drift in g3_toolkit: I-34: 4 finding(s)
heal_signature: ffed737a16ac7065
heal_kind: verify-drift
seat_pin: jake
merge_target: work/post-rc007
abstract: rev heal report verify-drift in g3_toolkit (sig ffed737a16ac7065): I-34: 4 finding(s)
tags: heal, verify-drift, g3_toolkit
---

# Plan -- heal verify-drift in g3_toolkit (sig ffed737a16ac7065)

Written by `rev heal report` (zero-LLM, self-heal doctrine A6/A9). The defect was recorded as kb:Failure https://loom.ghostsystems.ai/spindle_g3_toolkit/Failure/heal-verify-drift-ffed737a; budget $15.00.

## §1 Investigate, root-cause, fix the mechanism on the real artifact, test, commit, prove
<!-- kb:order 1 kb:kind code kb:executor claude kb:model opus kb:touches docs/plans/heal/g3_toolkit-verify-drift-ffed737a-20261020t041341z.md kb:checkKind fable-judgment -->

Reproduce the defect below on the real artifact (not a fixture), find the mechanism that produced it and fix THAT, not the symptom. Add a regression test that fails before the fix and passes after, bump the project version per its rule, commit, push, and prove the fix by re-running the reproduction. Evidence (verbatim):

> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/WorkBlock/routing kb:WorkBlock <https://loom.ghostsystems.ai/spindle_g3_toolkit/WorkBlock/routing> missing required predicate kb:summary
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/WorkBlock/get_ai kb:WorkBlock <https://loom.ghostsystems.ai/spindle_g3_toolkit/WorkBlock/get_ai> missing required predicate kb:summary
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/WorkBlock/advanced-smart-routing kb:WorkBlock <https://loom.ghostsystems.ai/spindle_g3_toolkit/WorkBlock/advanced-smart-routing> missing required predicate kb:summary
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/WorkBlock/act-flowchart-shapes kb:WorkBlock <https://loom.ghostsystems.ai/spindle_g3_toolkit/WorkBlock/act-flowchart-shapes> missing required predicate kb:summary

- Rule: fix the mechanism on the real artifact; no test is deleted, skipped, xfail'd or loosened to make the defect disappear.
- Rule: provisiond's own files (/var/spool/weaverd-provision*, /etc/provisiond*), installed units + drop-ins under /etc/systemd/system, sudo/sudoers, weaver-server unit files, destructive project ops (drop/deinit/force-reinit, history rewrite), pushes off the forge mesh and billing/subscription surfaces are ASK-FIRST: a worker that reaches one writes a kb:Question naming it and says so in `summary` -- never in blockers[].
- Rule: any further failure seen while working is logged (`rev log failure`) and named in `summary` for the foreground to enqueue -- never "pre-existing, skipped".
