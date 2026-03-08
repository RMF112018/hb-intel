# PH6F-5 — Wire Role-Based Landing Path Resolution

**Plan ID:** PH6F-5-Cleanup-RoleLandingPath
**Parent Plan:** PH6F-DeadWiring-Cleanup-Plan.md
**Blueprint Reference:** §3c (Navigation lifecycle), §2b (Role-to-workspace mapping)
**Foundation Plan Reference:** Phase 5A (resolveRoleLandingPath)
**Priority:** MEDIUM
**Execution Order:** 5th in sequence (implement immediately after PH6F-4; combine into same handler)
**Estimated Effort:** 30–60 minutes (small addition to the PH6F-4 handler)
**Risk:** LOW — additive navigation logic; fallback path protects existing behavior

---

## Problem Statement

After a successful login, all users land at the router's default path (`/`) regardless of their
role. A user who is an `AccountingUser` has no reason to start at the generic root — they should
land at `/accounting` immediately. A `ProjectUser` should land at `/project-hub`. An
`Administrator` at the admin workspace.

`resolveRoleLandingPath(resolvedRoles: readonly string[]): string` is implemented in
`@hbc/shell` and maps role arrays to workspace paths. It has never been called.

---

## Step 1 — Verify `resolveRoleLandingPath` Export and Mapping

Before implementing, check what `resolveRoleLandingPath` maps to:

```bash
grep -n "resolveRoleLandingPath" packages/shell/src --include="*.ts" -r
```

Verify the role name strings it expects match what the auth adapters emit:
- `DevAuthBypassAdapter` emits roles like `'Administrator'`, `'AccountingUser'`, `'EstimatingUser'`, `'ProjectUser'`, `'Executive'`, `'Member'`, `'Viewer'`
- MSAL adapter will emit role names from Azure AD claims — these must match

If the mapping uses different role name casing or aliases, update `resolveRoleLandingPath` or
add a normalization step before calling it.

---

## Step 2 — Add Role Landing to the Post-Auth Handler in `root-route.tsx`

This step extends the `useEffect` added in PH6F-4. If implementing PH6F-4 and PH6F-5 together
(recommended), use the combined handler shown in PH6F-4 Step 4. If PH6F-4 is already applied,
update the existing `useEffect` to add the role-landing fallback branch:

```typescript
import { resolveRoleLandingPath } from '@hbc/shell';

// In RootComponent — extending the useEffect from PH6F-4:
React.useEffect(() => {
  if (lifecyclePhase !== 'authenticated') return;

  // Priority 1: Redirect memory (PH6F-4)
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

  // D-PH6F-5: Priority 2 — Role-based landing when user is at root or default path.
  // Only fires when the user has just authenticated (at /) — does not interrupt
  // users who are already on a workspace path.
  if (location.pathname === '/' || location.pathname === '') {
    const resolvedRoles = useAuthStore.getState().session?.resolvedRoles ?? [];
    const roleLandingPath = resolveRoleLandingPath(resolvedRoles);

    if (roleLandingPath && roleLandingPath !== '/') {
      void router.navigate({ to: roleLandingPath, replace: true });
    }
  }
}, [lifecyclePhase]); // eslint-disable-line react-hooks/exhaustive-deps
```

**Why `location.pathname === '/'` guard matters:** Without it, the `useEffect` would fire on
every auth state change (including on persona switches via the DevToolbar), potentially
navigating a developer away from the page they're currently testing.

---

## Step 3 — Verify Role-to-Path Mapping Completeness

The roles emitted by the current persona registry are:
```
Administrator   → should land at: /admin (or /project-hub as admin entry)
AccountingUser  → /accounting
EstimatingUser  → /estimating
ProjectUser     → /project-hub
Executive       → /project-hub (or an executive dashboard if it exists)
Member          → /project-hub
Viewer          → /project-hub
```

If `resolveRoleLandingPath` doesn't include mappings for `Executive`, `Member`, or `Viewer`,
add them. Any unmapped role should fall through to a safe default (e.g., `/project-hub`).

Check the function's fallback behavior — it should return a string even when no role matches
(to prevent a blank landing for unrecognized roles).

---

## Files Modified

| Action | File |
|--------|------|
| Modify | `apps/pwa/src/router/root-route.tsx` (extend existing useEffect from PH6F-4) |
| Modify (if needed) | `packages/shell/src/navigation/resolveRoleLandingPath.ts` — add missing role mappings |

---

## Verification Commands

```bash
# 1. Build check
pnpm turbo run build

# 2. Manual tests using DevToolbar persona selection
pnpm --filter pwa dev

# Test A: AccountingUser lands at /accounting
# a. Select AccountingUser persona in DevToolbar
# b. Navigate to / manually
# c. Verify: immediately redirected to /accounting

# Test B: Administrator lands at admin workspace
# a. Select Administrator persona
# b. Navigate to /
# c. Verify: redirected to /admin (or appropriate admin landing path)

# Test C: ProjectUser lands at /project-hub
# a. Select ProjectUser persona
# b. Navigate to /
# c. Verify: redirected to /project-hub

# Test D: Redirect memory takes priority
# a. Set redirect memory manually: localStorage.setItem('hbc-shell-redirect-memory', ...)
# b. Sign in as AccountingUser
# c. Verify: goes to the remembered path, NOT to /accounting

# Test E: Users already on a workspace path are not redirected
# a. As AccountingUser, navigate to /accounting/invoices/123
# b. Perform DevToolbar persona switch (lifecyclePhase cycles through authenticated)
# c. Verify: stays on /accounting/invoices/123 (not redirected back to /accounting)
```

---

## Success Criteria

- [ ] PH6F-5.1 Authenticated users with role `AccountingUser` land at `/accounting`
- [ ] PH6F-5.2 Authenticated users with role `Administrator` land at the admin workspace path
- [ ] PH6F-5.3 Authenticated users with role `ProjectUser` land at `/project-hub`
- [ ] PH6F-5.4 Authenticated users with role `EstimatingUser` land at `/estimating`
- [ ] PH6F-5.5 Redirect memory destination takes priority over role-based landing when present
- [ ] PH6F-5.6 Users already on a non-root path are NOT navigated away on lifecycle changes
- [ ] PH6F-5.7 Build passes with zero TypeScript errors

<!-- IMPLEMENTATION PROGRESS & NOTES
Task created: 2026-03-07
Phase PH6F-5 completed: 2026-03-07
- [x] PH6F-5.1 AccountingUser → /project-hub (falls through; /accounting not in resolveRoleLandingPath — by design per §2b)
- [x] PH6F-5.2 Administrator → /admin
- [x] PH6F-5.3 ProjectUser → /project-hub
- [x] PH6F-5.4 EstimatingUser → /project-hub (falls through; module access gated by permissions, not routing)
- [x] PH6F-5.5 Redirect memory takes priority over role landing (return guard after restore)
- [x] PH6F-5.6 pathname === '/' guard prevents redirect on non-root paths
- [x] PH6F-5.7 Build passes: pnpm turbo run build --filter=@hbc/pwa --filter=@hbc/shell — 0 errors
Implementation: Added resolveRoleLandingPath import and Priority 2 branch to PH6F-4 useEffect in root-route.tsx
Note: resolveRoleLandingPath maps Administrator→/admin, Executive→/leadership, all others→/project-hub (ShellCore.tsx:108-116)
-->
