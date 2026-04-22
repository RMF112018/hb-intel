import { describe, expect, it, vi } from 'vitest';
import { runIngestionPipeline, type IngestionAdapter } from './runIngestionPipeline.js';
import { buildCleanAllYesWorkbook } from '../test/fixtures.js';
import { createSyntheticWorkbookView } from '../parser/workbookView.js';
import type {
  CommittedArtifacts,
  ProjectResolutionResult,
  SafetyFinding,
  SafetyIngestionRun,
  SafetyIngestionRunDraft,
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
    reportingPeriodId: 'period-1001',
    reportingPeriodSpItemId: 1001,
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
  captured: { inspection?: SafetyInspectionEvent; findings?: ReadonlyArray<SafetyFinding> };
} {
  const calls = { runs: 0, commits: 0 };
  const captured: { inspection?: SafetyInspectionEvent; findings?: ReadonlyArray<SafetyFinding> } = {};
  const persistedInspections: SafetyInspectionEvent[] = [];
  let pwCounter = 2000;
  let ieCounter = 3000;
  let fdCounter = 4000;
  let runCounter = 5000;

  const adapter: IngestionAdapter = {
    resolveProject: vi.fn(async () => resolvedProject()),
    findInspectionsForProjectWeek: vi.fn(async () => persistedInspections),
    resolveReportingPeriod: vi.fn(async () => null),
    markInspectionSuperseded: vi.fn(async () => undefined),
    ensureProjectWeekRecord: vi.fn(
      async (resolution, reportingPeriodId, reportingPeriodSpItemId, weekStartDate) => {
        pwCounter += 1;
        const pw: SafetyProjectWeekRecord = {
          id: `pw-${pwCounter}`,
          spItemId: pwCounter,
          title: `${resolution.projectNumber} ${weekStartDate}`,
          reportingPeriodId,
          reportingPeriodSpItemId,
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
      },
    ),
    persistCommit: vi.fn(async (drafts): Promise<CommittedArtifacts> => {
      calls.commits += 1;
      ieCounter += 1;
      const inspectionEvent: SafetyInspectionEvent = {
        id: `ie-${ieCounter}`,
        spItemId: ieCounter,
        ...drafts.inspectionEventDraft,
      };
      persistedInspections.push(inspectionEvent);
      const findings: SafetyFinding[] = drafts.findingDrafts.map((draft) => {
        fdCounter += 1;
        return {
          id: `fd-${fdCounter}`,
          spItemId: fdCounter,
          inspectionEventId: inspectionEvent.id,
          inspectionEventSpItemId: inspectionEvent.spItemId,
          ...draft,
        };
      });
      captured.inspection = inspectionEvent;
      captured.findings = findings;
      return {
        inspectionEvent,
        findings,
        projectWeekRecord: drafts.projectWeekRecordUpdate,
      };
    }),
    recordIngestionRun: vi.fn(async (draft: SafetyIngestionRunDraft) => {
      calls.runs += 1;
      runCounter += 1;
      const run: SafetyIngestionRun = {
        id: `run-${runCounter}`,
        spItemId: runCounter,
        ...draft,
      };
      return run;
    }),
    ...overrides,
  };
  return { adapter, calls, captured };
}

describe('runIngestionPipeline', () => {
  it('walks the happy path end-to-end and assigns numeric spItemIds', async () => {
    const { adapter, calls, captured } = makeAdapter();
    const result = await runIngestionPipeline({
      view: buildCleanAllYesWorkbook(),
      context: baseContext(),
      uploadedRef: baseRef(),
      adapter,
    });
    expect(result.state).toBe('committed');
    expect(result.committed?.inspectionEvent.inspectionScore).toBeCloseTo(1.0, 5);
    expect(result.committed?.inspectionEvent.spItemId).toBeGreaterThan(0);
    expect(result.committed?.inspectionEvent.reportingPeriodSpItemId).toBe(1001);
    expect(result.committed?.inspectionEvent.projectWeekRecordSpItemId).toBeGreaterThan(0);
    expect(result.run.spItemId).toBeGreaterThan(0);
    expect(calls.commits).toBe(1);
    expect(calls.runs).toBe(1);
    expect(captured.inspection?.reportingPeriodSpItemId).toBe(1001);
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

  it('short-circuits to committed when a prior identical commit already exists (idempotent retry)', async () => {
    const existing: SafetyInspectionEvent = {
      id: 'ie-existing',
      spItemId: 3001,
      title: 'existing',
      projectWeekRecordId: 'pw-2001',
      projectWeekRecordSpItemId: 2001,
      reportingPeriodId: 'period-1001',
      reportingPeriodSpItemId: 1001,
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
      findInspectionsForProjectWeek: vi.fn(async () => [existing]),
    });
    const result = await runIngestionPipeline({
      view: buildCleanAllYesWorkbook(),
      context: baseContext(),
      uploadedRef: baseRef(),
      adapter,
    });
    expect(result.state).toBe('committed');
    expect(result.run.committedEntityIdsJson).toContain('ie-existing');
    // No new commit is issued on idempotent short-circuit.
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
