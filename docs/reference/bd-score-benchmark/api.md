> **Doc Classification:** Living Reference (Diátaxis) — Reference API surface for SF19 primitive and BD adapter.

# BD Score Benchmark API Reference

## Packages

- Primitive: `@hbc/score-benchmark`
- Adapter: `@hbc/features-business-development`

## Canonical Primitive Contracts

- `IScorecardBenchmark`
- `IBenchmarkConfidence`
- `ISimilarityModelResult`
- `IBenchmarkRecommendation`
- `IReviewerConsensus`
- `IFilterGovernanceEvent`
- `IRecalibrationSignal`
- `IBenchmarkFilterContext`
- `IScoreGhostOverlayState`
- `IScoreBenchmarkTelemetryState`

## Primitive Public Runtime Surface

### APIs

- `ScoreBenchmarkApi`
- `ScoreBenchmarkLifecycleApi`

### Hooks

- `useScoreBenchmarkState`
- `useScoreBenchmarkFilters`
- `useBenchmarkDecisionSupport`

### Components / presentational contracts

- primitive component barrels from `@hbc/score-benchmark` (if consumed)

### Testing exports

From `@hbc/score-benchmark/testing`:

- `createMockScorecardBenchmark(overrides?)`
- `createMockScoreGhostOverlayState(overrides?)`
- `createMockBenchmarkFilterContext(overrides?)`
- `createMockBenchmarkConfidence(overrides?)`
- `createMockSimilarityResult(overrides?)`
- `createMockBenchmarkRecommendation(overrides?)`
- `createMockReviewerConsensus(overrides?)`
- `createMockFilterGovernanceEvent(overrides?)`
- `mockScoreBenchmarkStates`

## BD Adapter Public Surface

### Hooks

- `useScoreBenchmark`

### Components

- `ScoreBenchmarkGhostOverlay`
- `BenchmarkSummaryPanel`
- `WinZoneIndicator`
- `BenchmarkFilterPanel`
- `SimilarPursuitsPanel`
- `BenchmarkExplainabilityPanel`
- `ReviewerConsensusPanel`

### Testing exports

From `@hbc/features-business-development/testing`:

- `createMockScoreBenchmarkProfile(overrides?)`
- `createMockBdScoreBenchmarkView(overrides?)`

## Boundary Notes

- Canonical benchmark semantics are primitive-owned in `@hbc/score-benchmark`.
- BD adapter consumes primitive public contracts and projects UI/composition state only.
- No deep/private import paths are part of the supported API contract.

## Related Artifacts

- [SF19 Master Plan](/Users/bobbyfetting/hb-intel/docs/architecture/plans/shared-features/SF19-BD-Score-Benchmark.md)
- [ADR-0108](/Users/bobbyfetting/hb-intel/docs/architecture/adr/ADR-0108-bd-score-benchmark-ghost-overlay.md)
- [ADR-0112](/Users/bobbyfetting/hb-intel/docs/architecture/adr/ADR-0112-score-benchmark-primitive-runtime.md)
