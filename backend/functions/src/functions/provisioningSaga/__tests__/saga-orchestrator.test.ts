import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IProvisionSiteRequest, IProvisioningStatus } from '@hbc/models';
import { SagaOrchestrator } from '../saga-orchestrator.js';
import { createMockServices } from '../../../test-utils/mock-services.js';

vi.mock('../../../utils/retry.js', () => ({
  withRetry: async <T>(fn: () => Promise<T>) => fn(),
}));

/**
 * D-PH6-15 Layer 1 unit coverage for SagaOrchestrator execution semantics.
 * Tests assert idempotency, compensation, deferred Step 5 behavior, and retry entrypoint wiring.
 */
describe('D-PH6-15 SagaOrchestrator', () => {
  const request: IProvisionSiteRequest = {
    projectId: 'project-1',
    projectNumber: '25-001-01',
    projectName: 'Unit Test Project',
    correlationId: 'corr-1',
    triggeredBy: 'controller@hb.com',
    submittedBy: 'submitter@hb.com',
    groupMembers: ['member1@hb.com'],
  };

  const makeLogger = () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    trackEvent: vi.fn(),
    trackMetric: vi.fn(),
  });

  beforeEach(() => {
    process.env.OPEX_MANAGER_UPN = 'opex@hb.com';
    process.env.SHAREPOINT_HUB_SITE_ID = 'hub-guid-1';
  });

  it('completes all steps and closes SignalR group', async () => {
    const services = createMockServices();
    const logger = makeLogger();

    const orchestrator = new SagaOrchestrator(services, logger);
    await orchestrator.execute(request);

    // Completion path writes final terminal state and closes the per-project group.
    const finalUpsert = services.tableStorage.upsertProvisioningStatus.mock.calls.at(-1)?.[0] as IProvisioningStatus;
    expect(finalUpsert.overallStatus).toBe('Completed');
    expect(services.signalR.closeGroup).toHaveBeenCalledWith(request.projectId);
    expect(logger.trackEvent).toHaveBeenCalledWith(
      'ProvisioningSagaCompleted',
      expect.objectContaining({ projectId: request.projectId })
    );
  });

  it('runs compensation and marks failed when a step errors', async () => {
    const services = createMockServices();
    const logger = makeLogger();
    services.sharePoint.uploadTemplateFiles.mockRejectedValueOnce(new Error('upload failed'));

    const orchestrator = new SagaOrchestrator(services, logger);
    await orchestrator.execute(request);

    expect(services.sharePoint.deleteSite).toHaveBeenCalledTimes(1);
    const finalUpsert = services.tableStorage.upsertProvisioningStatus.mock.calls.at(-1)?.[0] as IProvisioningStatus;
    expect(finalUpsert.overallStatus).toBe('Failed');
    expect(services.signalR.closeGroup).toHaveBeenCalledWith(request.projectId);
  });

  it('defers step 5 and leaves overall status WebPartsPending', async () => {
    const services = createMockServices();
    const logger = makeLogger();
    services.sharePoint.installWebParts.mockRejectedValue(new Error('install failed'));

    const orchestrator = new SagaOrchestrator(services, logger);
    await orchestrator.execute(request);

    const finalUpsert = services.tableStorage.upsertProvisioningStatus.mock.calls.at(-1)?.[0] as IProvisioningStatus;
    expect(finalUpsert.step5DeferredToTimer).toBe(true);
    expect(finalUpsert.overallStatus).toBe('WebPartsPending');
    expect(logger.trackEvent).toHaveBeenCalledWith(
      'ProvisioningStep5Deferred',
      expect.objectContaining({ projectId: request.projectId })
    );
  });

  it('uses step-level idempotency checks on retry via existing-site guard', async () => {
    const services = createMockServices();
    const logger = makeLogger();

    services.tableStorage.getProvisioningStatus.mockResolvedValueOnce({
      projectId: request.projectId,
      projectNumber: request.projectNumber,
      projectName: request.projectName,
      correlationId: 'old-correlation',
      overallStatus: 'Failed',
      currentStep: 3,
      steps: [],
      siteUrl: 'https://hbconstruction.sharepoint.com/sites/already-provisioned',
      triggeredBy: request.triggeredBy,
      submittedBy: request.submittedBy,
      groupMembers: request.groupMembers,
      startedAt: new Date().toISOString(),
      step5DeferredToTimer: false,
      step5TimerRetryCount: 0,
      retryCount: 0,
    });
    services.sharePoint.siteExists.mockResolvedValueOnce('https://hbconstruction.sharepoint.com/sites/already-provisioned');

    const orchestrator = new SagaOrchestrator(services, logger);
    await orchestrator.retry(request.projectId);

    expect(services.sharePoint.createSite).not.toHaveBeenCalled();
    expect(services.tableStorage.getProvisioningStatus).toHaveBeenCalledWith(request.projectId);
  });

  it('throws on retry when no status row exists', async () => {
    const services = createMockServices();
    const logger = makeLogger();
    services.tableStorage.getProvisioningStatus.mockResolvedValueOnce(null);

    const orchestrator = new SagaOrchestrator(services, logger);

    await expect(orchestrator.retry(request.projectId)).rejects.toThrow(
      `No provisioning record found for projectId ${request.projectId}`
    );
  });

  it('executeFullSpec marks Completed when step 5 succeeds', async () => {
    const services = createMockServices();
    const logger = makeLogger();
    const orchestrator = new SagaOrchestrator(services, logger);

    const status: IProvisioningStatus = {
      projectId: request.projectId,
      projectNumber: request.projectNumber,
      projectName: request.projectName,
      correlationId: request.correlationId,
      overallStatus: 'WebPartsPending',
      currentStep: 5,
      steps: [{ stepNumber: 5, stepName: 'Install Web Parts', status: 'InProgress' }],
      siteUrl: 'https://hbconstruction.sharepoint.com/sites/25-001-01',
      triggeredBy: request.triggeredBy,
      submittedBy: request.submittedBy,
      groupMembers: request.groupMembers,
      startedAt: new Date().toISOString(),
      step5DeferredToTimer: true,
      step5TimerRetryCount: 2,
      retryCount: 1,
    };

    const result = await orchestrator.executeFullSpec(status);

    expect(result.status).toBe('Completed');
    expect(status.overallStatus).toBe('Completed');
    expect(status.step5DeferredToTimer).toBe(false);
    expect(status.step5TimerRetryCount).toBe(0);
  });

  it('executeFullSpec marks Failed when step 5 cannot execute', async () => {
    const services = createMockServices();
    const logger = makeLogger();
    const orchestrator = new SagaOrchestrator(services, logger);

    const status: IProvisioningStatus = {
      projectId: request.projectId,
      projectNumber: request.projectNumber,
      projectName: request.projectName,
      correlationId: request.correlationId,
      overallStatus: 'WebPartsPending',
      currentStep: 5,
      steps: [{ stepNumber: 5, stepName: 'Install Web Parts', status: 'InProgress' }],
      siteUrl: undefined,
      triggeredBy: request.triggeredBy,
      submittedBy: request.submittedBy,
      groupMembers: request.groupMembers,
      startedAt: new Date().toISOString(),
      step5DeferredToTimer: true,
      step5TimerRetryCount: 2,
      retryCount: 1,
    };

    const result = await orchestrator.executeFullSpec(status);

    expect(result.status).toBe('Failed');
    expect(status.overallStatus).toBe('Failed');
    expect(status.failedAt).toBeDefined();
  });

  it('logs and continues when SignalR push fails during progress updates', async () => {
    const services = createMockServices();
    const logger = makeLogger();
    services.signalR.pushProvisioningProgress.mockRejectedValue(new Error('signalr down'));

    const orchestrator = new SagaOrchestrator(services, logger);
    await orchestrator.execute(request);

    expect(logger.warn).toHaveBeenCalledWith(
      'Non-critical: SignalR push failed',
      expect.objectContaining({ correlationId: request.correlationId })
    );
  });
});
