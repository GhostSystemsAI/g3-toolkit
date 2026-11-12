---
project: g3_toolkit
slug: heal-g3_toolkit-verify-drift-023a77d8-20261021t010322z
title: Heal verify-drift in g3_toolkit: I-27: 1472 finding(s)
heal_signature: 023a77d8b03f2f54
heal_kind: verify-drift
seat_pin: jake
merge_target: work/post-rc007
abstract: rev heal report verify-drift in g3_toolkit (sig 023a77d8b03f2f54): I-27: 1472 finding(s)
tags: heal, verify-drift, g3-toolkit
---

# Plan -- heal verify-drift in g3_toolkit (sig 023a77d8b03f2f54)

Written by `rev heal report` (zero-LLM, self-heal doctrine A6/A9). The defect was recorded as kb:Failure https://loom.ghostsystems.ai/spindle_g3_toolkit/Failure/heal-verify-drift-023a77d8; budget $15.00.

## §1 Investigate, root-cause, fix the mechanism on the real artifact, test, commit, prove
<!-- kb:order 1 kb:kind code kb:executor claude kb:model opus kb:touches docs/plans/heal/g3_toolkit-verify-drift-023a77d8-20261021t010322z.md kb:checkKind fable-judgment -->

Reproduce the defect below on the real artifact (not a fixture), find the mechanism that produced it and fix THAT, not the symptom. Add a regression test that fails before the fix and passes after, bump the project version per its rule, commit, push, and prove the fix by re-running the reproduction. Evidence (verbatim):

> kb verify I-27
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/ci-ingest-6f4f68a7fa kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/ci-ingest-6f4f68a7fa> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/ci-ingest-6f4f68a7fa kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/ci-ingest-6f4f68a7fa> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/ci-ingest-6f4f68a7fa kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/ci-ingest-6f4f68a7fa> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/ci-ingest-6f4f68a7fa kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/ci-ingest-6f4f68a7fa> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/ci-ingest-6f4f68a7fa kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/ci-ingest-6f4f68a7fa> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-00e8614d85479481 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-00e8614d85479481> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-00e8614d85479481 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-00e8614d85479481> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-00e8614d85479481 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-00e8614d85479481> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-00e8614d85479481 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-00e8614d85479481> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-00e8614d85479481 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-00e8614d85479481> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-01be451916f6bc0d kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-01be451916f6bc0d> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-01be451916f6bc0d kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-01be451916f6bc0d> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-01be451916f6bc0d kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-01be451916f6bc0d> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-01be451916f6bc0d kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-01be451916f6bc0d> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-01be451916f6bc0d kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-01be451916f6bc0d> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-01e9e337348ff499 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-01e9e337348ff499> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-01e9e337348ff499 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-01e9e337348ff499> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-01e9e337348ff499 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-01e9e337348ff499> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-01e9e337348ff499 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-01e9e337348ff499> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-01e9e337348ff499 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-01e9e337348ff499> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-04a61d1dac03f988 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-04a61d1dac03f988> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-04a61d1dac03f988 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-04a61d1dac03f988> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-04a61d1dac03f988 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-04a61d1dac03f988> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-04a61d1dac03f988 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-04a61d1dac03f988> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-04a61d1dac03f988 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-04a61d1dac03f988> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-067032b80af16b1e kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-067032b80af16b1e> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-067032b80af16b1e kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-067032b80af16b1e> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-067032b80af16b1e kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-067032b80af16b1e> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-067032b80af16b1e kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-067032b80af16b1e> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-067032b80af16b1e kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-067032b80af16b1e> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0670d9337eca5e14 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0670d9337eca5e14> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0670d9337eca5e14 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0670d9337eca5e14> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0670d9337eca5e14 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0670d9337eca5e14> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0670d9337eca5e14 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0670d9337eca5e14> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0670d9337eca5e14 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0670d9337eca5e14> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-070dd9d179e614a6 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-070dd9d179e614a6> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-070dd9d179e614a6 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-070dd9d179e614a6> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-070dd9d179e614a6 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-070dd9d179e614a6> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-070dd9d179e614a6 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-070dd9d179e614a6> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-070dd9d179e614a6 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-070dd9d179e614a6> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0784a687026fc8d3 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0784a687026fc8d3> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0784a687026fc8d3 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0784a687026fc8d3> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0784a687026fc8d3 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0784a687026fc8d3> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0784a687026fc8d3 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0784a687026fc8d3> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0784a687026fc8d3 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0784a687026fc8d3> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0805ce15581c494e kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0805ce15581c494e> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0805ce15581c494e kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0805ce15581c494e> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0805ce15581c494e kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0805ce15581c494e> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0805ce15581c494e kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0805ce15581c494e> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0805ce15581c494e kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0805ce15581c494e> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0a080ca4fe2e78e7 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0a080ca4fe2e78e7> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0a080ca4fe2e78e7 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0a080ca4fe2e78e7> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0a080ca4fe2e78e7 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0a080ca4fe2e78e7> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0a080ca4fe2e78e7 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0a080ca4fe2e78e7> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0a080ca4fe2e78e7 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0a080ca4fe2e78e7> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0b7a5f992786fe7c kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0b7a5f992786fe7c> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0b7a5f992786fe7c kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0b7a5f992786fe7c> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0b7a5f992786fe7c kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0b7a5f992786fe7c> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0b7a5f992786fe7c kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0b7a5f992786fe7c> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0b7a5f992786fe7c kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0b7a5f992786fe7c> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0c69b32d55afd44a kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0c69b32d55afd44a> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0c69b32d55afd44a kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0c69b32d55afd44a> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0c69b32d55afd44a kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0c69b32d55afd44a> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0c69b32d55afd44a kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0c69b32d55afd44a> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0c69b32d55afd44a kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0c69b32d55afd44a> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0cc9d226b57eeac0 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0cc9d226b57eeac0> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0cc9d226b57eeac0 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0cc9d226b57eeac0> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0cc9d226b57eeac0 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0cc9d226b57eeac0> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0cc9d226b57eeac0 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0cc9d226b57eeac0> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0cc9d226b57eeac0 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0cc9d226b57eeac0> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0d4a24097a5a7378 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0d4a24097a5a7378> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0d4a24097a5a7378 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0d4a24097a5a7378> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0d4a24097a5a7378 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0d4a24097a5a7378> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0d4a24097a5a7378 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0d4a24097a5a7378> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0d4a24097a5a7378 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0d4a24097a5a7378> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0eef007f7ca557a1 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0eef007f7ca557a1> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0eef007f7ca557a1 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0eef007f7ca557a1> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0eef007f7ca557a1 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0eef007f7ca557a1> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0eef007f7ca557a1 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0eef007f7ca557a1> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0eef007f7ca557a1 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-0eef007f7ca557a1> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-105fc3364408604f kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-105fc3364408604f> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-105fc3364408604f kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-105fc3364408604f> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-105fc3364408604f kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-105fc3364408604f> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-105fc3364408604f kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-105fc3364408604f> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-105fc3364408604f kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-105fc3364408604f> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-10649f79d548f967 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-10649f79d548f967> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-10649f79d548f967 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-10649f79d548f967> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-10649f79d548f967 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-10649f79d548f967> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-10649f79d548f967 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-10649f79d548f967> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-10649f79d548f967 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-10649f79d548f967> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-11a77b26f6d36079 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-11a77b26f6d36079> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-11a77b26f6d36079 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-11a77b26f6d36079> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-11a77b26f6d36079 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-11a77b26f6d36079> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-11a77b26f6d36079 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-11a77b26f6d36079> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-11a77b26f6d36079 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-11a77b26f6d36079> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-165d1dc407d89b50 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-165d1dc407d89b50> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-165d1dc407d89b50 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-165d1dc407d89b50> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-165d1dc407d89b50 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-165d1dc407d89b50> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-165d1dc407d89b50 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-165d1dc407d89b50> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-165d1dc407d89b50 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-165d1dc407d89b50> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-173198233c335ce5 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-173198233c335ce5> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-173198233c335ce5 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-173198233c335ce5> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-173198233c335ce5 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-173198233c335ce5> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-173198233c335ce5 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-173198233c335ce5> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-173198233c335ce5 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-173198233c335ce5> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-17f27a83fefb8fdd kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-17f27a83fefb8fdd> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-17f27a83fefb8fdd kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-17f27a83fefb8fdd> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-17f27a83fefb8fdd kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-17f27a83fefb8fdd> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-17f27a83fefb8fdd kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-17f27a83fefb8fdd> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-17f27a83fefb8fdd kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-17f27a83fefb8fdd> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-18f0489021ab4b27 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-18f0489021ab4b27> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-18f0489021ab4b27 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-18f0489021ab4b27> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-18f0489021ab4b27 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-18f0489021ab4b27> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-18f0489021ab4b27 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-18f0489021ab4b27> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-18f0489021ab4b27 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-18f0489021ab4b27> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-193106b9faf28ed8 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-193106b9faf28ed8> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-193106b9faf28ed8 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-193106b9faf28ed8> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-193106b9faf28ed8 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-193106b9faf28ed8> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-193106b9faf28ed8 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-193106b9faf28ed8> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-193106b9faf28ed8 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-193106b9faf28ed8> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1a802a47ef742171 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1a802a47ef742171> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1a802a47ef742171 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1a802a47ef742171> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1a802a47ef742171 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1a802a47ef742171> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1a802a47ef742171 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1a802a47ef742171> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1a802a47ef742171 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1a802a47ef742171> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1ab6baa71fbc678d kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1ab6baa71fbc678d> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1ab6baa71fbc678d kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1ab6baa71fbc678d> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1ab6baa71fbc678d kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1ab6baa71fbc678d> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1ab6baa71fbc678d kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1ab6baa71fbc678d> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1ab6baa71fbc678d kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1ab6baa71fbc678d> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1bc46a01f3449155 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1bc46a01f3449155> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1bc46a01f3449155 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1bc46a01f3449155> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1bc46a01f3449155 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1bc46a01f3449155> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1bc46a01f3449155 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1bc46a01f3449155> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1bc46a01f3449155 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1bc46a01f3449155> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1bf26eb1732ae23c kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1bf26eb1732ae23c> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1bf26eb1732ae23c kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1bf26eb1732ae23c> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1bf26eb1732ae23c kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1bf26eb1732ae23c> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1bf26eb1732ae23c kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1bf26eb1732ae23c> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1bf26eb1732ae23c kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1bf26eb1732ae23c> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1c504ab67b4c70aa kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1c504ab67b4c70aa> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1c504ab67b4c70aa kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1c504ab67b4c70aa> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1c504ab67b4c70aa kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1c504ab67b4c70aa> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1c504ab67b4c70aa kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1c504ab67b4c70aa> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1c504ab67b4c70aa kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1c504ab67b4c70aa> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1ef8c0758b722dbc kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1ef8c0758b722dbc> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1ef8c0758b722dbc kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1ef8c0758b722dbc> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1ef8c0758b722dbc kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1ef8c0758b722dbc> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1ef8c0758b722dbc kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1ef8c0758b722dbc> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1ef8c0758b722dbc kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1ef8c0758b722dbc> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1f2067a472f0c290 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1f2067a472f0c290> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1f2067a472f0c290 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1f2067a472f0c290> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1f2067a472f0c290 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1f2067a472f0c290> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1f2067a472f0c290 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1f2067a472f0c290> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1f2067a472f0c290 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-1f2067a472f0c290> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-205ecf7ffc2e33fc kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-205ecf7ffc2e33fc> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-205ecf7ffc2e33fc kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-205ecf7ffc2e33fc> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-205ecf7ffc2e33fc kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-205ecf7ffc2e33fc> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-205ecf7ffc2e33fc kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-205ecf7ffc2e33fc> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-205ecf7ffc2e33fc kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-205ecf7ffc2e33fc> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-20e29cd9ddfcc310 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-20e29cd9ddfcc310> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-20e29cd9ddfcc310 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-20e29cd9ddfcc310> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-20e29cd9ddfcc310 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-20e29cd9ddfcc310> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-20e29cd9ddfcc310 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-20e29cd9ddfcc310> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-20e29cd9ddfcc310 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-20e29cd9ddfcc310> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-230bb790e5a17a3c kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-230bb790e5a17a3c> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-230bb790e5a17a3c kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-230bb790e5a17a3c> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-230bb790e5a17a3c kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-230bb790e5a17a3c> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-230bb790e5a17a3c kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-230bb790e5a17a3c> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-230bb790e5a17a3c kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-230bb790e5a17a3c> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-23993d6854fcf541 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-23993d6854fcf541> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-23993d6854fcf541 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-23993d6854fcf541> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-23993d6854fcf541 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-23993d6854fcf541> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-23993d6854fcf541 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-23993d6854fcf541> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-23993d6854fcf541 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-23993d6854fcf541> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-248d876cddea7d71 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-248d876cddea7d71> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-248d876cddea7d71 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-248d876cddea7d71> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-248d876cddea7d71 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-248d876cddea7d71> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-248d876cddea7d71 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-248d876cddea7d71> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-248d876cddea7d71 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-248d876cddea7d71> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-26cd6ac0c48a301c kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-26cd6ac0c48a301c> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-26cd6ac0c48a301c kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-26cd6ac0c48a301c> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-26cd6ac0c48a301c kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-26cd6ac0c48a301c> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-26cd6ac0c48a301c kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-26cd6ac0c48a301c> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-26cd6ac0c48a301c kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-26cd6ac0c48a301c> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-27052ea43ff58415 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-27052ea43ff58415> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-27052ea43ff58415 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-27052ea43ff58415> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-27052ea43ff58415 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-27052ea43ff58415> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-27052ea43ff58415 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-27052ea43ff58415> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-27052ea43ff58415 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-27052ea43ff58415> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-272a5fa522653d9b kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-272a5fa522653d9b> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-272a5fa522653d9b kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-272a5fa522653d9b> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-272a5fa522653d9b kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-272a5fa522653d9b> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-272a5fa522653d9b kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-272a5fa522653d9b> missing required predicate kb:rule
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-272a5fa522653d9b kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-272a5fa522653d9b> missing required predicate kb:surface
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-2777a5a48b024913 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-2777a5a48b024913> missing required predicate kb:antiPattern
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-2777a5a48b024913 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-2777a5a48b024913> missing required predicate kb:rationale
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-2777a5a48b024913 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-2777a5a48b024913> missing required predicate kb:remediation
> [error] https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-2777a5a48b024913 kb:Gotcha <https://loom.ghostsystems.ai/spindle_g3_toolkit/Gotcha/dist-2777a5a48b024913> missing required predicate kb:rule
> ... (1273 more line(s) in the kb:Failure / source)

- Rule: fix the mechanism on the real artifact; no test is deleted, skipped, xfail'd or loosened to make the defect disappear.
- Rule: provisiond's own files (/var/spool/weaverd-provision*, /etc/provisiond*), installed units + drop-ins under /etc/systemd/system, sudo/sudoers, weaver-server unit files, destructive project ops (drop/deinit/force-reinit, history rewrite), pushes off the forge mesh and billing/subscription surfaces are ASK-FIRST: a worker that reaches one writes a kb:Question naming it and says so in `summary` -- never in blockers[].
- Rule: any further failure seen while working is logged (`rev log failure`) and named in `summary` for the foreground to enqueue -- never "pre-existing, skipped".
