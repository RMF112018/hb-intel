/**
 * P3-E10-T07 Project Autopsy and Learning Legacy TypeScript contracts.
 * Records, findings, actions, outputs, pre-survey, workshop.
 */

import type {
  AutopsyActionStatus,
  AutopsyActionType,
  AutopsyFindingSeverity,
  AutopsyFindingType,
  AutopsyRecurrenceRisk,
  AutopsyTheme,
  AutopsyWorkshopFormat,
  FindingEvidenceRefType,
  LearningLegacyOutputType,
  PreSurveyResponseType,
} from './enums.js';
import type { CloseoutPublicationState } from '../records/enums.js';
import type { DeliveryMethod, MarketSector, ProjectSizeBand } from '../lessons/enums.js';

// -- Autopsy Record (§10) ---------------------------------------------------

/** Full autopsy record per T07 §10. */
export interface IAutopsyRecord {
  readonly autopsyId: string;
  readonly projectId: string;
  readonly autopsyTitle: string;
  readonly leadFacilitatorUserId: string;
  readonly coordinatorUserId: string | null;
  readonly publicationStatus: CloseoutPublicationState;
  readonly waived: boolean;
  readonly waiverNote: string | null;
  readonly operationalOutcomesApplicable: boolean;
  readonly developerProjectApplicable: boolean;
  readonly preBriefingPackReady: boolean;
  readonly preBriefingPackGeneratedAt: string | null;
  readonly preBriefingPackVersion: number | null;
  readonly preSurveyEnabled: boolean;
  readonly preSurveyIssuedAt: string | null;
  readonly preSurveyDeadline: string | null;
  readonly preSurveyResponseCount: number | null;
  readonly preSurveyParticipantCount: number | null;
  readonly workshopDate: string | null;
  readonly workshopFormat: AutopsyWorkshopFormat | null;
  readonly workshopCompletedAt: string | null;
  readonly workshopParticipants: readonly string[];
  readonly deliveryAutopsySectionsCompleted: boolean;
  readonly operationalOutcomesSectionsCompleted: boolean | null;
  readonly findingCount: number;
  readonly actionCount: number;
  readonly outputCount: number;
  readonly peApprovedAt: string | null;
  readonly peApprovedBy: string | null;
  readonly publishedAt: string | null;
  readonly notes: string | null;
}

// -- Section Definitions (§9.1) ---------------------------------------------

/** Autopsy section definition per T07 §9.1. */
export interface IAutopsySectionDefinition {
  readonly key: AutopsyTheme;
  readonly label: string;
  readonly applicableWhen: string;
}

// -- Finding (§11) ----------------------------------------------------------

/** Finding evidence reference per T07 §11.2. */
export interface IFindingEvidenceRef {
  readonly refType: FindingEvidenceRefType;
  readonly recordId: string | null;
  readonly description: string;
  readonly url: string | null;
}

/** Autopsy finding record per T07 §11. */
export interface IAutopsyFinding {
  readonly findingId: string;
  readonly autopsyId: string;
  readonly sectionKey: AutopsyTheme;
  readonly findingSequence: number;
  readonly findingType: AutopsyFindingType;
  readonly title: string;
  readonly description: string;
  readonly rootCauses: readonly string[];
  readonly contributingFactors: readonly string[];
  readonly impactOnProject: string | null;
  readonly recurrenceRisk: AutopsyRecurrenceRisk | null;
  readonly severity: AutopsyFindingSeverity | null;
  readonly evidenceRefs: readonly IFindingEvidenceRef[];
  readonly linkedLessonIds: readonly string[];
  readonly linkedScorecardCriterionIds: readonly string[];
  readonly linkedActionIds: readonly string[];
  readonly createdBy: string;
  readonly createdAt: string;
}

// -- Action (§13) -----------------------------------------------------------

/** Autopsy action record per T07 §13.1. */
export interface IAutopsyAction {
  readonly actionId: string;
  readonly autopsyId: string;
  readonly findingId: string | null;
  readonly actionSequence: number;
  readonly title: string;
  readonly description: string;
  readonly actionType: AutopsyActionType;
  readonly assignedToUserId: string | null;
  readonly assignedToRoleHint: string | null;
  readonly targetDate: string | null;
  readonly status: AutopsyActionStatus;
  readonly completedAt: string | null;
  readonly completedNote: string | null;
  readonly workQueueItemId: string | null;
}

// -- Learning Legacy Output (§14.2) -----------------------------------------

/** Learning legacy output record per T07 §14.2. */
export interface ILearningLegacyOutputRecord {
  readonly outputId: string;
  readonly autopsyId: string;
  readonly outputType: LearningLegacyOutputType;
  readonly title: string;
  readonly summary: string;
  readonly fullContent: string;
  readonly actionableRecommendations: readonly string[];
  readonly targetAudience: readonly string[];
  readonly applicableMarketSectors: readonly MarketSector[];
  readonly applicableDeliveryMethods: readonly DeliveryMethod[];
  readonly applicableSizeBands: readonly ProjectSizeBand[];
  readonly tags: readonly string[];
  readonly recurrenceRisk: AutopsyRecurrenceRisk;
  readonly sourceFindings: readonly string[];
  readonly sourceLessons: readonly string[];
  readonly publicationStatus: 'DRAFT' | 'PE_APPROVED' | 'PUBLISHED';
  readonly peApprovedAt: string | null;
  readonly publishedAt: string | null;
}

// -- Pre-Survey (§6) --------------------------------------------------------

/** Pre-survey question per T07 §6.2. */
export interface IPreSurveyQuestion {
  readonly questionId: string;
  readonly questionText: string;
  readonly responseType: PreSurveyResponseType;
  readonly responseOptions: readonly string[] | null;
  readonly theme: AutopsyTheme;
  readonly isRequired: boolean;
}

/** Pre-survey response record per T07 §6.4. */
export interface IPreSurveyResponseRecord {
  readonly responseId: string;
  readonly autopsyId: string;
  readonly respondentUserId: string;
  readonly submittedAt: string;
  readonly responses: ReadonlyArray<{
    readonly questionId: string;
    readonly scaleValue: number | null;
    readonly textValue: string | null;
    readonly selectedOptions: readonly string[] | null;
    readonly rankedOptions: readonly string[] | null;
  }>;
}

// -- Root-Cause Level (§12.2) -----------------------------------------------

/** Root-cause framework level per T07 §12.2. */
export interface IRootCauseLevel {
  readonly level: string;
  readonly question: string;
  readonly example: string;
}

// -- Workshop Agenda (§8.2) -------------------------------------------------

/** Workshop agenda block per T07 §8.2. */
export interface IWorkshopAgendaBlock {
  readonly time: string;
  readonly block: string;
  readonly description: string;
}

// -- Pre-Briefing Data Source (§7.1) ----------------------------------------

/** Pre-briefing pack data source per T07 §7.1. */
export interface IPreBriefingDataSource {
  readonly section: string;
  readonly source: string;
  readonly dataPoints: string;
}

// -- Layer Comparison (§2) --------------------------------------------------

/** Three-layer architecture comparison per T07 §2. */
export interface IAutopsyLayerComparison {
  readonly layer: string;
  readonly tool: string;
  readonly operator: string;
  readonly granularity: string;
  readonly timing: string;
}

// -- Finding Type Definition (§11.1) ----------------------------------------

/** Finding type definition per T07 §11.1. */
export interface IFindingTypeDefinition {
  readonly type: AutopsyFindingType;
  readonly definition: string;
}

// -- Action Type Definition (§13.2) -----------------------------------------

/** Action type definition per T07 §13.2. */
export interface IActionTypeDefinition {
  readonly type: AutopsyActionType;
  readonly description: string;
  readonly typicalOwner: string;
}
