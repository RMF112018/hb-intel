# SF23-T04 - Hooks and State Model

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-23-Shared-Feature-Record-Form.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.9 sprint-weeks
**Depends On:** T03

> **Doc Classification:** Canonical Normative Plan - SF23-T04 hooks task; sub-plan of `SF23-Record-Form.md`.

---

## Objective

Define primitive and adapter hook orchestration for form state, draft persistence, review/handoff projection, queue sync, and KPI emission.

---

## Primitive Hooks

- `useRecordFormState`
  - loads definition, mode, values, validation, and submit readiness
  - exposes loading/error/refresh + queue status + commit metadata
- `useRecordDraftPersistence`
  - persists draft deltas and recovery snapshots
  - emits optimistic statuses and replay-safe mutation handles
- `useRecordSubmission`
  - orchestrates review/approval gates, submit transitions, and handoff BIC creation

Cache keys:
- `['record-form', moduleId, recordType, formId]`
- `['record-form', moduleId, recordType, formId, 'draft']`
- `['record-form', moduleId, recordType, formId, 'queue']`

---

## Adapter Hooks

- adapters map primitive state to module-specific labels/routes and field groupings
- adapters project BIC avatar ownership and My Work placement metadata

---

## State Guarantees

- stable return shape across loading/success/error
- explicit optimistic statuses: `Saved locally`, `Queued to sync`
- replay completion emits immutable version metadata
- handoff ownership remains deterministic through retry/replay and approval transitions

---

## Verification Commands

```bash
pnpm --filter @hbc/record-form test -- hooks
pnpm --filter @hbc/features-business-development test -- record-form-hooks
pnpm --filter @hbc/features-estimating test -- record-form-hooks
pnpm --filter @hbc/record-form check-types
```
