import { describe, expect, it } from 'vitest';
import {
  computeDistanceToWinZone,
  computeZoneRange,
  deriveConfidence,
  deriveRecommendation,
  hasZoneOverlap,
} from './rules.js';
import type { IReviewerConsensus } from '../../types/index.js';

const consensus = (strength: number): IReviewerConsensus => ({
  variance: 0.2,
  consensusStrength: strength,
  largestDisagreements: [],
  roleComparisons: [],
  escalationRecommended: false,
});

describe('lifecycle rules', () => {
  it('computes zone ranges, overlap, and distance helpers', () => {
    expect(computeZoneRange([])).toEqual({ min: null, max: null });
    expect(computeZoneRange([10, 20, 15])).toEqual({ min: 10, max: 20 });
    expect(hasZoneOverlap({ min: 70, max: 80 }, { min: 79, max: 90 })).toBe(true);
    expect(hasZoneOverlap({ min: 70, max: 75 }, { min: 76, max: 90 })).toBe(false);
    expect(computeDistanceToWinZone(null, 70)).toBeNull();
    expect(computeDistanceToWinZone(72, 70)).toBe(0);
    expect(computeDistanceToWinZone(66.1234, 70)).toBe(3.8766);
  });

  it('derives confidence tiers and reasons across high and insufficient thresholds', () => {
    const insufficient = deriveConfidence({
      sampleSize: 3,
      similarityScore: 0.3,
      recencyScore: 0.4,
      completenessScore: 0.5,
    });
    expect(insufficient.tier).toBe('insufficient');
    expect(insufficient.reasons).toContain('insufficient-sample-size');
    expect(insufficient.caution).toBe(true);

    const high = deriveConfidence({
      sampleSize: 12,
      similarityScore: 0.9,
      recencyScore: 0.9,
      completenessScore: 0.9,
    });
    expect(high.tier).toBe('high');
  });

  it('derives recommendation precedence and caps in overlap/caution states', () => {
    const pursue = deriveRecommendation({
      distanceToWinZone: 0,
      lossRiskOverlap: false,
      confidenceTier: 'high',
      similarityStrength: 0.8,
      consensus: consensus(0.8),
    });
    expect(pursue.state).toBe('pursue');

    const noBid = deriveRecommendation({
      distanceToWinZone: 20,
      lossRiskOverlap: false,
      confidenceTier: 'high',
      similarityStrength: 0.8,
      consensus: consensus(0.8),
    });
    expect(noBid.state).toBe('no-bid-recommended');

    const overlapLowConfidence = deriveRecommendation({
      distanceToWinZone: 0,
      lossRiskOverlap: true,
      confidenceTier: 'insufficient',
      similarityStrength: 0.9,
      consensus: consensus(0.8),
    });
    expect(overlapLowConfidence.state).toBe('hold-for-review');

    const overlapWeakConsensus = deriveRecommendation({
      distanceToWinZone: 0,
      lossRiskOverlap: true,
      confidenceTier: 'high',
      similarityStrength: 0.9,
      consensus: consensus(0.3),
    });
    expect(overlapWeakConsensus.state).toBe('pursue-with-caution');

    const nullDistance = deriveRecommendation({
      distanceToWinZone: null,
      lossRiskOverlap: false,
      confidenceTier: 'high',
      similarityStrength: 0.9,
      consensus: consensus(0.8),
    });
    expect(nullDistance.state).toBe('hold-for-review');
  });
});
