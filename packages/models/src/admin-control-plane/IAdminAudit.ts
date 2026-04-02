/**
 * Admin Control Plane — audit, evidence, config, and standards contracts.
 *
 * These types define how admin actions are made reconstructable, explainable,
 * and traceable to the standards/configuration state that governed them.
 *
 * Design principle: references are normalized and linkable. Large mutable
 * payloads are stored separately and referenced by ID/version, not embedded
 * in every run or audit record.
 *
 * @module admin-control-plane
 */

import type { AdminDomain, AdminExecutionMode, AdminRiskLevel } from './AdminEnums.js';
import type { AdminRunStatus } from './IAdminRun.js';
import type { IAdminActorContext } from './IAdminRun.js';
import type { AdminActionKey } from './types.js';

// ─── Audit Records ──────────────────────────────────────────────────────────────

/**
 * Categories of auditable events in the admin control plane.
 */
export enum AdminAuditEventType {
  /** A run was created / launched */
  RunStarted = 'run.started',

  /** A run completed successfully */
  RunCompleted = 'run.completed',

  /** A run failed */
  RunFailed = 'run.failed',

  /** A run was cancelled */
  RunCancelled = 'run.cancelled',

  /** A run was retried (new run created from failed run) */
  RunRetried = 'run.retried',

  /** A checkpoint was created */
  CheckpointCreated = 'checkpoint.created',

  /** A checkpoint decision was recorded */
  CheckpointDecided = 'checkpoint.decided',

  /** A checkpoint timed out */
  CheckpointTimedOut = 'checkpoint.timed-out',

  /** A checkpoint was escalated */
  CheckpointEscalated = 'checkpoint.escalated',

  /** Configuration was modified */
  ConfigModified = 'config.modified',

  /** Standards were applied to an environment */
  StandardsApplied = 'standards.applied',

  /** An external event was received and processed */
  ExternalEventReceived = 'external-event.received',
}

/**
 * Generalized admin audit record.
 *
 * Each auditable event produces one audit record. Audit records are the
 * primary evidence that an action occurred, who performed it, what
 * standards governed it, and what the outcome was.
 *
 * Audit records reference evidence and config snapshots by ID rather than
 * embedding them, keeping the audit store lean and the evidence store
 * independently queryable.
 */
export interface IAdminAuditRecord {
  /** Unique audit record ID (UUID v4) */
  readonly auditId: string;

  /** Event type */
  readonly eventType: AdminAuditEventType;

  /** ISO 8601 timestamp when the event occurred */
  readonly timestamp: string;

  // ── Context ───────────────────────────────────────────────────────────────

  /** Admin domain */
  readonly domain: AdminDomain;

  /** Action key (null for non-action events like config changes) */
  readonly actionKey: AdminActionKey | null;

  /** Run ID (null for events not tied to a specific run) */
  readonly runId: string | null;

  /** Checkpoint instance ID (null for non-checkpoint events) */
  readonly checkpointInstanceId: string | null;

  // ── Actor ─────────────────────────────────────────────────────────────────

  /** Operator who caused the event */
  readonly actor: IAdminActorContext;

  // ── Rationale ─────────────────────────────────────────────────────────────

  /** Operator-provided reason or rationale (null if not captured) */
  readonly rationale: IAdminRationale | null;

  // ── References ────────────────────────────────────────────────────────────

  /** Evidence reference (null if no evidence was produced) */
  readonly evidenceRef: IAdminEvidenceReference | null;

  /** Config/standards snapshot that governed this event (null if not applicable) */
  readonly configSnapshotRef: IAdminConfigSnapshotReference | null;

  // ── Outcome ───────────────────────────────────────────────────────────────

  /** Run status at the time of this event (null for non-run events) */
  readonly runStatusAtEvent: AdminRunStatus | null;

  /** Human-readable summary of what happened */
  readonly summary: string;
}

// ─── Evidence References ────────────────────────────────────────────────────────

/**
 * Reference to an evidence artifact produced by or associated with an admin action.
 *
 * Evidence is stored separately from audit records. This reference provides
 * the linkage. Evidence stores are a Phase 4 concern; the reference contract
 * is defined here so the model supports traceability from the start.
 */
export interface IAdminEvidenceReference {
  /** Unique evidence ID (UUID v4) */
  readonly evidenceId: string;

  /** Type of evidence */
  readonly evidenceType: AdminEvidenceType;

  /** Human-readable label */
  readonly label: string;

  /** Run ID that produced this evidence (null for standalone evidence) */
  readonly runId: string | null;

  /** Step number that produced this evidence (null if run-level) */
  readonly stepNumber: number | null;

  /** ISO 8601 timestamp when evidence was captured */
  readonly capturedAt: string;

  /**
   * Opaque storage locator. The format depends on the evidence store
   * implementation (Phase 4). Examples: Azure Table row key, blob URI,
   * SharePoint item ID. This field is intentionally untyped to avoid
   * premature storage design lock-in.
   */
  readonly storageLocator: string;
}

/**
 * Types of evidence that can be captured.
 */
export enum AdminEvidenceType {
  /** Snapshot of command input at run creation */
  CommandInputSnapshot = 'command-input-snapshot',

  /** Step execution result details */
  StepResultDetail = 'step-result-detail',

  /** Preview / dry-run impact analysis */
  PreviewResult = 'preview-result',

  /** Post-execution validation summary */
  PostValidationSummary = 'post-validation-summary',

  /** Compensation / rollback record */
  CompensationRecord = 'compensation-record',

  /** External event payload */
  ExternalEventPayload = 'external-event-payload',

  /** Standards comparison / drift report */
  DriftReport = 'drift-report',

  /** Error diagnostic detail */
  ErrorDiagnostic = 'error-diagnostic',
}

// ─── Config and Standards Snapshot References ────────────────────────────────────

/**
 * Reference to the configuration/standards snapshot that governed an admin action.
 *
 * When a run is created, the system captures which config version was active.
 * This reference links the run to that point-in-time config state, enabling
 * "what standard governed this run" queries.
 *
 * The actual config values are stored in the config/standards store (Phase 10).
 * This reference provides the linkage.
 */
export interface IAdminConfigSnapshotReference {
  /** Config scope identifier (e.g., 'sharepoint-site-standards', 'entra-group-policy') */
  readonly scope: string;

  /** Config version identifier at the time of capture */
  readonly version: string;

  /** ISO 8601 timestamp when the snapshot was captured */
  readonly capturedAt: string;

  /**
   * Opaque storage locator for the full config snapshot.
   * The format depends on the config store implementation (Phase 10).
   */
  readonly storageLocator: string;
}

/**
 * Reference to a specific standards version used for comparison or application.
 *
 * Standards references appear in drift reports, repair actions, and
 * standards-application runs. They identify which version of the standard
 * was used as the baseline.
 */
export interface IAdminStandardsReference {
  /** Standards domain (e.g., 'site-provisioning', 'entra-group-naming') */
  readonly standardsDomain: string;

  /** Standards version identifier */
  readonly version: string;

  /** Whether this version came from code defaults or live admin overrides */
  readonly source: 'code-default' | 'live-override' | 'merged';

  /** ISO 8601 timestamp of the standards version */
  readonly effectiveAt: string;
}

// ─── Rationale / Reason Capture ─────────────────────────────────────────────────

/**
 * Operator-provided rationale for an action or decision.
 *
 * Captured at run launch, checkpoint decisions, cancellations, and
 * config modifications to support "why was this done" queries.
 */
export interface IAdminRationale {
  /** Free-text reason provided by the operator */
  readonly reason: string;

  /** Optional reference to an external ticket or request (e.g., ServiceNow ID) */
  readonly externalReference: string | null;

  /** ISO 8601 timestamp when the rationale was recorded */
  readonly recordedAt: string;

  /** Actor who provided the rationale */
  readonly recordedBy: IAdminActorContext;
}

// ─── Post-Run Validation Summary ────────────────────────────────────────────────

/**
 * Summary of post-run validation results.
 *
 * Captured after destructive or high-risk runs when the operator
 * validates the outcome. Referenced from the audit record and the
 * post-execution-validation checkpoint decision.
 */
export interface IAdminPostRunValidationSummary {
  /** Run ID that was validated */
  readonly runId: string;

  /** Whether the operator confirmed the outcome is acceptable */
  readonly outcomeAccepted: boolean;

  /** Validation checks performed */
  readonly checks: readonly IAdminPostRunValidationCheck[];

  /** Operator's summary comment */
  readonly comment: string | null;

  /** ISO 8601 timestamp of the validation */
  readonly validatedAt: string;

  /** Operator who performed the validation */
  readonly validatedBy: IAdminActorContext;
}

/**
 * A single post-run validation check.
 */
export interface IAdminPostRunValidationCheck {
  /** Check identifier */
  readonly checkId: string;

  /** Human-readable label */
  readonly label: string;

  /** Whether the check passed */
  readonly passed: boolean;

  /** Detail message */
  readonly message: string;
}

// ─── Run-to-Config Traceability ─────────────────────────────────────────────────

/**
 * Traceability record linking a run to the config/standards state
 * that governed its execution.
 *
 * This is the bridge that answers: "what configuration was active
 * when this run executed, and what standards were used as the baseline?"
 */
export interface IAdminRunConfigTrace {
  /** Run ID */
  readonly runId: string;

  /** Config snapshot active at run creation */
  readonly configSnapshot: IAdminConfigSnapshotReference;

  /** Standards references used by this run (empty if no standards apply) */
  readonly standardsRefs: readonly IAdminStandardsReference[];

  /** ISO 8601 timestamp when the trace was established */
  readonly tracedAt: string;
}
