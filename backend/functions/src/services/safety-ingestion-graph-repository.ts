import type {
  CommittedArtifacts,
  IngestionRunResult,
  ProjectResolutionResult,
  ProjectSourceClassification,
  SafetyFinding,
  SafetyFindingDraft,
  SafetyIngestionRun,
  SafetyIngestionRunDraft,
  SafetyInspectionEvent,
  SafetyInspectionEventDraft,
  SafetyProjectWeekRecord,
  SafetyReportingPeriod,
  UploadContext,
} from '../../../../packages/features/safety/src/domain/types.js';
import {
  runIngestionPipeline,
  type IngestionAdapter,
} from '../../../../packages/features/safety/src/ingestion/runIngestionPipeline.js';
import { readWorkbookFromArrayBuffer, computeChecksum } from '../../../../packages/features/safety/src/parser/xlsxWorkbookView.js';
import {
  resolveDescriptor,
  type SiteScopedListDescriptor,
} from '../../../../packages/features/safety/src/lists/descriptors.js';
import { resolveUploadLibraryDescriptor } from '../../../../packages/features/safety/src/lists/safetyUploadLibrary.js';
import type { IManagedIdentityTokenService } from './managed-identity-token-service.js';
import {
  SafetyIngestionGraphDataPlane,
  type IGraphListItem,
} from './safety-ingestion-graph-data-plane.js';

const PROJECTS_FIELD = {
  NUMBER: 'field_2',
  NAME: 'field_3',
  LOCATION: 'field_4',
  STAGE: 'field_6',
} as const;

export interface IBackendSafetyIngestionRequest {
  readonly fileName: string;
  readonly fileBytes: ArrayBuffer;
  readonly context: UploadContext;
}

export class SafetyIngestionGraphRepository {
  private readonly graph: SafetyIngestionGraphDataPlane;

  constructor(tokenService: IManagedIdentityTokenService) {
    this.graph = new SafetyIngestionGraphDataPlane(tokenService);
  }

  async ingestWorkbook(input: IBackendSafetyIngestionRequest): Promise<IngestionRunResult> {
    const uploadedRef = await this.uploadWorkbook(input.fileName, input.fileBytes);
    const view = readWorkbookFromArrayBuffer(input.fileBytes);

    return runIngestionPipeline({
      view,
      context: input.context,
      uploadedRef,
      adapter: this.buildIngestionAdapter(),
    });
  }

  async getReportingPeriod(id: string): Promise<SafetyReportingPeriod | null> {
    const descriptor = this.list('SafetyReportingPeriods');
    const item = await this.graph.getItemById(
      descriptor.siteUrl,
      descriptor.id,
      spItemIdFromString(id),
      ['Title', 'WeekStartDate', 'WeekEndDate', 'PeriodLabel', 'Status', 'PublishedAt', 'Notes'],
    );
    return item ? mapReportingPeriod(item) : null;
  }

  async createReportingPeriod(
    input: Omit<SafetyReportingPeriod, 'id' | 'spItemId'>,
  ): Promise<SafetyReportingPeriod> {
    const descriptor = this.list('SafetyReportingPeriods');
    const created = await this.graph.createItem(descriptor.siteUrl, descriptor.id, {
      Title: input.title,
      WeekStartDate: input.weekStartDate,
      WeekEndDate: input.weekEndDate,
      PeriodLabel: input.periodLabel,
      Status: input.status,
    });
    return mapReportingPeriod(created);
  }

  private buildIngestionAdapter(): IngestionAdapter {
    return {
      resolveProject: async (projectSiteText: string, projectNumberHint: string | null) =>
        this.resolveProject(projectSiteText, projectNumberHint ?? undefined),
      resolveProjectByNumber: async (
        projectNumber: string,
        classification: ProjectSourceClassification,
        hints,
      ): Promise<ProjectResolutionResult | null> => {
        if (!projectNumber) return null;

        if (hints?.projectNameSnapshot && hints.projectNameSnapshot.length > 0) {
          return {
            classification,
            projectNumber,
            projectNameSnapshot: hints.projectNameSnapshot,
            projectLocationSnapshot: hints.projectLocationSnapshot ?? '',
            projectStageSnapshot: hints.projectStageSnapshot ?? '',
            projectLookupId: hints.projectLookupId,
            legacyRegistryItemId: hints.legacyRegistryItemId,
          };
        }

        const enriched = await this.resolveProject('', projectNumber);
        if (enriched) {
          return {
            ...enriched,
            classification,
            projectNumber,
          };
        }

        return {
          classification,
          projectNumber,
          projectNameSnapshot: hints?.projectNameSnapshot ?? '',
          projectLocationSnapshot: hints?.projectLocationSnapshot ?? '',
          projectStageSnapshot: hints?.projectStageSnapshot ?? '',
          projectLookupId: hints?.projectLookupId,
          legacyRegistryItemId: hints?.legacyRegistryItemId,
        };
      },
      findInspectionsForProjectWeek: async (filter) => {
        const descriptor = this.list('SafetyInspectionEvents');
        const rows = await this.graph.listItems(descriptor.siteUrl, descriptor.id, {
          filter:
            `fields/ReportingPeriodIdLookupId eq ${spItemIdFromString(filter.reportingPeriodId)} and ` +
            `fields/ProjectNumber eq '${escapeGraphString(filter.projectNumber)}'`,
          top: 500,
          select: INSPECTION_SELECT,
        });
        return rows.map(mapInspectionEvent);
      },
      findFindingsForProjectWeek: async (filter) => {
        const descriptor = this.list('SafetyFindings');
        const rows = await this.graph.listItems(descriptor.siteUrl, descriptor.id, {
          filter: `fields/ProjectWeekRecordIdLookupId eq ${filter.projectWeekRecordSpItemId}`,
          top: 500,
          select: ['Severity', 'InspectionEventIdLookupId'],
        });
        return rows.map((row) => ({
          severity: String(row.fields.Severity ?? 'info') as SafetyFinding['severity'],
          inspectionEventId: `ie-${toNumber(row.fields.InspectionEventIdLookupId)}`,
        }));
      },
      resolveReportingPeriod: async (reportingPeriodId: string) => this.getReportingPeriod(reportingPeriodId),
      ensureProjectWeekRecord: async (
        resolution,
        reportingPeriodId,
        reportingPeriodSpItemId,
        weekStartDate,
      ) => {
        const existing = await this.getProjectWeek(reportingPeriodId, resolution.projectNumber);
        if (existing) return existing;
        return this.createProjectWeekRecord(
          resolution,
          reportingPeriodId,
          reportingPeriodSpItemId,
          weekStartDate,
        );
      },
      persistCommit: async (drafts) => this.commit(drafts),
      markInspectionSuperseded: async (priorId: string, replacementId: string) =>
        this.markInspectionSuperseded(priorId, replacementId),
      recordIngestionRun: async (runDraft: SafetyIngestionRunDraft) => this.insertIngestionRun(runDraft),
    };
  }

  private async uploadWorkbook(fileName: string, bytes: ArrayBuffer): Promise<{
    sourceUploadItemId: number;
    sourceUploadWebUrl: string;
    checksum: string;
  }> {
    const library = resolveUploadLibraryDescriptor();
    const upload = await this.graph.uploadFileToLibrary({
      siteUrl: library.siteUrl,
      listId: library.id,
      fileName,
      bytes,
    });
    return {
      sourceUploadItemId: upload.listItemId,
      sourceUploadWebUrl: upload.webUrl,
      checksum: await computeChecksum(bytes),
    };
  }

  private async resolveProject(
    projectSiteText: string,
    projectNumberHint?: string,
  ): Promise<ProjectResolutionResult | null> {
    const projectNumber = projectNumberHint ?? extractProjectNumber(projectSiteText);
    if (!projectNumber) return null;

    const projects = this.list('Projects');
    const projectRows = await this.graph.listItems(projects.siteUrl, projects.id, {
      filter: `fields/${PROJECTS_FIELD.NUMBER} eq '${escapeGraphString(projectNumber)}'`,
      top: 1,
      select: [PROJECTS_FIELD.NUMBER, PROJECTS_FIELD.NAME, PROJECTS_FIELD.LOCATION, PROJECTS_FIELD.STAGE],
    });
    const projectMatch = projectRows[0];
    if (projectMatch) {
      return {
        classification: 'project',
        projectNumber: String(projectMatch.fields[PROJECTS_FIELD.NUMBER] ?? projectNumber),
        projectNameSnapshot: String(projectMatch.fields[PROJECTS_FIELD.NAME] ?? ''),
        projectLocationSnapshot: String(projectMatch.fields[PROJECTS_FIELD.LOCATION] ?? ''),
        projectStageSnapshot: String(projectMatch.fields[PROJECTS_FIELD.STAGE] ?? ''),
        projectLookupId: Number(projectMatch.id),
      };
    }

    const legacy = this.list('LegacyProjectFallbackRegistry');
    const legacyRows = await this.graph.listItems(legacy.siteUrl, legacy.id, {
      filter: `fields/ProjectNumber eq '${escapeGraphString(projectNumber)}'`,
      top: 1,
      select: ['ProjectNumber', 'ProjectNameRaw', 'MatchedProjectListItemId'],
    });
    const legacyMatch = legacyRows[0];
    if (!legacyMatch) return null;

    const matchedProjectId = toOptionalNumber(legacyMatch.fields.MatchedProjectListItemId);
    return {
      classification: matchedProjectId ? 'project+legacy' : 'legacy-only',
      projectNumber: String(legacyMatch.fields.ProjectNumber ?? projectNumber),
      projectNameSnapshot: String(legacyMatch.fields.ProjectNameRaw ?? ''),
      projectLocationSnapshot: '',
      projectStageSnapshot: '',
      legacyRegistryItemId: Number(legacyMatch.id),
      projectLookupId: matchedProjectId ?? undefined,
    };
  }

  private async getProjectWeek(
    reportingPeriodId: string,
    projectNumber: string,
  ): Promise<SafetyProjectWeekRecord | null> {
    const descriptor = this.list('SafetyProjectWeekRecords');
    const rows = await this.graph.listItems(descriptor.siteUrl, descriptor.id, {
      filter:
        `fields/ReportingPeriodIdLookupId eq ${spItemIdFromString(reportingPeriodId)} and ` +
        `fields/ProjectNumber eq '${escapeGraphString(projectNumber)}'`,
      top: 1,
      select: PROJECT_WEEK_SELECT,
    });
    return rows[0] ? mapProjectWeek(rows[0]) : null;
  }

  private async createProjectWeekRecord(
    resolution: ProjectResolutionResult,
    reportingPeriodId: string,
    reportingPeriodSpItemId: number,
    weekStartDate: string,
  ): Promise<SafetyProjectWeekRecord> {
    const descriptor = this.list('SafetyProjectWeekRecords');
    const payload: Record<string, unknown> = {
      Title: `${resolution.projectNumber} — ${weekStartDate}`,
      ReportingPeriodIdLookupId: reportingPeriodSpItemId,
      ProjectNumber: resolution.projectNumber,
      ProjectNameSnapshot: resolution.projectNameSnapshot,
      ProjectLocationSnapshot: resolution.projectLocationSnapshot,
      ProjectStageSnapshot: resolution.projectStageSnapshot,
      ProjectSourceClassification: resolution.classification,
      ExpectedInspectionThisWeek: true,
      InspectionCount: 0,
      PublishStatus: 'in-progress',
      ManagerReviewStatus: 'not-required',
      WeeklySummary: '',
    };
    if (resolution.projectLookupId !== undefined) {
      payload.ProjectLookupIdLookupId = resolution.projectLookupId;
    }
    if (resolution.legacyRegistryItemId !== undefined) {
      payload.LegacyRegistryItemId = resolution.legacyRegistryItemId;
    }

    const created = await this.graph.createItem(descriptor.siteUrl, descriptor.id, payload);
    const mapped = mapProjectWeek(created);
    return { ...mapped, reportingPeriodId, reportingPeriodSpItemId };
  }

  private async commit(drafts: {
    inspectionEventDraft: SafetyInspectionEventDraft;
    findingDrafts: ReadonlyArray<SafetyFindingDraft>;
    projectWeekRecordUpdate: SafetyProjectWeekRecord;
  }): Promise<CommittedArtifacts> {
    const ieDescriptor = this.list('SafetyInspectionEvents');
    const createdInspection = await this.graph.createItem(ieDescriptor.siteUrl, ieDescriptor.id, {
      Title: drafts.inspectionEventDraft.title,
      ProjectWeekRecordIdLookupId: drafts.inspectionEventDraft.projectWeekRecordSpItemId,
      ReportingPeriodIdLookupId: drafts.inspectionEventDraft.reportingPeriodSpItemId,
      SourceUploadItemId: drafts.inspectionEventDraft.sourceUploadItemId,
      SourceUploadWebUrl: drafts.inspectionEventDraft.sourceUploadWebUrl,
      Checksum: drafts.inspectionEventDraft.checksum,
      TemplateVersion: drafts.inspectionEventDraft.templateVersion,
      ParserVersion: drafts.inspectionEventDraft.parserVersion,
      ScoringMode: drafts.inspectionEventDraft.scoringMode,
      InspectionDate: drafts.inspectionEventDraft.inspectionDate,
      InspectionNumber: drafts.inspectionEventDraft.inspectionNumber,
      InspectorName: drafts.inspectionEventDraft.inspectorName,
      InspectorUpn: drafts.inspectionEventDraft.inspectorUpn,
      ProjectNumber: drafts.inspectionEventDraft.projectNumber,
      ProjectNameSnapshot: drafts.inspectionEventDraft.projectNameSnapshot,
      InspectionScore: drafts.inspectionEventDraft.inspectionScore,
      TotalYes: drafts.inspectionEventDraft.totalYes,
      TotalNo: drafts.inspectionEventDraft.totalNo,
      TotalNA: drafts.inspectionEventDraft.totalNa,
      RawChecklistJson: drafts.inspectionEventDraft.rawChecklistJson,
      IngestionStatus: drafts.inspectionEventDraft.ingestionStatus,
      DuplicateStatus: drafts.inspectionEventDraft.duplicateStatus,
      RequiresReview: drafts.inspectionEventDraft.requiresReview,
      SubmittedAt: drafts.inspectionEventDraft.submittedAt,
      CommittedAt: drafts.inspectionEventDraft.committedAt,
    });

    const inspectionEventId = Number(createdInspection.id);
    const inspectionEvent: SafetyInspectionEvent = {
      id: `ie-${inspectionEventId}`,
      spItemId: inspectionEventId,
      ...drafts.inspectionEventDraft,
    };

    const findingsDescriptor = this.list('SafetyFindings');
    const findings: SafetyFinding[] = [];
    for (const draft of drafts.findingDrafts) {
      const createdFinding = await this.graph.createItem(findingsDescriptor.siteUrl, findingsDescriptor.id, {
        Title: draft.title,
        InspectionEventIdLookupId: inspectionEvent.spItemId,
        ProjectWeekRecordIdLookupId: draft.projectWeekRecordSpItemId,
        SectionNumber: draft.sectionNumber,
        SectionName: draft.sectionName,
        ChecklistRowNumber: draft.checklistRowNumber,
        ChecklistItemLabel: draft.checklistItemLabel,
        FindingType: draft.findingType,
        Severity: draft.severity,
        FindingSummary: draft.findingSummary,
        OriginalNoteText: draft.originalNoteText,
        RequiresCorrectiveAction: draft.requiresCorrectiveAction,
        IsOpen: draft.isOpen,
      });

      const findingId = Number(createdFinding.id);
      findings.push({
        id: `fd-${findingId}`,
        spItemId: findingId,
        inspectionEventId: inspectionEvent.id,
        inspectionEventSpItemId: inspectionEvent.spItemId,
        ...draft,
      });
    }

    await this.updateProjectWeekRollup(drafts.projectWeekRecordUpdate);

    return {
      inspectionEvent,
      findings,
      projectWeekRecord: drafts.projectWeekRecordUpdate,
    };
  }

  private async updateProjectWeekRollup(record: SafetyProjectWeekRecord): Promise<void> {
    const descriptor = this.list('SafetyProjectWeekRecords');
    await this.graph.updateItem(descriptor.siteUrl, descriptor.id, record.spItemId, {
      InspectionCount: record.inspectionCount,
      AverageInspectionScore: record.averageInspectionScore,
      HighestRiskFindingLevel: record.highestRiskFindingLevel,
      PublishStatus: record.publishStatus,
    });
  }

  private async markInspectionSuperseded(
    priorInspectionEventId: string,
    replacementInspectionEventId: string,
  ): Promise<void> {
    const descriptor = this.list('SafetyInspectionEvents');
    await this.graph.updateItem(
      descriptor.siteUrl,
      descriptor.id,
      spItemIdFromString(priorInspectionEventId),
      {
        IngestionStatus: 'superseded',
        SupersededByInspectionEventIdLookupId: spItemIdFromString(replacementInspectionEventId),
      },
    );
  }

  private async insertIngestionRun(draft: SafetyIngestionRunDraft): Promise<SafetyIngestionRun> {
    const descriptor = this.list('SafetyIngestionRuns');
    const payload: Record<string, unknown> = {
      Title: draft.title,
      SourceUploadItemId: draft.sourceUploadItemId,
      UploadFileName: draft.uploadFileName,
      TemplateVersionDetected: draft.templateVersionDetected,
      Checksum: draft.checksum,
      ValidationStatus: draft.validationStatus,
      ParseStatus: draft.parseStatus,
      ProjectResolutionStatus: draft.projectResolutionStatus,
      TerminalStatus: draft.terminalStatus,
      CommittedEntityIdsJson: draft.committedEntityIdsJson,
      ErrorClass: draft.errorClass,
      ErrorSummary: draft.errorSummary,
      RunStartedAt: draft.runStartedAt,
      RunCompletedAt: draft.runCompletedAt,
      AttemptNumber: draft.attemptNumber,
      AttemptedProjectSiteText: draft.attemptedProjectSiteText,
      ResolvedProjectNumber: draft.resolvedProjectNumber,
      ProjectSourceClassification: draft.projectSourceClassification,
      ReviewStatus: draft.reviewStatus,
    };

    if (draft.reportingPeriodSpItemId !== undefined) {
      payload.ReportingPeriodIdLookupId = draft.reportingPeriodSpItemId;
    }
    if (draft.parentRunSpItemId !== undefined) {
      payload.ParentRunIdLookupId = draft.parentRunSpItemId;
    }

    const created = await this.graph.createItem(descriptor.siteUrl, descriptor.id, payload);
    return {
      id: `run-${created.id}`,
      spItemId: Number(created.id),
      ...draft,
    };
  }

  private list(name: Parameters<typeof resolveDescriptor>[0]): SiteScopedListDescriptor {
    return resolveDescriptor(name);
  }
}

const PROJECT_WEEK_SELECT = [
  'Title',
  'ReportingPeriodIdLookupId',
  'ProjectNumber',
  'ProjectNameSnapshot',
  'ProjectLocationSnapshot',
  'ProjectStageSnapshot',
  'ProjectSourceClassification',
  'ProjectLookupIdLookupId',
  'LegacyRegistryItemId',
  'ExpectedInspectionThisWeek',
  'InspectionCount',
  'AverageInspectionScore',
  'HighestRiskFindingLevel',
  'WeeklySummary',
  'ManagerReviewStatus',
  'PublishStatus',
] as const;

const INSPECTION_SELECT = [
  'Title',
  'ProjectWeekRecordIdLookupId',
  'ReportingPeriodIdLookupId',
  'SourceUploadItemId',
  'SourceUploadWebUrl',
  'Checksum',
  'TemplateVersion',
  'ParserVersion',
  'ScoringMode',
  'InspectionDate',
  'InspectionNumber',
  'InspectorName',
  'InspectorUpn',
  'ProjectNumber',
  'ProjectNameSnapshot',
  'InspectionScore',
  'TotalYes',
  'TotalNo',
  'TotalNA',
  'RawChecklistJson',
  'IngestionStatus',
  'DuplicateStatus',
  'RequiresReview',
  'SubmittedAt',
  'CommittedAt',
  'SupersededByInspectionEventIdLookupId',
] as const;

function mapReportingPeriod(row: IGraphListItem): SafetyReportingPeriod {
  const id = Number(row.id);
  return {
    id: `period-${id}`,
    spItemId: id,
    title: String(row.fields.Title ?? ''),
    weekStartDate: sliceDate(row.fields.WeekStartDate),
    weekEndDate: sliceDate(row.fields.WeekEndDate),
    periodLabel: String(row.fields.PeriodLabel ?? row.fields.Title ?? ''),
    status: toStatus(row.fields.Status),
    publishedAt: optionalString(row.fields.PublishedAt),
    notes: optionalString(row.fields.Notes),
  };
}

function mapProjectWeek(row: IGraphListItem): SafetyProjectWeekRecord {
  const id = Number(row.id);
  const reportingPeriodSpItemId =
    toOptionalNumber(row.fields.ReportingPeriodIdLookupId) ??
    toOptionalNumber(row.fields.ReportingPeriodId) ??
    0;
  return {
    id: `pw-${id}`,
    spItemId: id,
    title: String(row.fields.Title ?? ''),
    reportingPeriodId: `period-${reportingPeriodSpItemId}`,
    reportingPeriodSpItemId,
    projectNumber: String(row.fields.ProjectNumber ?? ''),
    projectNameSnapshot: String(row.fields.ProjectNameSnapshot ?? ''),
    projectLocationSnapshot: String(row.fields.ProjectLocationSnapshot ?? ''),
    projectStageSnapshot: String(row.fields.ProjectStageSnapshot ?? ''),
    projectSourceClassification: toProjectSource(row.fields.ProjectSourceClassification),
    projectLookupId: toOptionalNumber(row.fields.ProjectLookupIdLookupId) ?? undefined,
    legacyRegistryItemId: toOptionalNumber(row.fields.LegacyRegistryItemId) ?? undefined,
    expectedInspectionThisWeek: Boolean(row.fields.ExpectedInspectionThisWeek ?? false),
    inspectionCount: toNumber(row.fields.InspectionCount),
    averageInspectionScore: toOptionalNumber(row.fields.AverageInspectionScore),
    highestRiskFindingLevel: toFindingSeverity(row.fields.HighestRiskFindingLevel),
    weeklySummary: String(row.fields.WeeklySummary ?? ''),
    managerReviewStatus: toManagerStatus(row.fields.ManagerReviewStatus),
    publishStatus: toPublishStatus(row.fields.PublishStatus),
  };
}

function mapInspectionEvent(row: IGraphListItem): SafetyInspectionEvent {
  const id = Number(row.id);
  const projectWeekSpItemId = toNumber(row.fields.ProjectWeekRecordIdLookupId);
  const reportingSpItemId = toNumber(row.fields.ReportingPeriodIdLookupId);
  return {
    id: `ie-${id}`,
    spItemId: id,
    title: String(row.fields.Title ?? ''),
    projectWeekRecordId: `pw-${projectWeekSpItemId}`,
    projectWeekRecordSpItemId: projectWeekSpItemId,
    reportingPeriodId: `period-${reportingSpItemId}`,
    reportingPeriodSpItemId: reportingSpItemId,
    sourceUploadItemId: toNumber(row.fields.SourceUploadItemId),
    sourceUploadWebUrl: String(row.fields.SourceUploadWebUrl ?? ''),
    checksum: String(row.fields.Checksum ?? ''),
    templateVersion: String(row.fields.TemplateVersion ?? ''),
    parserVersion: String(row.fields.ParserVersion ?? ''),
    scoringMode: toScoringMode(row.fields.ScoringMode),
    inspectionDate: sliceDate(row.fields.InspectionDate),
    inspectionNumber: String(row.fields.InspectionNumber ?? ''),
    inspectorName: optionalString(row.fields.InspectorName),
    inspectorUpn: optionalString(row.fields.InspectorUpn),
    projectNumber: String(row.fields.ProjectNumber ?? ''),
    projectNameSnapshot: String(row.fields.ProjectNameSnapshot ?? ''),
    inspectionScore: toNumber(row.fields.InspectionScore),
    totalYes: toNumber(row.fields.TotalYes),
    totalNo: toNumber(row.fields.TotalNo),
    totalNa: toNumber(row.fields.TotalNA),
    rawChecklistJson: String(row.fields.RawChecklistJson ?? ''),
    ingestionStatus: toInspectionStatus(row.fields.IngestionStatus),
    duplicateStatus: toDuplicateStatus(row.fields.DuplicateStatus),
    requiresReview: Boolean(row.fields.RequiresReview ?? false),
    submittedAt: toIsoString(row.fields.SubmittedAt),
    committedAt: optionalString(row.fields.CommittedAt),
    supersededByInspectionEventId: toOptionalNumber(row.fields.SupersededByInspectionEventIdLookupId)
      ? `ie-${toNumber(row.fields.SupersededByInspectionEventIdLookupId)}`
      : undefined,
  };
}

function spItemIdFromString(value: string): number {
  const tail = value.split('-').pop() ?? '';
  const itemId = Number(tail);
  if (!Number.isFinite(itemId) || itemId <= 0) {
    throw new Error(`Cannot derive SharePoint item Id from ${value}`);
  }
  return itemId;
}

function extractProjectNumber(projectSiteText: string): string | null {
  const match = projectSiteText.match(/\d{4}-\d{2,4}/);
  return match ? match[0] : null;
}

function escapeGraphString(value: string): string {
  return value.replace(/'/g, "''");
}

function sliceDate(value: unknown): string {
  const text = String(value ?? '');
  return text.length >= 10 ? text.slice(0, 10) : text;
}

function toNumber(value: unknown): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function toOptionalNumber(value: unknown): number | null {
  const n = Number(value ?? NaN);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function optionalString(value: unknown): string | undefined {
  const text = String(value ?? '').trim();
  return text.length > 0 ? text : undefined;
}

function toIsoString(value: unknown): string {
  const text = String(value ?? '').trim();
  return text.length > 0 ? text : new Date(0).toISOString();
}

function toStatus(value: unknown): SafetyReportingPeriod['status'] {
  const text = String(value ?? 'open');
  if (text === 'closed' || text === 'published') return text;
  return 'open';
}

function toProjectSource(value: unknown): SafetyProjectWeekRecord['projectSourceClassification'] {
  const text = String(value ?? 'unresolved');
  if (text === 'project' || text === 'legacy-only' || text === 'project+legacy' || text === 'unresolved') {
    return text;
  }
  return 'unresolved';
}

function toFindingSeverity(value: unknown): SafetyProjectWeekRecord['highestRiskFindingLevel'] {
  const text = String(value ?? '').trim();
  if (text === 'info' || text === 'medium' || text === 'high') return text;
  return null;
}

function toManagerStatus(value: unknown): SafetyProjectWeekRecord['managerReviewStatus'] {
  const text = String(value ?? 'not-required');
  if (text === 'pending' || text === 'approved') return text;
  return 'not-required';
}

function toPublishStatus(value: unknown): SafetyProjectWeekRecord['publishStatus'] {
  const text = String(value ?? 'in-progress');
  if (
    text === 'not-started' ||
    text === 'awaiting-upload' ||
    text === 'in-progress' ||
    text === 'completed' ||
    text === 'review-required' ||
    text === 'published'
  ) {
    return text;
  }
  return 'in-progress';
}

function toScoringMode(value: unknown): SafetyInspectionEvent['scoringMode'] {
  return String(value ?? 'normalized-vNext') === 'template-compat-v1'
    ? 'template-compat-v1'
    : 'normalized-vNext';
}

function toInspectionStatus(value: unknown): SafetyInspectionEvent['ingestionStatus'] {
  const text = String(value ?? 'accepted');
  if (text === 'accepted' || text === 'duplicate-suspected' || text === 'superseded' || text === 'review-required' || text === 'rejected') {
    return text;
  }
  return 'accepted';
}

function toDuplicateStatus(value: unknown): SafetyInspectionEvent['duplicateStatus'] {
  const text = String(value ?? 'none');
  if (text === 'near-duplicate' || text === 'high-confidence-duplicate') return text;
  return 'none';
}
