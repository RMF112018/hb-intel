import type { SimilarityAssessment } from '../../types/index.js';

export interface SimilarityInput {
  score: number;
  comparablePursuitCount: number;
}

const resolveBand = (score: number): SimilarityAssessment['band'] => {
  if (score >= 0.8) {
    return 'highly-similar';
  }

  if (score >= 0.6) {
    return 'moderately-similar';
  }

  return 'loosely-similar';
};

export const assessSimilarity = (input: SimilarityInput): SimilarityAssessment => ({
  score: input.score,
  band: resolveBand(input.score),
  comparablePursuitCount: input.comparablePursuitCount,
});
