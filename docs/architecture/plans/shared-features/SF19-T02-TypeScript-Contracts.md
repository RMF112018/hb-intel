# SF19-T02 - TypeScript Contracts: Score Benchmark

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-19-Module-Feature-BD-Score-Benchmark.md`
**Decisions Applied:** D-02 through D-07, D-10
**Estimated Effort:** 0.65 sprint-weeks
**Depends On:** T01

> **Doc Classification:** Canonical Normative Plan - SF19-T02 contracts task; sub-plan of `SF19-BD-Score-Benchmark.md`.

---

## Objective

Lock all public contracts for criterion benchmarks, overlay state, filter context, and hook return types.

---

## Types to Define

```ts
export interface IScorecardBenchmark {
  criterionId: string;
  criterionLabel: string;
  winAvg: number | null;
  lossAvg: number | null;
  winZoneMin: number | null;
  winZoneMax: number | null;
  sampleSize: number;
  isStatisticallySignificant: boolean;
}

export interface IBenchmarkFilterContext {
  projectType?: string;
  valueRange?: [number, number];
  geography?: string;
  ownerType?: string;
}

export interface IScoreGhostOverlayState {
  benchmarks: IScorecardBenchmark[];
  overallWinAvg: number | null;
  overallLossAvg: number | null;
  overallWinZoneMin: number | null;
  overallWinZoneMax: number | null;
  distanceToWinZone: number | null;
  filterContext: IBenchmarkFilterContext;
  benchmarkGeneratedAt: string;
}
```

---

## Hook Return Contracts

- `useScoreBenchmark` returns overlay state, significance metadata, loading/error, and refresh.
- `useBenchmarkFilters` returns current filter, mutation actions, reset defaults, and validation state.

---

## Constants to Lock

- `BENCHMARK_MIN_SAMPLE_SIZE = 5`
- `BENCHMARK_LIST_TITLE = 'HBC_ScorecardBenchmarks'`
- `BENCHMARK_REFRESH_CRON = '0 0 * * *'` (nightly)
- `BENCHMARK_STALE_MS = 86_400_000`

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development check-types
pnpm --filter @hbc/features-business-development test -- contracts
```
