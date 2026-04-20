# PH6F.5 – Integration Tests: Dev Auth Role Switcher

**Plan ID:** PH6F.5-Cleanup-IntegrationTests
**Parent Plan:** PH6F-DeadWiring-DevAuth-Cleanup-Plan.md
**Blueprint Reference:** §8 (Testing Strategy), §5c (DevToolbar)
**Foundation Plan Reference:** Phase 9 (Verification), Phase 5C (Dev Auth)
**Gaps Addressed:** DA-15
**Execution Order:** 5th (final — after all PH6F.1–4 are complete)
**Estimated Effort:** 3–4 hours
**Risk:** LOW — test-only additions

---

## Overview

This task defines the full integration test suite for the dev auth role switcher feature.
Tests are written with Vitest and the React Testing Library (RTL) pattern used elsewhere in
the monorepo.

Tests are structured in three categories:

1. **Unit tests** — Pure function behavior (`sessionDataToCurrentUser`, `extractGrantedPermissions`,
   `mapRolesToPermissions`, `personaToCurrentUser`)
2. **Store integration tests** — Verify that `useDevAuthBypass` actions correctly update
   `useAuthStore` and `usePermissionStore` (using Zustand's direct `getState()`)
3. **End-to-end persona round-trips** — All 11 personas verified through the full cycle:
   select → authStore updated → permissions correct

---

## File Locations

```
packages/shell/src/devToolbar/__tests__/
  sessionDataToCurrentUser.test.ts     ← Unit tests for conversion utility
  useDevAuthBypass.integration.test.ts ← Store integration tests

packages/auth/src/adapters/__tests__/
  DevAuthBypassAdapter.test.ts         ← Existing (add mapRolesToPermissions tests)

packages/auth/src/mock/__tests__/
  bootstrapHelpers.test.ts             ← Unit tests for bootstrap helpers (if Option A chosen in PH6F.3)
```

---

## 1. Unit Tests: `sessionDataToCurrentUser.ts`

**File:** `packages/shell/src/devToolbar/__tests__/sessionDataToCurrentUser.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { sessionDataToCurrentUser, extractGrantedPermissions } from '../sessionDataToCurrentUser.js';
import type { ISessionData } from '@hbc/auth/dev';

const makeSession = (overrides: Partial<ISessionData> = {}): ISessionData => ({
  sessionId: 'test-session-id',
  userId: 'persona-accounting',
  displayName: 'AccountingUser',
  email: 'accounting@hb-intel.local',
  roles: ['AccountingUser'],
  permissions: {
    'feature:admin-panel': false,
    'feature:accounting-invoice': true,
    'feature:accounting-reports': true,
    'feature:view-dashboard': true,
    'feature:view-profile': true,
    'action:read': true,
    'action:write': true,
    'action:delete': false,
    'action:approve': false,
  },
  expiresAt: Date.now() + 8 * 60 * 60 * 1000,
  acquiredAt: Date.now(),
  ...overrides,
});

describe('sessionDataToCurrentUser', () => {
  it('maps userId to ICurrentUser.id', () => {
    const user = sessionDataToCurrentUser(makeSession());
    expect(user.id).toBe('persona-accounting');
  });

  it('maps displayName correctly', () => {
    const user = sessionDataToCurrentUser(makeSession());
    expect(user.displayName).toBe('AccountingUser');
  });

  it('maps email correctly', () => {
    const user = sessionDataToCurrentUser(makeSession());
    expect(user.email).toBe('accounting@hb-intel.local');
  });

  it('creates one role entry per role in session.roles', () => {
    const user = sessionDataToCurrentUser(makeSession({ roles: ['AccountingUser', 'Manager'] }));
    expect(user.roles).toHaveLength(2);
    expect(user.roles[0].name).toBe('AccountingUser');
    expect(user.roles[1].name).toBe('Manager');
  });

  it('each role includes only truthy permissions as flat strings', () => {
    const user = sessionDataToCurrentUser(makeSession());
    const permissions = user.roles[0].permissions;
    expect(permissions).toContain('feature:accounting-invoice');
    expect(permissions).toContain('feature:accounting-reports');
    expect(permissions).toContain('action:read');
    expect(permissions).toContain('action:write');
    expect(permissions).not.toContain('feature:admin-panel');
    expect(permissions).not.toContain('action:delete');
    expect(permissions).not.toContain('action:approve');
  });

  it('generates role id with kebab-case slug from role name', () => {
    const user = sessionDataToCurrentUser(makeSession({ roles: ['Project User'] }));
    expect(user.roles[0].id).toBe('role-project-user');
  });

  it('handles session with no truthy permissions', () => {
    const noPermissions = Object.fromEntries(
      Object.keys(makeSession().permissions).map((k) => [k, false]),
    );
    const user = sessionDataToCurrentUser(makeSession({ permissions: noPermissions }));
    expect(user.roles[0].permissions).toHaveLength(0);
  });
});

describe('extractGrantedPermissions', () => {
  it('returns only truthy permission keys', () => {
    const granted = extractGrantedPermissions({
      'feature:admin-panel': false,
      'feature:accounting-invoice': true,
      'action:read': true,
      'action:delete': false,
    });
    expect(granted).toEqual(['feature:accounting-invoice', 'action:read']);
  });

  it('filters out keys with _ prefix', () => {
    const granted = extractGrantedPermissions({
      'feature:view-dashboard': true,
      '_session:expired': true,  // should be filtered
      '_system:degraded': true,  // should be filtered
    });
    expect(granted).toEqual(['feature:view-dashboard']);
  });

  it('returns empty array when all permissions are false', () => {
    const granted = extractGrantedPermissions({
      'feature:admin-panel': false,
      'feature:view-dashboard': false,
    });
    expect(granted).toHaveLength(0);
  });
});
```

---

## 2. Unit Tests: `DevAuthBypassAdapter.mapRolesToPermissions`

**File:** `packages/auth/src/adapters/__tests__/DevAuthBypassAdapter.test.ts`
(Add to existing test file, or create if it doesn't exist)

```typescript
import { describe, it, expect, vi, beforeAll } from 'vitest';

// Mock import.meta.env.DEV before importing adapter
beforeAll(() => {
  vi.stubEnv('DEV', 'true');
});

import { DevAuthBypassAdapter } from '../DevAuthBypassAdapter.js';

// Helper to access private method for testing
function testMapRolesToPermissions(roles: string[]): Record<string, boolean> {
  const adapter = new DevAuthBypassAdapter(0);
  // Access private method via type cast for testing
  return (adapter as unknown as {
    mapRolesToPermissions(roles: string[]): Record<string, boolean>;
  }).mapRolesToPermissions(roles);
}

describe('DevAuthBypassAdapter.mapRolesToPermissions', () => {
  it('includes all 17 base permission keys', () => {
    const permissions = testMapRolesToPermissions(['Administrator']);
    const expectedKeys = [
      'feature:admin-panel', 'feature:user-management', 'feature:system-settings',
      'feature:override-requests', 'feature:audit-logs',
      'feature:accounting-invoice', 'feature:accounting-reports',
      'feature:estimating-projects', 'feature:estimating-quotes',
      'feature:project-hub', 'feature:project-tracking',
      'feature:view-dashboard', 'feature:view-profile',
      'action:read', 'action:write', 'action:delete', 'action:approve',
    ];
    for (const key of expectedKeys) {
      expect(permissions).toHaveProperty(key);
    }
    expect(Object.keys(permissions)).toHaveLength(17);
  });

  it('grants all permissions for Administrator role', () => {
    const permissions = testMapRolesToPermissions(['Administrator']);
    expect(permissions['feature:admin-panel']).toBe(true);
    expect(permissions['feature:user-management']).toBe(true);
    expect(permissions['action:delete']).toBe(true);
    expect(permissions['action:approve']).toBe(true);
  });

  it('grants accounting features for AccountingUser role', () => {
    const permissions = testMapRolesToPermissions(['AccountingUser']);
    expect(permissions['feature:accounting-invoice']).toBe(true);
    expect(permissions['feature:accounting-reports']).toBe(true);
    expect(permissions['feature:admin-panel']).toBe(false);
    expect(permissions['action:delete']).toBe(false);
  });

  it('grants action:approve for EstimatingUser role', () => {
    const permissions = testMapRolesToPermissions(['EstimatingUser']);
    expect(permissions['action:approve']).toBe(true);
    expect(permissions['feature:estimating-projects']).toBe(true);
    expect(permissions['feature:estimating-quotes']).toBe(true);
  });

  it('grants action:read universally', () => {
    const permissions = testMapRolesToPermissions(['Member']);
    expect(permissions['action:read']).toBe(true);
  });

  it('grants audit-logs for Executive role', () => {
    const permissions = testMapRolesToPermissions(['Executive']);
    expect(permissions['feature:audit-logs']).toBe(true);
    expect(permissions['feature:accounting-reports']).toBe(true);
  });
});

describe('DevAuthBypassAdapter.normalizeSessionWithPermissions', () => {
  it('uses provided permissions map directly without role-based generation', async () => {
    const adapter = new DevAuthBypassAdapter(0);
    const mockIdentity = {
      userId: 'test-user',
      displayName: 'Test User',
      email: 'test@example.com',
      roles: ['AccountingUser'],
      metadata: {
        loginTimestamp: Date.now(),
        deviceFingerprint: 'test-fp',
        sessionId: 'test-session',
      },
      claims: { scopes: [] },
    };
    const explicitPermissions = {
      'feature:accounting-invoice': true,
      'custom:special-flag': true,
    };

    const session = await adapter.normalizeSessionWithPermissions(
      mockIdentity,
      explicitPermissions,
    );

    expect(session.permissions).toEqual(explicitPermissions);
    expect(session.permissions).not.toHaveProperty('feature:view-dashboard'); // not regenerated
  });
});
```

---

## 3. Store Integration Tests: `useDevAuthBypass`

**File:** `packages/shell/src/devToolbar/__tests__/useDevAuthBypass.integration.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDevAuthBypass } from '../useDevAuthBypass.js';
import { useAuthStore } from '@hbc/auth';
import { usePermissionStore } from '@hbc/auth';
import { PERSONA_REGISTRY } from '@hbc/auth';

// Mock import.meta.env.DEV
vi.stubGlobal('import.meta', { env: { DEV: true } });

// Reset stores before each test
beforeEach(() => {
  useAuthStore.getState().clear();
  usePermissionStore.getState().clear();
  sessionStorage.clear();
  localStorage.clear();
});

describe('useDevAuthBypass — authStore integration', () => {
  it('selectPersona() updates useAuthStore.currentUser', async () => {
    const { result } = renderHook(() => useDevAuthBypass());
    const accountingPersona = PERSONA_REGISTRY.getById('persona-accounting')!;

    await act(async () => {
      await result.current.selectPersona(accountingPersona);
    });

    const authState = useAuthStore.getState();
    expect(authState.currentUser).not.toBeNull();
    expect(authState.currentUser?.displayName).toBe('AccountingUser');
    expect(authState.currentUser?.id).toBe('persona-accounting');
  });

  it('selectPersona() sets lifecyclePhase to authenticated', async () => {
    const { result } = renderHook(() => useDevAuthBypass());
    const persona = PERSONA_REGISTRY.default();

    await act(async () => {
      await result.current.selectPersona(persona);
    });

    expect(useAuthStore.getState().lifecyclePhase).toBe('authenticated');
  });

  it('selectPersona() sets shellBootstrap.shellReadyToRender to true', async () => {
    const { result } = renderHook(() => useDevAuthBypass());

    await act(async () => {
      await result.current.selectPersona(PERSONA_REGISTRY.default());
    });

    expect(useAuthStore.getState().shellBootstrap.shellReadyToRender).toBe(true);
  });

  it('selectPersona() updates usePermissionStore.permissions correctly', async () => {
    const { result } = renderHook(() => useDevAuthBypass());
    const projectPersona = PERSONA_REGISTRY.getById('persona-project')!;

    await act(async () => {
      await result.current.selectPersona(projectPersona);
    });

    const permissions = usePermissionStore.getState().permissions;
    expect(permissions).toContain('feature:project-hub');
    expect(permissions).toContain('feature:project-tracking');
    expect(permissions).toContain('action:read');
    expect(permissions).not.toContain('feature:admin-panel');
    expect(permissions).not.toContain('feature:accounting-invoice');
  });

  it('expireSession() transitions lifecyclePhase to signed-out', async () => {
    const { result } = renderHook(() => useDevAuthBypass());

    // First select a persona
    await act(async () => {
      await result.current.selectPersona(PERSONA_REGISTRY.default());
    });
    expect(useAuthStore.getState().lifecyclePhase).toBe('authenticated');

    // Then expire
    act(() => {
      result.current.expireSession();
    });

    expect(useAuthStore.getState().lifecyclePhase).toBe('signed-out');
  });

  it('expireSession() clears usePermissionStore.permissions', () => {
    const { result } = renderHook(() => useDevAuthBypass());

    act(() => {
      result.current.expireSession();
    });

    expect(usePermissionStore.getState().permissions).toHaveLength(0);
  });

  it('refreshSession() re-syncs authStore when session exists in sessionStorage', async () => {
    const { result } = renderHook(() => useDevAuthBypass());

    // First select a persona (stores session to sessionStorage)
    await act(async () => {
      await result.current.selectPersona(PERSONA_REGISTRY.getById('persona-executive')!);
    });

    // Expire (clears authStore)
    act(() => { result.current.expireSession(); });
    expect(useAuthStore.getState().lifecyclePhase).toBe('signed-out');

    // Note: expireSession removes from sessionStorage, so refresh won't find it.
    // To test refresh, manually inject a session into sessionStorage:
    const storedSession = {
      version: 1,
      session: {
        sessionId: 'test-restore-id',
        userId: 'persona-executive',
        displayName: 'Executive',
        email: 'executive@hb-intel.local',
        roles: ['Executive', 'Manager'],
        permissions: PERSONA_REGISTRY.getById('persona-executive')!.permissions,
        expiresAt: Date.now() + 8 * 60 * 60 * 1000,
        acquiredAt: Date.now(),
      },
    };
    sessionStorage.setItem('hb-auth-dev-session', JSON.stringify(storedSession));

    await act(async () => {
      await result.current.refreshSession();
    });

    expect(useAuthStore.getState().lifecyclePhase).toBe('authenticated');
    expect(useAuthStore.getState().currentUser?.displayName).toBe('Executive');
  });
});

describe('useDevAuthBypass — all 11 personas round-trip', () => {
  const allPersonas = PERSONA_REGISTRY.all();

  for (const persona of allPersonas) {
    it(`Persona "${persona.name}" (${persona.id}) — authStore gets correct user and permissions`, async () => {
      const { result } = renderHook(() => useDevAuthBypass());

      // ExpiredSession persona is a special case — skip authStore check (it triggers reauth)
      if (persona.id === 'persona-expired-session') {
        await act(async () => {
          await result.current.selectPersona(persona);
        });
        expect(useAuthStore.getState().lifecyclePhase).toBe('reauth-required');
        return;
      }

      await act(async () => {
        await result.current.selectPersona(persona);
      });

      const authState = useAuthStore.getState();
      expect(authState.lifecyclePhase).toBe('authenticated');
      expect(authState.currentUser?.id).toBe(persona.id);
      expect(authState.currentUser?.displayName).toBe(persona.name);
      expect(authState.currentUser?.email).toBe(persona.email);

      // Verify permissions are persona-accurate (spot check a few keys)
      const permissions = usePermissionStore.getState().permissions;
      const expectedGranted = Object.entries(persona.permissions)
        .filter(([key, val]) => val && !key.startsWith('_'))
        .map(([k]) => k);

      for (const key of expectedGranted) {
        expect(permissions).toContain(key);
      }

      const expectedDenied = Object.entries(persona.permissions)
        .filter(([key, val]) => !val && !key.startsWith('_'))
        .map(([k]) => k);

      for (const key of expectedDenied) {
        expect(permissions).not.toContain(key);
      }
    });
  }
});

describe('useDevAuthBypass — persona switching sequence', () => {
  it('switching from Administrator to Member reduces permissions', async () => {
    const { result } = renderHook(() => useDevAuthBypass());

    // Start as Admin
    await act(async () => {
      await result.current.selectPersona(PERSONA_REGISTRY.getById('persona-admin')!);
    });
    expect(usePermissionStore.getState().permissions).toContain('feature:admin-panel');

    // Switch to Member
    await act(async () => {
      await result.current.selectPersona(PERSONA_REGISTRY.getById('persona-member')!);
    });

    const permissions = usePermissionStore.getState().permissions;
    expect(permissions).not.toContain('feature:admin-panel');
    expect(permissions).not.toContain('feature:accounting-invoice');
    expect(permissions).toContain('feature:view-dashboard');
    expect(permissions).toContain('action:read');
  });

  it('switching personas updates currentUser identity correctly', async () => {
    const { result } = renderHook(() => useDevAuthBypass());

    await act(async () => {
      await result.current.selectPersona(PERSONA_REGISTRY.getById('persona-estimating')!);
    });
    expect(useAuthStore.getState().currentUser?.displayName).toBe('EstimatingUser');

    await act(async () => {
      await result.current.selectPersona(PERSONA_REGISTRY.getById('persona-project')!);
    });
    expect(useAuthStore.getState().currentUser?.displayName).toBe('ProjectUser');
  });
});
```

---

## 4. Unit Tests: Bootstrap Helpers

**File:** `packages/auth/src/mock/__tests__/bootstrapHelpers.test.ts`
(Only needed if Option A from PH6F.3 is implemented)

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { resolveBootstrapPersona, personaToCurrentUser, resolveBootstrapPermissions } from '../bootstrapHelpers.js';
import { PERSONA_REGISTRY } from '../personaRegistry.js';

const DEV_TOOLBAR_STATE_KEY = 'hb-auth-dev-toolbar-state';

beforeEach(() => {
  localStorage.clear();
});

describe('resolveBootstrapPersona', () => {
  it('returns default Administrator persona when localStorage is empty', () => {
    const persona = resolveBootstrapPersona();
    expect(persona.id).toBe('persona-admin');
    expect(persona.name).toBe('Administrator');
  });

  it('returns persisted persona from localStorage when valid', () => {
    localStorage.setItem(
      DEV_TOOLBAR_STATE_KEY,
      JSON.stringify({ selectedPersonaId: 'persona-accounting', auditLoggingEnabled: true }),
    );
    const persona = resolveBootstrapPersona();
    expect(persona.id).toBe('persona-accounting');
    expect(persona.name).toBe('AccountingUser');
  });

  it('falls back to default when localStorage persona id is invalid', () => {
    localStorage.setItem(
      DEV_TOOLBAR_STATE_KEY,
      JSON.stringify({ selectedPersonaId: 'persona-nonexistent', auditLoggingEnabled: true }),
    );
    const persona = resolveBootstrapPersona();
    expect(persona.id).toBe('persona-admin');
  });

  it('falls back to default when localStorage contains invalid JSON', () => {
    localStorage.setItem(DEV_TOOLBAR_STATE_KEY, 'not-valid-json');
    const persona = resolveBootstrapPersona();
    expect(persona.id).toBe('persona-admin');
  });
});

describe('personaToCurrentUser', () => {
  it('converts Administrator persona to correct ICurrentUser shape', () => {
    const admin = PERSONA_REGISTRY.default();
    const user = personaToCurrentUser(admin);

    expect(user.id).toBe('persona-admin');
    expect(user.displayName).toBe('Administrator');
    expect(user.email).toBe('admin@hb-intel.local');
    expect(user.roles.length).toBeGreaterThan(0);
  });

  it('does not include _-prefixed keys in role permissions', () => {
    const degraded = PERSONA_REGISTRY.getById('persona-degraded-mode')!;
    const user = personaToCurrentUser(degraded);
    const allPermissions = user.roles.flatMap((r) => r.permissions);
    expect(allPermissions.some((p) => p.startsWith('_'))).toBe(false);
  });
});

describe('resolveBootstrapPermissions', () => {
  it('returns flat array of truthy permission strings', () => {
    const accounting = PERSONA_REGISTRY.getById('persona-accounting')!;
    const permissions = resolveBootstrapPermissions(accounting);

    expect(permissions).toContain('feature:accounting-invoice');
    expect(permissions).toContain('action:read');
    expect(permissions).not.toContain('feature:admin-panel');
    expect(permissions).not.toContain('action:delete');
  });

  it('excludes internal _ flags', () => {
    const pending = PERSONA_REGISTRY.getById('persona-pending-override')!;
    const permissions = resolveBootstrapPermissions(pending);
    expect(permissions.some((p) => p.startsWith('_'))).toBe(false);
  });
});
```

---

## Running the Tests

```bash
# Run all dev auth tests
pnpm --filter @hbc/shell test -- --testPathPattern="devToolbar"
pnpm --filter @hbc/auth test -- --testPathPattern="DevAuthBypassAdapter|bootstrapHelpers"

# Run with coverage
pnpm --filter @hbc/shell test -- --coverage --testPathPattern="devToolbar"

# Run full test suite
pnpm turbo run test
```

---

## Coverage Targets

| File | Target Coverage |
|------|-----------------|
| `sessionDataToCurrentUser.ts` | 100% |
| `useDevAuthBypass.ts` (integration) | ≥ 85% |
| `DevAuthBypassAdapter.ts` (unit) | ≥ 80% |
| `bootstrapHelpers.ts` (if created) | 100% |

---

## Notes on Mocking `import.meta.env.DEV`

The `DevAuthBypassAdapter` constructor throws if `import.meta.env.DEV` is `false`:
```typescript
constructor(delayMs: number = 500) {
  if (!import.meta.env.DEV) {
    throw new Error('DevAuthBypassAdapter is only available in development mode');
  }
```

When testing, use Vitest's `vi.stubGlobal` or a Vite test config that sets `define.DEV = true`.
In `vitest.config.ts` for the shell and auth packages, add:
```typescript
define: {
  'import.meta.env.DEV': 'true',
}
```

Or use a test setup file that calls `vi.stubGlobal('import', { meta: { env: { DEV: true } } })`.

<!-- IMPLEMENTATION PROGRESS & NOTES
Task created: 2026-03-07
Phase PH6F.5 completed: 2026-03-07

Files created:
- packages/shell/src/devToolbar/__tests__/sessionDataToCurrentUser.test.ts (11 unit tests)
- packages/shell/src/devToolbar/__tests__/useDevAuthBypass.integration.test.ts (21 integration tests)
- packages/auth/src/mock/__tests__/bootstrapHelpers.test.ts (8 unit tests)

Files modified:
- packages/auth/src/adapters/__tests__/DevAuthBypassAdapter.test.ts (+8 tests: mapRolesToPermissions, normalizeSessionWithPermissions)
- packages/shell/src/devToolbar/useDevAuthBypass.test.tsx (fix: added normalizeSessionWithPermissions mock + permissions to mock persona)

Corrections from plan:
- sessionDataToCurrentUser.test.ts: Role ID prefix corrected to `dev-role-` (not `role-`)
- sessionDataToCurrentUser.test.ts: extractGrantedPermissions does NOT filter `_` prefix keys (only resolveBootstrapPermissions does) — test updated to verify actual behavior
- No vitest.config.ts files needed — workspace config handles environment settings
- Integration test uses store-level testing (simulatePersonaSelection) instead of renderHook (no @testing-library/react dependency)

Test results:
- @hbc/auth: 103 passed (24 files)
- @hbc/shell: 89 passed (16 files)
- Build: clean (tsc passes for both packages)

Coverage targets: 100% for pure functions, 85%+ for hooks with store integration
-->
