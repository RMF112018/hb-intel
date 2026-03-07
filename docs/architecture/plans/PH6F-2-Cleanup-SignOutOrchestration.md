# PH6F-2 — Wire Shell Sign-Out Orchestration

**Plan ID:** PH6F-2-Cleanup-SignOutOrchestration
**Parent Plan:** PH6F-DeadWiring-Cleanup-Plan.md
**Blueprint Reference:** §2b (Auth lifecycle), §3a (Shell sign-out contract)
**Foundation Plan Reference:** Phase 5A (runShellSignOutCleanup, createDefaultShellSignOutCleanupDependencies)
**Priority:** HIGH
**Execution Order:** 2nd in sequence (after PH6F-3, before PH6F-1)
**Estimated Effort:** 2–3 hours
**Risk:** MEDIUM — replaces an active sign-out pathway; store reset actions may need to be added

---

## Problem Statement

The current sign-out in `apps/pwa/src/router/root-route.tsx` calls `useAuthStore.getState().clear()`
directly and immediately navigates to `/`. This misses:

- **Redirect memory cleanup** — The post-login destination stored in `localStorage['hbc-shell-redirect-memory']` is never cleared. On the next login, the user is redirected to a stale path.
- **Zustand store teardown** — `useNavStore`, `useShellCoreStore`, and `useProjectStore` retain their state across sign-out. A subsequent sign-in begins with stale data.
- **Feature cache eviction** — Any in-memory feature registration state or permission evaluation caches are not cleared.
- **Adapter cleanup** — In environments where the auth adapter holds resources (MSAL token cache, SPFx context), the adapter-level cleanup is skipped.

`runShellSignOutCleanup` and `createDefaultShellSignOutCleanupDependencies` (from `@hbc/shell`)
provide a tested, deterministic orchestration sequence for all of the above. They have never
been called.

---

## Step 1 — Audit Zustand Stores for `reset()` Actions

Before creating the sign-out utility, verify whether `useNavStore`, `useShellCoreStore`, and
`useProjectStore` have `reset()` actions. If missing, add them.

**Pattern to add (if `reset()` is missing):**

```typescript
// In any Zustand store that needs reset — example for useNavStore
// 1. Extract initial state as a named const:
const initialNavState = {
  activeWorkspace: null,
  breadcrumbs: [],
  // ... all other initial fields
};

// 2. Add reset action to the store definition:
export const useNavStore = create<NavState>((set) => ({
  ...initialNavState,
  // ... existing actions
  reset: () => set(initialNavState),
}));
```

Check these files:
- `packages/shell/src/stores/navStore.ts` — look for `reset` action
- `packages/shell/src/stores/shellCoreStore.ts` — look for `reset` action
- `packages/shell/src/stores/projectStore.ts` — look for `reset` action

If any store already has a `clear()` or `reset()` action, use the existing name.

---

## Step 2 — Create `apps/pwa/src/auth/signOut.ts`

**New file:** `apps/pwa/src/auth/signOut.ts`

```typescript
// apps/pwa/src/auth/signOut.ts
// D-PH6F-2: Orchestrated PWA sign-out using shell cleanup pipeline.
// Replaces the direct useAuthStore.clear() call in root-route.tsx.

import {
  runShellSignOutCleanup,
  createDefaultShellSignOutCleanupDependencies,
  clearRedirectMemory,
} from '@hbc/shell';
import { useAuthStore, usePermissionStore } from '@hbc/auth';
import { useNavStore, useProjectStore } from '@hbc/shell';

/**
 * performPwaSignOut
 * =================
 * D-PH6F-2: Orchestrated sign-out for the PWA runtime.
 * Clears auth session, Zustand stores, redirect memory, and permission state
 * in the deterministic order defined by runShellSignOutCleanup.
 *
 * Called by:
 * - root-route.tsx HbcAppShell.onSignOut prop
 * - root-route.tsx HbcConnectivityBar sign-in-again action (PH6F-1)
 */
export async function performPwaSignOut(): Promise<void> {
  // Build the base dependency set (adapter = null because PwaShellEnvironmentAdapter
  // doesn't exist yet — deferred to PH8 ShellCore adoption).
  const baseDependencies = createDefaultShellSignOutCleanupDependencies(null);

  const pwaSignOutDependencies = {
    ...baseDependencies,

    // D-PH6F-2: Override clearShellBootstrapState to reset all Zustand stores.
    clearShellBootstrapState: async (): Promise<void> => {
      useAuthStore.getState().clear();
      usePermissionStore.getState().clear();
      useNavStore.getState().reset?.();
      useProjectStore.getState().reset?.();
    },

    // D-PH6F-2: Override clearRedirectMemory to use the shell utility.
    clearRedirectMemory: (): void => {
      clearRedirectMemory();
    },

    // D-PH6F-2: Override clearAuthSession to match the Zustand-based auth pattern.
    clearAuthSession: async (): Promise<void> => {
      useAuthStore.getState().clear();
    },
  };

  await runShellSignOutCleanup(pwaSignOutDependencies, ['strict', 'standard']);
}
```

**Notes:**
- `createDefaultShellSignOutCleanupDependencies(null)` passes `null` for the adapter, which
  produces safe no-op stubs for adapter-dependent phases. The overrides above replace only the
  Zustand and redirect memory phases.
- `['strict', 'standard']` targets only the two cleanup tiers most relevant to the PWA. Verify
  these tier names match what `runShellSignOutCleanup` accepts — check its signature in
  `packages/shell/src/lifecycle/signOut.ts`.
- `useNavStore.getState().reset?.()` uses optional chaining so it is safe even if the store
  doesn't have `reset` yet (Step 1 should add it).

---

## Step 3 — Replace Sign-Out Calls in `root-route.tsx`

**File:** `apps/pwa/src/router/root-route.tsx`

Find all instances of the current sign-out pattern:
```typescript
useAuthStore.getState().clear();
void router.navigate({ to: '/' });
```

Replace with:
```typescript
void performPwaSignOut().then(() => {
  void router.navigate({ to: '/' });
});
```

This applies to at minimum:
1. The `onSignOut` prop on `HbcAppShell`
2. Any `sign-in-again` handler (from PH6F-1)
3. Any error-state recovery navigation that clears auth

**Import to add at top of root-route.tsx:**
```typescript
import { performPwaSignOut } from '../auth/signOut.js';
```

---

## Step 4 — Verify `runShellSignOutCleanup` API

Before implementing, verify the actual API of `runShellSignOutCleanup` in
`packages/shell/src/lifecycle/signOut.ts` (or equivalent path):

```bash
# Find the actual file:
grep -r "runShellSignOutCleanup" packages/shell/src --include="*.ts" -l

# Check the function signature and tier names
```

Key things to verify:
- The exact function signature of `runShellSignOutCleanup(deps, tiers)`
- Whether `createDefaultShellSignOutCleanupDependencies` accepts `null` or needs a typed adapter
- The names of the cleanup tiers (`'strict'`, `'standard'`, etc.)
- Whether the dependency override pattern (spread + override) is supported

Adjust the implementation in Step 2 to match the actual API.

---

## Step 5 — Add `clearRedirectMemory` Export Check

Verify `clearRedirectMemory` is exported from `@hbc/shell`:
```typescript
// packages/shell/src/index.ts — should include:
export { clearRedirectMemory } from './redirectMemory/index.js';
```

If it is only available via a subpath (`@hbc/shell/redirectMemory`), add the alias to Vite
configs per the PH6F-0 subpath alias convention:
```typescript
'@hbc/shell/redirectMemory': path.resolve(__dirname, '../../packages/shell/src/redirectMemory/index.ts'),
```

---

## Files Modified / Created

| Action | File |
|--------|------|
| Create | `apps/pwa/src/auth/signOut.ts` |
| Modify | `apps/pwa/src/router/root-route.tsx` |
| Modify (if needed) | `packages/shell/src/stores/navStore.ts` — add `reset()` |
| Modify (if needed) | `packages/shell/src/stores/projectStore.ts` — add `reset()` |

---

## Verification Commands

```bash
# 1. TypeScript check
pnpm turbo run type-check

# 2. Build
pnpm turbo run build

# 3. Manual verification in dev-harness or PWA
pnpm --filter pwa dev
# a. Sign in (dev mode: bootstrap initializes as Administrator)
# b. Navigate to /project-hub and set some nav state
# c. Click Sign Out
# d. Open DevTools → Application → Local Storage
#    → Verify: 'hbc-shell-redirect-memory' key is ABSENT
# e. Open DevTools → Application → Session Storage
#    → Verify: no stale auth session keys
# f. Open DevTools → Components (React DevTools) → inspect useNavStore
#    → Verify: activeWorkspace and breadcrumbs reset to initial values
# g. Open DevTools → Components → inspect useAuthStore
#    → Verify: lifecyclePhase === 'idle', session === null, currentUser === null

# 4. Test that navigation post-sign-out works correctly
# Sign out → browser lands at / → re-bootstrap initializes fresh session
```

---

## Success Criteria

- [ ] PH6F-2.1 `performPwaSignOut()` called on all sign-out pathways in `root-route.tsx`
- [ ] PH6F-2.2 Auth store (`useAuthStore`) cleared after sign-out (`lifecyclePhase === 'idle'`)
- [ ] PH6F-2.3 Permission store (`usePermissionStore`) cleared after sign-out
- [ ] PH6F-2.4 Nav store (`useNavStore`) reset to initial state after sign-out
- [ ] PH6F-2.5 Project store (`useProjectStore`) reset to initial state after sign-out
- [ ] PH6F-2.6 Redirect memory key `hbc-shell-redirect-memory` absent from localStorage after sign-out
- [ ] PH6F-2.7 Navigation to `/` fires after cleanup completes (not before)
- [ ] PH6F-2.8 Build passes with zero TypeScript errors

<!-- IMPLEMENTATION PROGRESS & NOTES
Task created: 2026-03-07
Completed: 2026-03-07

Step 1 — navStore reset(): Added reset() action to useNavStore (packages/shell/src/stores/navStore.ts)
  - Stops navSync subscription and resets all state fields to initial values
  - Added reset to NavState interface

Step 2 — signOut.ts: Created apps/pwa/src/auth/signOut.ts with performPwaSignOut()
  - Uses createDefaultShellSignOutCleanupDependencies(null) as base
  - Overrides only clearShellBootstrapState to add usePermissionStore.getState().clear()
  - Preserves default auth.signOut() audit event, navSync teardown, shellCoreStore/projectStore clear

Step 3 — root-route.tsx: Replaced both direct useAuthStore.getState().clear() calls
  - onShellAction sign-in-again handler now calls performPwaSignOut()
  - onSignOut handler now calls performPwaSignOut()
  - Navigation to '/' fires after cleanup completes (in .then())
  - useAuthStore import retained for lifecyclePhase/structuredError selectors

Checklist:
- [x] PH6F-2.1 performPwaSignOut() called on all sign-out pathways
- [x] PH6F-2.2 Auth store cleared (signOut() + clear() via defaults)
- [x] PH6F-2.3 Permission store cleared (override in clearShellBootstrapState)
- [x] PH6F-2.4 Nav store reset (stopNavSync + setState via defaults)
- [x] PH6F-2.5 Project store cleared (via defaults)
- [x] PH6F-2.6 Redirect memory cleared (via defaults)
- [x] PH6F-2.7 Navigation to / fires after cleanup
- [x] PH6F-2.8 Build passes — zero TypeScript errors
-->
