import type { ScoreBenchmarkProfile } from '@hbc/score-benchmark';

export const businessDevelopmentScoreBenchmarkProfile: ScoreBenchmarkProfile = {
  profileId: 'business-development-default',
  recommendationCutoffs: {
    pursue: 82,
    pursueWithCaution: 68,
    holdForReview: 50,
  },
  governancePolicy: {
    approvedCohorts: ['default', 'regional', 'market-segment'],
    warningDeltaThreshold: 0.2,
  },
};
