/**
 * P3-E15-T10 Stage 3 Project QC Module record-families constants.
 */

import type { QcRecordFamily } from '../foundation/enums.js';
import type {
  CorrectiveActionState,
  DeviationState,
  QcIssueState,
} from '../foundation/enums.js';
import type {
  ApprovalAuthorityType,
  ControlGateType,
  CurrentnessStatus,
  DeviationExceptionType,
  QcEvidenceType,
  FindingDispositionType,
  QcEscalationLevel,
  QcIssueReadinessImpact,
  QcIssueSeverity,
  QcSlaClass,
  RecurrenceClassification,
  ReferenceMatchConfidence,
  QcRootCauseCategory,
  SubmittalActivationStage,
} from './enums.js';

// -- Enum Arrays ---------------------------------------------------------------

export const QC_ISSUE_SEVERITIES = [
  'CRITICAL',
  'HIGH',
  'MEDIUM',
  'LOW',
  'INFORMATIONAL',
] as const satisfies ReadonlyArray<QcIssueSeverity>;

export const QC_ISSUE_READINESS_IMPACTS = [
  'BLOCKS_READINESS',
  'DEGRADES_READINESS',
  'NO_IMPACT',
] as const satisfies ReadonlyArray<QcIssueReadinessImpact>;

export const QC_CONTROL_GATE_TYPES = [
  'PREINSTALLATION_MEETING',
  'MOCKUP',
  'TEST',
  'HOLD_POINT',
  'WITNESS_POINT',
] as const satisfies ReadonlyArray<ControlGateType>;

export const QC_FINDING_DISPOSITION_TYPES = [
  'ACCEPTED',
  'DEFERRED',
  'CONVERTED_TO_ISSUE',
  'REJECTED',
] as const satisfies ReadonlyArray<FindingDispositionType>;

export const QC_EVIDENCE_TYPES = [
  'DOCUMENT',
  'PHOTO',
  'INSPECTION_RECORD',
  'TEST_RESULT',
  'THIRD_PARTY_REPORT',
  'MANUFACTURER_CERTIFICATE',
  'LINKED_ARTIFACT',
] as const satisfies ReadonlyArray<QcEvidenceType>;

export const QC_APPROVAL_AUTHORITY_TYPES = [
  'AOR_CONSULTANT',
  'THIRD_PARTY_INSPECTOR',
  'REGULATORY_BODY',
  'OWNER_REPRESENTATIVE',
  'INTERNAL_AUTHORITY',
] as const satisfies ReadonlyArray<ApprovalAuthorityType>;

export const QC_ROOT_CAUSE_CATEGORIES = [
  'DESIGN',
  'MATERIAL',
  'WORKMANSHIP',
  'PROCEDURE',
  'ENVIRONMENTAL',
  'EQUIPMENT',
  'SUPERVISION',
  'COMMUNICATION',
  'TRAINING',
  'OTHER',
] as const satisfies ReadonlyArray<QcRootCauseCategory>;

export const QC_RECURRENCE_CLASSIFICATIONS = [
  'FIRST_OCCURRENCE',
  'RECURRING',
  'SYSTEMIC',
  'TRENDING',
] as const satisfies ReadonlyArray<RecurrenceClassification>;

export const QC_SUBMITTAL_ACTIVATION_STAGES = [
  'PRELIMINARY_GUIDANCE',
  'FULL_PACKAGE_DEPENDENT',
] as const satisfies ReadonlyArray<SubmittalActivationStage>;

export const QC_CURRENTNESS_STATUSES = [
  'CURRENT',
  'SUPERSEDED_BY_NEWER',
  'UNABLE_TO_VERIFY',
  'NOT_CHECKED',
] as const satisfies ReadonlyArray<CurrentnessStatus>;

export const QC_REFERENCE_MATCH_CONFIDENCES = [
  'HIGH',
  'MODERATE',
  'LOW',
  'UNMATCHED',
] as const satisfies ReadonlyArray<ReferenceMatchConfidence>;

export const QC_SLA_CLASSES = [
  'STANDARD',
  'EXPEDITED',
  'CRITICAL',
] as const satisfies ReadonlyArray<QcSlaClass>;

export const QC_ESCALATION_LEVELS = [
  'NONE',
  'PM',
  'PX',
  'EXECUTIVE',
] as const satisfies ReadonlyArray<QcEscalationLevel>;

export const QC_DEVIATION_EXCEPTION_TYPES = [
  'DEVIATION',
  'WAIVER',
] as const satisfies ReadonlyArray<DeviationExceptionType>;

// -- Label Maps ----------------------------------------------------------------

export const QC_ISSUE_SEVERITY_LABELS: Readonly<Record<QcIssueSeverity, string>> = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
  INFORMATIONAL: 'Informational',
};

export const QC_EVIDENCE_TYPE_LABELS: Readonly<Record<QcEvidenceType, string>> = {
  DOCUMENT: 'Document',
  PHOTO: 'Photo',
  INSPECTION_RECORD: 'Inspection record',
  TEST_RESULT: 'Test result',
  THIRD_PARTY_REPORT: 'Third-party report',
  MANUFACTURER_CERTIFICATE: 'Manufacturer certificate',
  LINKED_ARTIFACT: 'Linked artifact',
};

export const QC_ROOT_CAUSE_CATEGORY_LABELS: Readonly<Record<QcRootCauseCategory, string>> = {
  DESIGN: 'Design',
  MATERIAL: 'Material',
  WORKMANSHIP: 'Workmanship',
  PROCEDURE: 'Procedure',
  ENVIRONMENTAL: 'Environmental',
  EQUIPMENT: 'Equipment',
  SUPERVISION: 'Supervision',
  COMMUNICATION: 'Communication',
  TRAINING: 'Training',
  OTHER: 'Other',
};

export const QC_CURRENTNESS_STATUS_LABELS: Readonly<Record<CurrentnessStatus, string>> = {
  CURRENT: 'Current',
  SUPERSEDED_BY_NEWER: 'Superseded by newer',
  UNABLE_TO_VERIFY: 'Unable to verify',
  NOT_CHECKED: 'Not checked',
};

export const QC_SLA_CLASS_LABELS: Readonly<Record<QcSlaClass, string>> = {
  STANDARD: 'Standard',
  EXPEDITED: 'Expedited',
  CRITICAL: 'Critical',
};

export const QC_ESCALATION_LEVEL_LABELS: Readonly<Record<QcEscalationLevel, string>> = {
  NONE: 'None',
  PM: 'PM',
  PX: 'PX',
  EXECUTIVE: 'Executive',
};

// -- Record Identity Rules (T03 §5.1) -----------------------------------------

/** QC record identity rule per T03 §5.1. */
export interface IQcRecordIdentityRule {
  readonly family: QcRecordFamily;
  readonly requiredIdentifiers: readonly string[];
  readonly projectScoped: boolean;
  readonly workPackageScoped: boolean;
}

export const QC_RECORD_IDENTITY_RULES: ReadonlyArray<IQcRecordIdentityRule> = [
  {
    family: 'GovernedQualityStandard',
    requiredIdentifiers: ['governedQualityStandardId', 'standardKey', 'governedVersionId'],
    projectScoped: false,
    workPackageScoped: false,
  },
  {
    family: 'ProjectQualityExtension',
    requiredIdentifiers: ['projectQualityExtensionId', 'projectId', 'extensionVersionId'],
    projectScoped: true,
    workPackageScoped: false,
  },
  {
    family: 'WorkPackageQualityPlan',
    requiredIdentifiers: ['workPackageQualityPlanId', 'projectId', 'workPackageKey', 'planVersionId'],
    projectScoped: true,
    workPackageScoped: true,
  },
  {
    family: 'PreconstructionReviewPackage',
    requiredIdentifiers: ['preconstructionReviewPackageId', 'projectId', 'reviewPackageKey', 'reviewVersionId'],
    projectScoped: true,
    workPackageScoped: true,
  },
  {
    family: 'ReviewFinding',
    requiredIdentifiers: ['reviewFindingId', 'projectId', 'findingKey'],
    projectScoped: true,
    workPackageScoped: false,
  },
  {
    family: 'QcIssue',
    requiredIdentifiers: ['qcIssueId', 'projectId', 'issueKey'],
    projectScoped: true,
    workPackageScoped: false,
  },
  {
    family: 'CorrectiveAction',
    requiredIdentifiers: ['correctiveActionId', 'projectId', 'actionKey'],
    projectScoped: true,
    workPackageScoped: false,
  },
  {
    family: 'DeviationOrWaiverRecord',
    requiredIdentifiers: ['deviationOrWaiverRecordId', 'projectId', 'exceptionKey'],
    projectScoped: true,
    workPackageScoped: false,
  },
  {
    family: 'EvidenceReference',
    requiredIdentifiers: ['evidenceReferenceId', 'projectId', 'evidenceKey'],
    projectScoped: true,
    workPackageScoped: false,
  },
  {
    family: 'ExternalApprovalDependency',
    requiredIdentifiers: ['externalApprovalDependencyId', 'projectId', 'dependencyKey'],
    projectScoped: true,
    workPackageScoped: false,
  },
  {
    family: 'ResponsiblePartyAssignment',
    requiredIdentifiers: ['responsiblePartyAssignmentId', 'projectId', 'assignmentKey'],
    projectScoped: true,
    workPackageScoped: false,
  },
  {
    family: 'RootCauseAndRecurrenceRecord',
    requiredIdentifiers: ['rootCauseAndRecurrenceRecordId', 'projectId', 'analysisKey'],
    projectScoped: true,
    workPackageScoped: false,
  },
  {
    family: 'QualityHealthSnapshot',
    requiredIdentifiers: ['qualityHealthSnapshotId', 'projectId', 'snapshotAt'],
    projectScoped: true,
    workPackageScoped: false,
  },
  {
    family: 'GovernedUpdateNotice',
    requiredIdentifiers: ['governedUpdateNoticeId', 'governedVersionId'],
    projectScoped: false,
    workPackageScoped: false,
  },
  {
    family: 'ProjectQcSnapshot',
    requiredIdentifiers: ['projectQcSnapshotId', 'projectId'],
    projectScoped: true,
    workPackageScoped: false,
  },
  {
    family: 'ResponsibleOrgPerformanceRollupInput',
    requiredIdentifiers: ['responsibleOrgPerformanceRollupInputId', 'projectId', 'organizationKey'],
    projectScoped: true,
    workPackageScoped: false,
  },
  {
    family: 'SubmittalItemRecord',
    requiredIdentifiers: ['submittalItemRecordId', 'projectId', 'itemKey'],
    projectScoped: true,
    workPackageScoped: false,
  },
  {
    family: 'DocumentInventoryEntry',
    requiredIdentifiers: ['documentInventoryEntryId', 'projectId', 'inventoryKey'],
    projectScoped: true,
    workPackageScoped: false,
  },
  {
    family: 'AdvisoryVerdict',
    requiredIdentifiers: ['advisoryVerdictId', 'projectId', 'submittalItemRecordId'],
    projectScoped: true,
    workPackageScoped: false,
  },
  {
    family: 'AdvisoryException',
    requiredIdentifiers: ['advisoryExceptionId', 'projectId', 'submittalItemRecordId'],
    projectScoped: true,
    workPackageScoped: false,
  },
  {
    family: 'VersionDriftAlert',
    requiredIdentifiers: ['versionDriftAlertId', 'projectId', 'submittalItemRecordId'],
    projectScoped: true,
    workPackageScoped: false,
  },
];

// -- Finding-to-Issue Required Fields (T03 §5.3) ------------------------------

export const QC_FINDING_TO_ISSUE_REQUIRED_FIELDS: readonly string[] = [
  'originReviewPackageId',
  'originFindingId',
  'findingSeverity',
  'governedRequirementRefs',
  'originResponsiblePartyContext',
];

// -- State Transition Matrices ------------------------------------------------

export const QC_ISSUE_VALID_TRANSITIONS: ReadonlyArray<{
  readonly from: QcIssueState;
  readonly to: QcIssueState;
}> = [
  { from: 'OPEN', to: 'IN_PROGRESS' },
  { from: 'OPEN', to: 'VOIDED' },
  { from: 'OPEN', to: 'ESCALATED' },
  { from: 'IN_PROGRESS', to: 'READY_FOR_REVIEW' },
  { from: 'IN_PROGRESS', to: 'ESCALATED' },
  { from: 'IN_PROGRESS', to: 'VOIDED' },
  { from: 'READY_FOR_REVIEW', to: 'VERIFIED' },
  { from: 'READY_FOR_REVIEW', to: 'IN_PROGRESS' },
  { from: 'VERIFIED', to: 'CLOSED' },
  { from: 'ESCALATED', to: 'IN_PROGRESS' },
  { from: 'ESCALATED', to: 'VOIDED' },
];

export const QC_CORRECTIVE_ACTION_VALID_TRANSITIONS: ReadonlyArray<{
  readonly from: CorrectiveActionState;
  readonly to: CorrectiveActionState;
}> = [
  { from: 'OPEN', to: 'IN_PROGRESS' },
  { from: 'OPEN', to: 'VOIDED' },
  { from: 'IN_PROGRESS', to: 'READY_FOR_REVIEW' },
  { from: 'IN_PROGRESS', to: 'OVERDUE' },
  { from: 'IN_PROGRESS', to: 'VOIDED' },
  { from: 'READY_FOR_REVIEW', to: 'VERIFIED' },
  { from: 'READY_FOR_REVIEW', to: 'IN_PROGRESS' },
  { from: 'OVERDUE', to: 'IN_PROGRESS' },
  { from: 'OVERDUE', to: 'VOIDED' },
  { from: 'VERIFIED', to: 'CLOSED' },
];

export const QC_DEVIATION_VALID_TRANSITIONS: ReadonlyArray<{
  readonly from: DeviationState;
  readonly to: DeviationState;
}> = [
  { from: 'DRAFT', to: 'SUBMITTED' },
  { from: 'DRAFT', to: 'WITHDRAWN' },
  { from: 'SUBMITTED', to: 'APPROVED' },
  { from: 'SUBMITTED', to: 'REJECTED' },
  { from: 'SUBMITTED', to: 'WITHDRAWN' },
  { from: 'APPROVED', to: 'EXPIRED' },
  { from: 'REJECTED', to: 'DRAFT' },
];

// -- Terminal States -----------------------------------------------------------

export const QC_ISSUE_TERMINAL_STATES = [
  'CLOSED',
  'VOIDED',
] as const satisfies ReadonlyArray<QcIssueState>;

export const QC_CORRECTIVE_ACTION_TERMINAL_STATES = [
  'CLOSED',
  'VOIDED',
] as const satisfies ReadonlyArray<CorrectiveActionState>;

export const QC_DEVIATION_TERMINAL_STATES = [
  'APPROVED',
  'REJECTED',
  'EXPIRED',
  'WITHDRAWN',
] as const satisfies ReadonlyArray<DeviationState>;

// -- Families Requiring Responsible Party --------------------------------------

export const QC_FAMILIES_REQUIRING_RESPONSIBLE_PARTY: readonly QcRecordFamily[] = [
  'WorkPackageQualityPlan',
  'PreconstructionReviewPackage',
  'ReviewFinding',
  'QcIssue',
  'CorrectiveAction',
  'DeviationOrWaiverRecord',
  'ExternalApprovalDependency',
  'SubmittalItemRecord',
  'VersionDriftAlert',
  'RootCauseAndRecurrenceRecord',
];

// -- Snapshot-Family Immutable List --------------------------------------------

export const QC_SNAPSHOT_IMMUTABLE_FAMILIES: readonly QcRecordFamily[] = [
  'QualityHealthSnapshot',
  'ProjectQcSnapshot',
  'ResponsibleOrgPerformanceRollupInput',
  'AdvisoryVerdict',
];

// -- Origin Lineage Required Families ------------------------------------------

export const QC_ORIGIN_LINEAGE_REQUIRED_FAMILIES: readonly QcRecordFamily[] = [
  'ReviewFinding',
  'QcIssue',
  'CorrectiveAction',
  'EvidenceReference',
];

// -- Work-Package-Scoped Families ----------------------------------------------

export const QC_WORK_PACKAGE_SCOPED_FAMILIES: readonly QcRecordFamily[] = [
  'WorkPackageQualityPlan',
  'PreconstructionReviewPackage',
];
