/**
 * SF23-T02 — Record Form TypeScript Contracts.
 *
 * Canonical primitive contracts for record authoring lifecycle, trust/explainability
 * state, validation, review-step semantics, recovery/conflict state, sync state,
 * BIC handoff steps, provenance/versioning, and operational telemetry.
 *
 * Governing: SF23-T02, SF23 Master Plan L-01 through L-06
 */

// ── Mode / Status / Sync / Confidence ────────────────────────────────────

/**
 * Record form authoring mode (T02).
 *
 * - `create` — new record from scratch
 * - `edit` — modify existing record
 * - `duplicate` — copy from existing record
 * - `template` — create from a template
 * - `review` — read-only review mode
 */
export type RecordFormMode = 'create' | 'edit' | 'duplicate' | 'template' | 'review';

/**
 * Record form lifecycle status (T02).
 *
 * All states must explain themselves to the user — no generic status text.
 */
export type RecordFormStatus =
  | 'not-started'
  | 'draft'
  | 'dirty'
  | 'valid-with-warnings'
  | 'blocked'
  | 'submitting'
  | 'submitted'
  | 'failed';

/**
 * Record sync state — separate from lifecycle status (T02).
 *
 * Tracks local-vs-server persistence state.
 */
export type RecordSyncState =
  | 'local-only'
  | 'saved-locally'
  | 'queued-to-sync'
  | 'synced'
  | 'degraded'
  | 'partially-recovered';

/**
 * State confidence level — how trustworthy is the current form state? (T02)
 */
export type RecordStateConfidence =
  | 'trusted-synced'
  | 'local-unsynced'
  | 'recovered-needs-review'
  | 'degraded-submission'
  | 'partially-resolved';

/**
 * Module complexity tier governing form surface depth (L-03).
 */
export type RecordFormComplexityTier = 'essential' | 'standard' | 'expert';

// ── T01 Aliases (backward compat) ────────────────────────────────────────

/** @deprecated Use `RecordFormMode` instead. */
export type RecordFormIntent = 'create' | 'edit' | 'duplicate' | 'template';

/** @deprecated Use `RecordStateConfidence` instead. */
export type RecordFormConfidence =
  | 'trusted-synced'
  | 'queued-local-only'
  | 'recovered-needs-review'
  | 'partially-recovered'
  | 'degraded'
  | 'failed';

// ── Explanation / Validation ─────────────────────────────────────────────

/**
 * Explanation state — why the form is in its current condition (T02).
 *
 * Answers: why blocked, why warning, why review, why recovery,
 * why submission is suppressed/deferred/retryable.
 */
export interface IRecordFormExplanationState {
  /** Whether the form is blocked from submission. */
  isBlocked: boolean;
  /** Individual block reasons. */
  blockReasons: IRecordBlockedReason[];
  /** Whether warnings are present. */
  hasWarnings: boolean;
  /** Validation warnings. */
  warnings: IRecordValidationWarning[];
  /** Whether recovery is active. */
  isRecoveryActive: boolean;
  /** User-facing explanation of current overall state. */
  summaryMessage: string;
  /** Why submission is deferred (null if not deferred). */
  deferReason: RecordDeferReasonCode | null;
}

/**
 * Validation state — field-level errors and warnings (T02).
 */
export interface IRecordValidationState {
  /** Whether the form passes all required validation. */
  isValid: boolean;
  /** Total count of validation errors. */
  errorCount: number;
  /** Field paths with validation errors. */
  errorFields: string[];
  /** Total count of validation warnings. */
  warningCount: number;
  /** Individual validation warnings. */
  warnings: IRecordValidationWarning[];
}

/** Individual field validation warning. */
export interface IRecordValidationWarning {
  /** Field path. */
  fieldPath: string;
  /** Warning reason code. */
  reasonCode: RecordWarningReasonCode;
  /** User-facing warning message. */
  message: string;
}

/** Individual block reason. */
export interface IRecordBlockedReason {
  /** Block reason code. */
  reasonCode: RecordBlockedReasonCode;
  /** User-facing block message. */
  message: string;
  /** Field paths causing the block (empty for non-field blocks). */
  affectedFields: string[];
}

// ── Draft / Comparison ───────────────────────────────────────────────────

/**
 * Draft persistence state with dirty tracking (T01+T02).
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
  /** Authoring mode. */
  mode: RecordFormMode;
  /** Whether any fields have been modified since last save. */
  isDirty: boolean;
  /** ISO 8601 timestamp of last local save. */
  lastSavedAtIso: string | null;
  /** ISO 8601 timestamp of draft creation. */
  createdAtIso: string;
  /** UPN of the draft author. */
  authorUpn: string;
  /** Schema version at draft creation time. */
  schemaVersion: string;
}

/**
 * Draft comparison state — local vs server vs restored (T02).
 */
export interface IRecordDraftComparisonState {
  /** Whether a local draft exists. */
  hasLocalDraft: boolean;
  /** Whether a server draft exists. */
  hasServerDraft: boolean;
  /** Whether a restored draft exists. */
  hasRestoredDraft: boolean;
  /** Whether the local draft is stale relative to server. */
  isStale: boolean;
  /** ISO 8601 timestamp of server version (null if none). */
  serverTimestampIso: string | null;
  /** ISO 8601 timestamp of local version (null if none). */
  localTimestampIso: string | null;
  /** Field paths that differ between local and server (empty if identical). */
  differingFields: string[];
}

// ── Review / BIC ─────────────────────────────────────────────────────────

/**
 * Review step state — blocking vs non-blocking, owner attribution (T01+T02).
 */
export interface IRecordReviewStepState {
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
  /** Reassignment history. */
  reassignmentHistory: IRecordReviewStepHistoryEntry[];
}

/** Review step reassignment history entry. */
export interface IRecordReviewStepHistoryEntry {
  /** Previous owner UPN. */
  fromUpn: string;
  /** New owner UPN. */
  toUpn: string;
  /** ISO 8601 timestamp. */
  reassignedAtIso: string;
  /** Reason (null if not provided). */
  reason: string | null;
}

/**
 * BIC ownership step configuration for record review/approval (L-02, T02).
 */
export interface IRecordBicStepConfig {
  /** Unique step identifier. */
  stepId: string;
  /** Human-readable step label. */
  stepLabel: string;
  /** Whether this step blocks submission. */
  blocking: boolean;
  /** Owner UPN. */
  ownerUpn: string;
  /** Owner display name. */
  ownerName: string;
  /** Owner role. */
  ownerRole: string;
  /** Expected action description. */
  expectedAction: string;
  /** ISO 8601 due date (null if no deadline). */
  dueDateIso: string | null;
}

// ── Next Recommended Action ──────────────────────────────────────────────

/**
 * Next recommended action — guides users to the most useful next step (T02).
 */
export interface IRecordNextRecommendedAction {
  /** Kind of recommended action. */
  actionKind:
    | 'submit'
    | 'review'
    | 'fix-errors'
    | 'resolve-warnings'
    | 'complete-required'
    | 'retry'
    | 'restore-draft'
    | 'await-approval';
  /** User-facing explanation. */
  reason: string;
  /** Whether the action is author-side or downstream-owner-side. */
  side: 'author' | 'downstream-owner';
  /** Category of the issue. */
  category: 'data-completion' | 'sync-completion' | 'review-completion' | 'approval-dependency';
}

// ── Recovery / Conflict / Submit Guard ───────────────────────────────────

/**
 * Recovery state — offline/crash recovery with conflict diagnostics (T01+T02).
 */
export interface IRecordRecoveryState {
  /** Recovery reason code. */
  reasonCode: RecordRecoveryReasonCode;
  /** ISO 8601 timestamp of recovery. */
  recoveredAtIso: string;
  /** Whether conflicts exist. */
  hasConflicts: boolean;
  /** Conflicting field paths. */
  conflictFields: string[];
  /** User-facing recovery message. */
  userMessage: string;
}

/**
 * Conflict state — detailed field-level conflict information (T02).
 */
export interface IRecordConflictState {
  /** Whether conflicts are detected. */
  detected: boolean;
  /** Conflicting field paths. */
  fields: string[];
  /** ISO 8601 timestamp of conflict detection. */
  detectedAtIso: string;
  /** Server version that conflicts. */
  serverVersionNumber: number | null;
  /** User-facing conflict summary. */
  userMessage: string;
}

/**
 * Submit guard state — submission eligibility check (T02).
 */
export interface IRecordSubmitGuardState {
  /** Whether submission is allowed. */
  canSubmit: boolean;
  /** Why submission is blocked (empty if allowed). */
  guardReasons: RecordBlockedReasonCode[];
  /** Whether review gates are satisfied. */
  reviewGatesSatisfied: boolean;
  /** Whether validation passes. */
  validationPasses: boolean;
  /** Whether the form is in a submittable sync state. */
  syncStateEligible: boolean;
}

// ── Failure / Retry ──────────────────────────────────────────────────────

/** Failure state with diagnostic detail. */
export interface IRecordFormFailureState {
  /** Machine-readable failure code. */
  failureCode: RecordFormFailureReasonCode;
  /** User-facing failure message. */
  userMessage: string;
  /** Technical detail (null if not available). */
  technicalDetail: string | null;
  /** ISO 8601 timestamp. */
  occurredAtIso: string;
}

/** Retry state with attempt tracking. */
export interface IRecordFormRetryState {
  /** Number of retry attempts. */
  attemptCount: number;
  /** Maximum attempts. */
  maxAttempts: number;
  /** ISO 8601 timestamp of last attempt. */
  lastAttemptAtIso: string;
  /** Reason code. */
  reasonCode: RecordRetryReasonCode;
  /** Whether retry is allowed. */
  canRetry: boolean;
}

// ── Telemetry ────────────────────────────────────────────────────────────

/**
 * Telemetry state for operational UX KPIs (L-06, T01+T02).
 */
export interface IRecordFormTelemetryState {
  /** ISO 8601 timestamp when form was opened. */
  openTimestampIso: string;
  /** ISO 8601 timestamp when submission started. */
  submitStartTimestampIso: string | null;
  /** ISO 8601 timestamp when submission completed. */
  submitCompleteTimestampIso: string | null;
  /** Time from open to submit in ms. */
  timeToSubmitMs: number | null;
  /** Whether user abandoned before submit. */
  abandonedBeforeSubmit: boolean;
  /** Validation error count. */
  validationErrorCount: number;
  /** Draft save count. */
  draftSaveCount: number;
  /** Whether recovery was triggered. */
  recoveryTriggered: boolean;
  /** Form mode for KPI segmentation. */
  formMode: RecordFormMode;
}

// ── Sync / Confidence Wrappers ───────────────────────────────────────────

/** Sync state wrapper with queue metadata (T02). */
export interface IRecordSyncStateInfo {
  /** Current sync state. */
  state: RecordSyncState;
  /** Position in sync queue (null if not queued). */
  queuePosition: number | null;
  /** ISO 8601 timestamp of last sync attempt. */
  lastSyncAttemptIso: string | null;
}

/** Confidence state wrapper with reasons (T02). */
export interface IRecordStateConfidenceInfo {
  /** Current confidence level. */
  level: RecordStateConfidence;
  /** Reasons for confidence level (empty if trusted). */
  reasons: string[];
}

// ── Top-Level Orchestration Contracts ────────────────────────────────────

/**
 * Record form definition — generic top-level orchestration contract (T02).
 *
 * Represents a complete record authoring session with module-specific
 * record payload.
 */
export interface IRecordFormDefinition<TRecord> {
  /** Unique form instance identifier. */
  formId: string;
  /** Module identifier. */
  moduleId: string;
  /** Record type key. */
  recordType: string;
  /** Authoring mode. */
  mode: RecordFormMode;
  /** Schema version. */
  schemaVersion: string;
  /** Module-owned record payload. */
  record: TRecord;
  /** Validation state. */
  validation: IRecordValidationState;
  /** Explanation state. */
  explanation: IRecordFormExplanationState;
  /** Recovery state (null if no recovery). */
  recovery: IRecordRecoveryState | null;
  /** Review steps. */
  reviewSteps: IRecordReviewStepState[];
  /** Next recommended action. */
  nextRecommendedAction: IRecordNextRecommendedAction | null;
  /** Sync state. */
  sync: IRecordSyncStateInfo;
  /** Confidence state. */
  confidence: IRecordStateConfidenceInfo;
  /** BIC ownership steps. */
  bicSteps: IRecordBicStepConfig[];
  /** Telemetry state. */
  telemetry: IRecordFormTelemetryState;
  /** Submit guard state. */
  submitGuard: IRecordSubmitGuardState;
  /** Conflict state (null if no conflicts). */
  conflict: IRecordConflictState | null;
  /** Draft comparison state (null if not applicable). */
  draftComparison: IRecordDraftComparisonState | null;
  /** Failure state (null if no failure). */
  failure: IRecordFormFailureState | null;
  /** Retry state (null if no retries). */
  retry: IRecordFormRetryState | null;
}

/**
 * Record form state — non-generic alias for backward compatibility.
 */
export interface IRecordFormState {
  /** Current draft state. */
  draft: IRecordFormDraft;
  /** Explanation state. */
  explanation: IRecordFormExplanationState;
  /** Validation state. */
  validation: IRecordValidationState;
  /** Complexity tier. */
  complexityTier: RecordFormComplexityTier;
  /** Review steps. */
  reviewSteps: IRecordReviewStepState[];
  /** Next recommended action. */
  nextRecommendedAction: IRecordNextRecommendedAction | null;
  /** Failure state. */
  failure: IRecordFormFailureState | null;
  /** Retry state. */
  retry: IRecordFormRetryState | null;
  /** Telemetry state. */
  telemetry: IRecordFormTelemetryState;
  /** Sync state. */
  sync: IRecordSyncStateInfo;
  /** Confidence state. */
  confidence: IRecordStateConfidenceInfo;
}

// ── Reason-Code Enums ────────────────────────────────────────────────────

/** Why the form is blocked from submission. */
export type RecordBlockedReasonCode =
  | 'required-fields-missing'
  | 'validation-errors'
  | 'review-gate-pending'
  | 'offline-submit-not-eligible'
  | 'record-locked';

/** Why a warning is shown on the form. */
export type RecordWarningReasonCode =
  | 'unsaved-changes'
  | 'stale-data'
  | 'partial-recovery'
  | 'concurrent-edit-detected'
  | 'approaching-deadline';

/** Why recovery was triggered. */
export type RecordRecoveryReasonCode =
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

/** Why submission is deferred (T02). */
export type RecordDeferReasonCode =
  | 'offline-not-eligible'
  | 'review-incomplete'
  | 'approval-pending'
  | 'schema-mismatch';

/** Why retry is needed (T02). */
export type RecordRetryReasonCode =
  | 'transient-failure'
  | 'timeout'
  | 'conflict-retry';

// ── Constants ────────────────────────────────────────────────────────────

/** All record form lifecycle statuses (T02). */
export const RECORD_FORM_STATUSES: readonly RecordFormStatus[] = [
  'not-started',
  'draft',
  'dirty',
  'valid-with-warnings',
  'blocked',
  'submitting',
  'submitted',
  'failed',
] as const;

/** All record sync states (T02). */
export const RECORD_SYNC_STATES: readonly RecordSyncState[] = [
  'local-only',
  'saved-locally',
  'queued-to-sync',
  'synced',
  'degraded',
  'partially-recovered',
] as const;

/** All state confidence levels (T02). */
export const RECORD_STATE_CONFIDENCE_LEVELS: readonly RecordStateConfidence[] = [
  'trusted-synced',
  'local-unsynced',
  'recovered-needs-review',
  'degraded-submission',
  'partially-resolved',
] as const;

/** All complexity tiers (L-03). */
export const RECORD_FORM_COMPLEXITY_TIERS: readonly RecordFormComplexityTier[] = [
  'essential',
  'standard',
  'expert',
] as const;

// ── T02 Constants ────────────────────────────────────────────────────────

/** IndexedDB/Background Sync queue key for offline form replay (L-04, T02). */
export const RECORD_FORM_SYNC_QUEUE_KEY = 'record-form-sync-queue' as const;

/** Sync states representing offline-queued state (T02). */
export const RECORD_FORM_SYNC_STATUSES: readonly RecordSyncState[] = [
  'saved-locally',
  'queued-to-sync',
] as const;

/** All trust/confidence states (T02). */
export const RECORD_FORM_TRUST_STATES: readonly RecordStateConfidence[] = [
  'trusted-synced',
  'local-unsynced',
  'recovered-needs-review',
  'degraded-submission',
  'partially-resolved',
] as const;
