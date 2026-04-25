import { describe, expect, it } from 'vitest';
import { rankCandidates } from '../ranking.js';
import type { SafetyExcellenceCandidateScore } from '../types.js';

function buildScore(
  overrides: Partial<SafetyExcellenceCandidateScore>,
): SafetyExcellenceCandidateScore {
  return {
    eligibilityStatus: 'eligible',
    exclusionReasons: [],
    compositeScore: 80,
    safetyPerformanceScore: 90,
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
    activityEvidenceJson: '{}',
    reasonSummary: '',
    sourceInspectionIds: ['ie-1'],
    sourceFindingIds: [],
    generatedAt: '2026-04-25T00:00:00.000Z',
    generatorVersion: 'safety-excellence-scoring/0.1',
    publishRecommendation: 'primary',
    ...overrides,
  };
}

describe('ranking', () => {
  it('eligible candidate ranks above low-confidence even with a higher raw score', () => {
    const lowConfidenceHigher = buildScore({
      eligibilityStatus: 'low-confidence',
      compositeScore: 95,
      publishRecommendation: 'monitor',
      activityEvidenceStatus: 'inferred',
    });
    const eligibleLower = buildScore({
      eligibilityStatus: 'eligible',
      compositeScore: 80,
      publishRecommendation: 'primary',
    });
    const ranked = rankCandidates([lowConfidenceHigher, eligibleLower]);
    expect(ranked[0]).toBe(eligibleLower);
    expect(ranked[1]).toBe(lowConfidenceHigher);
  });

  it('do-not-publish always sinks to the bottom', () => {
    const blocked = buildScore({
      eligibilityStatus: 'ineligible',
      compositeScore: 100,
      publishRecommendation: 'do-not-publish',
    });
    const eligible = buildScore({
      eligibilityStatus: 'eligible',
      compositeScore: 70,
      publishRecommendation: 'secondary',
    });
    const ranked = rankCandidates([blocked, eligible]);
    expect(ranked[0]).toBe(eligible);
    expect(ranked[1]).toBe(blocked);
  });

  it('higher composite wins within the same eligibility group', () => {
    const high = buildScore({ compositeScore: 90 });
    const low = buildScore({ compositeScore: 80 });
    const ranked = rankCandidates([low, high]);
    expect(ranked[0]).toBe(high);
  });

  it('proven activity outranks inferred at equal composite', () => {
    const proven = buildScore({ compositeScore: 80, activityEvidenceStatus: 'proven' });
    const inferred = buildScore({ compositeScore: 80, activityEvidenceStatus: 'inferred' });
    const ranked = rankCandidates([inferred, proven]);
    expect(ranked[0]).toBe(proven);
  });

  it('fewer findings outrank more findings at equal score and evidence', () => {
    const cleaner = buildScore({ openFindingCount: 0 });
    const noisier = buildScore({ openFindingCount: 4 });
    const ranked = rankCandidates([noisier, cleaner]);
    expect(ranked[0]).toBe(cleaner);
  });

  it('newer generatedAt wins as final tie-breaker', () => {
    const older = buildScore({ generatedAt: '2026-04-20T00:00:00.000Z' });
    const newer = buildScore({ generatedAt: '2026-04-25T00:00:00.000Z' });
    const ranked = rankCandidates([older, newer]);
    expect(ranked[0]).toBe(newer);
  });
});
