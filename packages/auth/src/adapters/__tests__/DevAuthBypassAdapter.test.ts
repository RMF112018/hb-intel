// packages/auth/src/adapters/__tests__/DevAuthBypassAdapter.test.ts
// Unit tests for DevAuthBypassAdapter
// D-PH5C-05: Comprehensive test coverage for dev adapter
// @vitest-environment happy-dom

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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
});
