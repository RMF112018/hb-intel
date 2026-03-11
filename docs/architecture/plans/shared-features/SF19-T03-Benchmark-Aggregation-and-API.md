# SF19-T03 - Benchmark Aggregation and API

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-19-Module-Feature-BD-Score-Benchmark.md`
**Decisions Applied:** D-02 through D-06
**Estimated Effort:** 0.95 sprint-weeks
**Depends On:** T02

> **Doc Classification:** Canonical Normative Plan - SF19-T03 aggregation/api task; sub-plan of `SF19-BD-Score-Benchmark.md`.

---

## Objective

Define nightly benchmark aggregation, storage semantics, and read APIs for score overlay consumers.

---

## Aggregation Pipeline

- source inputs:
  - closed BD scorecards with outcomes
  - seeded historical data imports
  - post-bid learning loop outcome enrichments
- schedule: nightly timer function (`BENCHMARK_REFRESH_CRON`)
- output granularity: aggregate rows by criterion + filter dimensions
- privacy rule: store aggregate statistics only, never raw pursuit-level details in overlay list

---

## Significance and Win Zone Rules

- if `sampleSize < BENCHMARK_MIN_SAMPLE_SIZE`, mark criterion insufficient
- win zone is `[winZoneMin, winZoneMax]` from won-distribution percentile band
- `distanceToWinZone` uses overall score against overall win-zone minimum

---

## API Contracts

`ScoreBenchmarkApi`:

- `getOverlayState(scorecardId, filterContext)`
- `getCriterionBenchmarks(filterContext)`
- `getOverallSummary(filterContext)`

`ScoreBenchmarkAggregationApi`:

- `runNightlyAggregation()`
- `rebuildForFilterContext(filterContext)` (admin/manual)

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development test -- aggregation
pnpm --filter @hbc/features-business-development test -- api
```
