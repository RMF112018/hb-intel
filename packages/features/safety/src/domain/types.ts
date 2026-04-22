/**
 * Domain types for Safety Record Keeping Release 1.
 *
 * Source: docs/architecture/plans/MASTER/spfx/safety-records/design-pacakge/03-Data-Model-and-HBCentral-List-Architecture.md
 */

export type ChecklistResponse = 'yes' | 'no' | 'na' | 'incomplete' | 'multi';

export type ScoringMode = 'template-compat-v1' | 'normalized-vNext';

export type ProjectSourceClassification = 'project' | 'legacy-only' | 'project+legacy' | 'unresolved';

export type UploadStatus =
  | 'uploaded'
  | 'validating'
  | 'rejected'
  | 'parsed'
  | 'review-required'
  | 'committed';

export type ProjectWeekStatus =
  | 'not-started'
  | 'awaiting-upload'
  | 'in-progress'
  | 'completed'
  | 'review-required'
  | 'published';

export type InspectionEventStatus =
  | 'accepted'
  | 'duplicate-suspected'
  | 'superseded'
  | 'review-required'
  | 'rejected';

export type IngestionTerminalStatus =
  | 'invalid-template'
  | 'unresolved-project'
  | 'review-required'
  | 'committed'
  | 'commit-failed';

export type IngestionState =
  | 'uploaded'
  | 'validating'
  | 'resolving-project'
  | 'parsed'
  | 'duplicate-checked'
  | 'scoring'
  | 'commit-pending'
  | IngestionTerminalStatus;

export type DuplicateConfidence = 'none' | 'near-duplicate' | 'high-confidence-duplicate';

export type FindingSeverity = 'info' | 'medium' | 'high';

export type ErrorClass =
  | 'template-invalid'
  | 'template-unsupported-version'
  | 'project-unresolved'
  | 'duplicate-suspected'
  | 'parse-error'
  | 'commit-error';

export interface ChecklistRow {
  readonly sectionNumber: number;
  readonly sectionName: string;
  readonly rowNumber: number;
  readonly itemLabel: string;
  readonly response: ChecklistResponse;
  readonly notes: string;
  readonly workbookScoreCell: string | number | null;
  readonly workbookFlagCell: string | null;
}

export interface InspectionMetadata {
  readonly inspectionDate: string;
  readonly projectSiteText: string;
  readonly inspectionNumber: string;
  readonly workbookTotalYes: number | null;
  readonly workbookTotalNo: number | null;
  readonly workbookTotalNa: number | null;
  readonly workbookSafetyScorePct: number | null;
  readonly keyFindingsFreeText: string;
}

export interface SectionScore {
  readonly sectionNumber: number;
  readonly sectionName: string;
  readonly yes: number;
  readonly no: number;
  readonly na: number;
  readonly incomplete: number;
  readonly multi: number;
  readonly scorePct: number;
  readonly weight: number;
  readonly weightedContribution: number;
}

export interface ComputedInspectionScore {
  readonly sections: ReadonlyArray<SectionScore>;
  readonly totalYes: number;
  readonly totalNo: number;
  readonly totalNa: number;
  readonly totalIncomplete: number;
  readonly totalMulti: number;
  readonly finalScorePct: number;
  readonly scoringMode: ScoringMode;
}

export interface ParsedInspection {
  readonly templateVersion: string;
  readonly parserVersion: string;
  readonly metadata: InspectionMetadata;
  readonly rows: ReadonlyArray<ChecklistRow>;
}

export interface ProjectResolutionResult {
  readonly classification: ProjectSourceClassification;
  readonly projectNumber: string;
  readonly projectNameSnapshot: string;
  readonly projectLocationSnapshot: string;
  readonly projectStageSnapshot: string;
  readonly projectLookupId?: number;
  readonly legacyRegistryItemId?: number;
}

export interface DuplicateCheckResult {
  readonly confidence: DuplicateConfidence;
  readonly matchedInspectionEventId?: string;
  readonly reason?: string;
}

export interface UploadContext {
  readonly uploadedByUpn: string;
  readonly uploadedByDisplayName?: string;
  readonly uploadedAt: string;
  readonly fileName: string;
  readonly reportingPeriodId: string;
  /** Numeric parent item Id for the reporting period — carried into Lookup payloads. */
  readonly reportingPeriodSpItemId: number;
}

/**
 * Draft types — identity fields are filled in by the adapter during commit.
 * SharePoint assigns the real item Id on POST; the mock allocates monotonically.
 */
export type SafetyInspectionEventDraft = Omit<SafetyInspectionEvent, 'id' | 'spItemId'>;
export type SafetyFindingDraft = Omit<
  SafetyFinding,
  'id' | 'spItemId' | 'inspectionEventId' | 'inspectionEventSpItemId'
>;
export type SafetyIngestionRunDraft = Omit<SafetyIngestionRun, 'id' | 'spItemId'>;

export interface CommittedArtifacts {
  readonly inspectionEvent: SafetyInspectionEvent;
  readonly findings: ReadonlyArray<SafetyFinding>;
  readonly projectWeekRecord: SafetyProjectWeekRecord;
}

export interface UploadedWorkbookRef {
  readonly sourceUploadItemId: number;
  readonly sourceUploadWebUrl: string;
  readonly checksum: string;
}

export interface SafetyReportingPeriod {
  readonly id: string;
  /** Authoritative SharePoint list item Id — parent target for Lookup fields. */
  readonly spItemId: number;
  readonly title: string;
  readonly weekStartDate: string;
  readonly weekEndDate: string;
  readonly periodLabel: string;
  readonly status: 'open' | 'closed' | 'published';
  readonly createdBy?: string;
  readonly publishedAt?: string;
  readonly publishedBy?: string;
  readonly notes?: string;
}

export interface SafetyProjectWeekRecord {
  readonly id: string;
  /** Authoritative SharePoint list item Id — parent target for Lookup fields. */
  readonly spItemId: number;
  readonly title: string;
  readonly reportingPeriodId: string;
  /** Numeric lookup parent for SharePoint `ReportingPeriodId` lookup column. */
  readonly reportingPeriodSpItemId: number;
  readonly projectNumber: string;
  readonly projectNameSnapshot: string;
  readonly projectLocationSnapshot: string;
  readonly projectStageSnapshot: string;
  readonly projectSourceClassification: ProjectSourceClassification;
  readonly projectLookupId?: number;
  readonly legacyRegistryItemId?: number;
  readonly expectedInspectionThisWeek: boolean;
  readonly inspectionCount: number;
  readonly averageInspectionScore: number | null;
  readonly highestRiskFindingLevel: FindingSeverity | null;
  readonly weeklySummary: string;
  readonly managerReviewStatus: 'not-required' | 'pending' | 'approved';
  readonly publishStatus: ProjectWeekStatus;
}

export interface SafetyInspectionEvent {
  readonly id: string;
  /** Authoritative SharePoint list item Id — parent target for Lookup fields. */
  readonly spItemId: number;
  readonly title: string;
  readonly projectWeekRecordId: string;
  /** Numeric lookup parent for SharePoint `ProjectWeekRecordId` lookup column. */
  readonly projectWeekRecordSpItemId: number;
  readonly reportingPeriodId: string;
  /** Numeric lookup parent for SharePoint `ReportingPeriodId` lookup column. */
  readonly reportingPeriodSpItemId: number;
  readonly sourceUploadItemId: number;
  readonly sourceUploadWebUrl: string;
  readonly checksum: string;
  readonly templateVersion: string;
  readonly parserVersion: string;
  readonly scoringMode: ScoringMode;
  readonly inspectionDate: string;
  readonly inspectionNumber: string;
  readonly inspectorName?: string;
  readonly inspectorUpn?: string;
  readonly projectNumber: string;
  readonly projectNameSnapshot: string;
  readonly inspectionScore: number;
  readonly totalYes: number;
  readonly totalNo: number;
  readonly totalNa: number;
  readonly rawChecklistJson: string;
  readonly ingestionStatus: InspectionEventStatus;
  readonly duplicateStatus: DuplicateConfidence;
  readonly requiresReview: boolean;
  readonly submittedAt: string;
  readonly committedAt?: string;
}

export interface SafetyFinding {
  readonly id: string;
  /** Authoritative SharePoint list item Id. */
  readonly spItemId: number;
  readonly title: string;
  readonly inspectionEventId: string;
  /** Numeric lookup parent for SharePoint `InspectionEventId` lookup column. */
  readonly inspectionEventSpItemId: number;
  readonly projectWeekRecordId: string;
  /** Numeric lookup parent for SharePoint `ProjectWeekRecordId` lookup column. */
  readonly projectWeekRecordSpItemId: number;
  readonly sectionNumber: number;
  readonly sectionName: string;
  readonly checklistRowNumber: number;
  readonly checklistItemLabel: string;
  readonly findingType: 'no-response' | 'incomplete' | 'multi' | 'note-only';
  readonly severity: FindingSeverity;
  readonly findingSummary: string;
  readonly originalNoteText: string;
  readonly requiresCorrectiveAction: boolean;
  readonly isOpen: boolean;
}

export interface SafetyIngestionRun {
  readonly id: string;
  /** Authoritative SharePoint list item Id. */
  readonly spItemId: number;
  readonly title: string;
  readonly sourceUploadItemId: number;
  readonly uploadFileName: string;
  readonly templateVersionDetected?: string;
  readonly checksum?: string;
  readonly validationStatus: 'pending' | 'passed' | 'failed';
  readonly parseStatus: 'pending' | 'passed' | 'failed' | 'skipped';
  readonly projectResolutionStatus: 'pending' | 'resolved' | 'unresolved' | 'skipped';
  readonly terminalStatus: IngestionTerminalStatus;
  readonly committedEntityIdsJson: string;
  readonly errorClass?: ErrorClass;
  readonly errorSummary?: string;
  readonly runStartedAt: string;
  readonly runCompletedAt: string;
  readonly attemptNumber: number;
}

export interface IngestionCommittedIds {
  inspectionEventId?: string;
  projectWeekRecordId?: string;
  findingIds?: ReadonlyArray<string>;
  ingestionRunId?: string;
}

export interface IngestionRunResult {
  readonly run: SafetyIngestionRun;
  readonly committed?: {
    readonly inspectionEvent: SafetyInspectionEvent;
    readonly projectWeekRecord: SafetyProjectWeekRecord;
    readonly findings: ReadonlyArray<SafetyFinding>;
  };
  readonly state: IngestionTerminalStatus;
}

export class TemplateInvalidError extends Error {
  readonly errorClass: ErrorClass = 'template-invalid';
  constructor(message: string) {
    super(message);
    this.name = 'TemplateInvalidError';
  }
}

export class ProjectUnresolvedError extends Error {
  readonly errorClass: ErrorClass = 'project-unresolved';
  constructor(message: string) {
    super(message);
    this.name = 'ProjectUnresolvedError';
  }
}

export class CommitError extends Error {
  readonly errorClass: ErrorClass = 'commit-error';
  readonly partialIds: IngestionCommittedIds;
  constructor(message: string, partialIds: IngestionCommittedIds = {}) {
    super(message);
    this.name = 'CommitError';
    this.partialIds = partialIds;
  }
}
