/**
 * D-PH6-01: Request body for triggering a new provisioning saga.
 * Traceability: docs/architecture/plans/PH6.1-Foundation-DataModel.md §6.1.2
 */
export interface IProvisionSiteRequest {
    /** Immutable auto-generated project identifier (UUID v4). */
    projectId: string;
    /** Human-assigned project number. Format: ##-###-## (e.g. "25-001-01"). */
    projectNumber: string;
    /** Display name of the project. */
    projectName: string;
    /** UPN of the user who triggered provisioning (from validated Bearer token). */
    triggeredBy: string;
    /** Correlation ID for this provisioning run (UUID v4, generated at trigger time). */
    correlationId: string;
    /** Members to be added to the project SharePoint group. Array of UPNs. */
    groupMembers: string[];
    /** UPN of the Estimating Coordinator who submitted the Project Setup Request. */
    submittedBy: string;
}
/**
 * D-PH6-01: Authoritative provisioning run record stored in Azure Table Storage.
 * Traceability: docs/architecture/plans/PH6.1-Foundation-DataModel.md §6.1.2
 */
export interface IProvisioningStatus {
    projectId: string;
    projectNumber: string;
    projectName: string;
    correlationId: string;
    overallStatus: 'NotStarted' | 'InProgress' | 'BaseComplete' | 'Completed' | 'Failed' | 'WebPartsPending';
    currentStep: number;
    steps: ISagaStepResult[];
    siteUrl?: string;
    triggeredBy: string;
    submittedBy: string;
    groupMembers: string[];
    startedAt: string;
    completedAt?: string;
    failedAt?: string;
    step5DeferredToTimer: boolean;
    retryCount: number;
    escalatedBy?: string;
}
/** D-PH6-01: Result for a single saga step execution. */
export interface ISagaStepResult {
    stepNumber: number;
    stepName: string;
    status: 'NotStarted' | 'InProgress' | 'Completed' | 'Failed' | 'Skipped' | 'DeferredToTimer';
    startedAt?: string;
    completedAt?: string;
    errorMessage?: string;
    /** Whether this step was skipped because idempotency check confirmed it was already done. */
    idempotentSkip?: boolean;
}
/**
 * D-PH6-01 / D-PH6-02: Payload sent to SignalR group on each step state change.
 * Traceability: docs/architecture/plans/PH6.1-Foundation-DataModel.md §6.1.2
 */
export interface IProvisioningProgressEvent {
    projectId: string;
    projectNumber: string;
    projectName: string;
    correlationId: string;
    stepNumber: number;
    stepName: string;
    status: ISagaStepResult['status'];
    overallStatus: IProvisioningStatus['overallStatus'];
    timestamp: string;
    errorMessage?: string;
}
/** D-PH6-01: Project Setup Request — submitted by Estimating Coordinator. */
export interface IProjectSetupRequest {
    requestId: string;
    projectId: string;
    projectName: string;
    projectLocation: string;
    projectType: string;
    projectStage: 'Pursuit' | 'Active';
    submittedBy: string;
    submittedAt: string;
    state: ProjectSetupRequestState;
    projectNumber?: string;
    groupMembers: string[];
    clarificationNote?: string;
    completedBy?: string;
    completedAt?: string;
}
export type ProjectSetupRequestState = 'Submitted' | 'UnderReview' | 'NeedsClarification' | 'AwaitingExternalSetup' | 'ReadyToProvision' | 'Provisioning' | 'Completed' | 'Failed';
/** D-PH6-01: Audit record written to the SharePoint ProvisioningAuditLog list. */
export interface IProvisioningAuditRecord {
    projectId: string;
    projectNumber: string;
    projectName: string;
    correlationId: string;
    event: 'Started' | 'Completed' | 'Failed';
    triggeredBy: string;
    submittedBy: string;
    timestamp: string;
    siteUrl?: string;
    errorSummary?: string;
}
//# sourceMappingURL=IProvisioning.d.ts.map