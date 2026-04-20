# PH6F.3 – Bootstrap Persona Integration

**Plan ID:** PH6F.3-Cleanup-BootstrapPersonaIntegration
**Parent Plan:** PH6F-DeadWiring-DevAuth-Cleanup-Plan.md
**Blueprint Reference:** §2b (Auth Architecture), §2e (Bootstrap sequence)
**Foundation Plan Reference:** Phase 4 (Mock Bootstrap), Phase 5C (Persona Registry)
**Gaps Addressed:** DA-10, DA-11, DA-12, DA-13
**Execution Order:** 3rd (after PH6F.2 and PH6F.1)
**Estimated Effort:** 1–2 hours
**Risk:** LOW — dev-only code path; no production impact

---

## Problem Statement

Both bootstrap files currently use a hardcoded `MOCK_USER` constant instead of the
`PERSONA_REGISTRY` that was built specifically to provide dev-mode identities.

**apps/pwa/src/bootstrap.ts (DA-10):**
```typescript
const MOCK_USER: ICurrentUser = {
  id: 'user-001',
  displayName: 'Dev Admin',
  email: 'dev.admin@hbintel.local',
  roles: [{ id: 'role-admin', name: 'Administrator', permissions: ['*:*'] }],
};

export function bootstrapMockEnvironment(): void {
  useAuthStore.getState().setUser(MOCK_USER);
  usePermissionStore.getState().setPermissions(['*:*']);
  // ...
}
```

**apps/dev-harness/src/bootstrap.ts (DA-11):**
Identical pattern — same hardcoded `MOCK_USER`, same `['*:*']` permissions.

### Problems Caused

1. **Permission accuracy at startup.** The bootstrap sets `['*:*']` (wildcard) permissions
   while the Administrator persona in the registry has specific permission keys. This means
   feature gate evaluations that rely on named permission strings will behave differently at
   startup versus after selecting the Administrator persona in the DevToolbar — the wildcard is
   handled by `toEffectivePermissionSet()` in `permissionResolution.ts`, but this creates an
   inconsistency that is confusing during development.

2. **Developer experience inconsistency.** If a developer refreshes the page without touching
   the DevToolbar, they get `Dev Admin / *:*`. If they select "Administrator" in the DevToolbar,
   they get the proper registry-defined permissions. These should be identical at startup.

3. **Persisted persona not restored at startup (DA-12, DA-13).** When a developer selects
   "AccountingUser" and refreshes the page, the DevToolbar restores the selected persona ID from
   `localStorage` — but only for the toolbar UI display. The bootstrap always re-runs with
   `MOCK_USER` before React renders, overwriting any intent to start as AccountingUser. After
   PH6F.1 is applied, the `useEffect` mount restore will re-sync to authStore, but there is a
   brief flash where the wrong user is set (bootstrap fires first, then overridden by mount
   effect). The proper fix is to check localStorage at bootstrap time.

---

## Solution: Two-Phase Fix

### Phase A — Use PERSONA_REGISTRY.default() at Bootstrap

Replace the hardcoded `MOCK_USER` with the `PERSONA_REGISTRY.default()` persona (Administrator)
converted to `ICurrentUser`. This ensures bootstrap and DevToolbar use the same source of truth.

### Phase B — Check localStorage for Persisted Persona at Bootstrap

Read the persisted persona ID from `localStorage['hb-auth-dev-toolbar-state']` at bootstrap time.
If a valid persona ID is found, use that persona's data instead of the default. This eliminates
the MOCK_USER → DevToolbar-persona flash on page refresh.

---

## Implementation

### Constants and Key

The DevToolbar persists toolbar state under this key (from `useDevAuthBypass.ts`):
```typescript
const STATE_KEY = 'hb-auth-dev-toolbar-state';
// Stored value shape:
interface IStoredToolbarState {
  selectedPersonaId: string | null;
  auditLoggingEnabled: boolean;
}
```

Bootstrap needs to read this key and look up the persona.

---

### Updated `apps/pwa/src/bootstrap.ts`

**Full replacement:**

```typescript
/**
 * Synchronous mock environment bootstrap — Foundation Plan Phase 4.
 * D-PH6F-03: Updated to use PERSONA_REGISTRY as the source of truth for dev identity.
 * Checks localStorage for a persisted DevToolbar persona selection before falling back
 * to the default Administrator persona.
 */
import type { ICurrentUser, IActiveProject } from '@hbc/models';
import { useAuthStore, usePermissionStore, PERSONA_REGISTRY } from '@hbc/auth';
import { useProjectStore, useNavStore } from '@hbc/shell';

// D-PH6F-03: DevToolbar localStorage state key — must match STATE_KEY in useDevAuthBypass.ts
const DEV_TOOLBAR_STATE_KEY = 'hb-auth-dev-toolbar-state';

interface IStoredToolbarState {
  selectedPersonaId: string | null;
  auditLoggingEnabled: boolean;
}

/**
 * Resolves the starting persona for bootstrap.
 * Returns the persisted persona if one was selected in a previous DevToolbar session,
 * otherwise returns the default Administrator persona.
 */
function resolveBootstrapPersona() {
  if (typeof localStorage === 'undefined') {
    return PERSONA_REGISTRY.default();
  }

  try {
    const raw = localStorage.getItem(DEV_TOOLBAR_STATE_KEY);
    if (raw) {
      const stored = JSON.parse(raw) as IStoredToolbarState;
      if (stored.selectedPersonaId) {
        const persona = PERSONA_REGISTRY.getById(stored.selectedPersonaId);
        if (persona) {
          console.log(
            `[HB-BOOTSTRAP] Restoring persisted persona: ${persona.id} (${persona.name})`,
          );
          return persona;
        }
      }
    }
  } catch {
    // localStorage read failed — fall through to default
  }

  return PERSONA_REGISTRY.default();
}

/**
 * Converts an IPersona to the ICurrentUser shape expected by useAuthStore.setUser().
 * Mirrors sessionDataToCurrentUser() in packages/shell/src/devToolbar/sessionDataToCurrentUser.ts
 * but operates directly from IPersona (no ISessionData intermediate needed at bootstrap time).
 */
function personaToCurrentUser(persona: ReturnType<typeof PERSONA_REGISTRY.default>): ICurrentUser {
  const grantedPermissions = Object.entries(persona.permissions)
    .filter(([key, allowed]) => allowed && !key.startsWith('_'))
    .map(([permissionKey]) => permissionKey);

  return {
    id: persona.id,
    displayName: persona.name,
    email: persona.email,
    roles: persona.roles.map((roleName) => ({
      id: `role-${roleName.toLowerCase().replace(/[\s_]+/g, '-')}`,
      name: roleName,
      permissions: grantedPermissions,
    })),
  };
}

const MOCK_PROJECTS: IActiveProject[] = [
  {
    id: 'PRJ-001',
    name: 'Harbor View Medical Center',
    number: 'HV-2025-001',
    status: 'Active',
    startDate: '2025-01-15',
    endDate: '2027-06-30',
  },
  {
    id: 'PRJ-002',
    name: 'Riverside Office Complex',
    number: 'RC-2025-002',
    status: 'Active',
    startDate: '2025-03-01',
    endDate: '2026-12-15',
  },
  {
    id: 'PRJ-003',
    name: 'Downtown Transit Hub',
    number: 'DT-2025-003',
    status: 'Planning',
    startDate: '2025-06-01',
    endDate: '2028-02-28',
  },
];

const DEFAULT_FEATURE_FLAGS: Record<string, boolean> = {
  'buyout-schedule': true,
  'risk-matrix': true,
  'ai-insights': false,
  'procore-sync': false,
};

export function bootstrapMockEnvironment(): void {
  // D-PH6F-03: Use PERSONA_REGISTRY as source of truth.
  // Restores persisted DevToolbar persona from localStorage if available.
  const persona = resolveBootstrapPersona();
  const currentUser = personaToCurrentUser(persona);
  const grantedPermissions = Object.entries(persona.permissions)
    .filter(([key, allowed]) => allowed && !key.startsWith('_'))
    .map(([permissionKey]) => permissionKey);

  useAuthStore.getState().setUser(currentUser);
  usePermissionStore.getState().setPermissions(grantedPermissions);
  usePermissionStore.getState().setFeatureFlags(DEFAULT_FEATURE_FLAGS);
  useProjectStore.getState().setAvailableProjects(MOCK_PROJECTS);
  useProjectStore.getState().setActiveProject(MOCK_PROJECTS[0]);
  useNavStore.getState().setActiveWorkspace('project-hub');

  console.log(
    `[HB-BOOTSTRAP] Mock environment bootstrapped as: ${persona.name} (${persona.id})`,
  );
}

// Retain exports for backward compatibility with any tests that reference them
export { MOCK_PROJECTS, DEFAULT_FEATURE_FLAGS };
// Note: MOCK_USER export removed — use PERSONA_REGISTRY.default() instead
```

---

### Updated `apps/dev-harness/src/bootstrap.ts`

Apply the same changes as the PWA bootstrap. The only difference is the import of
`useProjectStore` / `useNavStore` — verify the exact import paths match what is already in
the dev-harness bootstrap:

```typescript
/**
 * Synchronous mock environment bootstrap — Foundation Plan Phase 3 (dev-harness).
 * D-PH6F-03: Updated to use PERSONA_REGISTRY as source of truth for dev identity.
 * Mirrors apps/pwa/src/bootstrap.ts — keep these two files in sync.
 */
import type { ICurrentUser, IActiveProject } from '@hbc/models';
import { useAuthStore, usePermissionStore, PERSONA_REGISTRY } from '@hbc/auth';
import { useProjectStore, useNavStore } from '@hbc/shell';

// [Same DEV_TOOLBAR_STATE_KEY, IStoredToolbarState, resolveBootstrapPersona,
//  personaToCurrentUser, MOCK_PROJECTS, DEFAULT_FEATURE_FLAGS as PWA bootstrap]

export function bootstrapMockEnvironment(): void {
  const persona = resolveBootstrapPersona();
  const currentUser = personaToCurrentUser(persona);
  const grantedPermissions = Object.entries(persona.permissions)
    .filter(([key, allowed]) => allowed && !key.startsWith('_'))
    .map(([permissionKey]) => permissionKey);

  useAuthStore.getState().setUser(currentUser);
  usePermissionStore.getState().setPermissions(grantedPermissions);
  usePermissionStore.getState().setFeatureFlags(DEFAULT_FEATURE_FLAGS);
  useProjectStore.getState().setAvailableProjects(MOCK_PROJECTS);
  useProjectStore.getState().setActiveProject(MOCK_PROJECTS[0]);
  useNavStore.getState().setActiveWorkspace('project-hub');
}

export { MOCK_PROJECTS, DEFAULT_FEATURE_FLAGS };
```

---

## Shared Utility Consideration

Both bootstrap files share the same logic for:
- Reading the DevToolbar state from localStorage
- Resolving the persona
- Converting persona to `ICurrentUser`

Rather than duplicating this logic, consider extracting it to a shared utility within the auth
package:

**Option A (Recommended):** Add a `createBootstrapCurrentUser()` helper to
`packages/auth/src/mock/bootstrapHelpers.ts` (new file):

```typescript
// packages/auth/src/mock/bootstrapHelpers.ts
// D-PH6F-03: Bootstrap utility for PERSONA_REGISTRY-aware dev bootstrapping.

import type { ICurrentUser } from '@hbc/models';
import { PERSONA_REGISTRY, type IPersona } from './personaRegistry.js';

const DEV_TOOLBAR_STATE_KEY = 'hb-auth-dev-toolbar-state';

export function resolveBootstrapPersona(): IPersona {
  // [implementation as shown above]
}

export function personaToCurrentUser(persona: IPersona): ICurrentUser {
  // [implementation as shown above]
}

export function resolveBootstrapPermissions(persona: IPersona): string[] {
  return Object.entries(persona.permissions)
    .filter(([key, allowed]) => allowed && !key.startsWith('_'))
    .map(([permissionKey]) => permissionKey);
}
```

Export from `packages/auth/src/index.ts`:
```typescript
export { resolveBootstrapPersona, personaToCurrentUser, resolveBootstrapPermissions } from './mock/bootstrapHelpers.js';
```

Both bootstrap files then become:
```typescript
import {
  useAuthStore,
  usePermissionStore,
  resolveBootstrapPersona,
  personaToCurrentUser,
  resolveBootstrapPermissions,
} from '@hbc/auth';
// ...
export function bootstrapMockEnvironment(): void {
  const persona = resolveBootstrapPersona();
  useAuthStore.getState().setUser(personaToCurrentUser(persona));
  usePermissionStore.getState().setPermissions(resolveBootstrapPermissions(persona));
  // ...
}
```

**Option B:** Duplicate the logic in both bootstrap files (simpler, no new file). Acceptable
given that both files are co-maintained and easy to keep in sync.

---

## Key Verification: PERSONA_REGISTRY Export from @hbc/auth

Before implementing, verify that `PERSONA_REGISTRY` is exported from `packages/auth/src/index.ts`.

If it is currently only exported via `@hbc/auth/dev` (the dev-only subpath), it needs to be
added to the main index as well since bootstrap files import from `@hbc/auth` directly.

Check `packages/auth/src/index.ts` for:
```typescript
export { PERSONA_REGISTRY, type IPersona } from './mock/personaRegistry.js';
```

If this export is missing, add it. The `PERSONA_REGISTRY` is a dev-only concern — it will only
ever be imported by bootstrap files in dev mode. Tree-shaking will eliminate it from production
builds since `bootstrapMockEnvironment()` is only called in mock mode (guarded by
`resolveAuthMode()` in `main.tsx`).

---

## Backward Compatibility

The `MOCK_USER` export from the current bootstrap files is used by some tests. This export
is removed in the updated files. Update any affected tests to use:

```typescript
import { PERSONA_REGISTRY } from '@hbc/auth';
const mockAdmin = PERSONA_REGISTRY.default();
```

Or use `personaToCurrentUser(PERSONA_REGISTRY.default())` for the `ICurrentUser` shape.

---

## Files Modified / Created

| Action | File |
|--------|------|
| Modify | `apps/pwa/src/bootstrap.ts` |
| Modify | `apps/dev-harness/src/bootstrap.ts` |
| Create (optional) | `packages/auth/src/mock/bootstrapHelpers.ts` |
| Modify (if Option A) | `packages/auth/src/index.ts` (add bootstrapHelpers exports) |
| Modify (if needed) | `packages/auth/src/index.ts` (add PERSONA_REGISTRY export) |

---

## Verification Commands

```bash
# 1. TypeScript check
pnpm turbo run type-check

# 2. Build
pnpm turbo run build

# 3. Run dev-harness
pnpm --filter dev-harness dev
# Open http://localhost:3000
# Check browser console — should show:
#   [HB-BOOTSTRAP] Mock environment bootstrapped as: Administrator (persona-admin)

# 4. Test persona persistence
# a. Select "AccountingUser" in DevToolbar
# b. Refresh page
# c. Console should show: [HB-BOOTSTRAP] Restoring persisted persona: persona-accounting (AccountingUser)
# d. Feature gates should reflect AccountingUser permissions immediately (no flash)
# e. useAuthStore.getState().currentUser.displayName === 'AccountingUser'

# 5. Test DevToolbar override still works
# a. Start fresh (clear localStorage)
# b. App starts as Administrator
# c. Switch to EstimatingUser in DevToolbar
# d. Refresh — should start as EstimatingUser (persisted)
# e. Clear localStorage → restart → should start as Administrator (default)
```

---

## Notes on `*:*` Wildcard Removal

The current bootstrap uses `usePermissionStore.getState().setPermissions(['*:*'])`. After this
change, only the explicit permission keys from the persona registry will be set. This means:

1. Any feature gate that relies on the wildcard `*:*` match via `isPermissionGranted()` will now
   correctly evaluate against the explicit key set.
2. If any feature gate was inadvertently passing because of the wildcard during development, it
   will now correctly fail for non-admin personas — this is the desired behavior.
3. The Administrator persona has all 17 keys set to `true`, so all admin-accessible features
   will continue to be accessible when starting as Administrator (the default).

<!-- IMPLEMENTATION PROGRESS & NOTES
Task created: 2026-03-07
PH6F.3 completed: 2026-03-07
Execution: Third in sequence (after PH6F.2 and PH6F.1)

Files created:
  - packages/auth/src/mock/bootstrapHelpers.ts (resolveBootstrapPersona, personaToCurrentUser, resolveBootstrapPermissions)

Files modified:
  - packages/auth/src/index.ts (added PERSONA_REGISTRY + IPersona + bootstrapHelpers exports)
  - packages/auth/src/index.js (stale tsc artifact — appended matching exports for Rollup resolution)
  - apps/pwa/src/bootstrap.ts (replaced MOCK_USER with PERSONA_REGISTRY-based helpers)
  - apps/dev-harness/src/bootstrap.ts (same changes as PWA bootstrap)

Notes:
  - Discovered stale .js artifacts in packages/auth/src/ (tsc output from prior build with incorrect outDir).
    Rollup resolves .js before .ts, so index.js shadowed index.ts. Added exports to both files.
    Broader cleanup of stale .js files deferred (out of scope for PH6F.3).
  - MOCK_USER export removed from both bootstrap files. No external consumers found.
  - MOCK_PROJECTS and DEFAULT_FEATURE_FLAGS exports retained.

Build verification: pnpm turbo run build (8/8 tasks successful)
Next: PH6F.4 or broader stale .js cleanup
-->
