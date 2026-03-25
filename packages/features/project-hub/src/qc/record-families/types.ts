/**
 * P3-E15-T10 Stage 3 Project QC Module record-families TypeScript contracts.
 */

import type {
  CorrectiveActionState,
  DeviationState,
  DocInventoryState,
  EvidenceRefState,
  ExternalApprovalState,
  QcIssueOrigin,
  QcIssueState,
  QualityHealthSnapshotState,
  ResponsiblePartyState,
  ReviewFindingState,
  ReviewPackageState,
  RollupInputState,
  RootCauseState,
  SubmittalItemState,
  WorkPackagePlanState,
  AdvisoryVerdictState,
  AdvisoryExceptionState,
  VersionDriftAlertState,
} from '../foundation/enums.js';
import type {
  ApprovalAuthorityType,
  CurrentnessStatus,
  DeviationExceptionType,
  QcEvidenceType,
  FindingDispositionType,
  QcEscalationLevel,
  QcIssueReadinessImpact,
  QcIssueSeverity,
  QcSlaClass,
  ReferenceMatchConfidence,
  RecurrenceClassification,
  QcRootCauseCategory,
  SubmittalActivationStage,
} from './enums.js';

// -- §2.2 Planning and Review -------------------------------------------------

/** Work package quality plan record per T03 §2.2. */
export interface IWorkPackageQualityPlan {
  readonly workPackageQualityPlanId: string;
  readonly projectId: string;
  readonly workPackageKey: string;
  readonly planVersionId: string;
  readonly governedStandardRefs: readonly string[];
  readonly projectExtensionRefs: readonly string[];
  readonly responsibleOrganization: string;
  readonly responsibleIndividual: string | null;
  readonly verifierDesignationRef: string | null;
  readonly mandatoryCoverageRefs: readonly string[];
  readonly highRiskAdditionRefs: readonly string[];
  readonly softGateSet: readonly string[];
  readonly evidenceMinimumRefs: readonly string[];
  readonly scheduleAwarenessRefs: readonly string[];
  readonly downstreamHandoffFlags: readonly string[];
  readonly dueDate: string | null;
  readonly state: WorkPackagePlanState;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Preconstruction review package record per T03 §2.2. */
export interface IPreconstructionReviewPackage {
  readonly preconstructionReviewPackageId: string;
  readonly projectId: string;
  readonly reviewPackageKey: string;
  readonly reviewVersionId: string;
  readonly packageType: string;
  readonly scope: string;
  readonly linkedWorkPackageKey: string;
  readonly requiredDisciplines: readonly string[];
  readonly requiredReviewers: readonly string[];
  readonly packageReferences: readonly string[];
  readonly specReferences: readonly string[];
  readonly decisionStatus: ReviewPackageState;
  readonly meetingDate: string | null;
  readonly dueDate: string | null;
  readonly responsibleOrganization: string;
  readonly responsibleIndividual: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Review finding record per T03 §2.2. */
export interface IReviewFinding {
  readonly reviewFindingId: string;
  readonly projectId: string;
  readonly findingKey: string;
  readonly originReviewPackageId: string;
  readonly findingType: string;
  readonly severity: QcIssueSeverity;
  readonly responsibleOrganization: string;
  readonly responsibleIndividual: string | null;
  readonly dueDate: string | null;
  readonly disposition: FindingDispositionType | null;
  readonly evidenceExpectationRefs: readonly string[];
  readonly linkedRequirementRefs: readonly string[];
  readonly convertedToIssueId: string | null;
  readonly state: ReviewFindingState;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// -- §2.3 Issues, Actions, Exceptions -----------------------------------------

/** QC issue record per T03 §2.3. */
export interface IQcIssue {
  readonly qcIssueId: string;
  readonly projectId: string;
  readonly issueKey: string;
  readonly issueOrigin: QcIssueOrigin;
  readonly originReviewPackageId: string | null;
  readonly originFindingId: string | null;
  readonly workPackageRef: string | null;
  readonly responsibleOrganization: string;
  readonly responsibleIndividual: string | null;
  readonly verifierDesignationRef: string | null;
  readonly severity: QcIssueSeverity;
  readonly dueDate: string | null;
  readonly slaClass: QcSlaClass;
  readonly readinessImpact: QcIssueReadinessImpact;
  readonly rootCausePlaceholder: string | null;
  readonly rootCauseRecordId: string | null;
  readonly escalationLevel: QcEscalationLevel;
  readonly state: QcIssueState;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Corrective action record per T03 §2.3. */
export interface ICorrectiveAction {
  readonly correctiveActionId: string;
  readonly projectId: string;
  readonly actionKey: string;
  readonly qcIssueId: string;
  readonly actionDescription: string;
  readonly responsibleOrganization: string;
  readonly responsibleIndividual: string | null;
  readonly verifierDesignationRef: string | null;
  readonly dueDate: string | null;
  readonly evidenceExpectationRefs: readonly string[];
  readonly escalationFlags: readonly string[];
  readonly state: CorrectiveActionState;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Deviation or waiver record per T03 §2.3. */
export interface IDeviationOrWaiverRecord {
  readonly deviationOrWaiverRecordId: string;
  readonly projectId: string;
  readonly exceptionKey: string;
  readonly exceptionType: DeviationExceptionType;
  readonly governedRuleReference: string;
  readonly rationale: string;
  readonly approverSet: readonly string[];
  readonly effectiveDates: string;
  readonly expiryDate: string | null;
  readonly affectedRecordRefs: readonly string[];
  readonly responsibleOrganization: string;
  readonly responsibleIndividual: string | null;
  readonly linkedEvidenceRefs: readonly string[];
  readonly downstreamImpactFlags: readonly string[];
  readonly reviewByDate: string | null;
  readonly state: DeviationState;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// -- §2.4 Evidence and Approvals ----------------------------------------------

/** Evidence reference record per T03 §2.4. */
export interface IEvidenceReference {
  readonly evidenceReferenceId: string;
  readonly projectId: string;
  readonly evidenceKey: string;
  readonly sourceSystemRef: string;
  readonly documentReference: string;
  readonly evidenceType: QcEvidenceType;
  readonly evidenceDate: string;
  readonly responsibleOrganization: string | null;
  readonly responsibleIndividual: string | null;
  readonly minimumRuleRef: string | null;
  readonly linkedRecordRefs: readonly string[];
  readonly supersededByRef: string | null;
  readonly state: EvidenceRefState;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** External approval dependency record per T03 §2.4. */
export interface IExternalApprovalDependency {
  readonly externalApprovalDependencyId: string;
  readonly projectId: string;
  readonly dependencyKey: string;
  readonly approvalAuthority: string;
  readonly approvalAuthorityType: ApprovalAuthorityType;
  readonly requiredDecision: string;
  readonly dueDate: string | null;
  readonly submissionReference: string | null;
  readonly responsibleOrganization: string;
  readonly responsibleIndividual: string | null;
  readonly escalationClass: QcEscalationLevel;
  readonly linkedPlanRefs: readonly string[];
  readonly linkedIssueRefs: readonly string[];
  readonly linkedActionRefs: readonly string[];
  readonly acceptanceReceiptRef: string | null;
  readonly rejectionReceiptRef: string | null;
  readonly state: ExternalApprovalState;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Responsible party assignment record per T03 §2.4. */
export interface IResponsiblePartyAssignment {
  readonly responsiblePartyAssignmentId: string;
  readonly projectId: string;
  readonly assignmentKey: string;
  readonly owningRecordRef: string;
  readonly responsibleOrganization: string;
  readonly responsibleIndividual: string | null;
  readonly roleBasis: string;
  readonly verifierDesignationRef: string | null;
  readonly effectiveFrom: string;
  readonly effectiveTo: string | null;
  readonly state: ResponsiblePartyState;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// -- §2.5 Root Cause, Health, Derived -----------------------------------------

/** Root cause and recurrence record per T03 §2.5. */
export interface IRootCauseAndRecurrenceRecord {
  readonly rootCauseAndRecurrenceRecordId: string;
  readonly projectId: string;
  readonly analysisKey: string;
  readonly linkedIssueRefs: readonly string[];
  readonly linkedActionRefs: readonly string[];
  readonly governedRootCauseCategory: QcRootCauseCategory;
  readonly recurrenceClassification: RecurrenceClassification;
  readonly contributingFactors: readonly string[];
  readonly learningRecommendation: string | null;
  readonly responsibleOrganization: string;
  readonly state: RootCauseState;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Quality health snapshot record per T03 §2.5. */
export interface IQualityHealthSnapshot {
  readonly qualityHealthSnapshotId: string;
  readonly projectId: string;
  readonly snapshotAt: string;
  readonly planPosture: string;
  readonly issueAgingPosture: string;
  readonly correctiveActionPosture: string;
  readonly approvalDependencyPosture: string;
  readonly advisoryPosture: string;
  readonly rootCauseTrend: string;
  readonly responsibleOrgRollupSummary: string;
  readonly readinessSignals: readonly string[];
  readonly state: QualityHealthSnapshotState;
  readonly computedAt: string;
  readonly publishedAt: string | null;
  readonly supersededBySnapshotId: string | null;
}

/** Responsible org performance rollup input record per T03 §2.5. */
export interface IResponsibleOrgPerformanceRollupInput {
  readonly responsibleOrgPerformanceRollupInputId: string;
  readonly projectId: string;
  readonly organizationKey: string;
  readonly sourceSnapshotId: string;
  readonly normalizedIssueCounts: string;
  readonly verifiedClosureRates: string;
  readonly deviationCounts: string;
  readonly recurrenceCounts: string;
  readonly approvalLag: string;
  readonly advisoryFailureCounts: string;
  readonly state: RollupInputState;
  readonly computedAt: string;
  readonly consumedAt: string | null;
  readonly supersededByInputId: string | null;
}

// -- §2.6 Submittal Advisory --------------------------------------------------

/** Submittal item record per T03 §2.6. */
export interface ISubmittalItemRecord {
  readonly submittalItemRecordId: string;
  readonly projectId: string;
  readonly itemKey: string;
  readonly specLinkRef: string;
  readonly packageLinkRef: string;
  readonly productMaterialSystemIdentity: string;
  readonly responsibleOrganization: string;
  readonly responsibleIndividual: string | null;
  readonly approvedProjectBasisRef: string | null;
  readonly activationStage: SubmittalActivationStage;
  readonly linkedWorkPackageKey: string | null;
  readonly state: SubmittalItemState;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Document inventory entry record per T03 §2.6. */
export interface IDocumentInventoryEntry {
  readonly documentInventoryEntryId: string;
  readonly projectId: string;
  readonly submittalItemRecordId: string;
  readonly inventoryKey: string;
  readonly documentFamily: string;
  readonly sourceReference: string;
  readonly versionLabel: string;
  readonly publisher: string;
  readonly publicationDate: string | null;
  readonly currentnessStatus: CurrentnessStatus;
  readonly referenceMatchMetadata: string | null;
  readonly minimumMetadataCompliance: boolean;
  readonly state: DocInventoryState;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Advisory verdict record per T03 §2.6. */
export interface IAdvisoryVerdict {
  readonly advisoryVerdictId: string;
  readonly projectId: string;
  readonly submittalItemRecordId: string;
  readonly verdictVersionId: string;
  readonly completenessVerdict: string;
  readonly currentnessVerdict: string;
  readonly referenceMatchConfidence: ReferenceMatchConfidence;
  readonly manualReviewRequired: boolean;
  readonly evaluatedAt: string;
  readonly evaluatorType: string;
  readonly mappingOutcome: string | null;
  readonly state: AdvisoryVerdictState;
}

/** Advisory exception record per T03 §2.6. */
export interface IAdvisoryException {
  readonly advisoryExceptionId: string;
  readonly projectId: string;
  readonly submittalItemRecordId: string;
  readonly exceptionVersionId: string;
  readonly exceptionRationale: string;
  readonly approvingAuthority: string;
  readonly scope: string;
  readonly expiryDate: string | null;
  readonly affectedVerdictRefs: readonly string[];
  readonly approvedProjectBasisRule: string | null;
  readonly state: AdvisoryExceptionState;
  readonly createdAt: string;
}

/** Version drift alert record per T03 §2.6. */
export interface IVersionDriftAlert {
  readonly versionDriftAlertId: string;
  readonly projectId: string;
  readonly submittalItemRecordId: string;
  readonly alertKey: string;
  readonly officialSourceChangeRef: string;
  readonly impactedInventoryEntryIds: readonly string[];
  readonly conflictStatus: string;
  readonly recheckDueDate: string | null;
  readonly responsibleOrganization: string | null;
  readonly responsibleIndividual: string | null;
  readonly state: VersionDriftAlertState;
  readonly createdAt: string;
}

// -- Supporting Reference Types (T03 §1) --------------------------------------

/** Submittal spec link reference per T03 §1. */
export interface ISubmittalSpecLinkRef {
  readonly specLinkRefId: string;
  readonly submittalItemRecordId: string;
  readonly specSection: string;
  readonly specRequirement: string;
}

/** Submittal package link reference per T03 §1. */
export interface ISubmittalPackageLinkRef {
  readonly packageLinkRefId: string;
  readonly submittalItemRecordId: string;
  readonly packageIdentifier: string;
  readonly packageSource: string;
}

/** Work package reference per T03 §1. */
export interface IWorkPackageRef {
  readonly workPackageRefId: string;
  readonly owningRecordId: string;
  readonly workPackageKey: string;
  readonly linkPurpose: string;
}

/** Review package reference per T03 §1. */
export interface IReviewPackageRef {
  readonly reviewPackageRefId: string;
  readonly owningRecordId: string;
  readonly reviewPackageKey: string;
  readonly linkPurpose: string;
}

/** Downstream handoff reference per T03 §1. */
export interface IDownstreamHandoffRef {
  readonly handoffRefId: string;
  readonly sourceRecordId: string;
  readonly targetModule: string;
  readonly handoffContent: string;
  readonly snapshotRef: string | null;
}
