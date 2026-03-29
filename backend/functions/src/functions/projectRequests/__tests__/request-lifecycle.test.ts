import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest';
import type { IProjectSetupRequest } from '@hbc/models';
import { MockProjectRequestsRepository } from '../../../services/project-requests-repository.js';
import {
  isValidTransition,
  resolveRequestRole,
  isAuthorizedTransition,
  deriveProjectYear,
} from '../../../state-machine.js';

/**
 * D-PH6-08 / Prompt 04+05: Request lifecycle unit tests.
 * Covers user-command flows, validation, state transitions,
 * role-based authorization, Year derivation, and persistence.
 */

// ── Helpers ─────────────────────────────────────────────────────────────

function makeRequest(overrides?: Partial<IProjectSetupRequest>): IProjectSetupRequest {
  return {
    requestId: 'req-1',
    projectId: 'proj-1',
    projectName: 'Summit Tower',
    projectLocation: 'Denver, CO',
    projectType: 'Commercial',
    projectStage: 'Active',
    submittedBy: 'coordinator@hb.com',
    submittedAt: '2026-01-15T12:00:00.000Z',
    state: 'Submitted',
    groupMembers: ['team@hb.com'],
    retryCount: 0,
    ...overrides,
  };
}

// ── A. User-command flow tests ──────────────────────────────────────────

describe('Request lifecycle — user-command flows', () => {
  let repo: MockProjectRequestsRepository;

  beforeEach(() => {
    repo = new MockProjectRequestsRepository();
  });

  it('A1: persists all Estimating form fields through submit→read cycle', async () => {
    const fullRequest = makeRequest({
      department: 'commercial',
      groupLeaders: ['lead@hb.com'],
      estimatedValue: 5_000_000,
      clientName: 'Acme Corp',
      startDate: '2026-06-01',
      contractType: 'GMP',
      projectLeadId: 'plead@hb.com',
      viewerUPNs: ['viewer1@hb.com', 'viewer2@hb.com'],
      addOns: ['safety-plan', 'quality-plan'],
      year: 2026,
    });

    await repo.upsertRequest(fullRequest);
    const retrieved = await repo.getRequest('req-1');

    expect(retrieved).not.toBeNull();
    expect(retrieved!.department).toBe('commercial');
    expect(retrieved!.groupLeaders).toEqual(['lead@hb.com']);
    expect(retrieved!.estimatedValue).toBe(5_000_000);
    expect(retrieved!.clientName).toBe('Acme Corp');
    expect(retrieved!.startDate).toBe('2026-06-01');
    expect(retrieved!.contractType).toBe('GMP');
    expect(retrieved!.projectLeadId).toBe('plead@hb.com');
    expect(retrieved!.viewerUPNs).toEqual(['viewer1@hb.com', 'viewer2@hb.com']);
    expect(retrieved!.addOns).toEqual(['safety-plan', 'quality-plan']);
    expect(retrieved!.year).toBe(2026);
  });

  it('A2: state advance from UnderReview to ReadyToProvision stores project number', async () => {
    const request = makeRequest({ state: 'UnderReview' });
    await repo.upsertRequest(request);

    const existing = await repo.getRequest('req-1');
    existing!.state = 'ReadyToProvision';
    existing!.projectNumber = '25-001-01';
    await repo.upsertRequest(existing!);

    const updated = await repo.getRequest('req-1');
    expect(updated!.state).toBe('ReadyToProvision');
    expect(updated!.projectNumber).toBe('25-001-01');
  });

  it('A3: clarification note persisted on state advance', async () => {
    const request = makeRequest({ state: 'UnderReview' });
    await repo.upsertRequest(request);

    const existing = await repo.getRequest('req-1');
    existing!.state = 'NeedsClarification';
    existing!.clarificationNote = 'Please clarify budget allocation.';
    existing!.clarificationRequestedAt = '2026-01-16T10:00:00.000Z';
    await repo.upsertRequest(existing!);

    const updated = await repo.getRequest('req-1');
    expect(updated!.state).toBe('NeedsClarification');
    expect(updated!.clarificationNote).toBe('Please clarify budget allocation.');
    expect(updated!.clarificationRequestedAt).toBe('2026-01-16T10:00:00.000Z');
  });

  it('A4: hold transition persists AwaitingExternalSetup state', async () => {
    const request = makeRequest({ state: 'UnderReview' });
    await repo.upsertRequest(request);

    const existing = await repo.getRequest('req-1');
    existing!.state = 'AwaitingExternalSetup';
    await repo.upsertRequest(existing!);

    const updated = await repo.getRequest('req-1');
    expect(updated!.state).toBe('AwaitingExternalSetup');
  });

  it('A5: list requests with state filter returns only matching records', async () => {
    await repo.upsertRequest(makeRequest({ requestId: 'r1', state: 'Submitted' }));
    await repo.upsertRequest(makeRequest({ requestId: 'r2', state: 'UnderReview' }));
    await repo.upsertRequest(makeRequest({ requestId: 'r3', state: 'Submitted' }));

    const submitted = await repo.listRequests('Submitted');
    expect(submitted).toHaveLength(2);
    expect(submitted.every((r) => r.state === 'Submitted')).toBe(true);

    const underReview = await repo.listRequests('UnderReview');
    expect(underReview).toHaveLength(1);

    const all = await repo.listRequests();
    expect(all).toHaveLength(3);
  });

  it('A6: getRequest returns null for non-existent request', async () => {
    const result = await repo.getRequest('non-existent');
    expect(result).toBeNull();
  });

  it('A7: upsert overwrites existing record with same requestId', async () => {
    await repo.upsertRequest(makeRequest({ requestId: 'r1', projectName: 'Original' }));
    await repo.upsertRequest(makeRequest({ requestId: 'r1', projectName: 'Updated' }));

    const result = await repo.getRequest('r1');
    expect(result!.projectName).toBe('Updated');

    const all = await repo.listRequests();
    expect(all).toHaveLength(1);
  });
});

// ── B. Invalid user-entry / state-transition validation ─────────────────

describe('Request lifecycle — state-transition validation', () => {
  it('B1: Submitted → UnderReview is valid', () => {
    expect(isValidTransition('Submitted', 'UnderReview')).toBe(true);
  });

  it('B2: UnderReview → ReadyToProvision is valid', () => {
    expect(isValidTransition('UnderReview', 'ReadyToProvision')).toBe(true);
  });

  it('B3: UnderReview → NeedsClarification is valid', () => {
    expect(isValidTransition('UnderReview', 'NeedsClarification')).toBe(true);
  });

  it('B4: UnderReview → AwaitingExternalSetup is valid', () => {
    expect(isValidTransition('UnderReview', 'AwaitingExternalSetup')).toBe(true);
  });

  it('B5: Submitted → ReadyToProvision is INVALID (skips review)', () => {
    expect(isValidTransition('Submitted', 'ReadyToProvision')).toBe(false);
  });

  it('B6: Completed → any state is INVALID (terminal)', () => {
    expect(isValidTransition('Completed', 'UnderReview')).toBe(false);
    expect(isValidTransition('Completed', 'Submitted')).toBe(false);
    expect(isValidTransition('Completed', 'Failed')).toBe(false);
  });

  it('B7: Failed → UnderReview is valid (reopen after remediation)', () => {
    expect(isValidTransition('Failed', 'UnderReview')).toBe(true);
  });

  it('B8: Failed → Completed is INVALID (cannot skip provisioning)', () => {
    expect(isValidTransition('Failed', 'Completed')).toBe(false);
  });

  it('B9: NeedsClarification → UnderReview is valid (resubmit)', () => {
    expect(isValidTransition('NeedsClarification', 'UnderReview')).toBe(true);
  });

  it('B10: NeedsClarification → ReadyToProvision is INVALID', () => {
    expect(isValidTransition('NeedsClarification', 'ReadyToProvision')).toBe(false);
  });

  it('B11: AwaitingExternalSetup → ReadyToProvision is valid', () => {
    expect(isValidTransition('AwaitingExternalSetup', 'ReadyToProvision')).toBe(true);
  });

  it('B12: ReadyToProvision → Provisioning is valid', () => {
    expect(isValidTransition('ReadyToProvision', 'Provisioning')).toBe(true);
  });

  it('B13: Provisioning → Completed is valid', () => {
    expect(isValidTransition('Provisioning', 'Completed')).toBe(true);
  });

  it('B14: Provisioning → Failed is valid', () => {
    expect(isValidTransition('Provisioning', 'Failed')).toBe(true);
  });
});

// ── C. Role-based authorization ─────────────────────────────────────────

describe('Role-based authorization', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.ADMIN_UPNS = 'admin@hb.com';
    process.env.CONTROLLER_UPNS = 'controller@hb.com, ctrl2@hb.com';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('resolveRequestRole', () => {
    it('C1: identifies admin role', () => {
      const request = makeRequest({ submittedBy: 'other@hb.com' });
      expect(resolveRequestRole('admin@hb.com', request)).toBe('admin');
    });

    it('C2: identifies controller role', () => {
      const request = makeRequest({ submittedBy: 'other@hb.com' });
      expect(resolveRequestRole('controller@hb.com', request)).toBe('controller');
    });

    it('C3: identifies submitter role', () => {
      const request = makeRequest({ submittedBy: 'coordinator@hb.com' });
      expect(resolveRequestRole('coordinator@hb.com', request)).toBe('submitter');
    });

    it('C4: returns system for unknown caller', () => {
      const request = makeRequest({ submittedBy: 'other@hb.com' });
      expect(resolveRequestRole('stranger@hb.com', request)).toBe('system');
    });

    it('C5: admin takes priority over submitter', () => {
      const request = makeRequest({ submittedBy: 'admin@hb.com' });
      expect(resolveRequestRole('admin@hb.com', request)).toBe('admin');
    });

    it('C6: case-insensitive matching', () => {
      const request = makeRequest({ submittedBy: 'other@hb.com' });
      expect(resolveRequestRole('Admin@HB.com', request)).toBe('admin');
    });
  });

  describe('isAuthorizedTransition', () => {
    it('C7: admin can perform any transition', () => {
      expect(isAuthorizedTransition('admin', 'Submitted', 'UnderReview')).toBe(true);
      expect(isAuthorizedTransition('admin', 'NeedsClarification', 'UnderReview')).toBe(true);
      expect(isAuthorizedTransition('admin', 'UnderReview', 'ReadyToProvision')).toBe(true);
    });

    it('C8: controller can advance review states', () => {
      expect(isAuthorizedTransition('controller', 'Submitted', 'UnderReview')).toBe(true);
      expect(isAuthorizedTransition('controller', 'UnderReview', 'ReadyToProvision')).toBe(true);
      expect(isAuthorizedTransition('controller', 'UnderReview', 'NeedsClarification')).toBe(true);
    });

    it('C9: submitter can only resubmit from NeedsClarification', () => {
      expect(isAuthorizedTransition('submitter', 'NeedsClarification', 'UnderReview')).toBe(true);
      expect(isAuthorizedTransition('submitter', 'Submitted', 'UnderReview')).toBe(false);
      expect(isAuthorizedTransition('submitter', 'UnderReview', 'ReadyToProvision')).toBe(false);
    });

    it('C10: system role for provisioning transitions', () => {
      expect(isAuthorizedTransition('system', 'ReadyToProvision', 'Provisioning')).toBe(true);
      expect(isAuthorizedTransition('system', 'Provisioning', 'Completed')).toBe(true);
      expect(isAuthorizedTransition('system', 'Submitted', 'UnderReview')).toBe(false);
    });
  });
});

// ── D. Deficiency-regression tests ──────────────────────────────────────

describe('Deficiency regression — F1+F6 field persistence', () => {
  let repo: MockProjectRequestsRepository;

  beforeEach(() => {
    repo = new MockProjectRequestsRepository();
  });

  it('D1: department survives submit→read cycle', async () => {
    await repo.upsertRequest(makeRequest({ department: 'commercial' }));
    const result = await repo.getRequest('req-1');
    expect(result!.department).toBe('commercial');
  });

  it('D2: estimatedValue survives submit→read cycle', async () => {
    await repo.upsertRequest(makeRequest({ estimatedValue: 2_500_000 }));
    const result = await repo.getRequest('req-1');
    expect(result!.estimatedValue).toBe(2_500_000);
  });

  it('D3: clientName survives submit→read cycle', async () => {
    await repo.upsertRequest(makeRequest({ clientName: 'Acme Corp' }));
    const result = await repo.getRequest('req-1');
    expect(result!.clientName).toBe('Acme Corp');
  });

  it('D4: contractType survives submit→read cycle', async () => {
    await repo.upsertRequest(makeRequest({ contractType: 'GMP' }));
    const result = await repo.getRequest('req-1');
    expect(result!.contractType).toBe('GMP');
  });

  it('D5: addOns array survives submit→read cycle', async () => {
    await repo.upsertRequest(makeRequest({ addOns: ['safety-plan', 'quality-plan'] }));
    const result = await repo.getRequest('req-1');
    expect(result!.addOns).toEqual(['safety-plan', 'quality-plan']);
  });

  it('D6: viewerUPNs array survives submit→read cycle', async () => {
    await repo.upsertRequest(makeRequest({ viewerUPNs: ['v1@hb.com', 'v2@hb.com'] }));
    const result = await repo.getRequest('req-1');
    expect(result!.viewerUPNs).toEqual(['v1@hb.com', 'v2@hb.com']);
  });

  it('D7: groupLeaders array survives submit→read cycle', async () => {
    await repo.upsertRequest(makeRequest({ groupLeaders: ['lead1@hb.com'] }));
    const result = await repo.getRequest('req-1');
    expect(result!.groupLeaders).toEqual(['lead1@hb.com']);
  });

  it('D8: projectLeadId survives submit→read cycle', async () => {
    await repo.upsertRequest(makeRequest({ projectLeadId: 'lead@hb.com' }));
    const result = await repo.getRequest('req-1');
    expect(result!.projectLeadId).toBe('lead@hb.com');
  });

  it('D9: startDate survives submit→read cycle', async () => {
    await repo.upsertRequest(makeRequest({ startDate: '2026-06-01' }));
    const result = await repo.getRequest('req-1');
    expect(result!.startDate).toBe('2026-06-01');
  });

  it('D10: year field survives submit→read cycle', async () => {
    await repo.upsertRequest(makeRequest({ year: 2025 }));
    const result = await repo.getRequest('req-1');
    expect(result!.year).toBe(2025);
  });

  it('D11: clarificationRequestedAt survives submit→read cycle', async () => {
    await repo.upsertRequest(makeRequest({ clarificationRequestedAt: '2026-01-16T10:00:00Z' }));
    const result = await repo.getRequest('req-1');
    expect(result!.clarificationRequestedAt).toBe('2026-01-16T10:00:00Z');
  });

  it('D12: retryCount survives submit→read cycle', async () => {
    await repo.upsertRequest(makeRequest({ retryCount: 3 }));
    const result = await repo.getRequest('req-1');
    expect(result!.retryCount).toBe(3);
  });
});

// ── E. Year derivation ──────────────────────────────────────────────────

describe('Year derivation — deriveProjectYear', () => {
  it('E1: derives 2025 from project number 25-001-01', () => {
    expect(deriveProjectYear('25-001-01')).toBe(2025);
  });

  it('E2: derives 2024 from project number 24-244-01', () => {
    expect(deriveProjectYear('24-244-01')).toBe(2024);
  });

  it('E3: derives 2030 from project number 30-100-01', () => {
    expect(deriveProjectYear('30-100-01')).toBe(2030);
  });

  it('E4: falls back to current year when project number is undefined', () => {
    expect(deriveProjectYear(undefined)).toBe(new Date().getFullYear());
  });

  it('E5: falls back to current year when project number is malformed', () => {
    expect(deriveProjectYear('INVALID')).toBe(new Date().getFullYear());
  });

  it('E6: falls back to current year for empty string', () => {
    expect(deriveProjectYear('')).toBe(new Date().getFullYear());
  });
});
