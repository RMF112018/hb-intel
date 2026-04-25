import { beforeEach, describe, expect, it } from 'vitest';
import { computeConsistencyTrendScore } from '../consistency.js';
import { partitionInspections } from '../inspectionFiltering.js';
import { makeInspection, resetCounters } from './fixtures.js';

describe('consistency', () => {
  beforeEach(() => {
    resetCounters();
  });

  it('returns 0 when no accepted inspections in window', () => {
    const result = computeConsistencyTrendScore([], []);
    expect(result.score).toBe(0);
    expect(result.averageInspectionScoreWindow).toBeNull();
    expect(result.inspectionTrendPct).toBeNull();
  });

  it('returns 50 when rolling history is empty', () => {
    const window = [makeInspection({ status: 'accepted', scoreFraction: 0.95 })];
    const result = computeConsistencyTrendScore(window, []);
    expect(result.score).toBe(50);
    expect(result.averageInspectionScoreWindow).toBeCloseTo(95, 6);
    expect(result.averageInspectionScoreRolling).toBeNull();
    expect(result.inspectionTrendPct).toBeNull();
  });

  it('positive trend pulls score above 50', () => {
    const window = partitionInspections([
      makeInspection({ status: 'accepted', scoreFraction: 0.95 }),
    ]).accepted;
    const prior = [
      makeInspection({ status: 'accepted', scoreFraction: 0.85 }),
      makeInspection({ status: 'accepted', scoreFraction: 0.85 }),
    ];
    const result = computeConsistencyTrendScore(window, prior);
    expect(result.score).toBeGreaterThan(50);
    expect(result.inspectionTrendPct).not.toBeNull();
    expect(result.inspectionTrendPct).toBeGreaterThan(0);
  });

  it('negative trend pulls score below 50', () => {
    const window = partitionInspections([
      makeInspection({ status: 'accepted', scoreFraction: 0.7 }),
    ]).accepted;
    const prior = [
      makeInspection({ status: 'accepted', scoreFraction: 0.95 }),
      makeInspection({ status: 'accepted', scoreFraction: 0.95 }),
    ];
    const result = computeConsistencyTrendScore(window, prior);
    expect(result.score).toBeLessThan(50);
    expect(result.inspectionTrendPct).not.toBeNull();
    expect(result.inspectionTrendPct).toBeLessThan(0);
  });

  it('clamps trend deltas beyond ±20 percentage points', () => {
    const window = partitionInspections([
      makeInspection({ status: 'accepted', scoreFraction: 1 }),
    ]).accepted;
    const prior = [makeInspection({ status: 'accepted', scoreFraction: 0.5 })];
    const result = computeConsistencyTrendScore(window, prior);
    expect(result.score).toBe(100);
  });
});
