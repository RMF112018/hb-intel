import type { IProjectSetupRequest, IProvisioningStatus, ProjectSetupRequestState } from '@hbc/models';

/**
 * Data provider interface for admin monitors that need provisioning data.
 *
 * Consumers (PWA shell, SPFx app) satisfy this by wrapping the provisioning
 * API client. This avoids a direct @hbc/features-admin → @hbc/provisioning dependency.
 *
 * @design G6-T04
 */
export interface IProvisioningDataProvider {
  listRequests(state?: ProjectSetupRequestState): Promise<IProjectSetupRequest[]>;
  listProvisioningRuns(status?: string): Promise<IProvisioningStatus[]>;
}
