/**
 * Admin Control Plane — Phase 11 safety contracts.
 *
 * These types define the safety envelope for admin actions: which controls
 * are required, how preview/dry-run/confirmation/validation/recovery are
 * structured, and how safety evidence is summarized.
 *
 * Design principle: the backend declares the safety profile for each action;
 * the frontend reads the profile to present the appropriate UX ceremony;
 * the backend enforces that all required controls are satisfied before execution.
 *
 * @module admin-control-plane
 */

import type { AdminDomain, AdminExecutionMode, AdminRiskLevel } from './AdminEnums.js';
import type { IAdminActorContext } from './IAdminRun.js';
import type { IAdminEvidenceReference, IAdminRationale } from './IAdminAudit.js';
import type { AdminActionKey } from './types.js';

// ─── Safety Control Enum ───────────────────────────────────────────────────────

/**
 * Safety controls that can be required for an admin action.
 *
 * Each control represents a gate or evidence-capture step in the safety
 * pipeline. The required controls for a specific action are declared
 * in its {@link IAdminSafetyProfile}.
 */
export enum AdminSafetyControl {
  /** Backend-generated preview of what the action will change */
  Preview = 'preview',

  /** Simulated execution without committing changes */
  DryRun = 'dry-run',

  /** Standard confirmation dialog with scope summary */
  StandardConfirmation = 'standard-confirmation',

  /** Enhanced confirmation with risk warning and typed acknowledgment */
  EnhancedConfirmation = 'enhanced-confirmation',

  /** Action must declare and enforce its intended scope */
  ScopeRestriction = 'scope-restriction',

  /** Post-execution validation of intended outcome */
  PostRunValidation = 'post-run-validation',

  /** Context-aware recovery steps on failure */
  RecoveryGuidance = 'recovery-guidance',

  /** Durable audit record in AdminAuditEvents table */
  AuditRecord = 'audit-record',

  /** Evidence capture: command input snapshot */
  InputEvidence = 'input-evidence',

  /** Evidence capture: preview/dry-run result */
  PreviewEvidence = 'preview-evidence',

  /** Evidence capture: execution result detail */
  ExecutionEvidence = 'execution-evidence',

  /** Evidence capture: post-run validation summary */
  ValidationEvidence = 'validation-evidence',
}

// ─── Confirmation Type ─────────────────────────────────────────────────────────

/**
 * Confirmation ceremony level required before execution.
 *
 * - `none`: action proceeds without explicit confirmation (routine/read-only).
 * - `standard`: confirmation dialog with scope summary.
 * - `enhanced`: confirmation with risk warning and typed acknowledgment phrase.
 */
export type AdminConfirmationType = 'none' | 'standard' | 'enhanced';

// ─── Safety Profile ────────────────────────────────────────────────────────────

/**
 * Safety profile for an admin action.
 *
 * This is the unit of safety enforcement. The backend registers a safety
 * profile for each action; the profile determines which controls must be
 * satisfied before execution proceeds.
 *
 * The frontend reads the profile to determine the appropriate UX ceremony.
 * The backend enforces that all required controls are satisfied.
 */
export interface IAdminSafetyProfile {
  /** Scoped action identifier */
  readonly actionKey: AdminActionKey;

  /** Admin domain that owns this action */
  readonly domain: AdminDomain;

  /** Risk tier classification */
  readonly riskLevel: AdminRiskLevel;

  /** Execution mode */
  readonly executionMode: AdminExecutionMode;

  /** Safety controls required for this action */
  readonly requiredControls: readonly AdminSafetyControl[];

  /** Whether this action supports preview/impact summary */
  readonly supportsPreview: boolean;

  /** Whether this action supports dry-run simulation */
  readonly supportsDryRun: boolean;

  /** Required confirmation ceremony level */
  readonly confirmationType: AdminConfirmationType;

  /** Human-readable description of the action's intended scope */
  readonly scopeDescription: string;
}

// ─── Execution Scope ───────────────────────────────────────────────────────────

/**
 * Declares the intended scope of an action execution.
 *
 * Scope restriction ensures an action only affects the declared targets.
 * The backend validates that the execution does not exceed scope.
 */
export interface IAdminExecutionScope {
  /** Admin domain */
  readonly domain: AdminDomain;

  /** Target entity identifier (e.g., projectId, userId, siteUrl) */
  readonly targetEntityId: string | null;

  /** Human-readable target label */
  readonly targetEntityLabel: string | null;

  /** Number of resources the action will affect */
  readonly affectedResourceCount: number;

  /** Human-readable scope description */
  readonly scopeDescription: string;
}

// ─── Safety Warning ────────────────────────────────────────────────────────────

/**
 * A structured safety warning surfaced during preview or execution.
 */
export interface IAdminSafetyWarning {
  /** Warning severity */
  readonly severity: 'info' | 'warning' | 'critical';

  /** Machine-readable warning code */
  readonly code: string;

  /** Human-readable warning message */
  readonly message: string;

  /** Affected resource identifier (null if action-level) */
  readonly resource: string | null;
}

// ─── Preview / Dry-Run Result ──────────────────────────────────────────────────

/**
 * Structured result from a safety-aware preview or dry-run.
 *
 * Extends the preview concept with safety context: execution scope,
 * structured warnings, and evidence linkage.
 */
export interface IAdminSafetyPreviewResult {
  /** Action that was previewed */
  readonly actionKey: AdminActionKey;

  /** Whether this was a dry-run (simulated execution) vs preview (inspection) */
  readonly dryRun: boolean;

  /** Scope of the previewed action */
  readonly scope: IAdminExecutionScope;

  /** Risk level of the action */
  readonly riskLevel: AdminRiskLevel;

  /** What would change if executed */
  readonly impactItems: readonly IAdminSafetyImpactItem[];

  /** Structured safety warnings */
  readonly warnings: readonly IAdminSafetyWarning[];

  /** Advisory notes that do not block execution */
  readonly advisoryNotes: readonly string[];

  /** Whether the preview indicates the action is safe to proceed */
  readonly proceedRecommended: boolean;

  /** ISO 8601 timestamp when preview was generated */
  readonly previewedAt: string;

  /** Evidence ID if the preview was captured as evidence */
  readonly evidenceId: string | null;
}

/**
 * A single impact item in a safety-aware preview.
 *
 * Extends the basic preview impact item with reversibility and
 * risk-level context.
 */
export interface IAdminSafetyImpactItem {
  /** Affected resource identifier */
  readonly resource: string;

  /** Type of change */
  readonly changeType: 'create' | 'update' | 'delete' | 'no-change';

  /** Human-readable description of the impact */
  readonly description: string;

  /** Whether this specific change is reversible */
  readonly reversible: boolean;

  /** Risk level of this specific change (may differ from action-level risk) */
  readonly itemRiskLevel: AdminRiskLevel;
}

// ─── Confirmation Payload ──────────────────────────────────────────────────────

/**
 * Payload recording an operator's confirmation of an action.
 *
 * Captured as evidence to prove the operator explicitly acknowledged
 * the action's scope and risk before execution.
 */
export interface IAdminConfirmationPayload {
  /** Action being confirmed */
  readonly actionKey: AdminActionKey;

  /** Confirmation ceremony that was presented */
  readonly confirmationType: AdminConfirmationType;

  /**
   * Operator's acknowledgment text.
   * For standard confirmation: typically "confirm".
   * For enhanced confirmation: typed phrase (e.g., resource name or "DELETE").
   */
  readonly operatorAcknowledgment: string;

  /** Evidence ID of the preview the operator reviewed (null if no preview) */
  readonly previewEvidenceId: string | null;

  /** Operator-provided rationale (null if not required or not provided) */
  readonly rationale: IAdminRationale | null;

  /** ISO 8601 timestamp when confirmation was recorded */
  readonly confirmedAt: string;

  /** Operator who confirmed */
  readonly confirmedBy: IAdminActorContext;
}

// ─── Recovery Guidance ─────────────────────────────────────────────────────────

/**
 * Context-aware recovery guidance generated by the backend after
 * a failed or partially-failed action.
 */
export interface IAdminRecoveryGuidance {
  /** Run ID of the failed action */
  readonly runId: string;

  /** Action that failed */
  readonly actionKey: AdminActionKey;

  /** Classification of the failure */
  readonly failureClass: string;

  /** Ordered recovery steps */
  readonly steps: readonly IAdminRecoveryStep[];

  /** Estimated complexity of recovery */
  readonly estimatedComplexity: 'simple' | 'moderate' | 'complex' | 'requires-support';

  /** Whether automatic compensation is available */
  readonly compensationAvailable: boolean;

  /** Actions that must be taken outside the system (e.g., Azure portal, AD tools) */
  readonly externalActions: readonly string[];
}

/**
 * A single step in recovery guidance.
 */
export interface IAdminRecoveryStep {
  /** Step order (1-based) */
  readonly order: number;

  /** Short step label */
  readonly label: string;

  /** Detailed step description */
  readonly description: string;

  /** How the step is performed */
  readonly actionType: 'automatic' | 'manual' | 'external';

  /** Action key if this step can be triggered from the system (null for manual/external) */
  readonly actionKey: AdminActionKey | null;
}

// ─── Safety Evidence Summary ───────────────────────────────────────────────────

/**
 * Summary of safety evidence captured for an action execution.
 *
 * Provides a single view of which safety controls were satisfied,
 * which were skipped, and where the evidence is stored.
 */
export interface IAdminSafetyEvidenceSummary {
  /** Run ID */
  readonly runId: string;

  /** Action that was executed */
  readonly actionKey: AdminActionKey;

  /** Risk level of the action */
  readonly riskLevel: AdminRiskLevel;

  /** Controls that were satisfied */
  readonly controlsSatisfied: readonly AdminSafetyControl[];

  /** Controls that were required but skipped (should be empty for compliant runs) */
  readonly controlsSkipped: readonly AdminSafetyControl[];

  /** Whether preview evidence was captured */
  readonly previewCaptured: boolean;

  /** Whether confirmation evidence was captured */
  readonly confirmationCaptured: boolean;

  /** Whether post-run validation evidence was captured */
  readonly validationCaptured: boolean;

  /** Whether recovery guidance was generated */
  readonly recoveryCaptured: boolean;

  /** References to all evidence artifacts for this run */
  readonly evidenceRefs: readonly IAdminEvidenceReference[];

  /** ISO 8601 timestamp when the summary was finalized */
  readonly completedAt: string;
}
