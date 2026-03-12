import { describe, expect, it } from 'vitest';

import {
  computeOverallPulseConfidence,
  computePulseConfidence,
} from '../computors/confidence/index.js';

describe('health pulse confidence', () => {
  it('derives high/moderate/low/unreliable tiers with deterministic reasons', () => {
    const high = computePulseConfidence({
      excludedMetricRatio: 0,
      staleMetricRatio: 0,
      manualInfluenceRatio: 0,
      trendHistorySufficient: true,
      integrationCompleteness: 1,
    });
    expect(high.tier).toBe('high');

    const moderate = computePulseConfidence({
      excludedMetricRatio: 0.2,
      staleMetricRatio: 0.1,
      manualInfluenceRatio: 0.1,
      trendHistorySufficient: true,
      integrationCompleteness: 0.9,
    });
    expect(['high', 'moderate', 'low']).toContain(moderate.tier);

    const low = computePulseConfidence({
      excludedMetricRatio: 0.6,
      staleMetricRatio: 0.4,
      manualInfluenceRatio: 0.3,
      trendHistorySufficient: false,
      integrationCompleteness: 0.6,
    });
    expect(['low', 'unreliable']).toContain(low.tier);
    expect(low.reasons.length).toBeGreaterThan(0);

    const unreliable = computePulseConfidence({
      excludedMetricRatio: 1,
      staleMetricRatio: 1,
      manualInfluenceRatio: 1,
      trendHistorySufficient: false,
      integrationCompleteness: 0,
    });
    expect(unreliable.tier).toBe('unreliable');
  });

  it('computes overall confidence from dimension confidences', () => {
    const overall = computeOverallPulseConfidence([
      { tier: 'high', score: 90, reasons: ['a'] },
      { tier: 'moderate', score: 70, reasons: ['b'] },
      { tier: 'low', score: 45, reasons: ['c'] },
      { tier: 'unreliable', score: 20, reasons: ['d'] },
    ]);

    expect(overall.score).toBe(56);
    expect(overall.reasons).toEqual(expect.arrayContaining(['a', 'b', 'c', 'd']));
  });

  it('returns unreliable when no dimension confidences exist', () => {
    const overall = computeOverallPulseConfidence([], ['missing-data']);
    expect(overall.tier).toBe('unreliable');
    expect(overall.score).toBe(0);
    expect(overall.reasons).toEqual(expect.arrayContaining(['missing-data']));
  });
});
