import type { RecommendationAssessment, ScoreBenchmarkProfile } from '../../types/index.js';

export interface RecommendationInput {
  benchmarkScore: number;
  profile: ScoreBenchmarkProfile;
}

export const deriveRecommendationState = (
  input: RecommendationInput
): RecommendationAssessment => {
  const { benchmarkScore, profile } = input;

  if (benchmarkScore >= profile.recommendationCutoffs.pursue) {
    return { state: 'Pursue', rationale: ['score-meets-pursue-threshold'] };
  }

  if (benchmarkScore >= profile.recommendationCutoffs.pursueWithCaution) {
    return { state: 'Pursue with Caution', rationale: ['score-meets-caution-threshold'] };
  }

  if (benchmarkScore >= profile.recommendationCutoffs.holdForReview) {
    return { state: 'Hold for Review', rationale: ['score-meets-hold-threshold'] };
  }

  return { state: 'No-Bid Recommended', rationale: ['score-below-hold-threshold'] };
};
