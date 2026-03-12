import type { ConfidenceAssessment } from '../../types/index.js';

export interface ConfidenceInput {
  sampleSize: number;
  similarityScore: number;
}

export const assessBenchmarkConfidence = (input: ConfidenceInput): ConfidenceAssessment => {
  if (input.sampleSize < 3) {
    return {
      tier: 'insufficient',
      reasons: ['insufficient-sample-size'],
      sampleSize: input.sampleSize,
    };
  }

  if (input.sampleSize >= 12 && input.similarityScore >= 0.8) {
    return {
      tier: 'high',
      reasons: ['large-sample', 'strong-similarity'],
      sampleSize: input.sampleSize,
    };
  }

  if (input.similarityScore >= 0.6) {
    return {
      tier: 'moderate',
      reasons: ['moderate-similarity'],
      sampleSize: input.sampleSize,
    };
  }

  return {
    tier: 'low',
    reasons: ['low-similarity'],
    sampleSize: input.sampleSize,
  };
};
