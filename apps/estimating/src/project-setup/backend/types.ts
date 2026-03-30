import type { IProjectSetupRequest, IProvisioningStatus } from '@hbc/models';

export interface IProjectSetupClient {
  listRequests(): Promise<IProjectSetupRequest[]>;
  submitRequest(data: Partial<IProjectSetupRequest>): Promise<IProjectSetupRequest>;
  getProvisioningStatus(projectId: string): Promise<IProvisioningStatus | null>;
  retryProvisioning(projectId: string): Promise<void>;
  escalateProvisioning(projectId: string, escalatedBy: string): Promise<void>;
}
