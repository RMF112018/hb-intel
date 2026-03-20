import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IProvisioningStatus } from '@hbc/models';

const mockCreateTable = vi.fn(async () => {});
const mockUpsertEntity = vi.fn(async () => {});
const mockListEntities = vi.fn();

const fromConnectionString = vi.fn(() => ({
  createTable: mockCreateTable,
  upsertEntity: mockUpsertEntity,
  listEntities: mockListEntities,
}));

vi.mock('@azure/data-tables', () => ({
  AzureNamedKeyCredential: class AzureNamedKeyCredential {},
  TableClient: {
    fromConnectionString,
  },
  odata: (_strings: TemplateStringsArray, ...values: unknown[]) => values.join(' '),
}));

/**
 * D-PH6-15 Layer 1 mocked table adapter tests.
 * Complements Azurite integration coverage by exercising branch logic deterministically.
 */
describe('D-PH6-15 RealTableStorageService (mocked TableClient)', () => {
  beforeEach(() => {
    vi.resetModules();
    mockCreateTable.mockClear();
    mockUpsertEntity.mockClear();
    mockListEntities.mockReset();
    fromConnectionString.mockClear();
    process.env.AZURE_TABLE_ENDPOINT = 'UseDevelopmentStorage=true';
  });

  const makeStatus = (overrides: Partial<IProvisioningStatus> = {}): IProvisioningStatus => ({
    projectId: overrides.projectId ?? 'project-1',
    projectNumber: overrides.projectNumber ?? '25-001-01',
    projectName: overrides.projectName ?? 'Project 1',
    correlationId: overrides.correlationId ?? 'corr-1',
    overallStatus: overrides.overallStatus ?? 'InProgress',
    currentStep: overrides.currentStep ?? 5,
    steps: overrides.steps ?? [{ stepNumber: 5, stepName: 'Install Web Parts', status: 'DeferredToTimer' }],
    siteUrl: overrides.siteUrl,
    triggeredBy: overrides.triggeredBy ?? 'controller@hb.com',
    submittedBy: overrides.submittedBy ?? 'submitter@hb.com',
    groupMembers: overrides.groupMembers ?? ['member@hb.com'],
    startedAt: overrides.startedAt ?? '2026-03-07T00:00:00.000Z',
    completedAt: overrides.completedAt,
    failedAt: overrides.failedAt,
    step5DeferredToTimer: overrides.step5DeferredToTimer ?? true,
    step5TimerRetryCount: overrides.step5TimerRetryCount ?? 0,
    retryCount: overrides.retryCount ?? 0,
    escalatedBy: overrides.escalatedBy,
  });

  it('upserts serialized provisioning status entities', async () => {
    const { RealTableStorageService } = await import('./table-storage-service.js');
    const service = new RealTableStorageService();

    await service.upsertProvisioningStatus(makeStatus());

    expect(mockUpsertEntity).toHaveBeenCalledWith(
      expect.objectContaining({
        partitionKey: 'project-1',
        rowKey: 'corr-1',
        projectNumber: '25-001-01',
      }),
      'Replace'
    );
  });

  it('returns latest run by startedAt ordering', async () => {
    const { RealTableStorageService } = await import('./table-storage-service.js');
    const service = new RealTableStorageService();

    const rows = [
      {
        partitionKey: 'project-1',
        rowKey: 'corr-old',
        projectNumber: '25-001-01',
        projectName: 'Old',
        overallStatus: 'InProgress',
        currentStep: 4,
        stepsJson: '[]',
        siteUrl: '',
        triggeredBy: 'a@hb.com',
        submittedBy: 'b@hb.com',
        groupMembersJson: '[]',
        startedAt: '2026-03-07T00:00:00.000Z',
        completedAt: '',
        failedAt: '',
        step5DeferredToTimer: false,
        step5TimerRetryCount: 0,
        retryCount: 0,
        escalatedBy: '',
      },
      {
        partitionKey: 'project-1',
        rowKey: 'corr-new',
        projectNumber: '25-001-01',
        projectName: 'New',
        overallStatus: 'Completed',
        currentStep: 7,
        stepsJson: '[]',
        siteUrl: 'https://x',
        triggeredBy: 'a@hb.com',
        submittedBy: 'b@hb.com',
        groupMembersJson: '["u@hb.com"]',
        startedAt: '2026-03-07T01:00:00.000Z',
        completedAt: '2026-03-07T01:10:00.000Z',
        failedAt: '',
        step5DeferredToTimer: false,
        step5TimerRetryCount: 0,
        retryCount: 1,
        escalatedBy: '',
      },
    ];

    mockListEntities.mockReturnValueOnce((async function* () {
      for (const row of rows) yield row;
    })());

    const result = await service.getLatestRun('project-1');
    expect(result?.correlationId).toBe('corr-new');
    expect(result?.siteUrl).toBe('https://x');
  });

  it('lists pending and failed runs and escalates latest run', async () => {
    const { RealTableStorageService } = await import('./table-storage-service.js');
    const service = new RealTableStorageService();

    const pendingRow = {
      partitionKey: 'project-pending',
      rowKey: 'corr-pending',
      projectNumber: '25-001-02',
      projectName: 'Pending',
      overallStatus: 'WebPartsPending',
      currentStep: 5,
      stepsJson: '[]',
      siteUrl: '',
      triggeredBy: 'a@hb.com',
      submittedBy: 'b@hb.com',
      groupMembersJson: '[]',
      startedAt: '2026-03-07T01:00:00.000Z',
      completedAt: '',
      failedAt: '',
      step5DeferredToTimer: true,
      step5TimerRetryCount: 1,
      retryCount: 0,
      escalatedBy: '',
    };

    const failedRow = {
      ...pendingRow,
      partitionKey: 'project-failed',
      rowKey: 'corr-failed',
      overallStatus: 'Failed',
      step5DeferredToTimer: false,
    };

    mockListEntities
      .mockReturnValueOnce((async function* () {
        yield pendingRow;
      })())
      .mockReturnValueOnce((async function* () {
        yield failedRow;
      })())
      .mockReturnValueOnce((async function* () {
        yield {
          ...pendingRow,
          partitionKey: 'project-escalate',
          rowKey: 'corr-escalate',
          overallStatus: 'InProgress',
          step5DeferredToTimer: false,
        };
      })());

    const pending = await service.listPendingStep5Jobs();
    const failed = await service.listFailedRuns();

    await service.escalateProvisioning('project-escalate', 'admin@hb.com');

    expect(pending).toHaveLength(1);
    expect(failed).toHaveLength(1);
    expect(mockUpsertEntity).toHaveBeenLastCalledWith(
      expect.objectContaining({ partitionKey: 'project-escalate', escalatedBy: 'admin@hb.com' }),
      'Replace'
    );
  });
});
