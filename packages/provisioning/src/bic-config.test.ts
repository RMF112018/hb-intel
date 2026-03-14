import { describe, expect, it } from 'vitest';
import type { IProjectSetupRequest } from '@hbc/models';
import {
  PROJECT_SETUP_BIC_CONFIG,
  PROJECT_SETUP_ACTION_MAP,
  PROJECT_SETUP_ESCALATED_FAILURE_ACTION,
  PROJECT_SETUP_URGENCY_MAP,
  deriveCurrentOwner,
  BIC_ROLE_CONTROLLER,
  BIC_ROLE_REQUESTER,
  BIC_ROLE_ADMIN,
  BIC_ROLE_PROJECT_LEAD,
} from './bic-config.js';

function makeRequest(overrides?: Partial<IProjectSetupRequest>): IProjectSetupRequest {
  return {
    requestId: 'req-1',
    projectId: 'proj-1',
    projectName: 'Test Project',
    projectLocation: 'New York, NY',
    projectType: 'Ground-Up',
    projectStage: 'Pursuit',
    submittedBy: 'coordinator@example.com',
    submittedAt: '2026-03-01T00:00:00.000Z',
    state: 'Submitted',
    groupMembers: ['member@example.com'],
    department: 'commercial',
    projectLeadId: 'lead@example.com',
    ...overrides,
  };
}

// ─── deriveCurrentOwner ──────────────────────────────────────────────────────

// TC-OWN-02, TC-OWN-03: Ownership resolution for null/failed states
describe('deriveCurrentOwner', () => {
  it('returns Controller for Submitted', () => {
    const owner = deriveCurrentOwner(makeRequest({ state: 'Submitted' }));
    expect(owner).not.toBeNull();
    expect(owner!.role).toBe(BIC_ROLE_CONTROLLER);
  });

  it('returns Controller for UnderReview', () => {
    const owner = deriveCurrentOwner(makeRequest({ state: 'UnderReview' }));
    expect(owner!.role).toBe(BIC_ROLE_CONTROLLER);
  });

  it('returns Requester for NeedsClarification', () => {
    const owner = deriveCurrentOwner(makeRequest({ state: 'NeedsClarification' }));
    expect(owner!.role).toBe(BIC_ROLE_REQUESTER);
    expect(owner!.userId).toBe('coordinator@example.com');
  });

  it('returns Controller for AwaitingExternalSetup', () => {
    const owner = deriveCurrentOwner(makeRequest({ state: 'AwaitingExternalSetup' }));
    expect(owner!.role).toBe(BIC_ROLE_CONTROLLER);
  });

  // TC-OWN-02: null-owner states
  it('returns null for ReadyToProvision (system-owned)', () => {
    expect(deriveCurrentOwner(makeRequest({ state: 'ReadyToProvision' }))).toBeNull();
  });

  // TC-OWN-02: null-owner states
  it('returns null for Provisioning (system-owned)', () => {
    expect(deriveCurrentOwner(makeRequest({ state: 'Provisioning' }))).toBeNull();
  });

  it('returns Project Lead for Completed', () => {
    const owner = deriveCurrentOwner(makeRequest({ state: 'Completed' }));
    expect(owner!.role).toBe(BIC_ROLE_PROJECT_LEAD);
    expect(owner!.userId).toBe('lead@example.com');
  });

  it('falls back to submittedBy when projectLeadId is missing in Completed', () => {
    const owner = deriveCurrentOwner(
      makeRequest({ state: 'Completed', projectLeadId: undefined }),
    );
    expect(owner!.userId).toBe('coordinator@example.com');
  });

  // TC-OWN-03: Failed ownership
  it('returns Admin for Failed', () => {
    const owner = deriveCurrentOwner(makeRequest({ state: 'Failed' }));
    expect(owner!.role).toBe(BIC_ROLE_ADMIN);
  });

  // TC-OWN-03: Failed ownership with escalation
  it('returns Admin for Failed with requesterRetryUsed', () => {
    const owner = deriveCurrentOwner(
      makeRequest({ state: 'Failed', requesterRetryUsed: true }),
    );
    expect(owner!.role).toBe(BIC_ROLE_ADMIN);
  });
});

// ─── resolveExpectedAction ───────────────────────────────────────────────────

// TC-OWN-01: 8-state lifecycle action map coverage
describe('resolveExpectedAction', () => {
  it('returns canonical action string for each lifecycle state', () => {
    // TC-OWN-01: Verify exactly 8 lifecycle states
    expect(Object.keys(PROJECT_SETUP_ACTION_MAP)).toHaveLength(8);
    const states = Object.keys(PROJECT_SETUP_ACTION_MAP) as Array<
      keyof typeof PROJECT_SETUP_ACTION_MAP
    >;
    for (const state of states) {
      const action = PROJECT_SETUP_BIC_CONFIG.resolveExpectedAction(makeRequest({ state }));
      expect(action).toBe(PROJECT_SETUP_ACTION_MAP[state]);
    }
  });

  it('returns escalated failure action when requesterRetryUsed', () => {
    const action = PROJECT_SETUP_BIC_CONFIG.resolveExpectedAction(
      makeRequest({ state: 'Failed', requesterRetryUsed: true }),
    );
    expect(action).toBe(PROJECT_SETUP_ESCALATED_FAILURE_ACTION);
  });

  it('returns standard failure action when retry is available', () => {
    const action = PROJECT_SETUP_BIC_CONFIG.resolveExpectedAction(
      makeRequest({ state: 'Failed', requesterRetryUsed: false }),
    );
    expect(action).toBe(PROJECT_SETUP_ACTION_MAP['Failed']);
  });
});

// ─── resolveDueDate ──────────────────────────────────────────────────────────

describe('resolveDueDate', () => {
  it('returns 3-day advisory for NeedsClarification with timestamp', () => {
    const due = PROJECT_SETUP_BIC_CONFIG.resolveDueDate(
      makeRequest({
        state: 'NeedsClarification',
        clarificationRequestedAt: '2026-03-10T12:00:00.000Z',
      }),
    );
    expect(due).not.toBeNull();
    const dueDate = new Date(due!);
    expect(dueDate.getUTCDate()).toBe(13); // 10 + 3
  });

  it('returns null for NeedsClarification without timestamp', () => {
    expect(
      PROJECT_SETUP_BIC_CONFIG.resolveDueDate(makeRequest({ state: 'NeedsClarification' })),
    ).toBeNull();
  });

  it('returns null for other states', () => {
    expect(
      PROJECT_SETUP_BIC_CONFIG.resolveDueDate(makeRequest({ state: 'Submitted' })),
    ).toBeNull();
    expect(
      PROJECT_SETUP_BIC_CONFIG.resolveDueDate(makeRequest({ state: 'Completed' })),
    ).toBeNull();
  });
});

// ─── resolveIsBlocked / resolveBlockedReason ─────────────────────────────────

// TC-OWN-05: Blocked state resolution
describe('resolveIsBlocked', () => {
  it('returns true for AwaitingExternalSetup', () => {
    expect(
      PROJECT_SETUP_BIC_CONFIG.resolveIsBlocked(makeRequest({ state: 'AwaitingExternalSetup' })),
    ).toBe(true);
  });

  it('returns true for Failed with requesterRetryUsed', () => {
    expect(
      PROJECT_SETUP_BIC_CONFIG.resolveIsBlocked(
        makeRequest({ state: 'Failed', requesterRetryUsed: true }),
      ),
    ).toBe(true);
  });

  it('returns false for Failed without requesterRetryUsed', () => {
    expect(
      PROJECT_SETUP_BIC_CONFIG.resolveIsBlocked(makeRequest({ state: 'Failed' })),
    ).toBe(false);
  });

  it('returns false for non-blocked states', () => {
    expect(
      PROJECT_SETUP_BIC_CONFIG.resolveIsBlocked(makeRequest({ state: 'Submitted' })),
    ).toBe(false);
    expect(
      PROJECT_SETUP_BIC_CONFIG.resolveIsBlocked(makeRequest({ state: 'Completed' })),
    ).toBe(false);
  });
});

describe('resolveBlockedReason', () => {
  it('returns IT/security reason for AwaitingExternalSetup', () => {
    const reason = PROJECT_SETUP_BIC_CONFIG.resolveBlockedReason(
      makeRequest({ state: 'AwaitingExternalSetup' }),
    );
    expect(reason).toContain('external IT/security');
  });

  it('returns retry exhausted reason for escalated failure', () => {
    const reason = PROJECT_SETUP_BIC_CONFIG.resolveBlockedReason(
      makeRequest({ state: 'Failed', requesterRetryUsed: true }),
    );
    expect(reason).toContain('retry has been used');
  });

  it('returns null for non-blocked states', () => {
    expect(
      PROJECT_SETUP_BIC_CONFIG.resolveBlockedReason(makeRequest({ state: 'Submitted' })),
    ).toBeNull();
  });
});

// ─── resolveNextOwner / resolveEscalationOwner ───────────────────────────────

describe('resolveNextOwner', () => {
  it('returns Controller for Submitted', () => {
    const next = PROJECT_SETUP_BIC_CONFIG.resolveNextOwner(makeRequest({ state: 'Submitted' }));
    expect(next!.role).toBe(BIC_ROLE_CONTROLLER);
  });

  it('returns Project Lead for Provisioning', () => {
    const next = PROJECT_SETUP_BIC_CONFIG.resolveNextOwner(
      makeRequest({ state: 'Provisioning' }),
    );
    expect(next!.role).toBe(BIC_ROLE_PROJECT_LEAD);
  });

  it('returns null for Completed (terminal)', () => {
    expect(
      PROJECT_SETUP_BIC_CONFIG.resolveNextOwner(makeRequest({ state: 'Completed' })),
    ).toBeNull();
  });
});

describe('resolveEscalationOwner', () => {
  it('always returns Admin', () => {
    const escalation = PROJECT_SETUP_BIC_CONFIG.resolveEscalationOwner(makeRequest());
    expect(escalation!.role).toBe(BIC_ROLE_ADMIN);
  });
});

// ─── Config shape ────────────────────────────────────────────────────────────

describe('PROJECT_SETUP_BIC_CONFIG shape', () => {
  it('uses workflow-state-derived ownership model', () => {
    expect(PROJECT_SETUP_BIC_CONFIG.ownershipModel).toBe('workflow-state-derived');
  });

  it('implements all 8 required resolvers', () => {
    expect(typeof PROJECT_SETUP_BIC_CONFIG.resolveCurrentOwner).toBe('function');
    expect(typeof PROJECT_SETUP_BIC_CONFIG.resolveExpectedAction).toBe('function');
    expect(typeof PROJECT_SETUP_BIC_CONFIG.resolveDueDate).toBe('function');
    expect(typeof PROJECT_SETUP_BIC_CONFIG.resolveIsBlocked).toBe('function');
    expect(typeof PROJECT_SETUP_BIC_CONFIG.resolveBlockedReason).toBe('function');
    expect(typeof PROJECT_SETUP_BIC_CONFIG.resolvePreviousOwner).toBe('function');
    expect(typeof PROJECT_SETUP_BIC_CONFIG.resolveNextOwner).toBe('function');
    expect(typeof PROJECT_SETUP_BIC_CONFIG.resolveEscalationOwner).toBe('function');
  });
});

// ─── Urgency map ─────────────────────────────────────────────────────────────

describe('PROJECT_SETUP_URGENCY_MAP', () => {
  it('maps NeedsClarification to immediate', () => {
    expect(PROJECT_SETUP_URGENCY_MAP['NeedsClarification']).toBe('immediate');
  });

  it('maps Failed to immediate', () => {
    expect(PROJECT_SETUP_URGENCY_MAP['Failed']).toBe('immediate');
  });

  it('maps system-owned states to null', () => {
    expect(PROJECT_SETUP_URGENCY_MAP['ReadyToProvision']).toBeNull();
    expect(PROJECT_SETUP_URGENCY_MAP['Provisioning']).toBeNull();
  });

  it('maps Completed to upcoming', () => {
    expect(PROJECT_SETUP_URGENCY_MAP['Completed']).toBe('upcoming');
  });
});
