# SF24-T04 - Hooks and State Model

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-24-Shared-Feature-Export-Runtime.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.85 sprint-weeks
**Depends On:** T03

> **Doc Classification:** Canonical Normative Plan - SF24-T04 hooks task; sub-plan of `SF24-Export-Runtime.md`.

---

## Objective

Define primitive and adapter hook orchestration for export state, composition drafts, receipt persistence, queue sync, and KPI emission.

---

## Primitive Hooks

- `useExportRuntimeState`
  - loads export requests, format availability, and receipt state
  - exposes loading/error/refresh + queue status + commit metadata
- `useExportCompositionState`
  - persists report composition edits and validation state
  - emits ownership metadata for review/handoff steps
- `useExportQueue`
  - manages queued offline export requests and replay transitions

Cache keys:
- `['export-runtime', moduleKey, 'requests']`
- `['export-runtime', moduleKey, 'composition']`
- `['export-runtime', moduleKey, 'queue']`

---

## Adapter Hooks

- adapters map primitive state to module-specific labels/routes and format policies
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
pnpm --filter @hbc/export-runtime test -- hooks
pnpm --filter @hbc/features-business-development test -- export-runtime-hooks
pnpm --filter @hbc/features-estimating test -- export-runtime-hooks
pnpm --filter @hbc/export-runtime check-types
```

