---
project: g3_toolkit
slug: heal-g3_toolkit-gotcha-ef08f65c-20261020t153703z
title: Heal gotcha in g3_toolkit: gotcha host-origin-cloudflare-tunnel-routes-need-an-explicit-ufw-al-399f36a2
heal_signature: ef08f65cd5051187
heal_kind: gotcha
seat_pin: quill
merge_target: work/post-rc007
abstract: rev heal report gotcha in g3_toolkit (sig ef08f65cd5051187): gotcha host-origin-cloudflare-tunnel-routes-need-an-explicit-ufw-al-399f36a2
tags: heal, gotcha, g3_toolkit
---

# Plan -- heal gotcha in g3_toolkit (sig ef08f65cd5051187)

Written by `rev heal report` (zero-LLM, self-heal doctrine A6/A9). The defect was recorded as kb:Failure https://loom.ghostsystems.ai/spindle_g3_toolkit/Failure/heal-gotcha-ef08f65c; budget $15.00.

## §1 Investigate, root-cause, fix the mechanism on the real artifact, test, commit, prove
<!-- kb:order 1 kb:kind code kb:executor claude kb:model opus kb:touches docs/plans/heal/g3_toolkit-gotcha-ef08f65c-20261020t153703z.md kb:checkKind fable-judgment -->

Reproduce the defect below on the real artifact (not a fixture), find the mechanism that produced it and fix THAT, not the symptom. Add a regression test that fails before the fix and passes after, bump the project version per its rule, commit, push, and prove the fix by re-running the reproduction. Evidence (verbatim):

> Gotcha: https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/host-origin-cloudflare-tunnel-routes-need-an-explicit-ufw-al-399f36a2
> title: Host-origin Cloudflare tunnel routes need an explicit UFW allow from 172.18.0.0/16 to the port
> subject: https://loom.ghostsystems.ai/spindle_g3_toolkit/Topic/cloudflare-tunnel-host-origin
> rule: For a tunnel ingress service http://172.18.0.1:PORT, add: ufw allow from 172.18.0.0/16 to any port PORT proto tcp
> antiPattern: Assuming the tunnel can reach a host-bound service just because the host itself can
> remediation: Mirror the existing wraith :8504 rule for any new host-origin tunnel hostname
> surface: runtime

- Rule: fix the mechanism on the real artifact; no test is deleted, skipped, xfail'd or loosened to make the defect disappear.
- Rule: provisiond's own files (/var/spool/weaverd-provision*, /etc/provisiond*), installed units + drop-ins under /etc/systemd/system, sudo/sudoers, weaver-server unit files, destructive project ops (drop/deinit/force-reinit, history rewrite), pushes off the forge mesh and billing/subscription surfaces are ASK-FIRST: a worker that reaches one writes a kb:Question naming it and says so in `summary` -- never in blockers[].
- Rule: any further failure seen while working is logged (`rev log failure`) and named in `summary` for the foreground to enqueue -- never "pre-existing, skipped".
