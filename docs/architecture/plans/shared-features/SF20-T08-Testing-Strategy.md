# SF20-T08 - Testing Strategy

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-20-Module-Feature-BD-Heritage-Panel.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.95 sprint-weeks
**Depends On:** T01-T07

> **Doc Classification:** Canonical Normative Plan - SF20-T08 testing task; sub-plan of `SF20-BD-Heritage-Panel.md`.

---

## Objective

Define fixture exports and quality matrix for permissions, approval lifecycle, cross-module rendering, offline replay, inline AI actions, BIC projection, and KPI telemetry.

---

## Testing Exports

Primitive (`@hbc/strategic-intelligence/testing`):
- `createMockBdHeritageData(overrides?)`
- `createMockStrategicIntelligenceEntry(overrides?)`
- `createMockIntelligenceApprovalItem(overrides?)`
- `mockStrategicIntelligenceStates`

Adapter (`@hbc/features-business-development/testing`):
- `createMockStrategicIntelligenceProfile(overrides?)`
- `createMockBdStrategicIntelligenceView(overrides?)`

Canonical states:
1. heritage-only with no entries
2. approved feed with mixed intelligence types
3. pending approval queue with approver actions
4. rejected entry with reason + resubmission
5. insufficient permission contributor attempt
6. approved-only indexing visibility
7. saved locally
8. queued to sync
9. replay reconciled

---

## Unit Tests

- permission checks for submit vs approve actions
- monotonic approval state transitions
- immutable heritage panel protections
- approved-only indexing predicates
- KPI emission schema and threshold mapping

---

## Hook/Component Tests

- primitive and adapter hook transitions
- panel/feed/form/queue rendering and behavior
- rejection/resubmission flow
- complexity-gated render paths
- inline AI citation + approval + BIC creation callbacks
- My Work projection behavior

---

## Storybook and Playwright

Storybook matrix:
- complexity tier x panel/feed/form/queue depth
- pending/approved/rejected/offline variants
- empty/loaded contexts

Playwright scenarios:
1. contributor submits entry
2. offline queue shows `Saved locally` then `Queued to sync`
3. approver receives notification and opens queue
4. approver approves entry
5. approved entry appears in heritage surfaces/search and BIC/My Work projections update

---

## Coverage Gates

- lines >= 95
- branches >= 95
- functions >= 95
- statements >= 95
