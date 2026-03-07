import type { IProjectSetupRequest, IProvisioningProgressEvent, IProvisioningStatus } from '@hbc/models';
export interface IProvisioningStore {
    requests: IProjectSetupRequest[];
    requestsLoading: boolean;
    requestsError: string | null;
    setRequests: (requests: IProjectSetupRequest[]) => void;
    setRequestsLoading: (loading: boolean) => void;
    setRequestsError: (error: string | null) => void;
    upsertRequest: (request: IProjectSetupRequest) => void;
    statusByProjectId: Record<string, IProvisioningStatus>;
    setProvisioningStatus: (status: IProvisioningStatus) => void;
    latestEventByProjectId: Record<string, IProvisioningProgressEvent>;
    handleProgressEvent: (event: IProvisioningProgressEvent) => void;
    signalRConnected: boolean;
    setSignalRConnected: (connected: boolean) => void;
}
/**
 * D-PH6-09 shared headless provisioning Zustand slice.
 * Traceability: docs/architecture/plans/PH6.9-Provisioning-Package.md §6.9.2
 */
export declare const useProvisioningStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<IProvisioningStore>, "setState"> & {
    setState(nextStateOrUpdater: IProvisioningStore | Partial<IProvisioningStore> | ((state: import("immer").WritableDraft<IProvisioningStore>) => void), shouldReplace?: false): void;
    setState(nextStateOrUpdater: IProvisioningStore | ((state: import("immer").WritableDraft<IProvisioningStore>) => void), shouldReplace: true): void;
}>;
//# sourceMappingURL=store.d.ts.map