import {
  BENCHMARK_MIN_SAMPLE_SIZE,
} from '../../constants/index.js';
import type {
  BenchmarkConfidenceTier,
  BenchmarkRecommendationState,
  IBenchmarkConfidence,
  IBenchmarkRecommendation,
  IReviewerConsensus,
} from '../../types/index.js';

export interface ZoneRange {
  min: number | null;
  max: number | null;
}

export const computeZoneRange = (scores: readonly number[]): ZoneRange => {
  if (scores.length === 0) {
    return { min: null, max: null };
  }

  return {
    min: Math.min(...scores),
    max: Math.max(...scores),
  };
};

export const hasZoneOverlap = (
  winZone: ZoneRange,
  lossRiskZone: ZoneRange
): boolean => {
  if (
    winZone.min === null ||
    winZone.max === null ||
    lossRiskZone.min === null ||
    lossRiskZone.max === null
  ) {
    return false;
  }

  return winZone.min <= lossRiskZone.max && lossRiskZone.min <= winZone.max;
};

export const computeDistanceToWinZone = (
  overallScore: number | null,
  winZoneMin: number | null
): number | null => {
  if (overallScore === null || winZoneMin === null) {
    return null;
  }

  return overallScore >= winZoneMin ? 0 : Number((winZoneMin - overallScore).toFixed(4));
};

export interface ConfidenceSignals {
  sampleSize: number;
  similarityScore: number;
  recencyScore: number;
  completenessScore: number;
}

const resolveConfidenceTier = (signals: ConfidenceSignals): BenchmarkConfidenceTier => {
  if (signals.sampleSize < BENCHMARK_MIN_SAMPLE_SIZE) {
    return 'insufficient';
  }

  const weighted =
    signals.sampleSize * 0.25 +
    signals.similarityScore * 0.3 +
    signals.recencyScore * 0.2 +
    signals.completenessScore * 0.25;

  if (weighted >= 0.8) {
    return 'high';
  }

  if (weighted >= 0.6) {
    return 'moderate';
  }

  return 'low';
};

export const deriveConfidence = (signals: ConfidenceSignals): IBenchmarkConfidence => {
  const tier = resolveConfidenceTier(signals);

  const reasons: string[] = [];
  if (signals.sampleSize < BENCHMARK_MIN_SAMPLE_SIZE) {
    reasons.push('insufficient-sample-size');
  }
  if (signals.similarityScore < 0.6) {
    reasons.push('weak-similarity-quality');
  }
  if (signals.recencyScore < 0.5) {
    reasons.push('stale-comparables');
  }
  if (signals.completenessScore < 0.7) {
    reasons.push('incomplete-history-data');
  }

  return {
    tier,
    sampleSizeScore: signals.sampleSize,
    similarityScore: signals.similarityScore,
    recencyScore: signals.recencyScore,
    completenessScore: signals.completenessScore,
    reasons,
    caution: tier === 'low' || tier === 'insufficient',
  };
};

export interface RecommendationSignals {
  distanceToWinZone: number | null;
  lossRiskOverlap: boolean;
  confidenceTier: BenchmarkConfidenceTier;
  similarityStrength: number;
  consensus: IReviewerConsensus;
}

const recommendationRank: Record<BenchmarkRecommendationState, number> = {
  'no-bid-recommended': 0,
  'hold-for-review': 1,
  'pursue-with-caution': 2,
  pursue: 3,
};

const capRecommendation = (
  baseState: BenchmarkRecommendationState,
  cap: BenchmarkRecommendationState
): BenchmarkRecommendationState => {
  return recommendationRank[baseState] <= recommendationRank[cap] ? baseState : cap;
};

export const deriveRecommendation = (
  signals: RecommendationSignals
): IBenchmarkRecommendation => {
  let base: BenchmarkRecommendationState;

  if (signals.distanceToWinZone === null) {
    base = 'hold-for-review';
  } else if (signals.distanceToWinZone === 0 && signals.similarityStrength >= 0.7) {
    base = 'pursue';
  } else if (signals.distanceToWinZone <= 5) {
    base = 'pursue-with-caution';
  } else if (signals.distanceToWinZone <= 12) {
    base = 'hold-for-review';
  } else {
    base = 'no-bid-recommended';
  }

  let state = base;
  if (signals.lossRiskOverlap && (signals.confidenceTier === 'low' || signals.confidenceTier === 'insufficient')) {
    state = capRecommendation(state, 'hold-for-review');
  }

  if (signals.lossRiskOverlap && signals.consensus.consensusStrength < 0.55) {
    state = capRecommendation(state, 'pursue-with-caution');
  }

  return {
    state,
    rationaleCodes: [
      'distance-to-win-zone',
      signals.lossRiskOverlap ? 'loss-risk-overlap' : 'no-loss-risk-overlap',
      `confidence-${signals.confidenceTier}`,
    ],
    derivedFrom: {
      distanceToWinZone: signals.distanceToWinZone,
      lossRiskOverlap: signals.lossRiskOverlap,
      confidenceTier: signals.confidenceTier,
      similarity: signals.similarityStrength,
      consensusStrength: signals.consensus.consensusStrength,
    },
  };
};
