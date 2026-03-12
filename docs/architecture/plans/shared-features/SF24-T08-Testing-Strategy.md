# SF24-T08 - Testing Strategy

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-24-Shared-Feature-Export-Runtime.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 1.0 sprint-weeks
**Depends On:** T01-T07

> **Doc Classification:** Canonical Normative Plan - SF24-T08 testing task; sub-plan of `SF24-Export-Runtime.md`.

---

## Objective

Define fixture exports and scenario matrix for export correctness, offline replay, AI approval guardrails, BIC projection, context stamping, and KPI emission.

---

## Testing Exports

Primitive (`@hbc/export-runtime/testing`):
- `createMockExportRequest(overrides?)`
- `createMockExportReceiptState(overrides?)`
- `createMockExportQueueState(overrides?)`
- `mockExportComplexityProfiles`

Adapters:
- `createMockBdExportRuntimeView(overrides?)`
- `createMockEstimatingExportRuntimeView(overrides?)`

Canonical scenarios:
1. table export and report export lifecycle transitions
2. review/approval and post-export handoff ownership projection
3. offline queue/replay and status indicators
4. inline AI suggestion citation/approval path
5. deep-link and My Work routing projection
6. complexity-tier rendering differences
7. renderer pipeline outputs (CSV/XLSX/PDF/Print) and naming conventions
8. five KPI telemetry emission and trend refresh

---

## Unit Tests

- lifecycle transition guards and format compatibility rules
- queue replay ordering and conflict handling
- context/provenance stamp invariants for artifacts and receipts
- telemetry KPI schema validation and threshold metadata

---

## Hook/Component Tests

- hook loading/error/refresh/sync transitions
- menu/picker/progress/receipt interactions
- BIC avatar and My Work projection behavior
- AI approval gating and persisted output checks

---

## Storybook and Playwright

Storybook matrix:
- complexity tier x export intent x sync-state variants
- BIC ownership and AI-action variants

Playwright flow:
1. user triggers export while offline
2. request persists with receipt status `Saved locally`
3. queue replays on reconnect and transitions to `Queued to sync` then complete
4. approver confirms AI-assisted export mutation
5. receipt deep-links and KPI surfaces reflect final context stamp

---

## Coverage Gates

- lines >= 95
- branches >= 95
- functions >= 95
- statements >= 95

