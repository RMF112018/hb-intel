# SF25-T04 - Hooks and State Model

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-25-Shared-Feature-Publish-Workflow.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.85 sprint-weeks
**Depends On:** T03

> **Doc Classification:** Canonical Normative Plan - SF25-T04 hooks task; sub-plan of `SF25-Publish-Workflow.md`.

---

## Objective

Define primitive and adapter hook orchestration for publish state, readiness checks, approvals, supersession/revocation transitions, queue sync, and KPI emission.

---

## Primitive Hooks

- `usePublishWorkflowState`
  - loads request, current state, targets, and receipt history
  - exposes loading/error/refresh + queue status + commit metadata
- `usePublishReadinessState`
  - evaluates readiness and approval checklist outcomes
  - emits ownership metadata for active publish workflow steps
- `usePublishQueue`
  - manages queued offline publish mutations and replay transitions

Cache keys:
- `['publish-workflow', sourceModuleKey, sourceRecordId]`
- `['publish-workflow', sourceModuleKey, sourceRecordId, 'readiness']`
- `['publish-workflow', sourceModuleKey, sourceRecordId, 'queue']`

---

## Adapter Hooks

- adapters map primitive state to module-specific labels/routes and target defaults
- adapters project BIC avatar ownership and My Work placement metadata

---

## State Guarantees

- stable return shape across loading/success/error
- explicit optimistic statuses: `Saved locally`, `Queued to sync`
- replay completion emits immutable version metadata
- supersession/revocation ownership remains deterministic through retry/replay

---

## Verification Commands

```bash
pnpm --filter @hbc/publish-workflow test -- hooks
pnpm --filter @hbc/features-business-development test -- publish-workflow-hooks
pnpm --filter @hbc/features-estimating test -- publish-workflow-hooks
pnpm --filter @hbc/publish-workflow check-types
```

