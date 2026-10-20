---
project: g3_toolkit
slug: heal-g3_toolkit-verify-drift-6dd49632-20261020t125936z
title: Heal verify-drift in g3_toolkit: I-30: 849 finding(s)
heal_signature: 6dd496320dc261bd
heal_kind: verify-drift
seat_pin: jake
merge_target: work/post-rc007
abstract: rev heal report verify-drift in g3_toolkit (sig 6dd496320dc261bd): I-30: 849 finding(s)
tags: heal, verify-drift, g3_toolkit
---

# Plan -- heal verify-drift in g3_toolkit (sig 6dd496320dc261bd)

Written by `rev heal report` (zero-LLM, self-heal doctrine A6/A9). The defect was recorded as kb:Failure https://loom.ghostsystems.ai/spindle_g3_toolkit/Failure/heal-verify-drift-6dd49632; budget $15.00.

## §1 Investigate, root-cause, fix the mechanism on the real artifact, test, commit, prove
<!-- kb:order 1 kb:kind code kb:executor claude kb:model opus kb:touches docs/plans/heal/g3_toolkit-verify-drift-6dd49632-20261020t125936z.md kb:checkKind fable-judgment -->

Reproduce the defect below on the real artifact (not a fixture), find the mechanism that produced it and fix THAT, not the symptom. Add a regression test that fails before the fix and passes after, bump the project version per its rule, commit, push, and prove the fix by re-running the reproduction. Evidence (verbatim):

> [warning] https://loom.ghostsystems.ai/specter_site/Decision/git-06d927ec9231-a0328b1f kb:Decision <https://loom.ghostsystems.ai/specter_site/Decision/git-06d927ec9231-a0328b1f> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/specter_site/Decision/git-61e48b2a4e78-e64b84cd kb:Decision <https://loom.ghostsystems.ai/specter_site/Decision/git-61e48b2a4e78-e64b84cd> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/specter_site/Decision/git-dbe5c0581d1a-84c35d4d kb:Decision <https://loom.ghostsystems.ai/specter_site/Decision/git-dbe5c0581d1a-84c35d4d> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-000462a025eb4eb5 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-000462a025eb4eb5> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-0111ab7b59a0abbe kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-0111ab7b59a0abbe> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-015d6cfabb430f7f kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-015d6cfabb430f7f> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-02054cf59d297074 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-02054cf59d297074> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-0338e3626ce6d7ee kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-0338e3626ce6d7ee> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-03621c4326c3a66d kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-03621c4326c3a66d> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-03f49ff10994e7da kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-03f49ff10994e7da> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-050f007617309ad2 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-050f007617309ad2> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-05958753332a4ce8 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-05958753332a4ce8> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-062216fe63f014be kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-062216fe63f014be> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-070ba29a0d64544a kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-070ba29a0d64544a> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-078347b31b352b87 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-078347b31b352b87> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-07af7ae8ff99bb16 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-07af7ae8ff99bb16> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-084b7e25d809aae0 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-084b7e25d809aae0> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-08b9172d0ebbb9c8 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-08b9172d0ebbb9c8> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-09723c200159209b kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-09723c200159209b> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-09e7de436a9b6fe3 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-09e7de436a9b6fe3> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-09fc9e2325b399d8 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-09fc9e2325b399d8> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-0a87ba408000ffba kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-0a87ba408000ffba> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-0b61ca02428f525a kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-0b61ca02428f525a> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-0c8ad1c9f55aeb9f kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-0c8ad1c9f55aeb9f> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-0ca786715c8d68df kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-0ca786715c8d68df> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-0f60c0ad9a1ceee8 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-0f60c0ad9a1ceee8> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-0f97cf1793d9c84a kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-0f97cf1793d9c84a> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-0fce04d24dc4a151 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-0fce04d24dc4a151> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1229d64935ac7df2 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1229d64935ac7df2> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-128273c587e4219a kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-128273c587e4219a> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-13685fcd11399a76 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-13685fcd11399a76> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-13a29d205474ae08 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-13a29d205474ae08> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-13bf28fa2b3cf9e8 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-13bf28fa2b3cf9e8> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-13eeab0e50fee4fa kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-13eeab0e50fee4fa> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-14293ddfa0b82ca9 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-14293ddfa0b82ca9> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-14d63a5b4c81bb44 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-14d63a5b4c81bb44> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-15ced4f8ccc10129 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-15ced4f8ccc10129> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1633108413ff9612 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1633108413ff9612> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-16568304c8537d5e kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-16568304c8537d5e> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-167abff19023076a kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-167abff19023076a> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-170442ffd280eba8 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-170442ffd280eba8> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1705945c5aa44be3 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1705945c5aa44be3> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-171f29c3dbb100e2 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-171f29c3dbb100e2> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1750fa5e98dd376b kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1750fa5e98dd376b> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-175b587972ae6817 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-175b587972ae6817> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1783956430612625 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1783956430612625> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-17989bcf99923584 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-17989bcf99923584> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-18070f9885b48947 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-18070f9885b48947> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-18137843e373ae62 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-18137843e373ae62> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1a5d51b97d2dd63c kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1a5d51b97d2dd63c> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1b3c9f4cd35ec0d9 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1b3c9f4cd35ec0d9> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1b9cc8548a80409c kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1b9cc8548a80409c> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1be59d16fbf57261 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1be59d16fbf57261> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1c0765332f5298c6 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1c0765332f5298c6> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1c92c9fa4565f1c6 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1c92c9fa4565f1c6> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1d74524910c50d2b kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1d74524910c50d2b> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1d832c729f6212a9 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1d832c729f6212a9> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1e8cbd45e434c04e kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1e8cbd45e434c04e> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1f094ed0e71e3eb0 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1f094ed0e71e3eb0> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1f51d96d77815433 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1f51d96d77815433> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1f889c19bea38b81 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1f889c19bea38b81> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1fb1f4e3a0c2bd14 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1fb1f4e3a0c2bd14> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1ff1651a5c55bd41 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-1ff1651a5c55bd41> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-20b034611b6d03cd kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-20b034611b6d03cd> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-2107add0056346f4 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-2107add0056346f4> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-213239ee93f86615 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-213239ee93f86615> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-2181c86dff9d752c kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-2181c86dff9d752c> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-21b4cb8c387aac86 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-21b4cb8c387aac86> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-21b5cf6da17bdd5f kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-21b5cf6da17bdd5f> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-23813b1eb9a6567e kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-23813b1eb9a6567e> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-239660f16f78ba78 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-239660f16f78ba78> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-23a76bdf47191f9a kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-23a76bdf47191f9a> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-23b8609980670fc7 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-23b8609980670fc7> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-23cb5447d0d31c57 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-23cb5447d0d31c57> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-24263a6b888ca871 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-24263a6b888ca871> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-24698655a73b4237 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-24698655a73b4237> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-2585bbee36fe5705 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-2585bbee36fe5705> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-25edef78a53bb6a0 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-25edef78a53bb6a0> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-26a96c0172c0a865 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-26a96c0172c0a865> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-26d5a7b457606e6f kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-26d5a7b457606e6f> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-27a10670a96e74de kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-27a10670a96e74de> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-27ca660a5de52e1d kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-27ca660a5de52e1d> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-28455f633d0f7c3b kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-28455f633d0f7c3b> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-287fb3e5a46d0dff kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-287fb3e5a46d0dff> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-28a1d89e198ef9ef kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-28a1d89e198ef9ef> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-2a768a76cb10da64 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-2a768a76cb10da64> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-2b6522791a88aa9f kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-2b6522791a88aa9f> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-2ba8e389d5636716 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-2ba8e389d5636716> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-2cd211c9a7d0b532 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-2cd211c9a7d0b532> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-2d78ac1dcd8e0d67 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-2d78ac1dcd8e0d67> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-2d78da94c6d29121 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-2d78da94c6d29121> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-2d7f9e3ec5657931 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-2d7f9e3ec5657931> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-2df3f03a3a04c763 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-2df3f03a3a04c763> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-2e72df6a54292bc7 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-2e72df6a54292bc7> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-2e8a513d5e050172 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-2e8a513d5e050172> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-2eca5a312c754d52 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-2eca5a312c754d52> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-2f49266e429a61dc kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-2f49266e429a61dc> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-3089a14232918afd kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-3089a14232918afd> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-318241714668f560 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-318241714668f560> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-31cc53432e6ba455 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-31cc53432e6ba455> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-31d7c3450e14cb35 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-31d7c3450e14cb35> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-3362ddded0e79ab5 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-3362ddded0e79ab5> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-337a1a1b9cdfe0a5 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-337a1a1b9cdfe0a5> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-3513fdb46a00587c kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-3513fdb46a00587c> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-351d2b0914150679 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-351d2b0914150679> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-3541ca96185109c2 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-3541ca96185109c2> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-35767daf98a5ddc8 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-35767daf98a5ddc8> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-35be39ec676c47ff kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-35be39ec676c47ff> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-35d32630ed1fba9c kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-35d32630ed1fba9c> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-35e42ea4a477f8d0 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-35e42ea4a477f8d0> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-364db7f06ab044f9 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-364db7f06ab044f9> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-36a251650cfd8355 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-36a251650cfd8355> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-3938b790b219c34a kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-3938b790b219c34a> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-39a4d3f75133c52a kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-39a4d3f75133c52a> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-3a82c0e058fbbe41 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-3a82c0e058fbbe41> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-3b21822585da6cdb kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-3b21822585da6cdb> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-3b887921903429ce kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-3b887921903429ce> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-3b9a7bc2d05d0d6c kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-3b9a7bc2d05d0d6c> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-3c636b6460d74d75 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-3c636b6460d74d75> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-3c662384ec2d345e kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-3c662384ec2d345e> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-3c86a6fd4a7b0ccf kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-3c86a6fd4a7b0ccf> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-3c9e330f0de25be2 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-3c9e330f0de25be2> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-3d226c0f61976ca2 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-3d226c0f61976ca2> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-3ef81b0f98d307e2 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-3ef81b0f98d307e2> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-3fb8d7b3d2ab6e7a kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-3fb8d7b3d2ab6e7a> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4092b9bbc36b89bd kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4092b9bbc36b89bd> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-40e6c5a77044537d kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-40e6c5a77044537d> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-40f149a0389b0876 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-40f149a0389b0876> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4146d6179f33c03f kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4146d6179f33c03f> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-416a6a5a28ef259f kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-416a6a5a28ef259f> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-418fcd7eb3b0ba3f kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-418fcd7eb3b0ba3f> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-41f8625fa943c093 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-41f8625fa943c093> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-41fa701f45d58725 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-41fa701f45d58725> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-43022352d3453356 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-43022352d3453356> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-437daecf5530bbde kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-437daecf5530bbde> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-43a7cf35e33bdf34 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-43a7cf35e33bdf34> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-44967f37651b1a72 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-44967f37651b1a72> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-44c44359c19bbd60 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-44c44359c19bbd60> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-455cdb4afb82329a kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-455cdb4afb82329a> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4560d34f6f5a4d30 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4560d34f6f5a4d30> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-45cd2f8860ec2173 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-45cd2f8860ec2173> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4618f5eea0d7f146 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4618f5eea0d7f146> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-46792dc1966f1c96 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-46792dc1966f1c96> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4733f47095f7d927 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4733f47095f7d927> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4755db3b8344da09 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4755db3b8344da09> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-475c43e5656721a2 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-475c43e5656721a2> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-477385907e41e122 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-477385907e41e122> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-47c8f75213694441 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-47c8f75213694441> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-481a49d3cccd6956 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-481a49d3cccd6956> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-49228405c2ebdead kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-49228405c2ebdead> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-49ad5e0553722130 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-49ad5e0553722130> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4a068781905a45d1 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4a068781905a45d1> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4aa61dbacb22128a kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4aa61dbacb22128a> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4ac046990f888529 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4ac046990f888529> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4acae2a83d51dbb4 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4acae2a83d51dbb4> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4b2a57de8b891b53 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4b2a57de8b891b53> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4b40015151aefb7c kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4b40015151aefb7c> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4ba5899f8bc95450 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4ba5899f8bc95450> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4be6ca37ada52afc kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4be6ca37ada52afc> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4c901fd2f7f014c1 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4c901fd2f7f014c1> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4cc7f6120d80f61a kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4cc7f6120d80f61a> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4d435a357a951d9f kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4d435a357a951d9f> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4d761cbb3fd3e7a0 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4d761cbb3fd3e7a0> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4e311e8d774a9963 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4e311e8d774a9963> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4e7c5ee1847a2fa7 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4e7c5ee1847a2fa7> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4e961bcdc76042e1 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4e961bcdc76042e1> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4eee1d70313fd722 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4eee1d70313fd722> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4f79d22cf83656b9 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-4f79d22cf83656b9> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-5038efa88f53eed3 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-5038efa88f53eed3> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-50b87f6239bdc4a4 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-50b87f6239bdc4a4> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-50da7b8c27a28f2e kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-50da7b8c27a28f2e> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-521e1377af500aac kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-521e1377af500aac> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-528c76b806727ad4 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-528c76b806727ad4> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-53ae473f1f824692 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-53ae473f1f824692> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-53b21dbc05b9cc9b kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-53b21dbc05b9cc9b> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-5492db024c28e2f8 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-5492db024c28e2f8> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-55ea9c0583709509 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-55ea9c0583709509> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-56e8d754205a8199 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-56e8d754205a8199> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-578687b314cca70b kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-578687b314cca70b> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-57ca26ec869149d0 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-57ca26ec869149d0> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-58f80e41c1e8ae50 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-58f80e41c1e8ae50> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-5a574849f3ecd735 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-5a574849f3ecd735> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-5b6502f9cbf98a98 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-5b6502f9cbf98a98> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-5bcfa6f16bb0ea48 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-5bcfa6f16bb0ea48> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-5c1be1804ff17339 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-5c1be1804ff17339> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-5d2f07aa3269794b kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-5d2f07aa3269794b> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-5d8c3c5f1001835b kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-5d8c3c5f1001835b> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-5d94d2e3c3dde1c9 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-5d94d2e3c3dde1c9> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-5df86a19bfcf5c70 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-5df86a19bfcf5c70> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-5e34cfff7c27aaca kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-5e34cfff7c27aaca> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-5e829319cb3c3851 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-5e829319cb3c3851> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-5ef9a8dd86a97e46 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-5ef9a8dd86a97e46> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-60e11fa332e1fe83 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-60e11fa332e1fe83> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-61e5c8c37dedf8d4 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-61e5c8c37dedf8d4> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-621579a8dbd3d124 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-621579a8dbd3d124> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-622dabab97590b11 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-622dabab97590b11> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-626838ac3b8fe158 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-626838ac3b8fe158> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-6277739c8ebfb966 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-6277739c8ebfb966> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-6284798703156f4b kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-6284798703156f4b> has no kb:hasTag
> [warning] https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-62c3265955c92716 kb:Decision <https://loom.ghostsystems.ai/spindle_g3_toolkit/Decision/dist-62c3265955c92716> has no kb:hasTag
> ... (649 more line(s) in the kb:Failure / source)

- Rule: fix the mechanism on the real artifact; no test is deleted, skipped, xfail'd or loosened to make the defect disappear.
- Rule: provisiond's own files (/var/spool/weaverd-provision*, /etc/provisiond*), installed units + drop-ins under /etc/systemd/system, sudo/sudoers, weaver-server unit files, destructive project ops (drop/deinit/force-reinit, history rewrite), pushes off the forge mesh and billing/subscription surfaces are ASK-FIRST: a worker that reaches one writes a kb:Question naming it and says so in `summary` -- never in blockers[].
- Rule: any further failure seen while working is logged (`rev log failure`) and named in `summary` for the foreground to enqueue -- never "pre-existing, skipped".
