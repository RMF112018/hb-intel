import { describe, expect, it } from 'vitest';
import {
  computeRollingFloor,
  toCandidateWritePayload,
} from '../safety-field-excellence-graph-repository.js';
import type {
  SafetyProjectWeekRecord,
  SafetyReportingPeriod,
} from '../../../../../packages/features/safety/src/domain/types.js';
import type { SafetyExcellenceCandidateScore } from '../../../../../packages/features/safety/src/excellence/index.js';

function makeReportingPeriod(): SafetyReportingPeriod {
  return {
    id: 'period-1',
    spItemId: 7,
    title: 'Reporting Period 2026-W17',
    weekStartDate: '2026-04-20',
    weekEndDate: '2026-04-26',
    periodLabel: '2026-W17',
    status: 'open',
  };
}

function makeProjectWeek(): SafetyProjectWeekRecord {
  return {
    id: 'pw-100',
    spItemId: 100,
    title: '4815 — 2026-04-20',
    reportingPeriodId: 'period-1',
    reportingPeriodSpItemId: 7,
    projectNumber: '4815',
    projectNameSnapshot: 'Sample Project',
    projectLocationSnapshot: 'Indianapolis',
    projectStageSnapshot: 'Active Construction',
    projectSourceClassification: 'project',
    projectLookupId: 42,
    expectedInspectionThisWeek: true,
    inspectionCount: 3,
    averageInspectionScore: 0.94,
    highestRiskFindingLevel: null,
    weeklySummary: '',
    managerReviewStatus: 'not-required',
    publishStatus: 'in-progress',
  };
}

function makeScore(): SafetyExcellenceCandidateScore {
  return {
    eligibilityStatus: 'eligible',
    exclusionReasons: [],
    compositeScore: 86.25,
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
    reasonSummary:
      'Strong inspection performance paired with verified active-jobsite exposure across 3 accepted inspections.',
    sourceInspectionIds: ['ie-1001', 'ie-1002', 'ie-1003'],
    sourceFindingIds: [],
    generatedAt: '2026-04-25T12:00:00.000Z',
    generatorVersion: 'safety-excellence-scoring/0.1',
    publishRecommendation: 'primary',
  };
}

describe('toCandidateWritePayload', () => {
  it('uses Wave 01 internal field names with <Field>LookupId for lookups', () => {
    const payload = toCandidateWritePayload({
      reportingPeriod: makeReportingPeriod(),
      projectWeek: makeProjectWeek(),
      score: makeScore(),
    });
    expect(payload.ReportingPeriodIdLookupId).toBe(7);
    expect(payload.ProjectWeekRecordIdLookupId).toBe(100);
    expect(payload.ProjectLookupIdLookupId).toBe(42);
    expect(payload.ProjectNumber).toBe('4815');
    expect(payload.EligibilityStatus).toBe('eligible');
    expect(payload.PublishRecommendation).toBe('primary');
    expect(payload.ActivityEvidenceStatus).toBe('proven');
    expect(payload.GeneratorVersion).toBe('safety-excellence-scoring/0.1');
  });

  it('serializes JSON-in-Note columns from arrays', () => {
    const payload = toCandidateWritePayload({
      reportingPeriod: makeReportingPeriod(),
      projectWeek: makeProjectWeek(),
      score: makeScore(),
    });
    expect(JSON.parse(String(payload.SourceInspectionIdsJson))).toEqual([
      'ie-1001',
      'ie-1002',
      'ie-1003',
    ]);
    expect(JSON.parse(String(payload.SourceFindingIdsJson))).toEqual([]);
    expect(JSON.parse(String(payload.ExclusionReasonsJson))).toEqual([]);
    expect(payload.ActivityEvidenceJson).toBe('{"status":"proven","source":"manual"}');
  });

  it('does not include any RawChecklistJson field', () => {
    const payload = toCandidateWritePayload({
      reportingPeriod: makeReportingPeriod(),
      projectWeek: makeProjectWeek(),
      score: makeScore(),
    });
    expect(JSON.stringify(payload)).not.toMatch(/RawChecklistJson|rawChecklistJson/);
  });

  it('omits ProjectLookupIdLookupId when projectLookupId is absent', () => {
    const payload = toCandidateWritePayload({
      reportingPeriod: makeReportingPeriod(),
      projectWeek: { ...makeProjectWeek(), projectLookupId: undefined },
      score: makeScore(),
    });
    expect(payload.ProjectLookupIdLookupId).toBeUndefined();
  });
});

describe('computeRollingFloor', () => {
  it('subtracts N×7 days from the current week start (UTC)', () => {
    expect(computeRollingFloor('2026-04-20', 4)).toBe('2026-03-23');
    expect(computeRollingFloor('2026-04-20', 1)).toBe('2026-04-13');
  });

  it('floors fractional weeks to whole weeks', () => {
    expect(computeRollingFloor('2026-04-20', 4.7)).toBe('2026-03-23');
  });

  it('falls back to the input on invalid date', () => {
    expect(computeRollingFloor('not-a-date', 4)).toBe('not-a-date');
  });
});
