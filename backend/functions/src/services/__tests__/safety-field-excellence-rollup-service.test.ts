import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SafetyFieldExcellenceRollupService } from '../safety-field-excellence-rollup-service.js';
import {
  SafetyFieldExcellenceCandidateIdentityCollisionError,
  type ISafetyFieldExcellenceGraphRepository,
} from '../safety-field-excellence-graph-repository.js';
import { GraphBoundedQueryTruncatedError } from '../safety-ingestion-graph-data-plane.js';
import type {
  SafetyFinding,
  SafetyInspectionEvent,
  SafetyProjectWeekRecord,
  SafetyReportingPeriod,
} from '../../../../../packages/features/safety/src/domain/types.js';
import type { SafetyActivityEvidence } from '../../../../../packages/features/safety/src/excellence/index.js';

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

function makeProjectWeek(overrides: Partial<SafetyProjectWeekRecord> = {}): SafetyProjectWeekRecord {
  return {
    id: 'pw-100',
    spItemId: 100,
    title: '4815 — 2026-04-20',
    reportingPeriodId: 'period-1',
    reportingPeriodSpItemId: 1,
    projectNumber: '4815',
    projectNameSnapshot: 'Sample Project',
    projectLocationSnapshot: 'Indianapolis',
    projectStageSnapshot: 'Active Construction',
    projectSourceClassification: 'project',
    expectedInspectionThisWeek: true,
    inspectionCount: 0,
    averageInspectionScore: null,
    highestRiskFindingLevel: null,
    weeklySummary: '',
    managerReviewStatus: 'not-required',
    publishStatus: 'in-progress',
    ...overrides,
  };
}

let inspectionCounter = 0;
function makeInspection(overrides: Partial<SafetyInspectionEvent> = {}): SafetyInspectionEvent {
  inspectionCounter += 1;
  return {
    id: `ie-${inspectionCounter}`,
    spItemId: 1000 + inspectionCounter,
    title: `Inspection ${inspectionCounter}`,
    projectWeekRecordId: 'pw-100',
    projectWeekRecordSpItemId: 100,
    reportingPeriodId: 'period-1',
    reportingPeriodSpItemId: 1,
    sourceUploadItemId: 9000 + inspectionCounter,
    sourceUploadWebUrl: 'https://example.invalid/upload',
    checksum: `chk-${inspectionCounter}`,
    templateVersion: '2026.04',
    parserVersion: 'parser-1.0',
    scoringMode: 'template-compat-v1',
    inspectionDate: '2026-04-22',
    inspectionNumber: String(inspectionCounter),
    projectNumber: '4815',
    projectNameSnapshot: 'Sample Project',
    inspectionScore: 0.93,
    totalYes: 25,
    totalNo: 2,
    totalNa: 3,
    rawChecklistJson: '',
    ingestionStatus: 'accepted',
    duplicateStatus: 'none',
    requiresReview: false,
    submittedAt: '2026-04-22T18:00:00.000Z',
    ...overrides,
  };
}

function buildRepoStub(overrides?: Partial<ISafetyFieldExcellenceGraphRepository>): ISafetyFieldExcellenceGraphRepository {
  return {
    resolveReportingPeriod: vi.fn(async () => makeReportingPeriod()),
    listProjectWeeksForReportingPeriod: vi.fn(async () => [makeProjectWeek()]),
    listInspectionsForProjectWeek: vi.fn(async () => [makeInspection(), makeInspection()]),
    listFindingsForProjectWeek: vi.fn(async () => [] as ReadonlyArray<SafetyFinding>),
    listRollingHistory: vi.fn(async () => ({
      priorProjectWeeks: [] as ReadonlyArray<SafetyProjectWeekRecord>,
      priorInspections: [] as ReadonlyArray<SafetyInspectionEvent>,
      priorFindings: [] as ReadonlyArray<SafetyFinding>,
    })),
    upsertCandidateScore: vi.fn(async () => ({ outcome: 'created' as const, itemId: 5001 })),
    listCandidateScores: vi.fn(async () => []),
    ...overrides,
  };
}

describe('SafetyFieldExcellenceRollupService', () => {
  beforeEach(() => {
    inspectionCounter = 0;
  });

  it('dry-run returns scored candidates and writes nothing', async () => {
    const repo = buildRepoStub();
    const service = new SafetyFieldExcellenceRollupService({ repository: repo });
    const result = await service.runRollup({
      request: {
        reportingPeriodId: 'period-1',
        reportingPeriodSpItemId: 1,
        activityEvidenceByProjectNumber: {
          '4815': { status: 'proven', source: 'manual' } satisfies SafetyActivityEvidence,
        },
      },
      dryRun: true,
    });

    expect(result.dryRun).toBe(true);
    expect(result.candidateCount).toBe(1);
    expect(result.candidates).toHaveLength(1);
    expect(repo.upsertCandidateScore).not.toHaveBeenCalled();
  });

  it('generate writes/upserts candidates', async () => {
    const repo = buildRepoStub();
    const service = new SafetyFieldExcellenceRollupService({ repository: repo });
    const result = await service.runRollup({
      request: {
        reportingPeriodId: 'period-1',
        reportingPeriodSpItemId: 1,
        activityEvidenceByProjectNumber: {
          '4815': { status: 'proven', source: 'manual' },
        },
      },
      dryRun: false,
    });

    expect(result.dryRun).toBe(false);
    expect(repo.upsertCandidateScore).toHaveBeenCalledTimes(1);
    if (!result.dryRun) {
      expect(result.createdCount).toBe(1);
      expect(result.candidateItemIds).toEqual([5001]);
    }
  });

  it('low-activity perfect-score suppression appears in dry-run output', async () => {
    const repo = buildRepoStub({
      listProjectWeeksForReportingPeriod: vi.fn(async () => [
        makeProjectWeek({ projectStageSnapshot: 'Closeout' }),
      ]),
      listInspectionsForProjectWeek: vi.fn(async () => [
        makeInspection({ inspectionScore: 1, totalNo: 0 }),
      ]),
    });
    const service = new SafetyFieldExcellenceRollupService({ repository: repo });
    const result = await service.runRollup({
      request: { reportingPeriodId: 'period-1', reportingPeriodSpItemId: 1 },
      dryRun: true,
    });
    expect(result.suppressedPerfectScoreCount).toBe(1);
    expect(result.candidates[0].publishRecommendation).toBe('do-not-publish');
    expect(result.candidates[0].eligibilityStatus).toBe('ineligible');
    expect(result.diagnostics.some((d) => d.code === 'PERFECT_SCORE_SUPPRESSED')).toBe(true);
  });

  it('generate persists suppressed candidates with do-not-publish, not primary', async () => {
    const repo = buildRepoStub({
      listProjectWeeksForReportingPeriod: vi.fn(async () => [
        makeProjectWeek({ projectStageSnapshot: 'Closeout' }),
      ]),
      listInspectionsForProjectWeek: vi.fn(async () => [
        makeInspection({ inspectionScore: 1, totalNo: 0 }),
      ]),
    });
    const service = new SafetyFieldExcellenceRollupService({ repository: repo });
    await service.runRollup({
      request: { reportingPeriodId: 'period-1', reportingPeriodSpItemId: 1 },
      dryRun: false,
    });
    const writeCall = (repo.upsertCandidateScore as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as
      | { score: { publishRecommendation: string } }
      | undefined;
    expect(writeCall?.score.publishRecommendation).toBe('do-not-publish');
  });

  it('returns NO_PROJECT_WEEKS_FOUND diagnostic when reporting period has no weeks', async () => {
    const repo = buildRepoStub({
      listProjectWeeksForReportingPeriod: vi.fn(async () => []),
    });
    const service = new SafetyFieldExcellenceRollupService({ repository: repo });
    const result = await service.runRollup({
      request: { reportingPeriodId: 'period-1', reportingPeriodSpItemId: 1 },
      dryRun: true,
    });
    expect(result.candidateCount).toBe(0);
    expect(result.diagnostics.some((d) => d.code === 'NO_PROJECT_WEEKS_FOUND')).toBe(true);
    expect(result.success).toBe(true);
  });

  it('surfaces GraphBoundedQueryTruncatedError as PARTIAL_DATA_BLOCKED', async () => {
    const repo = buildRepoStub({
      listInspectionsForProjectWeek: vi.fn(async () => {
        throw new GraphBoundedQueryTruncatedError('contract', 'list-id', 5, 2);
      }),
    });
    const service = new SafetyFieldExcellenceRollupService({ repository: repo });
    const result = await service.runRollup({
      request: { reportingPeriodId: 'period-1', reportingPeriodSpItemId: 1 },
      dryRun: true,
    });
    expect(result.diagnostics.some((d) => d.code === 'PARTIAL_DATA_BLOCKED')).toBe(true);
    expect(result.success).toBe(false);
  });

  it('does not return RawChecklistJson in any response field', async () => {
    const repo = buildRepoStub();
    const service = new SafetyFieldExcellenceRollupService({ repository: repo });
    const dry = await service.runRollup({
      request: { reportingPeriodId: 'period-1', reportingPeriodSpItemId: 1 },
      dryRun: true,
    });
    const serialized = JSON.stringify(dry);
    expect(serialized).not.toMatch(/RawChecklistJson|rawChecklistJson/);
  });

  it('passes caller-supplied proven activity evidence into the domain', async () => {
    const repo = buildRepoStub();
    const service = new SafetyFieldExcellenceRollupService({ repository: repo });
    const result = await service.runRollup({
      request: {
        reportingPeriodId: 'period-1',
        reportingPeriodSpItemId: 1,
        activityEvidenceByProjectNumber: {
          '4815': { status: 'proven', source: 'manual', activeTradeCount: 8 },
        },
      },
      dryRun: true,
    });
    expect(result.candidates[0].activityEvidenceStatus).toBe('proven');
  });

  it('records missing activity evidence count when caller supplies none', async () => {
    const repo = buildRepoStub({
      listProjectWeeksForReportingPeriod: vi.fn(async () => [
        makeProjectWeek({ projectStageSnapshot: 'Closeout' }),
      ]),
      listInspectionsForProjectWeek: vi.fn(async () => [makeInspection()]),
    });
    const service = new SafetyFieldExcellenceRollupService({ repository: repo });
    const result = await service.runRollup({
      request: { reportingPeriodId: 'period-1', reportingPeriodSpItemId: 1 },
      dryRun: true,
    });
    expect(result.missingActivityEvidenceCount).toBeGreaterThanOrEqual(1);
  });

  it('rejects body lacking both reportingPeriodId and reportingPeriodSpItemId', async () => {
    const repo = buildRepoStub();
    const service = new SafetyFieldExcellenceRollupService({ repository: repo });
    await expect(
      service.runRollup({ request: {}, dryRun: true }),
    ).rejects.toThrow(/reportingPeriodId or reportingPeriodSpItemId is required/);
  });

  it('records candidate identity collision diagnostic when upsert throws', async () => {
    const repo = buildRepoStub({
      upsertCandidateScore: vi.fn(async () => {
        throw new SafetyFieldExcellenceCandidateIdentityCollisionError({
          reportingPeriodSpItemId: 1,
          projectWeekRecordSpItemId: 100,
          projectNumber: '4815',
          generatorVersion: 'safety-excellence-scoring/0.1',
          matchCount: 2,
        });
      }),
    });
    const service = new SafetyFieldExcellenceRollupService({ repository: repo });
    const result = await service.runRollup({
      request: {
        reportingPeriodId: 'period-1',
        reportingPeriodSpItemId: 1,
        activityEvidenceByProjectNumber: { '4815': { status: 'proven', source: 'manual' } },
      },
      dryRun: false,
    });
    expect(result.success).toBe(false);
    expect(result.diagnostics.some((d) => d.code === 'CANDIDATE_IDENTITY_COLLISION')).toBe(true);
  });
});
