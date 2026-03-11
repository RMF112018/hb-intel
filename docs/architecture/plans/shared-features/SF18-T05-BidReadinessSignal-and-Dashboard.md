# SF18-T05 - BidReadinessSignal and BidReadinessDashboard

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-18-Module-Feature-Estimating-Bid-Readiness.md`
**Decisions Applied:** D-04, D-06, D-07, D-09
**Estimated Effort:** 0.7 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF18-T05 signal/dashboard UI task; sub-plan of `SF18-Estimating-Bid-Readiness.md`.

---

## Objective

Define compact and detail read models for bid-readiness signal surfaces in list and record contexts.

---

## `BidReadinessSignal`

Props:

```ts
interface BidReadinessSignalProps {
  state: IBidReadinessState;
  onOpenDashboard?: () => void;
}
```

Behavior:

- render status marker and label from `state.status`
- render score percentage text
- show blocker count badge when blockers exist
- tooltip shows top incomplete weighted criteria
- complexity:
  - Essential: marker + label only
  - Standard/Expert: score + blocker badge + tooltip

---

## `BidReadinessDashboard`

Props:

```ts
interface BidReadinessDashboardProps {
  state: IBidReadinessState;
  onOpenChecklist?: () => void;
}
```

Behavior:

- score ring and status headline
- due date countdown (`Due in N days` or `Overdue by N days`)
- blocker summary strip with action links
- expandable checklist entry point

Accessibility:

- keyboard focusable action links
- aria labels for status and blocker badges
- semantic headings for score and due-date regions

---

## Verification Commands

```bash
pnpm --filter @hbc/features-estimating test -- BidReadinessSignal
pnpm --filter @hbc/features-estimating test -- BidReadinessDashboard
```
