import type { ScoreBenchmarkProfile } from '@hbc/score-benchmark';

export const createMockScoreBenchmarkProfile = (
  overrides?: Partial<ScoreBenchmarkProfile>
): ScoreBenchmarkProfile => ({
  profileId: 'business-development-mock',
  recommendationCutoffs: {
    pursue: 80,
    pursueWithCaution: 65,
    holdForReview: 50,
  },
  governancePolicy: {
    approvedCohorts: ['default'],
    warningDeltaThreshold: 0.25,
  },
  ...overrides,
});
