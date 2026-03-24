/**
 * P3-E10-T07 Project Autopsy and Learning Legacy enumerations.
 * Sections, finding types, action types, output types, workshop, root causes.
 */

// -- Autopsy Theme / Section Key (§9.1) ------------------------------------

/** 12 autopsy thematic sections per T07 §9.1. */
export type AutopsyTheme =
  | 'BusinessCase'
  | 'PreconPlanningProcurement'
  | 'DesignCoordination'
  | 'CommercialChanges'
  | 'ScheduleProduction'
  | 'CostFinancialOutcomes'
  | 'SafetyRiskCompliance'
  | 'QualityReworkTurnover'
  | 'StakeholderCommunication'
  | 'CloseoutHandover'
  | 'OccupancyUserExperience'
  | 'DeveloperAssetOutcomes';

// -- Finding Type (§11.1) --------------------------------------------------

/** Autopsy finding type per T07 §11.1. */
export type AutopsyFindingType =
  | 'Strength'
  | 'Gap'
  | 'Risk'
  | 'Opportunity'
  | 'SystemicPattern';

// -- Recurrence Risk --------------------------------------------------------

/** Recurrence risk level for findings and outputs. */
export type AutopsyRecurrenceRisk = 'Low' | 'Medium' | 'High';

// -- Finding Severity -------------------------------------------------------

/** Finding severity aligned with lesson impact magnitude. */
export type AutopsyFindingSeverity = 'Minor' | 'Moderate' | 'Significant' | 'Critical';

// -- Action Type (§13.2) ---------------------------------------------------

/** Autopsy action type per T07 §13.2. */
export type AutopsyActionType =
  | 'ProcessChange'
  | 'StandardsUpdate'
  | 'TrainingRequired'
  | 'ToolOrSystemChange'
  | 'ContractualAdjustment'
  | 'RelationshipAction'
  | 'FeedForwardToEstimating'
  | 'Other';

// -- Action Status (§13.1) -------------------------------------------------

/** Autopsy action status per T07 §13.1. */
export type AutopsyActionStatus =
  | 'Open'
  | 'InProgress'
  | 'Complete'
  | 'Deferred'
  | 'Cancelled';

// -- Learning Legacy Output Type (§14.3) ------------------------------------

/** Learning legacy output type per T07 §14.3. */
export type LearningLegacyOutputType =
  | 'FeedForwardLesson'
  | 'StandardsUpdateRecommendation'
  | 'ProcessImprovementProposal'
  | 'TrainingNeedIdentified'
  | 'SupplierOrPartnerInsight'
  | 'TechnologyOrToolInsight'
  | 'ClientOrOwnerInsight'
  | 'DeveloperAssetInsight';

// -- Workshop Format (§10) -------------------------------------------------

/** Workshop format per T07 §10. */
export type AutopsyWorkshopFormat = 'FullDay' | 'HalfDay' | 'Virtual' | 'Hybrid';

// -- Root-Cause Category (§12.3) -------------------------------------------

/** Root-cause category for tagging per T07 §12.3. */
export type RootCauseCategory =
  | 'Planning'
  | 'Estimation'
  | 'Procurement'
  | 'Communication'
  | 'ContractClarity'
  | 'Staffing'
  | 'Process'
  | 'Technology'
  | 'External'
  | 'OwnerDecision'
  | 'DesignQuality'
  | 'SubPerformance'
  | 'Cultural'
  | 'Other';

// -- Pre-Survey Response Type (§6.2) ----------------------------------------

/** Pre-survey question response type per T07 §6.2. */
export type PreSurveyResponseType =
  | 'Scale1to5'
  | 'Scale1to10'
  | 'Text'
  | 'MultiSelect'
  | 'Ranked';

// -- Finding Evidence Ref Type (§11.2) --------------------------------------

/** Evidence reference type for findings per T07 §11.2. */
export type FindingEvidenceRefType =
  | 'LessonEntry'
  | 'ScorecardCriterion'
  | 'ScheduleSnapshot'
  | 'FinancialVariance'
  | 'SafetyEvent'
  | 'PermitEvent'
  | 'PreSurveyResponse'
  | 'ExternalDocument';
