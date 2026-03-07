# PH6F-1 — Mount HbcConnectivityBar in the PWA Shell

**Plan ID:** PH6F-1-Cleanup-ConnectivityBar
**Parent Plan:** PH6F-DeadWiring-Cleanup-Plan.md
**Blueprint Reference:** §3b (Shell connectivity surface), §5a (Shell status rail)
**Foundation Plan Reference:** Phase 5A (HbcConnectivityBar implementation)
**Priority:** HIGH
**Execution Order:** 3rd in sequence (after PH6F-3 and PH6F-2)
**Estimated Effort:** 1–2 hours
**Risk:** LOW — additive render; no existing code paths are modified

---

## Problem Statement

`HbcConnectivityBar` is fully implemented in `@hbc/ui-kit`. It:
- Detects `navigator.onLine` and maps a `ShellStatusSnapshot` to a visual bar
- Shows a 2px green bar when connected and authenticated
- Shows a 4px pulsing orange bar when reconnecting (offline)
- Shows a 4px pulsing red bar on fatal auth/shell error
- Surfaces `sign-in-again` and `retry` action buttons

It is never rendered anywhere in the application. Developers and end-users have no visual
indicator of offline state or shell health. The "sign in again" recovery pathway is inaccessible.

---

## Prerequisite

PH6F-2 (sign-out orchestration) should be complete first. The `sign-in-again` action handler
added in this task calls `performPwaSignOut()`, which requires the orchestrated sign-out from
PH6F-2. If PH6F-2 is not yet done, use `useAuthStore.getState().clear()` as a temporary
placeholder and update it once PH6F-2 is complete.

---

## Recommended Wiring Point

Wire into `apps/pwa/src/router/root-route.tsx`, not inside `HbcAppShell`. Reasons:
- The bar needs a live `ShellStatusSnapshot` from `useAuthStore`, which `root-route.tsx` already imports
- Keeping it outside `HbcAppShell` means the SPFx shell can independently wire its own bar
- `HbcAppShell` is intentionally presentational — adding state-aware behavior inside it violates the component's design contract
- When `ShellCore` is fully adopted in PH8, `HbcConnectivityBar` is removed from here and replaced by ShellCore's built-in `renderStatusRail` prop

---

## Step 1 — Add Imports to `root-route.tsx`

**File:** `apps/pwa/src/router/root-route.tsx`

Add to imports block:

```typescript
import React from 'react';
import { HbcAppShell, HbcConnectivityBar } from '@hbc/ui-kit';
import {
  resolveShellStatusSnapshot,
  type ShellStatusSnapshot,
  type ShellConnectivitySignal,
} from '@hbc/shell';
import { performPwaSignOut } from '../auth/signOut.js'; // from PH6F-2 — use clear() temporarily if PH6F-2 pending
```

---

## Step 2 — Build `ShellStatusSnapshot` in `RootComponent`

Inside `RootComponent`, derive the connectivity status snapshot from auth store state:

```typescript
export function RootComponent() {
  // Existing auth store subscription (already present or add):
  const lifecyclePhase = useAuthStore((s) => s.lifecyclePhase);
  const structuredError = useAuthStore((s) => s.structuredError);

  // D-PH6F-1: Online/offline connectivity signal
  const [onlineStatus, setOnlineStatus] = React.useState<ShellConnectivitySignal>(
    typeof navigator !== 'undefined' && navigator.onLine ? 'connected' : 'reconnecting',
  );

  React.useEffect(() => {
    const setOnline = () => setOnlineStatus('connected');
    const setOffline = () => setOnlineStatus('reconnecting');
    window.addEventListener('online', setOnline);
    window.addEventListener('offline', setOffline);
    return () => {
      window.removeEventListener('online', setOnline);
      window.removeEventListener('offline', setOffline);
    };
  }, []);

  // D-PH6F-1: Derive shell status snapshot from auth lifecycle and connectivity signal.
  // experienceState is simplified to 'ready' because RootComponent only renders after
  // MSAL auth has passed (inside MsalGuard). Full degraded-mode support requires
  // ShellCore integration, deferred to PH8.
  const shellStatusSnapshot: ShellStatusSnapshot = React.useMemo(
    () =>
      resolveShellStatusSnapshot({
        lifecyclePhase,
        experienceState: 'ready',
        hasAccessValidationIssue: false,
        hasFatalError: Boolean(structuredError),
        connectivitySignal: onlineStatus,
      }),
    [lifecyclePhase, structuredError, onlineStatus],
  );

  // ... rest of component
}
```

---

## Step 3 — Render `HbcConnectivityBar` Above `HbcAppShell`

Replace the current `return` statement in `RootComponent` to wrap with a Fragment and prepend
the connectivity bar:

```typescript
return (
  <>
    {/* D-PH6F-1: Connectivity status bar — renders at all times */}
    <HbcConnectivityBar
      shellStatus={shellStatusSnapshot}
      onShellAction={(action) => {
        if (action === 'sign-in-again') {
          void performPwaSignOut().then(() => {
            void router.navigate({ to: '/' });
          });
        }
        if (action === 'retry') {
          window.location.reload();
        }
      }}
    />
    <HbcAppShell
      mode="pwa"
      user={shellUser}
      sidebarGroups={sidebarGroups}
      onNavigate={(href) => void router.navigate({ to: href })}
      onSignOut={() => {
        void performPwaSignOut().then(() => {
          void router.navigate({ to: '/' });
        });
      }}
    >
      <Outlet />
    </HbcAppShell>
  </>
);
```

**Note:** If the current `root-route.tsx` does not yet use a Fragment wrapper, this is the first
time one is needed. The Fragment avoids an extra DOM element.

---

## Step 4 — Verify `resolveShellStatusSnapshot` Export

Before implementing, confirm `resolveShellStatusSnapshot` is exported from `@hbc/shell`. Check
`packages/shell/src/index.ts` for:

```typescript
export { resolveShellStatusSnapshot } from './status/resolveShellStatusSnapshot.js';
export type { ShellStatusSnapshot, ShellConnectivitySignal } from './status/types.js';
```

If these exports are missing, add them. Also verify that `HbcConnectivityBar` is exported from
`@hbc/ui-kit`:

```typescript
// packages/ui-kit/src/index.ts
export { HbcConnectivityBar } from './HbcConnectivityBar/index.js';
```

---

## Files Modified

| Action | File |
|--------|------|
| Modify | `apps/pwa/src/router/root-route.tsx` |

---

## Verification Commands

```bash
# 1. TypeScript check
pnpm turbo run type-check

# 2. Build
pnpm turbo run build

# 3. Dev server manual checks
pnpm --filter pwa dev
# a. Open http://localhost:4000
# b. Verify: thin green bar visible at very top of shell (2px when healthy)
# c. Open DevTools → Network → throttle to "Offline"
# d. Verify: bar transitions to orange pulse (reconnecting state)
# e. Restore network → Verify: bar returns to green
# f. Verify: "Sign in again" button appears when shell shows error-failure state
# g. Click "Sign in again" → verify auth store is cleared and root navigation fires
```

---

## Success Criteria

- [ ] PH6F-1.1 `HbcConnectivityBar` renders in the PWA root component at all times
- [ ] PH6F-1.2 Bar shows green (2px) when browser is online and session is authenticated
- [ ] PH6F-1.3 Bar transitions to orange pulse when browser goes offline
- [ ] PH6F-1.4 Bar transitions back to green when browser comes back online
- [ ] PH6F-1.5 Bar shows red on `structuredError` in auth store
- [ ] PH6F-1.6 `sign-in-again` action triggers orchestrated sign-out and navigates to root
- [ ] PH6F-1.7 `retry` action triggers `window.location.reload()`
- [ ] PH6F-1.8 Build passes with zero TypeScript errors

---

## Phase 2 Note (PH8 Deferred)

When `ShellCore` is adopted in PH8, `HbcConnectivityBar` in `root-route.tsx` will be removed.
`ShellCore` has a `renderStatusRail` prop that mounts the connectivity bar internally. The
`ShellStatusSnapshot` derivation and `onShellAction` handler will be moved into the
`PwaShellEnvironmentAdapter` at that time.

<!-- IMPLEMENTATION PROGRESS & NOTES
Task created: 2026-03-07
Status: COMPLETE — 2026-03-07
Execution: Third in sequence (after PH6F-3 and PH6F-2)
Temporary: PH6F-2 not yet done — sign-in-again uses useAuthStore.getState().clear() placeholder

Implementation completed: 2026-03-07
- [x] PH6F-1.1 HbcConnectivityBar renders in PWA root component at all times
- [x] PH6F-1.2 Bar shows green (2px) when online and authenticated
- [x] PH6F-1.3 Bar transitions to orange pulse when offline
- [x] PH6F-1.4 Bar transitions back to green when online restored
- [x] PH6F-1.5 Bar shows red on structuredError in auth store
- [x] PH6F-1.6 sign-in-again triggers clear() + navigate (temp; PH6F-2 will replace with performPwaSignOut)
- [x] PH6F-1.7 retry triggers window.location.reload()
- [x] PH6F-1.8 Build passes with zero TypeScript errors

Files modified:
- apps/pwa/src/router/root-route.tsx (imports, connectivity state, Fragment wrapper, HbcConnectivityBar render)
Next: Update sign-in-again handler when PH6F-2 delivers performPwaSignOut()
-->
