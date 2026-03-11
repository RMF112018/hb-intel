# SF18-T04 - Hooks and State Model

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-18-Module-Feature-Estimating-Bid-Readiness.md`
**Decisions Applied:** D-04 through D-08, D-10
**Estimated Effort:** 0.7 sprint-weeks
**Depends On:** T03

> **Doc Classification:** Canonical Normative Plan - SF18-T04 hooks task; sub-plan of `SF18-Estimating-Bid-Readiness.md`.

---

## Objective

Define hook-level state orchestration for readiness computation, criteria loading, and configuration updates.

---

## `useBidReadiness`

Responsibilities:

- resolve criteria/config and compute `IBidReadinessState`
- recompute on pursuit or config changes
- expose loading/error/refresh states
- publish urgency metadata for `<48h + blockers` notification path

Cache key:

- `['bid-readiness', pursuitId]`

---

## `useBidReadinessCriteria`

Responsibilities:

- return effective criteria list with source metadata
- include blocker-first ordering for checklist rendering
- expose criteria refresh and error state

Cache key:

- `['bid-readiness', 'criteria']`

---

## `useBidReadinessConfig`

Responsibilities:

- fetch admin override config and merge with defaults
- expose mutation actions for admin config updates
- invalidate readiness computations on config change

Cache key:

- `['bid-readiness', 'config']`

---

## State Guarantees

- stable return shape across loading/success/error
- deterministic criterion evaluation order
- no stale blocker count after config mutation
- due-date transitions reflected at next poll/refresh

---

## Verification Commands

```bash
pnpm --filter @hbc/features-estimating test -- useBidReadiness
pnpm --filter @hbc/features-estimating check-types
```
