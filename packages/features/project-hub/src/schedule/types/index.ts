/**
 * P3-E5 public contracts for Schedule module.
 * T01: source identity, versioning, import snapshot, dual-calendar model.
 *
 * Every type here maps 1:1 to the field tables in P3-E5-T01.
 */

// ── §1.1 CanonicalScheduleSource ─────────────────────────────────────

/** CPM tool type for a schedule source registration (§1.1). */
export type ScheduleSourceSystem =
  | 'PrimaveraP6'
  | 'MSProject'
  | 'Asta'
  | 'Oracle'
  | 'Other';

/** Who is responsible for keeping the schedule source current (§1.1, Ownership Maturity Model). */
export type ScheduleSourceOwnerRole =
  | 'PM'
  | 'Scheduler'
  | 'PE';

/** Identity record for one master schedule source per project (§1.1). */
export interface ICanonicalScheduleSource {
  readonly sourceId: string;
  readonly projectId: string;
  readonly sourceName: string;
  readonly sourceSystem: ScheduleSourceSystem;
  readonly isCanonical: boolean;
  readonly sourceOwnerRole: ScheduleSourceOwnerRole;
  readonly registeredBy: string;
  readonly registeredAt: string;
  readonly promotedToCanonicalAt: string | null;
  readonly promotedBy: string | null;
  readonly deregisteredAt: string | null;
  readonly notes: string | null;
}

// ── §1.2 ScheduleVersionRecord ───────────────────────────────────────

/** Import file format (§1.2). */
export type ScheduleImportFormat = 'XER' | 'XML' | 'CSV';

/**
 * Version lifecycle status (§1.2).
 * Processing → Parsed → Active → Superseded.
 * Failed is a terminal parse error state. Secondary is for non-canonical sources.
 */
export type ScheduleVersionStatus =
  | 'Processing'
  | 'Parsed'
  | 'Active'
  | 'Superseded'
  | 'Failed'
  | 'Secondary';

/** Frozen, immutable dated update snapshot (§1.2). No import overwrites prior data. */
export interface IScheduleVersionRecord {
  readonly versionId: string;
  readonly projectId: string;
  readonly sourceId: string;
  readonly versionLabel: string;
  readonly dataDate: string;
  readonly importedBy: string;
  readonly importedAt: string;
  readonly format: ScheduleImportFormat;
  readonly originalFilename: string;
  readonly fileStorageRef: string;
  readonly activityCount: number;
  readonly milestoneCount: number;
  readonly status: ScheduleVersionStatus;
  readonly isCanonicalVersion: boolean;
  readonly supersededAt: string | null;
  readonly supersededBy: string | null;
  readonly activatedAt: string | null;
  readonly parentVersionId: string | null;
  readonly validationWarnings: ReadonlyArray<string>;
  readonly validationErrors: ReadonlyArray<string>;
}

// ── §1.3 BaselineRecord ──────────────────────────────────────────────

/** Baseline type classification (§1.3). */
export type BaselineType =
  | 'ContractBaseline'
  | 'ApprovedRevision'
  | 'RecoveryBaseline'
  | 'Scenario';

/** Governed baseline record — frozen at approval, never modified (§1.3). */
export interface IBaselineRecord {
  readonly baselineId: string;
  readonly projectId: string;
  readonly baselineLabel: string;
  readonly baselineType: BaselineType;
  readonly sourceVersionId: string;
  readonly dataDate: string;
  readonly approvedBy: string;
  readonly approvedAt: string;
  readonly approvalBasis: string;
  readonly causationCode: string | null;
  readonly isPrimary: boolean;
  readonly supersededAt: string | null;
  readonly supersededBy: string | null;
}

// ── §1.4 ImportedActivitySnapshot ────────────────────────────────────

/** CPM activity type from source tool (§1.4). */
export type ScheduleActivityType =
  | 'TT_Task'
  | 'TT_Mile'
  | 'TT_LOE'
  | 'TT_FinMile'
  | 'TT_WBS';

/** Activity status from source tool (§1.4). */
export type ScheduleStatusCode =
  | 'TK_NotStart'
  | 'TK_Active'
  | 'TK_Complete';

/** Constraint type enumeration per §1.4.1. */
export type ScheduleConstraintType =
  | 'CS_MSOA'
  | 'CS_MFOA'
  | 'CS_MSON'
  | 'CS_MFON'
  | 'CS_SNLF'
  | 'CS_FNLF'
  | 'CS_MEOA'
  | 'CS_MEON';

/** Basis for percent complete calculation (§1.4). */
export type PercentCompleteBasis =
  | 'Duration'
  | 'Physical'
  | 'Units'
  | 'Manual';

/** Predecessor/successor relationship reference (§1.4). */
export interface IRelationshipRef {
  readonly activityCode: string;
  readonly relationshipType: string;
  readonly lagHrs: number;
}

/** Resource assignment reference (§1.4). */
export interface IResourceRef {
  readonly resourceCode: string;
  readonly resourceName: string;
  readonly role: string;
}

/** Activity code value from P6 activity codes (§1.4 classification). */
export interface IActivityCodeValue {
  readonly codeType: string;
  readonly codeValue: string;
  readonly codeDescription: string;
}

/** User-defined field value from source tool (§1.4 classification). */
export interface IUDFValue {
  readonly fieldName: string;
  readonly fieldType: string;
  readonly value: string;
}

/**
 * Immutable snapshot of one activity from one import version (§1.4).
 * Never modified after import. Cross-version identity via externalActivityKey.
 */
export interface IImportedActivitySnapshot {
  readonly snapshotId: string;
  readonly versionId: string;
  readonly projectId: string;
  readonly externalActivityKey: string;
  readonly sourceActivityCode: string;
  readonly activityName: string;
  readonly activityType: ScheduleActivityType;
  readonly statusCode: ScheduleStatusCode;
  readonly wbsCode: string | null;
  readonly wbsName: string | null;
  readonly targetDurationHrs: number;
  readonly remainingDurationHrs: number;
  readonly actualDurationHrs: number;
  readonly baselineStartDate: string | null;
  readonly baselineFinishDate: string | null;
  readonly targetStartDate: string;
  readonly targetFinishDate: string;
  readonly actualStartDate: string | null;
  readonly actualFinishDate: string | null;
  readonly totalFloatHrs: number;
  readonly freeFloatHrs: number | null;
  readonly percentComplete: number;
  readonly percentCompleteBasis: PercentCompleteBasis;
  readonly calendarId: string | null;
  readonly calendarName: string | null;
  readonly constraintType1: ScheduleConstraintType | null;
  readonly constraintDate1: string | null;
  readonly constraintType2: ScheduleConstraintType | null;
  readonly constraintDate2: string | null;
  readonly predecessors: ReadonlyArray<IRelationshipRef>;
  readonly successors: ReadonlyArray<IRelationshipRef>;
  readonly resources: ReadonlyArray<IResourceRef>;
  readonly deleteFlag: boolean;
  readonly importedAt: string;
  // Classification fields preserved from source (§1.4)
  readonly activityCodeValues: ReadonlyArray<IActivityCodeValue>;
  readonly udfValues: ReadonlyArray<IUDFValue>;
  readonly primaryResourceCode: string | null;
  readonly primaryResponsibleUserId: string | null;
  readonly tradeCode: string | null;
  readonly phaseCode: string | null;
  readonly areaCode: string | null;
  readonly contractMilestoneFlag: boolean;
}

// ── §1.5 ActivityContinuityLink ──────────────────────────────────────

/**
 * Durable cross-version identity connection for a logical activity (§1.5).
 * Enables forensic comparison, scenario branching, and cross-version analytics.
 */
export interface IActivityContinuityLink {
  readonly continuityId: string;
  readonly projectId: string;
  readonly externalActivityKey: string;
  readonly snapshotIds: ReadonlyArray<string>;
  readonly firstSeenVersionId: string;
  readonly lastSeenVersionId: string;
  readonly isActive: boolean;
  readonly splitFromKey: string | null;
  readonly mergedIntoKey: string | null;
}

// ── §1.6 Import Validation ───────────────────────────────────────────

/** Severity classification for import validation checks (§1.6). */
export type ImportValidationSeverity = 'error' | 'warning' | 'informational';

/** A single import validation rule definition (§1.6). */
export interface IImportValidationRule {
  readonly check: string;
  readonly severity: ImportValidationSeverity;
  readonly behavior: string;
}

/** Result of applying one validation rule to an import. */
export interface IImportValidationResult {
  readonly passed: boolean;
  readonly rule: IImportValidationRule;
  readonly message: string;
}

// ── §17 Dual-Calendar Model ─────────────────────────────────────────

/** Calendar type discrimination (§17.1). */
export type CalendarType = 'SourceCalendar' | 'OperatingCalendar';

/** Holiday or non-work date exception. */
export interface ICalendarException {
  readonly date: string;
  readonly description: string;
}

/** Governed calendar rule record (§17.2). */
export interface ICalendarRule {
  readonly calendarRuleId: string;
  readonly projectId: string;
  readonly calendarType: CalendarType;
  readonly calendarName: string;
  readonly hoursPerDay: number;
  readonly workDays: ReadonlyArray<number>;
  readonly exceptions: ReadonlyArray<ICalendarException>;
  readonly effectiveFrom: string;
  readonly effectiveTo: string | null;
  readonly createdBy: string;
  readonly createdAt: string;
}

// ── Integration Boundary Contracts ───────────────────────────────────

/** Direction of data flow at the Schedule module integration boundary. */
export type ScheduleIntegrationDirection = 'inbound' | 'outbound';

export interface IScheduleIntegrationBoundary {
  readonly key: string;
  readonly direction: ScheduleIntegrationDirection;
  readonly source: string;
  readonly target: string;
  readonly description: string;
  readonly status: 'active' | 'planned';
}

// ── Authority Model Contracts ────────────────────────────────────────

/**
 * Schedule module authority roles (P3-E5 Operating Model + P3-E2 §4).
 * Domain-scoped roles resolved from the app-level auth context.
 */
export type ScheduleAuthorityRole =
  | 'PM'
  | 'PE'
  | 'Scheduler'
  | 'Superintendent'
  | 'Foreman'
  | 'MOE';

/** Schedule operating model layers (P3-E5 master). */
export type ScheduleLayerAccess =
  | 'master-schedule'
  | 'operating'
  | 'field-execution'
  | 'published-forecast';

/** Schedule access action types. */
export type ScheduleAccessAction =
  | 'read'
  | 'write'
  | 'approve'
  | 'configure'
  | 'publish';

export interface IScheduleAccessQuery {
  readonly role: ScheduleAuthorityRole;
  readonly layer: ScheduleLayerAccess;
}

export interface IScheduleAccessResult {
  readonly allowed: ReadonlyArray<ScheduleAccessAction>;
  readonly denied: ReadonlyArray<ScheduleAccessAction>;
  readonly hidden: boolean;
}

// ── Governance Validation Result Types ───────────────────────────────

export interface ICanonicalSourceValidation {
  readonly valid: boolean;
  readonly violations: ReadonlyArray<string>;
}

export interface IVersionActivationValidation {
  readonly canActivate: boolean;
  readonly blockers: ReadonlyArray<string>;
}

export interface IBaselineApprovalValidation {
  readonly canApprove: boolean;
  readonly blockers: ReadonlyArray<string>;
}

export interface ICalendarDivergenceResult {
  readonly diverges: boolean;
  readonly deltas: ReadonlyArray<string>;
}

// ══════════════════════════════════════════════════════════════════════
// T02: Dual-Truth Commitments and Milestones (§2, §4)
// ══════════════════════════════════════════════════════════════════════

// ── §2.1 ManagedCommitmentRecord ─────────────────────────────────────

/** Commitment type classification (§2.1). */
export type CommitmentType =
  | 'ActivityForecast'
  | 'MilestoneCommitment'
  | 'CompletionForecast';

/**
 * Reconciliation status between managed commitment and source truth (§2.1).
 * Workflow states: PendingApproval → Approved | Rejected.
 */
export type ReconciliationStatus =
  | 'Aligned'
  | 'PMOverride'
  | 'SourceAhead'
  | 'ConflictRequiresReview'
  | 'PendingApproval'
  | 'Approved'
  | 'Rejected';

/**
 * PM-owned working position for an activity or milestone (§2.1).
 * The operating layer's "live" view and basis for publication when promoted.
 */
export interface IManagedCommitmentRecord {
  readonly commitmentId: string;
  readonly projectId: string;
  readonly externalActivityKey: string;
  readonly sourceVersionId: string;
  readonly commitmentType: CommitmentType;
  readonly sourceStartDate: string;
  readonly sourceFinishDate: string;
  readonly committedStartDate: string | null;
  readonly committedFinishDate: string | null;
  readonly startVarianceDays: number | null;
  readonly finishVarianceDays: number | null;
  readonly reconciliationStatus: ReconciliationStatus;
  readonly primaryCausationCode: string | null;
  readonly causationCodes: ReadonlyArray<string>;
  readonly explanation: string | null;
  readonly confidenceNote: string | null;
  readonly approvalRequired: boolean;
  readonly approvedBy: string | null;
  readonly approvedAt: string | null;
  readonly rejectionReason: string | null;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly lastModifiedBy: string | null;
  readonly lastModifiedAt: string | null;
}

// ── §2.2 ReconciliationRecord ────────────────────────────────────────

/** What triggered a reconciliation status change (§2.2). */
export type ReconciliationTrigger =
  | 'SourceImport'
  | 'PMEdit'
  | 'PEApproval'
  | 'PERejection'
  | 'System';

/** Timestamped audit entry for reconciliation status transitions (§2.2). */
export interface IReconciliationRecord {
  readonly reconciliationId: string;
  readonly commitmentId: string;
  readonly projectId: string;
  readonly priorStatus: ReconciliationStatus;
  readonly newStatus: ReconciliationStatus;
  readonly priorCommittedFinish: string | null;
  readonly newCommittedFinish: string | null;
  readonly sourceVersionId: string;
  readonly triggeredBy: ReconciliationTrigger;
  readonly causationCode: string | null;
  readonly explanation: string | null;
  readonly createdAt: string;
  readonly createdBy: string;
}

// ── §4 Milestone Working Model ───────────────────────────────────────

/** Milestone type classification (§4.4). */
export type MilestoneType =
  | 'ContractCompletion'
  | 'SubstantialCompletion'
  | 'OwnerMilestone'
  | 'HBInternal'
  | 'SubMilestone'
  | 'Permit'
  | 'Inspection'
  | 'Custom';

/**
 * Calculated milestone status (§4.3). Never stored; recalculated on each load.
 * Governed thresholds determine AtRisk/Delayed/Critical boundaries.
 */
export type MilestoneStatus =
  | 'NotStarted'
  | 'OnTrack'
  | 'AtRisk'
  | 'Delayed'
  | 'Critical'
  | 'Achieved'
  | 'Superseded';

/**
 * View-projection record combining ImportedActivitySnapshot + ManagedCommitmentRecord
 * for milestone-specific display, tracking, and publication surfaces (§4.2).
 */
export interface IMilestoneRecord {
  readonly milestoneId: string;
  readonly projectId: string;
  readonly externalActivityKey: string;
  readonly activeSnapshotId: string;
  readonly milestoneName: string;
  readonly milestoneType: MilestoneType;
  readonly isMilestoneOverride: boolean;
  readonly isManual: boolean;
  readonly baselineFinishDate: string | null;
  readonly approvedExtensionDays: number;
  readonly revisedBaselineDate: string | null;
  readonly sourceFinishDate: string;
  readonly committedFinishDate: string | null;
  readonly forecastDate: string;
  readonly actualDate: string | null;
  readonly verificationStatus: string | null;
  readonly status: MilestoneStatus;
  readonly varianceDays: number;
  readonly isCriticalPath: boolean;
  readonly totalFloatHrs: number | null;
  readonly contractMilestoneFlag: boolean;
  readonly notes: string | null;
  readonly createdAt: string;
  readonly createdBy: string;
}

// ── T02 Governance Config Types ──────────────────────────────────────

/** Governed milestone status thresholds (§4.3). Configured by Manager of Operational Excellence. */
export interface IMilestoneThresholdConfig {
  readonly atRiskThresholdDays: number;
  readonly delayedThresholdDays: number;
}

/** Input for resolveReconciliationStatus function. */
export interface IReconciliationStatusInput {
  readonly committedStartDate: string | null;
  readonly committedFinishDate: string | null;
  readonly sourceStartDate: string;
  readonly sourceFinishDate: string;
  readonly finishVarianceDays: number | null;
  readonly approvalRequired: boolean;
  readonly approvedBy: string | null;
  readonly rejectionReason: string | null;
}

/** Milestone status display mapping (§4.3 UI table). */
export interface IMilestoneStatusDisplay {
  readonly status: MilestoneStatus;
  readonly uiSignal: string;
  readonly color: string;
}

// ══════════════════════════════════════════════════════════════════════
// T03: Publication Layer (§3, §19)
// ══════════════════════════════════════════════════════════════════════

// ── §3.1 PublicationRecord ───────────────────────────────────────────

/** Publication type classification (§3.1). */
export type PublicationType =
  | 'MonthlyUpdate'
  | 'MilestoneReview'
  | 'IssueUpdate'
  | 'RecoveryPlan'
  | 'BaselineEstablishment'
  | 'AutoPublish';

/** Publication lifecycle status (§3.1). Draft → ReadyForReview → Published → Superseded. */
export type PublicationLifecycleStatus =
  | 'Draft'
  | 'ReadyForReview'
  | 'Published'
  | 'Superseded';

/** Who initiated the publication — aligns with Ownership Maturity Model. */
export type PublicationInitiatorRole = 'PM' | 'Scheduler' | 'PE';

/**
 * Stage-gated publication record (§3.1).
 * Only one Published publication per project at a time.
 */
export interface IPublicationRecord {
  readonly publicationId: string;
  readonly projectId: string;
  readonly publicationLabel: string;
  readonly publicationType: PublicationType;
  readonly sourceVersionId: string;
  readonly baselineId: string;
  readonly lifecycleStatus: PublicationLifecycleStatus;
  readonly initiatedBy: string;
  readonly initiatedByRole: PublicationInitiatorRole;
  readonly submittedForReviewAt: string | null;
  readonly reviewedBy: string | null;
  readonly reviewedAt: string | null;
  readonly publishedAt: string | null;
  readonly supersededAt: string | null;
  readonly supersededBy: string | null;
  readonly reconciliationSummary: string | null;
  readonly publishBasisNotes: string | null;
  readonly autoPublishEligible: boolean;
  readonly autoPublishedAt: string | null;
  readonly blockers: ReadonlyArray<IPublishBlocker>;
  readonly confidenceRecordId: string | null;
}

// ── §3.2 PublicationBlocker ──────────────────────────────────────────

/** Blocker severity: Hard must be resolved; Soft is a PE-overridable warning (§3.2). */
export type PublishBlockerSeverity = 'Hard' | 'Soft';

/** Governed condition gating publication advancement (§3.2). */
export interface IPublishBlocker {
  readonly blockerCode: string;
  readonly blockerDescription: string;
  readonly severity: PublishBlockerSeverity;
  readonly resolvedAt: string | null;
}

// ── §3.3 PublishedActivitySnapshot ───────────────────────────────────

/**
 * Frozen point-in-time copy of activity state at publication (§3.3).
 * Combines source truth with managed commitments. Never modified after creation.
 */
export interface IPublishedActivitySnapshot {
  readonly publishedSnapshotId: string;
  readonly publicationId: string;
  readonly externalActivityKey: string;
  readonly sourceActivityCode: string;
  readonly activityName: string;
  readonly publishedStartDate: string;
  readonly publishedFinishDate: string;
  readonly publishedPercentComplete: number;
  readonly varianceFromBaselineDays: number;
  readonly sourceFinishDate: string;
  readonly committedFinishDate: string | null;
  readonly reconciliationStatus: ReconciliationStatus;
  readonly isCriticalPath: boolean;
  readonly isMilestone: boolean;
}

// ── §19 Schedule Summary Projection ─────────────────────────────────

/** Overall schedule status for health spine (§19.2). */
export type ScheduleOverallStatus =
  | 'OnTrack'
  | 'AtRisk'
  | 'Delayed'
  | 'Critical';

/** Aggregate milestone status counts (§19.1). */
export interface IMilestoneSummary {
  readonly total: number;
  readonly achieved: number;
  readonly onTrack: number;
  readonly atRisk: number;
  readonly delayed: number;
  readonly critical: number;
  readonly notStarted: number;
}

/** Next upcoming milestone reference (§19.1). */
export interface INextMilestoneRef {
  readonly milestoneName: string;
  readonly publishedForecastDate: string;
  readonly varianceDays: number;
  readonly status: MilestoneStatus;
}

/**
 * Normalized snapshot for health spine and canvas tile (§19.1).
 * Derived exclusively from the most recent Published PublicationRecord.
 */
export interface IScheduleSummaryProjection {
  readonly summaryId: string;
  readonly projectId: string;
  readonly sourcePublicationId: string;
  readonly computedAt: string;
  readonly overallStatus: ScheduleOverallStatus;
  readonly schedulePercentComplete: number;
  readonly contractCompletionDate: string;
  readonly publishedCompletionDate: string;
  readonly varianceDays: number;
  readonly criticalPathActivityCount: number;
  readonly nearCriticalActivityCount: number;
  readonly confidenceLabel: string;
  readonly milestoneSummary: IMilestoneSummary;
  readonly nextMilestone: INextMilestoneRef | null;
  readonly qualityGrade: string | null;
}

// ── T03 Config Types ─────────────────────────────────────────────────

/** Governed thresholds for schedule summary overall status (§19.2). */
export interface IScheduleSummaryThresholdConfig {
  readonly atRiskThresholdDays: number;
  readonly delayedThresholdDays: number;
  readonly criticalThresholdDays: number;
}

/** Result of validating a publication lifecycle advance. */
export interface IPublicationValidationResult {
  readonly canAdvance: boolean;
  readonly blockers: ReadonlyArray<string>;
}

// ══════════════════════════════════════════════════════════════════════
// T04: Scenario Branch Model (§5)
// ══════════════════════════════════════════════════════════════════════

// ── §5.1 ScenarioBranch ──────────────────────────────────────────────

/** Scenario type classification (§5.1). */
export type ScenarioType =
  | 'RecoverySchedule'
  | 'AccelerationOption'
  | 'WhatIfAnalysis'
  | 'DelayImpact'
  | 'BaselineCandidate'
  | 'Other';

/** Scenario lifecycle status (§5.1). */
export type ScenarioStatus =
  | 'Draft'
  | 'UnderReview'
  | 'Approved'
  | 'Rejected'
  | 'PromotedToCommitment'
  | 'PromotedToPublication'
  | 'Archived';

/** Scenario promotion disposition (§5.4). */
export type ScenarioPromotionDisposition =
  | 'None'
  | 'PromoteToCommitment'
  | 'PromoteToPublication'
  | 'PromoteToBaseline';

/** First-class governed scenario branch record (§5.1). */
export interface IScenarioBranch {
  readonly scenarioId: string;
  readonly projectId: string;
  readonly scenarioName: string;
  readonly scenarioType: ScenarioType;
  readonly status: ScenarioStatus;
  readonly branchFromVersionId: string;
  readonly branchFromBaselineId: string;
  readonly assumptionSet: string;
  readonly scenarioNotes: string | null;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly reviewedBy: string | null;
  readonly reviewedAt: string | null;
  readonly promotionDisposition: ScenarioPromotionDisposition;
  readonly promotedAt: string | null;
  readonly promotedBy: string | null;
}

// ── §5.2 ScenarioActivityRecord ──────────────────────────────────────

/** Per-activity date/float overrides within a scenario (§5.2). Null = inherit from source. */
export interface IScenarioActivityRecord {
  readonly scenarioActivityId: string;
  readonly scenarioId: string;
  readonly externalActivityKey: string;
  readonly scenarioStartDate: string | null;
  readonly scenarioFinishDate: string | null;
  readonly scenarioFloatHrs: number | null;
  readonly scenarioCausationCode: string | null;
  readonly assumptions: string | null;
}

// ── §5.3 ScenarioLogicRecord ─────────────────────────────────────────

/** Dependency relationship types for scenario logic (§5.3). */
export type ScenarioRelationshipType = 'FS' | 'SS' | 'FF' | 'SF';

/** Source of scenario logic override (§5.3). */
export type ScenarioLogicSource = 'ScenarioOverride' | 'WorkPackageLink';

/** Alternative logic relationship within a scenario (§5.3). */
export interface IScenarioLogicRecord {
  readonly scenarioLogicId: string;
  readonly scenarioId: string;
  readonly predecessorKey: string;
  readonly successorKey: string;
  readonly relationshipType: ScenarioRelationshipType;
  readonly lagHrs: number | null;
  readonly logicSource: ScenarioLogicSource;
  readonly promotionEligible: boolean;
}

// ── T04 Validation Types ─────────────────────────────────────────────

/** Result of validating a scenario promotion (§5.4). */
export interface IScenarioPromotionValidation {
  readonly canPromote: boolean;
  readonly blockers: ReadonlyArray<string>;
}
