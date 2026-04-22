import type {
  IngestionRunResult,
  SafetyFinding,
  SafetyIngestionRun,
  SafetyInspectionEvent,
  SafetyProjectWeekRecord,
  SafetyReportingPeriod,
  UploadContext,
  UploadedWorkbookRef,
} from '../../domain/types.js';
import type {
  ISafetyInspectionRepository,
  IngestionRunFilter,
  InspectionFilter,
  ProjectWeekFilter,
  ReviewQueueEntry,
} from '../../ports/ISafetyInspectionRepository.js';
import { runIngestionPipeline } from '../../ingestion/runIngestionPipeline.js';
import type { IngestionAdapter } from '../../ingestion/runIngestionPipeline.js';
import { readWorkbookFromFile, computeChecksum } from '../../parser/xlsxWorkbookView.js';
import { buildSeed } from './seedData.js';

export class MockSafetyInspectionRepository implements ISafetyInspectionRepository {
  private readonly periods: SafetyReportingPeriod[];
  private readonly projectWeeks: SafetyProjectWeekRecord[];
  private readonly inspections: SafetyInspectionEvent[];
  private readonly findings: SafetyFinding[];
  private readonly ingestionRuns: SafetyIngestionRun[];
  private idSeq = 10_000;

  constructor() {
    const seed = buildSeed();
    this.periods = [seed.period];
    this.projectWeeks = [...seed.projectWeeks];
    this.inspections = [...seed.inspections];
    this.findings = [...seed.findings];
    this.ingestionRuns = [...seed.ingestionRuns];
  }

  async listReportingPeriods(): Promise<ReadonlyArray<SafetyReportingPeriod>> {
    return [...this.periods];
  }

  async getReportingPeriod(id: string): Promise<SafetyReportingPeriod | null> {
    return this.periods.find((p) => p.id === id) ?? null;
  }

  async createReportingPeriod(
    input: Omit<SafetyReportingPeriod, 'id'>,
  ): Promise<SafetyReportingPeriod> {
    const created: SafetyReportingPeriod = { ...input, id: `period-${++this.idSeq}` };
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
    const reviewStatuses: ReadonlyArray<string> = ['review-required', 'invalid-template', 'commit-failed'];
    const runs = await this.listIngestionRuns({ terminalStatus: reviewStatuses, reportingPeriodId });
    return runs.map((run) => {
      const committed = safelyParseJson(run.committedEntityIdsJson);
      const inspectionEventId =
        committed && typeof committed.inspectionEventId === 'string' ? committed.inspectionEventId : undefined;
      const inspection = inspectionEventId ? this.inspections.find((ie) => ie.id === inspectionEventId) : undefined;
      return {
        run,
        inspectionEventId,
        projectNumber: inspection?.projectNumber,
        projectNameSnapshot: inspection?.projectNameSnapshot,
        reason: run.errorSummary ?? run.terminalStatus,
      };
    });
  }

  async ingestWorkbook(file: File | Blob, context: UploadContext): Promise<IngestionRunResult> {
    const buffer = await file.arrayBuffer();
    const checksum = await computeChecksum(buffer);
    const view = await readWorkbookFromFile(new Blob([buffer]));

    const uploadedRef: UploadedWorkbookRef = {
      sourceUploadItemId: this.idSeq++,
      sourceUploadWebUrl: `https://mock.local/${context.fileName}`,
      checksum,
    };

    const adapter: IngestionAdapter = {
      resolveProject: async (projectSiteText, projectNumberHint) => {
        const hint = projectNumberHint ?? extractProjectNumber(projectSiteText);
        const match = this.projectWeeks.find((pw) => pw.projectNumber === hint);
        if (!match) {
          return null;
        }
        return {
          classification: 'project',
          projectNumber: match.projectNumber,
          projectNameSnapshot: match.projectNameSnapshot,
          projectLocationSnapshot: match.projectLocationSnapshot,
          projectStageSnapshot: match.projectStageSnapshot,
        };
      },
      findRecentInspectionsForProject: async (projectNumber, inspectionDate) =>
        this.inspections.filter(
          (ie) => ie.projectNumber === projectNumber && ie.inspectionDate === inspectionDate,
        ),
      persistCommit: async (committed) => {
        this.inspections.push(committed.inspectionEvent);
        this.findings.push(...committed.findings);
        const existingIdx = this.projectWeeks.findIndex(
          (pw) => pw.id === committed.projectWeekRecord.id,
        );
        if (existingIdx >= 0) this.projectWeeks[existingIdx] = committed.projectWeekRecord;
        else this.projectWeeks.push(committed.projectWeekRecord);
      },
      ensureProjectWeekRecord: async (resolution, reportingPeriodId, weekStartDate) => {
        const existing = this.projectWeeks.find(
          (pw) =>
            pw.reportingPeriodId === reportingPeriodId &&
            pw.projectNumber === resolution.projectNumber,
        );
        if (existing) return existing;
        const created: SafetyProjectWeekRecord = {
          id: `pw-${resolution.projectNumber}-${weekStartDate}`,
          title: `${resolution.projectNumber} — ${weekStartDate}`,
          reportingPeriodId,
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
      recordIngestionRun: async (run) => {
        this.ingestionRuns.push(run);
      },
      allocateId: (prefix) => `${prefix}-${++this.idSeq}`,
    };

    return runIngestionPipeline({
      view,
      context,
      uploadedRef,
      adapter,
    });
  }

  async retryIngestion(ingestionRunId: string): Promise<IngestionRunResult> {
    const existing = this.ingestionRuns.find((r) => r.id === ingestionRunId);
    if (!existing) throw new Error(`Ingestion run not found: ${ingestionRunId}`);
    throw new Error('Mock retryIngestion: source workbook is not retained; re-upload required.');
  }
}

function safelyParseJson(value: string): Record<string, unknown> | null {
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function extractProjectNumber(projectSiteText: string): string {
  const match = projectSiteText.match(/\d{4}-\d{2,4}/);
  return match ? match[0] : projectSiteText.trim();
}
