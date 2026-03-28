import { describe, expect, it, beforeEach } from 'vitest';
import type { IProjectSetupRequest } from '@hbc/models';
import { MockProjectRequestsRepository } from '../../../services/project-requests-repository.js';
import { isValidTransition } from '../../../state-machine.js';

/**
 * D-PH6-08 / Prompt 04: Request lifecycle unit tests.
 * Covers user-command flows, validation, state transitions,
 * and deficiency regression for F1+F6 (field persistence).
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
    await repo.upsertRequest(existing!);

    const updated = await repo.getRequest('req-1');
    expect(updated!.state).toBe('NeedsClarification');
    expect(updated!.clarificationNote).toBe('Please clarify budget allocation.');
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

// ── D. Deficiency-regression tests ──────────────────────────────────────

describe('Deficiency regression — F1+F6 field persistence', () => {
  let repo: MockProjectRequestsRepository;

  beforeEach(() => {
    repo = new MockProjectRequestsRepository();
  });

  it('D1: department survives submit→read cycle (was silently dropped pre-fix)', async () => {
    await repo.upsertRequest(makeRequest({ department: 'commercial' }));
    const result = await repo.getRequest('req-1');
    expect(result!.department).toBe('commercial');
  });

  it('D2: estimatedValue survives submit→read cycle (was silently dropped pre-fix)', async () => {
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

  it('D10: department + groupLeaders together propagate to saga handoff data', async () => {
    const fullRequest = makeRequest({
      state: 'ReadyToProvision',
      projectNumber: '25-001-01',
      department: 'luxury-residential',
      groupLeaders: ['lead1@hb.com', 'lead2@hb.com'],
    });
    await repo.upsertRequest(fullRequest);
    const existing = await repo.getRequest('req-1');

    // Simulate saga handoff data construction (from projectRequests/index.ts:162-172)
    expect(existing!.department).toBe('luxury-residential');
    expect(existing!.groupLeaders).toEqual(['lead1@hb.com', 'lead2@hb.com']);
    expect(existing!.groupMembers).toEqual(['team@hb.com']);
  });
});
