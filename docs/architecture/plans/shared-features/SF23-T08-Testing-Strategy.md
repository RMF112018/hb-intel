# SF23-T08 - Testing Strategy

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-23-Shared-Feature-Record-Form.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 1.0 sprint-weeks
**Depends On:** T01-T07

> **Doc Classification:** Canonical Normative Plan - SF23-T08 testing task; sub-plan of `SF23-Record-Form.md`.

---

## Objective

Define fixture exports and scenario matrix for lifecycle correctness, blocked/warning explainability, recovery trust, replay/conflict safety, BIC projection, and KPI emission.

---

## Testing Exports

Primitive (`@hbc/record-form/testing`):

- `createMockRecordFormDefinition(overrides?)`
- `createMockRecordFormState(overrides?)`
- `createMockRecordFormQueueState(overrides?)`
- `createMockRecordRecoveryState(overrides?)`
- `createMockRecordReviewStepState(overrides?)`
- `mockRecordFormComplexityProfiles`

Adapters:

- `createMockBdRecordFormView(overrides?)`
- `createMockEstimatingRecordFormView(overrides?)`

Canonical scenarios:

1. create/edit/duplicate/template/review lifecycle transitions
2. blocked state with explicit reason and top recommended action
3. valid-with-warnings state with submit-allowed explanation
4. stale restored draft comparison and trust downgrade
5. offline queue/replay and status indicators
6. replay conflict path with restore/retry/discard safeguards
7. review and post-submit handoff ownership projection
8. deep-link and My Work routing projection
9. complexity-tier rendering differences where behavior or messaging differs materially
10. admin configuration and approval-state governance path
11. five KPI telemetry emission and trend refresh

---

## Unit Tests

- lifecycle transition guards and validation gates
- blocked/warning reason-code mapping
- next recommended action derivation
- queue replay ordering and conflict handling
- version/provenance snapshot invariants
- telemetry KPI schema validation and threshold metadata

---

## Hook/Component Tests

- hook loading/error/refresh/sync/recovery transitions
- field renderer/review/submit/recovery interactions
- BIC avatar and My Work projection behavior
- AI approval gating and persisted output checks
- compare/restore/discard safety flows
- confidence/trust-state rendering and no-contradiction messaging checks

---

## Storybook and Playwright

Storybook matrix:

- complexity tier x lifecycle mode x sync-state variants
- blocked/warning/recovered-needs-review states
- review/handoff ownership and AI-action variants

Playwright flow:

1. user opens create form and saves draft offline
2. stale recovered draft presents compare and trust-warning affordances
3. blocked state explains why submit is unavailable and what to do next
4. queue replays on reconnect with immutable version append
5. reviewer approves AI-assisted updates
6. submit bar projects handoff ownership to My Work
7. replay conflict preserves evidence and offers explicit retry/restore paths
8. dashboard surfaces KPI trend updates

---

## Coverage Gates

- lines >= 95
- branches >= 95
- functions >= 95
- statements >= 95
