/**
 * P3-E15-T10 Stage 6 Project QC Module deviations-evidence constants.
 */

import type { DeviationState } from '../foundation/enums.js';
import type {
  ApprovalProvenanceEvent,
  ConflictResolutionPath,
  DeviationConditionType,
  DeviationReadinessEffect,
  EvidenceMinimumUseCase,
  EvidenceSufficiencyStatus,
  ExternalApprovalResolutionType,
  ReadinessImpactAction,
} from './enums.js';

// -- Enum Arrays ---------------------------------------------------------------

export const QC_DEVIATION_CONDITION_TYPES = [
  'LIMITED_DURATION',
  'EXTRA_EVIDENCE',
  'ADDED_REVIEWER_CHECK',
  'ADDITIONAL_APPROVAL',
  'HEIGHTENED_MONITORING',
  'MANDATORY_CORRECTIVE_ACTION',
] as const satisfies ReadonlyArray<DeviationConditionType>;

export const QC_EVIDENCE_MINIMUM_USE_CASES = [
  'PLAN_ACTIVATION',
  'REVIEW_PACKAGE_ACCEPTANCE',
  'GATE_ACCEPTANCE',
  'ISSUE_READY_FOR_REVIEW',
  'ACTION_VERIFICATION',
  'DEVIATION_APPROVAL',
  'EXTERNAL_APPROVAL_RECEIPT',
] as const satisfies ReadonlyArray<EvidenceMinimumUseCase>;

export const QC_EVIDENCE_SUFFICIENCY_STATUSES = [
  'SATISFIED',
  'NOT_SATISFIED',
  'REVIEW_PENDING',
  'NOT_APPLICABLE',
] as const satisfies ReadonlyArray<EvidenceSufficiencyStatus>;

export const QC_CONFLICT_RESOLUTION_PATHS = [
  'ADOPT_NEWER_SOURCE',
  'RETAIN_APPROVED_BASIS',
  'TEMPORARY_EXCEPTION',
  'UNRESOLVED',
] as const satisfies ReadonlyArray<ConflictResolutionPath>;

export const QC_READINESS_IMPACT_ACTIONS = [
  'NO_CHANGE',
  'DEGRADE_TO_BLOCKED',
  'DEGRADE_TO_NOT_READY',
  'DEGRADE_TO_CONDITIONAL',
  'ESCALATE',
  'RE_BLOCK',
] as const satisfies ReadonlyArray<ReadinessImpactAction>;

export const QC_APPROVAL_PROVENANCE_EVENTS = [
  'IDENTIFIED',
  'SUBMITTED',
  'RESPONSE_RECEIVED',
  'PROOF_ATTACHED',
  'READINESS_RELEASED',
  'READINESS_BLOCKED',
] as const satisfies ReadonlyArray<ApprovalProvenanceEvent>;

export const QC_DEVIATION_READINESS_EFFECTS = [
  'STANDARD_READINESS',
  'READY_WITH_CONDITIONS',
  'NOT_READY',
  'BLOCKED',
] as const satisfies ReadonlyArray<DeviationReadinessEffect>;

export const QC_EXTERNAL_APPROVAL_RESOLUTION_TYPES = [
  'APPROVED_WITH_PROOF',
  'REJECTED_WITH_REASON',
  'WAIVED_WITH_JUSTIFICATION',
  'EXPIRED_UNRESOLVED',
] as const satisfies ReadonlyArray<ExternalApprovalResolutionType>;

// -- Label Maps ----------------------------------------------------------------

export const QC_DEVIATION_CONDITION_TYPE_LABELS: Readonly<Record<DeviationConditionType, string>> = {
  LIMITED_DURATION: 'Limited duration',
  EXTRA_EVIDENCE: 'Extra evidence',
  ADDED_REVIEWER_CHECK: 'Added reviewer check',
  ADDITIONAL_APPROVAL: 'Additional approval',
  HEIGHTENED_MONITORING: 'Heightened monitoring',
  MANDATORY_CORRECTIVE_ACTION: 'Mandatory corrective action',
};

export const QC_EVIDENCE_MINIMUM_USE_CASE_LABELS: Readonly<Record<EvidenceMinimumUseCase, string>> = {
  PLAN_ACTIVATION: 'Plan activation',
  REVIEW_PACKAGE_ACCEPTANCE: 'Review package acceptance',
  GATE_ACCEPTANCE: 'Gate acceptance',
  ISSUE_READY_FOR_REVIEW: 'Issue ready for review',
  ACTION_VERIFICATION: 'Action verification',
  DEVIATION_APPROVAL: 'Deviation approval',
  EXTERNAL_APPROVAL_RECEIPT: 'External approval receipt',
};

export const QC_CONFLICT_RESOLUTION_PATH_LABELS: Readonly<Record<ConflictResolutionPath, string>> = {
  ADOPT_NEWER_SOURCE: 'Adopt newer source',
  RETAIN_APPROVED_BASIS: 'Retain approved basis',
  TEMPORARY_EXCEPTION: 'Temporary exception',
  UNRESOLVED: 'Unresolved',
};

export const QC_DEVIATION_READINESS_EFFECT_LABELS: Readonly<Record<DeviationReadinessEffect, string>> = {
  STANDARD_READINESS: 'Standard readiness',
  READY_WITH_CONDITIONS: 'Ready with conditions',
  NOT_READY: 'Not ready',
  BLOCKED: 'Blocked',
};

// -- Definition Arrays ---------------------------------------------------------

export const EVIDENCE_MINIMUM_USE_CASE_DEFINITIONS: ReadonlyArray<{
  readonly useCase: EvidenceMinimumUseCase;
  readonly description: string;
  readonly governedMinimum: string;
}> = [
  {
    useCase: 'PLAN_ACTIVATION',
    description: 'Baseline plan activation requires governed evidence minimum',
    governedMinimum: 'At least one approved document or inspection record',
  },
  {
    useCase: 'REVIEW_PACKAGE_ACCEPTANCE',
    description: 'Review package requires evidence for acceptance',
    governedMinimum: 'At least one document per review finding',
  },
  {
    useCase: 'GATE_ACCEPTANCE',
    description: 'Control gate requires evidence for acceptance',
    governedMinimum: 'At least one inspection record or test result',
  },
  {
    useCase: 'ISSUE_READY_FOR_REVIEW',
    description: 'Issue ready-for-review requires evidence submission',
    governedMinimum: 'At least one evidence reference linked to issue',
  },
  {
    useCase: 'ACTION_VERIFICATION',
    description: 'Corrective action verification requires evidence',
    governedMinimum: 'At least one verification document or photo',
  },
  {
    useCase: 'DEVIATION_APPROVAL',
    description: 'Deviation approval requires supporting evidence',
    governedMinimum: 'At least one justification document',
  },
  {
    useCase: 'EXTERNAL_APPROVAL_RECEIPT',
    description: 'External approval receipt requires proof documentation',
    governedMinimum: 'At least one proof document from external authority',
  },
];

export const DEVIATION_CONDITION_DEFINITIONS: ReadonlyArray<{
  readonly conditionType: DeviationConditionType;
  readonly description: string;
}> = [
  { conditionType: 'LIMITED_DURATION', description: 'Deviation is valid only for a specified time period' },
  { conditionType: 'EXTRA_EVIDENCE', description: 'Additional evidence must be collected during deviation period' },
  { conditionType: 'ADDED_REVIEWER_CHECK', description: 'Additional reviewer sign-off required at defined checkpoints' },
  { conditionType: 'ADDITIONAL_APPROVAL', description: 'Higher-level approval required beyond standard authority' },
  { conditionType: 'HEIGHTENED_MONITORING', description: 'Increased monitoring frequency during deviation period' },
  { conditionType: 'MANDATORY_CORRECTIVE_ACTION', description: 'Corrective action must be completed as condition of deviation' },
];

export const APPROVAL_PROVENANCE_EVENT_SEQUENCE: readonly ApprovalProvenanceEvent[] = [
  'IDENTIFIED',
  'SUBMITTED',
  'RESPONSE_RECEIVED',
  'PROOF_ATTACHED',
  'READINESS_RELEASED',
  'READINESS_BLOCKED',
];

export const DEVIATION_READINESS_EFFECT_MAP: ReadonlyArray<{
  readonly deviationState: DeviationState;
  readonly effect: DeviationReadinessEffect;
}> = [
  { deviationState: 'DRAFT', effect: 'NOT_READY' },
  { deviationState: 'SUBMITTED', effect: 'NOT_READY' },
  { deviationState: 'UNDER_REVIEW', effect: 'NOT_READY' },
  { deviationState: 'APPROVED', effect: 'READY_WITH_CONDITIONS' },
  { deviationState: 'REJECTED', effect: 'BLOCKED' },
  { deviationState: 'EXPIRED', effect: 'BLOCKED' },
  { deviationState: 'WITHDRAWN', effect: 'STANDARD_READINESS' },
  { deviationState: 'RESOLVED', effect: 'STANDARD_READINESS' },
];

export const CONFLICT_RESOLUTION_PATH_DEFINITIONS: ReadonlyArray<{
  readonly path: ConflictResolutionPath;
  readonly description: string;
}> = [
  { path: 'ADOPT_NEWER_SOURCE', description: 'Replace previous basis with newer official source version' },
  { path: 'RETAIN_APPROVED_BASIS', description: 'Keep current approved project basis despite newer source' },
  { path: 'TEMPORARY_EXCEPTION', description: 'Create deviation record to bridge gap until full adoption' },
  { path: 'UNRESOLVED', description: 'Conflict requires explicit review and has not been resolved' },
];
