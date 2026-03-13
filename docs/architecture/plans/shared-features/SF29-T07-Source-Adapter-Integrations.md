# SF29-T07 - Source Adapter Integrations

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-29-Shared-Feature-My-Work-Feed.md`
**Decisions Applied:** L-01 through L-10
**Estimated Effort:** 0.95 sprint-weeks
**Depends On:** T03-T06

> **Doc Classification:** Canonical Normative Plan - SF29-T07 integration task; sub-plan of `SF29-My-Work-Feed.md`.

---

## Objective

Document boundary-safe source-adapter integrations across `@hbc/my-work-feed`, required Tier-1 primitives, shared infrastructure, and host surfaces.

---

## Built-In Adapters

- `bicAdapter`
  - primary ownership / urgency / blocked-state source via `@hbc/bic-next-move`
- `handoffAdapter`
  - inbound handoff and receipt-required source via `@hbc/workflow-handoff`
- `acknowledgmentAdapter`
  - pending sign-off and receipt work via `@hbc/acknowledgment`
- `notificationAdapter`
  - attention-tier source metadata and freshness hints via `@hbc/notification-intelligence`
- `draftResumeAdapter`
  - resumable local drafts and queued follow-up signals via `@hbc/session-state`

---

## Integration Contracts

- `@hbc/bic-next-move`
  - ownership truth, urgency tiers, blocked state, and deep-link hints
- `@hbc/workflow-handoff`
  - inbound handoff state, recipient context, and acknowledge/reject action projection
- `@hbc/acknowledgment`
  - sign-off state, eligibility, and replay-safe acknowledgment metadata where supported
- `@hbc/notification-intelligence`
  - immediate/watch/digest urgency source metadata and suppression coordination
- `@hbc/session-state`
  - connectivity state, replay queue, cached snapshots, and resumable draft discovery
- `@hbc/project-canvas`
  - compact `HbcMyWorkTile` placement and role-aware default tile recommendations
- `@hbc/related-items`
  - contextual deep-links from work items to related records and downstream context
- `@hbc/query-hooks`
  - shared query infrastructure and repository access seams
- `@hbc/data-access`
  - repository interfaces and future server-side aggregation endpoint seam
- `@hbc/shell`
  - launcher, badge, and panel host wiring
- `@hbc/ui-kit`
  - reusable design-system primitives only
- `@hbc/complexity`
  - Essential/Standard/Expert disclosure control

---

## Boundary Rules

- adapters consume public exports only
- no route-layer imports inside `@hbc/my-work-feed`
- adapters do not re-implement primitive-owned state engines
- notification suppression logic coordinates with, but does not replace, notification-intelligence policies
- `saved-views`, `bulk-actions`, and `activity-timeline` are future seams only and must not be required for initial SF29 delivery

---

## Verification Commands

```bash
pnpm --filter @hbc/my-work-feed test -- integrations
rg -n "from 'apps/" packages/my-work-feed/src
rg -n "saved-views|bulk-actions|activity-timeline" docs/architecture/plans/shared-features/SF29*.md
```
