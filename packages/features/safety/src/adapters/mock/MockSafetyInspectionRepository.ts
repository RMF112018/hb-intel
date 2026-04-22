import type {
  CommittedArtifacts,
  IngestionRunResult,
  SafetyFinding,
  SafetyIngestionRun,
  SafetyIngestionRunDraft,
  SafetyInspectionEvent,
  SafetyProjectWeekRecord,
  SafetyReportingPeriod,
  UploadContext,
  UploadedWorkbookRef,
} from '../../domain/types.js';
import {
  REVIEW_QUEUE_TERMINAL_STATUSES,
  type ISafetyInspectionRepository,
  type IngestionRunFilter,
  type InspectionFilter,
  type ProjectWeekFilter,
  type ProjectWeekInspectionFilter,
  type ReplayOptions,
  type ReviewQueueEntry,
} from '../../ports/ISafetyInspectionRepository.js';
import { runIngestionPipeline } from '../../ingestion/runIngestionPipeline.js';
import type { IngestionAdapter } from '../../ingestion/runIngestionPipeline.js';
import { readWorkbookFromArrayBuffer, computeChecksum } from '../../parser/xlsxWorkbookView.js';
import { buildSeed } from './seedData.js';

interface RetainedUpload {
  readonly bytes: ArrayBuffer;
  readonly fileName: string;
  readonly uploadedByUpn: string;
  readonly uploadedAt: string;
  readonly reportingPeriodId: string;
  readonly reportingPeriodSpItemId: number;
  readonly checksum: string;
}

export class MockSafetyInspectionRepository implements ISafetyInspectionRepository {
  private readonly periods: SafetyReportingPeriod[];
  private readonly projectWeeks: SafetyProjectWeekRecord[];
  private readonly inspections: SafetyInspectionEvent[];
  private readonly findings: SafetyFinding[];
  private readonly ingestionRuns: SafetyIngestionRun[];
  private readonly retainedUploads = new Map<number, RetainedUpload>();
  private spItemIdSeqByPrefix: Record<string, number> = {
    period: 1000,
    pw: 2000,
    ie: 3000,
    fd: 4000,
    run: 5000,
  };
  private uploadIdSeq = 9000;

  constructor() {
    const seed = buildSeed();
    this.periods = [seed.period];
    this.projectWeeks = [...seed.projectWeeks];
    this.inspections = [...seed.inspections];
    this.findings = [...seed.findings];
    this.ingestionRuns = [...seed.ingestionRuns];

    this.spItemIdSeqByPrefix.period = Math.max(
      this.spItemIdSeqByPrefix.period,
      ...this.periods.map((p) => p.spItemId),
    );
    this.spItemIdSeqByPrefix.pw = Math.max(
      this.spItemIdSeqByPrefix.pw,
      ...this.projectWeeks.map((pw) => pw.spItemId),
    );
    this.spItemIdSeqByPrefix.ie = Math.max(
      this.spItemIdSeqByPrefix.ie,
      ...this.inspections.map((ie) => ie.spItemId),
    );
    this.spItemIdSeqByPrefix.fd = Math.max(
      this.spItemIdSeqByPrefix.fd,
      ...this.findings.map((f) => f.spItemId),
    );
    this.spItemIdSeqByPrefix.run = Math.max(
      this.spItemIdSeqByPrefix.run,
      ...this.ingestionRuns.map((r) => r.spItemId),
    );
  }

  async listReportingPeriods(): Promise<ReadonlyArray<SafetyReportingPeriod>> {
    return [...this.periods];
  }

  async getReportingPeriod(id: string): Promise<SafetyReportingPeriod | null> {
    return this.periods.find((p) => p.id === id) ?? null;
  }

  async createReportingPeriod(
    input: Omit<SafetyReportingPeriod, 'id' | 'spItemId'>,
  ): Promise<SafetyReportingPeriod> {
    const spItemId = this.nextSpItemId('period');
    const created: SafetyReportingPeriod = { ...input, spItemId, id: `period-${spItemId}` };
    this.periods.push(created);
    return created;
  }

  async listProjectWeeks(
    filter: ProjectWeekFilter,
  ): Promise<ReadonlyArray<SafetyProjectWeekRecord>> {
    return this.projectWeeks.filter(
      (pw) => !filter.reportingPeriodId || pw.reportingPeriodId === filter.reportingPeriodId,
    );
  }

  async getProjectWeek(
    reportingPeriodId: string,
    projectNumber: string,
  ): Promise<SafetyProjectWeekRecord | null> {
    return (
      this.projectWeeks.find(
        (pw) => pw.reportingPeriodId === reportingPeriodId && pw.projectNumber === projectNumber,
      ) ?? null
    );
  }

  async listInspections(
    filter: InspectionFilter,
  ): Promise<ReadonlyArray<SafetyInspectionEvent>> {
    return this.inspections.filter((ie) => {
      if (filter.reportingPeriodId && ie.reportingPeriodId !== filter.reportingPeriodId) return false;
      if (filter.projectNumber && ie.projectNumber !== filter.projectNumber) return false;
      if (filter.requiresReview !== undefined && ie.requiresReview !== filter.requiresReview) return false;
      return true;
    });
  }

  async findInspectionsForProjectWeek(
    filter: ProjectWeekInspectionFilter,
  ): Promise<ReadonlyArray<SafetyInspectionEvent>> {
    return this.inspections.filter(
      (ie) =>
        ie.projectNumber === filter.projectNumber &&
        ie.reportingPeriodId === filter.reportingPeriodId,
    );
  }

  async getInspection(id: string): Promise<SafetyInspectionEvent | null> {
    return this.inspections.find((ie) => ie.id === id) ?? null;
  }

  async listFindingsForInspection(
    inspectionEventId: string,
  ): Promise<ReadonlyArray<SafetyFinding>> {
    return this.findings.filter((f) => f.inspectionEventId === inspectionEventId);
  }

  async listIngestionRuns(
    filter: IngestionRunFilter,
  ): Promise<ReadonlyArray<SafetyIngestionRun>> {
    return this.ingestionRuns.filter((run) => {
      if (filter.reportingPeriodId && run.reportingPeriodId !== filter.reportingPeriodId) return false;
      if (
        filter.terminalStatus &&
        filter.terminalStatus.length > 0 &&
        !filter.terminalStatus.includes(run.terminalStatus)
      ) {
        return false;
      }
      return true;
    });
  }

  async listReviewQueue(reportingPeriodId?: string): Promise<ReadonlyArray<ReviewQueueEntry>> {
    const runs = await this.listIngestionRuns({
      terminalStatus: REVIEW_QUEUE_TERMINAL_STATUSES,
      reportingPeriodId,
    });
    return runs.map((run) => {
      const committed = safelyParseJson(run.committedEntityIdsJson);
      const inspectionEventId =
        committed && typeof committed.inspectionEventId === 'string'
          ? committed.inspectionEventId
          : undefined;
      const inspection = inspectionEventId
        ? this.inspections.find((ie) => ie.id === inspectionEventId)
        : undefined;
      return {
        run,
        inspectionEventId,
        projectNumber: run.resolvedProjectNumber ?? inspection?.projectNumber,
        projectNameSnapshot: inspection?.projectNameSnapshot,
        reason: run.errorSummary ?? run.terminalStatus,
      };
    });
  }

  async ingestWorkbook(file: File | Blob, context: UploadContext): Promise<IngestionRunResult> {
    const buffer = await file.arrayBuffer();
    const checksum = await computeChecksum(buffer);
    const sourceUploadItemId = ++this.uploadIdSeq;
    this.retainedUploads.set(sourceUploadItemId, {
      bytes: buffer,
      fileName: context.fileName,
      uploadedByUpn: context.uploadedByUpn,
      uploadedAt: context.uploadedAt,
      reportingPeriodId: context.reportingPeriodId,
      reportingPeriodSpItemId: context.reportingPeriodSpItemId,
      checksum,
    });

    const view = readWorkbookFromArrayBuffer(buffer);
    const uploadedRef: UploadedWorkbookRef = {
      sourceUploadItemId,
      sourceUploadWebUrl: `https://mock.local/${context.fileName}`,
      checksum,
    };

    return runIngestionPipeline({
      view,
      context,
      uploadedRef,
      adapter: this.buildIngestionAdapter(),
    });
  }

  async replayIngestion(
    parentRunId: string,
    options: ReplayOptions = {},
  ): Promise<IngestionRunResult> {
    const parent = this.ingestionRuns.find((r) => r.id === parentRunId);
    if (!parent) throw new Error(`Ingestion run not found: ${parentRunId}`);
    const retained = this.retainedUploads.get(parent.sourceUploadItemId);
    if (!retained) {
      const run = await this.buildIngestionAdapter().recordIngestionRun({
        title: `Replay ${parent.uploadFileName} — attempt ${parent.attemptNumber + 1}`,
        sourceUploadItemId: parent.sourceUploadItemId,
        uploadFileName: parent.uploadFileName,
        templateVersionDetected: undefined,
        checksum: parent.checksum,
        validationStatus: 'skipped' as never,
        parseStatus: 'skipped',
        projectResolutionStatus: 'skipped',
        terminalStatus: 'commit-failed',
        committedEntityIdsJson: '{}',
        errorClass: 'replay-source-missing',
        errorSummary: 'Source workbook is no longer retained in Safety Checklist Uploads.',
        runStartedAt: new Date().toISOString(),
        runCompletedAt: new Date().toISOString(),
        attemptNumber: parent.attemptNumber + 1,
        reportingPeriodId: parent.reportingPeriodId,
        reportingPeriodSpItemId: parent.reportingPeriodSpItemId,
        attemptedProjectSiteText: parent.attemptedProjectSiteText,
        reviewStatus: 'replayed-failed',
        parentRunId: parent.id,
        parentRunSpItemId: parent.spItemId,
      });
      return { run, state: 'commit-failed' };
    }

    const view = readWorkbookFromArrayBuffer(retained.bytes);
    const uploadedRef: UploadedWorkbookRef = {
      sourceUploadItemId: parent.sourceUploadItemId,
      sourceUploadWebUrl: `https://mock.local/${retained.fileName}`,
      checksum: retained.checksum,
    };

    return runIngestionPipeline({
      view,
      context: {
        uploadedByUpn: retained.uploadedByUpn,
        uploadedAt: retained.uploadedAt,
        fileName: retained.fileName,
        reportingPeriodId: retained.reportingPeriodId,
        reportingPeriodSpItemId: retained.reportingPeriodSpItemId,
      },
      uploadedRef,
      adapter: this.buildIngestionAdapter(),
      attemptNumber: parent.attemptNumber + 1,
      parentRunId: parent.id,
      parentRunSpItemId: parent.spItemId,
      supersedePrior: options.supersedePrior ?? false,
    });
  }

  async retryIngestion(ingestionRunId: string): Promise<IngestionRunResult> {
    return this.replayIngestion(ingestionRunId);
  }

  private buildIngestionAdapter(): IngestionAdapter {
    return {
      resolveProject: async (projectSiteText, projectNumberHint) => {
        const hint = projectNumberHint ?? extractProjectNumber(projectSiteText);
        if (!hint) return null;
        const match = this.projectWeeks.find((pw) => pw.projectNumber === hint);
        if (!match) return null;
        return {
          classification: 'project',
          projectNumber: match.projectNumber,
          projectNameSnapshot: match.projectNameSnapshot,
          projectLocationSnapshot: match.projectLocationSnapshot,
          projectStageSnapshot: match.projectStageSnapshot,
        };
      },
      // G-03 structured intake authority: honor the operator-entered
      // project selection. Enrichment from the in-memory project-week
      // catalog is used only to populate optional snapshot fields; the
      // operator's projectNumber + classification are authoritative.
      resolveProjectByNumber: async (projectNumber, classification, hints) => {
        const enrich = this.projectWeeks.find((pw) => pw.projectNumber === projectNumber);
        return {
          classification,
          projectNumber,
          projectNameSnapshot:
            hints?.projectNameSnapshot ?? enrich?.projectNameSnapshot ?? '',
          projectLocationSnapshot:
            hints?.projectLocationSnapshot ?? enrich?.projectLocationSnapshot ?? '',
          projectStageSnapshot:
            hints?.projectStageSnapshot ?? enrich?.projectStageSnapshot ?? '',
          projectLookupId: hints?.projectLookupId ?? enrich?.projectLookupId,
          legacyRegistryItemId:
            hints?.legacyRegistryItemId ?? enrich?.legacyRegistryItemId,
        };
      },
      findInspectionsForProjectWeek: async (filter) =>
        this.findInspectionsForProjectWeek(filter),
      findFindingsForProjectWeek: async (filter) =>
        this.findings
          .filter((f) => f.projectWeekRecordSpItemId === filter.projectWeekRecordSpItemId)
          .map((f) => ({ severity: f.severity, inspectionEventId: f.inspectionEventId })),
      resolveReportingPeriod: async (reportingPeriodId) =>
        this.getReportingPeriod(reportingPeriodId),
      ensureProjectWeekRecord: async (
        resolution,
        reportingPeriodId,
        reportingPeriodSpItemId,
        weekStartDate,
      ) => {
        const existing = this.projectWeeks.find(
          (pw) =>
            pw.reportingPeriodId === reportingPeriodId &&
            pw.projectNumber === resolution.projectNumber,
        );
        if (existing) return existing;
        const spItemId = this.nextSpItemId('pw');
        const created: SafetyProjectWeekRecord = {
          id: `pw-${spItemId}`,
          spItemId,
          title: `${resolution.projectNumber} — ${weekStartDate}`,
          reportingPeriodId,
          reportingPeriodSpItemId,
          projectNumber: resolution.projectNumber,
          projectNameSnapshot: resolution.projectNameSnapshot,
          projectLocationSnapshot: resolution.projectLocationSnapshot,
          projectStageSnapshot: resolution.projectStageSnapshot,
          projectSourceClassification: resolution.classification,
          projectLookupId: resolution.projectLookupId,
          legacyRegistryItemId: resolution.legacyRegistryItemId,
          expectedInspectionThisWeek: true,
          inspectionCount: 0,
          averageInspectionScore: null,
          highestRiskFindingLevel: null,
          weeklySummary: '',
          managerReviewStatus: 'not-required',
          publishStatus: 'in-progress',
        };
        this.projectWeeks.push(created);
        return created;
      },
      persistCommit: async (drafts) => {
        const ieSpItemId = this.nextSpItemId('ie');
        const inspectionEvent: SafetyInspectionEvent = {
          id: `ie-${ieSpItemId}`,
          spItemId: ieSpItemId,
          ...drafts.inspectionEventDraft,
        };
        this.inspections.push(inspectionEvent);

        const findings: SafetyFinding[] = drafts.findingDrafts.map((draft) => {
          const fdSpItemId = this.nextSpItemId('fd');
          return {
            id: `fd-${fdSpItemId}`,
            spItemId: fdSpItemId,
            inspectionEventId: inspectionEvent.id,
            inspectionEventSpItemId: inspectionEvent.spItemId,
            ...draft,
          };
        });
        this.findings.push(...findings);

        const existingIdx = this.projectWeeks.findIndex(
          (pw) => pw.id === drafts.projectWeekRecordUpdate.id,
        );
        if (existingIdx >= 0) this.projectWeeks[existingIdx] = drafts.projectWeekRecordUpdate;
        else this.projectWeeks.push(drafts.projectWeekRecordUpdate);

        return {
          inspectionEvent,
          findings,
          projectWeekRecord: drafts.projectWeekRecordUpdate,
        } satisfies CommittedArtifacts;
      },
      markInspectionSuperseded: async (priorId, replacementId) => {
        const idx = this.inspections.findIndex((ie) => ie.id === priorId);
        if (idx < 0) return;
        const prior = this.inspections[idx];
        this.inspections[idx] = {
          ...prior,
          ingestionStatus: 'superseded',
          supersededByInspectionEventId: replacementId,
        };
      },
      recordIngestionRun: async (draft: SafetyIngestionRunDraft) => {
        const spItemId = this.nextSpItemId('run');
        const run: SafetyIngestionRun = {
          id: `run-${spItemId}`,
          spItemId,
          ...draft,
        };
        this.ingestionRuns.push(run);
        return run;
      },
    };
  }

  private nextSpItemId(prefix: 'period' | 'pw' | 'ie' | 'fd' | 'run'): number {
    const next = ++this.spItemIdSeqByPrefix[prefix];
    return next;
  }
}

function safelyParseJson(value: string): Record<string, unknown> | null {
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function extractProjectNumber(projectSiteText: string): string | null {
  const match = projectSiteText.match(/\d{4}-\d{2,4}/);
  return match ? match[0] : null;
}
