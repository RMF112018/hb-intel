export interface IUseProvisioningSignalROptions {
    /** The negotiate endpoint URL (Function App base URL + /api/provisioning-negotiate) */
    negotiateUrl: string;
    /** The projectId to connect to */
    projectId: string;
    /** Factory function that returns the current Bearer token for the Function App */
    getToken: () => Promise<string>;
    /** Whether the connection should be active (e.g. false when no projectId) */
    enabled?: boolean;
}
/**
 * D-PH6-09 managed SignalR hook for provisioning progress events.
 * Traceability: docs/architecture/plans/PH6.9-Provisioning-Package.md §6.9.3
 */
export declare function useProvisioningSignalR({ negotiateUrl, projectId, getToken, enabled, }: IUseProvisioningSignalROptions): {
    isConnected: boolean;
};
//# sourceMappingURL=useProvisioningSignalR.d.ts.map