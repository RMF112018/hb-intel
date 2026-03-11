# SF19-T03 - Benchmark Lifecycle and API

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-19-Module-Feature-BD-Score-Benchmark.md`
**Decisions Applied:** L-01, L-02, L-04, L-06
**Estimated Effort:** 1.0 sprint-weeks
**Depends On:** T02

> **Doc Classification:** Canonical Normative Plan - SF19-T03 lifecycle/api task; sub-plan of `SF19-BD-Score-Benchmark.md`.

---

## Objective

Define primitive-owned benchmark lifecycle, storage semantics, and API contracts for BD and future module adapters.

---

## Benchmark Lifecycle (`@hbc/score-benchmark`)

- source inputs:
  - closed scorecards with outcomes
  - seeded historical data imports
  - post-bid learning loop outcome enrichments
- lifecycle behavior:
  - scheduled recompute job for baseline aggregates
  - on-demand recompute hooks for admin-governed refresh scenarios
- output granularity:
  - aggregate rows by criterion + filter dimensions
- privacy/governance:
  - aggregate benchmark values in read path
  - immutable version and provenance metadata via `@hbc/versioned-record`
  - Go/No-Go snapshot freeze support

---

## Win Zone and Significance Rules

- if `sampleSize < BENCHMARK_MIN_SAMPLE_SIZE`, mark criterion insufficient
- Win Zone range is computed from won-distribution benchmark model
- `distanceToWinZone` compares current overall score to win-zone entry threshold
- each below-zone criterion emits BIC ownership projection contract (`@hbc/bic-next-move`)

---

## API Contracts

`ScoreBenchmarkApi`:
- `getOverlayState(entityId, filterContext)`
- `getCriterionBenchmarks(filterContext)`
- `getOverallSummary(filterContext)`
- `queueBenchmarkMutation(mutation)` for offline/queued writes

`ScoreBenchmarkLifecycleApi`:
- `runScheduledRecompute()`
- `runOnDemandRecompute(filterContext, requestedBy)`
- `freezeSnapshot(entityId, snapshotReason)`

---

## Verification Commands

```bash
pnpm --filter @hbc/score-benchmark test -- lifecycle
pnpm --filter @hbc/score-benchmark test -- api
pnpm --filter @hbc/score-benchmark check-types
```
