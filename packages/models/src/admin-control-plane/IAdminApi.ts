/**
 * Admin Control Plane — API request/response DTOs.
 *
 * These types define the contract between the operator console (SPFx)
 * and the privileged backend (Azure Functions). They are transport-agnostic
 * — no HTTP status codes, no route paths, no framework-specific types.
 *
 * @module admin-control-plane
 */

import type { AdminActionKey } from './types.js';
import type { AdminDomain, AdminExecutionMode, AdminRiskLevel } from './AdminEnums.js';
import type { AdminRunStatus, IAdminActorContext } from './IAdminRun.js';

// ─── Shared Envelopes ───────────────────────────────────────────────────────────

/**
 * Standard success response envelope for all admin API responses.
 */
export interface IAdminApiResponse<T> {
  /** Response payload */
  readonly data: T;

  /** Request correlation ID for tracing */
  readonly requestId: string;
}

/**
 * Standard list response envelope with pagination.
 */
export interface IAdminApiListResponse<T> {
  /** List items */
  readonly items: readonly T[];

  /** Pagination metadata */
  readonly pagination: {
    readonly total: number;
    readonly page: number;
    readonly pageSize: number;
    readonly totalPages: number;
  };

  /** Request correlation ID */
  readonly requestId: string;
}

/**
 * Structured admin API error.
 *
 * Consistent with existing backend response helpers (errorResponse shape)
 * but extended with admin-specific context.
 */
export interface IAdminApiError {
  /** Machine-readable error code */
  readonly code: string;

  /** Human-readable error message */
  readonly message: string;

  /** Request correlation ID */
  readonly requestId: string;

  /** Field-level validation errors (for input validation failures) */
  readonly fieldErrors?: readonly IAdminFieldError[];

  /** Run ID if the error is associated with a specific run */
  readonly runId?: string;
}

/**
 * Field-level validation error detail.
 */
export interface IAdminFieldError {
  /** Field path (dot-notation for nested fields) */
  readonly field: string;

  /** Validation error message */
  readonly message: string;
}

// ─── Run Launch ─────────────────────────────────────────────────────────────────

/**
 * Request to launch a new admin run.
 */
export interface IAdminRunLaunchRequest {
  /** Action key from the action catalog */
  readonly actionKey: AdminActionKey;

  /** Domain-specific command payload (opaque to the envelope) */
  readonly commandInput: Record<string, unknown>;

  /** Domain-specific entity ID this run targets (e.g., projectId, groupId) */
  readonly targetEntityId?: string;

  /** Whether to execute as dry-run / preview only */
  readonly dryRun?: boolean;
}

/**
 * Response after successfully launching a run.
 */
export interface IAdminRunLaunchResponse {
  /** The newly created run ID */
  readonly runId: string;

  /** Initial run status (typically Pending or Validating) */
  readonly status: AdminRunStatus;

  /** Action that was launched */
  readonly actionKey: AdminActionKey;

  /** Execution mode assigned to this run */
  readonly executionMode: AdminExecutionMode;

  /** Risk level assigned to this run */
  readonly riskLevel: AdminRiskLevel;
}

// ─── Run Status / Detail / History ──────────────────────────────────────────────

/**
 * Request to get run status or detail.
 */
export interface IAdminRunStatusRequest {
  /** Run ID to query */
  readonly runId: string;
}

/**
 * Request to list run history.
 */
export interface IAdminRunHistoryRequest {
  /** Filter by domain (optional) */
  readonly domain?: AdminDomain;

  /** Filter by status (optional) */
  readonly status?: AdminRunStatus;

  /** Filter by target entity ID (optional) */
  readonly targetEntityId?: string;

  /** Page number (1-based) */
  readonly page?: number;

  /** Page size */
  readonly pageSize?: number;
}

/**
 * Summary-level run record for list/history views.
 */
export interface IAdminRunSummary {
  readonly runId: string;
  readonly actionKey: AdminActionKey;
  readonly domain: AdminDomain;
  readonly riskLevel: AdminRiskLevel;
  readonly executionMode: AdminExecutionMode;
  readonly status: AdminRunStatus;
  readonly targetEntityId: string | null;
  readonly targetEntityLabel: string | null;
  readonly initiatedBy: IAdminActorContext;
  readonly totalSteps: number;
  readonly currentStep: number | null;
  readonly createdAt: string;
  readonly startedAt: string | null;
  readonly completedAt: string | null;
}

// ─── Run Control ────────────────────────────────────────────────────────────────

/**
 * Request to cancel a running or pending run.
 */
export interface IAdminRunCancelRequest {
  /** Run ID to cancel */
  readonly runId: string;

  /** Reason for cancellation */
  readonly reason: string;
}

/**
 * Request to retry a failed run.
 * Creates a new run linked to the failed run via parentRunId.
 */
export interface IAdminRunRetryRequest {
  /** Run ID of the failed run to retry */
  readonly runId: string;
}

/**
 * Response after requesting a retry (a new run is created).
 */
export interface IAdminRunRetryResponse {
  /** The new run ID created for the retry */
  readonly newRunId: string;

  /** The original failed run ID (now the parentRunId of the new run) */
  readonly originalRunId: string;

  /** Retry count on the new run */
  readonly retryCount: number;
}

// ─── Checkpoint / Approval ──────────────────────────────────────────────────────

/**
 * Request to record a checkpoint decision (approve or reject continuation).
 */
export interface IAdminCheckpointDecisionRequest {
  /** Run ID with the pending checkpoint */
  readonly runId: string;

  /** Step number at the checkpoint */
  readonly stepNumber: number;

  /** Operator's decision */
  readonly decision: 'approve' | 'reject';

  /** Optional comment explaining the decision */
  readonly comment?: string;
}

/**
 * Response after recording a checkpoint decision.
 */
export interface IAdminCheckpointDecisionResponse {
  readonly runId: string;
  readonly stepNumber: number;
  readonly decision: 'approve' | 'reject';

  /** Updated run status after the decision */
  readonly updatedStatus: AdminRunStatus;
}

// ─── Validation / Preflight ─────────────────────────────────────────────────────

/**
 * Request to run a preflight validation check.
 */
export interface IAdminPreflightRequest {
  /** Action key to validate prerequisites for */
  readonly actionKey: AdminActionKey;

  /** Domain-specific command payload to validate */
  readonly commandInput: Record<string, unknown>;

  /** Target entity to validate against (optional) */
  readonly targetEntityId?: string;
}

/**
 * Preflight validation result.
 */
export interface IAdminPreflightResponse {
  /** Whether all preflight checks passed */
  readonly ready: boolean;

  /** Individual check results */
  readonly checks: readonly IAdminPreflightCheck[];
}

/**
 * Preflight check severity levels.
 */
export type PreflightSeverity = 'critical' | 'warning' | 'info';

/**
 * Preflight check category for grouping in the UI.
 */
export type PreflightCategory =
  | 'backend-config'
  | 'auth-identity'
  | 'sharepoint'
  | 'graph-entra'
  | 'persistence'
  | 'install-compatibility';

/**
 * A single preflight validation check result.
 */
export interface IAdminPreflightCheck {
  /** Check identifier (machine-readable code) */
  readonly checkId: string;

  /** Human-readable check label */
  readonly label: string;

  /** Whether this check passed */
  readonly passed: boolean;

  /** Detail message (especially useful when failed) */
  readonly message: string;

  /** Whether this check is blocking (must pass to proceed) */
  readonly blocking: boolean;

  /** Check category for grouping */
  readonly category: PreflightCategory;

  /** Severity level */
  readonly severity: PreflightSeverity;

  /** Recommended operator action when check fails */
  readonly recommendedAction?: string;

  /** Whether a manual checkpoint or admin approval may resolve this check */
  readonly resolvableByCheckpoint?: boolean;
}

// ─── Preview / Dry-Run ──────────────────────────────────────────────────────────

/**
 * Response from a preview / dry-run execution.
 */
export interface IAdminPreviewResponse {
  /** The action that was previewed */
  readonly actionKey: AdminActionKey;

  /** What would change if executed */
  readonly impactSummary: readonly IAdminPreviewImpactItem[];

  /** Risk assessment */
  readonly riskLevel: AdminRiskLevel;

  /** Whether the preview detected any issues */
  readonly warnings: readonly string[];
}

/**
 * A single impact item in a preview result.
 */
export interface IAdminPreviewImpactItem {
  /** What resource would be affected */
  readonly resource: string;

  /** Type of change (create, update, delete, no-change) */
  readonly changeType: 'create' | 'update' | 'delete' | 'no-change';

  /** Human-readable description of the impact */
  readonly description: string;
}

// ─── Config / Standards ─────────────────────────────────────────────────────────

/**
 * Request to get current configuration state.
 */
export interface IAdminConfigRequest {
  /** Config domain or scope to query */
  readonly scope: string;
}

/**
 * Configuration state response.
 */
export interface IAdminConfigResponse {
  /** Config scope */
  readonly scope: string;

  /** Current config version identifier */
  readonly version: string;

  /** ISO 8601 timestamp of last modification */
  readonly lastModifiedAt: string;

  /** Who last modified this config */
  readonly lastModifiedBy: IAdminActorContext | null;

  /** Config values (domain-specific) */
  readonly values: Record<string, unknown>;
}

// ─── Action Metadata ────────────────────────────────────────────────────────────

/**
 * Request to list available admin actions / capabilities.
 */
export interface IAdminActionMetadataRequest {
  /** Filter by domain (optional) */
  readonly domain?: AdminDomain;
}

/**
 * Metadata for an available admin action.
 */
export interface IAdminActionMetadata {
  /** Action key */
  readonly actionKey: AdminActionKey;

  /** Human-readable label */
  readonly label: string;

  /** Description */
  readonly description: string;

  /** Domain */
  readonly domain: AdminDomain;

  /** Risk level */
  readonly riskLevel: AdminRiskLevel;

  /** Execution mode */
  readonly executionMode: AdminExecutionMode;

  /** Whether preview/dry-run is available */
  readonly supportsPreview: boolean;

  /** Whether the action is currently available (prerequisites met) */
  readonly available: boolean;

  /** Reason unavailable (null if available) */
  readonly unavailableReason: string | null;
}
