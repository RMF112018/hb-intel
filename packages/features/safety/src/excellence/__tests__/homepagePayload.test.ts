import { describe, expect, it } from 'vitest';
import { buildHomepagePayload } from '../homepagePayload.js';
import type {
  SafetyExcellenceCandidateScore,
  SafetyFieldExcellenceHomepagePayload,
} from '../types.js';
import { makeReportingPeriod } from './fixtures.js';

function buildScore(
  overrides: Partial<SafetyExcellenceCandidateScore>,
): SafetyExcellenceCandidateScore {
  return {
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
    reasonSummary:
      'Strong inspection performance paired with verified active-jobsite exposure across 3 accepted inspections.',
    sourceInspectionIds: ['ie-1'],
    sourceFindingIds: [],
    generatedAt: '2026-04-25T12:00:00.000Z',
    generatorVersion: 'safety-excellence-scoring/0.1',
    publishRecommendation: 'primary',
    ...overrides,
  };
}

describe('homepagePayload', () => {
  it('refuses to publish an ineligible candidate', () => {
    const ineligible = buildScore({
      eligibilityStatus: 'ineligible',
      publishRecommendation: 'do-not-publish',
    });
    expect(() =>
      buildHomepagePayload({ primary: ineligible, reportingPeriod: makeReportingPeriod() }),
    ).toThrow(/ineligible|do-not-publish/i);
  });

  it('builds a payload that matches the homepage publish-DTO shape', () => {
    const payload = buildHomepagePayload({
      primary: buildScore({}),
      reportingPeriod: makeReportingPeriod(),
    });
    expect(payload.isPreview).toBe(false);
    expect(payload.heading).toMatch(/Safety/i);
    expect(payload.topLineSummary.statusLabel).toMatch(/recognition/i);
    expect(payload.primarySpotlight).toBeDefined();
    expect(payload.dataConfidence).toBe('high');
    expect(payload.weekStartDate).toBe('2026-04-20');
    expect(payload.weekEndDate).toBe('2026-04-26');
  });

  it('caps secondary signals at 4', () => {
    const payload = buildHomepagePayload({
      primary: buildScore({}),
      secondary: Array.from({ length: 7 }, (_, i) =>
        buildScore({
          publishRecommendation: 'secondary',
          sourceInspectionIds: [`ie-${i}`],
        }),
      ),
      reportingPeriod: makeReportingPeriod(),
    });
    expect(payload.secondarySignals.length).toBe(4);
  });

  it('drops do-not-publish secondaries silently', () => {
    const payload = buildHomepagePayload({
      primary: buildScore({}),
      secondary: [
        buildScore({ publishRecommendation: 'secondary' }),
        buildScore({ publishRecommendation: 'do-not-publish', eligibilityStatus: 'ineligible' }),
      ],
      reportingPeriod: makeReportingPeriod(),
    });
    expect(payload.secondarySignals).toHaveLength(1);
  });

  it('lowers data confidence for low data quality candidates', () => {
    const payload = buildHomepagePayload({
      primary: buildScore({ dataQualityScore: 40, activityEvidenceStatus: 'inferred' }),
      reportingPeriod: makeReportingPeriod(),
    });
    expect(payload.dataConfidence).toBe('low');
    expect(payload.degradedNotice).toBeDefined();
  });

  it('payload is JSON-serializable and excludes raw checklist or inspector detail', () => {
    const payload = buildHomepagePayload({
      primary: buildScore({}),
      reportingPeriod: makeReportingPeriod(),
    });
    const serialized = JSON.stringify(payload);
    expect(serialized).not.toMatch(/rawChecklistJson|inspector|@example|UPN/i);
    const roundTripped = JSON.parse(serialized) as SafetyFieldExcellenceHomepagePayload;
    expect(roundTripped.heading).toBe(payload.heading);
  });

  it('contract-parity: produced payload field names align with the SPFx homepage contract shape', () => {
    // Compile-time fixture: the homepage publish-payload DTO uses field
    // names that map cleanly into `SafetyFieldExcellenceConfig`. Prompt 05
    // owns the actual SPFx adapter and final type alignment, but we pin
    // the field-name parity here to surface drift early. We do NOT import
    // from `apps/hb-webparts` to preserve package direction.
    const expectedFields = [
      'heading',
      'topLineSummary',
      'primarySpotlight',
      'secondarySignals',
      'sectionCta',
    ];
    const payload = buildHomepagePayload({
      primary: buildScore({}),
      reportingPeriod: makeReportingPeriod(),
    });
    for (const field of expectedFields) {
      expect(payload).toHaveProperty(field);
    }
  });
});
