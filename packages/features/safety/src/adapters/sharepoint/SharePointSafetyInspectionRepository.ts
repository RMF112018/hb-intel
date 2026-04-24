/**
 * SharePoint REST adapter for the Safety Record Keeping repository.
 *
 * Wave 1 audit remediation:
 * - Reads write Lookup-field payloads as numeric parent `spItemId`s, never as
 *   string business IDs.
 * - Resolves `Projects` and `Legacy Project Fallback Registry` via
 *   first-class descriptors (not `getbytitle` strings).
 * - List descriptors are resolved via `configureSafetyListGuids()` overlay and
 *   fail closed when neither source nor overlay has a non-zero GUID.
 */

import type {
  IngestionUploadContext,
  IngestionRunResult,
  ReviewStatus,
  SafetyIngestionPreviewResult,
  SafetyFinding,
  SafetyIngestionRun,
  SafetyInspectionEvent,
  SafetyProjectWeekRecord,
  SafetyReportingPeriod,
} from '../../domain/types.js';
import {
  REVIEW_QUEUE_TERMINAL_STATUSES,
  type ISafetyInspectionRepository,
  type BackendCommandOptions,
  type IngestionRunFilter,
  type InspectionFilter,
  type ProjectWeekFilter,
  type ProjectWeekInspectionFilter,
  type ReplayOptions,
  type ReviewQueueEntry,
} from '../../ports/ISafetyInspectionRepository.js';
import {
  resolveDescriptor,
  type SafetyListName,
  type SiteScopedListDescriptor,
} from '../../lists/descriptors.js';
import { JSON_HEADERS, type SpHttpClient } from './spHttp.js';
import { SafetyAdapterFetchError, SafetyBackendCommandError } from './errors.js';
import { SafetyBackendCommandClient } from './SafetyBackendCommandClient.js';
import type {
  SafetyBackendIngestionRequest,
  SafetyBackendOperationResult,
  SafetyBackendPreviewOperationResult,
} from './backendContracts.js';

const VERBOSE_HEADERS = {
  Accept: 'application/json;odata=verbose',
  'Content-Type': 'application/json;odata=verbose',
} as const;

export interface SharePointAdapterOptions {
  readonly client: SpHttpClient;
  readonly backendIngestion?: {
    readonly baseUrl?: string;
    readonly getApiToken?: () => Promise<string>;
  };
}

export class SharePointSafetyInspectionRepository implements ISafetyInspectionRepository {
  private readonly client: SpHttpClient;
  private readonly backendIngestion?: SharePointAdapterOptions['backendIngestion'];
  private readonly backendCommandClient?: SafetyBackendCommandClient;

  constructor(options: SharePointAdapterOptions) {
    this.client = options.client;
    this.backendIngestion = options.backendIngestion;
    this.backendCommandClient = options.backendIngestion?.baseUrl
      ? new SafetyBackendCommandClient({
          baseUrl: options.backendIngestion.baseUrl,
          getApiToken: options.backendIngestion.getApiToken,
        })
      : undefined;
  }

  async listReportingPeriods(): Promise<ReadonlyArray<SafetyReportingPeriod>> {
    const desc = this.boundDescriptor('SafetyReportingPeriods');
    const items = await this.fetchItems<RawReportingPeriod>(
      desc,
      '?$top=100&$orderby=WeekStartDate desc',
    );
    return items.map(mapReportingPeriod);
  }

  async getReportingPeriod(id: string): Promise<SafetyReportingPeriod | null> {
    const desc = this.boundDescriptor('SafetyReportingPeriods');
    const item = await this.fetchItem<RawReportingPeriod>(desc, spItemIdFromString(id));
    return item ? mapReportingPeriod(item) : null;
  }

  async createReportingPeriod(
    input: Omit<SafetyReportingPeriod, 'id' | 'spItemId'>,
  ): Promise<SafetyReportingPeriod> {
    const desc = this.boundDescriptor('SafetyReportingPeriods');
    const body = {
      __metadata: { type: `SP.Data.${desc.urlSegment}ListItem` },
      Title: input.title,
      WeekStartDate: input.weekStartDate,
      WeekEndDate: input.weekEndDate,
      PeriodLabel: input.periodLabel,
      Status: input.status,
    };
    const created = await this.postItem<RawReportingPeriod>(desc, body);
    return mapReportingPeriod(created);
  }

  async listProjectWeeks(
    filter: ProjectWeekFilter,
  ): Promise<ReadonlyArray<SafetyProjectWeekRecord>> {
    const desc = this.boundDescriptor('SafetyProjectWeekRecords');
    const query = filter.reportingPeriodId
      ? `?$top=500&$filter=ReportingPeriodId eq ${spItemIdFromString(filter.reportingPeriodId)}`
      : '?$top=500';
    const items = await this.fetchItems<RawProjectWeek>(desc, query);
    return items.map(mapProjectWeek);
  }

  async getProjectWeek(
    reportingPeriodId: string,
    projectNumber: string,
  ): Promise<SafetyProjectWeekRecord | null> {
    const desc = this.boundDescriptor('SafetyProjectWeekRecords');
    const filter = `?$top=1&$filter=ReportingPeriodId eq ${spItemIdFromString(
      reportingPeriodId,
    )} and ProjectNumber eq '${escapeODataString(projectNumber)}'`;
    const items = await this.fetchItems<RawProjectWeek>(desc, filter);
    return items[0] ? mapProjectWeek(items[0]) : null;
  }

  async findInspectionsForProjectWeek(
    filter: ProjectWeekInspectionFilter,
  ): Promise<ReadonlyArray<SafetyInspectionEvent>> {
    const desc = this.boundDescriptor('SafetyInspectionEvents');
    const query = `?$top=500&$filter=ReportingPeriodId eq ${spItemIdFromString(filter.reportingPeriodId)} and ProjectNumber eq '${escapeODataString(filter.projectNumber)}'`;
    const items = await this.fetchItems<RawInspectionEvent>(desc, query);
    return items.map(mapInspectionEvent);
  }

  async listInspections(
    filter: InspectionFilter,
  ): Promise<ReadonlyArray<SafetyInspectionEvent>> {
    const desc = this.boundDescriptor('SafetyInspectionEvents');
    const filters: string[] = [];
    if (filter.reportingPeriodId) {
      filters.push(`ReportingPeriodId eq ${spItemIdFromString(filter.reportingPeriodId)}`);
    }
    if (filter.projectNumber) {
      filters.push(`ProjectNumber eq '${escapeODataString(filter.projectNumber)}'`);
    }
    if (filter.requiresReview !== undefined) {
      filters.push(`RequiresReview eq ${filter.requiresReview ? 1 : 0}`);
    }
    const query = filters.length
      ? `?$top=500&$orderby=InspectionDate desc&$filter=${filters.join(' and ')}`
      : '?$top=500&$orderby=InspectionDate desc';
    const items = await this.fetchItems<RawInspectionEvent>(desc, query);
    return items.map(mapInspectionEvent);
  }

  async getInspection(id: string): Promise<SafetyInspectionEvent | null> {
    const desc = this.boundDescriptor('SafetyInspectionEvents');
    const item = await this.fetchItem<RawInspectionEvent>(desc, spItemIdFromString(id));
    return item ? mapInspectionEvent(item) : null;
  }

  async listFindingsForInspection(
    inspectionEventId: string,
  ): Promise<ReadonlyArray<SafetyFinding>> {
    const desc = this.boundDescriptor('SafetyFindings');
    const query = `?$top=500&$filter=InspectionEventId eq ${spItemIdFromString(inspectionEventId)}`;
    const items = await this.fetchItems<RawFinding>(desc, query);
    return items.map(mapFinding);
  }

  async listIngestionRuns(
    filter: IngestionRunFilter,
  ): Promise<ReadonlyArray<SafetyIngestionRun>> {
    const desc = this.boundDescriptor('SafetyIngestionRuns');
    const filters: string[] = [];
    if (filter.reportingPeriodId) {
      filters.push(`ReportingPeriodId eq ${spItemIdFromString(filter.reportingPeriodId)}`);
    }
    if (filter.terminalStatus && filter.terminalStatus.length > 0) {
      const clauses = filter.terminalStatus.map((s) => `TerminalStatus eq '${s}'`);
      filters.push(`(${clauses.join(' or ')})`);
    }
    const query = filters.length
      ? `?$top=200&$orderby=RunStartedAt desc&$filter=${filters.join(' and ')}`
      : '?$top=200&$orderby=RunStartedAt desc';
    const items = await this.fetchItems<RawIngestionRun>(desc, query);
    return items.map(mapIngestionRun);
  }

  async listReviewQueue(reportingPeriodId?: string): Promise<ReadonlyArray<ReviewQueueEntry>> {
    const runs = await this.listIngestionRuns({
      reportingPeriodId,
      terminalStatus: REVIEW_QUEUE_TERMINAL_STATUSES,
    });
    return runs.map((run) => {
      const committed = safeParse(run.committedEntityIdsJson);
      const inspectionEventId =
        committed && typeof committed.inspectionEventId === 'string'
          ? committed.inspectionEventId
          : undefined;
      return {
        run,
        inspectionEventId,
        reason: run.errorSummary ?? run.terminalStatus,
      };
    });
  }

  async previewWorkbook(
    file: File | Blob,
    context: IngestionUploadContext,
    options?: BackendCommandOptions,
  ): Promise<SafetyIngestionPreviewResult> {
    const request = await this.buildIngestionRequest(file, context);
    const commandResult = await this.requireBackendCommandClient().preview(request, options);
    const operation = commandResult.data;
    if (!operation.success || !operation.preview) {
      throw this.buildBackendOperationError('/api/safety-records/ingest/preview', operation, 422, commandResult.frontendRequestId);
    }
    return operation.preview;
  }

  async ingestWorkbook(
    file: File | Blob,
    context: IngestionUploadContext,
    options?: BackendCommandOptions,
  ): Promise<IngestionRunResult> {
    return this.ingestWorkbookViaBackend(file, context, options);
  }

  async replayIngestion(
    parentRunId: string,
    options: ReplayOptions = {},
  ): Promise<IngestionRunResult> {
    return this.replayIngestionViaBackend(parentRunId, options);
  }

  async retryIngestion(ingestionRunId: string): Promise<IngestionRunResult> {
    return this.replayIngestion(ingestionRunId);
  }

  private async ingestWorkbookViaBackend(
    file: File | Blob,
    context: IngestionUploadContext,
    options?: BackendCommandOptions,
  ): Promise<IngestionRunResult> {
    const commandResult = await this.requireBackendCommandClient().ingest(
      await this.buildIngestionRequest(file, context),
      options,
    );
    const operation = commandResult.data;
    if (!operation.success || !operation.result) {
      throw this.buildBackendOperationError('/api/safety-records/ingest', operation, 422, commandResult.frontendRequestId);
    }
    return operation.result;
  }

  private async replayIngestionViaBackend(
    parentRunId: string,
    options: ReplayOptions,
  ): Promise<IngestionRunResult> {
    const commandResult = await this.requireBackendCommandClient().replay({
      parentRunId,
      supersedePrior: options.supersedePrior ?? false,
    }, options);
    const operation = commandResult.data;
    if (!operation.success || !operation.result) {
      throw this.buildBackendOperationError('/api/safety-records/replay', operation, 422, commandResult.frontendRequestId);
    }
    return operation.result;
  }

  private requireBackendIngestion(): NonNullable<SharePointAdapterOptions['backendIngestion']> {
    if (!this.backendIngestion?.baseUrl) {
      throw new SafetyAdapterFetchError({
        listName: 'Safety Ingestion API',
        siteUrl: '',
        endpoint: 'missing-backend-ingestion',
        httpStatus: 500,
        bodySnippet: 'Safety sharepoint mode requires backend ingestion configuration.',
        operation: 'Invoke',
      });
    }
    return this.backendIngestion;
  }

  private requireBackendCommandClient(): SafetyBackendCommandClient {
    this.requireBackendIngestion();
    if (!this.backendCommandClient) {
      throw new SafetyBackendCommandError({
        endpoint: 'missing-backend-command-client',
        httpStatus: 500,
        message: 'Safety sharepoint mode requires backend ingestion configuration.',
      });
    }
    return this.backendCommandClient;
  }

  private async buildIngestionRequest(
    file: File | Blob,
    context: IngestionUploadContext,
  ): Promise<SafetyBackendIngestionRequest> {
    const fileName = file instanceof File ? file.name : context.fileName;
    return {
      fileName,
      fileContentBase64: await toBase64(file),
      context: {
        ...context,
        fileName,
      },
    };
  }

  private buildBackendOperationError(
    endpointPath: string,
    operation: SafetyBackendOperationResult | SafetyBackendPreviewOperationResult,
    httpStatus: number,
    frontendRequestId?: string,
  ): SafetyBackendCommandError {
    const primaryDiagnostic = operation.diagnostics.find((d) => d.failureClass);
    const previewFailureClass = operation.preview?.diagnosticSummary?.failureClass;
    return new SafetyBackendCommandError({
      endpoint: `${trimTrailingSlash(this.requireBackendIngestion().baseUrl ?? '')}${endpointPath}`,
      httpStatus,
      requestId: operation.requestId,
      code: primaryDiagnostic?.code,
      message: primaryDiagnostic?.message ?? 'Safety backend command failed.',
      failureClass: primaryDiagnostic?.failureClass,
      previewFailureClass,
      graphContext: primaryDiagnostic?.graphContext,
      operationData: operation,
      errorKind: httpStatus === 422 ? 'contract' : 'non-transient',
      retryable: false,
      frontendRequestId,
      backendRequestId: operation.requestId,
    });
  }

  // -- private REST helpers -----------------------------------------------
  //
  // Production preview, ingest, and replay command paths route exclusively
  // through `SafetyBackendCommandClient` (see previewWorkbook, ingestWorkbook,
  // replayIngestion above). The legacy direct-REST commit pipeline that
  // formerly lived here (project resolution, project-week creation, inspection
  // commit, finding writes, supersede mark, rollup update, ingestion-run
  // insertion) is owned end-to-end by the backend graph repository now.
  // Do not reintroduce write-side seams in this adapter — any new ingestion
  // command belongs in the backend.

  private boundDescriptor(key: SafetyListName): SiteScopedListDescriptor {
    return resolveDescriptor(key);
  }

  private async fetchItems<T>(
    descriptor: SiteScopedListDescriptor,
    query: string,
  ): Promise<T[]> {
    const endpoint = `${descriptor.siteUrl}/_api/web/lists(guid'${descriptor.id}')/items${query}`;
    const response = await this.client.get(endpoint, { headers: JSON_HEADERS });
    if (!response.ok) {
      const bodySnippet = await readBodySnippet(response);
      throw new SafetyAdapterFetchError({
        listName: descriptor.title,
        siteUrl: descriptor.siteUrl,
        endpoint,
        httpStatus: response.status,
        bodySnippet,
        operation: 'Fetch',
      });
    }
    const body = (await response.json()) as { value?: T[] };
    return body.value ?? [];
  }

  private async fetchItem<T>(
    descriptor: SiteScopedListDescriptor,
    id: number,
  ): Promise<T | null> {
    const endpoint = `${descriptor.siteUrl}/_api/web/lists(guid'${descriptor.id}')/items(${id})`;
    const response = await this.client.get(endpoint, { headers: JSON_HEADERS });
    if (response.status === 404) return null;
    if (!response.ok) {
      const bodySnippet = await readBodySnippet(response);
      throw new SafetyAdapterFetchError({
        listName: descriptor.title,
        siteUrl: descriptor.siteUrl,
        endpoint,
        httpStatus: response.status,
        bodySnippet,
        operation: `Fetch item ${id} from`,
      });
    }
    return (await response.json()) as T;
  }

  private async postItem<T>(
    descriptor: SiteScopedListDescriptor,
    body: Record<string, unknown>,
  ): Promise<T> {
    const endpoint = `${descriptor.siteUrl}/_api/web/lists(guid'${descriptor.id}')/items`;
    const response = await this.client.post(endpoint, JSON.stringify(body), {
      headers: VERBOSE_HEADERS,
    });
    if (!response.ok) {
      const bodySnippet = await readBodySnippet(response);
      throw new SafetyAdapterFetchError({
        listName: descriptor.title,
        siteUrl: descriptor.siteUrl,
        endpoint,
        httpStatus: response.status,
        bodySnippet,
        operation: 'Create item in',
      });
    }
    return (await response.json()) as T;
  }
}

async function readBodySnippet(response: Response): Promise<string | undefined> {
  try {
    const text = await response.text();
    if (!text) return undefined;
    return text.length > 200 ? `${text.slice(0, 200)}…` : text;
  } catch {
    return undefined;
  }
}

// -- helpers ------------------------------------------------------------

function spItemIdFromString(businessId: string): number {
  const tail = businessId.split('-').pop() ?? '';
  const n = Number(tail);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(
      `Cannot derive a SharePoint item Id from "${businessId}". ` +
        'Business IDs must be formed as "{prefix}-{spItemId}".',
    );
  }
  return n;
}

function escapeODataString(value: string): string {
  return value.replace(/'/g, "''");
}

function safeParse(value: string): Record<string, unknown> | null {
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function toBase64(file: File | Blob): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (typeof btoa === 'function') {
    let binary = '';
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    return btoa(binary);
  }
  return encodeBase64Bytes(bytes);
}

function trimTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

function encodeBase64Bytes(bytes: Uint8Array): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i] ?? 0;
    const b1 = bytes[i + 1] ?? 0;
    const b2 = bytes[i + 2] ?? 0;
    const value = (b0 << 16) | (b1 << 8) | b2;
    const c0 = alphabet[(value >> 18) & 63];
    const c1 = alphabet[(value >> 12) & 63];
    const c2 = i + 1 < bytes.length ? alphabet[(value >> 6) & 63] : '=';
    const c3 = i + 2 < bytes.length ? alphabet[value & 63] : '=';
    output += `${c0}${c1}${c2}${c3}`;
  }
  return output;
}

// -- raw → domain mappers ----------------------------------------------

interface RawReportingPeriod {
  Id: number;
  Title: string;
  WeekStartDate: string;
  WeekEndDate: string;
  PeriodLabel?: string;
  Status?: SafetyReportingPeriod['status'];
  PublishedAt?: string;
  Notes?: string;
}

function mapReportingPeriod(raw: RawReportingPeriod): SafetyReportingPeriod {
  return {
    id: `period-${raw.Id}`,
    spItemId: raw.Id,
    title: raw.Title,
    weekStartDate: raw.WeekStartDate?.slice(0, 10) ?? '',
    weekEndDate: raw.WeekEndDate?.slice(0, 10) ?? '',
    periodLabel: raw.PeriodLabel ?? raw.Title,
    status: raw.Status ?? 'open',
    publishedAt: raw.PublishedAt,
    notes: raw.Notes,
  };
}

interface RawProjectWeek {
  Id: number;
  Title: string;
  ReportingPeriodId: number;
  ProjectLookupId?: number;
  LegacyRegistryItemId?: number;
  ProjectSourceClassification?: SafetyProjectWeekRecord['projectSourceClassification'];
  ProjectNumber: string;
  ProjectNameSnapshot?: string;
  ProjectStageSnapshot?: string;
  ProjectLocationSnapshot?: string;
  ExpectedInspectionThisWeek?: boolean;
  InspectionCount?: number;
  AverageInspectionScore?: number;
  HighestRiskFindingLevel?: SafetyProjectWeekRecord['highestRiskFindingLevel'];
  WeeklySummary?: string;
  ManagerReviewStatus?: SafetyProjectWeekRecord['managerReviewStatus'];
  PublishStatus?: SafetyProjectWeekRecord['publishStatus'];
}

function mapProjectWeek(raw: RawProjectWeek): SafetyProjectWeekRecord {
  return {
    id: `pw-${raw.Id}`,
    spItemId: raw.Id,
    title: raw.Title,
    reportingPeriodId: `period-${raw.ReportingPeriodId}`,
    reportingPeriodSpItemId: raw.ReportingPeriodId,
    projectNumber: raw.ProjectNumber,
    projectNameSnapshot: raw.ProjectNameSnapshot ?? '',
    projectLocationSnapshot: raw.ProjectLocationSnapshot ?? '',
    projectStageSnapshot: raw.ProjectStageSnapshot ?? '',
    projectSourceClassification: raw.ProjectSourceClassification ?? 'project',
    projectLookupId: raw.ProjectLookupId,
    legacyRegistryItemId: raw.LegacyRegistryItemId,
    expectedInspectionThisWeek: raw.ExpectedInspectionThisWeek ?? false,
    inspectionCount: raw.InspectionCount ?? 0,
    averageInspectionScore: raw.AverageInspectionScore ?? null,
    highestRiskFindingLevel: raw.HighestRiskFindingLevel ?? null,
    weeklySummary: raw.WeeklySummary ?? '',
    managerReviewStatus: raw.ManagerReviewStatus ?? 'not-required',
    publishStatus: raw.PublishStatus ?? 'awaiting-upload',
  };
}

interface RawInspectionEvent {
  Id: number;
  Title: string;
  ProjectWeekRecordId: number;
  ReportingPeriodId: number;
  SourceUploadItemId: number;
  SourceUploadWebUrl?: string;
  Checksum?: string;
  TemplateVersion?: string;
  ParserVersion?: string;
  ScoringMode?: SafetyInspectionEvent['scoringMode'];
  InspectionDate?: string;
  InspectionNumber?: string;
  InspectorName?: string;
  InspectorUpn?: string;
  ProjectNumber: string;
  ProjectNameSnapshot?: string;
  InspectionScore?: number;
  TotalYes?: number;
  TotalNo?: number;
  TotalNA?: number;
  RawChecklistJson?: string;
  IngestionStatus?: SafetyInspectionEvent['ingestionStatus'];
  DuplicateStatus?: SafetyInspectionEvent['duplicateStatus'];
  RequiresReview?: boolean;
  SubmittedAt?: string;
  CommittedAt?: string;
  SupersededByInspectionEventId?: number;
}

function mapInspectionEvent(raw: RawInspectionEvent): SafetyInspectionEvent {
  return {
    id: `ie-${raw.Id}`,
    spItemId: raw.Id,
    title: raw.Title,
    projectWeekRecordId: `pw-${raw.ProjectWeekRecordId}`,
    projectWeekRecordSpItemId: raw.ProjectWeekRecordId,
    reportingPeriodId: `period-${raw.ReportingPeriodId}`,
    reportingPeriodSpItemId: raw.ReportingPeriodId,
    sourceUploadItemId: raw.SourceUploadItemId,
    sourceUploadWebUrl: raw.SourceUploadWebUrl ?? '',
    checksum: raw.Checksum ?? '',
    templateVersion: raw.TemplateVersion ?? '',
    parserVersion: raw.ParserVersion ?? '',
    scoringMode: raw.ScoringMode ?? 'template-compat-v1',
    inspectionDate: raw.InspectionDate?.slice(0, 10) ?? '',
    inspectionNumber: raw.InspectionNumber ?? '',
    inspectorName: raw.InspectorName,
    inspectorUpn: raw.InspectorUpn,
    projectNumber: raw.ProjectNumber,
    projectNameSnapshot: raw.ProjectNameSnapshot ?? '',
    inspectionScore: raw.InspectionScore ?? 0,
    totalYes: raw.TotalYes ?? 0,
    totalNo: raw.TotalNo ?? 0,
    totalNa: raw.TotalNA ?? 0,
    rawChecklistJson: raw.RawChecklistJson ?? '{}',
    ingestionStatus: raw.IngestionStatus ?? 'accepted',
    duplicateStatus: raw.DuplicateStatus ?? 'none',
    requiresReview: raw.RequiresReview ?? false,
    submittedAt: raw.SubmittedAt ?? '',
    committedAt: raw.CommittedAt,
    supersededByInspectionEventId: raw.SupersededByInspectionEventId
      ? `ie-${raw.SupersededByInspectionEventId}`
      : undefined,
  };
}

interface RawFinding {
  Id: number;
  Title: string;
  InspectionEventId: number;
  ProjectWeekRecordId: number;
  SectionNumber: number;
  SectionName: string;
  ChecklistRowNumber: number;
  ChecklistItemLabel: string;
  FindingType: SafetyFinding['findingType'];
  Severity: SafetyFinding['severity'];
  FindingSummary?: string;
  OriginalNoteText?: string;
  RequiresCorrectiveAction?: boolean;
  IsOpen?: boolean;
}

function mapFinding(raw: RawFinding): SafetyFinding {
  return {
    id: `fd-${raw.Id}`,
    spItemId: raw.Id,
    title: raw.Title,
    inspectionEventId: `ie-${raw.InspectionEventId}`,
    inspectionEventSpItemId: raw.InspectionEventId,
    projectWeekRecordId: `pw-${raw.ProjectWeekRecordId}`,
    projectWeekRecordSpItemId: raw.ProjectWeekRecordId,
    sectionNumber: raw.SectionNumber,
    sectionName: raw.SectionName,
    checklistRowNumber: raw.ChecklistRowNumber,
    checklistItemLabel: raw.ChecklistItemLabel,
    findingType: raw.FindingType,
    severity: raw.Severity,
    findingSummary: raw.FindingSummary ?? '',
    originalNoteText: raw.OriginalNoteText ?? '',
    requiresCorrectiveAction: raw.RequiresCorrectiveAction ?? false,
    isOpen: raw.IsOpen ?? true,
  };
}

interface RawIngestionRun {
  Id: number;
  Title: string;
  SourceUploadItemId: number;
  UploadFileName: string;
  TemplateVersionDetected?: string;
  Checksum?: string;
  ValidationStatus?: SafetyIngestionRun['validationStatus'];
  ParseStatus?: SafetyIngestionRun['parseStatus'];
  ProjectResolutionStatus?: SafetyIngestionRun['projectResolutionStatus'];
  TerminalStatus: SafetyIngestionRun['terminalStatus'];
  CommittedEntityIdsJson?: string;
  ErrorClass?: SafetyIngestionRun['errorClass'];
  ErrorSummary?: string;
  RunStartedAt: string;
  RunCompletedAt: string;
  AttemptNumber?: number;
  ReportingPeriodId?: number;
  AttemptedProjectSiteText?: string;
  ResolvedProjectNumber?: string;
  ProjectSourceClassification?: SafetyIngestionRun['projectSourceClassification'];
  ReviewStatus?: ReviewStatus;
  ParentRunId?: number;
}

function mapIngestionRun(raw: RawIngestionRun): SafetyIngestionRun {
  return {
    id: `run-${raw.Id}`,
    spItemId: raw.Id,
    title: raw.Title,
    sourceUploadItemId: raw.SourceUploadItemId,
    uploadFileName: raw.UploadFileName,
    templateVersionDetected: raw.TemplateVersionDetected,
    checksum: raw.Checksum,
    validationStatus: raw.ValidationStatus ?? 'pending',
    parseStatus: raw.ParseStatus ?? 'pending',
    projectResolutionStatus: raw.ProjectResolutionStatus ?? 'pending',
    terminalStatus: raw.TerminalStatus,
    committedEntityIdsJson: raw.CommittedEntityIdsJson ?? '{}',
    errorClass: raw.ErrorClass,
    errorSummary: raw.ErrorSummary,
    runStartedAt: raw.RunStartedAt,
    runCompletedAt: raw.RunCompletedAt,
    attemptNumber: raw.AttemptNumber ?? 1,
    reportingPeriodId: raw.ReportingPeriodId ? `period-${raw.ReportingPeriodId}` : undefined,
    reportingPeriodSpItemId: raw.ReportingPeriodId ?? undefined,
    attemptedProjectSiteText: raw.AttemptedProjectSiteText,
    resolvedProjectNumber: raw.ResolvedProjectNumber,
    projectSourceClassification: raw.ProjectSourceClassification,
    reviewStatus: raw.ReviewStatus ?? 'none',
    parentRunId: raw.ParentRunId ? `run-${raw.ParentRunId}` : undefined,
    parentRunSpItemId: raw.ParentRunId ?? undefined,
  };
}

