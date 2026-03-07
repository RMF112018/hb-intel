import type { IProvisioningStatus } from '@hbc/models';

export interface ITableStorageService {
  upsertProvisioningStatus(status: IProvisioningStatus): Promise<void>;
  getProvisioningStatus(projectId: string): Promise<IProvisioningStatus | null>;
  getAllPendingFullSpec(): Promise<IProvisioningStatus[]>;
  escalateProvisioning(projectId: string, escalatedBy: string): Promise<void>;
}

export class MockTableStorageService implements ITableStorageService {
  private store = new Map<string, IProvisioningStatus>();

  async upsertProvisioningStatus(status: IProvisioningStatus): Promise<void> {
    // D-PH6-01 key strategy: partitionKey = projectId, rowKey = correlationId.
    this.store.set(status.projectId, { ...status });
    console.log(
      `[MockTable] Upserted provisioning status partitionKey=${status.projectId} rowKey=${status.correlationId}`
    );
  }

  async getProvisioningStatus(projectId: string): Promise<IProvisioningStatus | null> {
    return this.store.get(projectId) ?? null;
  }

  async getAllPendingFullSpec(): Promise<IProvisioningStatus[]> {
    const results: IProvisioningStatus[] = [];
    for (const status of this.store.values()) {
      if (status.step5DeferredToTimer && status.overallStatus === 'WebPartsPending') {
        results.push({ ...status });
      }
    }
    return results;
  }

  async escalateProvisioning(projectId: string, escalatedBy: string): Promise<void> {
    const status = this.store.get(projectId);
    if (status) {
      status.escalatedBy = escalatedBy;
      status.overallStatus = 'Failed';
      status.failedAt = new Date().toISOString();
      this.store.set(projectId, status);
      console.log(`[MockTable] Escalated provisioning for ${projectId} by ${escalatedBy}`);
    }
  }
}
