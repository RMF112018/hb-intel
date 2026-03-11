# SF19-T04 - Hooks and State Model

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-19-Module-Feature-BD-Score-Benchmark.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.8 sprint-weeks
**Depends On:** T03

> **Doc Classification:** Canonical Normative Plan - SF19-T04 hooks task; sub-plan of `SF19-BD-Score-Benchmark.md`.

---

## Objective

Define primitive and adapter hook behavior for benchmark loading, filter application, offline queueing, and replay-safe sync.

---

## Primitive Hook: `useScoreBenchmarkState`

Responsibilities:
- load `IScoreGhostOverlayState` for current entity
- resolve significance and insufficient-data flags
- compute normalized `distanceToWinZone`
- expose loading/error/refresh/sync states
- emit telemetry deltas through primitive KPI channels

Cache key:
- `['score-benchmark', entityId, filterContext]`

---

## Primitive Hook: `useScoreBenchmarkFilters`

Responsibilities:
- manage filter context and defaults
- validate value-range bounds
- reset to auto-inferred defaults
- invalidate benchmark queries on change

Cache key:
- `['score-benchmark', 'filters', entityId]`

---

## BD Adapter Hook: `useScoreBenchmark`

Responsibilities:
- map primitive state into BD scorecard view model
- project criterion gap ownership avatars from `@hbc/bic-next-move`
- surface My Work placement metadata for `@hbc/project-canvas`

---

## Offline and Sync State Guarantees

- stable return shape across loading/success/error
- optimistic save paths surface explicit statuses:
  - `Saved locally`
  - `Queued to sync`
- background replay reconciles local queue and publishes immutable version metadata
- stale benchmark warning surfaces when generation timestamp exceeds threshold

---

## Verification Commands

```bash
pnpm --filter @hbc/score-benchmark test -- hooks
pnpm --filter @hbc/features-business-development test -- score-benchmark-hooks
pnpm --filter @hbc/score-benchmark check-types
```
