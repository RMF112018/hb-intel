# SF24-T04 - Hooks and State Model

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-24-Shared-Feature-Export-Runtime.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.85 sprint-weeks
**Depends On:** T03

> **Doc Classification:** Canonical Normative Plan - SF24-T04 hooks task; sub-plan of `SF24-Export-Runtime.md`.

---

## Objective

Define primitive and adapter hook orchestration for export state, composition drafts, progress/receipt trust, queue sync, next recommended export, and KPI emission without duplicating export lifecycle engines in adapters.

---

## Primitive Hooks

- `useExportRuntimeState`
  - loads export requests, format availability, receipt state, truth stamps, and artifact-confidence state
  - derives unavailable-format reasons, degraded-truth reasons, and top recommended export
  - exposes loading/error/refresh + queue status + commit metadata
- `useExportCompositionState`
  - persists report composition edits and validation state
  - distinguishes simple export vs composite report composition and emits ownership metadata for review/handoff steps
- `useExportQueue`
  - manages queued offline export requests, replay transitions, and restored receipt state

Cache keys:

- `['export-runtime', moduleKey, 'requests']`
- `['export-runtime', moduleKey, 'composition']`
- `['export-runtime', moduleKey, 'queue']`
- `['export-runtime', moduleKey, 'receipts']`

---

## Adapter Hooks

- adapters map primitive state to module-specific labels/routes and format policies
- adapters project BIC avatar ownership and My Work placement metadata
- adapters must not re-compute lifecycle truth, artifact confidence, or top recommended export outside primitive selectors
- adapters are responsible for passing record/view/filter/sort/column/selection truth into primitive request contracts

---

## Derived State Requirements

Primitive state must derive:

- explainability fields for format availability, trust downgrade, recovery, and review/handoff states
- top recommended export with reason and export-intent classification
- artifact-confidence state
- progress-toast state
- receipt retry/failure/restore state
- downstream handoff preview state

These derived fields are mandatory so every consuming surface does not invent its own export interpretation locally.

---

## State Guarantees

- stable return shape across loading/success/error
- explicit optimistic statuses: `Saved locally`, `Queued to sync`
- visible rendering, complete, failed, degraded, and restored-receipt states
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
