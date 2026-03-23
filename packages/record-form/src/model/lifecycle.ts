/**
 * SF23-T03 — Record form lifecycle state machine.
 *
 * Deterministic lifecycle transitions, session creation, and monotonic
 * status enforcement. No silent transitions.
 *
 * Governing: SF23-T03, L-01 (primitive ownership), L-02 (BIC steps)
 */

import type {
  RecordFormMode,
  RecordFormStatus,
  RecordFormComplexityTier,
  IRecordFormDraft,
  IRecordFormState,
  IRecordFormExplanationState,
  IRecordValidationState,
  IRecordFormTelemetryState,
  IRecordSyncStateInfo,
  IRecordStateConfidenceInfo,
  IRecordReviewStepState,
  IRecordNextRecommendedAction,
  IRecordBicStepConfig,
  IRecordFormFailureState,
  IRecordFormRetryState,
} from '../types/index.js';

import { computeRecordConfidence } from './confidence.js';

// ── Input Contract ───────────────────────────────────────────────────────

/** Input for creating a new record form session. */
export interface IRecordFormCreateInput {
  /** Module key owning the schema. */
  moduleKey: string;
  /** Project ID context. */
  projectId: string;
  /** Authoring mode. */
  mode: RecordFormMode;
  /** Complexity tier. */
  complexityTier: RecordFormComplexityTier;
  /** Record ID (null for create/template). */
  recordId?: string | null;
  /** Schema version. */
  schemaVersion?: string;
  /** Author UPN. */
  authorUpn: string;
  /** BIC steps (optional). */
  bicSteps?: IRecordBicStepConfig[];
}

// ── Valid Transitions ────────────────────────────────────────────────────

/**
 * Monotonic lifecycle transition map.
 *
 * `not-started → draft → dirty → valid-with-warnings | blocked → submitting → submitted | failed`
 */
export const VALID_RECORD_TRANSITIONS: Readonly<Record<RecordFormStatus, readonly RecordFormStatus[]>> = {
  'not-started': ['draft'],
  'draft': ['dirty', 'blocked', 'valid-with-warnings'],
  'dirty': ['valid-with-warnings', 'blocked', 'draft'],
  'valid-with-warnings': ['dirty', 'blocked', 'submitting'],
  'blocked': ['dirty', 'valid-with-warnings'],
  'submitting': ['submitted', 'failed'],
  'submitted': [],
  'failed': ['dirty', 'draft'],
} as const;

// ── Create Session ───────────────────────────────────────────────────────

/**
 * Create a new record form session with initial state.
 *
 * @param input - Module-provided session parameters.
 * @param now - Optional injectable timestamp for testing.
 * @returns Fully initialized IRecordFormState in `not-started` status.
 * @throws If required fields are missing.
 */
export function createRecordFormSession(input: IRecordFormCreateInput, now?: Date): IRecordFormState {
  const timestamp = (now ?? new Date()).toISOString();

  if (!input.moduleKey) throw new Error('RecordForm: moduleKey is required');
  if (!input.projectId) throw new Error('RecordForm: projectId is required');
  if (!input.mode) throw new Error('RecordForm: mode is required');
  if (!input.authorUpn) throw new Error('RecordForm: authorUpn is required');

  const draft: IRecordFormDraft = {
    draftId: crypto.randomUUID(),
    recordId: input.recordId ?? null,
    projectId: input.projectId,
    moduleKey: input.moduleKey,
    mode: input.mode,
    isDirty: false,
    lastSavedAtIso: null,
    createdAtIso: timestamp,
    authorUpn: input.authorUpn,
    schemaVersion: input.schemaVersion ?? '1.0',
  };

  const explanation: IRecordFormExplanationState = {
    isBlocked: false,
    blockReasons: [],
    hasWarnings: false,
    warnings: [],
    isRecoveryActive: false,
    summaryMessage: 'Ready to begin',
    deferReason: null,
  };

  const validation: IRecordValidationState = {
    isValid: true,
    errorCount: 0,
    errorFields: [],
    warningCount: 0,
    warnings: [],
  };

  const telemetry: IRecordFormTelemetryState = {
    openTimestampIso: timestamp,
    submitStartTimestampIso: null,
    submitCompleteTimestampIso: null,
    timeToSubmitMs: null,
    abandonedBeforeSubmit: false,
    validationErrorCount: 0,
    draftSaveCount: 0,
    recoveryTriggered: false,
    formMode: input.mode,
  };

  const sync: IRecordSyncStateInfo = {
    state: 'local-only',
    queuePosition: null,
    lastSyncAttemptIso: null,
  };

  const confidence: IRecordStateConfidenceInfo = {
    level: 'local-unsynced',
    reasons: [],
  };

  return {
    draft,
    explanation,
    validation,
    complexityTier: input.complexityTier,
    reviewSteps: [],
    nextRecommendedAction: null,
    failure: null,
    retry: null,
    telemetry,
    sync,
    confidence,
  };
}

// ── Transition Status ────────────────────────────────────────────────────

/**
 * Transition a record form to a new lifecycle status.
 *
 * @param state - Current form state.
 * @param targetStatus - Desired next status.
 * @param now - Optional injectable timestamp.
 * @returns New IRecordFormState with updated status and telemetry.
 * @throws If the transition is not allowed.
 */
export function transitionRecordFormStatus(
  state: IRecordFormState,
  targetStatus: RecordFormStatus,
  now?: Date,
): IRecordFormState {
  const currentStatus = state.explanation.isBlocked ? 'blocked' : inferCurrentStatus(state);

  const allowed = VALID_RECORD_TRANSITIONS[currentStatus];
  if (!allowed?.includes(targetStatus)) {
    throw new Error(
      `RecordFormLifecycle: invalid transition ${currentStatus} → ${targetStatus}. ` +
      `Allowed: [${allowed?.join(', ') ?? 'none'}]`,
    );
  }

  const timestamp = (now ?? new Date()).toISOString();

  const updatedExplanation: IRecordFormExplanationState = {
    ...state.explanation,
    isBlocked: targetStatus === 'blocked',
    hasWarnings: targetStatus === 'valid-with-warnings' ? true : (targetStatus === 'blocked' || targetStatus === 'submitting' || targetStatus === 'submitted' || targetStatus === 'failed') ? false : state.explanation.hasWarnings,
    summaryMessage: getStatusMessage(targetStatus),
  };

  const updatedTelemetry: IRecordFormTelemetryState = {
    ...state.telemetry,
    submitStartTimestampIso: targetStatus === 'submitting'
      ? timestamp
      : state.telemetry.submitStartTimestampIso,
    submitCompleteTimestampIso: targetStatus === 'submitted' || targetStatus === 'failed'
      ? timestamp
      : state.telemetry.submitCompleteTimestampIso,
    timeToSubmitMs: targetStatus === 'submitted' && state.telemetry.submitStartTimestampIso
      ? new Date(timestamp).getTime() - new Date(state.telemetry.submitStartTimestampIso).getTime()
      : state.telemetry.timeToSubmitMs,
  };

  const updatedDraft: IRecordFormDraft = {
    ...state.draft,
    isDirty: targetStatus === 'dirty',
  };

  const updated: IRecordFormState = {
    ...state,
    draft: updatedDraft,
    explanation: updatedExplanation,
    telemetry: updatedTelemetry,
  };

  updated.confidence = {
    ...updated.confidence,
    level: computeRecordConfidence(updated),
  };

  return updated;
}

// ── Helpers ──────────────────────────────────────────────────────────────

function inferCurrentStatus(state: IRecordFormState): RecordFormStatus {
  // Check terminal/in-flight states via telemetry
  if (state.telemetry.submitCompleteTimestampIso !== null) {
    return state.failure !== null ? 'failed' : 'submitted';
  }
  if (state.telemetry.submitStartTimestampIso !== null) return 'submitting';

  if (state.explanation.isBlocked) return 'blocked';
  if (state.explanation.hasWarnings) return 'valid-with-warnings';
  if (state.draft.isDirty) return 'dirty';
  if (!state.draft.lastSavedAtIso && !state.draft.isDirty) return 'not-started';
  return 'draft';
}

function getStatusMessage(status: RecordFormStatus): string {
  const messages: Record<RecordFormStatus, string> = {
    'not-started': 'Ready to begin',
    'draft': 'Draft saved',
    'dirty': 'Unsaved changes',
    'valid-with-warnings': 'Valid with warnings — review before submitting',
    'blocked': 'Cannot submit — resolve issues first',
    'submitting': 'Submitting...',
    'submitted': 'Successfully submitted',
    'failed': 'Submission failed',
  };
  return messages[status] ?? status;
}
