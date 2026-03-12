# SF22-T08 - Testing Strategy

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-22-Module-Feature-Post-Bid-Learning-Loop_UPDATED.md` (required canonical target; currently missing) and `docs/explanation/feature-decisions/PH7-SF-22-Module-Feature-Post-Bid-Learning-Loop.md` (interim baseline)
**Decisions Applied:** L-01 through L-14
**Estimated Effort:** 1.15 sprint-weeks
**Depends On:** T01-T07

> **Doc Classification:** Canonical Normative Plan - SF22-T08 testing task; sub-plan of `SF22-Post-Bid-Learning-Loop.md`.

---

## Objective

Define fixture exports and scenario matrix for trigger/assignment/escalation, confidence/evidence reliability, lifecycle governance, offline replay, AI approval, flywheel corroboration/reinsertion, and telemetry quality.

---

## Testing Exports

Primitive (`@hbc/post-bid-autopsy/testing`):
- `createMockPostBidAutopsy(overrides?)`
- `createMockAutopsySectionState(overrides?)`
- `createMockAutopsyQueueState(overrides?)`
- `createMockAutopsyEvidence(overrides?)`
- `createMockAutopsyConfidence(overrides?)`
- `mockPostBidAutopsyStates`

Adapters:
- `createMockBdPostBidAutopsyView(overrides?)`
- `createMockEstimatingPostBidAutopsyView(overrides?)`

Canonical scenarios:
1. trigger on terminal pursuit outcome
2. assignment and overdue escalation path
3. confidence degradation with missing/weak evidence
4. lifecycle transitions: draft/review/approved/published/superseded/archived
5. re-open/revise path and disagreement escalation
6. sensitivity/visibility redaction path
7. offline queue/replay and status indicators
8. inline AI suggestion citation/approval path
9. BIC avatar + My Work projection
10. intelligence corroboration and promotion lifecycle
11. benchmark update signal emission (approved/published only)
12. stale detection and revalidation cycle
13. complexity-tier rendering differences

---

## Unit Tests

- trigger guardrails and SLA calculation
- lifecycle transition constraints and publication gating
- queue replay ordering and conflict handling
- confidence/evidence calculations and reason semantics
- disagreement/escalation state changes
- telemetry KPI emission schema validation

---

## Hook/Component Tests

- hook loading/error/refresh/sync transitions
- confidence/evidence/publish-blocker projection
- wizard/summary/list/dashboard rendering and interactions
- section ownership, similar-reference, and deep-link behavior
- AI approval gating and persisted output checks
- triage queues and stale/revalidation behavior

---

## Storybook and Playwright

Storybook matrix:
- complexity tier x status x confidence x sync-state variants
- trust indicator and explainability variants
- disagreement and publication-blocker variants

Playwright flow:
1. pursuit closes -> autopsy auto-created
2. user completes sections with offline interruption
3. queue replays on reconnect
4. review disagrees -> revise -> approved
5. publish gate clears -> downstream updates visible
6. stale record triggers revalidation queue

---

## Coverage Gates

- lines >= 95
- branches >= 95
- functions >= 95
- statements >= 95
