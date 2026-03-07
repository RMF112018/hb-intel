# PH6F.1 – Session-to-AuthStore Sync

**Plan ID:** PH6F.1-Cleanup-SessionToAuthStoreSync
**Parent Plan:** PH6F-DeadWiring-DevAuth-Cleanup-Plan.md
**Blueprint Reference:** §2b (Auth Architecture), §5c (DevToolbar)
**Foundation Plan Reference:** Phase 5C (useDevAuthBypass hook)
**Gaps Addressed:** DA-01, DA-02, DA-03, DA-04, DA-05, DA-06
**Execution Order:** 2nd (after PH6F.2 — requires accurate permissions in ISessionData)
**Estimated Effort:** 2–3 hours
**Risk:** LOW — changes are additive; existing Bootstrap path is not touched

---

## Problem Statement

`useDevAuthBypass.selectPersona()` creates a valid `ISessionData` via `DevAuthBypassAdapter`
and stores it to React component state and `sessionStorage`. However, it **never calls**
`useAuthStore.getState().setUser()` or `usePermissionStore.getState().setPermissions()`.

As a result, switching personas in the DevToolbar has zero effect on:
- Feature gates (`usePermissionStore.hasFeatureAccess()`)
- Permission checks (`usePermissionStore.hasPermission()`)
- Role-scoped navigation guards
- Any component that reads from `useAuthStore` or `usePermissionStore`

The app remains permanently locked to the hardcoded `MOCK_USER` (Dev Admin / `*:*`) set at
bootstrap. The DevToolbar is functionally a UI toy with no connection to the auth system.

The same problem exists for:
- **Mount restore** — when the page refreshes, `restoreSession()` recovers a session from
  `sessionStorage` and stores it locally, but never syncs to authStore
- **`expireSession()`** — clears sessionStorage but never calls `useAuthStore.signOut()`
- **`refreshSession()`** — restores a session but never calls `setUser()` again

---

## DA-06: Missing Conversion Utility

No utility exists to convert `ISessionData` (the DevAuthBypassAdapter output type) to
`ICurrentUser` (the type accepted by `useAuthStore.setUser()`).

### Type Mismatch Analysis

`ISessionData` (from `packages/auth/src/adapters/DevAuthBypassAdapter.ts`):
```typescript
interface ISessionData {
  sessionId: string;
  userId: string;
  displayName: string;
  email: string;
  roles: string[];                         // flat string array
  permissions: Record<string, boolean>;    // keyed map
  expiresAt: number;
  acquiredAt: number;
}
```

`ICurrentUser` (from `@hbc/models`):
```typescript
interface ICurrentUser {
  id: string;
  displayName: string;
  email: string;
  roles: Array<{
    id: string;
    name: string;
    permissions: string[];                 // flat string array
  }>;
}
```

`usePermissionStore.setPermissions()` expects:
```typescript
setPermissions(permissions: string[]): void
// e.g. ['feature:accounting-invoice', 'feature:view-dashboard', 'action:read']
```

---

## Solution

### Step 1 — Add `sessionDataToCurrentUser` Utility

**File:** `packages/shell/src/devToolbar/sessionDataToCurrentUser.ts` (new file)

```typescript
// packages/shell/src/devToolbar/sessionDataToCurrentUser.ts
// D-PH6F-01: Converts DevAuthBypassAdapter ISessionData to ICurrentUser for authStore sync.

import type { ICurrentUser } from '@hbc/models';
import type { ISessionData } from '@hbc/auth/dev';

/**
 * sessionDataToCurrentUser
 * ========================
 * Converts a DevAuthBypassAdapter ISessionData (produced by normalizeSession()) to the
 * ICurrentUser shape expected by useAuthStore.setUser().
 *
 * All roles are collapsed into a single role-per-name entry, each carrying all granted
 * permissions (the truthy entries from ISessionData.permissions).
 *
 * This conversion is intentionally lossy regarding sessionId, expiresAt, and acquiredAt —
 * these are DevToolbar-only concerns that do not belong in the app auth store.
 */
export function sessionDataToCurrentUser(session: ISessionData): ICurrentUser {
  // Extract only truthy permissions as a flat string array
  const grantedPermissions = Object.entries(session.permissions)
    .filter(([, allowed]) => allowed)
    .map(([permissionKey]) => permissionKey);

  return {
    id: session.userId,
    displayName: session.displayName,
    email: session.email,
    roles: session.roles.map((roleName) => ({
      id: `role-${roleName.toLowerCase().replace(/[\s_]+/g, '-')}`,
      name: roleName,
      permissions: grantedPermissions,
    })),
  };
}

/**
 * extractGrantedPermissions
 * =========================
 * Extracts only the truthy entries from an ISessionData.permissions Record
 * as a flat string array. Used directly by usePermissionStore.setPermissions().
 */
export function extractGrantedPermissions(
  permissions: Record<string, boolean>,
): string[] {
  return Object.entries(permissions)
    .filter(([, allowed]) => allowed)
    .map(([permissionKey]) => permissionKey);
}
```

### Step 2 — Modify `useDevAuthBypass.ts`

**File:** `packages/shell/src/devToolbar/useDevAuthBypass.ts`

#### 2a — Add imports

```typescript
// Add to existing imports block:
import { useAuthStore } from '@hbc/auth';
import { usePermissionStore } from '@hbc/auth';
import { sessionDataToCurrentUser, extractGrantedPermissions } from './sessionDataToCurrentUser.js';
```

Note: `@hbc/auth` exports from `packages/auth/src/index.ts`. Verify that `useAuthStore` and
`usePermissionStore` are exported from the auth package index. If they are not exported via the
`/dev` subpath, import from the root `@hbc/auth` barrel. Check
`packages/auth/src/index.ts` for current exports.

#### 2b — Fix `selectPersona()`

**Current implementation (lines 91–115):**
```typescript
const selectPersona = async (persona: IPersona): Promise<void> => {
  if (!adapter) {
    return;
  }

  setSelectedPersona(persona);

  try {
    const identity = await adapter.acquireIdentity();
    const session = await adapter.normalizeSession({
      ...identity,
      userId: persona.id,
      displayName: persona.name,
      email: persona.email,
      roles: persona.roles,
    });
    setCurrentSession(session);         // ← local state only

    if (auditLoggingEnabled) {
      console.log(`[HB-AUTH-DEV] Persona selected: ${persona.id}`);
    }
  } catch (error) {
    console.error('[HB-AUTH-DEV] Failed to select persona:', error);
  }
};
```

**Replacement implementation:**
```typescript
const selectPersona = async (persona: IPersona): Promise<void> => {
  if (!adapter) {
    return;
  }

  setSelectedPersona(persona);

  try {
    const identity = await adapter.acquireIdentity();
    const rawSession = await adapter.normalizeSession({
      ...identity,
      userId: persona.id,
      displayName: persona.name,
      email: persona.email,
      roles: persona.roles,
    });

    // D-PH6F-01: Enrich session with accurate persona permissions from the registry.
    // normalizeSession() regenerates permissions from roles only (DA-07 gap).
    // Override with the authoritative persona.permissions to get all 17 keys correctly.
    const enrichedSession: ISessionData = {
      ...rawSession,
      permissions: persona.permissions,
    };

    setCurrentSession(enrichedSession);

    // D-PH6F-01: Sync persona change to Zustand auth stores so all app consumers
    // (feature gates, nav guards, permission hooks) see the updated identity.
    const currentUser = sessionDataToCurrentUser(enrichedSession);
    const grantedPermissions = extractGrantedPermissions(enrichedSession.permissions);

    useAuthStore.getState().setUser(currentUser);
    usePermissionStore.getState().setPermissions(grantedPermissions);

    if (auditLoggingEnabled) {
      console.log(
        `[HB-AUTH-DEV] Persona selected: ${persona.id} | permissions: ${grantedPermissions.length} granted`,
      );
    }
  } catch (error) {
    console.error('[HB-AUTH-DEV] Failed to select persona:', error);
  }
};
```

#### 2c — Fix mount restore (useEffect)

**Current implementation (lines 74–79):**
```typescript
void newAdapter.restoreSession().then((session) => {
  if (session) {
    setCurrentSession(session);
  }
});
```

**Replacement implementation:**
```typescript
void newAdapter.restoreSession().then((session) => {
  if (session) {
    setCurrentSession(session);

    // D-PH6F-01: Re-hydrate authStore from the restored DevToolbar session on mount.
    // This ensures a page refresh does not revert to MOCK_USER while the DevToolbar
    // continues to show the previously selected persona.
    const currentUser = sessionDataToCurrentUser(session);
    const grantedPermissions = extractGrantedPermissions(session.permissions);
    useAuthStore.getState().setUser(currentUser);
    usePermissionStore.getState().setPermissions(grantedPermissions);

    if (import.meta.env.DEV) {
      console.log(`[HB-AUTH-DEV] Session restored from storage — synced to authStore: ${session.userId}`);
    }
  }
});
```

#### 2d — Fix `expireSession()`

**Current implementation (lines 126–133):**
```typescript
const expireSession = (): void => {
  sessionStorage.removeItem('hb-auth-dev-session');
  setCurrentSession(null);

  if (auditLoggingEnabled) {
    console.log('[HB-AUTH-DEV] Session expired from toolbar action');
  }
};
```

**Replacement implementation:**
```typescript
const expireSession = (): void => {
  sessionStorage.removeItem('hb-auth-dev-session');
  setCurrentSession(null);
  setSelectedPersona(null);

  // D-PH6F-01: Sync session expiry to authStore so app reflects signed-out state.
  useAuthStore.getState().signOut();
  usePermissionStore.getState().clear();

  if (auditLoggingEnabled) {
    console.log('[HB-AUTH-DEV] Session expired from toolbar action — authStore cleared');
  }
};
```

#### 2e — Fix `refreshSession()`

**Current implementation (lines 135–146):**
```typescript
const refreshSession = async (): Promise<void> => {
  if (!adapter) {
    return;
  }

  const session = await adapter.restoreSession();
  setCurrentSession(session);

  if (auditLoggingEnabled) {
    console.log('[HB-AUTH-DEV] Session refresh triggered from toolbar action');
  }
};
```

**Replacement implementation:**
```typescript
const refreshSession = async (): Promise<void> => {
  if (!adapter) {
    return;
  }

  const session = await adapter.restoreSession();
  setCurrentSession(session);

  if (session) {
    // D-PH6F-01: Re-sync authStore on session refresh so the app's auth state
    // reflects the restored session.
    const currentUser = sessionDataToCurrentUser(session);
    const grantedPermissions = extractGrantedPermissions(session.permissions);
    useAuthStore.getState().setUser(currentUser);
    usePermissionStore.getState().setPermissions(grantedPermissions);

    if (auditLoggingEnabled) {
      console.log(
        `[HB-AUTH-DEV] Session refreshed and synced to authStore: ${session.userId}`,
      );
    }
  } else {
    // Session could not be restored (expired / missing) — clear auth state
    useAuthStore.getState().signOut();
    usePermissionStore.getState().clear();

    if (auditLoggingEnabled) {
      console.log('[HB-AUTH-DEV] Session refresh failed — no valid session found; authStore cleared');
    }
  }
};
```

---

## Export the New Utility

Update `packages/shell/src/devToolbar/index.ts` to export the new utility:

```typescript
// packages/shell/src/devToolbar/index.ts — add export:
export { sessionDataToCurrentUser, extractGrantedPermissions } from './sessionDataToCurrentUser.js';
```

---

## Import Verification

Before implementing, verify that `useAuthStore` and `usePermissionStore` are accessible from
the shell package:

1. Check `packages/auth/src/index.ts` — confirm both stores are exported
2. Check `packages/shell/package.json` — confirm `@hbc/auth` is in `dependencies`
3. If importing from `@hbc/auth` in the shell package (during Vite dev mode), the Vite alias
   `@hbc/auth` → `../../packages/auth/src` must be present in both `apps/pwa/vite.config.ts`
   and `apps/dev-harness/vite.config.ts`

All three aliases are already present in both vite configs based on the current codebase audit.

---

## Files Modified / Created

| Action | File |
|--------|------|
| Create | `packages/shell/src/devToolbar/sessionDataToCurrentUser.ts` |
| Modify | `packages/shell/src/devToolbar/useDevAuthBypass.ts` |
| Modify | `packages/shell/src/devToolbar/index.ts` (add export) |

---

## Verification Commands

```bash
# 1. TypeScript compile check for shell package
cd packages/shell && pnpm tsc --noEmit

# 2. TypeScript compile check for auth package (ensure types still align)
cd packages/auth && pnpm tsc --noEmit

# 3. Full build
pnpm turbo run build

# 4. Dev server — manual verification
pnpm --filter dev-harness dev
# Open http://localhost:3000
# Open DevToolbar (bottom of screen)
# Switch to "AccountingUser" persona
# Verify: console shows "[HB-AUTH-DEV] Persona selected: persona-accounting"
# Verify: feature gates for admin features are now denied
# Verify: useAuthStore.getState().currentUser.displayName === 'AccountingUser'
# Verify: usePermissionStore.getState().permissions does NOT include 'feature:admin-panel' (truthy)
# Verify: usePermissionStore.getState().permissions includes 'feature:accounting-invoice'

# 5. Test page refresh with persona selected
# Select "EstimatingUser" → refresh page → toolbar should still show EstimatingUser selected
# AND authStore should now reflect EstimatingUser (not fall back to Dev Admin)
# Verify: useAuthStore.getState().currentUser.displayName === 'EstimatingUser'

# 6. Test session expiry
# Click "Expire Session" in DevToolbar → verify console shows session cleared
# Verify: useAuthStore.getState().lifecyclePhase === 'signed-out'
# Verify: feature gates deny access to all protected content
```

---

## Dependency

This task depends on **PH6F.2** (PersonaRegistryAlignment) being complete. The
`enrichedSession.permissions` override (`session.permissions = persona.permissions`) used in
Step 2b assumes that the permissions in the persona registry are accurate and complete (all 17
keys). If PH6F.2 is not done, the override still works correctly since `persona.permissions`
comes directly from `PERSONA_REGISTRY` — it is `mapRolesToPermissions()` in the adapter that
has the gap, not the registry itself.

However, it is still recommended to do PH6F.2 first so that the adapter's `normalizeSession()`
produces an accurate base session even without the override (defense in depth).

<!-- IMPLEMENTATION PROGRESS & NOTES
Task created: 2026-03-07
Status: Pending implementation
Depends on: PH6F.2 (recommended first)
Next: Begin with sessionDataToCurrentUser.ts creation, then modify useDevAuthBypass.ts
-->
