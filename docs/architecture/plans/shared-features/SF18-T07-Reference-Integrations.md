# SF18-T07 - Reference Integrations

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-18-Module-Feature-Estimating-Bid-Readiness.md`
**Decisions Applied:** D-07 through D-09
**Estimated Effort:** 0.65 sprint-weeks
**Depends On:** T03-T06

> **Doc Classification:** Canonical Normative Plan - SF18-T07 integration task; sub-plan of `SF18-Estimating-Bid-Readiness.md`.

---

## Objective

Document boundary-safe integration patterns between bid readiness and dependent shared features.

---

## Integration Contracts

- `@hbc/bic-next-move`
  - incomplete blocker criteria generate ownership records for `resolveAssignee`
- `@hbc/acknowledgment`
  - CE sign-off criterion completion reads acknowledgment state
- `@hbc/sharepoint-docs`
  - bid-documents criterion validates plans/specs attachment presence
- `@hbc/notification-intelligence`
  - if due within 48 hours and blockers exist, emit immediate urgency notification
- `@hbc/complexity`
  - controls signal/checklist/diagnostic depth by tier
- PH9b My Work Feed
  - `<48h + blockers` readiness state is eligible for high-priority feed item

---

## Boundary Rules

- no imports from app route pages into package runtime
- readiness model remains pure and side-effect free
- notifications emitted through notification-intelligence interfaces only
- acknowledgment integration consumes public API only

---

## Verification Commands

```bash
pnpm --filter @hbc/features-estimating test -- integrations
rg -n "from 'apps/" packages/features/estimating/src
```
