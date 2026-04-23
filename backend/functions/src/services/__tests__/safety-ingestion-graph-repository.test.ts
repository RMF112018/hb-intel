import { describe, expect, it, vi } from 'vitest';
import type {
  SafetyFindingDraft,
  SafetyInspectionEventDraft,
  SafetyProjectWeekRecord,
  SafetyIngestionRunDraft,
} from '../../../../../packages/features/safety/src/domain/types.js';
import { configureSafetyListGuids } from '../../../../../packages/features/safety/src/lists/guidConfig.js';
import { SafetyIngestionGraphRepository } from '../safety-ingestion-graph-repository.js';

describe('SafetyIngestionGraphRepository', () => {
  function makeRepository() {
    configureSafetyListGuids({
      SafetyChecklistUploads: '00000000-0000-0000-0000-000000000111',
      SafetyReportingPeriods: '00000000-0000-0000-0000-000000000112',
      SafetyProjectWeekRecords: '00000000-0000-0000-0000-000000000113',
      SafetyInspectionEvents: '00000000-0000-0000-0000-000000000114',
      SafetyFindings: '00000000-0000-0000-0000-000000000115',
      SafetyIngestionRuns: '00000000-0000-0000-0000-000000000116',
      Projects: '00000000-0000-0000-0000-000000000117',
      LegacyProjectFallbackRegistry: '00000000-0000-0000-0000-000000000118',
    });

    const repo = new SafetyIngestionGraphRepository({
      getSharePointToken: vi.fn(),
      acquireAppToken: vi.fn(),
    });

    const fakeGraph = {
      getItemById: vi.fn(),
      listItems: vi.fn(),
      createItem: vi.fn(),
      updateItem: vi.fn(),
      uploadFileToLibrary: vi.fn(),
      downloadFileByListItemId: vi.fn(),
    };

    (repo as unknown as { graph: typeof fakeGraph }).graph = fakeGraph;
    return { repo, fakeGraph };
  }

  it('maps reporting period reads from Graph list items', async () => {
    const { repo, fakeGraph } = makeRepository();
    fakeGraph.getItemById.mockResolvedValue({
      id: '14',
      fields: {
        Title: 'Week of 2026-04-20',
        WeekStartDate: '2026-04-20T00:00:00Z',
        WeekEndDate: '2026-04-24T00:00:00Z',
        PeriodLabel: 'Apr 20 - Apr 24, 2026',
        Status: 'open',
      },
    });

    const period = await repo.getReportingPeriod('period-14');

    expect(period?.id).toBe('period-14');
    expect(period?.spItemId).toBe(14);
    expect(period?.weekStartDate).toBe('2026-04-20');
    expect(fakeGraph.getItemById).toHaveBeenCalledOnce();
  });

  it('creates reporting periods through Graph list item create', async () => {
    const { repo, fakeGraph } = makeRepository();
    fakeGraph.createItem.mockResolvedValue({
      id: '15',
      fields: {
        Title: 'Week of 2026-04-27',
        WeekStartDate: '2026-04-27T00:00:00Z',
        WeekEndDate: '2026-05-01T00:00:00Z',
        PeriodLabel: 'Apr 27 - May 1, 2026',
        Status: 'open',
      },
    });

    const created = await repo.createReportingPeriod({
      title: 'Week of 2026-04-27',
      weekStartDate: '2026-04-27',
      weekEndDate: '2026-05-01',
      periodLabel: 'Apr 27 - May 1, 2026',
      status: 'open',
    });

    expect(created.id).toBe('period-15');
    expect(created.spItemId).toBe(15);
    expect(fakeGraph.createItem).toHaveBeenCalledOnce();
  });

  it('writes inspection event, findings, and project-week rollup through Graph commit flow', async () => {
    const { repo, fakeGraph } = makeRepository();
    fakeGraph.createItem
      .mockResolvedValueOnce({ id: '101', fields: {} })
      .mockResolvedValueOnce({ id: '201', fields: {} });

    const inspectionEventDraft: SafetyInspectionEventDraft = {
      title: 'Inspection #1',
      projectWeekRecordId: 'pw-55',
      projectWeekRecordSpItemId: 55,
      reportingPeriodId: 'period-14',
      reportingPeriodSpItemId: 14,
      sourceUploadItemId: 301,
      sourceUploadWebUrl: 'https://example/upload.xlsx',
      checksum: 'abc123',
      templateVersion: 'v1',
      parserVersion: 'v2',
      scoringMode: 'normalized-vNext',
      inspectionDate: '2026-04-22',
      inspectionNumber: '1',
      inspectorName: 'Inspector',
      inspectorUpn: 'inspector@hbc.test',
      projectNumber: '2026-100',
      projectNameSnapshot: 'Project Name',
      inspectionScore: 92,
      totalYes: 10,
      totalNo: 1,
      totalNa: 2,
      rawChecklistJson: '{}',
      ingestionStatus: 'accepted',
      duplicateStatus: 'none',
      requiresReview: false,
      submittedAt: '2026-04-23T12:00:00Z',
      committedAt: '2026-04-23T12:01:00Z',
    };

    const findingDrafts: SafetyFindingDraft[] = [
      {
        title: 'Finding 1',
        projectWeekRecordId: 'pw-55',
        projectWeekRecordSpItemId: 55,
        sectionNumber: 1,
        sectionName: 'Section A',
        checklistRowNumber: 8,
        checklistItemLabel: 'Wear PPE',
        findingType: 'no-response',
        severity: 'medium',
        findingSummary: 'Missing PPE',
        originalNoteText: '',
        requiresCorrectiveAction: true,
        isOpen: true,
      },
    ];

    const projectWeekRecordUpdate: SafetyProjectWeekRecord = {
      id: 'pw-55',
      spItemId: 55,
      title: '2026-100 - week',
      reportingPeriodId: 'period-14',
      reportingPeriodSpItemId: 14,
      projectNumber: '2026-100',
      projectNameSnapshot: 'Project Name',
      projectLocationSnapshot: 'Site A',
      projectStageSnapshot: 'Construction',
      projectSourceClassification: 'project',
      expectedInspectionThisWeek: true,
      inspectionCount: 1,
      averageInspectionScore: 92,
      highestRiskFindingLevel: 'medium',
      weeklySummary: '',
      managerReviewStatus: 'not-required',
      publishStatus: 'in-progress',
    };

    const committed = await (repo as unknown as {
      commit: (drafts: {
        inspectionEventDraft: SafetyInspectionEventDraft;
        findingDrafts: ReadonlyArray<SafetyFindingDraft>;
        projectWeekRecordUpdate: SafetyProjectWeekRecord;
      }) => Promise<unknown>;
    }).commit({
      inspectionEventDraft,
      findingDrafts,
      projectWeekRecordUpdate,
    });

    expect(committed).toBeTruthy();
    expect(fakeGraph.createItem).toHaveBeenCalledTimes(2);
    expect(fakeGraph.updateItem).toHaveBeenCalledOnce();
  });

  it('uploads workbook to Graph library and resolves listItem id', async () => {
    const { repo, fakeGraph } = makeRepository();
    fakeGraph.uploadFileToLibrary.mockResolvedValue({
      listItemId: 88,
      webUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/Safety/Safety%20Checklist%20Uploads/test.xlsx',
    });

    const result = await (repo as unknown as {
      uploadWorkbook: (fileName: string, bytes: ArrayBuffer) => Promise<{ sourceUploadItemId: number; sourceUploadWebUrl: string; checksum: string }>;
    }).uploadWorkbook('test.xlsx', new Uint8Array([1, 2, 3]).buffer);

    expect(result.sourceUploadItemId).toBe(88);
    expect(result.sourceUploadWebUrl).toContain('test.xlsx');
    expect(result.checksum).toMatch(/^[a-f0-9]{64}$/);
    expect(fakeGraph.uploadFileToLibrary).toHaveBeenCalledOnce();
  });

  it('replays an ingestion run by downloading retained workbook bytes from Graph', async () => {
    const { repo, fakeGraph } = makeRepository();
    fakeGraph.getItemById.mockResolvedValue({
      id: '501',
      fields: {
        Title: 'Ingestion test.xlsx — attempt 1',
        SourceUploadItemId: 88,
        UploadFileName: 'test.xlsx',
        Checksum: 'abc123',
        ValidationStatus: 'passed',
        ParseStatus: 'passed',
        ProjectResolutionStatus: 'resolved',
        TerminalStatus: 'committed',
        CommittedEntityIdsJson: '{}',
        RunStartedAt: '2026-04-23T10:00:00Z',
        RunCompletedAt: '2026-04-23T10:01:00Z',
        AttemptNumber: 1,
        ReportingPeriodIdLookupId: 14,
        ReviewStatus: 'none',
      },
    });
    fakeGraph.downloadFileByListItemId = vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3]).buffer);
    fakeGraph.createItem.mockResolvedValue({ id: '777', fields: {} });

    const result = await repo.replayIngestion({
      parentRunId: 'run-501',
      supersedePrior: true,
    });

    expect(result.state).toBe('invalid-template');
    expect(fakeGraph.getItemById).toHaveBeenCalledOnce();
    expect(fakeGraph.downloadFileByListItemId).toHaveBeenCalledOnce();
  });

  it('persists ingestion runs with lookup parents in Graph field payload', async () => {
    const { repo, fakeGraph } = makeRepository();
    fakeGraph.createItem.mockResolvedValue({ id: '501', fields: {} });

    const draft: SafetyIngestionRunDraft = {
      title: 'run-1',
      sourceUploadItemId: 88,
      uploadFileName: 'test.xlsx',
      templateVersionDetected: 'v1',
      checksum: 'abc',
      validationStatus: 'passed',
      parseStatus: 'passed',
      projectResolutionStatus: 'resolved',
      terminalStatus: 'committed',
      committedEntityIdsJson: '{}',
      runStartedAt: '2026-04-23T10:00:00Z',
      runCompletedAt: '2026-04-23T10:01:00Z',
      attemptNumber: 1,
      reportingPeriodId: 'period-14',
      reportingPeriodSpItemId: 14,
      attemptedProjectSiteText: '2026-100',
      resolvedProjectNumber: '2026-100',
      projectSourceClassification: 'project',
      reviewStatus: 'none',
      parentRunId: 'run-500',
      parentRunSpItemId: 500,
    };

    const run = await (repo as unknown as {
      insertIngestionRun: (input: SafetyIngestionRunDraft) => Promise<{ id: string; spItemId: number }>;
    }).insertIngestionRun(draft);

    expect(run.id).toBe('run-501');
    expect(run.spItemId).toBe(501);
    expect(fakeGraph.createItem).toHaveBeenCalledOnce();
    const payload = fakeGraph.createItem.mock.calls[0]?.[2] as Record<string, unknown>;
    expect(payload.ReportingPeriodIdLookupId).toBe(14);
    expect(payload.ParentRunIdLookupId).toBe(500);
  });

  it('resolves project for preview from operator-entered project context', async () => {
    const { repo } = makeRepository();

    const result = await repo.resolveProjectForPreview({
      context: {
        uploadedByUpn: 'inspector@hbc.test',
        uploadedAt: '2026-04-23T10:00:00Z',
        fileName: 'test.xlsx',
        reportingPeriodId: 'period-14',
        reportingPeriodSpItemId: 14,
        projectNumber: '2026-601',
        projectSourceClassification: 'project',
        projectNameSnapshot: 'Project 601',
        inspectionDate: '2026-04-22',
        inspectionNumber: '2',
      },
      projectSiteText: '2026-001 Legacy Text',
      projectNumberHint: '2026-001',
    });

    expect(result?.projectNumber).toBe('2026-601');
    expect(result?.classification).toBe('project');
    expect(result?.projectNameSnapshot).toBe('Project 601');
  });

  it('lists prior inspections for duplicate preview checks', async () => {
    const { repo, fakeGraph } = makeRepository();
    fakeGraph.listItems.mockResolvedValue([
      {
        id: '91',
        fields: {
          Title: 'Inspection 91',
          ProjectWeekRecordIdLookupId: 55,
          ReportingPeriodIdLookupId: 14,
          SourceUploadItemId: 300,
          SourceUploadWebUrl: 'https://example.test/upload.xlsx',
          Checksum: 'abc',
          TemplateVersion: 'v1',
          ParserVersion: 'parse-first-2026-04',
          ScoringMode: 'template-compat-v1',
          InspectionDate: '2026-04-22T00:00:00Z',
          InspectionNumber: '3',
          ProjectNumber: '2026-100',
          ProjectNameSnapshot: 'Project 100',
          InspectionScore: 92,
          TotalYes: 10,
          TotalNo: 1,
          TotalNA: 1,
          RawChecklistJson: '{}',
          IngestionStatus: 'accepted',
          DuplicateStatus: 'none',
          RequiresReview: false,
          SubmittedAt: '2026-04-23T10:00:00Z',
        },
      },
    ]);

    const inspections = await repo.findInspectionsForProjectWeek({
      projectNumber: '2026-100',
      reportingPeriodId: 'period-14',
    });

    expect(inspections).toHaveLength(1);
    expect(inspections[0]?.id).toBe('ie-91');
    expect(fakeGraph.listItems).toHaveBeenCalledOnce();
  });
});
