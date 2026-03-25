/**
 * P3-E15-T10 Stage 7 Project QC Module submittal-advisory TypeScript contracts.
 */

import type { ReferenceMatchConfidence, SubmittalActivationStage } from '../record-families/enums.js';

import type {
  ActivationStageResult,
  CaptureMethod,
  ConditionalStatus,
  DocumentCurrentness,
  DocumentFamilyClass,
  DriftRequiredNextAction,
  DriftUrgencyRiskClass,
  InventoryConfirmationState,
  ManualReviewReasonCode,
  OfficialSourceType,
  PackageCompleteness,
  SubmittalCreatedFrom,
  SubmittalItemType,
  SubmittalRevisionReason,
} from './enums.js';

// -- Record Types (T07 §4, §5, §8) -------------------------------------------

/** Submittal revision history entry per T07 §4. */
export interface ISubmittalRevisionHistoryEntry {
  readonly submittalRevisionHistoryEntryId: string;
  readonly submittalItemId: string;
  readonly revisionSequence: number;
  readonly revisionReason: SubmittalRevisionReason;
  readonly priorPackageLinkRef: string | null;
  readonly newPackageLinkRef: string | null;
  readonly inventoryChangeSummary: string;
  readonly priorVerdictRef: string | null;
  readonly newVerdictRef: string | null;
  readonly changedByUserId: string;
  readonly changedAt: string;
  readonly notes: string | null;
}

/** Official source reference entry per T07 §5. */
export interface IOfficialSourceReferenceEntry {
  readonly officialSourceReferenceEntryId: string;
  readonly submittalItemId: string;
  readonly documentFamily: DocumentFamilyClass;
  readonly officialPublisherName: string;
  readonly officialSourceType: OfficialSourceType;
  readonly officialDocumentTitle: string;
  readonly officialDocumentIdentifier: string | null;
  readonly officialRevisionEditionIssueNumber: string | null;
  readonly officialPublicationOrRevisionDate: string | null;
  readonly officialSourceLinkReference: string;
  readonly captureMethod: CaptureMethod;
  readonly comparisonConfidence: ReferenceMatchConfidence;
  readonly capturedAt: string;
  readonly capturedByUserId: string;
  readonly supersedesReferenceId: string | null;
}

/** Downstream QC activation mapping per T07 §8. */
export interface IDownstreamQcActivationMapping {
  readonly downstreamQcActivationMappingId: string;
  readonly submittalItemId: string;
  readonly verdictRef: string;
  readonly activationStage: SubmittalActivationStage;
  readonly activationResult: ActivationStageResult;
  readonly qualityPlanRequirements: readonly string[];
  readonly bestPracticePackets: readonly string[];
  readonly inspectionExpectations: readonly string[];
  readonly readinessSignals: readonly string[];
  readonly exceptionDependencies: readonly string[];
  readonly publishedAt: string;
  readonly publishedByUserId: string;
}

// -- Enhancement / Advisory-Specific Types ------------------------------------

/** Enhanced submittal item fields per T07 §2. */
export interface IEnhancedSubmittalItemFields {
  readonly itemType: SubmittalItemType;
  readonly itemTitle: string;
  readonly manufacturerName: string | null;
  readonly productModelOrSeries: string | null;
  readonly procoreSubmittalLinkRef: string | null;
  readonly defaultOwnerRole: string;
  readonly defaultOwnerAssignment: string;
  readonly highRiskFlag: boolean;
  readonly createdFrom: SubmittalCreatedFrom;
  readonly supersededBySubmittalItemId: string | null;
}

/** Enhanced document inventory fields per T07 §3. */
export interface IEnhancedDocumentInventoryFields {
  readonly requirementKey: string;
  readonly title: string;
  readonly documentIdentifier: string | null;
  readonly revisionEditionIssueNumber: string | null;
  readonly packageIncludedFlag: boolean;
  readonly officialSourceMatchFlag: boolean | null;
  readonly officialSourceMatchConfidence: ReferenceMatchConfidence | null;
  readonly conditionalStatus: ConditionalStatus;
  readonly inventoryConfirmationState: InventoryConfirmationState;
  readonly comparisonReferenceId: string | null;
  readonly manualReviewRequired: boolean;
  readonly notes: string | null;
}

/** Enhanced advisory verdict fields per T07 §6. */
export interface IEnhancedAdvisoryVerdictFields {
  readonly evaluationSequence: number;
  readonly packageCompleteness: PackageCompleteness;
  readonly documentCurrentness: DocumentCurrentness;
  readonly manualReviewReasonCodes: readonly ManualReviewReasonCode[];
  readonly acceptedForActivation: boolean;
  readonly acceptedByException: boolean;
  readonly rollupRationale: string;
  readonly governedRulesetVersion: string;
  readonly projectOverlayVersion: string | null;
}

/** Enhanced version drift alert fields per T07 §7. */
export interface IEnhancedVersionDriftAlertFields {
  readonly affectedFamily: DocumentFamilyClass;
  readonly priorApprovedBasis: string;
  readonly newerOfficialSourceReference: string;
  readonly detectedDeltaSummary: string;
  readonly urgencyRiskClass: DriftUrgencyRiskClass;
  readonly requiredNextAction: DriftRequiredNextAction;
  readonly downstreamReadinessImpact: string;
}

/** Document family definition per T07 §3. */
export interface IDocumentFamilyDefinition {
  readonly familyClass: DocumentFamilyClass;
  readonly displayName: string;
  readonly governedMetadataExpectations: string;
  readonly currentnessComparisonStrategy: string;
  readonly downstreamQcSignificance: string;
  readonly isGovernedFloor: boolean;
}

/** Spec overlay resolution per T07 §9. */
export interface ISpecOverlayResolution {
  readonly resolutionId: string;
  readonly submittalItemId: string;
  readonly governedBaselineRef: string;
  readonly disciplineProductRequirementRef: string | null;
  readonly projectSpecRef: string;
  readonly approvedProjectOverlayRef: string | null;
  readonly approvedExceptionRef: string | null;
  readonly resolvedRequirements: readonly string[];
}

/** Assisted extraction result per T07 §10. */
export interface IAssistedExtractionResult {
  readonly extractionId: string;
  readonly submittalItemId: string;
  readonly candidateInventoryRows: readonly string[];
  readonly extractionSource: string;
  readonly extractionConfidence: ReferenceMatchConfidence;
  readonly requiresOwnerConfirmation: boolean;
  readonly extractedAt: string;
}
