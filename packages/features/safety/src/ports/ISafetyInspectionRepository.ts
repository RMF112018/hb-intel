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

export interface ISafetyInspectionRepository {
  listReportingPeriods(): Promise<ReadonlyArray<SafetyReportingPeriod>>;
  getReportingPeriod(id: string): Promise<SafetyReportingPeriod | null>;
  createReportingPeriod(
    input: Omit<SafetyReportingPeriod, 'id'>,
  ): Promise<SafetyReportingPeriod>;

  listProjectWeeks(filter: ProjectWeekFilter): Promise<ReadonlyArray<SafetyProjectWeekRecord>>;
  getProjectWeek(
    reportingPeriodId: string,
    projectNumber: string,
  ): Promise<SafetyProjectWeekRecord | null>;

  listInspections(filter: InspectionFilter): Promise<ReadonlyArray<SafetyInspectionEvent>>;
  getInspection(id: string): Promise<SafetyInspectionEvent | null>;
  listFindingsForInspection(inspectionEventId: string): Promise<ReadonlyArray<SafetyFinding>>;

  listIngestionRuns(filter: IngestionRunFilter): Promise<ReadonlyArray<SafetyIngestionRun>>;
  listReviewQueue(reportingPeriodId?: string): Promise<ReadonlyArray<ReviewQueueEntry>>;

  ingestWorkbook(file: File | Blob, context: UploadContext): Promise<IngestionRunResult>;
  retryIngestion(ingestionRunId: string): Promise<IngestionRunResult>;
}
