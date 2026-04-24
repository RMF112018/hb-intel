import { describe, expect, it } from 'vitest';
import {
  SAFETY_ACTION_ROLES,
  SAFETY_ADMIN_ROLE,
  SAFETY_GLOBAL_OVERRIDE_ROLES,
  SAFETY_OPERATOR_ROLE,
  SAFETY_REVIEWER_ROLE,
  SAFETY_SUBMITTER_ROLE,
  resolveSafetyCapabilities,
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
  it('null roles → all denied', () => {
    expect(resolveSafetyCapabilities(null)).toEqual({
      canPreview: false,
      canIngest: false,
      canReplay: false,
    });
  });

  it('undefined roles → all denied', () => {
    expect(resolveSafetyCapabilities(undefined)).toEqual({
      canPreview: false,
      canIngest: false,
      canReplay: false,
    });
  });

  it('empty roles array → all denied', () => {
    expect(resolveSafetyCapabilities([])).toEqual({
      canPreview: false,
      canIngest: false,
      canReplay: false,
    });
  });

  it('unknown role → all denied', () => {
    expect(resolveSafetyCapabilities(['SomeOtherRole'])).toEqual({
      canPreview: false,
      canIngest: false,
      canReplay: false,
    });
  });

  it('Submitter → preview + ingest, no replay', () => {
    expect(resolveSafetyCapabilities([SAFETY_SUBMITTER_ROLE])).toEqual({
      canPreview: true,
      canIngest: true,
      canReplay: false,
    });
  });

  it('Operator → preview + ingest + replay', () => {
    expect(resolveSafetyCapabilities([SAFETY_OPERATOR_ROLE])).toEqual({
      canPreview: true,
      canIngest: true,
      canReplay: true,
    });
  });

  it('Reviewer → preview + replay, no ingest', () => {
    expect(resolveSafetyCapabilities([SAFETY_REVIEWER_ROLE])).toEqual({
      canPreview: true,
      canIngest: false,
      canReplay: true,
    });
  });

  it('Safety Admin → full access', () => {
    expect(resolveSafetyCapabilities([SAFETY_ADMIN_ROLE])).toEqual({
      canPreview: true,
      canIngest: true,
      canReplay: true,
    });
  });

  it.each(SAFETY_GLOBAL_OVERRIDE_ROLES)(
    'global override role %s → full access',
    (role) => {
      expect(resolveSafetyCapabilities([role])).toEqual({
        canPreview: true,
        canIngest: true,
        canReplay: true,
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
    });
  });

  it('unrecognized role mixed with Submitter keeps Submitter capabilities', () => {
    expect(
      resolveSafetyCapabilities(['AnotherRole', SAFETY_SUBMITTER_ROLE]),
    ).toEqual({
      canPreview: true,
      canIngest: true,
      canReplay: false,
    });
  });
});

describe('safetyCapabilityReason', () => {
  it('returns non-empty text for each capability key', () => {
    expect(safetyCapabilityReason('canPreview')).toMatch(/authorized/i);
    expect(safetyCapabilityReason('canIngest')).toMatch(/authorized/i);
    expect(safetyCapabilityReason('canReplay')).toMatch(/authorized/i);
  });

  it('mentions the administrator escalation path (honest CTA)', () => {
    expect(safetyCapabilityReason('canPreview')).toMatch(/administrator/i);
    expect(safetyCapabilityReason('canIngest')).toMatch(/administrator/i);
    expect(safetyCapabilityReason('canReplay')).toMatch(/administrator/i);
  });
});
