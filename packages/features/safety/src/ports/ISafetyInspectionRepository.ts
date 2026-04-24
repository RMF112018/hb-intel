import type {
  IngestionRunResult,
  IngestionTerminalStatus,
  SafetyFinding,
  SafetyIngestionPreviewResult,
  SafetyIngestionRun,
  SafetyInspectionEvent,
  SafetyProjectWeekRecord,
  SafetyReportingPeriod,
  UploadContext,
} from '../domain/types.js';

/**
 * The exact terminal statuses that surface in the operational review queue.
 * `committed` is the only non-reviewable terminal.
 *
 * Shared by both the mock and SharePoint adapters so the UI copy in
 * `apps/safety/src/pages/ReviewQueuePage.tsx` stays aligned with the
 * real backend query.
 */
export const REVIEW_QUEUE_TERMINAL_STATUSES: ReadonlyArray<IngestionTerminalStatus> = [
  'review-required',
  'invalid-template',
  'parse-error',
  'reporting-period-mismatch',
  'unresolved-project',
  'commit-failed',
];

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
  readonly signal?: AbortSignal;
  readonly timeoutMs?: number;
  readonly requestId?: string;
}

export interface BackendCommandOptions {
  readonly signal?: AbortSignal;
  readonly timeoutMs?: number;
  readonly requestId?: string;
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

  previewWorkbook(
    file: File | Blob,
    context: UploadContext,
    options?: BackendCommandOptions,
  ): Promise<SafetyIngestionPreviewResult>;
  ingestWorkbook(
    file: File | Blob,
    context: UploadContext,
    options?: BackendCommandOptions,
  ): Promise<IngestionRunResult>;
  /** Re-read the retained upload and re-run the pipeline with an incremented attempt chain. */
  replayIngestion(
    parentRunId: string,
    options?: ReplayOptions,
  ): Promise<IngestionRunResult>;
  /** @deprecated since Wave 2 — use {@link replayIngestion}. Retained for adapter compatibility. */
  retryIngestion(ingestionRunId: string): Promise<IngestionRunResult>;
}
