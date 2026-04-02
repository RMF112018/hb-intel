/**
 * W0-G1-T02: Department classification for background viewer access lookup.
 */
export type ProjectDepartment = 'commercial' | 'luxury-residential';

/**
 * W0-G4-T02: Backend-assigned failure classification for coordinator retry gating.
 * Only the backend may assign this value — agents must NOT infer it from error strings.
 */
export type ProvisioningFailureClass = 'transient' | 'structural' | 'permissions' | 'repeated' | 'admin-class';

/**
 * W0-G1-T02: Entra ID security group IDs created during provisioning Step 6.
 * Stored on IProvisioningStatus for post-provisioning membership management.
 */
export interface IEntraGroupSet {
  leadersGroupId: string;
  teamGroupId: string;
  viewersGroupId: string;
}

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
  /** P9-G5-05: Entra Object ID of the user who triggered provisioning. */
  triggeredByOid?: string;
  /** Correlation ID for this provisioning run (UUID v4, generated at trigger time). */
  correlationId: string;
  /** P2-04: Correlation ID of the prior run when this is a retry. Preserves traceability chain. */
  parentCorrelationId?: string;
  /** Members to be added to the project Team group. Array of UPNs. */
  groupMembers: string[];
  /** UPN of the Estimating Coordinator who submitted the Project Setup Request. */
  submittedBy: string;
  /** P9-G5-05: Entra Object ID of the Estimating Coordinator who submitted. */
  submittedByOid?: string;
  /** W0-G1-T02: UPNs for the Leaders group (Full Control). */
  groupLeaders?: string[];
  /** W0-G1-T02: Department for background viewer access lookup. */
  department?: ProjectDepartment;
  /** P5-04: Carried forward on retry so the new run inherits the accumulated retry count. */
  retryCount?: number;
  /** P5-04: Carried forward on retry so the new run records when the retry was initiated. */
  lastRetryAt?: string;
}

/**
 * D-PH6-01 / P4-02: Authoritative provisioning run record stored in Azure Table Storage.
 *
 * **Durable persistence model (P4-02):**
 * - One entity per saga run. PartitionKey = `projectId`, RowKey = `correlationId`.
 * - Retries create new rows with new `correlationId` in the same partition.
 * - Each step upserts the full entity using Replace mode (idempotent).
 *
 * **Canonical read model:**
 * - `getProvisioningStatus(projectId)` returns the latest run by `startedAt` timestamp.
 * - Admin `listAllRuns()` can access all historical rows across partitions.
 * - Client stores key status by `projectId` (one entry = latest run).
 *
 * **Correlation chain:**
 * - `projectId` links to the project setup request (request.projectId = status.projectId).
 * - `correlationId` is the unique run identity (UUID v4, generated at launch).
 * - On retry, the new run gets a fresh `correlationId`; the previous run's
 *   `correlationId` is passed as `parentCorrelationId` on the launch request
 *   for traceability (see `IProvisionSiteRequest.parentCorrelationId`).
 *
 * Traceability: docs/reference/provisioning/durable-status-contract.md
 */
export interface IProvisioningStatus {
  /** Immutable project identifier (UUID v4). Azure Table PartitionKey. */
  projectId: string;
  /** Human-assigned project number. Format: ##-###-## (e.g. "25-001-01"). */
  projectNumber: string;
  /** Display name of the project. */
  projectName: string;
  /** Unique run identity (UUID v4). Azure Table RowKey. Generated at launch time. */
  correlationId: string;
  /** Saga lifecycle status. Terminal states: Completed, Failed. */
  overallStatus: 'NotStarted' | 'InProgress' | 'BaseComplete' | 'Completed' | 'Failed' | 'WebPartsPending';
  /** Current executing step (1-7), or 0 before first step begins. */
  currentStep: number;
  /** Per-step execution results. Always 7 entries (one per saga step). */
  steps: ISagaStepResult[];
  /** SharePoint site URL. Populated by Step 1 on successful site creation. */
  siteUrl?: string;
  /** UPN of the user who triggered this provisioning run. */
  triggeredBy: string;
  /** P9-G5-05: Entra Object ID of the user who triggered provisioning. */
  triggeredByOid?: string;
  /** UPN of the Estimating Coordinator who submitted the original request. */
  submittedBy: string;
  /** P9-G5-05: Entra Object ID of the Estimating Coordinator. */
  submittedByOid?: string;
  /** UPNs for the project Team group membership. */
  groupMembers: string[];
  /** ISO 8601 timestamp when this run started. Used as sort key for latest-run reads. */
  startedAt: string;
  /** ISO 8601 timestamp of terminal success. */
  completedAt?: string;
  /** ISO 8601 timestamp of terminal failure. */
  failedAt?: string;
  /** Whether Step 5 (Install Web Parts) was deferred to the overnight timer. */
  step5DeferredToTimer: boolean;
  /** D-PH6-13: Count of consecutive overnight timer retries for deferred Step 5. Ceiling: 3. */
  step5TimerRetryCount: number;
  /** Total provisioning retry count across all runs for this project. */
  retryCount: number;
  /** UPN of the admin who escalated this run for attention. */
  escalatedBy?: string;
  /** W0-G1-T02: UPNs for the Leaders group (Full Control). */
  groupLeaders?: string[];
  /** W0-G1-T02: Department for background viewer access lookup. */
  department?: ProjectDepartment;
  /** W0-G1-T02: Entra ID group IDs created during Step 6. */
  entraGroups?: IEntraGroupSet;
  /** W0-G4-T02: Backend-assigned failure classification for coordinator retry gating. */
  failureClass?: ProvisioningFailureClass;
  /** W0-G4-T02: ISO timestamp of the most recent retry attempt. */
  lastRetryAt?: string;
  /** W0-G4-T02: ISO timestamp when the failure was escalated to admin. */
  escalatedAt?: string;
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
  /** T08: Structured metadata for step reporting (missing assets, skip counts, etc.) */
  metadata?: Record<string, unknown>;
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

import type { IRequestClarification } from './IRequestClarification.js';

/** D-PH6-01: Project Setup Request — submitted by Estimating Coordinator. */
export interface IProjectSetupRequest {
  requestId: string;
  projectId: string;
  projectName: string;
  /** W0-G4-T09: Step 1 — street address collected in the structured location group. */
  projectStreetAddress?: string;
  /** W0-G4-T09: Step 1 — city collected in the structured location group. */
  projectCity?: string;
  /** W0-G4-T09: Step 1 — county collected in the structured location group. */
  projectCounty?: string;
  /** W0-G4-T09: Step 1 — state collected in the structured location group. */
  projectState?: string;
  /** W0-G4-T09: Step 1 — zip/postal code collected in the structured location group. */
  projectZip?: string;
  /**
   * W0-G4-T09: Legacy compatibility location summary used by the current live
   * provisioning path. Derived from the structured location fields when present.
   */
  projectLocation: string;
  /** W0-G4-T10: Step 2 — office and division assignment label (optional). */
  officeDivision?: string;
  projectType: string;
  projectStage: 'Lead' | 'Pursuit' | 'Preconstruction' | 'Construction' | 'Closeout' | 'Warranty';
  submittedBy: string;
  /** P9-G5-05: Entra Object ID of the Estimating Coordinator who submitted. */
  submittedByOid?: string;
  submittedAt: string;
  state: ProjectSetupRequestState;
  projectNumber?: string;
  groupMembers: string[];
  /** W0-G1-T02: UPNs for the Leaders group (Full Control). */
  groupLeaders?: string[];
  /** W0-G1-T02: Department for background viewer access lookup. */
  department?: ProjectDepartment;
  clarificationNote?: string;
  /** P2-04: UPN of the controller who approved the request (set on ReadyToProvision). */
  approvedBy?: string;
  /** P2-04: Entra Object ID of the controller who approved the request. */
  approvedByOid?: string;
  completedBy?: string;
  /** P9-G5-05: Entra Object ID of the user who completed the request. */
  completedByOid?: string;
  completedAt?: string;
  /** W0-G3-T01: Step 1 — estimated contract value (optional). */
  estimatedValue?: number;
  /** W0-G3-T01: Step 1 — client / owner name (optional). */
  clientName?: string;
  /** W0-G3-T01: Step 1 — anticipated start date, ISO 8601 (optional). */
  startDate?: string;
  /** W0-G4-T09: Step 1 — whether the project already exists in Procore. */
  procoreProject?: 'Yes' | 'No';
  /** W0-G3-T01: Step 2 — contract type classification (optional). */
  contractType?: string;
  /** W0-G4-T11: Step 3 — project executive assignment (single person). */
  projectExecutiveUpn?: string;
  /** W0-G4-T11: Step 3 — project manager assignment (single person). */
  projectManagerUpn?: string;
  /** W0-G4-T11: Step 3 — lead estimator assignment (single person). */
  leadEstimatorUpn?: string;
  /** W0-G4-T11: Step 3 — supporting estimator assignments (multi-person). */
  supportingEstimatorUpns?: string[];
  /** W0-G4-T11: Step 3 — one eligible team member selected as Timberscan approver. */
  timberscanApproverUpn?: string;
  /** P2-07: Step 3 — UPNs requiring Sage 300 access for this project. */
  sageAccessUpns?: string[];
  /** W0-G3-T01: Step 3 — read-only viewer UPNs (optional). */
  viewerUPNs?: string[];
  /** W0-G3-T01: Step 4 — selected add-on pack slugs (optional). */
  addOns?: string[];
  /** W0-G3-T02: ISO 8601 timestamp when clarification was requested (for BIC due-date calculation). */
  clarificationRequestedAt?: string;
  /** W0-G3-T02: Whether the requester has already used their one retry opportunity on failure. */
  requesterRetryUsed?: boolean;
  /** W0-G3-T03: Structured clarification items raised by controller during review. */
  clarificationItems?: IRequestClarification[];
  /** W0-G3-T02: Provisioned SharePoint site URL (populated after provisioning completes). */
  siteUrl?: string;
  /** G6-T02: Count of provisioning retries for admin retry-eligibility gating. */
  retryCount: number;
  /**
   * Project year (four-digit, e.g. 2025). Stored in the SharePoint Projects list
   * `Year` column (Number). Used by project-sites and filtered directory views.
   *
   * Data-source rule: derived from projectNumber prefix when available (##-###-##
   * → first two digits + 2000), falling back to submission year. Explicitly
   * settable by the wizard for override.
   *
   * SharePoint internal name: `Year` (added post-import, not a field_N name).
   */
  year?: number;
}

export type ProjectSetupRequestState =
  | 'Submitted'
  | 'UnderReview'
  | 'NeedsClarification'
  | 'AwaitingExternalSetup'
  | 'ReadyToProvision'
  | 'Provisioning'
  | 'Completed'
  | 'Failed';

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
