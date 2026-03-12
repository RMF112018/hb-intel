# SF22-T04 - Hooks and State Model

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-22-Module-Feature-Post-Bid-Learning-Loop_UPDATED.md` (required canonical target; currently missing) and `docs/explanation/feature-decisions/PH7-SF-22-Module-Feature-Post-Bid-Learning-Loop.md` (interim baseline)
**Decisions Applied:** L-01 through L-14
**Estimated Effort:** 0.95 sprint-weeks
**Depends On:** T03

> **Doc Classification:** Canonical Normative Plan - SF22-T04 hooks task; sub-plan of `SF22-Post-Bid-Learning-Loop.md`.

---

## Objective

Define primitive and adapter hook orchestration for autopsy state, confidence/evidence completeness, review/publication gating, disagreement flow, queue sync, and KPI emission.

---

## Primitive Hooks

- `usePostBidAutopsyState`
  - loads autopsy + lifecycle + publication-gate state
  - exposes loading/error/refresh + queue status + commit metadata
- `usePostBidAutopsySections`
  - updates section drafts and validation state
  - emits section-level ownership and evidence completeness metadata
- `usePostBidAutopsyReview`
  - handles review decisions, disagreements, and escalation flags
- `usePostBidAutopsyQueue`
  - manages queued offline mutations and replay transitions

Cache keys:
- `['post-bid-autopsy', pursuitId]`
- `['post-bid-autopsy', pursuitId, 'sections']`
- `['post-bid-autopsy', pursuitId, 'review']`
- `['post-bid-autopsy', pursuitId, 'queue']`

---

## Adapter Hooks

- BD and Estimating adapters map primitive state to module-specific labels/routes
- adapters project trust indicators, triage actions, avatar ownership, and My Work placement metadata
- adapters must not redefine lifecycle/confidence/publication calculations

---

## State Guarantees

- stable return shape across loading/success/error
- explicit optimistic statuses: `Saved locally`, `Queued to sync`
- confidence reasons/evidence completeness/publication blockers always accessible
- disagreement/escalation state projected for UI triage
- replay completion emits immutable version metadata

---

## Verification Commands

```bash
pnpm --filter @hbc/post-bid-autopsy test -- hooks
pnpm --filter @hbc/features-business-development test -- post-bid-learning-hooks
pnpm --filter @hbc/features-estimating test -- post-bid-learning-hooks
pnpm --filter @hbc/post-bid-autopsy check-types
```
