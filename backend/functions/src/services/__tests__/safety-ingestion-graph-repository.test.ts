import { describe, expect, it, vi } from 'vitest';
import type {
  SafetyFindingDraft,
  SafetyInspectionEventDraft,
  SafetyProjectWeekRecord,
  SafetyIngestionRunDraft,
} from '../../../../../packages/features/safety/src/domain/types.js';
import { configureSafetyListGuids } from '../../../../../packages/features/safety/src/lists/guidConfig.js';
import {
  GraphBoundedQueryTruncatedError,
  GraphConcurrencyError,
  GraphRequestError,
} from '../safety-ingestion-graph-data-plane.js';
import {
  SAFETY_GRAPH_QUERY_CONTRACTS,
  SafetyIngestionGraphRepository,
} from '../safety-ingestion-graph-repository.js';

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
      resolveSiteId: vi.fn().mockResolvedValue('site-1'),
      getItemById: vi.fn(),
      listItems: vi.fn(),
      listItemsBounded: vi.fn(),
      createItem: vi.fn(),
      updateItem: vi.fn(),
      updateItemWithConcurrency: vi.fn(),
      uploadFileToLibrary: vi.fn(),
      downloadFileByListItemId: vi.fn(),
    };

    (repo as unknown as { graph: typeof fakeGraph }).graph = fakeGraph;
    return { repo, fakeGraph };
  }

  function makeFakeResponse(status: number): Response {
    return new Response('', { status });
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
    expect(fakeGraph.getItemById).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      14,
      expect.any(Array),
    );
    expect(fakeGraph.getItemById).toHaveBeenCalledOnce();
  });

  it('rejects mismatched canonical and numeric reporting period identifiers', async () => {
    const { repo, fakeGraph } = makeRepository();

    await expect(
      repo.getReportingPeriod('period-14', 15),
    ).rejects.toThrow(/must reference the same item/i);

    expect(fakeGraph.getItemById).not.toHaveBeenCalled();
  });

  it('emits self-classifying seam diagnostics for reporting-period 401 failures', async () => {
    const { repo, fakeGraph } = makeRepository();
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    fakeGraph.getItemById.mockRejectedValue(
      new GraphRequestError(
        'get-item',
        '/sites/site-1/lists/list-1/items/14',
        new Response('unauthorized', { status: 401 }),
        'unauthorized',
      ),
    );

    await expect(repo.getReportingPeriod('period-14')).rejects.toBeInstanceOf(GraphRequestError);

    const payload = logSpy.mock.calls
      .map((call) => {
        try {
          return JSON.parse(String(call[0])) as Record<string, unknown>;
        } catch {
          return null;
        }
      })
      .find((entry) => entry && entry.name === 'safety.ingestion.reporting-period.read.failed');

    expect(payload).toBeDefined();
    expect(payload?.requestedReportingPeriodId).toBe('period-14');
    expect(payload?.parsedItemId).toBe(14);
    expect(payload?.statusCode).toBe(401);
    expect(payload?.causeBucket).toBe('identity/grant');
    expect(payload?.identityLane).toBe('managed-identity-app-only');
  });

  it('returns deterministic reporting-period probe diagnostics for 401 classification', async () => {
    const { repo, fakeGraph } = makeRepository();
    fakeGraph.getItemById.mockRejectedValue(
      new GraphRequestError(
        'get-item',
        '/sites/site-1/lists/list-1/items/14',
        new Response('unauthorized', { status: 401 }),
        'unauthorized',
      ),
    );

    const probe = await repo.probeReportingPeriodRead('period-14');

    expect(probe.success).toBe(false);
    expect(probe.status).toBe('error');
    expect(probe.causeBucket).toBe('identity/grant');
    expect(probe.statusCode).toBe(401);
    expect(probe.codePath).toBe('graph-only');
    expect(probe.graphPathSummary).toContain('/sites/<siteId>/lists/');
  });

  it('returns invalid-contract diagnostics from reporting-period probe for mismatched companion ID', async () => {
    const { repo, fakeGraph } = makeRepository();

    const probe = await repo.probeReportingPeriodRead('period-14', 15);

    expect(probe.success).toBe(false);
    expect(probe.status).toBe('invalid-contract');
    expect(probe.causeBucket).toBe('item-contract');
    expect(probe.diagnosticCode).toBe('SAFETY_REPORTING_PERIOD_ID_MISMATCH');
    expect(fakeGraph.getItemById).not.toHaveBeenCalled();
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
    // Rollup performs read-before-write and sends If-Match via updateItemWithConcurrency
    fakeGraph.getItemById.mockResolvedValueOnce({
      id: '55',
      fields: {},
      etag: '"rollup-etag-1"',
    });
    fakeGraph.updateItemWithConcurrency.mockResolvedValueOnce(undefined);

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
    // Rollup must flow through the concurrency-protected path, not the blind
    // updateItem() which is deprecated for Safety.
    expect(fakeGraph.updateItem).not.toHaveBeenCalled();
    expect(fakeGraph.updateItemWithConcurrency).toHaveBeenCalledOnce();
    const concurrencyCall = fakeGraph.updateItemWithConcurrency.mock.calls[0];
    expect(concurrencyCall?.[4]).toBe('"rollup-etag-1"');
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
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
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

    const telemetryNames = logSpy.mock.calls
      .map((call) => {
        try {
          return (JSON.parse(String(call[0])) as { name?: string }).name ?? '';
        } catch {
          return '';
        }
      })
      .filter((name) => name.length > 0);
    expect(telemetryNames).toContain('safety.ingestion.pipeline.stage');
    logSpy.mockRestore();
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
    fakeGraph.listItemsBounded.mockResolvedValue([
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
    expect(fakeGraph.listItemsBounded).toHaveBeenCalledOnce();
    expect(fakeGraph.listItems).not.toHaveBeenCalled();
    const [, , query, contractId] = fakeGraph.listItemsBounded.mock.calls[0]!;
    // Compound filter on (reportingPeriodId, projectNumber) — both indexed.
    expect(query.filter).toBe(
      "fields/ReportingPeriodIdLookupId eq 14 and fields/ProjectNumber eq '2026-100'",
    );
    expect(query.top).toBe(500);
    expect(contractId).toBe('duplicate-detection-inspections');
  });

  // --- Concurrency behavior proof ---

  it('retries project-week rollup with refreshed ETag on a 412 concurrency conflict', async () => {
    const { repo, fakeGraph } = makeRepository();
    fakeGraph.createItem
      .mockResolvedValueOnce({ id: '102', fields: {} })
      .mockResolvedValueOnce({ id: '202', fields: {} });
    fakeGraph.getItemById
      .mockResolvedValueOnce({ id: '55', fields: {}, etag: '"etag-1"' })
      .mockResolvedValueOnce({ id: '55', fields: {}, etag: '"etag-2"' });
    fakeGraph.updateItemWithConcurrency
      .mockRejectedValueOnce(
        new GraphConcurrencyError(
          'update-item-with-concurrency',
          '/items/55/fields',
          makeFakeResponse(412),
          'precondition failed',
        ),
      )
      .mockResolvedValueOnce(undefined);

    const inspectionEventDraft: SafetyInspectionEventDraft = {
      title: 'Inspection #2',
      projectWeekRecordId: 'pw-55',
      projectWeekRecordSpItemId: 55,
      reportingPeriodId: 'period-14',
      reportingPeriodSpItemId: 14,
      sourceUploadItemId: 302,
      sourceUploadWebUrl: 'https://example/upload.xlsx',
      checksum: 'abc123',
      templateVersion: 'v1',
      parserVersion: 'v2',
      scoringMode: 'normalized-vNext',
      inspectionDate: '2026-04-22',
      inspectionNumber: '2',
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
      inspectionCount: 2,
      averageInspectionScore: 91,
      highestRiskFindingLevel: 'medium',
      weeklySummary: '',
      managerReviewStatus: 'not-required',
      publishStatus: 'in-progress',
    };

    await (repo as unknown as {
      commit: (drafts: {
        inspectionEventDraft: SafetyInspectionEventDraft;
        findingDrafts: ReadonlyArray<SafetyFindingDraft>;
        projectWeekRecordUpdate: SafetyProjectWeekRecord;
      }) => Promise<unknown>;
    }).commit({
      inspectionEventDraft,
      findingDrafts: [
        {
          title: 'Finding',
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
      ],
      projectWeekRecordUpdate,
    });

    // Two reads (first + refresh) and two concurrency-protected writes; no blind updates.
    expect(fakeGraph.getItemById).toHaveBeenCalledTimes(2);
    expect(fakeGraph.updateItemWithConcurrency).toHaveBeenCalledTimes(2);
    expect(fakeGraph.updateItem).not.toHaveBeenCalled();
    // Second attempt must have used the refreshed ETag from the second read.
    expect(fakeGraph.updateItemWithConcurrency.mock.calls[1]?.[4]).toBe('"etag-2"');
  });

  it('throws GraphConcurrencyError after the bounded rollup retry budget is exhausted', async () => {
    const { repo, fakeGraph } = makeRepository();
    fakeGraph.createItem
      .mockResolvedValueOnce({ id: '103', fields: {} })
      .mockResolvedValueOnce({ id: '203', fields: {} });
    fakeGraph.getItemById.mockResolvedValue({ id: '55', fields: {}, etag: '"etag-n"' });
    fakeGraph.updateItemWithConcurrency.mockRejectedValue(
      new GraphConcurrencyError(
        'update-item-with-concurrency',
        '/items/55/fields',
        makeFakeResponse(409),
        'conflict',
      ),
    );

    const draft: SafetyInspectionEventDraft = {
      title: 'Inspection #3',
      projectWeekRecordId: 'pw-55',
      projectWeekRecordSpItemId: 55,
      reportingPeriodId: 'period-14',
      reportingPeriodSpItemId: 14,
      sourceUploadItemId: 303,
      sourceUploadWebUrl: 'https://example/upload.xlsx',
      checksum: 'abc',
      templateVersion: 'v1',
      parserVersion: 'v2',
      scoringMode: 'normalized-vNext',
      inspectionDate: '2026-04-22',
      inspectionNumber: '3',
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

    const record: SafetyProjectWeekRecord = {
      id: 'pw-55',
      spItemId: 55,
      title: '',
      reportingPeriodId: 'period-14',
      reportingPeriodSpItemId: 14,
      projectNumber: '2026-100',
      projectNameSnapshot: 'Project Name',
      projectLocationSnapshot: '',
      projectStageSnapshot: '',
      projectSourceClassification: 'project',
      expectedInspectionThisWeek: true,
      inspectionCount: 0,
      averageInspectionScore: null,
      highestRiskFindingLevel: null,
      weeklySummary: '',
      managerReviewStatus: 'not-required',
      publishStatus: 'in-progress',
    };

    await expect(
      (repo as unknown as {
        commit: (drafts: {
          inspectionEventDraft: SafetyInspectionEventDraft;
          findingDrafts: ReadonlyArray<SafetyFindingDraft>;
          projectWeekRecordUpdate: SafetyProjectWeekRecord;
        }) => Promise<unknown>;
      }).commit({
        inspectionEventDraft: draft,
        findingDrafts: [],
        projectWeekRecordUpdate: record,
      }),
    ).rejects.toBeInstanceOf(GraphConcurrencyError);

    expect(fakeGraph.updateItemWithConcurrency).toHaveBeenCalledTimes(3);
  });

  it('project-week lookup emits a bounded compound $filter with both indexed columns', async () => {
    const { repo, fakeGraph } = makeRepository();
    fakeGraph.listItemsBounded.mockResolvedValue([]);

    await (repo as unknown as {
      getProjectWeek: (reportingPeriodId: string, projectNumber: string) => Promise<unknown>;
    }).getProjectWeek('period-14', "O'Brien-100");

    expect(fakeGraph.listItemsBounded).toHaveBeenCalledOnce();
    expect(fakeGraph.listItems).not.toHaveBeenCalled();
    const [, , query, contractId] = fakeGraph.listItemsBounded.mock.calls[0]!;
    expect(query.filter).toBe(
      "fields/ReportingPeriodIdLookupId eq 14 and fields/ProjectNumber eq 'O''Brien-100'",
    );
    // top:2 so that a natural-key violation (>1 match) is detectable rather
    // than silently returning one of several duplicate rollups.
    expect(query.top).toBe(2);
    expect(contractId).toBe('project-week-lookup');
  });

  it('project-week lookup throws a natural-key violation when two rollups share (period, project)', async () => {
    const { repo, fakeGraph } = makeRepository();
    fakeGraph.listItemsBounded.mockResolvedValue([
      { id: '55', fields: { ReportingPeriodIdLookupId: 14, ProjectNumber: '2026-100' } },
      { id: '56', fields: { ReportingPeriodIdLookupId: 14, ProjectNumber: '2026-100' } },
    ]);

    await expect(
      (repo as unknown as {
        getProjectWeek: (reportingPeriodId: string, projectNumber: string) => Promise<unknown>;
      }).getProjectWeek('period-14', '2026-100'),
    ).rejects.toThrow(/natural-key violation/i);
  });

  it('compound-filter safety queries propagate bounded-query truncation loudly', async () => {
    const { repo, fakeGraph } = makeRepository();
    fakeGraph.listItemsBounded.mockRejectedValue(
      new GraphBoundedQueryTruncatedError('duplicate-detection-inspections', 'list-1', 500, 500),
    );

    await expect(
      repo.findInspectionsForProjectWeek({
        projectNumber: '2026-100',
        reportingPeriodId: 'period-14',
      }),
    ).rejects.toBeInstanceOf(GraphBoundedQueryTruncatedError);
  });

  it('exposes a Safety Graph query contract documenting indexed-column assumptions', () => {
    const inspections = SAFETY_GRAPH_QUERY_CONTRACTS.find(
      (c) => c.id === 'duplicate-detection-inspections',
    );
    const projectWeek = SAFETY_GRAPH_QUERY_CONTRACTS.find((c) => c.id === 'project-week-lookup');
    expect(inspections?.requiredIndexedFields).toEqual([
      'ReportingPeriodIdLookupId',
      'ProjectNumber',
    ]);
    expect(projectWeek?.requiredIndexedFields).toEqual([
      'ReportingPeriodIdLookupId',
      'ProjectNumber',
    ]);
    // Compound strategy must be documented (not an in-memory narrowing fallback).
    expect(inspections?.strategy.toLowerCase()).toContain('compound');
    expect(projectWeek?.strategy.toLowerCase()).toContain('compound');
  });
});
