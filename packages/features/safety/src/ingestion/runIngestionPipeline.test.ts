import { describe, expect, it, vi } from 'vitest';
import { runIngestionPipeline, type IngestionAdapter } from './runIngestionPipeline.js';
import { buildCleanAllYesWorkbook } from '../test/fixtures.js';
import { createSyntheticWorkbookView } from '../parser/workbookView.js';
import type {
  ProjectResolutionResult,
  SafetyInspectionEvent,
  SafetyProjectWeekRecord,
  UploadContext,
  UploadedWorkbookRef,
} from '../domain/types.js';

function baseContext(): UploadContext {
  return {
    uploadedByUpn: 'coordinator@example.com',
    uploadedAt: '2026-04-22T13:00:00Z',
    fileName: 'clean.xlsx',
    reportingPeriodId: 'period-1',
  };
}

function baseRef(): UploadedWorkbookRef {
  return {
    sourceUploadItemId: 42,
    sourceUploadWebUrl: 'https://example/clean.xlsx',
    checksum: 'chk-42',
  };
}

function resolvedProject(): ProjectResolutionResult {
  return {
    classification: 'project',
    projectNumber: '2024-118',
    projectNameSnapshot: 'Riverside',
    projectLocationSnapshot: 'WPB',
    projectStageSnapshot: 'Construction',
  };
}

function makeAdapter(overrides: Partial<IngestionAdapter> = {}): {
  adapter: IngestionAdapter;
  calls: { runs: number; commits: number };
} {
  const calls = { runs: 0, commits: 0 };
  const persistedInspections: SafetyInspectionEvent[] = [];
  let pwCounter = 0;

  const adapter: IngestionAdapter = {
    resolveProject: vi.fn(async () => resolvedProject()),
    findRecentInspectionsForProject: vi.fn(async () => persistedInspections),
    ensureProjectWeekRecord: vi.fn(async (resolution, reportingPeriodId, weekStartDate) => {
      pwCounter += 1;
      const pw: SafetyProjectWeekRecord = {
        id: `pw-${pwCounter}`,
        title: `${resolution.projectNumber} ${weekStartDate}`,
        reportingPeriodId,
        projectNumber: resolution.projectNumber,
        projectNameSnapshot: resolution.projectNameSnapshot,
        projectLocationSnapshot: resolution.projectLocationSnapshot,
        projectStageSnapshot: resolution.projectStageSnapshot,
        projectSourceClassification: resolution.classification,
        expectedInspectionThisWeek: true,
        inspectionCount: 0,
        averageInspectionScore: null,
        highestRiskFindingLevel: null,
        weeklySummary: '',
        managerReviewStatus: 'not-required',
        publishStatus: 'in-progress',
      };
      return pw;
    }),
    persistCommit: vi.fn(async (committed) => {
      calls.commits += 1;
      persistedInspections.push(committed.inspectionEvent);
    }),
    recordIngestionRun: vi.fn(async () => {
      calls.runs += 1;
    }),
    allocateId: (prefix) => `${prefix}-test-${Math.random().toString(36).slice(2, 7)}`,
    ...overrides,
  };
  return { adapter, calls };
}

describe('runIngestionPipeline', () => {
  it('walks the happy path end-to-end', async () => {
    const { adapter, calls } = makeAdapter();
    const result = await runIngestionPipeline({
      view: buildCleanAllYesWorkbook(),
      context: baseContext(),
      uploadedRef: baseRef(),
      adapter,
    });
    expect(result.state).toBe('committed');
    expect(result.committed?.inspectionEvent.inspectionScore).toBeCloseTo(1.0, 5);
    expect(calls.commits).toBe(1);
    expect(calls.runs).toBe(1);
  });

  it('terminates at invalid-template without committing when required sheet is missing', async () => {
    const { adapter, calls } = makeAdapter();
    const brokenView = createSyntheticWorkbookView({
      ScoreCard: { A1: 'not a valid safety sheet' },
    });
    const result = await runIngestionPipeline({
      view: brokenView,
      context: baseContext(),
      uploadedRef: baseRef(),
      adapter,
    });
    expect(result.state).toBe('invalid-template');
    expect(calls.commits).toBe(0);
    expect(calls.runs).toBe(1);
  });

  it('terminates at unresolved-project when project lookup fails', async () => {
    const { adapter, calls } = makeAdapter({
      resolveProject: vi.fn(async () => null),
    });
    const result = await runIngestionPipeline({
      view: buildCleanAllYesWorkbook(),
      context: baseContext(),
      uploadedRef: baseRef(),
      adapter,
    });
    expect(result.state).toBe('unresolved-project');
    expect(calls.commits).toBe(0);
    expect(calls.runs).toBe(1);
  });

  it('terminates at review-required on high-confidence duplicate', async () => {
    const existing: SafetyInspectionEvent = {
      id: 'ie-existing',
      title: 'existing',
      projectWeekRecordId: 'pw-1',
      reportingPeriodId: 'period-1',
      sourceUploadItemId: 1,
      sourceUploadWebUrl: '',
      checksum: 'chk-42',
      templateVersion: 'v1',
      parserVersion: 'parser-v1',
      scoringMode: 'template-compat-v1',
      inspectionDate: '2026-04-22',
      inspectionNumber: '1',
      projectNumber: '2024-118',
      projectNameSnapshot: 'Riverside',
      inspectionScore: 1.0,
      totalYes: 80,
      totalNo: 0,
      totalNa: 4,
      rawChecklistJson: '{}',
      ingestionStatus: 'accepted',
      duplicateStatus: 'none',
      requiresReview: false,
      submittedAt: '2026-04-20T00:00:00Z',
    };
    const { adapter, calls } = makeAdapter({
      findRecentInspectionsForProject: vi.fn(async () => [existing]),
    });
    const result = await runIngestionPipeline({
      view: buildCleanAllYesWorkbook(),
      context: baseContext(),
      uploadedRef: baseRef(),
      adapter,
    });
    expect(result.state).toBe('review-required');
    expect(calls.commits).toBe(0);
    expect(calls.runs).toBe(1);
  });

  it('records commit-failed when persistCommit throws', async () => {
    const { adapter, calls } = makeAdapter({
      persistCommit: vi.fn(async () => {
        throw new Error('SharePoint 500');
      }),
    });
    const result = await runIngestionPipeline({
      view: buildCleanAllYesWorkbook(),
      context: baseContext(),
      uploadedRef: baseRef(),
      adapter,
    });
    expect(result.state).toBe('commit-failed');
    expect(calls.runs).toBe(1);
  });
});
