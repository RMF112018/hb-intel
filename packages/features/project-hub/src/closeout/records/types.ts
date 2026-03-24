/**
 * P3-E10-T02 Project Closeout Module record family TypeScript contracts.
 * Record families, identity, field architecture, publication states.
 */

import type {
  CloseoutChecklistItemResult,
  CloseoutChecklistJurisdiction,
  CloseoutChecklistLifecycleStageTrigger,
  CloseoutChecklistResponsibleRole,
  CloseoutPublicationState,
  CloseoutReBidRecommendation,
  CloseoutScorecardEvaluationType,
} from './enums.js';
import type { CloseoutRecordFamily } from '../foundation/enums.js';

// -- Record Family Relationships (§1) ---------------------------------------

/** Parent-child relationship in the record family hierarchy per T02 §1. */
export interface ICloseoutRecordFamilyRelationship {
  readonly parent: string;
  readonly child: string;
  readonly cardinality: string;
  readonly notes: string;
}

// -- Publication State Model (§2) -------------------------------------------

/** Publication state detail row per T02 §2 table. */
export interface ICloseoutPublicationStateDetail {
  readonly state: CloseoutPublicationState;
  readonly code: CloseoutPublicationState;
  readonly editable: boolean;
  readonly orgEligible: boolean;
  readonly description: string;
}

/** Publication state applicability per record family per T02 §2.1. */
export interface ICloseoutPublicationStateApplicability {
  readonly family: CloseoutRecordFamily | string;
  readonly usesPublicationStates: boolean;
  readonly notes: string;
}

// -- Immutability Rules (§6) ------------------------------------------------

/** Immutability rule per T02 §6 table. */
export interface ICloseoutImmutabilityRule {
  readonly record: string;
  readonly fieldCategory: string;
  readonly immutableFrom: string;
}

// -- CloseoutChecklist (§4.1) -----------------------------------------------

/** Closeout checklist record per T02 §4.1. */
export interface ICloseoutChecklist {
  readonly checklistId: string;
  readonly projectId: string;
  readonly projectName: string;
  readonly projectNumber: string;
  readonly projectLocation: string | null;
  readonly projectType: string | null;
  readonly jurisdiction: CloseoutChecklistJurisdiction;
  readonly templateId: string;
  readonly templateVersion: string;
  readonly lifecycleState: string;
  readonly completionPercentage: number;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly lastModifiedAt: string;
  readonly lastModifiedBy: string | null;
  readonly notes: string | null;
}

// -- CloseoutChecklistItem (§4.2) -------------------------------------------

/** Closeout checklist item record per T02 §4.2. */
export interface ICloseoutChecklistItem {
  readonly itemId: string;
  readonly sectionId: string;
  readonly itemNumber: string;
  readonly itemDescription: string;
  readonly isGoverned: boolean;
  readonly isRequired: boolean;
  readonly responsibleRole: CloseoutChecklistResponsibleRole;
  readonly sourceBasis: string | null;
  readonly lifecycleStageTrigger: CloseoutChecklistLifecycleStageTrigger;
  readonly hasDateField: boolean;
  readonly hasEvidenceRequirement: boolean;
  readonly evidenceHint: string | null;
  readonly linkedModuleHint: string | null;
  readonly linkedRelationshipKey: string | null;
  readonly isCalculated: boolean;
  readonly calculationSource: string | null;
  readonly spineEventOnCompletion: string | null;
  readonly milestoneGateKey: string | null;
  readonly result: CloseoutChecklistItemResult;
  readonly resultDate: string | null;
  readonly itemDate: string | null;
  readonly calculatedDate: string | null;
  readonly naJustification: string | null;
  readonly notes: string | null;
  readonly evidencePrefilled: boolean;
}

// -- SubcontractorScorecard (§4.3) ------------------------------------------

/** Subcontractor scorecard record per T02 §4.3. */
export interface ISubcontractorScorecard {
  readonly scorecardId: string;
  readonly projectId: string;
  readonly subcontractorId: string | null;
  readonly subcontractorName: string;
  readonly tradeScope: string;
  readonly evaluationType: CloseoutScorecardEvaluationType;
  readonly evaluationSequence: number;
  readonly publicationStatus: CloseoutPublicationState;
  readonly contractValue: number;
  readonly finalCost: number | null;
  readonly scheduledCompletion: string;
  readonly actualCompletion: string | null;
  readonly evaluatorUserId: string;
  readonly evaluatorName: string;
  readonly evaluatorTitle: string | null;
  readonly evaluationDate: string;
  readonly reBidRecommendation: CloseoutReBidRecommendation;
  readonly overallWeightedScore: number | null;
  readonly performanceRating: string | null;
  readonly keyStrengths: string | null;
  readonly areasForImprovement: string | null;
  readonly notableIncidentsOrIssues: string | null;
  readonly overallNarrativeSummary: string | null;
  readonly pmSignedAt: string | null;
  readonly superintendentSignedAt: string | null;
  readonly peApprovedAt: string | null;
  readonly peApprovedBy: string | null;
  readonly publishedToOrgIndexAt: string | null;
  readonly eligibleForPublication: boolean;
}

// -- LessonEntry (§4.4) ----------------------------------------------------

/** Lesson entry record per T02 §4.4. */
export interface ILessonEntry {
  readonly lessonId: string;
  readonly projectId: string;
  readonly reportId: string | null;
  readonly lessonNumber: number;
  readonly category: string;
  readonly phaseEncountered: string;
  readonly applicability: number;
  readonly keywords: readonly string[];
  readonly situation: string;
  readonly impact: string;
  readonly impactMagnitude: string;
  readonly rootCause: string;
  readonly response: string | null;
  readonly recommendation: string;
  readonly supportingDocuments: string | null;
  readonly publicationStatus: CloseoutPublicationState;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly lastModifiedAt: string;
}

// -- LessonsLearningReport (§4.5) -------------------------------------------

/** Lessons learning report record per T02 §4.5. */
export interface ILessonsLearningReport {
  readonly reportId: string;
  readonly projectId: string;
  readonly originalContractValue: number;
  readonly finalContractValue: number;
  readonly contractVariance: number;
  readonly scheduledCompletion: string;
  readonly actualCompletion: string;
  readonly daysVariance: number;
  readonly projectManager: string;
  readonly superintendent: string | null;
  readonly projectExecutive: string | null;
  readonly reportPreparedBy: string;
  readonly reportDate: string;
  readonly deliveryMethod: string;
  readonly marketSector: string;
  readonly projectSizeBand: string;
  readonly complexityRating: number;
  readonly entryCount: number;
  readonly publicationStatus: CloseoutPublicationState;
  readonly peApprovedAt: string | null;
  readonly peApprovedBy: string | null;
  readonly publishedToOrgIndexAt: string | null;
}

// -- Autopsy Invariants (§5.1) ----------------------------------------------

/** Autopsy record invariant per T02 §5.1. */
export interface IAutopsyRecordInvariant {
  readonly invariant: string;
  readonly rule: string;
}

/** Autopsy cross-record relationship per T02 §5.2. */
export interface IAutopsyRelationship {
  readonly source: string;
  readonly target: string;
  readonly relationship: string;
  readonly direction: string;
}

// -- Org Intelligence Provenance (§3) ---------------------------------------

/** SubIntelligence index entry per T02 §3.1. */
export interface ISubIntelligenceIndexEntry {
  // Provenance
  readonly indexEntryId: string;
  readonly sourceProjectId: string;
  readonly sourceProjectName: string;
  readonly sourceProjectNumber: string;
  readonly sourceScorecardId: string;
  readonly sourceEvaluationType: 'FinalCloseout' | 'InterimException';
  readonly publishedAt: string;
  readonly publishedFromLifecycleState: 'ARCHIVED';
  readonly peApprovedBy: string;
  readonly peApprovedAt: string;
  readonly isInterimException: boolean;
  // Intelligence payload
  readonly subcontractorName: string;
  readonly subcontractorId: string | null;
  readonly tradeScope: string;
  readonly marketSector: string;
  readonly projectSizeBand: string;
  readonly deliveryMethod: string;
  readonly contractValue: number;
  readonly finalCost: number | null;
  readonly evaluationDate: string;
  readonly safetyScore: number;
  readonly qualityScore: number;
  readonly scheduleScore: number;
  readonly costMgmtScore: number;
  readonly communicationScore: number;
  readonly workforceScore: number;
  readonly overallWeightedScore: number;
  readonly performanceRating: string;
  readonly reBidRecommendation: CloseoutReBidRecommendation;
  readonly keyStrengths: string | null;
  readonly areasForImprovement: string | null;
  readonly notableIncidentsOrIssues: string | null;
}

/** LessonsIntelligence index entry per T02 §3.2. */
export interface ILessonsIntelligenceIndexEntry {
  // Provenance
  readonly indexEntryId: string;
  readonly sourceProjectId: string;
  readonly sourceProjectName: string;
  readonly sourceProjectNumber: string;
  readonly sourceLessonId: string;
  readonly sourceReportId: string;
  readonly publishedAt: string;
  readonly publishedFromLifecycleState: 'ARCHIVED';
  readonly peApprovedBy: string;
  readonly peApprovedAt: string;
  // Intelligence payload
  readonly category: string;
  readonly phaseEncountered: string;
  readonly applicability: number;
  readonly keywords: readonly string[];
  readonly situation: string;
  readonly rootCause: string;
  readonly recommendation: string;
  readonly impactMagnitude: string;
  readonly marketSector: string;
  readonly deliveryMethod: string;
  readonly projectSizeBand: string;
  readonly complexityRating: number;
  readonly reportDate: string;
}

/** LearningLegacy feed entry per T02 §3.3. */
export interface ILearningLegacyFeedEntry {
  // Provenance
  readonly feedEntryId: string;
  readonly sourceProjectId: string;
  readonly sourceProjectName: string;
  readonly sourceAutopsyId: string;
  readonly sourceOutputId: string;
  readonly publishedAt: string;
  readonly peApprovedBy: string;
  readonly peApprovedAt: string;
  // Intelligence payload
  readonly outputType: string;
  readonly title: string;
  readonly summary: string;
  readonly fullContent: string;
  readonly actionableRecommendations: readonly string[];
  readonly targetAudience: readonly string[];
  readonly applicableProjectTypes: readonly string[];
  readonly tags: readonly string[];
  readonly recurrenceRiskSignals: readonly string[];
}
