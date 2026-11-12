---
project: g3_toolkit
slug: heal-g3_toolkit-gotcha-ce7ee559-20261020t153815z
title: Heal gotcha in g3_toolkit: gotcha parallel-session-shipped-the-same-bio-label-overlap-fix-4-mi-b0906df8
heal_signature: ce7ee5593b3e5265
heal_kind: gotcha
seat_pin: jake
merge_target: work/post-rc007
abstract: rev heal report gotcha in g3_toolkit (sig ce7ee5593b3e5265): gotcha parallel-session-shipped-the-same-bio-label-overlap-fix-4-mi-b0906df8
tags: heal, gotcha, g3_toolkit
---

# Plan -- heal gotcha in g3_toolkit (sig ce7ee5593b3e5265)

Written by `rev heal report` (zero-LLM, self-heal doctrine A6/A9). The defect was recorded as kb:Failure https://loom.ghostsystems.ai/spindle_g3_toolkit/Failure/heal-gotcha-ce7ee559; budget $15.00.

## §1 Investigate, root-cause, fix the mechanism on the real artifact, test, commit, prove
<!-- kb:order 1 kb:kind code kb:executor claude kb:model opus kb:touches docs/plans/heal/g3_toolkit-gotcha-ce7ee559-20261020t153815z.md kb:checkKind fable-judgment -->

Reproduce the defect below on the real artifact (not a fixture), find the mechanism that produced it and fix THAT, not the symptom. Add a regression test that fails before the fix and passes after, bump the project version per its rule, commit, push, and prove the fix by re-running the reproduction. Evidence (verbatim):

> Gotcha: https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/parallel-session-shipped-the-same-bio-label-overlap-fix-4-mi-b0906df8
> title: Parallel session shipped the same bio label-overlap fix 4 minutes before this one; the two mechanisms silently broke the wrap-off switch
> subject: https://loom.ghostsystems.ai/spindle_g3_toolkit/Topic/parallel-session-editing
> rule: Before committing a fix in the shared g3-toolkit tree, git log the target files since your last read; a sibling session or worker may have landed an overlapping fix
> antiPattern: Committing a same-file fix without re-checking HEAD moved during the edit window
> remediation: Reconciled to one mechanism per no-legacy; when the 'file modified on disk' edit warning fires, git log the file, not just git diff
> surface: code

- Rule: fix the mechanism on the real artifact; no test is deleted, skipped, xfail'd or loosened to make the defect disappear.
- Rule: provisiond's own files (/var/spool/weaverd-provision*, /etc/provisiond*), installed units + drop-ins under /etc/systemd/system, sudo/sudoers, weaver-server unit files, destructive project ops (drop/deinit/force-reinit, history rewrite), pushes off the forge mesh and billing/subscription surfaces are ASK-FIRST: a worker that reaches one writes a kb:Question naming it and says so in `summary` -- never in blockers[].
- Rule: any further failure seen while working is logged (`rev log failure`) and named in `summary` for the foreground to enqueue -- never "pre-existing, skipped".
