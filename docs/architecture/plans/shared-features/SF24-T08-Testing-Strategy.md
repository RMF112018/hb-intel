# SF24-T08 - Testing Strategy

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-24-Shared-Feature-Export-Runtime.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 1.0 sprint-weeks
**Depends On:** T01-T07

> **Doc Classification:** Canonical Normative Plan - SF24-T08 testing task; sub-plan of `SF24-Export-Runtime.md`.

---

## Objective

Define fixture exports and scenario matrix for export correctness, truth/context explainability, offline replay, retry/recovery safety, BIC projection, receipt trust, and KPI emission.

---

## Testing Exports

Primitive (`@hbc/export-runtime/testing`):

- `createMockExportRequest(overrides?)`
- `createMockExportReceiptState(overrides?)`
- `createMockExportQueueState(overrides?)`
- `createMockExportTruthState(overrides?)`
- `createMockExportReviewStepState(overrides?)`
- `mockExportComplexityProfiles`

Adapters:

- `createMockBdExportRuntimeView(overrides?)`
- `createMockEstimatingExportRuntimeView(overrides?)`

Canonical scenarios:

1. table export, current-view export, record-snapshot export, and composite report lifecycle transitions
2. blocked or unavailable format with explicit reason and top recommended export
3. queued/degraded/offline request and receipt states
4. retryable vs non-retryable render failures
5. restored receipt and stale-artifact trust downgrade
6. review/approval and post-export handoff ownership projection
7. deep-link and My Work routing projection
8. truth/context stamps for filters, sorts, visible columns, selected rows, and version
9. complexity-tier rendering differences where messaging or actions differ materially
10. renderer outputs (CSV/XLSX/PDF/Print) and deterministic naming conventions
11. five KPI telemetry emission and trend refresh

---

## Unit Tests

- lifecycle transition guards and format compatibility rules
- unavailable-format reason-code mapping
- top recommended export derivation
- queue replay ordering and conflict handling
- truth/context stamp invariants for artifacts and receipts
- telemetry KPI schema validation and threshold metadata

---

## Hook/Component Tests

- hook loading/error/refresh/sync/recovery transitions
- menu/picker/progress/receipt interactions
- BIC avatar and My Work projection behavior
- AI approval gating and persisted output checks
- retry, restore, dismiss, and re-download safety flows
- artifact-confidence rendering and no-contradiction messaging checks

---

## Storybook and Playwright

Storybook matrix:

- complexity tier x export intent x sync-state variants
- unavailable/degraded/restored-receipt states
- BIC ownership and AI-action variants

Playwright flow:

1. user triggers export while offline
2. request persists with receipt status `Saved locally`
3. blocked format explains why it is unavailable and recommends the next best export
4. queue replays on reconnect and transitions to `Queued to sync` then `rendering` then `complete`
5. stale or restored receipt presents trust-warning and retry affordances
6. approver confirms AI-assisted export mutation
7. receipt deep-links and KPI surfaces reflect final context stamp
8. retryable failure preserves request and receipt evidence

---

## Coverage Gates

- lines >= 95
- branches >= 95
- functions >= 95
- statements >= 95
