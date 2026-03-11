# SF17-T05 - AdminAlertBadge and AdminAlertDashboard

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-17-Module-Feature-Admin-Intelligence.md`
**Decisions Applied:** D-02, D-03, D-07, D-09
**Estimated Effort:** 0.75 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF17-T05 alert UX task; sub-plan of `SF17-Admin-Intelligence.md`.

---

## Objective

Define render and interaction contracts for admin navigation alert badge and alert dashboard.

---

## `AdminAlertBadge`

Props:

```ts
interface AdminAlertBadgeProps {
  badge: IAdminAlertBadge;
  onOpenDashboard: () => void;
}
```

Behavior:

- severity color: red if any critical/high, amber otherwise
- visible count is `totalCount`
- click/enter opens dashboard route
- complexity gating:
  - Essential: badge only (no list)
  - Standard/Expert: badge + dashboard route

---

## `AdminAlertDashboard`

Props:

```ts
interface AdminAlertDashboardProps {
  initialSeverity?: AlertSeverity | 'all';
}
```

Behavior:

- grouped list by severity (critical -> high -> medium -> low)
- per row: category icon, summary, affected entity, timestamp, CTA, acknowledge action
- acknowledge marks seen but keeps row until resolved source condition clears
- filters: severity, category, acknowledged/unacknowledged
- export CSV action includes current filtered set

Accessibility:

- keyboard traversable row actions
- focus management when filters update list
- aria labels for severity badges and acknowledge buttons

---

## Verification Commands

```bash
pnpm --filter @hbc/features-admin test -- AdminAlertBadge
pnpm --filter @hbc/features-admin test -- AdminAlertDashboard
```
