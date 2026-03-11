# SF19-T04 - Hooks and State Model

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-19-Module-Feature-BD-Score-Benchmark.md`
**Decisions Applied:** D-06 through D-08, D-10
**Estimated Effort:** 0.7 sprint-weeks
**Depends On:** T03

> **Doc Classification:** Canonical Normative Plan - SF19-T04 hooks task; sub-plan of `SF19-BD-Score-Benchmark.md`.

---

## Objective

Define state and refresh behavior for benchmark loading and filter application.

---

## `useScoreBenchmark`

Responsibilities:

- load `IScoreGhostOverlayState` for current scorecard
- resolve significance and insufficient-data flags
- compute normalized `distanceToWinZone`
- expose loading/error/refresh states

Cache key:

- `['score-benchmark', scorecardId, filterContext]`

---

## `useBenchmarkFilters`

Responsibilities:

- manage filter context and defaults
- validate value-range bounds
- reset to auto-inferred scorecard defaults
- trigger benchmark query invalidation on change

Cache key:

- `['score-benchmark', 'filters', scorecardId]`

---

## State Guarantees

- stable return shape across loading/success/error
- stale benchmark warning surfaced when generation timestamp exceeds threshold
- insufficient sample state never renders win/loss markers as confident values

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development test -- hooks
pnpm --filter @hbc/features-business-development check-types
```
