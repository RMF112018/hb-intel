# SF22-T08 - Testing Strategy

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-22-Module-Feature-Post-Bid-Learning-Loop.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.95 sprint-weeks
**Depends On:** T01-T07

> **Doc Classification:** Canonical Normative Plan - SF22-T08 testing task; sub-plan of `SF22-Post-Bid-Learning-Loop.md`.

---

## Objective

Define fixture exports and scenario matrix for trigger/assignment/escalation, offline replay, AI approval, BIC projection, intelligence seeding, benchmark updates, and complexity rendering.

---

## Testing Exports

Primitive (`@hbc/post-bid-autopsy/testing`):
- `createMockPostBidAutopsy(overrides?)`
- `createMockAutopsySectionState(overrides?)`
- `createMockAutopsyQueueState(overrides?)`
- `mockPostBidAutopsyStates`

Adapters:
- `createMockBdPostBidAutopsyView(overrides?)`
- `createMockEstimatingPostBidAutopsyView(overrides?)`

Canonical scenarios:
1. trigger on terminal pursuit outcome
2. assignment and overdue escalation path
3. offline queue/replay and status indicators
4. inline AI suggestion citation/approval path
5. BIC avatar + My Work projection
6. intelligence seeding conversion
7. benchmark update signal emission
8. complexity-tier rendering differences

---

## Unit Tests

- trigger guardrails and SLA calculation
- monotonic status transitions and escalation rules
- queue replay ordering and conflict handling
- telemetry KPI emission schema validation

---

## Hook/Component Tests

- hook loading/error/refresh/sync transitions
- wizard/summary/list/dashboard rendering and interactions
- section ownership and deep-link behavior
- AI approval gating and persisted output checks

---

## Storybook and Playwright

Storybook matrix:
- complexity tier x status x sync-state variants
- section ownership and AI-action variants

Playwright flow:
1. pursuit closes -> autopsy auto-created
2. user completes sections with offline interruption
3. queue replays on reconnect
4. approver confirms seeded intelligence output
5. benchmark update signal and dashboard KPI refresh visible

---

## Coverage Gates

- lines >= 95
- branches >= 95
- functions >= 95
- statements >= 95
