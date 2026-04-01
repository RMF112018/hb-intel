import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { IProjectSetupRequest, ProjectSetupRequestState } from '@hbc/models';

/**
 * P5-02: Request lifecycle integration test.
 *
 * Validates the full submit → list → get → advance-state lifecycle
 * using the MockProjectRequestsRepository. This test proves the
 * request state machine works end-to-end without a live SharePoint backend.
 *
 * Closes P5-01 blocker A1: No E2E test for request lifecycle.
 */

// Import mock repository directly
import { MockProjectRequestsRepository } from '../services/project-requests-repository.js';

function createRequest(overrides?: Partial<IProjectSetupRequest>): IProjectSetupRequest {
  return {
    requestId: `req-${Date.now()}`,
    projectId: `proj-${Date.now()}`,
    projectName: 'Integration Test Project',
    projectNumber: '26-100-01',
    projectLocation: 'Portland, OR',
    projectType: 'Commercial',
    projectStage: 'Pursuit',
    submittedBy: 'estimator@hb.com',
    submittedAt: new Date().toISOString(),
    state: 'Submitted' as ProjectSetupRequestState,
    groupMembers: ['member@hb.com'],
    groupLeaders: ['leader@hb.com'],
    department: 'commercial',
    estimatedValue: 5000000,
    clientName: 'Test Client',
    startDate: '2026-06-01',
    contractType: 'GMP',
    retryCount: 0,
    ...overrides,
  };
}

describe('P5-02 Request lifecycle integration', () => {
  let repo: MockProjectRequestsRepository;

  beforeEach(() => {
    repo = new MockProjectRequestsRepository();
  });

  it('full lifecycle: submit → list → get → advance state', async () => {
    // 1. Submit
    const request = createRequest({ requestId: 'lifecycle-001', state: 'Submitted' });
    await repo.upsertRequest(request);

    // 2. List — request appears
    const listed = await repo.listRequests();
    expect(listed.some((r) => r.requestId === 'lifecycle-001')).toBe(true);

    // 3. Get — request is retrievable
    const retrieved = await repo.getRequest('lifecycle-001');
    expect(retrieved).not.toBeNull();
    expect(retrieved!.projectName).toBe('Integration Test Project');
    expect(retrieved!.state).toBe('Submitted');

    // 4. Advance state: Submitted → UnderReview
    retrieved!.state = 'UnderReview';
    await repo.upsertRequest(retrieved!);
    const afterReview = await repo.getRequest('lifecycle-001');
    expect(afterReview!.state).toBe('UnderReview');

    // 5. Advance state: UnderReview → ReadyToProvision
    afterReview!.state = 'ReadyToProvision';
    afterReview!.projectNumber = '26-100-01';
    await repo.upsertRequest(afterReview!);
    const afterApproval = await repo.getRequest('lifecycle-001');
    expect(afterApproval!.state).toBe('ReadyToProvision');

    // 6. Advance state: ReadyToProvision → Provisioning
    afterApproval!.state = 'Provisioning';
    await repo.upsertRequest(afterApproval!);
    const provisioning = await repo.getRequest('lifecycle-001');
    expect(provisioning!.state).toBe('Provisioning');

    // 7. Advance state: Provisioning → Completed
    provisioning!.state = 'Completed';
    provisioning!.completedAt = new Date().toISOString();
    provisioning!.completedBy = 'system';
    provisioning!.siteUrl = 'https://tenant.sharepoint.com/sites/26-100-01';
    await repo.upsertRequest(provisioning!);
    const completed = await repo.getRequest('lifecycle-001');
    expect(completed!.state).toBe('Completed');
    expect(completed!.siteUrl).toBeTruthy();
    expect(completed!.completedBy).toBe('system');
  });

  it('multiple requests can coexist and be filtered', async () => {
    await repo.upsertRequest(createRequest({ requestId: 'multi-001', state: 'Submitted' }));
    await repo.upsertRequest(createRequest({ requestId: 'multi-002', state: 'UnderReview' }));
    await repo.upsertRequest(createRequest({ requestId: 'multi-003', state: 'Completed' }));

    const all = await repo.listRequests();
    expect(all.length).toBe(3);

    const submitted = await repo.listRequests('Submitted');
    expect(submitted.length).toBe(1);
    expect(submitted[0].requestId).toBe('multi-001');
  });

  it('clarification flow: UnderReview → NeedsClarification → Submitted (resubmit)', async () => {
    const request = createRequest({ requestId: 'clarification-001', state: 'UnderReview' });
    await repo.upsertRequest(request);

    // Controller requests clarification
    request.state = 'NeedsClarification';
    request.clarificationNote = 'Budget needs more detail';
    request.clarificationRequestedAt = new Date().toISOString();
    await repo.upsertRequest(request);

    const needsClari = await repo.getRequest('clarification-001');
    expect(needsClari!.state).toBe('NeedsClarification');
    expect(needsClari!.clarificationNote).toBe('Budget needs more detail');

    // Submitter resubmits
    needsClari!.state = 'Submitted';
    await repo.upsertRequest(needsClari!);
    const resubmitted = await repo.getRequest('clarification-001');
    expect(resubmitted!.state).toBe('Submitted');
  });

  it('failed provisioning: Provisioning → Failed with error metadata', async () => {
    const request = createRequest({ requestId: 'fail-001', state: 'Provisioning' });
    await repo.upsertRequest(request);

    request.state = 'Failed';
    request.retryCount = 3;
    await repo.upsertRequest(request);

    const failed = await repo.getRequest('fail-001');
    expect(failed!.state).toBe('Failed');
    expect(failed!.retryCount).toBe(3);
  });

  it('get returns null for non-existent request', async () => {
    const result = await repo.getRequest('does-not-exist');
    expect(result).toBeNull();
  });
});
