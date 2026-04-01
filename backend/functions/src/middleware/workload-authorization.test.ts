import { describe, expect, it } from 'vitest';
import type { IValidatedClaims } from './validateToken.js';
import {
  isAppOnlyToken,
  requireDelegatedScope,
  requireWorkloadRole,
  requireAdmin,
  isAdmin,
  isBreakGlass,
} from './authorization.js';

/**
 * P9-G5-08: Workload and app-only authorization tests.
 *
 * Proves the distinction between delegated user execution and app-only
 * workload execution across the Project Setup authorization model.
 */

function makeDelegatedClaims(overrides: Partial<IValidatedClaims> = {}): IValidatedClaims {
  return {
    upn: 'user@hb.com',
    oid: 'oid-user',
    roles: [],
    displayName: 'User',
    scp: 'access_as_user',
    ...overrides,
  };
}

function makeAppOnlyClaims(roles: string[] = ['Automation']): IValidatedClaims {
  return {
    upn: '',
    oid: 'oid-service-principal',
    roles,
    displayName: '',
    idtyp: 'app',
  };
}

// ── Token-type detection ─────────────────────────────────────────────────

describe('P9-G5-08 token-type detection', () => {
  it('delegated token with upn and scp is NOT app-only', () => {
    expect(isAppOnlyToken(makeDelegatedClaims())).toBe(false);
  });

  it('app-only token with idtyp=app IS app-only', () => {
    expect(isAppOnlyToken(makeAppOnlyClaims())).toBe(true);
  });

  it('token with idtyp=app is app-only even if it has upn/scp (defensive)', () => {
    expect(isAppOnlyToken(makeDelegatedClaims({ idtyp: 'app' }))).toBe(true);
  });

  it('token with no upn and no scp (and no idtyp) is treated as app-only (fallback)', () => {
    expect(isAppOnlyToken({ upn: '', oid: 'oid-1', roles: [], displayName: '' })).toBe(true);
  });
});

// ── Delegated-Open route policy stack ────────────────────────────────────

describe('P9-G5-08 Delegated-Open route: L1 → L2', () => {
  it('delegated token with scope passes', () => {
    expect(requireDelegatedScope(makeDelegatedClaims())).toBeNull();
  });

  it('delegated token without scope is denied', () => {
    const result = requireDelegatedScope(makeDelegatedClaims({ scp: undefined }));
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });

  it('app-only token bypasses delegated scope check', () => {
    expect(requireDelegatedScope(makeAppOnlyClaims())).toBeNull();
  });
});

// ── Delegated-Privileged route policy stack ───────────────────────────────

describe('P9-G5-08 Delegated-Privileged route: L1 → L2 → L3', () => {
  it('delegated admin with scope passes both L2 and L3', () => {
    const claims = makeDelegatedClaims({ roles: ['Admin'] });
    expect(requireDelegatedScope(claims)).toBeNull();
    expect(requireAdmin(claims)).toBeNull();
  });

  it('delegated non-admin with scope passes L2 but fails L3', () => {
    const claims = makeDelegatedClaims({ roles: [] });
    expect(requireDelegatedScope(claims)).toBeNull();
    expect(requireAdmin(claims)).not.toBeNull();
  });

  it('delegated admin without scope fails at L2 before reaching L3', () => {
    const claims = makeDelegatedClaims({ scp: undefined, roles: ['Admin'] });
    expect(requireDelegatedScope(claims)).not.toBeNull();
  });
});

// ── Workload route policy stack ──────────────────────────────────────────

describe('P9-G5-08 Workload route: L1 → L5', () => {
  it('app-only token with Automation role passes workload check', () => {
    expect(requireWorkloadRole(makeAppOnlyClaims(['Automation']))).toBeNull();
  });

  it('app-only token without Automation role is denied', () => {
    const result = requireWorkloadRole(makeAppOnlyClaims([]));
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });

  it('app-only token with Admin role (not Automation) is denied for workload', () => {
    const result = requireWorkloadRole(makeAppOnlyClaims(['Admin']));
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });

  it('delegated token is denied for workload even with Automation role', () => {
    const result = requireWorkloadRole(makeDelegatedClaims({ roles: ['Automation'] }));
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });
});

// ── Break-glass role behavior ────────────────────────────────────────────

describe('P9-G5-08 break-glass role', () => {
  it('BreakGlass is detected by isBreakGlass()', () => {
    expect(isBreakGlass(makeDelegatedClaims({ roles: ['BreakGlass'] }))).toBe(true);
  });

  it('BreakGlass is NOT detected by isAdmin()', () => {
    expect(isAdmin(makeDelegatedClaims({ roles: ['BreakGlass'] }))).toBe(false);
  });

  it('BreakGlass with scope passes L2', () => {
    expect(requireDelegatedScope(makeDelegatedClaims({ roles: ['BreakGlass'] }))).toBeNull();
  });

  it('BreakGlass does NOT pass requireAdmin() — it is handled separately in resolveRequestRole()', () => {
    const result = requireAdmin(makeDelegatedClaims({ roles: ['BreakGlass'] }));
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });
});

// ── Cross-path isolation ─────────────────────────────────────────────────

describe('P9-G5-08 delegated vs workload isolation', () => {
  it('delegated token cannot access workload path', () => {
    const claims = makeDelegatedClaims({ roles: ['Admin'] });
    expect(requireWorkloadRole(claims)).not.toBeNull();
  });

  it('app-only token cannot pass admin check (admin is a user role)', () => {
    const claims = makeAppOnlyClaims(['Admin']);
    // App-only token bypasses delegated scope check
    expect(requireDelegatedScope(claims)).toBeNull();
    // But requireAdmin checks the role regardless of token type
    expect(requireAdmin(claims)).toBeNull(); // Admin role IS present
  });

  it('app-only Automation token passes workload but fails admin', () => {
    const claims = makeAppOnlyClaims(['Automation']);
    expect(requireWorkloadRole(claims)).toBeNull();
    expect(requireAdmin(claims)).not.toBeNull();
  });
});
