/**
 * P3-E8-T01 Safety Module foundation enumerations.
 * Module scope, operating model, and visibility doctrine types.
 */

// -- Safety Record Families (SS3) -----------------------------------------

/** The 15 first-class record families in the Safety Module workspace. */
export type SafetyRecordFamily =
  | 'SSSPBasePlan'
  | 'SSSPAddendum'
  | 'InspectionChecklistTemplate'
  | 'CompletedWeeklyInspection'
  | 'SafetyCorrectiveAction'
  | 'IncidentCase'
  | 'JobHazardAnalysis'
  | 'DailyPreTaskPlan'
  | 'ToolboxTalkPrompt'
  | 'WeeklyToolboxTalkRecord'
  | 'WorkerOrientationRecord'
  | 'SubcontractorSafetySubmission'
  | 'CertificationQualificationRecord'
  | 'HazComSdsRecord'
  | 'CompetentPersonDesignation';

// -- Safety Authority Roles (SS4) ------------------------------------------

/** Roles with authority in the Safety Module. */
export type SafetyAuthorityRole =
  | 'SafetyManager'
  | 'SafetyOfficer'
  | 'ProjectManager'
  | 'Superintendent'
  | 'FieldEngineer'
  | 'System';

// -- Safety Authority Actions (SS4.1-4.3) ----------------------------------

/** Actions available within the Safety Module authority matrix. */
export type SafetyAuthorityAction =
  | 'Create'
  | 'Read'
  | 'Update'
  | 'Approve'
  | 'Configure'
  | 'Assign';

// -- Lane Ownership (SS4) --------------------------------------------------

/** Which lane owns a record family or field. */
export type SafetyLaneOwner =
  | 'SafetyManagerLane'
  | 'ProjectTeamLane';

// -- Incident Privacy Tiers (SS5.4) ----------------------------------------

/** Privacy tier controlling visibility of incident/case records. */
export type IncidentPrivacyTier =
  | 'STANDARD'
  | 'SENSITIVE'
  | 'RESTRICTED';

// -- PER Visibility Tiers (SS5.3) ------------------------------------------

/** Tiered PER/executive visibility for Safety data. */
export type PERVisibilityTier =
  | 'LeadershipOperationalSummary'
  | 'PERSanitizedIndicators'
  | 'IncidentSummary';

// -- Composite Scorecard Dimensions (SS5.2) ---------------------------------

/** The five dimensions of the composite safety scorecard. */
export type CompositeScorecardDimension =
  | 'InspectionTrend'
  | 'CorrectiveActionHealth'
  | 'ReadinessPosture'
  | 'BlockerState'
  | 'ComplianceCompletion';
