import { beforeEach, describe, expect, it } from 'vitest';
import { buildReasonSummary, clearedSignals } from '../narrative.js';
import { makeFinding, resetCounters } from './fixtures.js';

describe('narrative', () => {
  beforeEach(() => {
    resetCounters();
  });

  it('counts cleared signals across independent dimensions', () => {
    const signals = clearedSignals(
      {
        safetyPerformance: 90,
        consistencyTrend: 70,
        activityExposure: 90,
        correctiveAction: 90,
        dataQuality: 90,
      },
      { status: 'proven', source: 'manual' },
      {
        highestRiskFindingLevel: null,
        highSeverityFindingCount: 0,
        mediumSeverityFindingCount: 0,
        openFindingCount: 0,
        highSeverityOpenCount: 0,
        mediumSeverityOpenCount: 0,
        agedOpenFindingCount: 0,
        repeatFindingCount: 0,
        sourceFindingIds: [],
      },
    );
    expect(signals).toContain('safety-performance');
    expect(signals).toContain('consistency-trend');
    expect(signals).toContain('activity-exposure');
    expect(signals).toContain('corrective-action');
    expect(signals).toContain('data-quality');
  });

  it('builds a multi-signal reason summary referencing at least two signals', () => {
    const result = buildReasonSummary({
      projectNumber: '4815',
      projectNameSnapshot: 'Sample Project',
      composite: 90,
      parts: {
        safetyPerformance: 95,
        consistencyTrend: 70,
        activityExposure: 90,
        correctiveAction: 90,
        dataQuality: 85,
      },
      consistency: {
        score: 70,
        averageInspectionScoreWindow: 95,
        averageInspectionScoreRolling: 90,
        inspectionTrendPct: 5,
      },
      summary: {
        highestRiskFindingLevel: null,
        highSeverityFindingCount: 0,
        mediumSeverityFindingCount: 0,
        openFindingCount: 0,
        highSeverityOpenCount: 0,
        mediumSeverityOpenCount: 0,
        agedOpenFindingCount: 0,
        repeatFindingCount: 0,
        sourceFindingIds: [],
      },
      evidence: { status: 'proven', source: 'manual' },
      inspectionCountWindow: 3,
    });
    expect(result.hasMultiSignal).toBe(true);
    expect(result.signals.length).toBeGreaterThanOrEqual(2);
    expect(result.reasonSummary.length).toBeGreaterThan(40);
  });

  it('flags single-signal narrative when only one dimension clears', () => {
    const result = buildReasonSummary({
      projectNumber: '4815',
      projectNameSnapshot: 'Sample Project',
      composite: 50,
      parts: {
        safetyPerformance: 100,
        consistencyTrend: 50,
        activityExposure: 20,
        correctiveAction: 50,
        dataQuality: 60,
      },
      consistency: {
        score: 50,
        averageInspectionScoreWindow: 100,
        averageInspectionScoreRolling: null,
        inspectionTrendPct: null,
      },
      summary: {
        highestRiskFindingLevel: null,
        highSeverityFindingCount: 0,
        mediumSeverityFindingCount: 1,
        openFindingCount: 1,
        highSeverityOpenCount: 0,
        mediumSeverityOpenCount: 1,
        agedOpenFindingCount: 0,
        repeatFindingCount: 0,
        sourceFindingIds: [makeFinding().id],
      },
      evidence: { status: 'missing', source: 'none' },
      inspectionCountWindow: 1,
    });
    expect(result.hasMultiSignal).toBe(false);
    expect(result.reasonSummary).toMatch(/single-signal/i);
  });

  it('does not include inspector or employee names in the reason summary', () => {
    const result = buildReasonSummary({
      projectNumber: '4815',
      projectNameSnapshot: 'Sample Project',
      composite: 90,
      parts: {
        safetyPerformance: 95,
        consistencyTrend: 70,
        activityExposure: 90,
        correctiveAction: 90,
        dataQuality: 85,
      },
      consistency: {
        score: 70,
        averageInspectionScoreWindow: 95,
        averageInspectionScoreRolling: 90,
        inspectionTrendPct: 5,
      },
      summary: {
        highestRiskFindingLevel: null,
        highSeverityFindingCount: 0,
        mediumSeverityFindingCount: 0,
        openFindingCount: 0,
        highSeverityOpenCount: 0,
        mediumSeverityOpenCount: 0,
        agedOpenFindingCount: 0,
        repeatFindingCount: 0,
        sourceFindingIds: [],
      },
      evidence: { status: 'proven', source: 'manual' },
      inspectionCountWindow: 3,
    });
    expect(result.reasonSummary).not.toMatch(/Inspector|@example|UPN/i);
  });
});
