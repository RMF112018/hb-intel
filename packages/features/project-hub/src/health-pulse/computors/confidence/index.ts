import type { IPulseConfidence, PulseConfidenceTier } from '../../types/index.js';

export interface IConfidenceComputationInput {
  excludedMetricRatio: number;
  staleMetricRatio: number;
  manualInfluenceRatio: number;
  trendHistorySufficient: boolean;
  integrationCompleteness: number;
  additionalReasons?: string[];
}

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const scoreToTier = (score: number): PulseConfidenceTier => {
  if (score >= 85) return 'high';
  if (score >= 65) return 'moderate';
  if (score >= 40) return 'low';
  return 'unreliable';
};

export const computePulseConfidence = (input: IConfidenceComputationInput): IPulseConfidence => {
  const reasons = [...(input.additionalReasons ?? [])];

  let score = 100;
  score -= clamp(input.excludedMetricRatio, 0, 1) * 35;
  score -= clamp(input.staleMetricRatio, 0, 1) * 25;
  score -= clamp(input.manualInfluenceRatio, 0, 1) * 20;

  const integrationCompleteness = clamp(input.integrationCompleteness, 0, 1);
  score -= (1 - integrationCompleteness) * 20;

  if (!input.trendHistorySufficient) {
    score -= 15;
    reasons.push('Trend history is insufficient for confidence weighting.');
  }

  if (input.excludedMetricRatio > 0) {
    reasons.push('Some metrics were excluded due to missing or stale values.');
  }

  if (input.staleMetricRatio > 0) {
    reasons.push('Some metrics are stale beyond configured thresholds.');
  }

  if (input.manualInfluenceRatio > 0.35) {
    reasons.push('Manual influence exceeds preferred confidence threshold.');
  }

  if (integrationCompleteness < 1) {
    reasons.push('Integration completeness is below 100%.');
  }

  const roundedScore = Math.round(clamp(score, 0, 100));

  return {
    tier: scoreToTier(roundedScore),
    score: roundedScore,
    reasons,
  };
};

export const computeOverallPulseConfidence = (
  confidences: IPulseConfidence[],
  additionalReasons: string[] = []
): IPulseConfidence => {
  if (confidences.length === 0) {
    return {
      tier: 'unreliable',
      score: 0,
      reasons: ['No dimension confidence available.', ...additionalReasons],
    };
  }

  const averageScore = Math.round(
    confidences.reduce((sum, confidence) => sum + confidence.score, 0) / confidences.length
  );

  const reasons = Array.from(
    new Set([...additionalReasons, ...confidences.flatMap((confidence) => confidence.reasons)])
  );

  return {
    tier: scoreToTier(averageScore),
    score: averageScore,
    reasons,
  };
};

export const HEALTH_PULSE_CONFIDENCE_SCOPE = 'health-pulse/confidence';
