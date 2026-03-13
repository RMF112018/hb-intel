# SF23-T04 - Hooks and State Model

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-23-Shared-Feature-Record-Form.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.9 sprint-weeks
**Depends On:** T03

> **Doc Classification:** Canonical Normative Plan - SF23-T04 hooks task; sub-plan of `SF23-Record-Form.md`.

---

## Objective

Define primitive and adapter hook orchestration for lifecycle truth, draft persistence, recovery, review/handoff projection, queue sync, next recommended action, and KPI emission without duplicating lifecycle engines in adapters.

---

## Primitive Hooks

- `useRecordFormState`
  - loads definition, mode, values, validation, lifecycle state, trust/confidence state, and submit readiness
  - derives blocked reasons, warning reasons, review-step state, and top recommended action
  - exposes loading/error/refresh + queue status + commit metadata
- `useRecordDraftPersistence`
  - persists draft deltas and recovery snapshots
  - distinguishes local, server, restored, and stale-restored draft states
  - emits optimistic statuses and replay-safe mutation handles
- `useRecordSubmission`
  - orchestrates review/approval gates, submit transitions, retry state, and handoff BIC creation

Cache keys:

- `['record-form', moduleId, recordType, formId]`
- `['record-form', moduleId, recordType, formId, 'draft']`
- `['record-form', moduleId, recordType, formId, 'queue']`
- `['record-form', moduleId, recordType, formId, 'recovery']`

---

## Adapter Hooks

- adapters map primitive state to module-specific labels/routes and field groupings
- adapters project BIC avatar ownership and My Work placement metadata
- adapters must not re-compute lifecycle truth, trust state, or next recommended action outside primitive selectors

---

## Derived State Requirements

Primitive state must derive:

- explainability fields for blocked, warning, recovery, and review-step gating states
- next recommended action with reason and owner-side classification
- confidence/trust state
- recovery-banner state
- replay/conflict state
- downstream handoff preview state

These derived fields are mandatory so every consuming form does not invent its own lifecycle interpretation.

---

## State Guarantees

- stable return shape across loading/success/error
- explicit optimistic statuses: `Saved locally`, `Queued to sync`
- visible degraded, partially recovered, and recovered-needs-review states
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
