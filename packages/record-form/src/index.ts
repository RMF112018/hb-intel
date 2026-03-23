/**
 * @hbc/record-form
 *
 * Shared record authoring runtime primitive for HB Intel.
 * Provides create/edit/duplicate/template lifecycle, draft recovery,
 * review/submission handoff, offline replay, and module adapter seams.
 *
 * SF23 Master Plan — L-01 ownership, L-03 complexity tiers,
 * L-04 offline resilience, L-06 deep-linking/provenance.
 *
 * @see docs/architecture/plans/shared-features/SF23-Record-Form.md
 */

// Types — SF23-T02 canonical contracts
export type {
  RecordFormMode,
  RecordFormStatus,
  RecordSyncState,
  RecordStateConfidence,
  RecordFormComplexityTier,
  RecordFormIntent,
  RecordFormConfidence,
  IRecordFormExplanationState,
  IRecordValidationState,
  IRecordValidationWarning,
  IRecordBlockedReason,
  IRecordFormDraft,
  IRecordDraftComparisonState,
  IRecordReviewStepState,
  IRecordReviewStepHistoryEntry,
  IRecordBicStepConfig,
  IRecordNextRecommendedAction,
  IRecordRecoveryState,
  IRecordConflictState,
  IRecordSubmitGuardState,
  IRecordFormFailureState,
  IRecordFormRetryState,
  IRecordFormTelemetryState,
  IRecordSyncStateInfo,
  IRecordStateConfidenceInfo,
  IRecordFormDefinition,
  IRecordFormState,
  RecordBlockedReasonCode,
  RecordWarningReasonCode,
  RecordRecoveryReasonCode,
  RecordFormFailureReasonCode,
  RecordDeferReasonCode,
  RecordRetryReasonCode,
} from './types/index.js';

// Constants — SF23-T01 + T02 locked values
export {
  RECORD_FORM_STATUSES,
  RECORD_SYNC_STATES,
  RECORD_STATE_CONFIDENCE_LEVELS,
  RECORD_FORM_COMPLEXITY_TIERS,
  RECORD_FORM_SYNC_QUEUE_KEY,
  RECORD_FORM_SYNC_STATUSES,
  RECORD_FORM_TRUST_STATES,
} from './types/index.js';

// Model — lifecycle, state derivation, recovery (SF23-T03)
// export * from './model/index.js';

// API — draft persistence, submission, sync (SF23-T03)
// export * from './api/index.js';

// Hooks — form orchestration hooks (SF23-T04)
// export * from './hooks/index.js';

// Components — thin composition shells (SF23-T05/T06)
// export * from './components/index.js';

// Adapters — module registry (SF23-T07)
// export * from './adapters/index.js';
