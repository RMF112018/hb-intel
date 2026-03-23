import type {
  AckResponse,
  AckStatus,
  AckSubjectType,
  BaselineType,
  BlockerSeverity,
  BlockerStatus,
  BlockerType,
  CalendarType,
  CommitmentType,
  FieldCommitmentStatus,
  FieldCommitmentType,
  IImportValidationRule,
  IMilestoneStatusDisplay,
  IMilestoneThresholdConfig,
  IRollUpConfig,
  IScheduleIntegrationBoundary,
  IScheduleSummaryThresholdConfig,
  LocationHierarchyLevel,
  LookAheadStatus,
  MilestoneStatus,
  MilestoneType,
  OverallReadiness,
  PercentCompleteBasis,
  ProgressBasisType,
  PublicationInitiatorRole,
  PublicationLifecycleStatus,
  PublicationType,
  PublishBlockerSeverity,
  ReadinessDimensionStatus,
  ReconciliationStatus,
  ReconciliationTrigger,
  RollUpMethod,
  ScenarioLogicSource,
  ScenarioPromotionDisposition,
  ScenarioRelationshipType,
  ScenarioStatus,
  ScenarioType,
  ScheduleAccessAction,
  ScheduleActivityType,
  ScheduleAuthorityRole,
  ScheduleConstraintType,
  ScheduleImportFormat,
  ScheduleLayerAccess,
  ScheduleOverallStatus,
  ScheduleSourceOwnerRole,
  ScheduleSourceSystem,
  ScheduleStatusCode,
  ScheduleVersionStatus,
  SyncStatus,
  VerificationMethod,
  VerificationOutcome,
  VerificationStatus,
  WorkPackageStatus,
  LogicLayer,
  LogicRelationshipType,
  LogicSource,
  WorkPackageLinkType,
  PropagationType,
  IPropagationRule,
  ScheduleLetterGrade,
  ConfidenceLabel,
  RecommendationTargetType,
  RecommendationType,
  RecommendationDisposition,
  RecommendationPromotionPath,
  CausationApplicableRecordType,
  ScheduleRelatedItemType,
  ScheduleLinkedArtifactObject,
  ScheduleWorkflowHandoffType,
  ScheduleWorkItemType,
  IScheduleWorkItemConfig,
  ScheduleNotificationType,
  IScheduleNotificationConfig,
  ScheduleComplexityTier,
  IScheduleComplexityTierConfig,
  ScheduleAnnotatableSurface,
  IAnnotatableFieldConfig,
  SchedulePolicyArea,
  IGovernedPolicyArea,
  ICommitmentApprovalThreshold,
  IAutoPublishCriteria,
  IntentReplayStatus,
  ScheduleCapability,
  IScheduleCapabilityConfig,
  ScheduleAuthorityLayer,
  IFieldSummaryEntry,
  ClassificationDimension,
  IClassificationMapping,
  ClassificationUsageContext,
  IntentOperationType,
  IntentRecordType,
  ConflictType,
  IConflictResolutionRule,
  VisibilityPolicyDimension,
  ExternalParticipantWorkflow,
} from '../types/index.js';

/**
 * P3-E5 contract constants for Schedule module.
 * T01: source identity, versioning, import snapshot, dual-calendar model.
 * Values are locked for contract stability.
 */

export const SCHEDULE_MODULE_SCOPE = 'schedule' as const;

// ── §1.1 Source Systems ──────────────────────────────────────────────

export const SCHEDULE_SOURCE_SYSTEMS = [
  'PrimaveraP6',
  'MSProject',
  'Asta',
  'Oracle',
  'Other',
] as const satisfies ReadonlyArray<ScheduleSourceSystem>;

export const SCHEDULE_SOURCE_OWNER_ROLES = [
  'PM',
  'Scheduler',
  'PE',
] as const satisfies ReadonlyArray<ScheduleSourceOwnerRole>;

// ── §1.2 Version Statuses ────────────────────────────────────────────

export const SCHEDULE_IMPORT_FORMATS = [
  'XER',
  'XML',
  'CSV',
] as const satisfies ReadonlyArray<ScheduleImportFormat>;

export const SCHEDULE_VERSION_STATUSES = [
  'Processing',
  'Parsed',
  'Active',
  'Superseded',
  'Failed',
  'Secondary',
] as const satisfies ReadonlyArray<ScheduleVersionStatus>;

/** Human-readable descriptions for each version status (§1.2). */
export const SCHEDULE_VERSION_STATUS_DESCRIPTIONS: ReadonlyArray<{
  readonly status: ScheduleVersionStatus;
  readonly description: string;
}> = [
  { status: 'Processing', description: 'File is being parsed' },
  { status: 'Parsed', description: 'Successfully parsed; awaiting activation' },
  { status: 'Active', description: 'Currently active for this source (one per source at a time)' },
  { status: 'Superseded', description: 'Replaced by a newer version; retained for history and forensics' },
  { status: 'Failed', description: 'Parse failed; not usable' },
  { status: 'Secondary', description: 'Imported from a non-canonical source; available for comparison only' },
];

// ── §1.3 Baseline Types ─────────────────────────────────────────────

export const BASELINE_TYPES = [
  'ContractBaseline',
  'ApprovedRevision',
  'RecoveryBaseline',
  'Scenario',
] as const satisfies ReadonlyArray<BaselineType>;

// ── §1.4 Activity Types and Status Codes ─────────────────────────────

export const SCHEDULE_ACTIVITY_TYPES = [
  'TT_Task',
  'TT_Mile',
  'TT_LOE',
  'TT_FinMile',
  'TT_WBS',
] as const satisfies ReadonlyArray<ScheduleActivityType>;

export const SCHEDULE_STATUS_CODES = [
  'TK_NotStart',
  'TK_Active',
  'TK_Complete',
] as const satisfies ReadonlyArray<ScheduleStatusCode>;

// ── §1.4.1 Constraint Types ─────────────────────────────────────────

export const SCHEDULE_CONSTRAINT_TYPES = [
  'CS_MSOA',
  'CS_MFOA',
  'CS_MSON',
  'CS_MFON',
  'CS_SNLF',
  'CS_FNLF',
  'CS_MEOA',
  'CS_MEON',
] as const satisfies ReadonlyArray<ScheduleConstraintType>;

/** Human-readable constraint type abbreviations and meanings (§1.4.1). */
export const SCHEDULE_CONSTRAINT_TYPE_LABELS: ReadonlyArray<{
  readonly type: ScheduleConstraintType;
  readonly abbreviation: string;
  readonly meaning: string;
}> = [
  { type: 'CS_MSOA', abbreviation: 'MSOA', meaning: 'Must Start On or After' },
  { type: 'CS_MFOA', abbreviation: 'MFOA', meaning: 'Must Finish On or After' },
  { type: 'CS_MSON', abbreviation: 'MSON', meaning: 'Must Start On (exact)' },
  { type: 'CS_MFON', abbreviation: 'MFON', meaning: 'Must Finish On (exact)' },
  { type: 'CS_SNLF', abbreviation: 'SNLF', meaning: 'Start No Later Than' },
  { type: 'CS_FNLF', abbreviation: 'FNLF', meaning: 'Finish No Later Than' },
  { type: 'CS_MEOA', abbreviation: 'MEOA', meaning: 'Must End On or After' },
  { type: 'CS_MEON', abbreviation: 'MEON', meaning: 'Must End On' },
];

// ── §1.4 Percent Complete ────────────────────────────────────────────

export const PERCENT_COMPLETE_BASES = [
  'Duration',
  'Physical',
  'Units',
  'Manual',
] as const satisfies ReadonlyArray<PercentCompleteBasis>;

// ── §17 Calendar Types ──────────────────────────────────────────────

export const CALENDAR_TYPES = [
  'SourceCalendar',
  'OperatingCalendar',
] as const satisfies ReadonlyArray<CalendarType>;

// ── §1.6 Import Validation Rules ─────────────────────────────────────

export const IMPORT_VALIDATION_RULES: ReadonlyArray<IImportValidationRule> = [
  { check: 'File format recognized', severity: 'error', behavior: 'Abort parse' },
  { check: 'Required columns present', severity: 'error', behavior: 'Abort parse' },
  { check: 'Activity code unique within version', severity: 'error', behavior: 'Abort parse' },
  { check: 'Data date present and valid', severity: 'error', behavior: 'Abort parse' },
  { check: 'Baseline dates present', severity: 'warning', behavior: 'Parse succeeds; baselineStartDate/Finish = null' },
  { check: 'Target dates valid', severity: 'error', behavior: 'Abort parse if target finish < data date for not-started' },
  { check: 'Float values present', severity: 'warning', behavior: 'Parse succeeds; float = null' },
  { check: 'Duration >= 0', severity: 'warning', behavior: 'Parse succeeds if 0 for non-milestone' },
  { check: 'Activity code matches prior versions', severity: 'informational', behavior: 'Match to continuity link; log new/missing codes' },
  { check: 'Constraint dates within project window', severity: 'warning', behavior: 'Parse succeeds; flag for review' },
];

// ── Authority Roles ──────────────────────────────────────────────────

export const SCHEDULE_AUTHORITY_ROLES = [
  'PM',
  'PE',
  'Scheduler',
  'Superintendent',
  'Foreman',
  'MOE',
] as const satisfies ReadonlyArray<ScheduleAuthorityRole>;

export const SCHEDULE_ACCESS_ACTIONS = [
  'read',
  'write',
  'approve',
  'configure',
  'publish',
] as const satisfies ReadonlyArray<ScheduleAccessAction>;

export const SCHEDULE_LAYERS = [
  'master-schedule',
  'operating',
  'field-execution',
  'published-forecast',
] as const satisfies ReadonlyArray<ScheduleLayerAccess>;

// ── Integration Boundaries ───────────────────────────────────────────

export const SCHEDULE_INTEGRATION_BOUNDARIES: ReadonlyArray<IScheduleIntegrationBoundary> = [
  {
    key: 'cpm-schedule-import',
    direction: 'inbound',
    source: 'Primavera P6 / MS Project / Asta',
    target: 'Schedule',
    description: 'XER/XML/CSV import → frozen ScheduleVersionRecord + ImportedActivitySnapshot',
    status: 'active',
  },
  {
    key: 'schedule-to-health-spine',
    direction: 'outbound',
    source: 'Schedule',
    target: 'Health Spine (P3-D2)',
    description: 'Published forecast milestone status, percent complete, critical path summary',
    status: 'planned',
  },
  {
    key: 'schedule-to-reports',
    direction: 'outbound',
    source: 'Schedule',
    target: 'Reports (P3-F1)',
    description: 'Published forecast layer as report data source for schedule summary projection',
    status: 'planned',
  },
  {
    key: 'schedule-to-work-queue',
    direction: 'outbound',
    source: 'Schedule',
    target: 'Work Queue (P3-D3)',
    description: 'Acknowledgement items, blocker resolution, readiness verification tasks',
    status: 'planned',
  },
  {
    key: 'schedule-to-activity-spine',
    direction: 'outbound',
    source: 'Schedule',
    target: 'Activity Spine (P3-D1)',
    description: 'Import events, baseline approvals, publication events, field execution events',
    status: 'planned',
  },
];

// ══════════════════════════════════════════════════════════════════════
// T02: Dual-Truth Commitments and Milestones (§2, §4)
// ══════════════════════════════════════════════════════════════════════

// ── §2.1 Commitment Types ────────────────────────────────────────────

export const COMMITMENT_TYPES = [
  'ActivityForecast',
  'MilestoneCommitment',
  'CompletionForecast',
] as const satisfies ReadonlyArray<CommitmentType>;

export const RECONCILIATION_STATUSES = [
  'Aligned',
  'PMOverride',
  'SourceAhead',
  'ConflictRequiresReview',
  'PendingApproval',
  'Approved',
  'Rejected',
] as const satisfies ReadonlyArray<ReconciliationStatus>;

/** Human-readable descriptions for each reconciliation status (§2.1). */
export const RECONCILIATION_STATUS_DESCRIPTIONS: ReadonlyArray<{
  readonly status: ReconciliationStatus;
  readonly description: string;
}> = [
  { status: 'Aligned', description: 'Committed dates match source truth within governed tolerance' },
  { status: 'PMOverride', description: 'PM has set committed dates that differ from source truth; within approval threshold' },
  { status: 'SourceAhead', description: 'New source import moved dates; committed dates are now behind source' },
  { status: 'ConflictRequiresReview', description: 'Committed and source dates in irreconcilable conflict; PM action required' },
  { status: 'PendingApproval', description: 'Change magnitude exceeds governed threshold; awaiting PE approval' },
  { status: 'Approved', description: 'PE approved; committed dates are authoritative working position' },
  { status: 'Rejected', description: 'PE rejected; prior committed dates restored; PM must revise' },
];

// ── §2.2 Reconciliation Triggers ─────────────────────────────────────

export const RECONCILIATION_TRIGGERS = [
  'SourceImport',
  'PMEdit',
  'PEApproval',
  'PERejection',
  'System',
] as const satisfies ReadonlyArray<ReconciliationTrigger>;

// ── §4.4 Milestone Types ─────────────────────────────────────────────

export const MILESTONE_TYPES = [
  'ContractCompletion',
  'SubstantialCompletion',
  'OwnerMilestone',
  'HBInternal',
  'SubMilestone',
  'Permit',
  'Inspection',
  'Custom',
] as const satisfies ReadonlyArray<MilestoneType>;

/** Human-readable descriptions for each milestone type (§4.4). */
export const MILESTONE_TYPE_DESCRIPTIONS: ReadonlyArray<{
  readonly type: MilestoneType;
  readonly description: string;
}> = [
  { type: 'ContractCompletion', description: 'Contract completion date' },
  { type: 'SubstantialCompletion', description: 'Owner occupancy / retention release' },
  { type: 'OwnerMilestone', description: 'Owner-specified event' },
  { type: 'HBInternal', description: 'Internal construction milestone' },
  { type: 'SubMilestone', description: 'Subcontractor phase completion' },
  { type: 'Permit', description: 'Permit approval event' },
  { type: 'Inspection', description: 'Inspection completion event' },
  { type: 'Custom', description: 'User-defined category' },
];

// ── §4.3 Milestone Statuses ──────────────────────────────────────────

export const MILESTONE_STATUSES = [
  'NotStarted',
  'OnTrack',
  'AtRisk',
  'Delayed',
  'Critical',
  'Achieved',
  'Superseded',
] as const satisfies ReadonlyArray<MilestoneStatus>;

/** Status → UI signal and color mapping (§4.3). */
export const MILESTONE_STATUS_DISPLAY: ReadonlyArray<IMilestoneStatusDisplay> = [
  { status: 'NotStarted', uiSignal: 'Gray dot', color: 'Gray' },
  { status: 'OnTrack', uiSignal: 'Checkmark', color: 'Green' },
  { status: 'AtRisk', uiSignal: 'Exclamation', color: 'Yellow' },
  { status: 'Delayed', uiSignal: 'Warning', color: 'Orange' },
  { status: 'Critical', uiSignal: 'Red circle', color: 'Red' },
  { status: 'Achieved', uiSignal: 'Checkmark', color: 'Green' },
  { status: 'Superseded', uiSignal: 'Dash', color: 'Gray' },
];

/** Default governed thresholds for milestone status calculation (§4.3). */
export const DEFAULT_MILESTONE_THRESHOLDS: IMilestoneThresholdConfig = {
  atRiskThresholdDays: 14,
  delayedThresholdDays: 30,
};

// ══════════════════════════════════════════════════════════════════════
// T03: Publication Layer (§3, §19)
// ══════════════════════════════════════════════════════════════════════

// ── §3.1 Publication Types ───────────────────────────────────────────

export const PUBLICATION_TYPES = [
  'MonthlyUpdate',
  'MilestoneReview',
  'IssueUpdate',
  'RecoveryPlan',
  'BaselineEstablishment',
  'AutoPublish',
] as const satisfies ReadonlyArray<PublicationType>;

export const PUBLICATION_LIFECYCLE_STATUSES = [
  'Draft',
  'ReadyForReview',
  'Published',
  'Superseded',
] as const satisfies ReadonlyArray<PublicationLifecycleStatus>;

export const PUBLICATION_INITIATOR_ROLES = [
  'PM',
  'Scheduler',
  'PE',
] as const satisfies ReadonlyArray<PublicationInitiatorRole>;

// ── §3.2 Blocker Severities ─────────────────────────────────────────

export const PUBLISH_BLOCKER_SEVERITIES = [
  'Hard',
  'Soft',
] as const satisfies ReadonlyArray<PublishBlockerSeverity>;

// ── §19 Schedule Overall Statuses ────────────────────────────────────

export const SCHEDULE_OVERALL_STATUSES = [
  'OnTrack',
  'AtRisk',
  'Delayed',
  'Critical',
] as const satisfies ReadonlyArray<ScheduleOverallStatus>;

/** Default governed thresholds for schedule summary overall status (§19.2). */
export const DEFAULT_SCHEDULE_SUMMARY_THRESHOLDS: IScheduleSummaryThresholdConfig = {
  atRiskThresholdDays: 7,
  delayedThresholdDays: 21,
  criticalThresholdDays: 21,
};

// ══════════════════════════════════════════════════════════════════════
// T04: Scenario Branch Model (§5)
// ══════════════════════════════════════════════════════════════════════

export const SCENARIO_TYPES = [
  'RecoverySchedule',
  'AccelerationOption',
  'WhatIfAnalysis',
  'DelayImpact',
  'BaselineCandidate',
  'Other',
] as const satisfies ReadonlyArray<ScenarioType>;

export const SCENARIO_STATUSES = [
  'Draft',
  'UnderReview',
  'Approved',
  'Rejected',
  'PromotedToCommitment',
  'PromotedToPublication',
  'Archived',
] as const satisfies ReadonlyArray<ScenarioStatus>;

export const SCENARIO_PROMOTION_DISPOSITIONS = [
  'None',
  'PromoteToCommitment',
  'PromoteToPublication',
  'PromoteToBaseline',
] as const satisfies ReadonlyArray<ScenarioPromotionDisposition>;

export const SCENARIO_RELATIONSHIP_TYPES = [
  'FS',
  'SS',
  'FF',
  'SF',
] as const satisfies ReadonlyArray<ScenarioRelationshipType>;

export const SCENARIO_LOGIC_SOURCES = [
  'ScenarioOverride',
  'WorkPackageLink',
] as const satisfies ReadonlyArray<ScenarioLogicSource>;

// ══════════════════════════════════════════════════════════════════════
// T05: Field Execution Layer (§6, §7, §8, §9)
// ══════════════════════════════════════════════════════════════════════

// ── §6.1 Work Package ────────────────────────────────────────────────

export const PROGRESS_BASIS_TYPES = [
  'MilestoneAchieved', 'DurationPct', 'PhysicalPct', 'UnitsInstalled',
  'ResourcePct', 'QuantityInstalled', 'Configured',
] as const satisfies ReadonlyArray<ProgressBasisType>;

export const WORK_PACKAGE_STATUSES = [
  'Planned', 'Ready', 'InProgress', 'Blocked', 'Complete', 'Cancelled', 'PendingVerification',
] as const satisfies ReadonlyArray<WorkPackageStatus>;

export const SYNC_STATUSES = [
  'SavedLocally', 'QueuedToSync', 'Synced', 'ConflictRequiresReview',
] as const satisfies ReadonlyArray<SyncStatus>;

// ── §6.2 Location ────────────────────────────────────────────────────

export const LOCATION_HIERARCHY_LEVELS = [
  'Campus', 'Building', 'Level', 'Zone', 'Room', 'Workface', 'Custom',
] as const satisfies ReadonlyArray<LocationHierarchyLevel>;

// ── §6.3 Field Commitment ────────────────────────────────────────────

export const FIELD_COMMITMENT_TYPES = [
  'Completion', 'MilestoneAchievement', 'ReadinessGate', 'Quantity',
] as const satisfies ReadonlyArray<FieldCommitmentType>;

export const FIELD_COMMITMENT_STATUSES = [
  'Requested', 'Acknowledged', 'Accepted', 'Declined', 'Reassigned',
  'Kept', 'Missed', 'PartiallyKept', 'Cancelled',
] as const satisfies ReadonlyArray<FieldCommitmentStatus>;

// ── §6.4 Blocker ─────────────────────────────────────────────────────

export const BLOCKER_TYPES = [
  'Design', 'Material', 'Equipment', 'Labor', 'Permit', 'Inspection',
  'Owner', 'Weather', 'RFI', 'Submittal', 'Safety', 'Funding', 'Predecessor', 'Other',
] as const satisfies ReadonlyArray<BlockerType>;

export const BLOCKER_SEVERITIES = [
  'Informational', 'AtRisk', 'Blocking', 'Critical',
] as const satisfies ReadonlyArray<BlockerSeverity>;

export const BLOCKER_STATUSES = [
  'Open', 'InProgress', 'Resolved', 'Escalated', 'Closed', 'Withdrawn',
] as const satisfies ReadonlyArray<BlockerStatus>;

// ── §6.5 Readiness ───────────────────────────────────────────────────

export const OVERALL_READINESS_VALUES = [
  'Ready', 'ConditionallyReady', 'NotReady', 'Unknown',
] as const satisfies ReadonlyArray<OverallReadiness>;

export const READINESS_DIMENSION_STATUSES = [
  'Ready', 'AtRisk', 'NotReady', 'NotApplicable',
] as const satisfies ReadonlyArray<ReadinessDimensionStatus>;

/** Governed default readiness dimensions (§6.5). */
export const DEFAULT_READINESS_DIMENSIONS = [
  'DRAWINGS', 'MATERIALS', 'LABOR', 'EQUIPMENT', 'PERMITS', 'INSPECTIONS', 'PREDECESSOR_COMPLETE',
] as const;

// ── §6.6 Look-Ahead ─────────────────────────────────────────────────

export const LOOK_AHEAD_STATUSES = [
  'Draft', 'Published', 'InExecution', 'Closed',
] as const satisfies ReadonlyArray<LookAheadStatus>;

// ── §7 Acknowledgement ──────────────────────────────────────────────

export const ACK_SUBJECT_TYPES = [
  'Commitment', 'PublicationReview', 'ReconciliationRequest', 'EscalationNotice', 'ApprovalRequest',
] as const satisfies ReadonlyArray<AckSubjectType>;

export const ACK_STATUSES = [
  'Pending', 'Acknowledged', 'Accepted', 'Declined', 'Reassigned', 'Overdue', 'Escalated', 'Withdrawn',
] as const satisfies ReadonlyArray<AckStatus>;

export const ACK_RESPONSES = [
  'Accept', 'Decline', 'Reassign',
] as const satisfies ReadonlyArray<AckResponse>;

// ── §8 Progress and Verification ─────────────────────────────────────

export const VERIFICATION_STATUSES = [
  'Pending', 'Verified', 'VerificationFailed', 'Waived',
] as const satisfies ReadonlyArray<VerificationStatus>;

export const VERIFICATION_METHODS = [
  'SiteWalkthrough', 'PhotoReview', 'InspectionRecord', 'QuantityMeasurement', 'SystemRecord', 'Other',
] as const satisfies ReadonlyArray<VerificationMethod>;

export const VERIFICATION_OUTCOMES = [
  'Confirmed', 'AdjustedDown', 'AdjustedUp', 'Rejected',
] as const satisfies ReadonlyArray<VerificationOutcome>;

// ── §9 Roll-Up ───────────────────────────────────────────────────────

export const ROLL_UP_METHODS = [
  'WeightedAverage', 'UnweightedAverage', 'DurationWeighted',
] as const satisfies ReadonlyArray<RollUpMethod>;

export const DEFAULT_ROLL_UP_CONFIG: IRollUpConfig = {
  progressRollUpMethod: 'WeightedAverage',
  authoritativeOnlyVerified: true,
};

// ══════════════════════════════════════════════════════════════════════
// T06: Logic Dependencies and Propagation (§10)
// ══════════════════════════════════════════════════════════════════════

export const LOGIC_LAYERS = [
  'SourceCPM', 'Scenario', 'WorkPackage',
] as const satisfies ReadonlyArray<LogicLayer>;

export const LOGIC_RELATIONSHIP_TYPES = [
  'FS', 'SS', 'FF', 'SF',
] as const satisfies ReadonlyArray<LogicRelationshipType>;

export const LOGIC_SOURCES = [
  'SourceCPM', 'ScenarioOverride', 'WorkPackageLink',
] as const satisfies ReadonlyArray<LogicSource>;

export const WORK_PACKAGE_LINK_TYPES = [
  'FS', 'SS', 'FF', 'SF',
] as const satisfies ReadonlyArray<WorkPackageLinkType>;

export const PROPAGATION_TYPES = [
  'SourceSchedulePropagated', 'OperatingLayerProjected', 'ScenarioLayerProjected',
] as const satisfies ReadonlyArray<PropagationType>;

/** Governed propagation rules per §10.4. */
export const PROPAGATION_RULES: ReadonlyArray<IPropagationRule> = [
  {
    propagationType: 'SourceSchedulePropagated',
    basis: 'CPM float / logic from imported snapshot',
    becomesAuthoritativeWhen: 'Already authoritative as imported source truth',
  },
  {
    propagationType: 'OperatingLayerProjected',
    basis: 'Commitment date changes + work-package link traversal',
    becomesAuthoritativeWhen: 'Requires PM approval per governed threshold',
  },
  {
    propagationType: 'ScenarioLayerProjected',
    basis: 'Scenario date overrides + scenario logic',
    becomesAuthoritativeWhen: 'Requires scenario promotion approval',
  },
];

// ══════════════════════════════════════════════════════════════════════
// T07: Analytics Intelligence and Grading (§11, §12, §13)
// ══════════════════════════════════════════════════════════════════════

export const SCHEDULE_LETTER_GRADES = [
  'A', 'B', 'C', 'D', 'F',
] as const satisfies ReadonlyArray<ScheduleLetterGrade>;

/** Default grading control codes (§11.1). Governed by MOE. */
export const DEFAULT_GRADING_CONTROL_CODES = [
  'LOGIC_DENSITY', 'CRITICAL_PATH_FLOAT', 'HIGH_FLOAT', 'NEGATIVE_FLOAT',
  'MISSING_BASELINES', 'CONSTRAINT_COUNT', 'TOTAL_FLOAT_SPREAD',
  'UPDATE_FREQUENCY', 'INCOMPLETE_OPEN_ENDS', 'RESOURCE_LOADING',
] as const;

/** Default near-critical float threshold in hours (§11.2). Governed. */
export const DEFAULT_NEAR_CRITICAL_FLOAT_HRS = 40;

export const CONFIDENCE_LABELS = [
  'High', 'Moderate', 'Low', 'VeryLow',
] as const satisfies ReadonlyArray<ConfidenceLabel>;

/** Default confidence factor weights (§11.4). All governed. */
export const DEFAULT_CONFIDENCE_FACTORS: ReadonlyArray<{
  readonly factorCode: string;
  readonly defaultWeight: number;
  readonly inputSource: string;
}> = [
  { factorCode: 'SCHEDULE_QUALITY', defaultWeight: 0.20, inputSource: 'ScheduleQualityGrade.overallScore' },
  { factorCode: 'FLOAT_PATH_EXPOSURE', defaultWeight: 0.15, inputSource: 'Ratio of near-critical to total activities' },
  { factorCode: 'UPDATE_STABILITY', defaultWeight: 0.15, inputSource: 'Avg version-over-version slippage across milestones' },
  { factorCode: 'UNRESOLVED_BLOCKERS', defaultWeight: 0.15, inputSource: 'Count × severity of open BlockerRecords' },
  { factorCode: 'READINESS_GAPS', defaultWeight: 0.10, inputSource: 'Count of NotReady readiness dimensions' },
  { factorCode: 'COMMITMENT_RELIABILITY', defaultWeight: 0.10, inputSource: 'Rolling PPC% over configured window' },
  { factorCode: 'SOURCE_FRESHNESS', defaultWeight: 0.10, inputSource: 'Days since last active canonical version import' },
  { factorCode: 'SCENARIO_ASSUMPTIONS', defaultWeight: 0.05, inputSource: 'Whether publication is scenario-based' },
];

export const RECOMMENDATION_TARGET_TYPES = [
  'Activity', 'Milestone', 'WorkPackage', 'Commitment', 'Blocker',
  'Scenario', 'Publication', 'ScheduleQuality', 'Confidence',
] as const satisfies ReadonlyArray<RecommendationTargetType>;

export const RECOMMENDATION_TYPES = [
  'ScheduleQualityFinding', 'FloatRisk', 'SlippageTrend', 'CommitmentRisk',
  'BlockerEscalation', 'ReadinessGap', 'ConfidenceCollapse', 'CoachingTip', 'RecoveryOption',
] as const satisfies ReadonlyArray<RecommendationType>;

export const RECOMMENDATION_DISPOSITIONS = [
  'Pending', 'Acknowledged', 'Accepted', 'Declined', 'Promoted', 'Superseded',
] as const satisfies ReadonlyArray<RecommendationDisposition>;

export const RECOMMENDATION_PROMOTION_PATHS = [
  'ToScenario', 'ToWorkItem', 'ToCommitmentChange', 'ToPublicationReview', 'ToBlocker',
] as const satisfies ReadonlyArray<RecommendationPromotionPath>;

export const CAUSATION_APPLICABLE_RECORD_TYPES = [
  'ForecastChange', 'Blocker', 'ReadinessFailure', 'MissedCommitment',
  'ForensicAttribution', 'RecommendationRationale', 'Escalation', 'PublicationBasis', 'BaselineChange',
] as const satisfies ReadonlyArray<CausationApplicableRecordType>;

/** Default causation root categories (§13.1). 13 enterprise defaults. */
export const DEFAULT_CAUSATION_ROOT_CATEGORIES = [
  'DESIGN', 'OWNER', 'SUBCONTRACTOR', 'WEATHER', 'REGULATORY', 'MATERIAL',
  'LABOR', 'EQUIPMENT', 'SCHEDULE', 'CHANGE', 'FORCE_MAJEURE', 'INTERNAL', 'OTHER',
] as const;

// ══════════════════════════════════════════════════════════════════════
// T09: Platform Integration and Governance (§18, §20, §23)
// ══════════════════════════════════════════════════════════════════════

export const SCHEDULE_RELATED_ITEM_TYPES = [
  'RFI', 'Submittal', 'Permit', 'Inspection', 'Drawing', 'Photo',
  'MeetingActionItem', 'WorkItem', 'ChangeEvent', 'OwnerDecision', 'HBIRecommendation',
] as const satisfies ReadonlyArray<ScheduleRelatedItemType>;

export const SCHEDULE_LINKED_ARTIFACT_OBJECTS = [
  'ImportedActivitySnapshot', 'MilestoneRecord', 'FieldWorkPackage',
  'CommitmentRecord', 'BlockerRecord', 'ReadinessRecord',
  'ProgressClaimRecord', 'ManagedCommitmentRecord', 'PublicationRecord',
  'RecommendationRecord', 'ScenarioBranch',
] as const satisfies ReadonlyArray<ScheduleLinkedArtifactObject>;

export const SCHEDULE_WORKFLOW_HANDOFF_TYPES = [
  'PublicationReviewRequest', 'CommitmentApprovalRequest',
  'ScenarioPromotionRequest', 'BaselineApprovalRequest', 'CanonicalSourcePromotionRequest',
] as const satisfies ReadonlyArray<ScheduleWorkflowHandoffType>;

export const SCHEDULE_WORK_ITEM_CONFIGS: ReadonlyArray<IScheduleWorkItemConfig> = [
  { type: 'MilestoneAtRisk', trigger: 'milestone.status = AtRisk', assignee: 'PM' },
  { type: 'MilestoneDelayed', trigger: 'milestone.status = Delayed or Critical', assignee: 'PM + PE' },
  { type: 'CommitmentPendingAcknowledgement', trigger: 'AcknowledgementRecord.status = Pending (overdue)', assignee: 'Responsible party' },
  { type: 'BlockerEscalated', trigger: 'BlockerRecord.status = Escalated', assignee: 'Owner + PM' },
  { type: 'ReconciliationRequired', trigger: 'ManagedCommitmentRecord.reconciliationStatus = ConflictRequiresReview', assignee: 'PM' },
  { type: 'PublicationPendingReview', trigger: 'PublicationRecord.lifecycleStatus = ReadyForReview', assignee: 'PE' },
  { type: 'ProgressVerificationRequired', trigger: 'ProgressClaimRecord.verificationStatus = Pending', assignee: 'Designated verifier' },
  { type: 'ConfidenceCollapsed', trigger: 'ConfidenceRecord.overallConfidenceLabel = VeryLow', assignee: 'PM + PE' },
  { type: 'SyncConflictRequiresReview', trigger: 'IntentRecord.replayStatus = ConflictRequiresReview', assignee: 'Originating user' },
  { type: 'ScheduleStalenessWarning', trigger: 'Days since last active import exceeds governed threshold', assignee: 'PM' },
];

export const SCHEDULE_NOTIFICATION_CONFIGS: ReadonlyArray<IScheduleNotificationConfig> = [
  { type: 'MilestoneCriticalAlert', defaultTrigger: 'milestone.status = Critical', channel: 'Push + email' },
  { type: 'ScheduleSlippageAlert', defaultTrigger: 'varianceDays > governed threshold', channel: 'Push' },
  { type: 'ConfidenceCollapseAlert', defaultTrigger: 'confidenceScore < governed threshold', channel: 'Push + email (PM + PE)' },
  { type: 'BlockerCriticalUnresolved', defaultTrigger: 'Blocking blocker open > governed days', channel: 'Push' },
  { type: 'CommitmentOverdue', defaultTrigger: 'commitment.committedDate passed; status ≠ Kept', channel: 'Push' },
  { type: 'PublicationStalenessAlert', defaultTrigger: 'Days since last Published > governed threshold', channel: 'Email' },
];

export const SCHEDULE_COMPLEXITY_TIER_CONFIGS: ReadonlyArray<IScheduleComplexityTierConfig> = [
  { tier: 'Essential', label: 'Essential', features: ['Milestone status', 'Overall schedule health', 'Next milestone', 'Primary variance'] },
  { tier: 'Standard', label: 'Standard', features: ['Activity list', 'Float indicators', 'Commitment summary', 'Blocker count', 'Confidence label'] },
  { tier: 'Expert', label: 'Expert', features: ['Full analytics', 'Grading controls', 'Confidence factor breakdown', 'Slippage trends', 'Forensic comparison', 'Scenario comparison', 'Logic layer detail', 'Work-package roll-up detail'] },
];

export const SCHEDULE_ANNOTATABLE_SURFACE_CONFIGS: ReadonlyArray<IAnnotatableFieldConfig> = [
  { surface: 'PublishedActivitySnapshot', annotatableFields: ['publishedFinishDate', 'varianceFromBaselineDays', 'reconciliationStatus'] },
  { surface: 'MilestoneRecord', annotatableFields: ['forecastDate', 'varianceDays', 'status'] },
  { surface: 'PublicationRecord', annotatableFields: ['reconciliationSummary', 'publishBasisNotes'] },
  { surface: 'ScheduleSummaryProjection', annotatableFields: ['overallStatus', 'varianceDays', 'confidenceLabel'] },
  { surface: 'ConfidenceRecord', annotatableFields: ['factorScores'] },
];

export const SCHEDULE_POLICY_AREAS: ReadonlyArray<IGovernedPolicyArea> = [
  { area: 'CommitmentApprovalThresholds', description: 'Variance magnitude requiring PE approval; separate thresholds by commitment type' },
  { area: 'PublicationApprovalRules', description: 'Required review roles; auto-publish criteria; publish blocker definitions' },
  { area: 'MilestoneStatusThresholds', description: 'AtRisk and Delayed variance day thresholds' },
  { area: 'OverallStatusThresholds', description: 'Variance day thresholds for schedule summary' },
  { area: 'FloatNearCriticalThreshold', description: 'Hours below which an activity is near-critical' },
  { area: 'CriticalityIndexBands', description: 'Score thresholds for critical / near-critical / standard display' },
  { area: 'ConfidenceFactorWeights', description: 'Per-factor weights and label thresholds' },
  { area: 'GradingControls', description: 'Control thresholds, weights, and inclusion rules' },
  { area: 'LookAheadWindowLength', description: 'Default week span for LookAheadPlan' },
  { area: 'ReadinessDimensionSet', description: 'Which dimensions are required per work type' },
  { area: 'ProgressBasisAssignments', description: 'Progress basis method per activity code or trade' },
  { area: 'CausationTaxonomy', description: 'Codes, labels, hierarchy, and applicability rules' },
  { area: 'LocationHierarchyTemplate', description: 'Default location node hierarchy' },
  { area: 'CalendarRules', description: 'Source and operating calendar definitions' },
  { area: 'NotificationThresholds', description: 'All trigger thresholds for notifications' },
  { area: 'VisibilityPolicies', description: 'Sensitivity classes, external participant rules' },
  { area: 'EscalationRules', description: 'Overdue windows, escalation routing' },
  { area: 'AutoPublishCriteria', description: 'Conditions under which auto-publish is permitted' },
  { area: 'PPCRollingWindow', description: 'Number of look-ahead windows included in rolling PPC' },
  { area: 'RollUpRules', description: 'Progress weighting, sensitivity thresholds' },
];

// ══════════════════════════════════════════════════════════════════════
// T10: Business Rules, Capabilities, and Reference (§21, §22, §27, §28)
// ══════════════════════════════════════════════════════════════════════

// ── §21.1 Commitment Approval Thresholds ─────────────────────────────

export const DEFAULT_COMMITMENT_APPROVAL_THRESHOLDS: ReadonlyArray<ICommitmentApprovalThreshold> = [
  { commitmentType: 'ActivityForecast', thresholdDays: 5 },
  { commitmentType: 'MilestoneCommitment', thresholdDays: 3 },
  { commitmentType: 'CompletionForecast', thresholdDays: 1 },
];

// ── §21.2 Duration Conversion ────────────────────────────────────────

export const DEFAULT_HOURS_PER_DAY = 8;

// ── §21.3 Auto-Publish Criteria Keys ─────────────────────────────────

export const AUTO_PUBLISH_CRITERIA_KEYS: ReadonlyArray<keyof IAutoPublishCriteria> = [
  'noHardPublishBlockers', 'overallStatusOnTrackOrAtRisk', 'confidenceLabelHighOrModerate',
  'noConflictRequiresReviewMilestones', 'sourceWithinFreshnessWindow', 'lifecycleTransitionValid',
];

// ── §21.6 Staleness ──────────────────────────────────────────────────

export const DEFAULT_STALENESS_THRESHOLD_DAYS = 30;

// ── §21.10 PPC ───────────────────────────────────────────────────────

export const DEFAULT_PPC_ROLLING_WINDOW = 4;

// ── §21.9 / §27 Intent Replay Statuses ───────────────────────────────

export const INTENT_REPLAY_STATUSES = [
  'Pending', 'Queued', 'Replayed', 'ConflictRequiresReview', 'Failed',
] as const satisfies ReadonlyArray<IntentReplayStatus>;

// ── §22 Required Capabilities ────────────────────────────────────────

export const SCHEDULE_CAPABILITIES: ReadonlyArray<IScheduleCapabilityConfig> = [
  { capability: 'ScheduleFileIngestion', description: 'Upload and parse XER/XML/CSV schedule files', dependencies: ['T01'] },
  { capability: 'MultiBaselineManagement', description: 'Establish, approve, and manage multiple governed baselines', dependencies: ['T01'] },
  { capability: 'CommitmentManagement', description: 'PM sets working dates with causation codes and approval workflow', dependencies: ['T02'] },
  { capability: 'PublicationWorkflow', description: 'Draft/review/publish lifecycle with PE approval gate', dependencies: ['T03'] },
  { capability: 'FieldExecutionLayer', description: 'Work packages, commitments, blockers, readiness, look-ahead, PPC', dependencies: ['T05'] },
  { capability: 'ScenarioBranchManagement', description: 'Create, review, and promote alternative schedule scenarios', dependencies: ['T04'] },
  { capability: 'AnalyticsAndIntelligence', description: 'Quality grading, float analysis, confidence scoring, recommendations', dependencies: ['T07'] },
  { capability: 'OfflineFirstFieldExecution', description: 'Intent queue, sync state, conflict resolution for field records', dependencies: ['T05', 'T08'] },
  { capability: 'ExportViaExportRuntime', description: 'Published forecast, milestone, commitment, blocker exports', dependencies: ['T09', 'SF24'] },
  { capability: 'LinkedArtifactGraph', description: 'Typed relationships to RFIs, submittals, permits, etc.', dependencies: ['T09'] },
  { capability: 'HealthSpineAndCanvasTile', description: 'Schedule summary projection for health spine and canvas', dependencies: ['T03', 'T09'] },
  { capability: 'WorkFeedNotificationRegistration', description: 'Work items and notification event registration', dependencies: ['T09'] },
];

// ── §28 Authority Layers ─────────────────────────────────────────────

export const SCHEDULE_AUTHORITY_LAYERS = [
  'MasterSchedule', 'Operating', 'PublishedForecast', 'Scenario',
  'FieldExecution', 'Analytics', 'Governance', 'CrossLayer', 'OfflineSync', 'HealthSpine',
] as const satisfies ReadonlyArray<ScheduleAuthorityLayer>;

// ── §28 Field Summary Index ──────────────────────────────────────────

export const FIELD_SUMMARY_INDEX: ReadonlyArray<IFieldSummaryEntry> = [
  { recordType: 'CanonicalScheduleSource', section: '1.1', primaryKey: 'sourceId', authorityLayer: 'MasterSchedule' },
  { recordType: 'ScheduleVersionRecord', section: '1.2', primaryKey: 'versionId', authorityLayer: 'MasterSchedule' },
  { recordType: 'BaselineRecord', section: '1.3', primaryKey: 'baselineId', authorityLayer: 'MasterSchedule' },
  { recordType: 'ImportedActivitySnapshot', section: '1.4', primaryKey: 'snapshotId', authorityLayer: 'MasterSchedule' },
  { recordType: 'ActivityContinuityLink', section: '1.5', primaryKey: 'continuityId', authorityLayer: 'MasterSchedule' },
  { recordType: 'ImportedRelationshipRecord', section: '10.2', primaryKey: 'relationshipId', authorityLayer: 'MasterSchedule' },
  { recordType: 'ManagedCommitmentRecord', section: '2.1', primaryKey: 'commitmentId', authorityLayer: 'Operating' },
  { recordType: 'ReconciliationRecord', section: '2.2', primaryKey: 'reconciliationId', authorityLayer: 'Operating' },
  { recordType: 'PublicationRecord', section: '3.1', primaryKey: 'publicationId', authorityLayer: 'PublishedForecast' },
  { recordType: 'PublishedActivitySnapshot', section: '3.3', primaryKey: 'publishedSnapshotId', authorityLayer: 'PublishedForecast' },
  { recordType: 'MilestoneRecord', section: '4.2', primaryKey: 'milestoneId', authorityLayer: 'Operating' },
  { recordType: 'ScenarioBranch', section: '5.1', primaryKey: 'scenarioId', authorityLayer: 'Scenario' },
  { recordType: 'ScenarioActivityRecord', section: '5.2', primaryKey: 'scenarioActivityId', authorityLayer: 'Scenario' },
  { recordType: 'ScenarioLogicRecord', section: '5.3', primaryKey: 'scenarioLogicId', authorityLayer: 'Scenario' },
  { recordType: 'FieldWorkPackage', section: '6.1', primaryKey: 'workPackageId', authorityLayer: 'FieldExecution' },
  { recordType: 'LocationNode', section: '6.2', primaryKey: 'locationId', authorityLayer: 'FieldExecution' },
  { recordType: 'CommitmentRecord', section: '6.3', primaryKey: 'commitmentId', authorityLayer: 'FieldExecution' },
  { recordType: 'BlockerRecord', section: '6.4', primaryKey: 'blockerId', authorityLayer: 'FieldExecution' },
  { recordType: 'ReadinessRecord', section: '6.5', primaryKey: 'readinessId', authorityLayer: 'FieldExecution' },
  { recordType: 'LookAheadPlan', section: '6.6', primaryKey: 'lookAheadId', authorityLayer: 'FieldExecution' },
  { recordType: 'AcknowledgementRecord', section: '7.1', primaryKey: 'ackId', authorityLayer: 'CrossLayer' },
  { recordType: 'ProgressClaimRecord', section: '8.1', primaryKey: 'claimId', authorityLayer: 'FieldExecution' },
  { recordType: 'ProgressVerificationRecord', section: '8.2', primaryKey: 'verificationId', authorityLayer: 'FieldExecution' },
  { recordType: 'WorkPackageLinkRecord', section: '10.3', primaryKey: 'linkId', authorityLayer: 'FieldExecution' },
  { recordType: 'ScheduleQualityGrade', section: '11.1', primaryKey: 'gradeId', authorityLayer: 'Analytics' },
  { recordType: 'FloatPathSnapshot', section: '11.2', primaryKey: 'floatSnapshotId', authorityLayer: 'Analytics' },
  { recordType: 'MilestoneSlippageTrend', section: '11.3', primaryKey: 'trendId', authorityLayer: 'Analytics' },
  { recordType: 'ConfidenceRecord', section: '11.4', primaryKey: 'confidenceId', authorityLayer: 'Analytics' },
  { recordType: 'RecommendationRecord', section: '12.1', primaryKey: 'recommendationId', authorityLayer: 'Analytics' },
  { recordType: 'CausationCode', section: '13.1', primaryKey: 'codeId', authorityLayer: 'Governance' },
  { recordType: 'IntentRecord', section: '15.1', primaryKey: 'intentId', authorityLayer: 'OfflineSync' },
  { recordType: 'CalendarRule', section: '17.2', primaryKey: 'calendarRuleId', authorityLayer: 'Governance' },
  { recordType: 'ScheduleSummaryProjection', section: '19.1', primaryKey: 'summaryId', authorityLayer: 'HealthSpine' },
];

// ══════════════════════════════════════════════════════════════════════
// T08: Classification, Metadata, Offline, and Sync (§14, §15, §16)
// ══════════════════════════════════════════════════════════════════════

export const CLASSIFICATION_DIMENSIONS: ReadonlyArray<IClassificationMapping> = [
  { dimension: 'WBSCode', source: 'P6 wbs_id / wbs_name', governedMapping: 'Preserved; mapped to HB WBS structure if configured' },
  { dimension: 'ActivityCodes', source: 'P6 activity code types', governedMapping: 'Mapped to governed code categories' },
  { dimension: 'UDFValues', source: 'P6 user-defined fields', governedMapping: 'Mapped to typed classification fields' },
  { dimension: 'TradeCode', source: 'Activity code or UDF', governedMapping: 'Governed mapping table' },
  { dimension: 'PhaseCode', source: 'Activity code or UDF', governedMapping: 'Governed mapping table' },
  { dimension: 'AreaCode', source: 'Activity code, UDF, or location', governedMapping: 'Governed mapping table' },
  { dimension: 'ContractMilestoneFlag', source: 'Activity code or UDF', governedMapping: 'Boolean flag per governed rule' },
  { dimension: 'Responsibility', source: 'Resource or UDF', governedMapping: 'Mapped to HB user/role' },
];

export const CLASSIFICATION_USAGE_CONTEXTS = [
  'Filtering', 'AnalyticsSegmentation', 'WorkPackageDefaultPopulation',
  'VisibilityPolicyEnforcement', 'RecommendationLogicInput', 'RollUpDimension',
] as const satisfies ReadonlyArray<ClassificationUsageContext>;

export const INTENT_OPERATION_TYPES = [
  'Create', 'Update', 'StatusChange', 'LinkArtifact',
] as const satisfies ReadonlyArray<IntentOperationType>;

export const INTENT_RECORD_TYPES = [
  'FieldWorkPackage', 'CommitmentRecord', 'BlockerRecord', 'ReadinessRecord',
  'ProgressClaimRecord', 'AcknowledgementRecord', 'LookAheadPlan',
] as const satisfies ReadonlyArray<IntentRecordType>;

export const CONFLICT_RESOLUTION_RULES: ReadonlyArray<IConflictResolutionRule> = [
  { conflictType: 'NonGovernedFieldUpdate', resolution: 'Last-write-wins; both values preserved in audit' },
  { conflictType: 'GovernedStatusChange', resolution: 'Server state wins; user notified; intent preserved for manual review' },
  { conflictType: 'CommitmentDatePendingApproval', resolution: 'Conflict routed to PM for manual reconciliation' },
  { conflictType: 'CreateWithClientId', resolution: 'ID regenerated server-side if collision; client map updated' },
];

export const VISIBILITY_POLICY_DIMENSIONS = [
  'InternalExternal', 'LiveVsPublished', 'SensitiveInternalSignals',
  'FieldRecordByTrade', 'RecommendationVisibility', 'ConfidenceScoreVisibility',
] as const satisfies ReadonlyArray<VisibilityPolicyDimension>;

/** Hard visibility rules that cannot be overridden (§16.1). */
export const VISIBILITY_HARD_RULES = [
  'External participants never see Draft or ReadyForReview publication records',
  'External participants never see ConfidenceRecords or RecommendationRecords unless explicitly enabled',
  'Executive review operates exclusively against Published publication records',
  'PM-owned draft commitments and working scenarios are never visible to PER',
] as const;

export const EXTERNAL_PARTICIPANT_WORKFLOWS = [
  'FieldCommitment', 'BlockerResolution', 'ReadinessConfirmation', 'LookAheadReview',
] as const satisfies ReadonlyArray<ExternalParticipantWorkflow>;
