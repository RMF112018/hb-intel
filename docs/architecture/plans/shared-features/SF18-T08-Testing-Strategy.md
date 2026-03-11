# SF18-T08 - Testing Strategy

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-18-Module-Feature-Estimating-Bid-Readiness.md`
**Decisions Applied:** D-02 through D-10
**Estimated Effort:** 0.75 sprint-weeks
**Depends On:** T01-T07

> **Doc Classification:** Canonical Normative Plan - SF18-T08 testing task; sub-plan of `SF18-Estimating-Bid-Readiness.md`.

---

## Objective

Define fixtures, coverage expectations, and scenario matrix for readiness model, hooks, and UI components.

---

## Testing Exports (`@hbc/features-estimating/testing`)

- `createMockBidReadinessCriterion(overrides?)`
- `createMockBidReadinessState(overrides?)`
- `createMockEstimatingPursuitForReadiness(overrides?)`
- `mockBidReadinessStates`

Canonical states:

1. ready-to-bid (no blockers)
2. nearly-ready (no blockers)
3. attention-needed (blockers present)
4. not-ready (low score + blockers)
5. overdue attention-needed
6. due-within-48h with blockers

---

## Unit Tests

- weighted score computation and normalization
- blocker precedence over raw score band
- status classification boundary tests
- config merge and validation rules
- due-date and overdue transitions

---

## Component and Hook Tests

- `useBidReadiness`, `useBidReadinessCriteria`, `useBidReadinessConfig` state transitions
- `BidReadinessSignal` rendering for all statuses
- `BidReadinessDashboard` score ring, due-date display, blocker summary
- `BidReadinessChecklist` row ordering, badges, action links
- complexity-gated rendering across tiers

---

## Storybook and Playwright

Storybook matrix:

- status x complexity tier
- blocker/no-blocker
- due date windows (normal, 48h, overdue)

Playwright scenarios:

1. criterion completion improves score and status
2. blocker introduction downgrades readiness state
3. CE sign-off completion clears criterion
4. `<48h + blockers` triggers urgency path and UI indicator

---

## Coverage Gates

- lines >= 95
- branches >= 95
- functions >= 95
- statements >= 95
