# SF12-T06 — `HbcConnectivityBar` and `HbcSyncStatusBadge`: `@hbc/session-state`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-12-Shared-Feature-Session-State.md`
**Decisions Applied:** D-03, D-08
**Estimated Effort:** 0.45 sprint-weeks
**Depends On:** T05

> **Doc Classification:** Canonical Normative Plan — SF12-T06 UI component task; sub-plan of `SF12-Session-State.md`.

---

## Objective

Implement the two user-facing status components for connectivity and queued sync visibility.

---

## `HbcConnectivityBar`

Props:

```typescript
interface HbcConnectivityBarProps {
  showWhenOnline?: boolean;
}
```

Behavior:

- online: hidden unless `showWhenOnline`
- degraded: amber message
- offline: red message indicating queued changes
- reconnect: transient green “syncing changes” message

---

## `HbcSyncStatusBadge`

Props:

```typescript
interface HbcSyncStatusBadgeProps {
  showWhenEmpty?: boolean;
}
```

Behavior:

- displays pending operation count
- amber with pending > 0
- green check when 0 and `showWhenEmpty`
- optional details popover listing queued operations

---

## Accessibility

- status messages use polite live regions
- keyboard focusable badge trigger
- popover content navigable by keyboard

---

## Verification Commands

```bash
pnpm --filter @hbc/session-state test -- HbcConnectivityBar HbcSyncStatusBadge
pnpm --filter @hbc/session-state build
```
