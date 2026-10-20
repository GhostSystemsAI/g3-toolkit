---
project: g3_toolkit
slug: heal-g3_toolkit-verify-drift-40bfbf81-20261020t041509z
title: Heal verify-drift in g3_toolkit: I-41: 9 finding(s)
heal_signature: 40bfbf8140f88b72
heal_kind: verify-drift
seat_pin: gsai
merge_target: work/post-rc007
abstract: rev heal report verify-drift in g3_toolkit (sig 40bfbf8140f88b72): I-41: 9 finding(s)
tags: heal, verify-drift, g3_toolkit
---

# Plan -- heal verify-drift in g3_toolkit (sig 40bfbf8140f88b72)

Written by `rev heal report` (zero-LLM, self-heal doctrine A6/A9). The defect was recorded as kb:Failure https://loom.ghostsystems.ai/spindle_g3_toolkit/Failure/heal-verify-drift-40bfbf81; budget $15.00.

## §1 Investigate, root-cause, fix the mechanism on the real artifact, test, commit, prove
<!-- kb:order 1 kb:kind code kb:executor claude kb:model opus kb:touches docs/plans/heal/g3_toolkit-verify-drift-40bfbf81-20261020t041509z.md kb:checkKind fable-judgment -->

Reproduce the defect below on the real artifact (not a fixture), find the mechanism that produced it and fix THAT, not the symptom. Add a regression test that fails before the fix and passes after, bump the project version per its rule, commit, push, and prove the fix by re-running the reproduction. Evidence (verbatim):

> [error] https://forge.tail515200.ts.net/ontology/kb/site/graph/agents repo specter_site holds non-KB-namespace graph <https://forge.tail515200.ts.net/ontology/kb/site/graph/agents>
> [error] https://forge.tail515200.ts.net/ontology/kb/loom/graph/deeplook-prompts repo specter_site holds non-KB-namespace graph <https://forge.tail515200.ts.net/ontology/kb/loom/graph/deeplook-prompts>
> [error] https://loom.ghostsystems.ai/specter_loom/deeplook-prompts repo specter_site (segment 'specter_site') holds foreign-segment graph <https://loom.ghostsystems.ai/specter_loom/deeplook-prompts>
> [error] https://loom.ghostsystems.ai/global/agents repo specter_site (segment 'specter_site') holds foreign-segment graph <https://loom.ghostsystems.ai/global/agents>
> [error] https://forge.tail515200.ts.net/ontology/kb/site/graph/usage repo specter_site holds non-KB-namespace graph <https://forge.tail515200.ts.net/ontology/kb/site/graph/usage>
> [error] https://loom.ghostsystems.ai/ontology/loom/site/graph/global repo specter_site holds malformed graph IRI <https://loom.ghostsystems.ai/ontology/loom/site/graph/global> (expected <root>/<repo_id>/<name>)
> [error] https://loom.ghostsystems.ai/ontology/loom/site/graph/usage repo specter_site holds malformed graph IRI <https://loom.ghostsystems.ai/ontology/loom/site/graph/usage> (expected <root>/<repo_id>/<name>)
> [error] https://loom.ghostsystems.ai/loom/deeplook-prompts repo specter_site (segment 'specter_site') holds foreign-segment graph <https://loom.ghostsystems.ai/loom/deeplook-prompts>
> [error] https://loom.ghostsystems.ai/ontology/loom/site/graph/backup repo specter_site holds malformed graph IRI <https://loom.ghostsystems.ai/ontology/loom/site/graph/backup> (expected <root>/<repo_id>/<name>)

- Rule: fix the mechanism on the real artifact; no test is deleted, skipped, xfail'd or loosened to make the defect disappear.
- Rule: provisiond's own files (/var/spool/weaverd-provision*, /etc/provisiond*), installed units + drop-ins under /etc/systemd/system, sudo/sudoers, weaver-server unit files, destructive project ops (drop/deinit/force-reinit, history rewrite), pushes off the forge mesh and billing/subscription surfaces are ASK-FIRST: a worker that reaches one writes a kb:Question naming it and says so in `summary` -- never in blockers[].
- Rule: any further failure seen while working is logged (`rev log failure`) and named in `summary` for the foreground to enqueue -- never "pre-existing, skipped".
