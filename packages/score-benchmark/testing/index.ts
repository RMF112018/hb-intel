import type {
  ScoreBenchmarkPrimitiveSnapshot,
  ScoreBenchmarkProfile,
} from '../src/types/index.js';

export const createMockScoreBenchmarkProfile = (): ScoreBenchmarkProfile => ({
  profileId: 'score-benchmark-default',
  recommendationCutoffs: {
    pursue: 80,
    pursueWithCaution: 65,
    holdForReview: 50,
  },
  governancePolicy: {
    approvedCohorts: ['default'],
    warningDeltaThreshold: 0.2,
  },
});

export const createMockScoreBenchmarkSnapshot = (): ScoreBenchmarkPrimitiveSnapshot => ({
  confidence: {
    tier: 'moderate',
    reasons: ['moderate-similarity'],
    sampleSize: 8,
  },
  similarity: {
    score: 0.72,
    band: 'moderately-similar',
    comparablePursuitCount: 16,
  },
  recommendation: {
    state: 'Pursue with Caution',
    rationale: ['score-meets-caution-threshold'],
  },
  governance: {
    defaultCohortLocked: true,
    approvedCohortApplied: true,
    filterChangeLogged: false,
    warningTriggered: false,
  },
  recalibration: {
    predictiveValue: 0.61,
    reviewedAtIso: '2026-01-01T00:00:00.000Z',
    telemetryWindow: 'quarterly',
  },
  explainability: {
    summary: 'Benchmark explanation includes 1 reason code(s).',
    reasonCodes: ['below-historical-win-average'],
  },
});
