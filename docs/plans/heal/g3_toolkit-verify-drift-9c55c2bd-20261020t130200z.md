---
project: g3_toolkit
slug: heal-g3_toolkit-verify-drift-9c55c2bd-20261020t130200z
title: Heal verify-drift in g3_toolkit: I-46: 6 finding(s)
heal_signature: 9c55c2bda6f3e0ed
heal_kind: verify-drift
seat_pin: jake
merge_target: work/post-rc007
abstract: rev heal report verify-drift in g3_toolkit (sig 9c55c2bda6f3e0ed): I-46: 6 finding(s)
tags: heal, verify-drift, g3_toolkit
---

# Plan -- heal verify-drift in g3_toolkit (sig 9c55c2bda6f3e0ed)

Written by `rev heal report` (zero-LLM, self-heal doctrine A6/A9). The defect was recorded as kb:Failure https://loom.ghostsystems.ai/spindle_g3_toolkit/Failure/heal-verify-drift-9c55c2bd; budget $15.00.

## §1 Investigate, root-cause, fix the mechanism on the real artifact, test, commit, prove
<!-- kb:order 1 kb:kind code kb:executor claude kb:model opus kb:touches docs/plans/heal/g3_toolkit-verify-drift-9c55c2bd-20261020t130200z.md kb:checkKind fable-judgment -->

Reproduce the defect below on the real artifact (not a fixture), find the mechanism that produced it and fix THAT, not the symptom. Add a regression test that fails before the fix and passes after, bump the project version per its rule, commit, push, and prove the fix by re-running the reproduction. Evidence (verbatim):

> [error] None plaintext-secret path '/GSystems/config/.env' still contains secret-shaped content: kv-mask:FUSEKI_ADMIN_PASSWORD, kv-mask:TUNNEL_TOKEN, sha256-digest:5b3bec3a
> [error] None plaintext-secret path '/GSystems/config/ai.env' still contains secret-shaped content: kv-mask:GEMINI_API_KEY, kv-mask:GOOGLE_API_KEY, kv-mask:TAVILY_API_KEY
> [error] None plaintext-secret path '/GSystems/config/secrets.env' still contains secret-shaped content: kv-mask:ELEVENLABS_API_KEY, kv-mask:GEMINI_API_KEY, kv-mask:GOOGLE_API_KEY, kv-mask:HF_TOKEN, kv-mask:JUPYTER_TOKEN, kv-mask:NEXTCLOUD_ADMIN_PASSWORD, kv-mask:NEXTCLOUD_DB_PASSWORD, kv-mask:POSTGRES_PASSWORD, kv-mask:RUNPOD_API_KEY, kv-mask:TAVILY_API_KEY, token-shape:gitlab-pat, url-credential
> [error] None plaintext-secret path '/home/jake/.config/secrets.env' still contains secret-shaped content: kv-mask:GITLAB_TOKEN, token-shape:gitlab-pat
> [error] None plaintext-secret path '/home/jake/.kb-env' still contains secret-shaped content: kv-mask:KB_FUSEKI_PASSWORD
> [warning] None 8 plaintext-secret target(s) could not be scanned by this euid — NOT a pass: /etc/fuseki/admin.env (unreadable), /etc/weaverd.env (unreadable), /home/deb (blind), /home/greg (blind), /home/isaac (blind), /home/michael (blind), /home/shane (blind), /home/zach (blind)

- Rule: fix the mechanism on the real artifact; no test is deleted, skipped, xfail'd or loosened to make the defect disappear.
- Rule: provisiond's own files (/var/spool/weaverd-provision*, /etc/provisiond*), installed units + drop-ins under /etc/systemd/system, sudo/sudoers, weaver-server unit files, destructive project ops (drop/deinit/force-reinit, history rewrite), pushes off the forge mesh and billing/subscription surfaces are ASK-FIRST: a worker that reaches one writes a kb:Question naming it and says so in `summary` -- never in blockers[].
- Rule: any further failure seen while working is logged (`rev log failure`) and named in `summary` for the foreground to enqueue -- never "pre-existing, skipped".
