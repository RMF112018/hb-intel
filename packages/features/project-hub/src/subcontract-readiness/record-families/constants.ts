/**
 * P3-E13-T08 Stage 2 Subcontract Execution Readiness Module record-families constants.
 * Record family map, lifecycle statuses, identity rules, decision structure.
 */

import type {
  ExecutionReadinessOutcome,
  InCaseContinuityReason,
  OutcomeReasonCode,
  ReadinessLedgerType,
  ReadinessRecordFamily,
  ReadinessWorkflowStatus,
  SupersedeVoidTrigger,
} from './enums.js';
import type {
  IInCaseContinuityDef,
  IReadinessRecordFamilyDef,
  ISupersedeVoidTriggerDef,
} from './types.js';

// -- Enum Arrays ----------------------------------------------------------------

export const READINESS_WORKFLOW_STATUSES = [
  'DRAFT', 'ASSEMBLING', 'SUBMITTED_FOR_REVIEW', 'UNDER_EVALUATION',
  'AWAITING_RESPONSE', 'AWAITING_EXCEPTION', 'READY_FOR_ISSUANCE',
  'ISSUED', 'RENEWAL_DUE', 'SUPERSEDED', 'VOID',
] as const satisfies ReadonlyArray<ReadinessWorkflowStatus>;

export const EXECUTION_READINESS_OUTCOMES = [
  'NOT_ISSUED', 'READY', 'BLOCKED',
  'READY_WITH_APPROVED_EXCEPTION', 'SUPERSEDED', 'VOID',
] as const satisfies ReadonlyArray<ExecutionReadinessOutcome>;

export const READINESS_RECORD_FAMILIES = [
  // Primary ledger (10)
  'SubcontractReadinessCase', 'ReadinessRequirementItem',
  'RequirementArtifact', 'RequirementEvaluation',
  'ExceptionCase', 'ExceptionSubmissionIteration',
  'ExceptionApprovalSlot', 'ExceptionApprovalAction',
  'ExceptionDelegationEvent', 'ExecutionReadinessDecision',
  // Publication artifact (1)
  'GlobalPrecedentReference',
  // Downstream projections (4)
  'ReadinessHealthProjection', 'ReadinessWorkQueueProjection',
  'ReadinessRelatedItemProjection', 'ReadinessActivityProjection',
] as const satisfies ReadonlyArray<ReadinessRecordFamily>;

export const READINESS_LEDGER_TYPES = [
  'PRIMARY_LEDGER', 'PUBLICATION_ARTIFACT', 'DOWNSTREAM_PROJECTION',
] as const satisfies ReadonlyArray<ReadinessLedgerType>;

export const SUPERSEDE_VOID_TRIGGERS = [
  'LEGAL_ENTITY_CHANGE', 'BUYOUT_LINE_REPLACEMENT',
  'SCOPE_RISK_POSTURE_CHANGE', 'AWARD_PATH_ABANDONMENT',
] as const satisfies ReadonlyArray<SupersedeVoidTrigger>;

export const IN_CASE_CONTINUITY_REASONS = [
  'ROUTINE_RESUBMISSION', 'DEFICIENCY_CORRECTION',
  'CORRECTED_UPLOAD', 'EXPIRATION_RENEWAL', 'RE_REVIEW_AFTER_REJECTION',
] as const satisfies ReadonlyArray<InCaseContinuityReason>;

export const OUTCOME_REASON_CODES = [
  'ALL_ITEMS_SATISFIED', 'BLOCKING_ITEMS_REMAIN',
  'APPROVED_EXCEPTIONS_COVER_GAPS', 'SUPERSEDED_BY_NEW_CASE', 'CASE_VOIDED',
] as const satisfies ReadonlyArray<OutcomeReasonCode>;

// -- Label Maps -----------------------------------------------------------------

export const READINESS_WORKFLOW_STATUS_LABELS: Readonly<Record<ReadinessWorkflowStatus, string>> = {
  DRAFT: 'Draft',
  ASSEMBLING: 'Assembling',
  SUBMITTED_FOR_REVIEW: 'Submitted for Review',
  UNDER_EVALUATION: 'Under Evaluation',
  AWAITING_RESPONSE: 'Awaiting Response',
  AWAITING_EXCEPTION: 'Awaiting Exception',
  READY_FOR_ISSUANCE: 'Ready for Issuance',
  ISSUED: 'Issued',
  RENEWAL_DUE: 'Renewal Due',
  SUPERSEDED: 'Superseded',
  VOID: 'Void',
};

export const EXECUTION_READINESS_OUTCOME_LABELS: Readonly<Record<ExecutionReadinessOutcome, string>> = {
  NOT_ISSUED: 'Not Issued',
  READY: 'Ready',
  BLOCKED: 'Blocked',
  READY_WITH_APPROVED_EXCEPTION: 'Ready with Approved Exception',
  SUPERSEDED: 'Superseded',
  VOID: 'Void',
};

export const READINESS_RECORD_FAMILY_LABELS: Readonly<Record<ReadinessRecordFamily, string>> = {
  SubcontractReadinessCase: 'Subcontract Readiness Case',
  ReadinessRequirementItem: 'Readiness Requirement Item',
  RequirementArtifact: 'Requirement Artifact',
  RequirementEvaluation: 'Requirement Evaluation',
  ExceptionCase: 'Exception Case',
  ExceptionSubmissionIteration: 'Exception Submission Iteration',
  ExceptionApprovalSlot: 'Exception Approval Slot',
  ExceptionApprovalAction: 'Exception Approval Action',
  ExceptionDelegationEvent: 'Exception Delegation Event',
  ExecutionReadinessDecision: 'Execution Readiness Decision',
  GlobalPrecedentReference: 'Global Precedent Reference',
  ReadinessHealthProjection: 'Readiness Health Projection',
  ReadinessWorkQueueProjection: 'Readiness Work Queue Projection',
  ReadinessRelatedItemProjection: 'Readiness Related Item Projection',
  ReadinessActivityProjection: 'Readiness Activity Projection',
};

export const SUPERSEDE_VOID_TRIGGER_LABELS: Readonly<Record<SupersedeVoidTrigger, string>> = {
  LEGAL_ENTITY_CHANGE: 'Legal entity changes',
  BUYOUT_LINE_REPLACEMENT: 'Buyout-line replacement that changes award intent',
  SCOPE_RISK_POSTURE_CHANGE: 'Scope or risk posture changes altering case identity',
  AWARD_PATH_ABANDONMENT: 'Explicit abandonment of the award path',
};

export const OUTCOME_REASON_CODE_LABELS: Readonly<Record<OutcomeReasonCode, string>> = {
  ALL_ITEMS_SATISFIED: 'All requirement items satisfied',
  BLOCKING_ITEMS_REMAIN: 'Blocking items remain unresolved',
  APPROVED_EXCEPTIONS_COVER_GAPS: 'Approved exceptions cover remaining gaps',
  SUPERSEDED_BY_NEW_CASE: 'Superseded by a new case',
  CASE_VOIDED: 'Case voided',
};

// -- Record Family Definitions (T02 §1) ----------------------------------------

export const READINESS_RECORD_FAMILY_DEFINITIONS: ReadonlyArray<IReadinessRecordFamilyDef> = [
  // Primary ledger (10)
  { family: 'SubcontractReadinessCase', purpose: 'Parent source-of-truth record for one active governed award path', ledgerType: 'PRIMARY_LEDGER' },
  { family: 'ReadinessRequirementItem', purpose: 'Generated governed item under a case', ledgerType: 'PRIMARY_LEDGER' },
  { family: 'RequirementArtifact', purpose: 'Linked evidence, external references, and receipt provenance', ledgerType: 'PRIMARY_LEDGER' },
  { family: 'RequirementEvaluation', purpose: 'Specialist evaluation result and typed ruling detail', ledgerType: 'PRIMARY_LEDGER' },
  { family: 'ExceptionCase', purpose: 'Parent governed exception aggregate under the readiness case', ledgerType: 'PRIMARY_LEDGER' },
  { family: 'ExceptionSubmissionIteration', purpose: 'Immutable submitted snapshot for an exception packet iteration', ledgerType: 'PRIMARY_LEDGER' },
  { family: 'ExceptionApprovalSlot', purpose: 'Required approval slot preserved across delegation', ledgerType: 'PRIMARY_LEDGER' },
  { family: 'ExceptionApprovalAction', purpose: 'Actual approve / reject / return action tied to an iteration and slot', ledgerType: 'PRIMARY_LEDGER' },
  { family: 'ExceptionDelegationEvent', purpose: 'Delegation / reassignment audit tied to a slot', ledgerType: 'PRIMARY_LEDGER' },
  { family: 'ExecutionReadinessDecision', purpose: 'Formal issued decision for gate consumption', ledgerType: 'PRIMARY_LEDGER' },
  // Publication artifact (1)
  { family: 'GlobalPrecedentReference', purpose: 'Published governed cross-project reference artifact derived from an approved exception', ledgerType: 'PUBLICATION_ARTIFACT' },
  // Downstream projections (4)
  { family: 'ReadinessHealthProjection', purpose: 'Health summary for project-level health surfaces', ledgerType: 'DOWNSTREAM_PROJECTION' },
  { family: 'ReadinessWorkQueueProjection', purpose: 'Actionable routed work for work-intelligence surfaces', ledgerType: 'DOWNSTREAM_PROJECTION' },
  { family: 'ReadinessRelatedItemProjection', purpose: 'Linked-item relationships to Financial and other consumers', ledgerType: 'DOWNSTREAM_PROJECTION' },
  { family: 'ReadinessActivityProjection', purpose: 'Activity spine events for audit and timeline consumption', ledgerType: 'DOWNSTREAM_PROJECTION' },
];

// -- Supersede/Void Trigger Definitions (T02 §3.3) ----------------------------

export const SUPERSEDE_VOID_TRIGGER_DEFINITIONS: ReadonlyArray<ISupersedeVoidTriggerDef> = [
  { trigger: 'LEGAL_ENTITY_CHANGE', description: 'Legal entity changes' },
  { trigger: 'BUYOUT_LINE_REPLACEMENT', description: 'Buyout-line replacement that changes the underlying award intent' },
  { trigger: 'SCOPE_RISK_POSTURE_CHANGE', description: 'Scope or risk posture changes that alter the case identity rather than only an item evaluation' },
  { trigger: 'AWARD_PATH_ABANDONMENT', description: 'Explicit abandonment of the award path' },
];

// -- In-Case Continuity Definitions (T02 §3.2) --------------------------------

export const IN_CASE_CONTINUITY_DEFINITIONS: ReadonlyArray<IInCaseContinuityDef> = [
  { reason: 'ROUTINE_RESUBMISSION', description: 'Routine artifact resubmission' },
  { reason: 'DEFICIENCY_CORRECTION', description: 'Deficiency correction' },
  { reason: 'CORRECTED_UPLOAD', description: 'Corrected uploads' },
  { reason: 'EXPIRATION_RENEWAL', description: 'Expiration-driven renewal for the same identity' },
  { reason: 'RE_REVIEW_AFTER_REJECTION', description: 'Re-review after an exception rejection where the same award path still applies' },
];

// -- Immutable Case Identity Fields (T02 §2.1) ---------------------------------

/** Fields that are immutable once the case is created per T02 §2.1. */
export const IMMUTABLE_CASE_IDENTITY_FIELDS = [
  'readinessCaseId',
  'projectId',
  'subcontractorLegalEntityId',
  'awardPathFingerprint',
] as const;

// -- Terminal Workflow Statuses --------------------------------------------------

/** Workflow statuses that indicate the case is no longer active. */
export const TERMINAL_WORKFLOW_STATUSES = [
  'SUPERSEDED', 'VOID',
] as const satisfies ReadonlyArray<ReadinessWorkflowStatus>;

/** Workflow statuses that indicate the case is still active/in-process. */
export const ACTIVE_WORKFLOW_STATUSES = [
  'DRAFT', 'ASSEMBLING', 'SUBMITTED_FOR_REVIEW', 'UNDER_EVALUATION',
  'AWAITING_RESPONSE', 'AWAITING_EXCEPTION', 'READY_FOR_ISSUANCE',
  'ISSUED', 'RENEWAL_DUE',
] as const satisfies ReadonlyArray<ReadinessWorkflowStatus>;

// -- Primary Ledger Record Families ---------------------------------------------

/** The 10 primary ledger record families per T02 §1. */
export const PRIMARY_LEDGER_FAMILIES = [
  'SubcontractReadinessCase', 'ReadinessRequirementItem',
  'RequirementArtifact', 'RequirementEvaluation',
  'ExceptionCase', 'ExceptionSubmissionIteration',
  'ExceptionApprovalSlot', 'ExceptionApprovalAction',
  'ExceptionDelegationEvent', 'ExecutionReadinessDecision',
] as const satisfies ReadonlyArray<ReadinessRecordFamily>;

/** The 4 downstream projection record families per T02 §8. */
export const DOWNSTREAM_PROJECTION_FAMILIES = [
  'ReadinessHealthProjection', 'ReadinessWorkQueueProjection',
  'ReadinessRelatedItemProjection', 'ReadinessActivityProjection',
] as const satisfies ReadonlyArray<ReadinessRecordFamily>;
