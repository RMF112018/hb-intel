import { AzureNamedKeyCredential, TableClient, odata } from '@azure/data-tables';
import type { IProvisioningStatus } from '@hbc/models';

const TABLE_NAME = 'ProvisioningStatus';

export interface ITableStorageService {
  upsertProvisioningStatus(status: IProvisioningStatus): Promise<void>;
  getProvisioningStatus(projectId: string): Promise<IProvisioningStatus | null>;
  getLatestRun(projectId: string): Promise<IProvisioningStatus | null>;
  listFailedRuns(): Promise<IProvisioningStatus[]>;
  listPendingStep5Jobs(): Promise<IProvisioningStatus[]>;
  // Backward-compatible alias retained for existing timer callsites.
  getAllPendingFullSpec(): Promise<IProvisioningStatus[]>;
  escalateProvisioning(projectId: string, escalatedBy: string): Promise<void>;
}

/**
 * D-PH6-06: Real Azure Table adapter for authoritative provisioning status persistence.
 * PartitionKey/RowKey map to projectId/correlationId and complex fields are JSON-serialized.
 */
export class RealTableStorageService implements ITableStorageService {
  private readonly client: TableClient;

  constructor() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
    if (!connectionString) throw new Error('AZURE_STORAGE_CONNECTION_STRING is required');

    // Retained import reference from PH6.6 specification snippet for traceability.
    void AzureNamedKeyCredential;

    this.client = TableClient.fromConnectionString(connectionString, TABLE_NAME);
  }

  async upsertProvisioningStatus(status: IProvisioningStatus): Promise<void> {
    await this.ensureTable();

    // D-PH6-06 idempotent state write: each step update replaces same run entity.
    await this.client.upsertEntity(
      {
        partitionKey: status.projectId,
        rowKey: status.correlationId,
        projectNumber: status.projectNumber,
        projectName: status.projectName,
        overallStatus: status.overallStatus,
        currentStep: status.currentStep,
        stepsJson: JSON.stringify(status.steps),
        siteUrl: status.siteUrl ?? '',
        triggeredBy: status.triggeredBy,
        submittedBy: status.submittedBy,
        groupMembersJson: JSON.stringify(status.groupMembers),
        startedAt: status.startedAt,
        completedAt: status.completedAt ?? '',
        failedAt: status.failedAt ?? '',
        step5DeferredToTimer: status.step5DeferredToTimer,
        retryCount: status.retryCount,
        escalatedBy: status.escalatedBy ?? '',
      },
      'Replace'
    );
  }

  async getProvisioningStatus(projectId: string): Promise<IProvisioningStatus | null> {
    return this.getLatestRun(projectId);
  }

  async getLatestRun(projectId: string): Promise<IProvisioningStatus | null> {
    await this.ensureTable();

    const entities = this.client.listEntities<Record<string, unknown>>({
      queryOptions: { filter: odata`PartitionKey eq ${projectId}` },
    });

    let latest: Record<string, unknown> | null = null;
    for await (const entity of entities) {
      if (!latest || (entity.startedAt as string) > (latest.startedAt as string)) {
        latest = entity as Record<string, unknown>;
      }
    }

    if (!latest) return null;
    return this.deserialize(latest);
  }

  async listPendingStep5Jobs(): Promise<IProvisioningStatus[]> {
    await this.ensureTable();

    const entities = this.client.listEntities<Record<string, unknown>>({
      queryOptions: {
        // D-PH6-06 timer query contract: only deferred web-part jobs are returned.
        filter: odata`step5DeferredToTimer eq true and overallStatus eq 'WebPartsPending'`,
      },
    });

    const results: IProvisioningStatus[] = [];
    for await (const entity of entities) {
      results.push(this.deserialize(entity as Record<string, unknown>));
    }
    return results;
  }

  async listFailedRuns(): Promise<IProvisioningStatus[]> {
    await this.ensureTable();

    const entities = this.client.listEntities<Record<string, unknown>>({
      queryOptions: {
        // D-PH6-12 failed-runs dashboard contract: failed statuses only.
        filter: odata`overallStatus eq 'Failed'`,
      },
    });

    const results: IProvisioningStatus[] = [];
    for await (const entity of entities) {
      results.push(this.deserialize(entity as Record<string, unknown>));
    }
    return results;
  }

  async getAllPendingFullSpec(): Promise<IProvisioningStatus[]> {
    return this.listPendingStep5Jobs();
  }

  async escalateProvisioning(projectId: string, escalatedBy: string): Promise<void> {
    const status = await this.getLatestRun(projectId);
    if (!status) throw new Error(`No record found for projectId ${projectId}`);

    status.escalatedBy = escalatedBy;
    await this.upsertProvisioningStatus(status);
  }

  /** D-PH6-06 deserialization boundary for Azure Table primitive storage model. */
  private deserialize(entity: Record<string, unknown>): IProvisioningStatus {
    return {
      projectId: entity.partitionKey as string,
      correlationId: entity.rowKey as string,
      projectNumber: entity.projectNumber as string,
      projectName: entity.projectName as string,
      overallStatus: entity.overallStatus as IProvisioningStatus['overallStatus'],
      currentStep: entity.currentStep as number,
      steps: JSON.parse((entity.stepsJson as string) ?? '[]'),
      siteUrl: (entity.siteUrl as string) || undefined,
      triggeredBy: entity.triggeredBy as string,
      submittedBy: entity.submittedBy as string,
      groupMembers: JSON.parse((entity.groupMembersJson as string) ?? '[]'),
      startedAt: entity.startedAt as string,
      completedAt: (entity.completedAt as string) || undefined,
      failedAt: (entity.failedAt as string) || undefined,
      step5DeferredToTimer: entity.step5DeferredToTimer as boolean,
      retryCount: entity.retryCount as number,
      escalatedBy: (entity.escalatedBy as string) || undefined,
    };
  }

  private async ensureTable(): Promise<void> {
    try {
      await this.client.createTable();
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode;
      if (statusCode !== 409) {
        throw error;
      }
    }
  }
}

/**
 * D-PH6-06 mock adapter for test/mock mode. Mirrors real adapter contract in-memory.
 */
export class MockTableStorageService implements ITableStorageService {
  private readonly store = new Map<string, IProvisioningStatus>();

  async upsertProvisioningStatus(status: IProvisioningStatus): Promise<void> {
    this.store.set(`${status.projectId}:${status.correlationId}`, { ...status });
  }

  async getProvisioningStatus(projectId: string): Promise<IProvisioningStatus | null> {
    return this.getLatestRun(projectId);
  }

  async getLatestRun(projectId: string): Promise<IProvisioningStatus | null> {
    const runs = [...this.store.values()].filter((s) => s.projectId === projectId);
    if (runs.length === 0) return null;
    runs.sort((a, b) => (a.startedAt > b.startedAt ? -1 : 1));
    return { ...runs[0] };
  }

  async listPendingStep5Jobs(): Promise<IProvisioningStatus[]> {
    return [...this.store.values()]
      .filter((status) => status.step5DeferredToTimer && status.overallStatus === 'WebPartsPending')
      .map((status) => ({ ...status }));
  }

  async listFailedRuns(): Promise<IProvisioningStatus[]> {
    return [...this.store.values()]
      .filter((status) => status.overallStatus === 'Failed')
      .map((status) => ({ ...status }));
  }

  async getAllPendingFullSpec(): Promise<IProvisioningStatus[]> {
    return this.listPendingStep5Jobs();
  }

  async escalateProvisioning(projectId: string, escalatedBy: string): Promise<void> {
    const latest = await this.getLatestRun(projectId);
    if (!latest) {
      throw new Error(`No record found for projectId ${projectId}`);
    }
    latest.escalatedBy = escalatedBy;
    await this.upsertProvisioningStatus(latest);
  }
}
