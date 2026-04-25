import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SafetyFieldExcellencePublishService } from '../safety-field-excellence-publish-service.js';
import { SafetyFieldExcellenceRollupService } from '../safety-field-excellence-rollup-service.js';
import type {
  IPersistedSafetyFieldExcellenceCandidate,
  IPersistedSafetyFieldExcellenceWeeklyHighlight,
  ISafetyFieldExcellenceGraphRepository,
} from '../safety-field-excellence-graph-repository.js';
import type {
  SafetyFinding,
  SafetyInspectionEvent,
  SafetyProjectWeekRecord,
  SafetyReportingPeriod,
} from '../../../../../packages/features/safety/src/domain/types.js';

function makeReportingPeriod(): SafetyReportingPeriod {
  return {
    id: 'period-1',
    spItemId: 1,
    title: 'Reporting Period 2026-W17',
    weekStartDate: '2026-04-20',
    weekEndDate: '2026-04-26',
    periodLabel: '2026-W17',
    status: 'open',
  };
}

function makePersistedCandidate(
  overrides: Partial<IPersistedSafetyFieldExcellenceCandidate> = {},
): IPersistedSafetyFieldExcellenceCandidate {
  return {
    itemId: 5001,
    reportingPeriodSpItemId: 1,
    projectWeekRecordSpItemId: 100,
    eligibilityStatus: 'eligible',
    exclusionReasons: [],
    compositeScore: 86,
    safetyPerformanceScore: 92,
    consistencyTrendScore: 70,
    activityExposureScore: 90,
    correctiveActionScore: 90,
    dataQualityScore: 90,
    inspectionCountWindow: 3,
    inspectionCountRolling: 5,
    averageInspectionScoreWindow: 92,
    averageInspectionScoreRolling: 90,
    inspectionTrendPct: 2,
    highestRiskFindingLevel: null,
    highSeverityFindingCount: 0,
    mediumSeverityFindingCount: 0,
    openFindingCount: 0,
    agedOpenFindingCount: 0,
    repeatFindingCount: 0,
    activityEvidenceStatus: 'proven',
    activityEvidenceJson: '{"status":"proven","source":"manual"}',
    reasonSummary: 'Strong inspection performance and verified jobsite exposure across 3 inspections.',
    sourceInspectionIds: ['ie-1001'],
    sourceFindingIds: [],
    generatedAt: '2026-04-25T12:00:00.000Z',
    generatorVersion: 'safety-excellence-scoring/0.1',
    publishRecommendation: 'primary',
    ...overrides,
  };
}

function makeHighlight(
  overrides: Partial<IPersistedSafetyFieldExcellenceWeeklyHighlight> = {},
): IPersistedSafetyFieldExcellenceWeeklyHighlight {
  return {
    itemId: 9001,
    etag: 'etag-1',
    title: 'Safety Field Excellence — 2026-04-20 → 2026-04-26',
    reportingPeriodSpItemId: 1,
    weekStartDate: '2026-04-20',
    weekEndDate: '2026-04-26',
    periodLabel: '2026-W17',
    publishStatus: 'pending-review',
    primaryCandidateSpItemId: 5001,
    secondaryCandidateItemIds: [],
    homepagePayloadJson: JSON.stringify({
      heading: 'Safety and Field Excellence',
      topLineSummary: { statusLabel: 'Verified weekly recognition', summaryText: '' },
      primarySpotlight: { id: 'p-1', title: 'Project · Primary', summary: '' },
      secondarySignals: [],
      dataConfidence: 'high',
      isPreview: false,
    }),
    sourceCandidateItemIds: [5001],
    selectionMethodVersion: 'safety-excellence-scoring/0.1',
    dataConfidence: 'high',
    dataQualityNotes: null,
    editorialOverrideApplied: false,
    overrideReason: null,
    approvedBy: null,
    approvedAt: null,
    publishedAt: null,
    freshUntil: null,
    rollbackFromItemId: null,
    ...overrides,
  };
}

function buildRollupService(): SafetyFieldExcellenceRollupService {
  const stubRepo: ISafetyFieldExcellenceGraphRepository = {
    resolveReportingPeriod: vi.fn(async () => makeReportingPeriod()),
    listProjectWeeksForReportingPeriod: vi.fn(async (): Promise<ReadonlyArray<SafetyProjectWeekRecord>> => []),
    listInspectionsForProjectWeek: vi.fn(async (): Promise<ReadonlyArray<SafetyInspectionEvent>> => []),
    listFindingsForProjectWeek: vi.fn(async (): Promise<ReadonlyArray<SafetyFinding>> => []),
    listRollingHistory: vi.fn(async () => ({
      priorProjectWeeks: [] as ReadonlyArray<SafetyProjectWeekRecord>,
      priorInspections: [] as ReadonlyArray<SafetyInspectionEvent>,
      priorFindings: [] as ReadonlyArray<SafetyFinding>,
    })),
    upsertCandidateScore: vi.fn(async () => ({ outcome: 'created' as const, itemId: 5001 })),
    listCandidateScores: vi.fn(async () => []),
    getCandidateScoreByItemId: vi.fn(async () => null),
    upsertDraftWeeklyHighlight: vi.fn(async () => makeHighlight()),
    getWeeklyHighlightByItemId: vi.fn(async () => null),
    updateWeeklyHighlightFields: vi.fn(async () => makeHighlight()),
    listCurrentPublishedHighlights: vi.fn(async () => []),
    archivePriorPublishedHighlights: vi.fn(async () => []),
  };
  return new SafetyFieldExcellenceRollupService({ repository: stubRepo });
}

function buildRepoStub(
  overrides?: Partial<ISafetyFieldExcellenceGraphRepository>,
): ISafetyFieldExcellenceGraphRepository {
  return {
    resolveReportingPeriod: vi.fn(async () => makeReportingPeriod()),
    listProjectWeeksForReportingPeriod: vi.fn(async () => []),
    listInspectionsForProjectWeek: vi.fn(async () => []),
    listFindingsForProjectWeek: vi.fn(async () => []),
    listRollingHistory: vi.fn(async () => ({
      priorProjectWeeks: [],
      priorInspections: [],
      priorFindings: [],
    })),
    upsertCandidateScore: vi.fn(async () => ({ outcome: 'created' as const, itemId: 5001 })),
    listCandidateScores: vi.fn(async () => [makePersistedCandidate()]),
    getCandidateScoreByItemId: vi.fn(async () => makePersistedCandidate()),
    upsertDraftWeeklyHighlight: vi.fn(async () => makeHighlight()),
    getWeeklyHighlightByItemId: vi.fn(async () => makeHighlight()),
    updateWeeklyHighlightFields: vi.fn(async () => makeHighlight()),
    listCurrentPublishedHighlights: vi.fn(async () => []),
    archivePriorPublishedHighlights: vi.fn(async () => []),
    ...overrides,
  };
}

describe('SafetyFieldExcellencePublishService — approve/override/publish/suppress/rollback', () => {
  let repo: ISafetyFieldExcellenceGraphRepository;
  let service: SafetyFieldExcellencePublishService;

  beforeEach(() => {
    repo = buildRepoStub();
    service = new SafetyFieldExcellencePublishService({
      repository: repo,
      rollupService: buildRollupService(),
    });
  });

  it('approveHighlight transitions pending-review → approved with approver metadata', async () => {
    (repo.updateWeeklyHighlightFields as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      makeHighlight({ publishStatus: 'approved', approvedBy: 'admin@hb', approvedAt: '2026-04-25T12:00:00.000Z' }),
    );
    const result = await service.approveHighlight({ itemId: 9001, approverUpn: 'admin@hb' });
    expect(result.success).toBe(true);
    expect(result.highlight?.publishStatus).toBe('approved');
    const updateCall = (repo.updateWeeklyHighlightFields as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    expect(updateCall.fields.PublishStatus).toBe('approved');
    expect(updateCall.fields.ApprovedBy).toBe('admin@hb');
  });

  it('approveHighlight rejects when status is already published', async () => {
    (repo.getWeeklyHighlightByItemId as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      makeHighlight({ publishStatus: 'published' }),
    );
    const result = await service.approveHighlight({ itemId: 9001, approverUpn: 'admin@hb' });
    expect(result.success).toBe(false);
    expect(result.diagnostics[0].code).toBe('HIGHLIGHT_INVALID_STATUS');
  });

  it('approveHighlight rejects do-not-publish primary without override flag', async () => {
    (repo.getCandidateScoreByItemId as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      makePersistedCandidate({ publishRecommendation: 'do-not-publish', eligibilityStatus: 'ineligible' }),
    );
    const result = await service.approveHighlight({ itemId: 9001, approverUpn: 'admin@hb' });
    expect(result.success).toBe(false);
    expect(result.diagnostics[0].code).toBe('CANDIDATE_NOT_APPROVABLE');
  });

  it('overrideHighlight requires non-empty reason', async () => {
    const result = await service.overrideHighlight({
      itemId: 9001,
      primaryCandidateItemId: 5001,
      overrideReason: '',
      approverUpn: 'admin@hb',
    });
    expect(result.success).toBe(false);
    expect(result.diagnostics[0].code).toBe('OVERRIDE_REASON_REQUIRED');
  });

  it('overrideHighlight requires strong reason for hard-excluded candidate', async () => {
    (repo.getCandidateScoreByItemId as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      makePersistedCandidate({ publishRecommendation: 'do-not-publish', eligibilityStatus: 'ineligible' }),
    );
    const result = await service.overrideHighlight({
      itemId: 9001,
      primaryCandidateItemId: 5001,
      overrideReason: 'too short',
      approverUpn: 'admin@hb',
    });
    expect(result.success).toBe(false);
    expect(result.diagnostics[0].code).toBe('OVERRIDE_REASON_REQUIRED');
  });

  it('overrideHighlight sets EditorialOverrideApplied for hard-excluded primary with strong reason', async () => {
    (repo.getCandidateScoreByItemId as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      makePersistedCandidate({ publishRecommendation: 'do-not-publish', eligibilityStatus: 'ineligible' }),
    );
    (repo.updateWeeklyHighlightFields as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      makeHighlight({ editorialOverrideApplied: true }),
    );
    const result = await service.overrideHighlight({
      itemId: 9001,
      primaryCandidateItemId: 5001,
      overrideReason:
        'Override required: leadership reviewed offline evidence and accepts the elevated recognition risk for this period.',
      approverUpn: 'admin@hb',
    });
    expect(result.success).toBe(true);
    const updateCall = (repo.updateWeeklyHighlightFields as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    expect(updateCall.fields.EditorialOverrideApplied).toBe(true);
    expect(updateCall.fields.OverrideReason).toContain('Override required');
  });

  it('publishHighlight requires approved status', async () => {
    (repo.getWeeklyHighlightByItemId as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      makeHighlight({ publishStatus: 'pending-review' }),
    );
    const result = await service.publishHighlight({ itemId: 9001 });
    expect(result.success).toBe(false);
    expect(result.diagnostics[0].code).toBe('PUBLISH_APPROVAL_REQUIRED');
  });

  it('publishHighlight archives prior published items in the same period and stamps freshness', async () => {
    (repo.getWeeklyHighlightByItemId as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      makeHighlight({ publishStatus: 'approved' }),
    );
    (repo.archivePriorPublishedHighlights as ReturnType<typeof vi.fn>).mockResolvedValueOnce([8001]);
    (repo.updateWeeklyHighlightFields as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      makeHighlight({ publishStatus: 'published', publishedAt: '2026-04-25T12:00:00.000Z', freshUntil: '2026-05-02T12:00:00.000Z' }),
    );
    const result = await service.publishHighlight({ itemId: 9001, now: '2026-04-25T12:00:00.000Z' });
    expect(result.success).toBe(true);
    expect(result.archivedItemIds).toEqual([8001]);
    const updateCall = (repo.updateWeeklyHighlightFields as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    expect(updateCall.fields.PublishStatus).toBe('published');
    expect(updateCall.fields.PublishedAt).toBe('2026-04-25T12:00:00.000Z');
    expect(updateCall.fields.FreshUntil).toBe('2026-05-02T12:00:00.000Z');
  });

  it('publishHighlight refuses non-preview payload with no primary spotlight', async () => {
    (repo.getWeeklyHighlightByItemId as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      makeHighlight({
        publishStatus: 'approved',
        homepagePayloadJson: JSON.stringify({
          heading: 'Safety',
          topLineSummary: { statusLabel: 'x', summaryText: 'y' },
          secondarySignals: [],
          dataConfidence: 'high',
          isPreview: false,
        }),
      }),
    );
    const result = await service.publishHighlight({ itemId: 9001 });
    expect(result.success).toBe(false);
    expect(result.diagnostics[0].code).toBe('PUBLISH_NO_VALID_PRIMARY');
  });

  it('suppressHighlight transitions any state to suppressed and records reason', async () => {
    (repo.getWeeklyHighlightByItemId as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      makeHighlight({ publishStatus: 'published' }),
    );
    (repo.updateWeeklyHighlightFields as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      makeHighlight({ publishStatus: 'suppressed', overrideReason: 'late-week incident' }),
    );
    const result = await service.suppressHighlight({ itemId: 9001, suppressionReason: 'late-week incident' });
    expect(result.success).toBe(true);
    expect(result.highlight?.publishStatus).toBe('suppressed');
    expect(result.diagnostics.some((d) => d.code === 'SUPPRESS_REASON_RECORDED')).toBe(true);
  });

  it('rollbackHighlight requires a target', async () => {
    (repo.getWeeklyHighlightByItemId as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      makeHighlight({ rollbackFromItemId: null }),
    );
    const result = await service.rollbackHighlight({ itemId: 9001 });
    expect(result.success).toBe(false);
    expect(result.diagnostics[0].code).toBe('ROLLBACK_TARGET_NOT_FOUND');
  });

  it('rollbackHighlight publishes target and archives current with RollbackFromItemId stamp', async () => {
    (repo.getWeeklyHighlightByItemId as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(makeHighlight({ itemId: 9001, rollbackFromItemId: 8001 }))
      .mockResolvedValueOnce(
        makeHighlight({ itemId: 8001, publishStatus: 'archived', homepagePayloadJson: '{"isPreview":false}' }),
      );
    (repo.updateWeeklyHighlightFields as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(makeHighlight({ itemId: 8001, publishStatus: 'published' }))
      .mockResolvedValueOnce(
        makeHighlight({ itemId: 9001, publishStatus: 'archived', rollbackFromItemId: 8001 }),
      );
    const result = await service.rollbackHighlight({ itemId: 9001, now: '2026-04-26T00:00:00.000Z' });
    expect(result.success).toBe(true);
    const calls = (repo.updateWeeklyHighlightFields as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls[0][0].fields.PublishStatus).toBe('published');
    expect(calls[1][0].fields.PublishStatus).toBe('archived');
    expect(calls[1][0].fields.RollbackFromItemId).toBe(8001);
  });
});

describe('SafetyFieldExcellencePublishService — current homepage endpoint', () => {
  let repo: ISafetyFieldExcellenceGraphRepository;
  let service: SafetyFieldExcellencePublishService;

  beforeEach(() => {
    repo = buildRepoStub();
    service = new SafetyFieldExcellencePublishService({
      repository: repo,
      rollupService: buildRollupService(),
    });
  });

  it('returns no-published-highlight when none exist', async () => {
    (repo.listCurrentPublishedHighlights as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const result = await service.getCurrentHomepageHighlight({});
    expect(result.state).toBe('no-published-highlight');
    expect(result.highlight).toBeUndefined();
  });

  it('returns the most recent fresh published highlight', async () => {
    (repo.listCurrentPublishedHighlights as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      makeHighlight({
        publishStatus: 'published',
        publishedAt: '2026-04-22T00:00:00.000Z',
        freshUntil: '2026-04-29T00:00:00.000Z',
        dataConfidence: 'high',
      }),
    ]);
    const result = await service.getCurrentHomepageHighlight({ now: '2026-04-25T00:00:00.000Z' });
    expect(result.state).toBe('published');
    expect(result.highlight?.publishStatus).toBe('published');
    expect(result.highlight?.isStale).toBe(false);
    expect(result.highlight?.dataConfidence).toBe('high');
  });

  it('marks stale content as stale when includeStale=true', async () => {
    (repo.listCurrentPublishedHighlights as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        makeHighlight({
          publishStatus: 'published',
          publishedAt: '2026-03-01T00:00:00.000Z',
          freshUntil: '2026-03-08T00:00:00.000Z',
        }),
      ]);
    const result = await service.getCurrentHomepageHighlight({
      now: '2026-04-25T00:00:00.000Z',
      includeStale: true,
    });
    expect(result.state).toBe('published');
    expect(result.highlight?.isStale).toBe(true);
  });

  it('current endpoint never includes RawChecklistJson in the response', async () => {
    (repo.listCurrentPublishedHighlights as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      makeHighlight({ publishStatus: 'published' }),
    ]);
    const result = await service.getCurrentHomepageHighlight({});
    const serialized = JSON.stringify(result);
    expect(serialized).not.toMatch(/RawChecklistJson|rawChecklistJson/);
  });
});

describe('SafetyFieldExcellencePublishService — draft creation', () => {
  it('creates pending-review draft with preview payload when no eligible primary exists', async () => {
    const repo = buildRepoStub({
      listCandidateScores: vi.fn(async () => []),
    });
    const service = new SafetyFieldExcellencePublishService({
      repository: repo,
      rollupService: buildRollupService(),
    });
    const result = await service.draftHighlightFromRollup({
      reportingPeriodId: 'period-1',
      reportingPeriodSpItemId: 1,
    });
    expect(result.success).toBe(true);
    expect(repo.upsertDraftWeeklyHighlight).toHaveBeenCalled();
    const callArgs = (repo.upsertDraftWeeklyHighlight as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    const payload = JSON.parse(callArgs.homepagePayloadJson);
    expect(payload.isPreview).toBe(true);
    expect(callArgs.dataConfidence).toBe('low');
  });

  it('creates pending-review draft with homepage payload when an eligible primary exists', async () => {
    const repo = buildRepoStub();
    const service = new SafetyFieldExcellencePublishService({
      repository: repo,
      rollupService: buildRollupService(),
    });
    const result = await service.draftHighlightFromRollup({
      reportingPeriodId: 'period-1',
      reportingPeriodSpItemId: 1,
    });
    expect(result.success).toBe(true);
    const callArgs = (repo.upsertDraftWeeklyHighlight as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    const payload = JSON.parse(callArgs.homepagePayloadJson);
    expect(payload.isPreview).toBe(false);
    expect(callArgs.selection.primaryCandidateItemId).toBe(5001);
  });
});
