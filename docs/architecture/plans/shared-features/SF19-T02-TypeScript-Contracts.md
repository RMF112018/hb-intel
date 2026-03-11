# SF19-T02 - TypeScript Contracts: Score Benchmark Primitive + BD Adapter

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-19-Module-Feature-BD-Score-Benchmark.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.75 sprint-weeks
**Depends On:** T01

> **Doc Classification:** Canonical Normative Plan - SF19-T02 contracts task; sub-plan of `SF19-BD-Score-Benchmark.md`.

---

## Objective

Lock primitive-owned public contracts for criterion benchmarks, overlay state, filter context, telemetry, and version metadata. SF19 BD contracts are adapter aliases/projections over primitive types.

---

## Primitive Contracts to Define (`@hbc/score-benchmark`)

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
  ownerBicId?: string;
  ownerAvatarUrl?: string;
}

export interface IBenchmarkFilterContext {
  projectType?: string;
  valueRange?: [number, number];
  geography?: string;
  ownerType?: string;
}

export interface IScoreBenchmarkTelemetryState {
  timeToGoNoGoMs: number | null;
  gapClosureLatencyMs: number | null;
  pctScorecardsReachingWinZone: number | null;
  winRateCorrelationLift: number | null;
  benchmarkCes: number | null;
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
  version: VersionedRecord;
  telemetry: IScoreBenchmarkTelemetryState;
  syncStatus: 'synced' | 'saved-locally' | 'queued-to-sync';
}
```

---

## Adapter Contracts (`@hbc/features-business-development`)

- adapter contracts map primitive state into BD labels, badges, and panel composition props
- adapter contracts must not redefine benchmark math or telemetry semantics
- adapter contracts must preserve primitive version metadata and sync status fields

---

## Constants to Lock

- `BENCHMARK_MIN_SAMPLE_SIZE = 5`
- `BENCHMARK_STALE_MS = 86_400_000`
- `BENCHMARK_SYNC_QUEUE_KEY = 'score-benchmark-sync-queue'`
- `BENCHMARK_STATUS_BANDS = ['below', 'borderline', 'win-zone']`

---

## Verification Commands

```bash
pnpm --filter @hbc/score-benchmark check-types
pnpm --filter @hbc/score-benchmark test -- contracts
pnpm --filter @hbc/features-business-development check-types
```
