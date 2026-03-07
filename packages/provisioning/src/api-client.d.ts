import type { IProjectSetupRequest, IProvisioningStatus, ProjectSetupRequestState } from '@hbc/models';
export interface IProvisioningApiClient {
    submitRequest(data: Partial<IProjectSetupRequest>): Promise<IProjectSetupRequest>;
    listRequests(state?: ProjectSetupRequestState): Promise<IProjectSetupRequest[]>;
    advanceState(requestId: string, newState: ProjectSetupRequestState, extras?: {
        projectNumber?: string;
        clarificationNote?: string;
    }): Promise<IProjectSetupRequest>;
    getProvisioningStatus(projectId: string): Promise<IProvisioningStatus | null>;
    listFailedRuns(): Promise<IProvisioningStatus[]>;
    retryProvisioning(projectId: string): Promise<void>;
    escalateProvisioning(projectId: string, escalatedBy: string): Promise<void>;
}
/**
 * D-PH6-09 API-client factory for all provisioning/request lifecycle endpoints.
 * Traceability: docs/architecture/plans/PH6.9-Provisioning-Package.md §6.9.1
 */
export declare function createProvisioningApiClient(baseUrl: string, getToken: () => Promise<string>): IProvisioningApiClient;
//# sourceMappingURL=api-client.d.ts.map