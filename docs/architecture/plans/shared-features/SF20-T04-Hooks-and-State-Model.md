# SF20-T04 - Hooks and State Model

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-20-Module-Feature-BD-Heritage-Panel.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.85 sprint-weeks
**Depends On:** T03

> **Doc Classification:** Canonical Normative Plan - SF20-T04 hooks task; sub-plan of `SF20-BD-Heritage-Panel.md`.

---

## Objective

Define primitive hook orchestration for heritage retrieval, intelligence lifecycle, approval queue actions, offline replay, and BD adapter projection.

---

## Primitive Hook: `useStrategicIntelligenceState`

Responsibilities:
- load heritage projection + intelligence feed + approval queue slices
- expose loading/error/refresh and sync-state transitions
- emit telemetry deltas for KPI channels

Cache key:
- `['strategic-intelligence', projectId]`

---

## Primitive Hook: `useStrategicIntelligenceApprovalQueue`

Responsibilities:
- load approver queue
- approve/reject transitions with reason constraints
- invalidate feed/queue and project-canvas projections on transition

Cache key:
- `['strategic-intelligence', 'approval-queue', projectId]`

---

## BD Adapter Hook: `useStrategicIntelligence`

Responsibilities:
- map primitive state into BD panel/feed/form/queue view models
- project BIC ownership avatars from `@hbc/bic-next-move`
- publish role-aware assignment metadata for `@hbc/project-canvas`

---

## State Guarantees

- heritage projection remains immutable from panel surfaces
- approval transitions remain monotonic (`pending -> approved/rejected`)
- optimistic statuses are explicit: `Saved locally`, `Queued to sync`
- replay completion resolves queued local state without provenance loss

---

## Verification Commands

```bash
pnpm --filter @hbc/strategic-intelligence test -- hooks
pnpm --filter @hbc/features-business-development test -- strategic-intelligence-hooks
pnpm --filter @hbc/strategic-intelligence check-types
```
