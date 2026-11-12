---
project: g3_toolkit
slug: heal-g3_toolkit-conductor-stall-1802edaf-20261022t050935z
title: Heal conductor-stall in g3_toolkit: heal-g3_toolkit-verify-drift-8985…
heal_signature: 1802edafa72c0351
heal_kind: conductor-stall
seat_pin: quill
merge_target: work/post-rc007
abstract: rev heal report conductor-stall in g3_toolkit (sig 1802edafa72c0351): heal-g3_toolkit-verify-drift-8985…
tags: heal, conductor-stall, g3-toolkit
---

# Plan -- heal conductor-stall in g3_toolkit (sig 1802edafa72c0351)

Written by `rev heal report` (zero-LLM, self-heal doctrine A6/A9). The defect was recorded as kb:Failure https://loom.ghostsystems.ai/spindle_g3_toolkit/Failure/heal-conductor-stall-1802edaf; budget $15.00.

## §1 Investigate, root-cause, fix the mechanism on the real artifact, test, commit, prove
<!-- kb:order 1 kb:kind code kb:executor claude kb:model opus kb:touches docs/plans/heal/g3_toolkit-conductor-stall-1802edaf-20261022t050935z.md kb:checkKind fable-judgment -->

Reproduce the defect below on the real artifact (not a fixture), find the mechanism that produced it and fix THAT, not the symptom. Add a regression test that fails before the fix and passes after, bump the project version per its rule, commit, push, and prove the fix by re-running the reproduction. Evidence (verbatim):

> heal-g3_toolkit-verify-drift-8985…: heal plan 'https://loom.ghostsystems.ai/spindle_g3_toolkit/… (…)

- Rule: fix the mechanism on the real artifact; no test is deleted, skipped, xfail'd or loosened to make the defect disappear.
- Rule: provisiond's own files (/var/spool/weaverd-provision*, /etc/provisiond*), installed units + drop-ins under /etc/systemd/system, sudo/sudoers, weaver-server unit files, destructive project ops (drop/deinit/force-reinit, history rewrite), pushes off the forge mesh and billing/subscription surfaces are ASK-FIRST: a worker that reaches one writes a kb:Question naming it and says so in `summary` -- never in blockers[]. Stored data only an operator may drop/move (I-41 strays): tag that Question `heal-operator-disposal` (`rev log question ... --tags heal-operator-disposal --summary '... <iri> <iri>'`) and write each graph IRI in full as `<iri>`, never brace-abbreviated -- the heal sweep stops re-filing only the IRIs it names that way.
- Rule: any further failure seen while working is logged (`rev log failure`) and named in `summary` for the foreground to enqueue -- never "pre-existing, skipped".
