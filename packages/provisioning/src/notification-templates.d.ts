/**
 * D-PH6-09 notification templates used across lifecycle and provisioning updates.
 * Traceability: docs/architecture/plans/PH6.9-Provisioning-Package.md §6.9.5
 */
export declare const NOTIFICATION_TEMPLATES: {
    readonly NeedsClarification: (projectName: string, note: string) => {
        subject: string;
        body: string;
    };
    readonly ReadyToProvision: (projectName: string) => {
        subject: string;
        body: string;
    };
    readonly ProvisioningStarted: (projectNumber: string, projectName: string) => {
        body: string;
    };
    readonly ProvisioningCompleted: (projectNumber: string, projectName: string) => {
        body: string;
    };
    readonly ProvisioningFailed: (projectNumber: string, projectName: string) => {
        subject: string;
        body: string;
    };
};
//# sourceMappingURL=notification-templates.d.ts.map