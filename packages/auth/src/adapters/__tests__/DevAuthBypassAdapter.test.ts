// packages/auth/src/adapters/__tests__/DevAuthBypassAdapter.test.ts
// Unit tests for DevAuthBypassAdapter
// D-PH5C-05: Comprehensive test coverage for dev adapter
// @vitest-environment happy-dom

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DevAuthBypassAdapter } from '../DevAuthBypassAdapter';

describe('DevAuthBypassAdapter', () => {
  let adapter: DevAuthBypassAdapter;

  beforeEach(() => {
    sessionStorage.clear();
    adapter = new DevAuthBypassAdapter(100); // Short delay for tests
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe('acquireIdentity', () => {
    it('should return a valid identity object', async () => {
      const identity = await adapter.acquireIdentity();

      expect(identity).toBeDefined();
      expect(identity.userId).toMatch(/^dev-user-/);
      expect(identity.displayName).toBe('Dev User');
      expect(identity.email).toBe('dev@hb-intel.local');
      expect(identity.roles).toContain('Administrator');
      expect(identity.metadata.sessionId).toBeDefined();
      expect(identity.claims.scopes).toContain('auth:read');
    });

    it('should include configurable delay', async () => {
      const startTime = performance.now();
      await adapter.acquireIdentity();
      const elapsedTime = performance.now() - startTime;

      expect(elapsedTime).toBeGreaterThanOrEqual(100 - 10); // Allow ±10ms variance
    });
  });

  describe('normalizeSession', () => {
    it('should normalize identity into session data', async () => {
      const identity = await adapter.acquireIdentity();
      const session = await adapter.normalizeSession(identity);

      expect(session).toBeDefined();
      expect(session.sessionId).toBe(identity.metadata.sessionId);
      expect(session.userId).toBe(identity.userId);
      expect(session.roles).toContain('Administrator');
      expect(session.permissions).toBeDefined();
      expect(session.expiresAt).toBeGreaterThan(Date.now());
    });

    it('should store session in sessionStorage', async () => {
      const identity = await adapter.acquireIdentity();
      await adapter.normalizeSession(identity);

      const stored = sessionStorage.getItem('hb-auth-dev-session');
      expect(stored).toBeDefined();

      const parsed = JSON.parse(stored!);
      expect(parsed.version).toBe(1);
      expect(parsed.session.userId).toBe(identity.userId);
    });
  });

  describe('restoreSession', () => {
    it('should restore valid session from sessionStorage', async () => {
      const identity = await adapter.acquireIdentity();
      const originalSession = await adapter.normalizeSession(identity);

      const restored = await adapter.restoreSession();

      expect(restored).toBeDefined();
      expect(restored?.userId).toBe(originalSession.userId);
      expect(restored?.sessionId).toBe(originalSession.sessionId);
    });

    it('should return null if no session stored', async () => {
      const restored = await adapter.restoreSession();

      expect(restored).toBeNull();
    });

    it('should return null if session is expired', async () => {
      const identity = await adapter.acquireIdentity();
      const session = await adapter.normalizeSession(identity);

      // Manually set expired session
      sessionStorage.setItem(
        'hb-auth-dev-session',
        JSON.stringify({
          version: 1,
          session: { ...session, expiresAt: Date.now() - 1000 },
        })
      );

      const restored = await adapter.restoreSession();

      expect(restored).toBeNull();
      expect(sessionStorage.getItem('hb-auth-dev-session')).toBeNull();
    });

    it('should remove invalid/corrupted session data', async () => {
      sessionStorage.setItem('hb-auth-dev-session', 'invalid-json');

      const restored = await adapter.restoreSession();

      expect(restored).toBeNull();
      expect(sessionStorage.getItem('hb-auth-dev-session')).toBeNull();
    });

    it('should return null and clear storage for unknown session version', async () => {
      sessionStorage.setItem(
        'hb-auth-dev-session',
        JSON.stringify({
          version: 999,
          session: {
            userId: 'dev-user-test',
            expiresAt: Date.now() + 10000,
          },
        })
      );

      const restored = await adapter.restoreSession();

      expect(restored).toBeNull();
      expect(sessionStorage.getItem('hb-auth-dev-session')).toBeNull();
    });
  });

  describe('permissions mapping', () => {
    it('should grant admin permissions for Administrator role', async () => {
      const identity = await adapter.acquireIdentity();
      const session = await adapter.normalizeSession(identity);

      expect(session.permissions['feature:admin-panel']).toBe(true);
      expect(session.permissions['feature:user-management']).toBe(true);
    });

    it('should grant default permissions to all users', async () => {
      const identity = await adapter.acquireIdentity();
      const session = await adapter.normalizeSession(identity);

      expect(session.permissions['feature:view-dashboard']).toBe(true);
      expect(session.permissions['feature:view-profile']).toBe(true);
    });
  });

  // D-PH6F.5: mapRolesToPermissions coverage via type-cast access
  describe('mapRolesToPermissions (private)', () => {
    function callMapRolesToPermissions(roles: string[]): Record<string, boolean> {
      const a = new DevAuthBypassAdapter(0);
      return (a as unknown as {
        mapRolesToPermissions(roles: string[]): Record<string, boolean>;
      }).mapRolesToPermissions(roles);
    }

    it('includes all 17 base permission keys', () => {
      const permissions = callMapRolesToPermissions(['Administrator']);
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
      const permissions = callMapRolesToPermissions(['Administrator']);
      expect(permissions['feature:admin-panel']).toBe(true);
      expect(permissions['feature:user-management']).toBe(true);
      expect(permissions['action:delete']).toBe(true);
      expect(permissions['action:approve']).toBe(true);
    });

    it('grants accounting features for AccountingUser role', () => {
      const permissions = callMapRolesToPermissions(['AccountingUser']);
      expect(permissions['feature:accounting-invoice']).toBe(true);
      expect(permissions['feature:accounting-reports']).toBe(true);
      expect(permissions['feature:admin-panel']).toBe(false);
      expect(permissions['action:delete']).toBe(false);
    });

    it('grants action:approve for EstimatingUser role', () => {
      const permissions = callMapRolesToPermissions(['EstimatingUser']);
      expect(permissions['action:approve']).toBe(true);
      expect(permissions['feature:estimating-projects']).toBe(true);
      expect(permissions['feature:estimating-quotes']).toBe(true);
    });

    it('grants action:read universally', () => {
      const permissions = callMapRolesToPermissions(['Member']);
      expect(permissions['action:read']).toBe(true);
    });

    it('grants audit-logs for Executive role', () => {
      const permissions = callMapRolesToPermissions(['Executive']);
      expect(permissions['feature:audit-logs']).toBe(true);
      expect(permissions['feature:accounting-reports']).toBe(true);
    });
  });

  // D-PH6F.5: normalizeSessionWithPermissions coverage
  describe('normalizeSessionWithPermissions', () => {
    it('uses provided permissions map directly without role-based generation', async () => {
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
      expect(session.permissions).not.toHaveProperty('feature:view-dashboard');
    });

    it('persists session to sessionStorage', async () => {
      const mockIdentity = {
        userId: 'persist-user',
        displayName: 'Persist User',
        email: 'persist@example.com',
        roles: ['Member'],
        metadata: {
          loginTimestamp: Date.now(),
          deviceFingerprint: 'fp',
          sessionId: 'persist-session',
        },
        claims: { scopes: [] },
      };

      await adapter.normalizeSessionWithPermissions(mockIdentity, { 'action:read': true });

      const stored = sessionStorage.getItem('hb-auth-dev-session');
      expect(stored).toBeDefined();
      const parsed = JSON.parse(stored!);
      expect(parsed.version).toBe(1);
      expect(parsed.session.userId).toBe('persist-user');
      expect(parsed.session.permissions).toEqual({ 'action:read': true });
    });
  });
});
