---
project: g3_toolkit
slug: heal-g3_toolkit-verify-drift-f3365b28-20261020t125433z
title: Heal verify-drift in g3_toolkit: I-18: 13 finding(s)
heal_signature: f3365b2830501eb2
heal_kind: verify-drift
seat_pin: jake
merge_target: work/post-rc007
abstract: rev heal report verify-drift in g3_toolkit (sig f3365b2830501eb2): I-18: 13 finding(s)
tags: heal, verify-drift, g3_toolkit
---

# Plan -- heal verify-drift in g3_toolkit (sig f3365b2830501eb2)

Written by `rev heal report` (zero-LLM, self-heal doctrine A6/A9). The defect was recorded as kb:Failure https://loom.ghostsystems.ai/spindle_g3_toolkit/Failure/heal-verify-drift-f3365b28; budget $15.00.

## §1 Investigate, root-cause, fix the mechanism on the real artifact, test, commit, prove
<!-- kb:order 1 kb:kind code kb:executor claude kb:model opus kb:touches docs/plans/heal/g3_toolkit-verify-drift-f3365b28-20261020t125433z.md kb:checkKind fable-judgment -->

Reproduce the defect below on the real artifact (not a fixture), find the mechanism that produced it and fix THAT, not the symptom. Add a regression test that fails before the fix and passes after, bump the project version per its rule, commit, push, and prove the fix by re-running the reproduction. Evidence (verbatim):

> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Activity/arch-topo-20260813T195313Z is cited as a prov:wasGeneratedBy target but is not a kb:Activity in the global or project activities graph
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Activity/deeplook-census-20260813T204835Z is cited as a prov:wasGeneratedBy target but is not a kb:Activity in the global or project activities graph
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Activity/deeplook-crosslink-20260813T204848Z is cited as a prov:wasGeneratedBy target but is not a kb:Activity in the global or project activities graph
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Activity/deeplook-l3-20260813T204844Z is cited as a prov:wasGeneratedBy target but is not a kb:Activity in the global or project activities graph
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Activity/kb-deep-ingest-pass2-d99d43638a17 is cited as a prov:wasGeneratedBy target but is not a kb:Activity in the global or project activities graph
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Activity/kb-deep-ingest-pass2-llm-e243e87e6fd2 is cited as a prov:wasGeneratedBy target but is not a kb:Activity in the global or project activities graph
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Activity/kb-deep-ingest-theme-c741c0c8c508 is cited as a prov:wasGeneratedBy target but is not a kb:Activity in the global or project activities graph
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/MaterializeRun/20260813T215851Z is cited as a prov:wasGeneratedBy target but is not a kb:Activity in the global or project activities graph
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Plan/heal-g3_toolkit-verify-drift-4a96fd95-20261011t184906z#session is cited as a prov:wasGeneratedBy target but is not a kb:Activity in the global or project activities graph
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Plan/heal-g3_toolkit-verify-drift-84cb09e8-20261011t184931z#session is cited as a prov:wasGeneratedBy target but is not a kb:Activity in the global or project activities graph
> [error] urn:ghostjob:b16b6a85-60b0-48fb-b936-1fddae9e2a15 is cited as a prov:wasGeneratedBy target but is not a kb:Activity in the global or project activities graph
> [error] urn:ghostjob:c63c21d2-6940-425f-8e06-090670ad9cfb is cited as a prov:wasGeneratedBy target but is not a kb:Activity in the global or project activities graph
> [error] urn:ghostjob:d633065f-797d-4bda-b307-1a3450815b63 is cited as a prov:wasGeneratedBy target but is not a kb:Activity in the global or project activities graph

- Rule: fix the mechanism on the real artifact; no test is deleted, skipped, xfail'd or loosened to make the defect disappear.
- Rule: provisiond's own files (/var/spool/weaverd-provision*, /etc/provisiond*), installed units + drop-ins under /etc/systemd/system, sudo/sudoers, weaver-server unit files, destructive project ops (drop/deinit/force-reinit, history rewrite), pushes off the forge mesh and billing/subscription surfaces are ASK-FIRST: a worker that reaches one writes a kb:Question naming it and says so in `summary` -- never in blockers[].
- Rule: any further failure seen while working is logged (`rev log failure`) and named in `summary` for the foreground to enqueue -- never "pre-existing, skipped".
