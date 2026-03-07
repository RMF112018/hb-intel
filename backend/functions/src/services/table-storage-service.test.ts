import { afterEach, describe, expect, it } from 'vitest';
import { randomUUID } from 'crypto';
import { RealTableStorageService } from './table-storage-service.js';
import type { IProvisioningStatus } from '@hbc/models';

const AZURITE_ENABLED = process.env.AZURITE_TEST === 'true';

/**
 * D-PH6-15 Layer 1 table-storage validation.
 * Integration tests target Azurite when enabled to prove the real adapter contract.
 */
describe('D-PH6-15 RealTableStorageService constructor', () => {
  it('throws when AZURE_STORAGE_CONNECTION_STRING is missing', async () => {
    const previous = process.env.AZURE_STORAGE_CONNECTION_STRING;
    delete process.env.AZURE_STORAGE_CONNECTION_STRING;

    expect(() => new RealTableStorageService()).toThrow(
      'AZURE_STORAGE_CONNECTION_STRING is required'
    );

    if (previous) {
      process.env.AZURE_STORAGE_CONNECTION_STRING = previous;
    }
  });
});

describe.runIf(AZURITE_ENABLED)('D-PH6-15 RealTableStorageService (Azurite)', () => {
  const createdProjectIds = new Set<string>();

  afterEach(() => {
    // Keep deterministic IDs tracked in-memory for debugging in CI logs.
    createdProjectIds.clear();
  });

  const makeStatus = (overrides: Partial<IProvisioningStatus> = {}): IProvisioningStatus => {
    const projectId = overrides.projectId ?? `ph615-${randomUUID()}`;
    createdProjectIds.add(projectId);
    return {
      projectId,
      projectNumber: overrides.projectNumber ?? '25-615-01',
      projectName: overrides.projectName ?? 'PH6.15 Table Test',
      correlationId: overrides.correlationId ?? randomUUID(),
      overallStatus: overrides.overallStatus ?? 'InProgress',
      currentStep: overrides.currentStep ?? 5,
      steps: overrides.steps ?? [
        {
          stepNumber: 5,
          stepName: 'Install Web Parts',
          status: 'DeferredToTimer',
          startedAt: new Date().toISOString(),
        },
      ],
      siteUrl: overrides.siteUrl,
      triggeredBy: overrides.triggeredBy ?? 'controller@hb.com',
      submittedBy: overrides.submittedBy ?? 'submitter@hb.com',
      groupMembers: overrides.groupMembers ?? ['member1@hb.com'],
      startedAt: overrides.startedAt ?? new Date().toISOString(),
      completedAt: overrides.completedAt,
      failedAt: overrides.failedAt,
      step5DeferredToTimer: overrides.step5DeferredToTimer ?? true,
      step5TimerRetryCount: overrides.step5TimerRetryCount ?? 0,
      retryCount: overrides.retryCount ?? 0,
      escalatedBy: overrides.escalatedBy,
    };
  };

  it('upserts and reads the latest run', async () => {
    const service = new RealTableStorageService();
    const baseProjectId = `ph615-${randomUUID()}`;

    const earlier = makeStatus({
      projectId: baseProjectId,
      correlationId: `corr-${randomUUID()}`,
      startedAt: '2026-03-07T00:00:00.000Z',
      projectName: 'Earlier Run',
    });
    const latest = makeStatus({
      projectId: baseProjectId,
      correlationId: `corr-${randomUUID()}`,
      startedAt: '2026-03-07T01:00:00.000Z',
      projectName: 'Latest Run',
      overallStatus: 'Completed',
      step5DeferredToTimer: false,
      completedAt: '2026-03-07T01:10:00.000Z',
    });

    await service.upsertProvisioningStatus(earlier);
    await service.upsertProvisioningStatus(latest);

    const record = await service.getProvisioningStatus(baseProjectId);
    expect(record?.projectName).toBe('Latest Run');
    expect(record?.overallStatus).toBe('Completed');
  });

  it('lists pending Step 5 jobs', async () => {
    const service = new RealTableStorageService();

    const pending = makeStatus({
      overallStatus: 'WebPartsPending',
      step5DeferredToTimer: true,
      projectNumber: '25-615-02',
    });
    const done = makeStatus({
      overallStatus: 'Completed',
      step5DeferredToTimer: false,
      projectNumber: '25-615-03',
    });

    await service.upsertProvisioningStatus(pending);
    await service.upsertProvisioningStatus(done);

    const jobs = await service.listPendingStep5Jobs();
    expect(jobs.some((job) => job.projectId === pending.projectId)).toBe(true);
    expect(jobs.some((job) => job.projectId === done.projectId)).toBe(false);
  });

  it('escalates an existing provisioning row', async () => {
    const service = new RealTableStorageService();
    const status = makeStatus({ projectNumber: '25-615-04' });

    await service.upsertProvisioningStatus(status);
    await service.escalateProvisioning(status.projectId, 'admin@hb.com');

    const updated = await service.getLatestRun(status.projectId);
    expect(updated?.escalatedBy).toBe('admin@hb.com');
  });
});
