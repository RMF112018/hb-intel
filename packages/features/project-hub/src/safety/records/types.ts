/**
 * P3-E8-T02 Safety Module record family interfaces.
 * All 16 record families + embedded sub-interfaces.
 */

import type { IncidentPrivacyTier } from '../foundation/enums.js';
import type { ApplicabilityCondition, InspectionItemResponseValue } from '../inspection/enums.js';
import type { IncidentPersonRole } from '../corrective-actions/enums.js';
import type { ISectionScoreSummary } from '../inspection/types.js';
import type {
  AcknowledgmentMethod,
  CertificationStatus,
  CertificationType,
  CompetencyArea,
  CorrectiveActionCategory,
  CorrectiveActionSeverity,
  CorrectiveActionSourceType,
  CorrectiveActionStatus,
  DesignationStatus,
  EvidenceReviewStatus,
  EvidenceSensitivityTier,
  HazardRiskLevel,
  IncidentStatus,
  IncidentType,
  InspectionItemResponseType,
  InspectionStatus,
  JhaStatus,
  OrientationStatus,
  OrientationTopic,
  PpeType,
  PreTaskStatus,
  RetentionCategory,
  SafetyEvidenceSourceType,
  SafetySubmissionType,
  SdsStatus,
  SSSPAddendumChangeType,
  SSSPAddendumStatus,
  SSSPSectionKey,
  SSSPStatus,
  SubmissionReviewStatus,
  TemplateStatus,
  ToolboxPromptStatus,
  ToolboxTalkStatus,
} from './enums.js';

// ============================================================================
// SSSP SECTION AND APPROVAL TYPES (implemented in T03 lifecycle/types.ts)
// ============================================================================

import type {
  ISSSPGoverned_HazardSection,
  ISSSPGoverned_EmergencySection,
  ISSSPGoverned_ProgramSection,
  ISSSPGoverned_RegulatorySection,
  ISSSPGoverned_CompetentPersonSection,
  ISSSPGoverned_SubcontractorSection,
  ISSSPGoverned_IncidentSection,
  ISSSPInstance_Contacts,
  ISSSPInstance_SubcontractorList,
  ISSSPInstance_Location,
  ISSSPInstance_SiteLayout,
  ISSSPInstance_OrientationSchedule,
  ISSSPApproval,
  ISSSPAddendumApproval,
} from '../lifecycle/types.js';

// Re-export with backward-compatible aliases
export type SSSPGoverned_HazardSection = ISSSPGoverned_HazardSection;
export type SSSPGoverned_EmergencySection = ISSSPGoverned_EmergencySection;
export type SSSPGoverned_ProgramSection = ISSSPGoverned_ProgramSection;
export type SSSPGoverned_RegulatorySection = ISSSPGoverned_RegulatorySection;
export type SSSPGoverned_CompetentPersonSection = ISSSPGoverned_CompetentPersonSection;
export type SSSPGoverned_SubcontractorSection = ISSSPGoverned_SubcontractorSection;
export type SSSPGoverned_IncidentSection = ISSSPGoverned_IncidentSection;
export type SSSPInstance_Contacts = ISSSPInstance_Contacts;
export type SSSPInstance_SubcontractorList = ISSSPInstance_SubcontractorList;
export type SSSPInstance_Location = ISSSPInstance_Location;
export type SSSPInstance_SiteLayout = ISSSPInstance_SiteLayout;
export type SSSPInstance_OrientationSchedule = ISSSPInstance_OrientationSchedule;
export type SSSPApproval = ISSSPApproval;
export type SSSPAddendumApproval = ISSSPAddendumApproval;

// ============================================================================
// §2.1 — ISiteSpecificSafetyPlan (SSSP Base Plan)
// ============================================================================

export interface ISiteSpecificSafetyPlan {
  // Identity (§1.1)
  readonly id: string;
  readonly projectId: string;
  readonly schemaVersion: number;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;

  // Version and lifecycle
  readonly planVersion: number;
  readonly status: SSSPStatus;
  readonly approvalDate: string | null;
  readonly approvedBy: SSSPApproval;
  readonly supersededBy: string | null;
  readonly effectiveDate: string | null;

  // Governed sections (safetyManagerOnly: true)
  readonly hazardIdentificationAndControl: SSSPGoverned_HazardSection;
  readonly emergencyResponseProcedures: SSSPGoverned_EmergencySection;
  readonly safetyProgramStandards: SSSPGoverned_ProgramSection;
  readonly regulatoryAndCodeCitationBlock: SSSPGoverned_RegulatorySection;
  readonly competentPersonRequirements: SSSPGoverned_CompetentPersonSection;
  readonly subcontractorComplianceStandards: SSSPGoverned_SubcontractorSection;
  readonly incidentReportingProtocol: SSSPGoverned_IncidentSection;

  // Project-instance sections (project team editable)
  readonly projectContacts: SSSPInstance_Contacts;
  readonly subcontractorList: SSSPInstance_SubcontractorList;
  readonly projectLocation: SSSPInstance_Location;
  readonly emergencyAssemblyAndSiteLayout: SSSPInstance_SiteLayout;
  readonly orientationSchedule: SSSPInstance_OrientationSchedule;
  readonly projectSpecificNotes: string | null;

  // Document output
  readonly renderedDocumentRef: string | null;
  readonly renderedAt: string | null;
}

// ============================================================================
// §2.2 — ISSSPAddendum
// ============================================================================

export interface ISSSPAddendum {
  readonly id: string;
  readonly projectId: string;
  readonly parentSsspId: string;
  readonly schemaVersion: number;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;

  readonly addendumNumber: number;
  readonly title: string;
  readonly description: string;
  readonly affectedSections: readonly SSSPSectionKey[];
  readonly changeType: SSSPAddendumChangeType;
  readonly operationallyAffected: boolean;

  readonly status: SSSPAddendumStatus;
  readonly approvalRecord: SSSPAddendumApproval;
  readonly effectiveDate: string | null;
  readonly voidedReason: string | null;
}

// ============================================================================
// §2.3–2.4 — Inspection Checklist Template
// ============================================================================

export interface ISectionScoringWeight {
  readonly sectionKey: string;
  readonly weight: number;
}

export interface IApplicabilityRule {
  readonly sectionKey: string;
  readonly conditionDescription: string;
  readonly condition: ApplicabilityCondition;
  readonly conditionValue: string | null;
  readonly notesRequired: boolean;
}

export interface IInspectionItem {
  readonly itemKey: string;
  readonly itemText: string;
  readonly itemNumber: number;
  readonly responseType: InspectionItemResponseType;
  readonly requiresPhotoOnFail: boolean;
  readonly requiresCorrectiveActionOnFail: boolean;
  readonly regulatoryRef: string | null;
}

export interface IInspectionSection {
  readonly sectionKey: string;
  readonly sectionName: string;
  readonly sectionNumber: number;
  readonly items: readonly IInspectionItem[];
  readonly isApplicableByDefault: boolean;
}

export interface IInspectionChecklistTemplate {
  readonly id: string;
  readonly projectId: string | null;
  readonly schemaVersion: number;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;

  readonly templateName: string;
  readonly templateVersion: number;
  readonly templateStatus: TemplateStatus;
  readonly publishedAt: string | null;

  readonly sections: readonly IInspectionSection[];
  readonly scoringWeights: readonly ISectionScoringWeight[];
  readonly applicableSectionLogic: readonly IApplicabilityRule[];
}

// ============================================================================
// §2.5 — ICompletedInspection
// ============================================================================

export interface IInspectionSectionResponse {
  readonly sectionKey: string;
  readonly isApplicable: boolean;
  readonly notApplicableReason: string | null;
  readonly itemResponses: readonly IInspectionItemResponse[];
  readonly sectionScore: number | null;
  readonly sectionMaxScore: number | null;
  readonly sectionNotes: string | null;
}

export interface IInspectionItemResponse {
  readonly itemKey: string;
  readonly response: InspectionItemResponseValue;
  readonly numericValue: number | null;
  readonly notes: string | null;
  readonly correctiveActionId: string | null;
  readonly evidenceRecordIds: readonly string[];
}

export interface IInspectionScorecardSnapshot {
  readonly inspectionId: string;
  readonly projectId: string;
  readonly inspectionDate: string;
  readonly inspectionWeek: string;
  readonly templateId: string;
  readonly templateVersion: number;
  readonly normalizedScore: number;
  readonly applicableSectionCount: number;
  readonly totalSectionCount: number;
  readonly failedItemCount: number;
  readonly naItemCount: number;
  readonly correctiveActionsGeneratedCount: number;
  readonly criticalCorrectiveActionsCount: number;
  readonly sectionScoreSummary: readonly ISectionScoreSummary[];
  readonly publishedAt: string;
}

export interface ICompletedInspection {
  readonly id: string;
  readonly projectId: string;
  readonly schemaVersion: number;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;

  readonly templateId: string;
  readonly templateVersion: number;
  readonly inspectionDate: string;
  readonly inspectionWeek: string;
  readonly inspectorId: string;

  readonly status: InspectionStatus;

  readonly sectionResponses: readonly IInspectionSectionResponse[];

  readonly applicableSectionCount: number;
  readonly rawScore: number;
  readonly maxPossibleScore: number;
  readonly normalizedScore: number;

  readonly correctiveActionIds: readonly string[];

  readonly overallNotes: string | null;
  readonly evidenceRecordIds: readonly string[];

  readonly publishedScorecardSnapshot: IInspectionScorecardSnapshot | null;
}

// ============================================================================
// §2.6 — ISafetyCorrectiveAction (Centralized Ledger)
// ============================================================================

export interface ISafetyCorrectiveAction {
  readonly id: string;
  readonly projectId: string;
  readonly schemaVersion: number;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;

  readonly sourceType: CorrectiveActionSourceType;
  readonly sourceRecordId: string | null;
  readonly sourceDescription: string | null;

  readonly title: string;
  readonly description: string;
  readonly severity: CorrectiveActionSeverity;
  readonly category: CorrectiveActionCategory;

  readonly assignedToId: string;
  readonly assignedToSubcontractorId: string | null;
  readonly ownerId: string;

  readonly status: CorrectiveActionStatus;
  readonly dueDate: string;
  readonly completedDate: string | null;
  readonly verifiedDate: string | null;
  readonly verifiedById: string | null;

  readonly resolutionNotes: string | null;
  readonly evidenceRecordIds: readonly string[];

  readonly isOverdue: boolean;
}

// ============================================================================
// §2.7 — IIncidentRecord
// ============================================================================

export interface IIncidentPersonRecord {
  readonly personId: string | null;
  readonly personName: string;
  readonly personCompanyId: string | null;
  readonly personCompanyName: string;
  readonly roleInIncident: IncidentPersonRole;
  readonly injuryDescription: string | null;
  readonly injuryBodyPart: string | null;
  readonly medicalAttentionRequired: boolean;
  readonly medicalFacility: string | null;
  readonly returnToWorkDate: string | null;
  readonly lostDays: number | null;
}

export interface IIncidentRecord {
  readonly id: string;
  readonly projectId: string;
  readonly schemaVersion: number;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;

  readonly incidentType: IncidentType;
  readonly incidentDate: string;
  readonly incidentTime: string | null;
  readonly location: string;

  readonly privacyTier: IncidentPrivacyTier;

  readonly status: IncidentStatus;
  readonly caseNumber: string | null;

  readonly incidentNarrative: string;
  readonly immediateActions: string | null;
  readonly rootCauseAnalysis: string | null;
  readonly preventiveMeasures: string | null;

  readonly personsInvolved: readonly IIncidentPersonRecord[];

  readonly correctiveActionIds: readonly string[];
  readonly evidenceRecordIds: readonly string[];
  readonly relatedIncidentIds: readonly string[];
}

// ============================================================================
// §2.8 — IJhaRecord (Job Hazard Analysis)
// ============================================================================

export interface IJhaHazard {
  readonly hazardDescription: string;
  readonly riskLevel: HazardRiskLevel;
  readonly controlMeasures: readonly string[];
  readonly residualRiskLevel: HazardRiskLevel;
}

export interface IJhaStep {
  readonly stepNumber: number;
  readonly stepDescription: string;
  readonly hazards: readonly IJhaHazard[];
}

export interface IJhaRecord {
  readonly id: string;
  readonly projectId: string;
  readonly schemaVersion: number;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;

  readonly activityDescription: string;
  readonly scopeOfWork: string;
  readonly location: string;
  readonly applicableSubcontractorIds: readonly string[];

  readonly status: JhaStatus;
  readonly approvedById: string | null;
  readonly approvedAt: string | null;
  readonly supersededById: string | null;

  readonly steps: readonly IJhaStep[];

  readonly requiredPpe: readonly PpeType[];

  readonly requiresCompetentPerson: boolean;
  readonly competentPersonDesignationId: string | null;

  readonly linkedDailyPreTaskIds: readonly string[];
  readonly evidenceRecordIds: readonly string[];
}

// ============================================================================
// §2.9 — IDailyPreTaskPlan
// ============================================================================

export interface IDailyPreTaskPlan {
  readonly id: string;
  readonly projectId: string;
  readonly schemaVersion: number;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;

  readonly jhaId: string;
  readonly workDate: string;
  readonly location: string;
  readonly crewForeman: string;

  readonly weatherConditions: string | null;
  readonly specialHazardsToday: string | null;
  readonly controlsConfirmed: boolean;
  readonly ppeVerified: boolean;
  readonly siteConditionsNotes: string | null;

  readonly attendeeCount: number;
  readonly namedAttendees: readonly string[];
  readonly signInEvidenceRecordId: string | null;

  readonly status: PreTaskStatus;
  readonly completedAt: string | null;
}

// ============================================================================
// §2.10 — IToolboxTalkPrompt (Governed Library)
// ============================================================================

export interface IToolboxPromptIssuance {
  readonly issuedToProjectId: string;
  readonly issuedForWeek: string;
  readonly issuedBy: string;
  readonly issuedAt: string;
  readonly closureRequired: boolean;
  readonly closedAt: string | null;
  readonly closureProofRecordId: string | null;
}

export interface IToolboxTalkPrompt {
  readonly id: string;
  readonly projectId: string | null;
  readonly schemaVersion: number;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;

  readonly promptTitle: string;
  readonly promptContent: string;
  readonly associatedActivities: readonly string[];
  readonly associatedHazardCategories: readonly string[];
  readonly governedPromptStatus: ToolboxPromptStatus;

  readonly issuanceRecord: IToolboxPromptIssuance | null;
}

// ============================================================================
// §2.11 — IWeeklyToolboxTalkRecord
// ============================================================================

export interface IToolboxAttendee {
  readonly workerId: string | null;
  readonly workerName: string;
  readonly subcontractorId: string | null;
  readonly acknowledgedAt: string | null;
}

export interface IWeeklyToolboxTalkRecord {
  readonly id: string;
  readonly projectId: string;
  readonly schemaVersion: number;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;

  readonly talkWeek: string;
  readonly talkDate: string;
  readonly conductedById: string;

  readonly promptId: string | null;
  readonly topicTitle: string;
  readonly topicContent: string;

  readonly attendeeCount: number;
  readonly signInSheetEvidenceId: string | null;

  readonly namedAttendees: readonly IToolboxAttendee[];
  readonly isHighRiskGoverned: boolean;

  readonly status: ToolboxTalkStatus;
  readonly completedAt: string | null;
  readonly acknowledgmentBatchId: string | null;
}

// ============================================================================
// §2.12 — IWorkerOrientationRecord
// ============================================================================

export interface IWorkerOrientationRecord {
  readonly id: string;
  readonly projectId: string;
  readonly schemaVersion: number;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;

  readonly workerId: string | null;
  readonly workerName: string;
  readonly workerCompanyId: string | null;
  readonly workerCompanyName: string;

  readonly orientationDate: string;
  readonly orientationAdministeredById: string;

  readonly topicsCovered: readonly OrientationTopic[];
  readonly projectSpecificTopicsNotes: string | null;

  readonly acknowledgedAt: string | null;
  readonly acknowledgmentMethod: AcknowledgmentMethod;
  readonly acknowledgmentEvidenceId: string | null;

  readonly status: OrientationStatus;
}

// ============================================================================
// §2.13 — ISubcontractorSafetySubmission
// ============================================================================

export interface ISubcontractorSafetySubmission {
  readonly id: string;
  readonly projectId: string;
  readonly schemaVersion: number;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;

  readonly subcontractorId: string;
  readonly subcontractorName: string;
  readonly tradeScope: string;

  readonly submissionType: SafetySubmissionType;
  readonly documentTitle: string;
  readonly submittedAt: string;
  readonly submittedByName: string;

  readonly status: SubmissionReviewStatus;
  readonly reviewedById: string | null;
  readonly reviewedAt: string | null;
  readonly reviewNotes: string | null;
  readonly revisionRequestNotes: string | null;

  readonly evidenceRecordId: string;
}

// ============================================================================
// §2.14 — ICertificationRecord
// ============================================================================

export interface ICertificationRecord {
  readonly id: string;
  readonly projectId: string;
  readonly schemaVersion: number;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;

  readonly workerId: string | null;
  readonly workerName: string;
  readonly workerCompanyId: string | null;

  readonly certificationType: CertificationType;
  readonly customCertificationName: string | null;
  readonly certifyingBody: string | null;
  readonly certificationNumber: string | null;
  readonly issueDate: string;
  readonly expirationDate: string | null;

  readonly status: CertificationStatus;
  readonly verifiedById: string | null;
  readonly verifiedAt: string | null;
  readonly evidenceRecordId: string | null;
}

// ============================================================================
// §2.15 — IHazComSdsRecord
// ============================================================================

export interface IHazComSdsRecord {
  readonly id: string;
  readonly projectId: string;
  readonly schemaVersion: number;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;

  readonly productName: string;
  readonly manufacturer: string;
  readonly chemicalAbstractNumber: string | null;

  readonly useLocation: string;
  readonly responsibleSubcontractorId: string | null;
  readonly responsibleSubcontractorName: string | null;

  readonly sdsDocumentRef: string;
  readonly sdsRevisionDate: string | null;

  readonly status: SdsStatus;
  readonly addedDate: string;
  readonly removedDate: string | null;
}

// ============================================================================
// §2.16 — ICompetentPersonDesignation
// ============================================================================

export interface ICompetentPersonDesignation {
  readonly id: string;
  readonly projectId: string;
  readonly schemaVersion: number;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;

  readonly workerId: string | null;
  readonly workerName: string;
  readonly workerCompanyId: string | null;

  readonly competencyArea: CompetencyArea;
  readonly customCompetencyDescription: string | null;
  readonly scopeDescription: string;

  readonly qualifyingCertificationId: string | null;
  readonly qualificationNotes: string | null;

  readonly status: DesignationStatus;
  readonly effectiveDate: string;
  readonly expirationDate: string | null;
  readonly designatedById: string;
  readonly revokedAt: string | null;
  readonly revocationReason: string | null;
}

// ============================================================================
// §2.17 — ISafetyEvidenceRecord
// ============================================================================

export interface ISafetyEvidenceRecord {
  readonly id: string;
  readonly projectId: string;
  readonly schemaVersion: number;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;

  readonly sourceRecordType: SafetyEvidenceSourceType;
  readonly sourceRecordId: string | null;

  readonly fileName: string;
  readonly fileSizeBytes: number;
  readonly mimeType: string;
  readonly storageRef: string;

  readonly capturedAt: string;
  readonly capturedBy: string;
  readonly description: string | null;

  readonly sensitivityTier: EvidenceSensitivityTier;
  readonly retentionCategory: RetentionCategory;
  readonly retentionHoldNote: string | null;

  readonly reviewStatus: EvidenceReviewStatus;
  readonly reviewedById: string | null;
  readonly reviewedAt: string | null;
  readonly reviewNotes: string | null;
}
