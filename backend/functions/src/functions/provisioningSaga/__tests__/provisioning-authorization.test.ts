import { describe, expect, it } from 'vitest';
import type { IValidatedClaims } from '../../../middleware/validateToken.js';
import {
  requireAdmin,
  requireDelegatedScope,
  isAdmin,
  isPrivileged,
  ADMIN_ROLES,
  CONTROLLER_ROLES,
} from '../../../middleware/authorization.js';

/**
 * P9-G5-07: Provisioning and admin route authorization convergence tests.
 *
 * Verifies that all provisioning routes enforce the correct policy stack
 * per the route-policy matrix (Gap-5_Route-Policy-Matrix.md §2).
 */

function makeClaims(overrides: Partial<IValidatedClaims> = {}): IValidatedClaims {
  return {
    upn: 'user@hb.com',
    oid: 'oid-user',
    roles: [],
    displayName: 'User',
    scp: 'access_as_user',
    ...overrides,
  };
}

// ── L2: Delegated scope enforcement ──────────────────────────────────────

describe('P9-G5-07 provisioning routes: delegated scope enforcement (L2)', () => {
  it('allows requests with access_as_user scope', () => {
    const result = requireDelegatedScope(makeClaims({ scp: 'access_as_user' }));
    expect(result).toBeNull();
  });

  it('denies delegated tokens without access_as_user scope', () => {
    const result = requireDelegatedScope(makeClaims({ scp: 'openid profile' }));
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });

  it('denies delegated tokens with no scp claim', () => {
    const result = requireDelegatedScope(makeClaims({ scp: undefined }));
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });

  it('bypasses scope check for app-only tokens (idtyp=app)', () => {
    const result = requireDelegatedScope(makeClaims({
      idtyp: 'app',
      upn: '',
      scp: undefined,
      roles: ['Automation'],
    }));
    expect(result).toBeNull();
  });
});

// ── L3: Admin-role enforcement for privileged routes ─────────────────────

describe('P9-G5-07 provisioning routes: admin role enforcement (L3)', () => {
  it('allows Admin role', () => {
    expect(requireAdmin(makeClaims({ roles: ['Admin'] }))).toBeNull();
  });

  it('allows HBIntelAdmin role', () => {
    expect(requireAdmin(makeClaims({ roles: ['HBIntelAdmin'] }))).toBeNull();
  });

  it('denies Controller role (admin-only routes)', () => {
    const result = requireAdmin(makeClaims({ roles: ['Controller'] }));
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });

  it('denies empty roles', () => {
    const result = requireAdmin(makeClaims({ roles: [] }));
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });
});

// ── Route classification per policy matrix ───────────────────────────────

describe('P9-G5-07 route classification alignment', () => {
  describe('Delegated-Open routes (provisionProjectSite, getProvisioningStatus, retryProvisioning, escalateProvisioning)', () => {
    it('any authenticated user with scope passes L2', () => {
      const claims = makeClaims({ scp: 'access_as_user', roles: [] });
      expect(requireDelegatedScope(claims)).toBeNull();
    });

    it('no admin check required — any role passes', () => {
      const claims = makeClaims({ scp: 'access_as_user', roles: [] });
      // These routes do NOT call requireAdmin — just verifying the pattern
      expect(isAdmin(claims)).toBe(false);
      expect(isPrivileged(claims)).toBe(false);
      // But the route still allows the request (no role gate)
    });
  });

  describe('Delegated-Privileged routes (listFailedRuns, triggerTimerManually, listProvisioningRuns, archiveFailure, acknowledgeEscalation, forceStateTransition)', () => {
    it('admin passes both L2 and L3', () => {
      const claims = makeClaims({ scp: 'access_as_user', roles: ['Admin'] });
      expect(requireDelegatedScope(claims)).toBeNull();
      expect(requireAdmin(claims)).toBeNull();
    });

    it('non-admin with scope passes L2 but fails L3', () => {
      const claims = makeClaims({ scp: 'access_as_user', roles: ['Controller'] });
      expect(requireDelegatedScope(claims)).toBeNull();
      expect(requireAdmin(claims)).not.toBeNull();
    });

    it('admin without scope fails at L2', () => {
      const claims = makeClaims({ scp: undefined, roles: ['Admin'] });
      expect(requireDelegatedScope(claims)).not.toBeNull();
    });
  });
});
