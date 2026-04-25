import { beforeEach, describe, expect, it } from 'vitest';
import {
  COMPOSITE_WEIGHTS,
  computeCompositeScore,
  computeSafetyPerformanceScore,
  roundToHundredths,
} from '../scoring.js';
import { makeInspection, resetCounters } from './fixtures.js';

describe('scoring', () => {
  beforeEach(() => {
    resetCounters();
  });

  it('locks composite weights to the prompt-defined ratios', () => {
    expect(COMPOSITE_WEIGHTS.safetyPerformance).toBe(0.3);
    expect(COMPOSITE_WEIGHTS.consistencyTrend).toBe(0.2);
    expect(COMPOSITE_WEIGHTS.activityExposure).toBe(0.2);
    expect(COMPOSITE_WEIGHTS.correctiveAction).toBe(0.2);
    expect(COMPOSITE_WEIGHTS.dataQuality).toBe(0.1);
  });

  it('computes the composite via weighted blend exactly', () => {
    const composite = computeCompositeScore({
      safetyPerformance: 100,
      consistencyTrend: 80,
      activityExposure: 90,
      correctiveAction: 70,
      dataQuality: 60,
    });
    // 100*0.3 + 80*0.2 + 90*0.2 + 70*0.2 + 60*0.1 = 30+16+18+14+6 = 84
    expect(composite).toBeCloseTo(84, 6);
  });

  it('safety performance score reflects accepted average in 0..100', () => {
    const accepted = [
      makeInspection({ status: 'accepted', scoreFraction: 1 }),
      makeInspection({ status: 'accepted', scoreFraction: 0.6 }),
    ];
    expect(computeSafetyPerformanceScore(accepted)).toBeCloseTo(80, 6);
  });

  it('safety performance score is 0 when no accepted inspections', () => {
    expect(computeSafetyPerformanceScore([])).toBe(0);
  });

  it('rounds only at the public boundary', () => {
    expect(roundToHundredths(83.999)).toBe(84);
    expect(roundToHundredths(83.991)).toBe(83.99);
    expect(roundToHundredths(0.005)).toBe(0.01);
  });

  it('treats fractional repo scores correctly when fed through the boundary', () => {
    // A perfect inspection stored as 1 (fraction) must produce 100, not 1.
    const accepted = [makeInspection({ status: 'accepted', scoreFraction: 1 })];
    expect(computeSafetyPerformanceScore(accepted)).toBe(100);
  });
});
