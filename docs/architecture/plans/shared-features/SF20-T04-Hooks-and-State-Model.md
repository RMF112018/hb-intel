# SF20-T04 - Hooks and State Model

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-20-Module-Feature-BD-Heritage-Panel.md`
**Decisions Applied:** D-03 through D-10
**Estimated Effort:** 0.75 sprint-weeks
**Depends On:** T03

> **Doc Classification:** Canonical Normative Plan - SF20-T04 hooks task; sub-plan of `SF20-BD-Heritage-Panel.md`.

---

## Objective

Define state orchestration for heritage retrieval, intelligence feed lifecycle, and approval queue operations.

---

## `useBdHeritage`

Responsibilities:

- load read-only heritage data projection
- surface handoff-scorecard version metadata
- expose refresh and loading/error states

Cache key:

- `['bd-heritage', projectId]`

---

## `useStrategicIntelligence`

Responsibilities:

- load approved feed and contributor-visible pending/rejected drafts
- submit new entries and revisions
- maintain deterministic visibility by approval status and user role

Cache key:

- `['strategic-intelligence', projectId]`

---

## `useIntelligenceApprovalQueue`

Responsibilities:

- load pending approval queue for approvers
- approve/reject actions with reasons
- invalidate feed and queue on transitions

Cache key:

- `['strategic-intelligence', 'approval-queue', projectId]`

---

## State Guarantees

- read-only heritage state cannot be mutated via panel hooks
- approval transitions are monotonic (`pending -> approved/rejected`)
- only approved entries move to searchable/indexable state

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development test -- hooks
pnpm --filter @hbc/features-business-development check-types
```
