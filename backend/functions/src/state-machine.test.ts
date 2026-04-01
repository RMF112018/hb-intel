import { describe, expect, it } from 'vitest';
import {
  STATE_TRANSITIONS,
  STATE_NOTIFICATION_TARGETS,
  isValidTransition,
  resolveRequestRole,
  isAuthorizedTransition,
} from './state-machine.js';
import type { IProjectSetupRequest, ProjectSetupRequestState } from '@hbc/models';
import type { IValidatedClaims } from './middleware/validateToken.js';

/**
 * D-PH6-15 Layer 1 backend state-machine verification.
 * Ensures API-side transition rules match the documented lifecycle contract.
 */
describe('D-PH6-15 backend isValidTransition', () => {
  const states = Object.keys(STATE_TRANSITIONS) as ProjectSetupRequestState[];

  it('accepts all documented transitions', () => {
    for (const from of states) {
      for (const to of STATE_TRANSITIONS[from]) {
        expect(isValidTransition(from, to)).toBe(true);
      }
    }
  });

  it('rejects undocumented transitions', () => {
    for (const from of states) {
      for (const to of states) {
        if (!STATE_TRANSITIONS[from].includes(to)) {
          expect(isValidTransition(from, to)).toBe(false);
        }
      }
    }
  });

  it('exposes non-empty notification targets for actionable destination states', () => {
    expect(STATE_NOTIFICATION_TARGETS.NeedsClarification).toEqual(['submitter']);
    expect(STATE_NOTIFICATION_TARGETS.ReadyToProvision).toEqual(['controller']);
    expect(STATE_NOTIFICATION_TARGETS.Provisioning).toEqual(['group']);
    expect(STATE_NOTIFICATION_TARGETS.Completed).toEqual(['group']);
    expect(STATE_NOTIFICATION_TARGETS.Failed).toEqual(['controller', 'submitter']);
  });
});

// ── P9-G5-06: Claims-based role resolution ──────────────────────────────────

function makeClaims(overrides: Partial<IValidatedClaims> = {}): IValidatedClaims {
  return { upn: 'user@hb.com', oid: 'oid-user', roles: [], displayName: 'User', ...overrides };
}

const baseRequest: IProjectSetupRequest = {
  requestId: 'req-1',
  projectId: 'proj-1',
  projectName: 'Test Project',
  projectLocation: '123 Main St',
  projectType: 'Commercial',
  projectStage: 'Pursuit',
  submittedBy: 'submitter@hb.com',
  submittedByOid: 'oid-submitter',
  submittedAt: '2026-01-01T00:00:00Z',
  state: 'Submitted',
  groupMembers: ['member@hb.com'],
  retryCount: 0,
};

describe('P9-G5-06 resolveRequestRole (claims-based)', () => {
  it('returns admin for Admin app-role', () => {
    expect(resolveRequestRole(makeClaims({ roles: ['Admin'] }), baseRequest)).toBe('admin');
  });

  it('returns admin for HBIntelAdmin app-role', () => {
    expect(resolveRequestRole(makeClaims({ roles: ['HBIntelAdmin'] }), baseRequest)).toBe('admin');
  });

  it('returns admin for BreakGlass app-role', () => {
    expect(resolveRequestRole(makeClaims({ roles: ['BreakGlass'] }), baseRequest)).toBe('admin');
  });

  it('returns controller for Controller app-role', () => {
    expect(resolveRequestRole(makeClaims({ roles: ['Controller'] }), baseRequest)).toBe('controller');
  });

  it('returns controller for HBIntelController app-role', () => {
    expect(resolveRequestRole(makeClaims({ roles: ['HBIntelController'] }), baseRequest)).toBe('controller');
  });

  it('returns submitter when oid matches submittedByOid', () => {
    expect(resolveRequestRole(makeClaims({ oid: 'oid-submitter' }), baseRequest)).toBe('submitter');
  });

  it('returns submitter via UPN fallback for legacy records without oid', () => {
    const legacyRequest = { ...baseRequest, submittedByOid: undefined };
    expect(resolveRequestRole(makeClaims({ upn: 'submitter@hb.com', oid: 'oid-different' }), legacyRequest)).toBe('submitter');
  });

  it('returns system for unrelated caller with no matching role', () => {
    expect(resolveRequestRole(makeClaims({ upn: 'other@hb.com', oid: 'oid-other' }), baseRequest)).toBe('system');
  });

  it('admin takes priority over submitter ownership', () => {
    expect(resolveRequestRole(makeClaims({ roles: ['Admin'], oid: 'oid-submitter' }), baseRequest)).toBe('admin');
  });

  it('controller takes priority over submitter ownership', () => {
    expect(resolveRequestRole(makeClaims({ roles: ['Controller'], oid: 'oid-submitter' }), baseRequest)).toBe('controller');
  });
});

describe('P9-G5-06 isAuthorizedTransition (unchanged matrix)', () => {
  it('admin can perform any valid transition', () => {
    expect(isAuthorizedTransition('admin', 'Submitted', 'UnderReview')).toBe(true);
    expect(isAuthorizedTransition('admin', 'UnderReview', 'ReadyToProvision')).toBe(true);
    expect(isAuthorizedTransition('admin', 'Failed', 'UnderReview')).toBe(true);
  });

  it('controller can advance review states', () => {
    expect(isAuthorizedTransition('controller', 'Submitted', 'UnderReview')).toBe(true);
    expect(isAuthorizedTransition('controller', 'UnderReview', 'NeedsClarification')).toBe(true);
    expect(isAuthorizedTransition('controller', 'UnderReview', 'ReadyToProvision')).toBe(true);
  });

  it('controller cannot perform submitter-only transitions', () => {
    expect(isAuthorizedTransition('controller', 'NeedsClarification', 'UnderReview')).toBe(false);
  });

  it('submitter can only resubmit from NeedsClarification', () => {
    expect(isAuthorizedTransition('submitter', 'NeedsClarification', 'UnderReview')).toBe(true);
    expect(isAuthorizedTransition('submitter', 'Submitted', 'UnderReview')).toBe(false);
  });

  it('system role handles provisioning transitions', () => {
    expect(isAuthorizedTransition('system', 'ReadyToProvision', 'Provisioning')).toBe(true);
    expect(isAuthorizedTransition('system', 'Provisioning', 'Completed')).toBe(true);
  });
});
