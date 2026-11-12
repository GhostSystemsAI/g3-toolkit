---
project: g3_toolkit
slug: heal-g3_toolkit-gotcha-fffee8b4-20261020t131154z
title: Heal gotcha in g3_toolkit: gotcha dist-98a13ed5aa25bf84
heal_signature: fffee8b4691dced8
heal_kind: gotcha
seat_pin: jake
merge_target: work/post-rc007
abstract: rev heal report gotcha in g3_toolkit (sig fffee8b4691dced8): gotcha dist-98a13ed5aa25bf84
tags: heal, gotcha, g3_toolkit
---

# Plan -- heal gotcha in g3_toolkit (sig fffee8b4691dced8)

Written by `rev heal report` (zero-LLM, self-heal doctrine A6/A9). The defect was recorded as kb:Failure https://loom.ghostsystems.ai/spindle_g3_toolkit/Failure/heal-gotcha-fffee8b4; budget $15.00.

## §1 Investigate, root-cause, fix the mechanism on the real artifact, test, commit, prove
<!-- kb:order 1 kb:kind code kb:executor claude kb:model opus kb:touches docs/plans/heal/g3_toolkit-gotcha-fffee8b4-20261020t131154z.md kb:checkKind fable-judgment -->

Reproduce the defect below on the real artifact (not a fixture), find the mechanism that produced it and fix THAT, not the symptom. Add a regression test that fails before the fix and passes after, bump the project version per its rule, commit, push, and prove the fix by re-running the reproduction. Evidence (verbatim):

> Gotcha: https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-98a13ed5aa25bf84

- Rule: fix the mechanism on the real artifact; no test is deleted, skipped, xfail'd or loosened to make the defect disappear.
- Rule: provisiond's own files (/var/spool/weaverd-provision*, /etc/provisiond*), installed units + drop-ins under /etc/systemd/system, sudo/sudoers, weaver-server unit files, destructive project ops (drop/deinit/force-reinit, history rewrite), pushes off the forge mesh and billing/subscription surfaces are ASK-FIRST: a worker that reaches one writes a kb:Question naming it and says so in `summary` -- never in blockers[].
- Rule: any further failure seen while working is logged (`rev log failure`) and named in `summary` for the foreground to enqueue -- never "pre-existing, skipped".
