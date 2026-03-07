import type { IProvisionSiteRequest, IProvisioningStatus } from './types.js';

/**
 * D-PH6-02 scaffold placeholder. Full API client implementation lands in PH6.9.
 */
export const provisioningApiClient = {
  async triggerProvisioning(_request: IProvisionSiteRequest): Promise<IProvisioningStatus> {
    throw new Error('Not implemented yet. Planned for PH6.9.');
  },
};
