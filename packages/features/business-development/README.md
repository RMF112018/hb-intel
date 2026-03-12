> **Doc Classification:** Living Reference (Diataxis) - package-level implementation detail for the Business Development feature adapter.

# @hbc/features-business-development

Business Development feature package adapters and composition surfaces.

## BD Score Benchmark Adapter Overview

The `score-benchmark` surface in this package is an adapter/composition layer over `@hbc/score-benchmark`. It owns profile defaults, recommendation copy scaffolding, and UI composition for Business Development.

## Profile Defaults and Composition Points

- profile defaults are defined in `src/score-benchmark/profiles`
- adapter mapping functions are defined in `src/score-benchmark/adapters`
- composition hooks are defined in `src/score-benchmark/hooks`
- recommendation/explainability/consensus side-panel surfaces are defined in `src/score-benchmark/components`

## Complexity and Side-Panel Behavior Summary

Scaffolded side-panel surfaces for SF19 include:

- `SimilarPursuitsPanel`
- `BenchmarkExplainabilityPanel`
- `ReviewerConsensusPanel`

These are composition-layer components and do not own primitive governance or recalibration logic.

## Linkbacks

- Primitive package docs: [`@hbc/score-benchmark`](../../score-benchmark/README.md)
- SF19 plan family: [SF19 master](../../../docs/architecture/plans/shared-features/SF19-BD-Score-Benchmark.md)
- SF19 package scaffold task: [SF19-T01](../../../docs/architecture/plans/shared-features/SF19-T01-Package-Scaffold.md)
