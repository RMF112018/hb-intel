import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IProvisioningStatus } from '@hbc/models';
import { executeStep4 } from './step4-data-lists.js';
import { createMockServices } from '../../../test-utils/mock-services.js';
import { HB_INTEL_LIST_DEFINITIONS } from '../../../config/list-definitions.js';
import { HB_INTEL_WORKFLOW_LIST_DEFINITIONS } from '../../../config/workflow-list-definitions.js';

/**
 * W0-G2-T09: Step 4 (Create Data Lists) behavior tests.
 * TC-STEP-07 through TC-STEP-10, TC-FAIL-04, TC-FAIL-05, TC-IDEM-03,
 * and supplemental coverage.
 */
describe('W0-G2-T09: Step 4 — Create Data Lists', () => {
  const makeStatus = (overrides?: Partial<IProvisioningStatus>): IProvisioningStatus => ({
    projectId: 'project-t09',
    projectNumber: '25-009-01',
    projectName: 'T09 Test Project',
    correlationId: 'corr-t09',
    overallStatus: 'InProgress',
    currentStep: 4,
    steps: [],
    siteUrl: 'https://hbconstruction.sharepoint.com/sites/25-009-01',
    triggeredBy: 'controller@hb.com',
    submittedBy: 'submitter@hb.com',
    groupMembers: ['member1@hb.com'],
    startedAt: new Date().toISOString(),
    step5DeferredToTimer: false,
    step5TimerRetryCount: 0,
    retryCount: 0,
    ...overrides,
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('TC-STEP-07: calls createDataLists with 8 core lists', async () => {
    const services = createMockServices();
    const status = makeStatus();

    await executeStep4(services, status);

    // First call: core lists
    expect(services.sharePoint.createDataLists).toHaveBeenCalledWith(
      status.siteUrl,
      HB_INTEL_LIST_DEFINITIONS
    );
    expect(HB_INTEL_LIST_DEFINITIONS).toHaveLength(8);
  });

  it('TC-STEP-08: calls createDataLists with 26 workflow lists', async () => {
    const services = createMockServices();
    const status = makeStatus();

    await executeStep4(services, status);

    // Second call: workflow lists with context
    expect(services.sharePoint.createDataLists).toHaveBeenCalledWith(
      status.siteUrl,
      HB_INTEL_WORKFLOW_LIST_DEFINITIONS,
      { projectNumber: status.projectNumber }
    );
    expect(HB_INTEL_WORKFLOW_LIST_DEFINITIONS).toHaveLength(26);
  });

  it('passes projectNumber context to workflow lists', async () => {
    const services = createMockServices();
    const status = makeStatus({ projectNumber: '25-042-01' });

    await executeStep4(services, status);

    // Verify the second createDataLists call receives the correct projectNumber
    const calls = services.sharePoint.createDataLists.mock.calls;
    expect(calls).toHaveLength(2);
    expect(calls[1][2]).toEqual({ projectNumber: '25-042-01' });
  });

  it('TC-STEP-09: Completed when all lists created', async () => {
    const services = createMockServices();
    const status = makeStatus();

    const result = await executeStep4(services, status);

    expect(result.status).toBe('Completed');
    expect(result.stepNumber).toBe(4);
    expect(result.stepName).toBe('Create Data Lists');
    expect(result.completedAt).toBeDefined();
  });

  it('TC-STEP-10: Completed when lists idempotently skipped', async () => {
    const services = createMockServices();
    const status = makeStatus();

    // createDataLists resolves (internal idempotency — no-op if lists exist)
    const result = await executeStep4(services, status);
    expect(result.status).toBe('Completed');

    // Second run should also complete
    const result2 = await executeStep4(services, status);
    expect(result2.status).toBe('Completed');
  });

  it('TC-FAIL-04: partial failure (core succeeds, workflow fails)', async () => {
    const services = createMockServices();
    const status = makeStatus();

    // First call (core lists) succeeds, second call (workflow lists) rejects
    services.sharePoint.createDataLists
      .mockResolvedValueOnce(undefined) // core lists OK
      .mockRejectedValueOnce(new Error('workflow list creation failed'));

    const result = await executeStep4(services, status);

    expect(result.status).toBe('Failed');
    expect(result.errorMessage).toContain('workflow list creation failed');
  });

  it('TC-FAIL-05 / TC-IDEM-03: retry after partial failure succeeds', async () => {
    const services = createMockServices();
    const status = makeStatus();

    // First attempt: workflow lists fail
    services.sharePoint.createDataLists
      .mockResolvedValueOnce(undefined) // core OK
      .mockRejectedValueOnce(new Error('transient workflow error'));

    const failResult = await executeStep4(services, status);
    expect(failResult.status).toBe('Failed');

    // Retry: both succeed (mock resets to default success behavior)
    services.sharePoint.createDataLists.mockResolvedValue(undefined);

    const retryResult = await executeStep4(services, status);
    expect(retryResult.status).toBe('Completed');
  });

  it('total list count across both calls is 34 (8 core + 26 workflow)', () => {
    expect(HB_INTEL_LIST_DEFINITIONS.length + HB_INTEL_WORKFLOW_LIST_DEFINITIONS.length).toBe(34);
  });

  it('createDataLists is called exactly twice per step execution', async () => {
    const services = createMockServices();
    const status = makeStatus();

    await executeStep4(services, status);

    expect(services.sharePoint.createDataLists).toHaveBeenCalledTimes(2);
  });
});
