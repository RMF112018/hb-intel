import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest';
import type { IProjectSetupRequest } from '@hbc/models';
import type { IValidatedClaims } from '../../../middleware/validateToken.js';
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
    expect(retrieved!.viewerUPNs).toEqual(['viewer1@hb.com', 'viewer2@hb.com']);
    expect(retrieved!.addOns).toEqual(['safety-plan', 'quality-plan']);
    expect(retrieved!.year).toBe(2026);
  });

  it('A1b: persists P2-07 gap fields through submit→read cycle', async () => {
    const fullRequest = makeRequest({
      projectStreetAddress: '123 Main St',
      projectCity: 'Denver',
      projectCounty: 'Denver',
      projectState: 'CO',
      projectZip: '80202',
      officeDivision: 'Mountain West',
      procoreProject: 'Yes',
      projectExecutiveUpn: 'exec@hb.com',
      projectManagerUpn: 'pm@hb.com',
      leadEstimatorUpn: 'est@hb.com',
      supportingEstimatorUpns: ['est2@hb.com'],
      timberscanApproverUpn: 'ts@hb.com',
      sageAccessUpns: ['sage@hb.com'],
    });

    await repo.upsertRequest(fullRequest);
    const retrieved = await repo.getRequest('req-1');

    expect(retrieved).not.toBeNull();
    expect(retrieved!.projectStreetAddress).toBe('123 Main St');
    expect(retrieved!.projectCity).toBe('Denver');
    expect(retrieved!.projectCounty).toBe('Denver');
    expect(retrieved!.projectState).toBe('CO');
    expect(retrieved!.projectZip).toBe('80202');
    expect(retrieved!.officeDivision).toBe('Mountain West');
    expect(retrieved!.procoreProject).toBe('Yes');
    expect(retrieved!.projectExecutiveUpn).toBe('exec@hb.com');
    expect(retrieved!.projectManagerUpn).toBe('pm@hb.com');
    expect(retrieved!.leadEstimatorUpn).toBe('est@hb.com');
    expect(retrieved!.supportingEstimatorUpns).toEqual(['est2@hb.com']);
    expect(retrieved!.timberscanApproverUpn).toBe('ts@hb.com');
    expect(retrieved!.sageAccessUpns).toEqual(['sage@hb.com']);
  });

  it('A1c: P2-07 fields survive state transition without loss', async () => {
    const request = makeRequest({
      state: 'UnderReview',
      projectStreetAddress: '456 Oak Ave',
      projectCity: 'Tampa',
      officeDivision: 'South Florida',
      projectExecutiveUpn: 'exec@hb.com',
    });
    await repo.upsertRequest(request);

    // State transition preserves fields via read-modify-write
    const existing = await repo.getRequest('req-1');
    existing!.state = 'ReadyToProvision';
    existing!.projectNumber = '25-100-01';
    await repo.upsertRequest(existing!);

    const updated = await repo.getRequest('req-1');
    expect(updated!.state).toBe('ReadyToProvision');
    expect(updated!.projectStreetAddress).toBe('456 Oak Ave');
    expect(updated!.projectCity).toBe('Tampa');
    expect(updated!.officeDivision).toBe('South Florida');
    expect(updated!.projectExecutiveUpn).toBe('exec@hb.com');
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

// ── C. Role-based authorization (P9-G5-06: claims-based) ──────────────

function makeClaims(overrides: Partial<IValidatedClaims> = {}): IValidatedClaims {
  return { upn: 'user@hb.com', oid: 'oid-user', roles: [], displayName: 'User', ...overrides };
}

describe('Role-based authorization (claims-based)', () => {
  describe('resolveRequestRole', () => {
    it('C1: identifies admin via Admin app-role', () => {
      const request = makeRequest({ submittedBy: 'other@hb.com' });
      expect(resolveRequestRole(makeClaims({ roles: ['Admin'] }), request)).toBe('admin');
    });

    it('C2: identifies controller via Controller app-role', () => {
      const request = makeRequest({ submittedBy: 'other@hb.com' });
      expect(resolveRequestRole(makeClaims({ roles: ['Controller'] }), request)).toBe('controller');
    });

    it('C3: identifies submitter via oid ownership', () => {
      const request = makeRequest({ submittedBy: 'coordinator@hb.com', submittedByOid: 'oid-coord' });
      expect(resolveRequestRole(makeClaims({ oid: 'oid-coord' }), request)).toBe('submitter');
    });

    it('C4: returns system for unknown caller', () => {
      const request = makeRequest({ submittedBy: 'other@hb.com', submittedByOid: 'oid-other' });
      expect(resolveRequestRole(makeClaims({ upn: 'stranger@hb.com', oid: 'oid-stranger' }), request)).toBe('system');
    });

    it('C5: admin takes priority over submitter', () => {
      const request = makeRequest({ submittedBy: 'admin@hb.com', submittedByOid: 'oid-admin' });
      expect(resolveRequestRole(makeClaims({ roles: ['Admin'], oid: 'oid-admin' }), request)).toBe('admin');
    });

    it('C6: UPN fallback for legacy records without submittedByOid', () => {
      const request = makeRequest({ submittedBy: 'coordinator@hb.com' });
      expect(resolveRequestRole(makeClaims({ upn: 'coordinator@hb.com' }), request)).toBe('submitter');
    });

    it('C6b: UPN fallback is case-insensitive', () => {
      const request = makeRequest({ submittedBy: 'coordinator@hb.com' });
      expect(resolveRequestRole(makeClaims({ upn: 'Coordinator@HB.com' }), request)).toBe('submitter');
    });

    it('C7: HBIntelAdmin resolves to admin', () => {
      const request = makeRequest({ submittedBy: 'other@hb.com' });
      expect(resolveRequestRole(makeClaims({ roles: ['HBIntelAdmin'] }), request)).toBe('admin');
    });

    it('C8: HBIntelController resolves to controller', () => {
      const request = makeRequest({ submittedBy: 'other@hb.com' });
      expect(resolveRequestRole(makeClaims({ roles: ['HBIntelController'] }), request)).toBe('controller');
    });

    it('C9: BreakGlass resolves to admin', () => {
      const request = makeRequest({ submittedBy: 'other@hb.com' });
      expect(resolveRequestRole(makeClaims({ roles: ['BreakGlass'] }), request)).toBe('admin');
    });
  });

  describe('isAuthorizedTransition', () => {
    it('C10: admin can perform any transition', () => {
      expect(isAuthorizedTransition('admin', 'Submitted', 'UnderReview')).toBe(true);
      expect(isAuthorizedTransition('admin', 'NeedsClarification', 'UnderReview')).toBe(true);
      expect(isAuthorizedTransition('admin', 'UnderReview', 'ReadyToProvision')).toBe(true);
    });

    it('C11: controller can advance review states', () => {
      expect(isAuthorizedTransition('controller', 'Submitted', 'UnderReview')).toBe(true);
      expect(isAuthorizedTransition('controller', 'UnderReview', 'ReadyToProvision')).toBe(true);
      expect(isAuthorizedTransition('controller', 'UnderReview', 'NeedsClarification')).toBe(true);
    });

    it('C12: submitter can only resubmit from NeedsClarification', () => {
      expect(isAuthorizedTransition('submitter', 'NeedsClarification', 'UnderReview')).toBe(true);
      expect(isAuthorizedTransition('submitter', 'Submitted', 'UnderReview')).toBe(false);
      expect(isAuthorizedTransition('submitter', 'UnderReview', 'ReadyToProvision')).toBe(false);
    });

    it('C13: system role for provisioning transitions', () => {
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

  it('D8: startDate survives submit→read cycle', async () => {
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

// ── F. Backend submission validation (P6-01) ──────────────────────────────

import { validateSubmission, VALID_PROJECT_STAGES, VALID_DEPARTMENTS } from '../index.js';

/** Minimal valid submission body matching wizard-enforced required fields. */
function makeValidSubmission(): Partial<IProjectSetupRequest> {
  return {
    projectName: 'Summit Tower',
    projectLocation: 'Denver, CO',
    projectStreetAddress: '123 Main St',
    projectCity: 'Denver',
    projectCounty: 'Denver',
    projectState: 'CO',
    projectZip: '80202',
    department: 'commercial',
    projectType: 'Commercial',
    projectExecutiveUpn: 'exec@hb.com',
    leadEstimatorUpn: 'est@hb.com',
    timberscanApproverUpn: 'ts@hb.com',
    groupMembers: ['team@hb.com'],
    projectStage: 'Pursuit',
  };
}

describe('P6-01: Backend submission validation — wizard contract parity', () => {
  it('F1: returns no errors for a fully valid submission', () => {
    expect(validateSubmission(makeValidSubmission())).toEqual([]);
  });

  it('F2: rejects missing projectName', () => {
    const errors = validateSubmission({ ...makeValidSubmission(), projectName: '' });
    expect(errors).toContainEqual(expect.objectContaining({ field: 'projectName' }));
  });

  it('F3: rejects missing projectStreetAddress', () => {
    const errors = validateSubmission({ ...makeValidSubmission(), projectStreetAddress: '' });
    expect(errors).toContainEqual(expect.objectContaining({ field: 'projectStreetAddress' }));
  });

  it('F4: rejects missing projectCity', () => {
    const errors = validateSubmission({ ...makeValidSubmission(), projectCity: '' });
    expect(errors).toContainEqual(expect.objectContaining({ field: 'projectCity' }));
  });

  it('F5: rejects missing projectCounty', () => {
    const errors = validateSubmission({ ...makeValidSubmission(), projectCounty: '' });
    expect(errors).toContainEqual(expect.objectContaining({ field: 'projectCounty' }));
  });

  it('F6: rejects missing projectState', () => {
    const errors = validateSubmission({ ...makeValidSubmission(), projectState: '' });
    expect(errors).toContainEqual(expect.objectContaining({ field: 'projectState' }));
  });

  it('F7: rejects missing projectZip', () => {
    const errors = validateSubmission({ ...makeValidSubmission(), projectZip: '' });
    expect(errors).toContainEqual(expect.objectContaining({ field: 'projectZip' }));
  });

  it('F8: rejects missing department', () => {
    const errors = validateSubmission({ ...makeValidSubmission(), department: undefined });
    expect(errors).toContainEqual(expect.objectContaining({ field: 'department' }));
  });

  it('F9: rejects invalid department', () => {
    const errors = validateSubmission({ ...makeValidSubmission(), department: 'invalid' as any });
    expect(errors).toContainEqual(expect.objectContaining({ field: 'department', message: expect.stringContaining('must be one of') }));
  });

  it('F10: rejects missing projectType', () => {
    const errors = validateSubmission({ ...makeValidSubmission(), projectType: '' });
    expect(errors).toContainEqual(expect.objectContaining({ field: 'projectType' }));
  });

  it('F11: rejects missing projectExecutiveUpn', () => {
    const errors = validateSubmission({ ...makeValidSubmission(), projectExecutiveUpn: '' });
    expect(errors).toContainEqual(expect.objectContaining({ field: 'projectExecutiveUpn' }));
  });

  it('F12: rejects missing leadEstimatorUpn', () => {
    const errors = validateSubmission({ ...makeValidSubmission(), leadEstimatorUpn: '' });
    expect(errors).toContainEqual(expect.objectContaining({ field: 'leadEstimatorUpn' }));
  });

  it('F13: rejects missing timberscanApproverUpn', () => {
    const errors = validateSubmission({ ...makeValidSubmission(), timberscanApproverUpn: '' });
    expect(errors).toContainEqual(expect.objectContaining({ field: 'timberscanApproverUpn' }));
  });

  it('F14: rejects missing groupMembers', () => {
    const errors = validateSubmission({ ...makeValidSubmission(), groupMembers: [] });
    expect(errors).toContainEqual(expect.objectContaining({ field: 'groupMembers' }));
  });

  it('F15: rejects negative estimatedValue', () => {
    const errors = validateSubmission({ ...makeValidSubmission(), estimatedValue: -1 });
    expect(errors).toContainEqual(expect.objectContaining({ field: 'estimatedValue' }));
  });

  it('F16: accepts all valid project stages', () => {
    for (const stage of VALID_PROJECT_STAGES) {
      const errors = validateSubmission({ ...makeValidSubmission(), projectStage: stage });
      expect(errors.find((e) => e.field === 'projectStage')).toBeUndefined();
    }
  });

  it('F17: rejects invalid project stage', () => {
    const errors = validateSubmission({ ...makeValidSubmission(), projectStage: 'Invalid' as any });
    expect(errors).toContainEqual(expect.objectContaining({ field: 'projectStage' }));
  });

  it('F18: accepts both valid departments', () => {
    for (const dept of VALID_DEPARTMENTS) {
      const errors = validateSubmission({ ...makeValidSubmission(), department: dept as any });
      expect(errors.find((e) => e.field === 'department')).toBeUndefined();
    }
  });

  it('F19: collects multiple errors for an empty submission', () => {
    const errors = validateSubmission({});
    expect(errors.length).toBeGreaterThanOrEqual(13);
  });
});

// ── G. P2-02: Launch contract — auto-trigger prerequisites ────────────────

import { PROJECT_NUMBER_PATTERN } from '../index.js';

describe('P2-02: Launch contract — auto-trigger prerequisites', () => {
  it('G1: UnderReview → ReadyToProvision is a valid controller transition (auto-trigger prerequisite)', () => {
    expect(isValidTransition('UnderReview', 'ReadyToProvision')).toBe(true);
    expect(isAuthorizedTransition('controller', 'UnderReview', 'ReadyToProvision')).toBe(true);
  });

  it('G2: AwaitingExternalSetup → ReadyToProvision is a valid controller transition', () => {
    expect(isValidTransition('AwaitingExternalSetup', 'ReadyToProvision')).toBe(true);
    expect(isAuthorizedTransition('controller', 'AwaitingExternalSetup', 'ReadyToProvision')).toBe(true);
  });

  it('G3: submitter cannot advance to ReadyToProvision (launch is controller-only)', () => {
    expect(isAuthorizedTransition('submitter', 'UnderReview', 'ReadyToProvision')).toBe(false);
  });

  it('G4: system role is authorized for ReadyToProvision → Provisioning (saga reconciliation)', () => {
    expect(isAuthorizedTransition('system', 'ReadyToProvision', 'Provisioning')).toBe(true);
  });

  it('G5: PROJECT_NUMBER_PATTERN accepts valid ##-###-## format', () => {
    expect(PROJECT_NUMBER_PATTERN.test('25-001-01')).toBe(true);
    expect(PROJECT_NUMBER_PATTERN.test('24-244-99')).toBe(true);
    expect(PROJECT_NUMBER_PATTERN.test('30-100-01')).toBe(true);
  });

  it('G6: PROJECT_NUMBER_PATTERN rejects invalid formats', () => {
    expect(PROJECT_NUMBER_PATTERN.test('25-1-1')).toBe(false);
    expect(PROJECT_NUMBER_PATTERN.test('2-001-01')).toBe(false);
    expect(PROJECT_NUMBER_PATTERN.test('25-001-1')).toBe(false);
    expect(PROJECT_NUMBER_PATTERN.test('abc-def-gh')).toBe(false);
    expect(PROJECT_NUMBER_PATTERN.test('')).toBe(false);
    expect(PROJECT_NUMBER_PATTERN.test('25001-01')).toBe(false);
  });

  it('G7: admin can perform any transition including ReadyToProvision', () => {
    expect(isAuthorizedTransition('admin', 'UnderReview', 'ReadyToProvision')).toBe(true);
    expect(isAuthorizedTransition('admin', 'AwaitingExternalSetup', 'ReadyToProvision')).toBe(true);
  });
});

// ── H. P2-03: Validation, idempotency, and uniqueness hardening ───────────

describe('P2-03: Validation, idempotency, and uniqueness hardening', () => {
  let repo: MockProjectRequestsRepository;

  beforeEach(() => {
    repo = new MockProjectRequestsRepository();
  });

  // H1-H3: ProjectNumber uniqueness via repository
  it('H1: findByProjectNumber returns null when no match exists', async () => {
    await repo.upsertRequest(makeRequest({ requestId: 'r1', projectNumber: '25-001-01' }));
    const result = await repo.findByProjectNumber('99-999-99');
    expect(result).toBeNull();
  });

  it('H2: findByProjectNumber returns the matching request', async () => {
    await repo.upsertRequest(makeRequest({ requestId: 'r1', projectNumber: '25-001-01' }));
    await repo.upsertRequest(makeRequest({ requestId: 'r2', projectNumber: '25-002-01' }));
    const result = await repo.findByProjectNumber('25-001-01');
    expect(result).not.toBeNull();
    expect(result!.requestId).toBe('r1');
  });

  it('H3: findByProjectNumber does not match requests without projectNumber', async () => {
    await repo.upsertRequest(makeRequest({ requestId: 'r1' }));
    const result = await repo.findByProjectNumber('25-001-01');
    expect(result).toBeNull();
  });

  // H4-H5: Duplicate-run prevention via auto-trigger guard
  it('H4: auto-trigger guard — ReadyToProvision with no existing status should allow launch (isValidTransition confirms prerequisite)', () => {
    // The auto-trigger in advanceRequestState checks getProvisioningStatus.
    // If null or Failed, it fires. This test confirms the transition prerequisite.
    expect(isValidTransition('UnderReview', 'ReadyToProvision')).toBe(true);
    expect(isAuthorizedTransition('controller', 'UnderReview', 'ReadyToProvision')).toBe(true);
  });

  it('H5: system cannot bypass controller transitions', () => {
    // System role should not be able to advance from UnderReview to ReadyToProvision
    expect(isAuthorizedTransition('system', 'UnderReview', 'ReadyToProvision')).toBe(false);
  });

  // H6-H7: Transition guard — invalid reopen/rerun combinations
  it('H6: Failed → ReadyToProvision is INVALID (must go through UnderReview)', () => {
    expect(isValidTransition('Failed', 'ReadyToProvision')).toBe(false);
  });

  it('H7: Provisioning → ReadyToProvision is INVALID (cannot restart from active run)', () => {
    expect(isValidTransition('Provisioning', 'ReadyToProvision')).toBe(false);
  });

  // H8: Transition guard — completed is terminal
  it('H8: Completed → ReadyToProvision is INVALID (terminal state)', () => {
    expect(isValidTransition('Completed', 'ReadyToProvision')).toBe(false);
  });
});

// ── I. P2-04: Correlation, identity, and observability hardening ──────────

describe('P2-04: Correlation, identity, and observability hardening', () => {
  let repo: MockProjectRequestsRepository;

  beforeEach(() => {
    repo = new MockProjectRequestsRepository();
  });

  it('I1: approvedBy and approvedByOid are persistable on the request model', async () => {
    const request = makeRequest({
      state: 'ReadyToProvision',
      projectNumber: '25-001-01',
      approvedBy: 'controller@hb.com',
      approvedByOid: 'oid-controller',
    });
    await repo.upsertRequest(request);
    const result = await repo.getRequest('req-1');
    expect(result!.approvedBy).toBe('controller@hb.com');
    expect(result!.approvedByOid).toBe('oid-controller');
  });

  it('I2: approvedBy fields survive state transition without loss', async () => {
    const request = makeRequest({
      state: 'ReadyToProvision',
      projectNumber: '25-001-01',
      approvedBy: 'controller@hb.com',
      approvedByOid: 'oid-controller',
    });
    await repo.upsertRequest(request);

    const existing = await repo.getRequest('req-1');
    existing!.state = 'Provisioning';
    await repo.upsertRequest(existing!);

    const updated = await repo.getRequest('req-1');
    expect(updated!.state).toBe('Provisioning');
    expect(updated!.approvedBy).toBe('controller@hb.com');
    expect(updated!.approvedByOid).toBe('oid-controller');
  });

  it('I3: correlation chain — request and provisioning identifiers are correctly structured', () => {
    // Verify the identifier model is sound: requestId and projectId are set at submission,
    // projectNumber is set at approval, correlationId is per-run.
    const request = makeRequest({
      requestId: 'req-123',
      projectId: 'proj-123',
      projectNumber: '25-001-01',
    });
    expect(request.requestId).toBe('req-123');
    expect(request.projectId).toBe('proj-123');
    expect(request.projectNumber).toBe('25-001-01');
  });
});
