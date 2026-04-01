import { describe, expect, it, vi } from 'vitest';
import type { IValidatedClaims } from './validateToken.js';
import type { ILogger } from '../utils/logger.js';
import {
  ADMIN_ROLES,
  CONTROLLER_ROLES,
  BREAK_GLASS_ROLES,
  AUTOMATION_ROLES,
  PRIVILEGED_ROLES,
  REQUIRED_DELEGATED_SCOPE,
  isAppOnlyToken,
  hasAnyRole,
  isAdmin,
  isController,
  isPrivileged,
  isBreakGlass,
  isAutomation,
  hasScope,
  hasDelegatedScope,
  checkOwnership,
  requireRoles,
  requireAdmin,
  requireDelegatedScope,
  requireWorkloadRole,
  emitAuthorizationTelemetry,
} from './authorization.js';

// ── Test Helpers ─────────────────────────────────────────────────────────

function makeClaims(overrides: Partial<IValidatedClaims> = {}): IValidatedClaims {
  return {
    upn: 'user@hb.com',
    oid: 'oid-user-1',
    roles: [],
    displayName: 'Test User',
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

// ── Constants ────────────────────────────────────────────────────────────

describe('P9-G5-04 role constants', () => {
  it('ADMIN_ROLES contains Admin and HBIntelAdmin', () => {
    expect(ADMIN_ROLES).toEqual(['Admin', 'HBIntelAdmin']);
  });

  it('CONTROLLER_ROLES contains Controller and HBIntelController', () => {
    expect(CONTROLLER_ROLES).toEqual(['Controller', 'HBIntelController']);
  });

  it('PRIVILEGED_ROLES is the union of admin and controller roles', () => {
    expect(PRIVILEGED_ROLES).toEqual([...ADMIN_ROLES, ...CONTROLLER_ROLES]);
  });

  it('BREAK_GLASS_ROLES contains BreakGlass', () => {
    expect(BREAK_GLASS_ROLES).toEqual(['BreakGlass']);
  });

  it('AUTOMATION_ROLES contains Automation', () => {
    expect(AUTOMATION_ROLES).toEqual(['Automation']);
  });

  it('REQUIRED_DELEGATED_SCOPE is access_as_user', () => {
    expect(REQUIRED_DELEGATED_SCOPE).toBe('access_as_user');
  });
});

// ── isAppOnlyToken ───────────────────────────────────────────────────────

describe('P9-G5-04 isAppOnlyToken', () => {
  it('returns true when idtyp is "app"', () => {
    expect(isAppOnlyToken(makeClaims({ idtyp: 'app', upn: 'user@hb.com', scp: 'some_scope' }))).toBe(true);
  });

  it('returns true when no scp and no upn (fallback signal)', () => {
    expect(isAppOnlyToken(makeClaims({ upn: '', scp: undefined }))).toBe(true);
  });

  it('returns false for a normal delegated token with upn', () => {
    expect(isAppOnlyToken(makeClaims({ upn: 'user@hb.com', scp: 'access_as_user' }))).toBe(false);
  });

  it('returns false when upn is present even without scp', () => {
    expect(isAppOnlyToken(makeClaims({ upn: 'user@hb.com', scp: undefined }))).toBe(false);
  });

  it('returns false when scp is present even without upn', () => {
    expect(isAppOnlyToken(makeClaims({ upn: '', scp: 'access_as_user' }))).toBe(false);
  });
});

// ── hasAnyRole ───────────────────────────────────────────────────────────

describe('P9-G5-04 hasAnyRole', () => {
  it('returns true when claims include one of the specified roles', () => {
    expect(hasAnyRole(makeClaims({ roles: ['Admin'] }), ADMIN_ROLES)).toBe(true);
  });

  it('returns true for the HBIntel variant', () => {
    expect(hasAnyRole(makeClaims({ roles: ['HBIntelAdmin'] }), ADMIN_ROLES)).toBe(true);
  });

  it('returns false when claims have no matching roles', () => {
    expect(hasAnyRole(makeClaims({ roles: ['Reader'] }), ADMIN_ROLES)).toBe(false);
  });

  it('returns false when claims have empty roles', () => {
    expect(hasAnyRole(makeClaims({ roles: [] }), ADMIN_ROLES)).toBe(false);
  });

  it('handles multiple roles in claims', () => {
    expect(hasAnyRole(makeClaims({ roles: ['Reader', 'Controller'] }), CONTROLLER_ROLES)).toBe(true);
  });
});

// ── Convenience role checks ──────────────────────────────────────────────

describe('P9-G5-04 isAdmin', () => {
  it('returns true for Admin role', () => {
    expect(isAdmin(makeClaims({ roles: ['Admin'] }))).toBe(true);
  });

  it('returns true for HBIntelAdmin role', () => {
    expect(isAdmin(makeClaims({ roles: ['HBIntelAdmin'] }))).toBe(true);
  });

  it('returns false for Controller role', () => {
    expect(isAdmin(makeClaims({ roles: ['Controller'] }))).toBe(false);
  });

  it('returns false for empty roles', () => {
    expect(isAdmin(makeClaims({ roles: [] }))).toBe(false);
  });
});

describe('P9-G5-04 isController', () => {
  it('returns true for Controller role', () => {
    expect(isController(makeClaims({ roles: ['Controller'] }))).toBe(true);
  });

  it('returns true for HBIntelController role', () => {
    expect(isController(makeClaims({ roles: ['HBIntelController'] }))).toBe(true);
  });

  it('returns false for Admin role', () => {
    expect(isController(makeClaims({ roles: ['Admin'] }))).toBe(false);
  });
});

describe('P9-G5-04 isPrivileged', () => {
  it('returns true for Admin', () => {
    expect(isPrivileged(makeClaims({ roles: ['Admin'] }))).toBe(true);
  });

  it('returns true for Controller', () => {
    expect(isPrivileged(makeClaims({ roles: ['Controller'] }))).toBe(true);
  });

  it('returns true for HBIntelController', () => {
    expect(isPrivileged(makeClaims({ roles: ['HBIntelController'] }))).toBe(true);
  });

  it('returns false for non-privileged role', () => {
    expect(isPrivileged(makeClaims({ roles: ['Reader'] }))).toBe(false);
  });

  it('returns false for empty roles', () => {
    expect(isPrivileged(makeClaims({ roles: [] }))).toBe(false);
  });
});

describe('P9-G5-04 isBreakGlass', () => {
  it('returns true for BreakGlass role', () => {
    expect(isBreakGlass(makeClaims({ roles: ['BreakGlass'] }))).toBe(true);
  });

  it('returns false for Admin role', () => {
    expect(isBreakGlass(makeClaims({ roles: ['Admin'] }))).toBe(false);
  });
});

describe('P9-G5-04 isAutomation', () => {
  it('returns true for Automation role', () => {
    expect(isAutomation(makeClaims({ roles: ['Automation'] }))).toBe(true);
  });

  it('returns false for Admin role', () => {
    expect(isAutomation(makeClaims({ roles: ['Admin'] }))).toBe(false);
  });
});

// ── Scope checks ─────────────────────────────────────────────────────────

describe('P9-G5-04 hasScope', () => {
  it('returns true when scp contains the requested scope', () => {
    expect(hasScope(makeClaims({ scp: 'access_as_user' }), 'access_as_user')).toBe(true);
  });

  it('returns true when scp is space-delimited and contains the requested scope', () => {
    expect(hasScope(makeClaims({ scp: 'openid access_as_user profile' }), 'access_as_user')).toBe(true);
  });

  it('returns false when scp does not contain the requested scope', () => {
    expect(hasScope(makeClaims({ scp: 'openid profile' }), 'access_as_user')).toBe(false);
  });

  it('returns false when scp is undefined', () => {
    expect(hasScope(makeClaims({ scp: undefined }), 'access_as_user')).toBe(false);
  });

  it('does not match partial scope names', () => {
    expect(hasScope(makeClaims({ scp: 'access_as_user_admin' }), 'access_as_user')).toBe(false);
  });
});

describe('P9-G5-04 hasDelegatedScope', () => {
  it('returns true when access_as_user scope is present', () => {
    expect(hasDelegatedScope(makeClaims({ scp: 'access_as_user' }))).toBe(true);
  });

  it('returns false when scp is absent', () => {
    expect(hasDelegatedScope(makeClaims({ scp: undefined }))).toBe(false);
  });
});

// ── checkOwnership ───────────────────────────────────────────────────────

describe('P9-G5-04 checkOwnership', () => {
  it('returns isOwner=true via oid when submittedByOid matches', () => {
    const result = checkOwnership(
      makeClaims({ oid: 'oid-123' }),
      { submittedByOid: 'oid-123', submittedBy: 'other@hb.com' },
    );
    expect(result).toEqual({ isOwner: true, method: 'oid' });
  });

  it('returns isOwner=false via oid when submittedByOid does not match', () => {
    const result = checkOwnership(
      makeClaims({ oid: 'oid-123' }),
      { submittedByOid: 'oid-999', submittedBy: 'user@hb.com' },
    );
    expect(result).toEqual({ isOwner: false, method: 'oid' });
  });

  it('falls back to UPN comparison when submittedByOid is absent', () => {
    const result = checkOwnership(
      makeClaims({ upn: 'user@hb.com', oid: 'oid-123' }),
      { submittedBy: 'user@hb.com' },
    );
    expect(result).toEqual({ isOwner: true, method: 'upn' });
  });

  it('UPN comparison is case-insensitive', () => {
    const result = checkOwnership(
      makeClaims({ upn: 'User@HB.com' }),
      { submittedBy: 'user@hb.com' },
    );
    expect(result).toEqual({ isOwner: true, method: 'upn' });
  });

  it('returns isOwner=false via UPN when UPNs do not match', () => {
    const result = checkOwnership(
      makeClaims({ upn: 'other@hb.com' }),
      { submittedBy: 'user@hb.com' },
    );
    expect(result).toEqual({ isOwner: false, method: 'upn' });
  });

  it('returns method=none when resource has no identity fields', () => {
    const result = checkOwnership(makeClaims(), {});
    expect(result).toEqual({ isOwner: false, method: 'none' });
  });

  it('prefers oid over UPN even when both would match', () => {
    const result = checkOwnership(
      makeClaims({ oid: 'oid-123', upn: 'user@hb.com' }),
      { submittedByOid: 'oid-123', submittedBy: 'user@hb.com' },
    );
    expect(result.method).toBe('oid');
  });
});

// ── requireRoles ─────────────────────────────────────────────────────────

describe('P9-G5-04 requireRoles', () => {
  it('returns null when caller has a matching role', () => {
    expect(requireRoles(makeClaims({ roles: ['Admin'] }), ADMIN_ROLES)).toBeNull();
  });

  it('returns 403 when caller lacks all specified roles', () => {
    const result = requireRoles(makeClaims({ roles: ['Reader'] }), ADMIN_ROLES, 'req-1');
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });

  it('includes requestId in the 403 response', () => {
    const result = requireRoles(makeClaims({ roles: [] }), ADMIN_ROLES, 'req-42');
    expect(result).not.toBeNull();
    const body = result!.jsonBody as Record<string, unknown>;
    expect(body.requestId).toBe('req-42');
  });
});

// ── requireAdmin ─────────────────────────────────────────────────────────

describe('P9-G5-04 requireAdmin', () => {
  it('returns null for Admin role', () => {
    expect(requireAdmin(makeClaims({ roles: ['Admin'] }))).toBeNull();
  });

  it('returns null for HBIntelAdmin role', () => {
    expect(requireAdmin(makeClaims({ roles: ['HBIntelAdmin'] }))).toBeNull();
  });

  it('returns 403 for Controller role', () => {
    const result = requireAdmin(makeClaims({ roles: ['Controller'] }));
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });

  it('returns 403 for empty roles', () => {
    const result = requireAdmin(makeClaims({ roles: [] }));
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });
});

// ── requireDelegatedScope ────────────────────────────────────────────────

describe('P9-G5-04 requireDelegatedScope', () => {
  it('returns null when access_as_user scope is present', () => {
    expect(requireDelegatedScope(makeClaims({ scp: 'access_as_user' }))).toBeNull();
  });

  it('returns 403 when scope is missing for delegated tokens', () => {
    const result = requireDelegatedScope(makeClaims({ upn: 'user@hb.com', scp: undefined }));
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });

  it('bypasses scope check for app-only tokens (idtyp=app)', () => {
    expect(requireDelegatedScope(makeAppOnlyClaims())).toBeNull();
  });

  it('bypasses scope check for app-only tokens (no upn, no scp)', () => {
    expect(requireDelegatedScope(makeClaims({ upn: '', scp: undefined }))).toBeNull();
  });
});

// ── requireWorkloadRole ──────────────────────────────────────────────────

describe('P9-G5-04 requireWorkloadRole', () => {
  it('returns null for app-only token with Automation role', () => {
    expect(requireWorkloadRole(makeAppOnlyClaims(['Automation']))).toBeNull();
  });

  it('returns 403 for app-only token without Automation role', () => {
    const result = requireWorkloadRole(makeAppOnlyClaims([]));
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });

  it('returns 403 for delegated token even with Automation role', () => {
    const result = requireWorkloadRole(makeClaims({ roles: ['Automation'], scp: 'access_as_user' }));
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });
});

// ── emitAuthorizationTelemetry ───────────────────────────────────────────

function createMockLogger(): ILogger & { events: Array<{ name: string; properties: Record<string, unknown> }> } {
  const events: Array<{ name: string; properties: Record<string, unknown> }> = [];
  return {
    events,
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    trackEvent: (name: string, properties: Record<string, unknown>) => { events.push({ name, properties }); },
    trackMetric: vi.fn(),
  };
}

describe('P9-G5-10 emitAuthorizationTelemetry', () => {
  it('emits authz.decision for normal authorization events', () => {
    const logger = createMockLogger();
    emitAuthorizationTelemetry(logger, {
      action: 'role_check',
      outcome: 'allowed',
      role: 'admin',
    });
    expect(logger.events).toHaveLength(1);
    expect(logger.events[0].name).toBe('authz.decision');
    expect(logger.events[0].properties.action).toBe('role_check');
    expect(logger.events[0].properties.outcome).toBe('allowed');
    expect(logger.events[0].properties.role).toBe('admin');
  });

  it('emits authz.break_glass when isBreakGlass is true', () => {
    const logger = createMockLogger();
    emitAuthorizationTelemetry(logger, {
      action: 'role_resolution',
      outcome: 'allowed',
      role: 'admin',
      isBreakGlass: true,
      callerOid: 'oid-bg',
      callerUpn: 'breakglass@hb.com',
    });
    expect(logger.events).toHaveLength(1);
    expect(logger.events[0].name).toBe('authz.break_glass');
    expect(logger.events[0].properties.isBreakGlass).toBe(true);
    expect(logger.events[0].properties.callerOid).toBe('oid-bg');
    expect(logger.events[0].properties.callerUpn).toBe('breakglass@hb.com');
  });

  it('includes only defined properties (no undefined values)', () => {
    const logger = createMockLogger();
    emitAuthorizationTelemetry(logger, {
      action: 'scope_check',
      outcome: 'denied',
    });
    expect(logger.events[0].properties).toEqual({
      action: 'scope_check',
      outcome: 'denied',
    });
  });

  it('includes correlationId when provided', () => {
    const logger = createMockLogger();
    emitAuthorizationTelemetry(logger, {
      action: 'ownership_check',
      outcome: 'allowed',
      method: 'oid',
      correlationId: 'corr-123',
    });
    expect(logger.events[0].properties.correlationId).toBe('corr-123');
    expect(logger.events[0].properties.method).toBe('oid');
  });
});
