# PH6F-4 — Wire Shell Redirect Memory (Post-Login Destination Restore)

**Plan ID:** PH6F-4-Cleanup-RedirectMemory
**Parent Plan:** PH6F-DeadWiring-Cleanup-Plan.md
**Blueprint Reference:** §3c (Navigation lifecycle), §2b (Auth guard pattern)
**Foundation Plan Reference:** Phase 5A (redirectMemory: captureIntendedDestination, resolvePostGuardRedirect)
**Priority:** MEDIUM
**Execution Order:** 4th in sequence (after PH6F-3, PH6F-2, PH6F-1)
**Estimated Effort:** 1–2 hours
**Risk:** LOW — additive hook + beforeLoad guard; no destructive changes

---

## Problem Statement

When an unauthenticated user navigates to a protected path (e.g., `/accounting/invoices/123`),
the expected UX is:
1. Auth system captures the intended destination
2. MSAL (or mock auth) redirects the user to login
3. After successful login, the user lands at `/accounting/invoices/123`

**Current behavior:** After login, users always land at the default root path (`/`), losing
their intended destination. Deep links shared via email or Slack are effectively broken.

The shell package exports the full implementation:
- `captureIntendedDestination(params)` — writes the intended path to localStorage
- `resolvePostGuardRedirect(params)` — reads and validates the stored path
- `clearRedirectMemory()` — removes the stored key after navigation
- `isSafeRedirectPath(pathname)` — validates paths before storage (prevents open-redirect attacks)

None of these are called anywhere in the app.

---

## Prerequisite

PH6F-2 (sign-out orchestration) should be complete. `clearRedirectMemory()` is called in the
orchestrated sign-out cleanup, ensuring stale redirect targets don't persist across sessions.
If PH6F-2 is not done, add a manual `clearRedirectMemory()` call in the sign-out handler
(temporary until PH6F-2 is applied).

---

## Step 1 — Verify Redirect Memory Exports

Check that all required functions are exported from `@hbc/shell`:

```bash
grep -n "captureIntendedDestination\|resolvePostGuardRedirect\|clearRedirectMemory\|isSafeRedirectPath" \
  packages/shell/src/index.ts
```

If any are missing from the main barrel, add them or add a subpath alias per the PH6F-0
Vite alias convention.

---

## Step 2 — Capture Intended Destination Before Auth Redirect

**File:** `apps/pwa/src/router/root-route.tsx`

Add to the `createRootRoute` `beforeLoad` callback. If a `beforeLoad` doesn't exist yet,
create one:

```typescript
import {
  captureIntendedDestination,
  resolvePostGuardRedirect,
  clearRedirectMemory,
  isSafeRedirectPath,
} from '@hbc/shell';

export const rootRoute = createRootRoute({
  // D-PH6F-4: Capture intended destination before auth redirect.
  beforeLoad: ({ location }) => {
    const isAuthenticated =
      useAuthStore.getState().lifecyclePhase === 'authenticated';

    // Only capture if user is NOT authenticated and path is safe to store.
    // This fires before MSAL redirects to login, preserving the deep-link target.
    if (!isAuthenticated && isSafeRedirectPath(location.pathname)) {
      captureIntendedDestination({
        pathname: location.pathname,
        runtimeMode: 'pwa',
      });
    }
  },
  component: RootComponent,
});
```

**Note on `isSafeRedirectPath`:** This function filters out paths like `/login`, `/logout`,
`/error`, and `/` that should not be used as redirect targets. Verify its logic in
`packages/shell/src/redirectMemory/` to ensure it covers the PWA's route structure.

---

## Step 3 — Restore Intended Destination After Auth Completes

Inside `RootComponent`, add a `useEffect` that fires when the session transitions to
`'authenticated'` and redirects to the stored path:

```typescript
export function RootComponent() {
  const lifecyclePhase = useAuthStore((s) => s.lifecyclePhase);
  const location = useRouterState({ select: (s) => s.location });

  // D-PH6F-4: Restore intended destination after successful auth.
  // This useEffect mirrors ShellCore's redirect restore behavior for the interim
  // period before ShellCore is adopted (PH8).
  React.useEffect(() => {
    if (lifecyclePhase !== 'authenticated') return;

    const resolvedPath = resolvePostGuardRedirect({
      runtimeMode: 'pwa',
      fallbackPath: null, // null = use role-based landing (PH6F-5) instead of default root
      isTargetAllowed: (pathname) =>
        isSafeRedirectPath(pathname) && pathname !== location.pathname,
    });

    if (resolvedPath) {
      clearRedirectMemory();
      void router.navigate({ to: resolvedPath, replace: true });
    }
    // If no redirect memory, PH6F-5 handles role-based landing
  }, [lifecyclePhase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ... rest of component render
}
```

**Important:** The `clearRedirectMemory()` call here is a safety guard — PH6F-2 already clears
it at sign-out. This additional clear prevents the edge case where a redirect is captured,
then navigation fails, leaving a stale entry.

---

## Step 4 — Integration with PH6F-5 (Role Landing Path)

The redirect memory and role-based landing path work in concert. The recommended combined
`useEffect` (combining PH6F-4 and PH6F-5 into a single handler):

```typescript
// Single useEffect handling both redirect memory (PH6F-4) and role landing (PH6F-5)
React.useEffect(() => {
  if (lifecyclePhase !== 'authenticated') return;

  // 1. Check for saved redirect memory first (highest priority)
  const redirectTarget = resolvePostGuardRedirect({
    runtimeMode: 'pwa',
    fallbackPath: null,
    isTargetAllowed: (pathname) =>
      isSafeRedirectPath(pathname) && pathname !== location.pathname,
  });

  if (redirectTarget) {
    clearRedirectMemory();
    void router.navigate({ to: redirectTarget, replace: true });
    return;
  }

  // 2. Fall back to role-based landing if on root path
  if (location.pathname === '/' || location.pathname === '') {
    const resolvedRoles = useAuthStore.getState().session?.resolvedRoles ?? [];
    const roleLandingPath = resolveRoleLandingPath(resolvedRoles); // from PH6F-5
    void router.navigate({ to: roleLandingPath, replace: true });
  }
}, [lifecyclePhase]);
```

When implementing PH6F-5 immediately after, fold its logic into this same `useEffect` to
avoid duplicate lifecycle subscriptions.

---

## Step 5 — Verify `captureIntendedDestination` Signature

Before implementing, check the actual function signature in `packages/shell/src/redirectMemory/`:

```typescript
// Expected signature — verify against actual implementation:
captureIntendedDestination(params: {
  pathname: string;
  runtimeMode: string;
  search?: string;
  hash?: string;
}): void
```

If the signature differs (e.g., takes a `URL` object or different parameter shape), adjust
Step 2 accordingly.

---

## Files Modified

| Action | File |
|--------|------|
| Modify | `apps/pwa/src/router/root-route.tsx` (add `beforeLoad` + `useEffect`) |

---

## Verification Commands

```bash
# 1. Build check
pnpm turbo run build

# 2. Manual test — deep link restoration
pnpm --filter pwa dev

# Test scenario A: Unauthenticated deep link
# a. Clear localStorage (DevTools → Application → Clear All)
# b. Navigate directly to http://localhost:4000/accounting
# c. MSAL redirects to login
# d. Complete login
# e. Verify: lands at /accounting, NOT at /

# Test scenario B: Deep link with subpath
# a. Clear localStorage
# b. Navigate to http://localhost:4000/project-hub/some-id
# c. Complete login
# d. Verify: lands at /project-hub/some-id

# Test scenario C: Redirect memory cleared after use
# a. Sign in via deep link to /accounting
# b. Sign out
# c. Sign in again (no deep link this time)
# d. Verify: does NOT redirect to /accounting (old redirect memory cleared by PH6F-2)

# Test scenario D: Unsafe paths not captured
# a. Navigate to /login or / before auth
# b. Complete login
# c. Verify: does NOT redirect back to /login or /
#    — role-based landing (PH6F-5) fires instead
```

---

## Success Criteria

- [ ] PH6F-4.1 Intended destination captured in `beforeLoad` before MSAL redirect
- [ ] PH6F-4.2 Destination restored after auth lifecycle reaches `'authenticated'`
- [ ] PH6F-4.3 `isSafeRedirectPath` prevents `/`, `/login`, and similar paths from being stored
- [ ] PH6F-4.4 Redirect memory cleared after successful restoration
- [ ] PH6F-4.5 Redirect memory cleared on sign-out (via PH6F-2 or manual call)
- [ ] PH6F-4.6 Deep links to subpaths (e.g., `/accounting/invoice/123`) are fully restored
- [ ] PH6F-4.7 Build passes with zero TypeScript errors

<!-- IMPLEMENTATION PROGRESS & NOTES
Task created: 2026-03-07
Phase PH6F-4 completed: 2026-03-07
Status: COMPLETE — all wiring applied to apps/pwa/src/router/root-route.tsx

PH6F-4.1 ✅ beforeLoad captures intended destination for unauthenticated users on safe non-root paths
PH6F-4.2 ✅ useEffect restores redirect target when lifecyclePhase transitions to 'authenticated'
PH6F-4.3 ✅ isSafeRedirectPath + explicit pathname !== '/' guard prevents root/unsafe capture
PH6F-4.4 ✅ clearRedirectMemory called after successful restoration
PH6F-4.5 ✅ Sign-out cleanup already wired via PH6F-2
PH6F-4.6 ✅ Deep subpath links fully restored (pathname preserved)
PH6F-4.7 ✅ Build passes (pnpm turbo run build --filter=@hbc/pwa --filter=@hbc/shell)

Deviations from governing plan:
- Used restoreRedirectTarget (returns null) instead of resolvePostGuardRedirect (fallbackPath: string, not nullable)
- Added redirect-chain overwrite guard: only captures if no existing unexpired record
- Added explicit pathname !== '/' check since isSafeRedirectPath allows root path

Next: PH6F-5 (role-based landing) — fold into same useEffect
-->
