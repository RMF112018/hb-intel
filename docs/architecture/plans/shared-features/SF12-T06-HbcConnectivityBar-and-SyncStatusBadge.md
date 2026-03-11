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

<!-- IMPLEMENTATION PROGRESS & NOTES
SF12-T06 completed: 2026-03-11
- HbcConnectivityBar: full state machine (online/degraded/offline/syncing), showWhenOnline prop, role="status" + aria-live="polite", inline CSS-in-JS
- HbcSyncStatusBadge: pending count badge, green synced check, native <details>/<summary> popover, <button> trigger, retry display
- components/index.ts barrel exports both components + prop types
- src/index.ts updated with Components section
- vitest.config.ts: removed src/components/** from coverage exclusions
- 7 HbcConnectivityBar tests: hidden/online, showWhenOnline, degraded, offline+count, syncing transition, a11y, SPFx-safe
- 7 HbcSyncStatusBadge tests: hidden/empty, showWhenEmpty, pending count, popover ops, keyboard focus, keyboard nav, aria attrs
- 91 total tests pass; coverage 98.83% stmts / 97.77% branches / 95.55% functions
- All gates pass: check-types ✓ | test ✓ | build ✓
-->
