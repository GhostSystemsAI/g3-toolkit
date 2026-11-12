---
project: g3_toolkit
slug: heal-g3_toolkit-gotcha-2ebb0bf5-20261020t153842z
title: Heal gotcha in g3_toolkit: gotcha pnpm-store-unable-to-open-database-file-on-this-host-blocks--5523e6ed
heal_signature: 2ebb0bf5948cd2cf
heal_kind: gotcha
seat_pin: gsai
merge_target: work/post-rc007
abstract: rev heal report gotcha in g3_toolkit (sig 2ebb0bf5948cd2cf): gotcha pnpm-store-unable-to-open-database-file-on-this-host-blocks--5523e6ed
tags: heal, gotcha, g3_toolkit
---

# Plan -- heal gotcha in g3_toolkit (sig 2ebb0bf5948cd2cf)

Written by `rev heal report` (zero-LLM, self-heal doctrine A6/A9). The defect was recorded as kb:Failure https://loom.ghostsystems.ai/spindle_g3_toolkit/Failure/heal-gotcha-2ebb0bf5; budget $15.00.

## §1 Investigate, root-cause, fix the mechanism on the real artifact, test, commit, prove
<!-- kb:order 1 kb:kind code kb:executor claude kb:model opus kb:touches scripts/check-bundle-size.mjs,scripts/check_roadmap_coverage.py,scripts/lint_specs.py,scripts/sync_spec_status.py kb:checkKind fable-judgment -->

Reproduce the defect below on the real artifact (not a fixture), find the mechanism that produced it and fix THAT, not the symptom. Add a regression test that fails before the fix and passes after, bump the project version per its rule, commit, push, and prove the fix by re-running the reproduction. Evidence (verbatim):

> Gotcha: https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/pnpm-store-unable-to-open-database-file-on-this-host-blocks--5523e6ed
> title: pnpm store 'unable to open database file' on this host blocks pnpm run gates
> subject: https://loom.ghostsystems.ai/spindle_g3_toolkit/Topic/routing-perimeter-policy
> rule: Do not rely on 'pnpm run gates' on this workstation; invoke each gate step directly (./node_modules/.bin/tsc --noEmit, ./node_modules/.bin/eslint, ./node_modules/.bin/prettier --check, ./node_modules/.bin/vitest run, ./node_modules/.bin/tsc -b, python3 scripts/lint_specs.py, python3 scripts/sync_spec_status.py, python3 scripts/check_roadmap_coverage.py, node scripts/check-bundle-size.mjs)
> antiPattern: invoking pnpm/pnpm run any-script fails immediately with [ERROR] unable to open database file (sqlite lock on /home/jake/.local/share/pnpm/store/v11/index.db) — the error surfaces before the target script runs, so no partial state
> remediation: Run gates as individual node/python invocations against the checked-in node_modules; verify:bundle passes trivially with empty dist so build packages via tsc -b if the ledger check needs real bytes
> surface: runtime

- Rule: fix the mechanism on the real artifact; no test is deleted, skipped, xfail'd or loosened to make the defect disappear.
- Rule: provisiond's own files (/var/spool/weaverd-provision*, /etc/provisiond*), installed units + drop-ins under /etc/systemd/system, sudo/sudoers, weaver-server unit files, destructive project ops (drop/deinit/force-reinit, history rewrite), pushes off the forge mesh and billing/subscription surfaces are ASK-FIRST: a worker that reaches one writes a kb:Question naming it and says so in `summary` -- never in blockers[].
- Rule: any further failure seen while working is logged (`rev log failure`) and named in `summary` for the foreground to enqueue -- never "pre-existing, skipped".
