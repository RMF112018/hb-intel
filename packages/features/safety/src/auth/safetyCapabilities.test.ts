import { describe, expect, it } from 'vitest';
import {
  SAFETY_ACTION_ROLES,
  SAFETY_ADMIN_ROLE,
  SAFETY_GLOBAL_OVERRIDE_ROLES,
  SAFETY_OPERATOR_ROLE,
  SAFETY_REVIEWER_ROLE,
  SAFETY_SUBMITTER_ROLE,
  resolveSafetyCapabilities,
  safetyCapabilitiesFromTokenRoles,
  safetyCapabilityReason,
} from './safetyCapabilities.js';

// Backend-authoritative role strings, redeclared locally so that drift
// between frontend and backend string identity is caught by this test.
// These must stay in sync with:
//   backend/functions/src/middleware/authorization.ts (SAFETY_*_ROLES + SAFETY_ACTION_ROLES)
const BACKEND_ROLE_STRINGS = {
  submitter: 'HBIntelSafetySubmitter',
  operator: 'HBIntelSafetyOperator',
  reviewer: 'HBIntelSafetyReviewer',
  admin: 'HBIntelSafetyAdmin',
  globalAdmin: 'Admin',
  globalHBIntelAdmin: 'HBIntelAdmin',
  globalBreakGlass: 'BreakGlass',
} as const;

describe('safetyCapabilities — role-string identity with backend', () => {
  it('safety-specific role strings match backend', () => {
    expect(SAFETY_SUBMITTER_ROLE).toBe(BACKEND_ROLE_STRINGS.submitter);
    expect(SAFETY_OPERATOR_ROLE).toBe(BACKEND_ROLE_STRINGS.operator);
    expect(SAFETY_REVIEWER_ROLE).toBe(BACKEND_ROLE_STRINGS.reviewer);
    expect(SAFETY_ADMIN_ROLE).toBe(BACKEND_ROLE_STRINGS.admin);
  });

  it('global override role strings match backend', () => {
    expect([...SAFETY_GLOBAL_OVERRIDE_ROLES]).toEqual([
      BACKEND_ROLE_STRINGS.globalAdmin,
      BACKEND_ROLE_STRINGS.globalHBIntelAdmin,
      BACKEND_ROLE_STRINGS.globalBreakGlass,
    ]);
  });

  it('matrix mirrors backend SAFETY_ACTION_ROLES exactly', () => {
    expect([...SAFETY_ACTION_ROLES.preview].sort()).toEqual(
      [
        BACKEND_ROLE_STRINGS.submitter,
        BACKEND_ROLE_STRINGS.operator,
        BACKEND_ROLE_STRINGS.reviewer,
        BACKEND_ROLE_STRINGS.admin,
        BACKEND_ROLE_STRINGS.globalAdmin,
        BACKEND_ROLE_STRINGS.globalHBIntelAdmin,
        BACKEND_ROLE_STRINGS.globalBreakGlass,
      ].sort(),
    );
    expect([...SAFETY_ACTION_ROLES.ingest].sort()).toEqual(
      [
        BACKEND_ROLE_STRINGS.submitter,
        BACKEND_ROLE_STRINGS.operator,
        BACKEND_ROLE_STRINGS.admin,
        BACKEND_ROLE_STRINGS.globalAdmin,
        BACKEND_ROLE_STRINGS.globalHBIntelAdmin,
        BACKEND_ROLE_STRINGS.globalBreakGlass,
      ].sort(),
    );
    expect([...SAFETY_ACTION_ROLES.replay].sort()).toEqual(
      [
        BACKEND_ROLE_STRINGS.operator,
        BACKEND_ROLE_STRINGS.reviewer,
        BACKEND_ROLE_STRINGS.admin,
        BACKEND_ROLE_STRINGS.globalAdmin,
        BACKEND_ROLE_STRINGS.globalHBIntelAdmin,
        BACKEND_ROLE_STRINGS.globalBreakGlass,
      ].sort(),
    );
  });

  it('matrix excludes Reviewer from ingest (backend invariant)', () => {
    expect(SAFETY_ACTION_ROLES.ingest).not.toContain(SAFETY_REVIEWER_ROLE);
  });

  it('matrix excludes Submitter from replay (backend invariant)', () => {
    expect(SAFETY_ACTION_ROLES.replay).not.toContain(SAFETY_SUBMITTER_ROLE);
  });
});

describe('resolveSafetyCapabilities', () => {
  it('null roles → all denied, state=unauthorized', () => {
    expect(resolveSafetyCapabilities(null)).toEqual({
      canPreview: false,
      canIngest: false,
      canReplay: false,
      state: 'unauthorized',
    });
  });

  it('undefined roles → all denied, state=unauthorized', () => {
    expect(resolveSafetyCapabilities(undefined)).toEqual({
      canPreview: false,
      canIngest: false,
      canReplay: false,
      state: 'unauthorized',
    });
  });

  it('empty roles array → all denied, state=unauthorized', () => {
    expect(resolveSafetyCapabilities([])).toEqual({
      canPreview: false,
      canIngest: false,
      canReplay: false,
      state: 'unauthorized',
    });
  });

  it('unknown role → all denied (state=authorized — qualifying matrix yielded zero matches but token authority was present)', () => {
    expect(resolveSafetyCapabilities(['SomeOtherRole'])).toEqual({
      canPreview: false,
      canIngest: false,
      canReplay: false,
      state: 'authorized',
    });
  });

  it('Submitter → preview + ingest, no replay', () => {
    expect(resolveSafetyCapabilities([SAFETY_SUBMITTER_ROLE])).toEqual({
      canPreview: true,
      canIngest: true,
      canReplay: false,
      state: 'authorized',
    });
  });

  it('Operator → preview + ingest + replay', () => {
    expect(resolveSafetyCapabilities([SAFETY_OPERATOR_ROLE])).toEqual({
      canPreview: true,
      canIngest: true,
      canReplay: true,
      state: 'authorized',
    });
  });

  it('Reviewer → preview + replay, no ingest', () => {
    expect(resolveSafetyCapabilities([SAFETY_REVIEWER_ROLE])).toEqual({
      canPreview: true,
      canIngest: false,
      canReplay: true,
      state: 'authorized',
    });
  });

  it('Safety Admin → full access', () => {
    expect(resolveSafetyCapabilities([SAFETY_ADMIN_ROLE])).toEqual({
      canPreview: true,
      canIngest: true,
      canReplay: true,
      state: 'authorized',
    });
  });

  it.each(SAFETY_GLOBAL_OVERRIDE_ROLES)(
    'global override role %s → full access',
    (role) => {
      expect(resolveSafetyCapabilities([role])).toEqual({
        canPreview: true,
        canIngest: true,
        canReplay: true,
        state: 'authorized',
      });
    },
  );

  it('combined roles union-merge capabilities (Submitter + Reviewer)', () => {
    expect(
      resolveSafetyCapabilities([SAFETY_SUBMITTER_ROLE, SAFETY_REVIEWER_ROLE]),
    ).toEqual({
      canPreview: true,
      canIngest: true,
      canReplay: true,
      state: 'authorized',
    });
  });

  it('unrecognized role mixed with Submitter keeps Submitter capabilities', () => {
    expect(
      resolveSafetyCapabilities(['AnotherRole', SAFETY_SUBMITTER_ROLE]),
    ).toEqual({
      canPreview: true,
      canIngest: true,
      canReplay: false,
      state: 'authorized',
    });
  });
});

describe('safetyCapabilitiesFromTokenRoles', () => {
  it('Admin role from token → full access', () => {
    expect(safetyCapabilitiesFromTokenRoles(['Admin'])).toEqual({
      canPreview: true,
      canIngest: true,
      canReplay: true,
      state: 'authorized',
    });
  });

  it('HBIntelAdmin from token → full access', () => {
    expect(safetyCapabilitiesFromTokenRoles(['HBIntelAdmin'])).toEqual({
      canPreview: true,
      canIngest: true,
      canReplay: true,
      state: 'authorized',
    });
  });

  it('BreakGlass from token → full access', () => {
    expect(safetyCapabilitiesFromTokenRoles(['BreakGlass'])).toEqual({
      canPreview: true,
      canIngest: true,
      canReplay: true,
      state: 'authorized',
    });
  });

  it('HBIntelSafetySubmitter → preview + ingest only', () => {
    expect(safetyCapabilitiesFromTokenRoles([SAFETY_SUBMITTER_ROLE])).toEqual({
      canPreview: true,
      canIngest: true,
      canReplay: false,
      state: 'authorized',
    });
  });

  it('HBIntelSafetyReviewer → preview + replay only', () => {
    expect(safetyCapabilitiesFromTokenRoles([SAFETY_REVIEWER_ROLE])).toEqual({
      canPreview: true,
      canIngest: false,
      canReplay: true,
      state: 'authorized',
    });
  });

  it('empty token roles → unauthorized', () => {
    expect(safetyCapabilitiesFromTokenRoles([])).toEqual({
      canPreview: false,
      canIngest: false,
      canReplay: false,
      state: 'unauthorized',
    });
  });
});

describe('safetyCapabilityReason', () => {
  it('returns the default unauthorized message when state is omitted', () => {
    expect(safetyCapabilityReason('canPreview')).toMatch(/authorized/i);
    expect(safetyCapabilityReason('canIngest')).toMatch(/authorized/i);
    expect(safetyCapabilityReason('canReplay')).toMatch(/authorized/i);
  });

  it('mentions the administrator escalation path on the default message (honest CTA)', () => {
    expect(safetyCapabilityReason('canPreview')).toMatch(/administrator/i);
    expect(safetyCapabilityReason('canIngest')).toMatch(/administrator/i);
    expect(safetyCapabilityReason('canReplay')).toMatch(/administrator/i);
  });

  it('returns a distinct message for state=token-unavailable', () => {
    const msg = safetyCapabilityReason('canPreview', 'token-unavailable');
    expect(msg).toMatch(/token/i);
    expect(msg).toMatch(/SharePoint API access/i);
    expect(msg).not.toMatch(/not authorized to preview/i);
  });

  it('returns a distinct message for state=scope-missing', () => {
    const msg = safetyCapabilityReason('canIngest', 'scope-missing');
    expect(msg).toMatch(/access_as_user/);
  });

  it('returns a distinct message for state=pending', () => {
    expect(safetyCapabilityReason('canReplay', 'pending')).toMatch(/Resolving/i);
  });

  it('falls back to the default message for state=authorized or unauthorized', () => {
    expect(safetyCapabilityReason('canPreview', 'authorized')).toMatch(/not authorized to preview/i);
    expect(safetyCapabilityReason('canPreview', 'unauthorized')).toMatch(/not authorized to preview/i);
  });
});
