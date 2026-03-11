# SF19-T08 - Testing Strategy

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-19-Module-Feature-BD-Score-Benchmark.md`
**Decisions Applied:** D-02 through D-10
**Estimated Effort:** 0.8 sprint-weeks
**Depends On:** T01-T07

> **Doc Classification:** Canonical Normative Plan - SF19-T08 testing task; sub-plan of `SF19-BD-Score-Benchmark.md`.

---

## Objective

Define fixture exports and quality coverage matrix for aggregation, hooks, and benchmark UI components.

---

## Testing Exports (`@hbc/features-business-development/testing`)

- `createMockScorecardBenchmark(overrides?)`
- `createMockGhostOverlayState(overrides?)`
- `createMockBenchmarkFilterContext(overrides?)`
- `mockScoreBenchmarkStates`

Canonical states:

1. in win zone
2. below win zone
3. above win zone
4. insufficient data
5. stale benchmark generation timestamp
6. filtered market context

---

## Unit Tests

- win-zone distance computation
- significance threshold and insufficient-data behavior
- filter application and range validation
- aggregation mapping and privacy-safe payload shaping

---

## Hook/Component Tests

- `useScoreBenchmark` refresh/loading/error transitions
- `useBenchmarkFilters` mutation/reset behavior
- ghost overlay marker/band rendering
- summary panel and win-zone indicator rendering
- filter panel interaction and accessibility
- complexity gating across tiers

---

## Storybook and Playwright

Storybook matrix:

- status (in/below/above zone) x complexity tier
- sufficient/insufficient sample data
- default/custom filter contexts

Playwright scenarios:

1. below-zone score displays distance and suggested direction
2. filter change updates benchmark context and values
3. insufficient sample state renders warning and hides confidence markers
4. nightly refreshed benchmark timestamp visible in summary panel

---

## Coverage Gates

- lines >= 95
- branches >= 95
- functions >= 95
- statements >= 95
