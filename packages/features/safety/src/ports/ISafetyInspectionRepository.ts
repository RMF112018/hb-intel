import type {
  IngestionRunResult,
  SafetyFinding,
  SafetyIngestionRun,
  SafetyInspectionEvent,
  SafetyProjectWeekRecord,
  SafetyReportingPeriod,
  UploadContext,
} from '../domain/types.js';

export interface InspectionFilter {
  readonly reportingPeriodId?: string;
  readonly projectNumber?: string;
  readonly weekStartDate?: string;
  readonly requiresReview?: boolean;
}

export interface ProjectWeekFilter {
  readonly reportingPeriodId?: string;
}

export interface IngestionRunFilter {
  readonly reportingPeriodId?: string;
  readonly terminalStatus?: ReadonlyArray<string>;
}

export interface ReviewQueueEntry {
  readonly run: SafetyIngestionRun;
  readonly inspectionEventId?: string;
  readonly projectNumber?: string;
  readonly projectNameSnapshot?: string;
  readonly reason: string;
}

/** Filter for the Wave 2 week-scoped rollup query. */
export interface ProjectWeekInspectionFilter {
  readonly projectNumber: string;
  readonly reportingPeriodId: string;
}

export interface ReplayOptions {
  readonly supersedePrior?: boolean;
}

export interface ISafetyInspectionRepository {
  listReportingPeriods(): Promise<ReadonlyArray<SafetyReportingPeriod>>;
  getReportingPeriod(id: string): Promise<SafetyReportingPeriod | null>;
  createReportingPeriod(
    input: Omit<SafetyReportingPeriod, 'id' | 'spItemId'>,
  ): Promise<SafetyReportingPeriod>;

  listProjectWeeks(filter: ProjectWeekFilter): Promise<ReadonlyArray<SafetyProjectWeekRecord>>;
  getProjectWeek(
    reportingPeriodId: string,
    projectNumber: string,
  ): Promise<SafetyProjectWeekRecord | null>;

  listInspections(filter: InspectionFilter): Promise<ReadonlyArray<SafetyInspectionEvent>>;
  /** Week-scoped rollup query (Wave 2). */
  findInspectionsForProjectWeek(
    filter: ProjectWeekInspectionFilter,
  ): Promise<ReadonlyArray<SafetyInspectionEvent>>;
  getInspection(id: string): Promise<SafetyInspectionEvent | null>;
  listFindingsForInspection(inspectionEventId: string): Promise<ReadonlyArray<SafetyFinding>>;

  listIngestionRuns(filter: IngestionRunFilter): Promise<ReadonlyArray<SafetyIngestionRun>>;
  listReviewQueue(reportingPeriodId?: string): Promise<ReadonlyArray<ReviewQueueEntry>>;

  ingestWorkbook(file: File | Blob, context: UploadContext): Promise<IngestionRunResult>;
  /** Re-read the retained upload and re-run the pipeline with an incremented attempt chain. */
  replayIngestion(
    parentRunId: string,
    options?: ReplayOptions,
  ): Promise<IngestionRunResult>;
  /** @deprecated since Wave 2 — use {@link replayIngestion}. Retained for adapter compatibility. */
  retryIngestion(ingestionRunId: string): Promise<IngestionRunResult>;
}
