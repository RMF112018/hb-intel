# SF20-T08 - Testing Strategy

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-20-Module-Feature-BD-Heritage-Panel.md`
**Decisions Applied:** D-03 through D-10
**Estimated Effort:** 0.85 sprint-weeks
**Depends On:** T01-T07

> **Doc Classification:** Canonical Normative Plan - SF20-T08 testing task; sub-plan of `SF20-BD-Heritage-Panel.md`.

---

## Objective

Define fixture exports and quality matrix for permissions, approval lifecycle, cross-module rendering, and indexing visibility.

---

## Testing Exports (`@hbc/features-business-development/testing`)

- `createMockBdHeritageData(overrides?)`
- `createMockStrategicIntelligenceEntry(overrides?)`
- `createMockIntelligenceApprovalItem(overrides?)`
- `mockStrategicIntelligenceStates`

Canonical states:

1. heritage-only with no entries
2. approved feed with mixed intelligence types
3. pending approval queue with approver actions
4. rejected entry with reason + resubmission flow
5. insufficient permission contributor attempt
6. approved-only indexing visibility state

---

## Unit Tests

- permission checks for submit vs approve actions
- approval state transitions and monotonicity
- read-only heritage panel protections
- approved-only indexing predicate

---

## Hook/Component Tests

- `useBdHeritage`, `useStrategicIntelligence`, `useIntelligenceApprovalQueue` transitions
- panel/feed/form/queue render and action behavior
- rejection reason handling and resubmission flow
- complexity-gated render paths

---

## Storybook and Playwright

Storybook matrix:

- complexity tier x panel/feed depth
- pending/approved/rejected state variants
- empty/loaded context variants

Playwright scenario:

1. contributor submits entry
2. approver receives notification and opens queue
3. approver approves entry
4. approved entry appears in heritage surfaces and search path

---

## Coverage Gates

- lines >= 95
- branches >= 95
- functions >= 95
- statements >= 95
