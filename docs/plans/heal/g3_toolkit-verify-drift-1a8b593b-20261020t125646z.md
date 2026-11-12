---
project: g3_toolkit
slug: heal-g3_toolkit-verify-drift-1a8b593b-20261020t125646z
title: Heal verify-drift in g3_toolkit: I-29: 3 finding(s)
heal_signature: 1a8b593b0e2358ac
heal_kind: verify-drift
seat_pin: quill
merge_target: work/post-rc007
abstract: rev heal report verify-drift in g3_toolkit (sig 1a8b593b0e2358ac): I-29: 3 finding(s)
tags: heal, verify-drift, g3_toolkit
---

# Plan -- heal verify-drift in g3_toolkit (sig 1a8b593b0e2358ac)

Written by `rev heal report` (zero-LLM, self-heal doctrine A6/A9). The defect was recorded as kb:Failure https://loom.ghostsystems.ai/spindle_g3_toolkit/Failure/heal-verify-drift-1a8b593b; budget $15.00.

## §1 Investigate, root-cause, fix the mechanism on the real artifact, test, commit, prove
<!-- kb:order 1 kb:kind code kb:executor claude kb:model opus kb:touches docs/plans/heal/g3_toolkit-verify-drift-1a8b593b-20261020t125646z.md kb:checkKind fable-judgment -->

Reproduce the defect below on the real artifact (not a fixture), find the mechanism that produced it and fix THAT, not the symptom. Add a regression test that fails before the fix and passes after, bump the project version per its rule, commit, push, and prove the fix by re-running the reproduction. Evidence (verbatim):

> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Topic/outcome-validation kb:topic <https://loom.ghostsystems.ai/spindle_g3_toolkit/Topic/outcome-validation> referenced by <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/validation-gate-c63c21d2-6940-425f-8e06-090670ad9cfb> is not declared as kb:Topic in graph/global or site; run kb hygiene register-topic outcome-validation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Topic/outcome-validation kb:topic <https://loom.ghostsystems.ai/spindle_g3_toolkit/Topic/outcome-validation> referenced by <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/validation-gate-d633065f-797d-4bda-b307-1a3450815b63> is not declared as kb:Topic in graph/global or site; run kb hygiene register-topic outcome-validation
> [error] themes kb:topic <themes> referenced by <https://loom.ghostsystems.ai/spindle_g3_toolkit/Discovery/materialize-20260813T215851Z> is not declared as kb:Topic in graph/global or site; run kb hygiene register-topic themes

- Rule: fix the mechanism on the real artifact; no test is deleted, skipped, xfail'd or loosened to make the defect disappear.
- Rule: provisiond's own files (/var/spool/weaverd-provision*, /etc/provisiond*), installed units + drop-ins under /etc/systemd/system, sudo/sudoers, weaver-server unit files, destructive project ops (drop/deinit/force-reinit, history rewrite), pushes off the forge mesh and billing/subscription surfaces are ASK-FIRST: a worker that reaches one writes a kb:Question naming it and says so in `summary` -- never in blockers[].
- Rule: any further failure seen while working is logged (`rev log failure`) and named in `summary` for the foreground to enqueue -- never "pre-existing, skipped".
