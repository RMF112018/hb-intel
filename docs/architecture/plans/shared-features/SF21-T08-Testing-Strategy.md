# SF21-T08 - Testing Strategy

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-21-Module-Feature-Project-Health-Pulse.md`
**Decisions Applied:** D-02 through D-10
**Estimated Effort:** 0.85 sprint-weeks
**Depends On:** T01-T07

> **Doc Classification:** Canonical Normative Plan - SF21-T08 testing task; sub-plan of `SF21-Project-Health-Pulse.md`.

---

## Objective

Define fixtures and quality matrix for pulse computation, data quality handling, UI behavior, and portfolio surfaces.

---

## Testing Exports (`@hbc/features-project-hub/testing`)

- `createMockProjectHealthPulse(overrides?)`
- `createMockHealthDimension(overrides?)`
- `createMockHealthMetric(overrides?)`
- `mockProjectHealthStates`

Canonical states:

1. on-track with complete data
2. watch with early warning indicators
3. at-risk with mixed stale metrics
4. critical with immediate recommendation
5. data-pending due to excluded metrics
6. portfolio mixed-status set

---

## Unit Tests

- 70/30 dimension compute math
- composite weighted score and status boundaries
- stale/missing exclusion and re-normalization
- admin config weight sum validation

---

## Hook/Component Tests

- hook refresh/mutation and invalidation behavior
- card/detail/tab/inline-edit interactions
- permission gates for inline edits/admin panel
- portfolio sort/filter behavior

---

## Storybook and Playwright

Storybook matrix:

- status x complexity x stale-data states
- compact vs detail render variants

Playwright flow:

1. open detail tab with stale metric warning
2. edit stale metric with permitted role
3. recompute pulse and observe status/action updates
4. verify portfolio table reflects updated pulse

---

## Coverage Gates

- lines >= 95
- branches >= 95
- functions >= 95
- statements >= 95
