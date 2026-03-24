/**
 * P3-E10-T01 Project Closeout Module foundation enumerations.
 * Operating model, scope, surface map, and SoT boundary types.
 */

// -- Record Families (§3.1) -------------------------------------------------

/** The 16 record families owned by the Closeout Module. */
export type CloseoutRecordFamily =
  | 'CloseoutChecklist'
  | 'CloseoutChecklistSection'
  | 'CloseoutChecklistItem'
  | 'ChecklistTemplate'
  | 'CloseoutMilestone'
  | 'SubcontractorScorecard'
  | 'ScorecardSection'
  | 'ScorecardCriterion'
  | 'LessonEntry'
  | 'LessonsLearningReport'
  | 'AutopsyRecord'
  | 'AutopsySection'
  | 'AutopsyFinding'
  | 'AutopsyAction'
  | 'AutopsyPreSurveyResponse'
  | 'LearningLegacyOutput';

// -- Surface Classes (§2.1) -------------------------------------------------

/** Three-class surface hierarchy per T01 §2.1. */
export type CloseoutSurfaceClass =
  | 'ProjectScoped'
  | 'OrgDerived'
  | 'ProjectHubConsumption';

// -- Operational Surfaces — Class 1 (§2.2) ----------------------------------

/** The 4 project-scoped operational surfaces per T01 §2.2 Class 1. */
export type CloseoutOperationalSurface =
  | 'CloseoutChecklist'
  | 'SubcontractorScorecard'
  | 'LessonsLearned'
  | 'ProjectAutopsy';

// -- Derived Indexes — Class 2 (§2.2) ---------------------------------------

/** The 3 org-wide derived read model indexes per T01 §2.2 Class 2. */
export type CloseoutDerivedIndex =
  | 'LessonsIntelligence'
  | 'SubIntelligence'
  | 'LearningLegacy';

// -- Consumption Points — Class 3 (§2.2) ------------------------------------

/** The 3 Project Hub consumption surfaces per T01 §2.2 Class 3. */
export type CloseoutConsumptionPoint =
  | 'ContextualLessonsPanel'
  | 'SubVettingIntelligence'
  | 'LearningLegacyFeed';

// -- Authority Roles (§5) ---------------------------------------------------

/** Roles with authority in the Closeout Module per T01 §5 SoT matrix. */
export type CloseoutAuthorityRole =
  | 'PM'
  | 'Superintendent'
  | 'PE'
  | 'PER'
  | 'MOEAdmin'
  | 'System';

// -- Authority Actions (§5) -------------------------------------------------

/** Actions available within the Closeout Module authority model. */
export type CloseoutAuthorityAction =
  | 'Create'
  | 'Read'
  | 'Update'
  | 'Approve'
  | 'Annotate';

// -- Lifecycle Phases (§4) --------------------------------------------------

/** Always-on activation lifecycle phases per T01 §4. */
export type CloseoutLifecyclePhase =
  | 'Preconstruction'
  | 'EarlyExecution'
  | 'Execution'
  | 'CloseoutPhase'
  | 'ArchivePublication';

// -- Module Functions (§1) --------------------------------------------------

/** The two architecturally distinct functions per T01 §1. */
export type CloseoutFunction =
  | 'ProjectScopedOperations'
  | 'IntelligencePublication';

// -- Cross-Module Sources (§3.2) --------------------------------------------

/** Read-only cross-module data sources per T01 §3.2. */
export type CloseoutCrossModuleSource =
  | 'Financial'
  | 'Schedule'
  | 'Permits'
  | 'Safety'
  | 'RelatedItems';
