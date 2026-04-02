/**
 * Admin Control Plane — generalized run model interfaces.
 *
 * These types define the domain-agnostic run envelope, lifecycle states,
 * step results, actor context, and failure/retry semantics for the
 * admin control plane.
 *
 * @module admin-control-plane
 */

import type { AdminActionKey } from './types.js';
import type { AdminDomain, AdminExecutionMode, AdminRiskLevel } from './AdminEnums.js';

// ─── Run Lifecycle ──────────────────────────────────────────────────────────────

/**
 * Generalized admin run lifecycle states.
 *
 * These states apply to all admin domain runs regardless of execution mode.
 * The transition rules differ by execution mode (seamless, checkpointed,
 * destructive, advisory).
 */
export enum AdminRunStatus {
  /** Run has been created but not yet started */
  Pending = 'Pending',

  /** Preflight validation is in progress */
  Validating = 'Validating',

  /** Run is actively executing steps */
  Running = 'Running',

  /** Run is paused at a checkpoint awaiting operator approval (checkpointed/destructive only) */
  AwaitingApproval = 'AwaitingApproval',

  /** Run completed successfully */
  Completed = 'Completed',

  /** Run failed and may be retried */
  Failed = 'Failed',

  /** Run was cancelled by the operator before completion */
  Cancelled = 'Cancelled',

  /** One or more steps were deferred to a later execution window */
  PartiallyDeferred = 'PartiallyDeferred',
}

/**
 * Step-level execution status within a run.
 */
export enum AdminStepStatus {
  /** Step has not started */
  Pending = 'Pending',

  /** Step is currently executing */
  Running = 'Running',

  /** Step completed successfully */
  Completed = 'Completed',

  /** Step failed */
  Failed = 'Failed',

  /** Step was skipped (already completed on retry, or not applicable) */
  Skipped = 'Skipped',

  /** Step was deferred to a later execution window */
  Deferred = 'Deferred',

  /** Step is awaiting operator approval at a checkpoint */
  AwaitingApproval = 'AwaitingApproval',

  /** Step execution was rolled back via compensation */
  Compensated = 'Compensated',
}

// ─── Actor Context ──────────────────────────────────────────────────────────────

/**
 * Identifies the operator who initiated or approved a run or checkpoint.
 *
 * Captured at run creation and at each checkpoint approval for audit
 * traceability. All fields are sourced from the authenticated JWT context.
 */
export interface IAdminActorContext {
  /** Operator's User Principal Name (from JWT upn claim) */
  readonly upn: string;

  /** Operator's Entra Object ID (from JWT oid claim) */
  readonly objectId: string;

  /** Operator's display name */
  readonly displayName: string;

  /** ISO 8601 timestamp when this actor context was captured */
  readonly capturedAt: string;
}

// ─── Step Result ────────────────────────────────────────────────────────────────

/**
 * Result of a single step within an admin run.
 */
export interface IAdminStepResult {
  /** Step ordinal position (1-based) */
  readonly stepNumber: number;

  /** Human-readable step label */
  readonly stepLabel: string;

  /** Current step status */
  readonly status: AdminStepStatus;

  /** ISO 8601 timestamp when step started (null if not started) */
  readonly startedAt: string | null;

  /** ISO 8601 timestamp when step completed/failed (null if still running) */
  readonly completedAt: string | null;

  /** Duration in milliseconds (null if not completed) */
  readonly durationMs: number | null;

  /** Error message if step failed (null otherwise) */
  readonly errorMessage: string | null;

  /** Whether this step supports compensation/rollback */
  readonly compensatable: boolean;

  /** Whether compensation was attempted (only set if compensatable and failed) */
  readonly compensated: boolean;
}

// ─── Failure and Retry ──────────────────────────────────────────────────────────

/**
 * Failure summary for a failed run.
 */
export interface IAdminFailureSummary {
  /** Step number where the failure occurred */
  readonly failedAtStep: number;

  /** Error classification (mirrors provisioning ProvisioningFailureClass) */
  readonly failureClass: 'transient' | 'structural' | 'permissions' | 'repeated' | 'admin-class';

  /** Human-readable failure description */
  readonly failureMessage: string;

  /** Whether the run is eligible for retry */
  readonly retryEligible: boolean;

  /** Number of retry attempts so far */
  readonly retryCount: number;

  /** ISO 8601 timestamp of last retry attempt (null if never retried) */
  readonly lastRetryAt: string | null;

  /** Whether the run has been escalated for admin attention */
  readonly escalated: boolean;

  /** UPN of the admin who escalated (null if not escalated) */
  readonly escalatedBy: string | null;

  /** ISO 8601 timestamp of escalation (null if not escalated) */
  readonly escalatedAt: string | null;
}

// ─── Run Envelope ───────────────────────────────────────────────────────────────

/**
 * Generalized admin run envelope.
 *
 * This is the domain-agnostic representation of a single admin control-plane
 * execution. It captures what was done, who did it, how it progressed, and
 * what evidence was produced.
 *
 * Relationship to provisioning: this is a **translation target**, not a
 * replacement. Existing provisioning runs (IProvisioningStatus) remain
 * owned by @hbc/provisioning. The generalized run model defines the
 * vocabulary that new admin domains use natively and that provisioning
 * data can be projected into for unified display.
 */
export interface IAdminRunEnvelope {
  // ── Identity ──────────────────────────────────────────────────────────────

  /** Unique run identifier (UUID v4) */
  readonly runId: string;

  /** Correlation ID for retry chains — new run gets new runId, previous runId stored here */
  readonly parentRunId: string | null;

  // ── Action Reference ──────────────────────────────────────────────────────

  /** Action key from the action catalog (domain:family:verb) */
  readonly actionKey: AdminActionKey;

  /** Admin domain this run belongs to */
  readonly domain: AdminDomain;

  /** Risk level at the time of run creation */
  readonly riskLevel: AdminRiskLevel;

  /** Execution mode at the time of run creation */
  readonly executionMode: AdminExecutionMode;

  // ── Actor ─────────────────────────────────────────────────────────────────

  /** Operator who initiated this run */
  readonly initiatedBy: IAdminActorContext;

  /** Operator who last approved a checkpoint (null if no checkpoints approved) */
  readonly lastApprovedBy: IAdminActorContext | null;

  // ── Input and Config Snapshots ────────────────────────────────────────────

  /** Opaque reference to the command input snapshot (domain-specific payload) */
  readonly commandInputRef: string | null;

  /** Opaque reference to the config/standards snapshot at run creation time */
  readonly configSnapshotRef: string | null;

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  /** Current run lifecycle status */
  readonly status: AdminRunStatus;

  /** Total number of steps in this run */
  readonly totalSteps: number;

  /** Current step being executed (1-based, null if not started or completed) */
  readonly currentStep: number | null;

  /** Ordered step results */
  readonly steps: readonly IAdminStepResult[];

  // ── Failure / Retry ───────────────────────────────────────────────────────

  /** Failure summary (null if run has not failed) */
  readonly failure: IAdminFailureSummary | null;

  // ── Timestamps ────────────────────────────────────────────────────────────

  /** ISO 8601 timestamp when run was created */
  readonly createdAt: string;

  /** ISO 8601 timestamp when run started executing (null if still pending) */
  readonly startedAt: string | null;

  /** ISO 8601 timestamp when run completed/failed/cancelled (null if still running) */
  readonly completedAt: string | null;

  // ── Correlation ───────────────────────────────────────────────────────────

  /** Domain-specific entity ID that this run operates on (e.g., projectId for provisioning) */
  readonly targetEntityId: string | null;

  /** Domain-specific entity label for display */
  readonly targetEntityLabel: string | null;
}
