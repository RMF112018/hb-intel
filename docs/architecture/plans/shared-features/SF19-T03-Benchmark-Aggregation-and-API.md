# SF19-T03 - Benchmark Lifecycle and API

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-19-Module-Feature-BD-Score-Benchmark.md`
**Decisions Applied:** L-01, L-02, L-04, L-06, L-07, L-08, L-09, L-10
**Estimated Effort:** 1.2 sprint-weeks
**Depends On:** T02

> **Doc Classification:** Canonical Normative Plan - SF19-T03 lifecycle/api task; sub-plan of `SF19-BD-Score-Benchmark.md`.

---

## Objective

Define primitive-owned benchmark lifecycle, governance semantics, recommendation derivation, and recalibration APIs for BD and future module adapters.

---

## Benchmark Lifecycle (`@hbc/score-benchmark`)

- source inputs:
  - closed scorecards with outcomes (`won`, `lost`, `no-bid`)
  - seeded historical data imports
  - SF22 post-bid learning loop enrichments
- lifecycle behavior:
  - scheduled recompute job for baseline aggregates
  - confidence score recompute per criterion and overall cohort
  - recommendation-state recompute on score/filter/reviewer deltas
  - predictive-value monitor job to detect drift and emit recalibration signals
  - on-demand recompute hooks for admin-governed refresh scenarios
- output granularity:
  - aggregate rows by criterion + filter dimensions + similarity factor profile
- privacy/governance:
  - aggregate benchmark values in read path
  - immutable version and provenance metadata via `@hbc/versioned-record`
  - Go/No-Go snapshot freeze support including filter/recommendation/confidence context

---

## Win Zone, Loss Risk Zone, and Overlap Rules

- if `sampleSize < BENCHMARK_MIN_SAMPLE_SIZE`, mark criterion confidence as `insufficient`
- Win Zone range is computed from won-distribution benchmark model
- Loss Risk Zone range is computed from lost-distribution benchmark model
- overlap handling precedence:
  1. if overlap and confidence is low/insufficient -> recommendation cannot exceed `hold-for-review`
  2. if overlap and consensus is weak -> recommendation cannot exceed `pursue-with-caution`
  3. if overlap is absent and confidence/similarity/consensus are strong -> `pursue` path may apply
- `distanceToWinZone` compares current overall score to win-zone entry threshold
- each below-zone criterion emits BIC ownership projection contract (`@hbc/bic-next-move`)

---

## Similarity, Confidence, and Recommendation Derivation

- similarity model evaluates weighted factors (`projectType`, `deliveryMethod`, `procurementType`, `valueRange`, `geography`, `ownerType`, `incumbentRelationship`, `competitorCount`, `scheduleComplexity`)
- confidence tier is derived from sample size, similarity quality, recency, and data completeness
- recommendation states are deterministic and derived from:
  - win-zone distance
  - loss-risk overlap
  - confidence tier
  - similarity strength
  - reviewer consensus strength
- no-bid recommendation requires persisted rationale artifact and approval metadata before finalization

---

## Filter Governance and Anti-Shopping Enforcement

- default benchmark cohort cannot be silently changed
- filter adjustments append immutable `IFilterGovernanceEvent` records
- large benchmark deltas trigger blocking warning confirmations
- admin-approved cohorts constrain available cohort overrides
- all filter-governance events are replay-safe in offline queue processing

---

## API Contracts

`ScoreBenchmarkApi`:
- `getOverlayState(entityId, filterContext)`
- `getCriterionBenchmarks(filterContext)`
- `getOverallSummary(filterContext)`
- `getMostSimilarPursuits(entityId, filterContext)`
- `getExplainability(entityId, filterContext)`
- `queueBenchmarkMutation(mutation)` for offline/queued writes
- `appendFilterGovernanceEvent(event)`
- `saveNoBidRationale(entityId, rationalePayload, approvedBy)`

`ScoreBenchmarkLifecycleApi`:
- `runScheduledRecompute()`
- `runOnDemandRecompute(filterContext, requestedBy)`
- `runPredictiveDriftMonitor(window)`
- `emitRecalibrationSignals(signals)`
- `freezeSnapshot(entityId, snapshotReason)`

---

## Verification Commands

```bash
pnpm --filter @hbc/score-benchmark test -- lifecycle
pnpm --filter @hbc/score-benchmark test -- api
pnpm --filter @hbc/score-benchmark check-types
```
