# SF23-T08 - Testing Strategy

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-23-Shared-Feature-Record-Form.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 1.0 sprint-weeks
**Depends On:** T01-T07

> **Doc Classification:** Canonical Normative Plan - SF23-T08 testing task; sub-plan of `SF23-Record-Form.md`.

---

## Objective

Define fixture exports and scenario matrix for lifecycle correctness, offline replay, AI approval guardrails, BIC projection, and KPI emission.

---

## Testing Exports

Primitive (`@hbc/record-form/testing`):
- `createMockRecordFormDefinition(overrides?)`
- `createMockRecordFormState(overrides?)`
- `createMockRecordFormQueueState(overrides?)`
- `mockRecordFormComplexityProfiles`

Adapters:
- `createMockBdRecordFormView(overrides?)`
- `createMockEstimatingRecordFormView(overrides?)`

Canonical scenarios:
1. create/edit/duplicate/template lifecycle transitions
2. review and post-submit handoff ownership projection
3. offline queue/replay and status indicators
4. inline AI suggestion citation/approval path
5. deep-link and My Work routing projection
6. complexity-tier rendering differences
7. admin configuration and approval-state governance path
8. five KPI telemetry emission and trend refresh

---

## Unit Tests

- lifecycle transition guards and validation gates
- queue replay ordering and conflict handling
- version/provenance snapshot invariants
- telemetry KPI schema validation and threshold metadata

---

## Hook/Component Tests

- hook loading/error/refresh/sync transitions
- field renderer/review/submit/recovery interactions
- BIC avatar and My Work projection behavior
- AI approval gating and persisted output checks

---

## Storybook and Playwright

Storybook matrix:
- complexity tier x lifecycle mode x sync-state variants
- review/handoff ownership and AI-action variants

Playwright flow:
1. user opens create form and saves draft offline
2. queue replays on reconnect with immutable version append
3. reviewer approves AI-assisted updates
4. submit bar projects handoff ownership to My Work
5. dashboard surfaces KPI trend updates

---

## Coverage Gates

- lines >= 95
- branches >= 95
- functions >= 95
- statements >= 95
