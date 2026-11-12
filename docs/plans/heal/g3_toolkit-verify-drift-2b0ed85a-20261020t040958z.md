---
project: g3_toolkit
slug: heal-g3_toolkit-verify-drift-2b0ed85a-20261020t040958z
title: Heal verify-drift in g3_toolkit: I-30: 849 finding(s)
heal_signature: 2b0ed85ad0560821
heal_kind: verify-drift
seat_pin: jake
merge_target: work/post-rc007
abstract: rev heal report verify-drift in g3_toolkit (sig 2b0ed85ad0560821): I-30: 849 finding(s)
tags: heal, verify-drift, g3_toolkit
---

# Plan -- heal verify-drift in g3_toolkit (sig 2b0ed85ad0560821)

Written by `rev heal report` (zero-LLM, self-heal doctrine A6/A9). The defect was recorded as kb:Failure https://loom.ghostsystems.ai/spindle_g3_toolkit/Failure/heal-verify-drift-2b0ed85a; budget $15.00.

## §1 Investigate, root-cause, fix the mechanism on the real artifact, test, commit, prove
<!-- kb:order 1 kb:kind code kb:executor claude kb:model opus kb:touches docs/plans/heal/g3_toolkit-verify-drift-2b0ed85a-20261020t040958z.md kb:checkKind fable-judgment -->

Reproduce the defect below on the real artifact (not a fixture), find the mechanism that produced it and fix THAT, not the symptom. Add a regression test that fails before the fix and passes after, bump the project version per its rule, commit, push, and prove the fix by re-running the reproduction. Evidence (verbatim):

> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-92cc4e2275555022 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-92cc4e2275555022> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-44207c02bd350a2e kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-44207c02bd350a2e> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-3b2cd6b638951521 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-3b2cd6b638951521> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-943b9585c817c94f kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-943b9585c817c94f> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-7644d881c0fb3059 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-7644d881c0fb3059> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-623bbbccb79afc41 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-623bbbccb79afc41> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-df503049ac37a5c4 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-df503049ac37a5c4> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-efd591d5997aa92e kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-efd591d5997aa92e> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-98a13ed5aa25bf84 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-98a13ed5aa25bf84> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-35abfbbf3c067ca6 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-35abfbbf3c067ca6> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-6c8c7b697ff6d280 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-6c8c7b697ff6d280> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-ee1055aeb16f47dc kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-ee1055aeb16f47dc> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1bf26eb1732ae23c kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1bf26eb1732ae23c> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-bab1adce9f4a72d9 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-bab1adce9f4a72d9> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-4fb80de307f2d84c kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-4fb80de307f2d84c> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-b991e052b5cc7567 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-b991e052b5cc7567> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-79616a0c0b745ef5 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-79616a0c0b745ef5> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1a802a47ef742171 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1a802a47ef742171> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-d721753584f46742 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-d721753584f46742> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-286b5a964aec9b90 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-286b5a964aec9b90> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-2816891eb0389a37 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-2816891eb0389a37> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-b7f03422ba629a26 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-b7f03422ba629a26> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-53deb77708bf3ebc kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-53deb77708bf3ebc> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-58625d83bbda1ea5 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-58625d83bbda1ea5> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-4304e5d63e1d8f9b kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-4304e5d63e1d8f9b> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-90c5ad4b80dddf5d kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-90c5ad4b80dddf5d> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-98db048a9b80f6ed kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-98db048a9b80f6ed> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-53248c91c8e879f3 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-53248c91c8e879f3> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-cf487ae67a2e7f59 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-cf487ae67a2e7f59> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-c6ddaed576654ac6 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-c6ddaed576654ac6> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-b34223de5fa801b3 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-b34223de5fa801b3> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-5560c2360ecbe1ff kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-5560c2360ecbe1ff> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-528f17702a0af558 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-528f17702a0af558> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-070dd9d179e614a6 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-070dd9d179e614a6> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-b10419ae1acbffa2 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-b10419ae1acbffa2> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-b7d2a0433a9231c0 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-b7d2a0433a9231c0> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-5a7edf71dc341150 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-5a7edf71dc341150> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1f2067a472f0c290 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1f2067a472f0c290> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-58baa15e1715bd7c kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-58baa15e1715bd7c> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-c563d8079c053a08 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-c563d8079c053a08> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-01be451916f6bc0d kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-01be451916f6bc0d> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-7a18fe118225130a kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-7a18fe118225130a> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-32071acb8ab7ff1d kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-32071acb8ab7ff1d> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-f145c5516bd8fc78 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-f145c5516bd8fc78> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-4e13c5c807387ddd kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-4e13c5c807387ddd> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-92d48ff259ae656f kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-92d48ff259ae656f> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-c006d2f3718ded5e kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-c006d2f3718ded5e> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0b7a5f992786fe7c kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0b7a5f992786fe7c> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-e032396205ceb995 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-e032396205ceb995> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-958a8cc86a0b8d96 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-958a8cc86a0b8d96> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-c35e3ba13e40fb53 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-c35e3ba13e40fb53> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-9e8a057702ac01a0 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-9e8a057702ac01a0> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-d1274e90977e6189 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-d1274e90977e6189> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-af61a55bb378c1e0 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-af61a55bb378c1e0> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-c1fae7687f7d6785 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-c1fae7687f7d6785> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-c3a73fb84ccd6b80 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-c3a73fb84ccd6b80> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-57c59a8828ebf3e3 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-57c59a8828ebf3e3> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-9c6c2c78f3de14ce kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-9c6c2c78f3de14ce> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-27052ea43ff58415 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-27052ea43ff58415> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-27960ac74a29dcda kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-27960ac74a29dcda> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-b9c324803c1a0da4 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-b9c324803c1a0da4> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-ce04264964a41bdd kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-ce04264964a41bdd> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-db6d5b2c09119f56 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-db6d5b2c09119f56> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-ea87b67e58c7a087 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-ea87b67e58c7a087> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-6048efc2191de613 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-6048efc2191de613> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-907348588d6d55ef kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-907348588d6d55ef> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-919896d5252cffad kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-919896d5252cffad> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-bf1a4f56326093bf kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-bf1a4f56326093bf> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-d88d5f5a8cc15671 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-d88d5f5a8cc15671> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-ebf9185bf4d439ce kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-ebf9185bf4d439ce> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-193106b9faf28ed8 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-193106b9faf28ed8> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-34d3aa76cddbd851 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-34d3aa76cddbd851> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-98adf28d126e58b4 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-98adf28d126e58b4> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-5521f36094b30a4c kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-5521f36094b30a4c> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-8d5ca154fbac09ac kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-8d5ca154fbac09ac> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-9d498c42b213b509 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-9d498c42b213b509> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-a2327df425886ab0 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-a2327df425886ab0> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-cee0c0d41e7c36f7 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-cee0c0d41e7c36f7> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-f9d0c67ebeb5b58d kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-f9d0c67ebeb5b58d> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-a7165a2d039d85eb kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-a7165a2d039d85eb> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-bac11961a09c5e74 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-bac11961a09c5e74> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-93462569d4d0df09 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-93462569d4d0df09> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-9596e4572905dd96 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-9596e4572905dd96> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-47872919cd0b665b kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-47872919cd0b665b> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-b22955d3adc0ee31 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-b22955d3adc0ee31> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-bbdb9ff1d356d422 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-bbdb9ff1d356d422> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-8f671474a1cebf2a kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-8f671474a1cebf2a> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-72b71c6975aa2c18 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-72b71c6975aa2c18> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-ee055956a4457bdb kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-ee055956a4457bdb> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-8c595f048c7c12b7 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-8c595f048c7c12b7> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-e135ab98d01b18fb kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-e135ab98d01b18fb> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-97205afd8045ac3b kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-97205afd8045ac3b> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-067032b80af16b1e kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-067032b80af16b1e> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-edb7274f9e64bc57 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-edb7274f9e64bc57> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-35c7fcf8115aada7 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-35c7fcf8115aada7> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-93e4e69407222b90 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-93e4e69407222b90> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-54fd3dfa369afb77 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-54fd3dfa369afb77> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0a080ca4fe2e78e7 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0a080ca4fe2e78e7> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-598897accd5ddf27 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-598897accd5ddf27> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-a02078b91cdfa7f0 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-a02078b91cdfa7f0> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-f01dd76d05f4db51 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-f01dd76d05f4db51> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-36c440cc86928f69 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-36c440cc86928f69> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-c76802affcd5bad2 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-c76802affcd5bad2> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-d09b19a160ccea08 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-d09b19a160ccea08> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-ddf5f24398efd4c5 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-ddf5f24398efd4c5> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-9fdae4158e4f4d69 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-9fdae4158e4f4d69> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-97d9607e8757cfa9 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-97d9607e8757cfa9> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-d678d63e55897fd8 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-d678d63e55897fd8> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-8a885c3d20ce1808 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-8a885c3d20ce1808> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-e9ae51802dacae17 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-e9ae51802dacae17> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-6f229b3ec124507a kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-6f229b3ec124507a> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-b4885cedb286c5dd kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-b4885cedb286c5dd> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-71078e704430e6ea kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-71078e704430e6ea> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-e73b2656f70541dd kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-e73b2656f70541dd> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1bc46a01f3449155 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1bc46a01f3449155> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-61d0128d5b085ea7 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-61d0128d5b085ea7> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-2ada6bc789db9b47 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-2ada6bc789db9b47> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-bf9fa0b0ef770392 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-bf9fa0b0ef770392> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-f0907f3f56e11eb2 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-f0907f3f56e11eb2> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-5c2c025d38be01a1 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-5c2c025d38be01a1> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-2bf78f75f4caac4f kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-2bf78f75f4caac4f> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-248d876cddea7d71 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-248d876cddea7d71> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1ef8c0758b722dbc kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1ef8c0758b722dbc> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-e75a2d8508d4eb49 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-e75a2d8508d4eb49> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-2bb83553cd333824 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-2bb83553cd333824> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-10649f79d548f967 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-10649f79d548f967> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-f09c5cf6d82546e3 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-f09c5cf6d82546e3> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-fe9e3a5d1cf73bc3 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-fe9e3a5d1cf73bc3> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-d4cbfffa475a8173 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-d4cbfffa475a8173> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-e64d577216e7f509 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-e64d577216e7f509> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-ba18caeb5bb3a9a6 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-ba18caeb5bb3a9a6> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-f21600bfab6eeb11 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-f21600bfab6eeb11> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-c218c182399cb8fb kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-c218c182399cb8fb> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-577b40d904910a9e kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-577b40d904910a9e> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-94515f3929797c91 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-94515f3929797c91> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1ab6baa71fbc678d kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1ab6baa71fbc678d> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-95d65ab533bc0a04 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-95d65ab533bc0a04> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-2bf3df30c8f14418 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-2bf3df30c8f14418> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-04a61d1dac03f988 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-04a61d1dac03f988> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-ed39b7f30752b1d9 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-ed39b7f30752b1d9> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-fd9b96ab431fdd20 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-fd9b96ab431fdd20> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-c9f3e31385c30a89 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-c9f3e31385c30a89> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-565284305fb4f81d kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-565284305fb4f81d> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-de26230820888151 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-de26230820888151> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0805ce15581c494e kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0805ce15581c494e> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-2777a5a48b024913 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-2777a5a48b024913> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-ceea2ac88226dd12 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-ceea2ac88226dd12> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-b1fb92c024825358 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-b1fb92c024825358> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-623935da1a1aec25 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-623935da1a1aec25> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-42cf350985bb4c7d kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-42cf350985bb4c7d> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-607db9a1ac34d3ee kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-607db9a1ac34d3ee> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-5d0814a8e1aa6591 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-5d0814a8e1aa6591> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-f6e18066753bf5c2 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-f6e18066753bf5c2> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-f84c29a355bfddea kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-f84c29a355bfddea> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-9fabe2425a0b5ff1 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-9fabe2425a0b5ff1> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0784a687026fc8d3 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0784a687026fc8d3> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0cc9d226b57eeac0 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0cc9d226b57eeac0> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-af294b3e55da1421 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-af294b3e55da1421> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-cb8c06200106b636 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-cb8c06200106b636> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-7dc6483f0bfd8ffc kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-7dc6483f0bfd8ffc> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-db82be7e6f0cb58e kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-db82be7e6f0cb58e> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-d4f466b484e67688 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-d4f466b484e67688> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-01e9e337348ff499 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-01e9e337348ff499> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-44c57a5a82a496d1 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-44c57a5a82a496d1> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-44c090f61b0d4960 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-44c090f61b0d4960> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-e06e3c1902e98802 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-e06e3c1902e98802> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-6d0f6a919a2a4923 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-6d0f6a919a2a4923> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-c0522c3f754d32d8 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-c0522c3f754d32d8> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-7f27ecda3bd1f3a8 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-7f27ecda3bd1f3a8> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-a2be588ecff82842 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-a2be588ecff82842> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-626ee0da1e3310a4 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-626ee0da1e3310a4> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-2fff25441a2f39cc kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-2fff25441a2f39cc> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-205ecf7ffc2e33fc kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-205ecf7ffc2e33fc> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-aadccf162a0ff15c kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-aadccf162a0ff15c> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-20e29cd9ddfcc310 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-20e29cd9ddfcc310> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-59ce442c65d655af kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-59ce442c65d655af> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-accf891e5b0d110c kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-accf891e5b0d110c> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-930d6fb89e408a31 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-930d6fb89e408a31> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-d17ae940c2f6f544 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-d17ae940c2f6f544> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-4d83b84be58a0907 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-4d83b84be58a0907> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-6e666b64f53bf19f kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-6e666b64f53bf19f> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-a5554908e42c233d kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-a5554908e42c233d> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-df03107e99d890da kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-df03107e99d890da> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-f9f15777700dbbe9 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-f9f15777700dbbe9> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-18f0489021ab4b27 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-18f0489021ab4b27> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-8fbaf9c3b4fa4dbb kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-8fbaf9c3b4fa4dbb> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-9fda8c932217890a kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-9fda8c932217890a> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-a4813b34ec4bc13a kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-a4813b34ec4bc13a> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-5b81174cd66d48ca kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-5b81174cd66d48ca> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-828484444ced60aa kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-828484444ced60aa> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-a975b9fa0bc00db7 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-a975b9fa0bc00db7> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-fcc8e6731ab595bb kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-fcc8e6731ab595bb> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-c516b7b116a2fb09 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-c516b7b116a2fb09> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-d97b225978cc9383 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-d97b225978cc9383> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-2b47424cc2555723 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-2b47424cc2555723> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-26cd6ac0c48a301c kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-26cd6ac0c48a301c> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-00e8614d85479481 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-00e8614d85479481> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-173198233c335ce5 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-173198233c335ce5> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-2a2ceb8fc1c710ce kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-2a2ceb8fc1c710ce> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-7f9827426ff45f37 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-7f9827426ff45f37> has no kb:hasTag
> ... (649 more line(s) in the kb:Failure / source)

- Rule: fix the mechanism on the real artifact; no test is deleted, skipped, xfail'd or loosened to make the defect disappear.
- Rule: provisiond's own files (/var/spool/weaverd-provision*, /etc/provisiond*), installed units + drop-ins under /etc/systemd/system, sudo/sudoers, weaver-server unit files, destructive project ops (drop/deinit/force-reinit, history rewrite), pushes off the forge mesh and billing/subscription surfaces are ASK-FIRST: a worker that reaches one writes a kb:Question naming it and says so in `summary` -- never in blockers[].
- Rule: any further failure seen while working is logged (`rev log failure`) and named in `summary` for the foreground to enqueue -- never "pre-existing, skipped".
