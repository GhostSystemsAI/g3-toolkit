---
project: g3_toolkit
slug: heal-g3_toolkit-verify-drift-cdfb5be5-20261020t041639z
title: Heal verify-drift in g3_toolkit: I-59: 2 finding(s)
heal_signature: cdfb5be5a765a81b
heal_kind: verify-drift
seat_pin: jake
merge_target: work/post-rc007
abstract: rev heal report verify-drift in g3_toolkit (sig cdfb5be5a765a81b): I-59: 2 finding(s)
tags: heal, verify-drift, g3_toolkit
---

# Plan -- heal verify-drift in g3_toolkit (sig cdfb5be5a765a81b)

Written by `rev heal report` (zero-LLM, self-heal doctrine A6/A9). The defect was recorded as kb:Failure https://loom.ghostsystems.ai/spindle_g3_toolkit/Failure/heal-verify-drift-cdfb5be5; budget $15.00.

## §1 Investigate, root-cause, fix the mechanism on the real artifact, test, commit, prove
<!-- kb:order 1 kb:kind code kb:executor claude kb:model opus kb:touches docs/plans/heal/g3_toolkit-verify-drift-cdfb5be5-20261020t041639z.md kb:checkKind fable-judgment -->

Reproduce the defect below on the real artifact (not a fixture), find the mechanism that produced it and fix THAT, not the symptom. Add a regression test that fails before the fix and passes after, bump the project version per its rule, commit, push, and prove the fix by re-running the reproduction. Evidence (verbatim):

> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Symbol/packages-react-src-interaction-property-editor-derivedpropertypanel-tsx-derivedpropertypanel-a179ad 2 dangling edge(s); sample: <https://loom.ghostsystems.ai/spindle_g3_toolkit/Symbol/packages-react-src-interaction-property-editor-derivedpropertypanel-tsx-derivedpropertypanel-a179ad> kb:calls <https://loom.ghostsystems.ai/spindle_g3_toolkit/Symbol/packages-core-src-layout-elk-layout-ts-compute-2284e5> — target is not a live kb:Symbol (untyped or kb:deletedAt)
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Symbol/src-test-harness-tsx-testharness-c31456 2 dangling edge(s); sample: <https://loom.ghostsystems.ai/spindle_g3_toolkit/Symbol/src-test-harness-tsx-testharness-c31456> kb:calls <https://loom.ghostsystems.ai/spindle_g3_toolkit/Symbol/packages-core-src-layout-elk-layout-ts-compute-2284e5> — target is not a live kb:Symbol (untyped or kb:deletedAt)

- Rule: fix the mechanism on the real artifact; no test is deleted, skipped, xfail'd or loosened to make the defect disappear.
- Rule: provisiond's own files (/var/spool/weaverd-provision*, /etc/provisiond*), installed units + drop-ins under /etc/systemd/system, sudo/sudoers, weaver-server unit files, destructive project ops (drop/deinit/force-reinit, history rewrite), pushes off the forge mesh and billing/subscription surfaces are ASK-FIRST: a worker that reaches one writes a kb:Question naming it and says so in `summary` -- never in blockers[].
- Rule: any further failure seen while working is logged (`rev log failure`) and named in `summary` for the foreground to enqueue -- never "pre-existing, skipped".
