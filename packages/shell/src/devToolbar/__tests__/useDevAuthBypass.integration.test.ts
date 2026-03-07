// packages/shell/src/devToolbar/__tests__/useDevAuthBypass.integration.test.ts
// D-PH6F.5: Store integration tests for useDevAuthBypass
// Verifies persona selection -> authStore/permissionStore sync -> correct permissions

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore, usePermissionStore, PERSONA_REGISTRY } from '@hbc/auth';
import type { IPersona } from '@hbc/auth';
import {
  sessionDataToCurrentUser,
  extractGrantedPermissions,
} from '../sessionDataToCurrentUser.js';

// D-PH6F.5: Integration tests operate at the store level, directly calling
// the same store actions that useDevAuthBypass.selectPersona() calls,
// with real PERSONA_REGISTRY data. This avoids React rendering complexity
// while verifying the critical store sync path.

beforeEach(() => {
  useAuthStore.getState().clear();
  usePermissionStore.getState().clear();
  sessionStorage.clear();
  localStorage.clear();
});

/**
 * Simulates the selectPersona() store sync path from useDevAuthBypass.ts:101-154.
 * Uses the same function calls the hook makes, bypassing only the adapter delay.
 */
function simulatePersonaSelection(persona: IPersona): void {
  // Build a mock ISessionData matching what normalizeSessionWithPermissions returns
  const session = {
    sessionId: `test-session-${persona.id}`,
    userId: persona.id,
    displayName: persona.name,
    email: persona.email,
    roles: persona.roles,
    permissions: persona.permissions,
    expiresAt: Date.now() + 8 * 60 * 60 * 1000,
    acquiredAt: Date.now(),
  };

  // D-PH6F-04: Handle _session:expired persona
  if (persona.permissions['_session:expired'] === true) {
    useAuthStore.getState().markReauthRequired({
      code: 'expired-session',
      message: '[DEV] Simulated session expiry via ExpiredSession persona',
      recoverable: true,
    });
    usePermissionStore.getState().clear();
    return;
  }

  // D-PH6F-01: Sync to global stores (same calls as useDevAuthBypass.ts:151-154)
  useAuthStore.getState().setUser(sessionDataToCurrentUser(session));
  usePermissionStore
    .getState()
    .setPermissions(extractGrantedPermissions(session.permissions));

  // D-PH6F-04: Handle _system:degraded persona
  if (persona.permissions['_system:degraded'] === true) {
    usePermissionStore.getState().setFeatureFlags({
      'buyout-schedule': false,
      'risk-matrix': false,
      'ai-insights': false,
      'procore-sync': false,
      '_degraded-mode': true,
    });
  }
}

describe('useDevAuthBypass — authStore integration', () => {
  it('selectPersona() updates useAuthStore.currentUser', () => {
    const accountingPersona = PERSONA_REGISTRY.getById('persona-accounting')!;
    simulatePersonaSelection(accountingPersona);

    const authState = useAuthStore.getState();
    expect(authState.currentUser).not.toBeNull();
    expect(authState.currentUser?.displayName).toBe('AccountingUser');
    expect(authState.currentUser?.id).toBe('persona-accounting');
  });

  it('selectPersona() sets lifecyclePhase to authenticated', () => {
    simulatePersonaSelection(PERSONA_REGISTRY.default());
    expect(useAuthStore.getState().lifecyclePhase).toBe('authenticated');
  });

  it('selectPersona() sets shellBootstrap.shellReadyToRender to true', () => {
    simulatePersonaSelection(PERSONA_REGISTRY.default());
    expect(useAuthStore.getState().shellBootstrap.shellReadyToRender).toBe(true);
  });

  it('selectPersona() updates usePermissionStore.permissions correctly', () => {
    const projectPersona = PERSONA_REGISTRY.getById('persona-project')!;
    simulatePersonaSelection(projectPersona);

    const permissions = usePermissionStore.getState().permissions;
    expect(permissions).toContain('feature:project-hub');
    expect(permissions).toContain('feature:project-tracking');
    expect(permissions).toContain('action:read');
    expect(permissions).not.toContain('feature:admin-panel');
    expect(permissions).not.toContain('feature:accounting-invoice');
  });

  it('expireSession() transitions lifecyclePhase to signed-out', () => {
    simulatePersonaSelection(PERSONA_REGISTRY.default());
    expect(useAuthStore.getState().lifecyclePhase).toBe('authenticated');

    // Simulate expireSession() — same calls as useDevAuthBypass.ts:203-204
    useAuthStore.getState().signOut();
    usePermissionStore.getState().clear();

    expect(useAuthStore.getState().lifecyclePhase).toBe('signed-out');
  });

  it('expireSession() clears usePermissionStore.permissions', () => {
    simulatePersonaSelection(PERSONA_REGISTRY.default());
    expect(usePermissionStore.getState().permissions.length).toBeGreaterThan(0);

    useAuthStore.getState().signOut();
    usePermissionStore.getState().clear();

    expect(usePermissionStore.getState().permissions).toHaveLength(0);
  });

  it('refreshSession() re-syncs authStore from session data', () => {
    // Simulate a restored session with Executive permissions
    const executive = PERSONA_REGISTRY.getById('persona-executive')!;
    const restoredSession = {
      sessionId: 'test-restore-id',
      userId: executive.id,
      displayName: executive.name,
      email: executive.email,
      roles: executive.roles,
      permissions: executive.permissions,
      expiresAt: Date.now() + 8 * 60 * 60 * 1000,
      acquiredAt: Date.now(),
    };

    // Same sync path as useDevAuthBypass.ts:84-88 (restore path)
    useAuthStore.getState().setUser(sessionDataToCurrentUser(restoredSession));
    usePermissionStore
      .getState()
      .setPermissions(extractGrantedPermissions(restoredSession.permissions));

    expect(useAuthStore.getState().lifecyclePhase).toBe('authenticated');
    expect(useAuthStore.getState().currentUser?.displayName).toBe('Executive');
  });
});

describe('useDevAuthBypass — all 11 personas round-trip', () => {
  const allPersonas = PERSONA_REGISTRY.all();

  for (const persona of allPersonas) {
    it(`Persona "${persona.name}" (${persona.id}) — stores get correct user and permissions`, () => {
      simulatePersonaSelection(persona);

      // ExpiredSession persona is a special case — triggers reauth
      if (persona.id === 'persona-expired-session') {
        expect(useAuthStore.getState().lifecyclePhase).toBe('reauth-required');
        expect(usePermissionStore.getState().permissions).toHaveLength(0);
        return;
      }

      const authState = useAuthStore.getState();
      expect(authState.lifecyclePhase).toBe('authenticated');
      expect(authState.currentUser?.id).toBe(persona.id);
      expect(authState.currentUser?.displayName).toBe(persona.name);
      expect(authState.currentUser?.email).toBe(persona.email);

      // Verify permissions match persona definition
      const permissions = usePermissionStore.getState().permissions;
      const expectedGranted = Object.entries(persona.permissions)
        .filter(([, val]) => val)
        .map(([k]) => k);

      for (const key of expectedGranted) {
        expect(permissions).toContain(key);
      }

      const expectedDenied = Object.entries(persona.permissions)
        .filter(([, val]) => !val)
        .map(([k]) => k);

      for (const key of expectedDenied) {
        expect(permissions).not.toContain(key);
      }
    });
  }
});

describe('useDevAuthBypass — persona switching sequence', () => {
  it('switching from Administrator to Member reduces permissions', () => {
    simulatePersonaSelection(PERSONA_REGISTRY.getById('persona-admin')!);
    expect(usePermissionStore.getState().permissions).toContain('feature:admin-panel');

    simulatePersonaSelection(PERSONA_REGISTRY.getById('persona-member')!);

    const permissions = usePermissionStore.getState().permissions;
    expect(permissions).not.toContain('feature:admin-panel');
    expect(permissions).not.toContain('feature:accounting-invoice');
    expect(permissions).toContain('feature:view-dashboard');
    expect(permissions).toContain('action:read');
  });

  it('switching personas updates currentUser identity correctly', () => {
    simulatePersonaSelection(PERSONA_REGISTRY.getById('persona-estimating')!);
    expect(useAuthStore.getState().currentUser?.displayName).toBe('EstimatingUser');

    simulatePersonaSelection(PERSONA_REGISTRY.getById('persona-project')!);
    expect(useAuthStore.getState().currentUser?.displayName).toBe('ProjectUser');
  });

  it('DegradedMode persona sets degraded feature flags', () => {
    simulatePersonaSelection(PERSONA_REGISTRY.getById('persona-degraded-mode')!);

    const flags = usePermissionStore.getState().featureFlags;
    expect(flags['_degraded-mode']).toBe(true);
    expect(flags['buyout-schedule']).toBe(false);
    expect(flags['risk-matrix']).toBe(false);
  });
});
