/**
 * SF23-T01 — Record Form TypeScript Contract Stubs.
 *
 * Placeholder types reserving the public API surface for T02 full contracts.
 * Trust/explainability state, recovery/replay, review steps, next recommended
 * action, and conflict diagnostics.
 *
 * Governing: SF23-T01, SF23 Master Plan L-01/L-03/L-04/L-06
 */

// ── Lifecycle / Trust Vocabulary ─────────────────────────────────────────

/**
 * Record form lifecycle status (SF23 trust vocabulary).
 *
 * All states must explain themselves to the user — no generic status text.
 */
export type RecordFormStatus =
  | 'blocked'
  | 'valid-with-warnings'
  | 'saved-locally'
  | 'queued-to-sync'
  | 'degraded'
  | 'recovered-needs-review'
  | 'partially-recovered'
  | 'synced';

/**
 * Record authoring intent classification.
 *
 * - `create` — new record from scratch
 * - `edit` — modify existing record
 * - `duplicate` — copy from existing record
 * - `template` — create from a template
 */
export type RecordFormIntent = 'create' | 'edit' | 'duplicate' | 'template';

/**
 * Module complexity tier governing form surface depth (L-03).
 *
 * - `essential` — minimal fields + simple submit bar
 * - `standard` — full renderer + inline validation + read-only review
 * - `expert` — retrospective adjustments + full preview + configure link
 */
export type RecordFormComplexityTier = 'essential' | 'standard' | 'expert';

/**
 * State confidence level — how trustworthy is the current form state?
 */
export type RecordFormConfidence =
  | 'trusted-synced'
  | 'queued-local-only'
  | 'recovered-needs-review'
  | 'partially-recovered'
  | 'degraded'
  | 'failed';

// ── Core Interfaces ──────────────────────────────────────────────────────

/**
 * Trust/explainability state — why the form is in its current condition.
 *
 * Governs user-facing explanations for blocked, warning, recovery,
 * and review states.
 */
export interface IRecordFormTrustState {
  /** Current lifecycle status. */
  status: RecordFormStatus;
  /** State confidence level. */
  confidence: RecordFormConfidence;
  /** Whether the form is blocked from submission. */
  isBlocked: boolean;
  /** User-facing block reasons (empty if not blocked). */
  blockReasons: RecordFormBlockReasonCode[];
  /** User-facing warnings (empty if none). */
  warnings: RecordFormWarningReasonCode[];
  /** Whether the form was recovered from offline/crash. */
  isRecovered: boolean;
  /** Recovery details (null if not recovered). */
  recovery: IRecordFormRecoveryState | null;
}

/**
 * Draft persistence state with dirty tracking.
 */
export interface IRecordFormDraft {
  /** Unique draft identifier. */
  draftId: string;
  /** Record ID being authored (null for new records). */
  recordId: string | null;
  /** Project ID context. */
  projectId: string;
  /** Module key owning the schema. */
  moduleKey: string;
  /** Authoring intent. */
  intent: RecordFormIntent;
  /** Whether any fields have been modified since last save. */
  isDirty: boolean;
  /** ISO 8601 timestamp of last local save. */
  lastSavedAtIso: string | null;
  /** ISO 8601 timestamp of draft creation. */
  createdAtIso: string;
  /** UPN of the draft author. */
  authorUpn: string;
}

/**
 * Review step state — blocking vs non-blocking, owner attribution.
 *
 * Review steps create granular BIC ownership with avatar projection (L-02).
 */
export interface IRecordFormReviewStepState {
  /** Unique step identifier. */
  stepId: string;
  /** Whether this step blocks submission. */
  blocking: boolean;
  /** Whether this is pre-submit or post-submit. */
  phase: 'pre-submit' | 'post-submit';
  /** Current owner UPN. */
  ownerUpn: string;
  /** Current owner display name. */
  ownerName: string;
  /** Step status. */
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  /** Reassignment history for this step. */
  reassignmentHistory: IRecordFormReviewHistoryEntry[];
}

/** Review step reassignment history entry. */
export interface IRecordFormReviewHistoryEntry {
  /** Previous owner UPN. */
  fromUpn: string;
  /** New owner UPN. */
  toUpn: string;
  /** ISO 8601 timestamp of reassignment. */
  reassignedAtIso: string;
  /** Reason for reassignment (null if not provided). */
  reason: string | null;
}

/**
 * Next recommended action — guides users to the most useful next step.
 */
export interface IRecordFormNextRecommendedAction {
  /** Kind of recommended action. */
  actionKind:
    | 'submit'
    | 'review'
    | 'fix-errors'
    | 'resolve-warnings'
    | 'complete-required'
    | 'retry'
    | 'restore-draft';
  /** User-facing explanation of why this action is recommended. */
  reason: string;
}

/**
 * Recovery state — offline recovery, crash recovery, conflict diagnostics.
 */
export interface IRecordFormRecoveryState {
  /** Recovery reason code. */
  reasonCode: RecordFormRecoveryReasonCode;
  /** ISO 8601 timestamp of recovery. */
  recoveredAtIso: string;
  /** Whether there are conflicts with the server state. */
  hasConflicts: boolean;
  /** Conflicting field paths (empty if no conflicts). */
  conflictFields: string[];
  /** User-facing recovery message. */
  userMessage: string;
}

/** Failure state with diagnostic detail. */
export interface IRecordFormFailureState {
  /** Machine-readable failure code. */
  failureCode: RecordFormFailureReasonCode;
  /** User-facing failure message. */
  userMessage: string;
  /** Technical detail for logging/debugging (null if not available). */
  technicalDetail: string | null;
  /** ISO 8601 timestamp of failure. */
  occurredAtIso: string;
}

/** Retry state with attempt tracking. */
export interface IRecordFormRetryState {
  /** Number of retry attempts made. */
  attemptCount: number;
  /** Maximum allowed retry attempts. */
  maxAttempts: number;
  /** ISO 8601 timestamp of last retry attempt. */
  lastAttemptAtIso: string;
  /** Whether another retry is allowed. */
  canRetry: boolean;
}

/**
 * Telemetry state for the five operational UX KPIs (L-06).
 */
export interface IRecordFormTelemetryState {
  /** ISO 8601 timestamp when the form was opened. */
  openTimestampIso: string;
  /** ISO 8601 timestamp when submission started (null if not yet). */
  submitStartTimestampIso: string | null;
  /** ISO 8601 timestamp when submission completed (null if not yet). */
  submitCompleteTimestampIso: string | null;
  /** Total time from open to submit in milliseconds (null if not complete). */
  timeToSubmitMs: number | null;
  /** Whether the user abandoned the form. */
  abandonedBeforeSubmit: boolean;
  /** Number of validation errors encountered. */
  validationErrorCount: number;
  /** Number of draft saves. */
  draftSaveCount: number;
  /** Whether recovery was triggered. */
  recoveryTriggered: boolean;
}

/**
 * Record form state — top-level orchestration contract.
 *
 * Represents a single record authoring session from open through submission.
 */
export interface IRecordFormState {
  /** Current draft state. */
  draft: IRecordFormDraft;
  /** Trust/explainability state. */
  trust: IRecordFormTrustState;
  /** Complexity tier. */
  complexityTier: RecordFormComplexityTier;
  /** Review steps (empty if no review gates). */
  reviewSteps: IRecordFormReviewStepState[];
  /** Next recommended action (null if no recommendation). */
  nextRecommendedAction: IRecordFormNextRecommendedAction | null;
  /** Failure state (null if no failure). */
  failure: IRecordFormFailureState | null;
  /** Retry state (null if no retries). */
  retry: IRecordFormRetryState | null;
  /** Telemetry state. */
  telemetry: IRecordFormTelemetryState;
}

// ── Reason-Code Enums ────────────────────────────────────────────────────

/** Why the form is blocked from submission. */
export type RecordFormBlockReasonCode =
  | 'required-fields-missing'
  | 'validation-errors'
  | 'review-gate-pending'
  | 'offline-submit-not-eligible'
  | 'record-locked';

/** Why a warning is shown on the form. */
export type RecordFormWarningReasonCode =
  | 'unsaved-changes'
  | 'stale-data'
  | 'partial-recovery'
  | 'concurrent-edit-detected'
  | 'approaching-deadline';

/** Why recovery was triggered. */
export type RecordFormRecoveryReasonCode =
  | 'offline-draft-restored'
  | 'crash-recovery'
  | 'session-timeout-restored'
  | 'conflict-detected';

/** Why a submission failed. */
export type RecordFormFailureReasonCode =
  | 'submission-error'
  | 'timeout'
  | 'permission-denied'
  | 'data-validation'
  | 'conflict-rejected';

// ── Constants ────────────────────────────────────────────────────────────

/** All record form lifecycle statuses. */
export const RECORD_FORM_STATUSES: readonly RecordFormStatus[] = [
  'blocked',
  'valid-with-warnings',
  'saved-locally',
  'queued-to-sync',
  'degraded',
  'recovered-needs-review',
  'partially-recovered',
  'synced',
] as const;

/** All state confidence levels. */
export const RECORD_FORM_CONFIDENCE_LEVELS: readonly RecordFormConfidence[] = [
  'trusted-synced',
  'queued-local-only',
  'recovered-needs-review',
  'partially-recovered',
  'degraded',
  'failed',
] as const;

/** All complexity tiers (L-03). */
export const RECORD_FORM_COMPLEXITY_TIERS: readonly RecordFormComplexityTier[] = [
  'essential',
  'standard',
  'expert',
] as const;
