# SF20-T04 - Hooks and State Model

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-20-Module-Feature-BD-Heritage-Panel.md`
**Decisions Applied:** L-01 through L-10
**Estimated Effort:** 1.0 sprint-weeks
**Depends On:** T03

> **Doc Classification:** Canonical Normative Plan - SF20-T04 hooks task; sub-plan of `SF20-BD-Heritage-Panel.md`.

---

## Objective

Define primitive hook orchestration for heritage snapshot retrieval, living-intelligence lifecycle, handoff acknowledgment workflow, commitment status, trust/sensitivity/conflict state projection, suggestion explainability, offline replay, and BD adapter projection.

---

## Primitive Hook: `useStrategicIntelligenceState`

Responsibilities:
- load snapshot, commitments, living feed, handoff review, and approval queue slices
- expose loading/error/refresh and sync-state transitions
- expose trust/recency/stale and sensitivity projection states
- expose conflict/supersession and resolution summaries
- emit telemetry deltas for KPI channels

Cache key:
- `['strategic-intelligence', projectId, visibilityContext]`

---

## Primitive Hook: `useStrategicIntelligenceApprovalQueue`

Responsibilities:
- load approver queue
- approve/reject/revision transitions with reason constraints
- enforce AI-assisted draft trust downgrade until approved
- invalidate feed/queue/canvas projections on transition

Cache key:
- `['strategic-intelligence', 'approval-queue', projectId]`

---

## Primitive Hook: `useHandoffReviewWorkflow`

Responsibilities:
- load handoff review state + participant acknowledgment statuses
- mark step completion and acknowledgment events
- compute completion gate status
- publish unresolved commitment escalation metadata

---

## Primitive Hook: `useSuggestedIntelligence`

Responsibilities:
- load suggested heritage/intelligence matches
- expose explainability payload (`why shown`, match dimensions, reuse history)
- record suggestion outcomes (`accepted`, `dismissed`, `deferred`) for telemetry

---

## BD Adapter Hook: `useStrategicIntelligence`

Responsibilities:
- map primitive state into BD panel/feed/form/review/queue view models
- project BIC ownership avatars from `@hbc/bic-next-move`
- publish role-aware assignment metadata for `@hbc/project-canvas`
- apply adapter copy and role-context display rules without altering primitive semantics

---

## State Guarantees

- heritage snapshot remains immutable from panel surfaces
- living intelligence remains additive/versioned
- approval and handoff transitions remain monotonic
- optimistic statuses are explicit: `Saved locally`, `Queued to sync`
- replay completion resolves queued local state without provenance loss

---

## Verification Commands

```bash
pnpm --filter @hbc/strategic-intelligence test -- hooks
pnpm --filter @hbc/features-business-development test -- strategic-intelligence-hooks
pnpm --filter @hbc/strategic-intelligence check-types
```
