import type { IProvisioningStatus } from './types.js';

export interface IProvisioningStore {
  statusByProjectId: Record<string, IProvisioningStatus>;
}

/**
 * D-PH6-02 scaffold placeholder. Zustand store implementation lands in PH6.9.
 */
export function useProvisioningStore(): IProvisioningStore {
  return { statusByProjectId: {} };
}
