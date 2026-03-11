# SF19-T08 - Testing Strategy

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-19-Module-Feature-BD-Score-Benchmark.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.9 sprint-weeks
**Depends On:** T01-T07

> **Doc Classification:** Canonical Normative Plan - SF19-T08 testing task; sub-plan of `SF19-BD-Score-Benchmark.md`.

---

## Objective

Define fixture exports and quality coverage matrix for primitive lifecycle, adapter hooks, benchmark UI surfaces, offline replay, inline AI actions, and KPI emission.

---

## Testing Exports

Primitive (`@hbc/score-benchmark/testing`):
- `createMockScorecardBenchmark(overrides?)`
- `createMockScoreGhostOverlayState(overrides?)`
- `createMockBenchmarkFilterContext(overrides?)`
- `mockScoreBenchmarkStates`

Adapter (`@hbc/features-business-development/testing`):
- `createMockScoreBenchmarkProfile(overrides?)`
- `createMockBdScoreBenchmarkView(overrides?)`

Canonical states:
1. in Win Zone
2. below Win Zone
3. above Win Zone
4. insufficient data
5. stale benchmark timestamp
6. filter context changed
7. saved locally
8. queued to sync
9. sync replay resolved

---

## Unit Tests

- win-zone distance computation and significance thresholds
- filter application and range validation
- lifecycle recompute and snapshot freeze contracts
- provenance-safe payload shaping
- telemetry KPI emission shape and threshold mappings

---

## Hook/Component Tests

- primitive hooks: refresh/loading/error/sync transitions
- adapter hooks: projection of ownership, My Work metadata, and deep-links
- ghost overlay marker/band/avatar rendering
- summary panel status/sync badge behavior
- indicator/filter interaction behavior
- complexity gating across Essential/Standard/Expert
- inline AI action citation + approval + BIC creation callbacks

---

## Storybook and Playwright

Storybook matrix:
- status (in/below/above zone) x complexity tier
- sufficient/insufficient sample data
- default/custom filter contexts
- offline/sync status variants

Playwright scenarios:
1. below-zone score displays distance, owner, and recommended direction
2. filter change updates benchmark context and values
3. insufficient sample state renders warning and hides confident markers
4. offline mutation shows `Saved locally` then `Queued to sync` until replay
5. inline AI action requires explicit approval before BIC creation

---

## Coverage Gates

- lines >= 95
- branches >= 95
- functions >= 95
- statements >= 95
