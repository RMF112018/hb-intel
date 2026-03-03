import type { IProvisioningStatus } from '@hbc/models';

export interface ITableStorageService {
  upsertProvisioningStatus(status: IProvisioningStatus): Promise<void>;
  getProvisioningStatus(projectCode: string): Promise<IProvisioningStatus | null>;
  getAllPendingFullSpec(): Promise<IProvisioningStatus[]>;
  escalateProvisioning(projectCode: string, escalatedBy: string): Promise<void>;
}

export class MockTableStorageService implements ITableStorageService {
  private store = new Map<string, IProvisioningStatus>();

  async upsertProvisioningStatus(status: IProvisioningStatus): Promise<void> {
    this.store.set(status.projectCode, { ...status });
    console.log(`[MockTable] Upserted provisioning status for ${status.projectCode}`);
  }

  async getProvisioningStatus(projectCode: string): Promise<IProvisioningStatus | null> {
    return this.store.get(projectCode) ?? null;
  }

  async getAllPendingFullSpec(): Promise<IProvisioningStatus[]> {
    const results: IProvisioningStatus[] = [];
    for (const status of this.store.values()) {
      if (status.fullSpecDeferred && status.overallStatus === 'Completed') {
        results.push({ ...status });
      }
    }
    return results;
  }

  async escalateProvisioning(projectCode: string, escalatedBy: string): Promise<void> {
    const status = this.store.get(projectCode);
    if (status) {
      status.escalated = true;
      status.escalatedAt = new Date().toISOString();
      status.escalatedBy = escalatedBy;
      status.overallStatus = 'Escalated';
      this.store.set(projectCode, status);
      console.log(`[MockTable] Escalated provisioning for ${projectCode} by ${escalatedBy}`);
    }
  }
}
