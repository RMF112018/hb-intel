import { describe, expect, it } from 'vitest';

import {
  resolveBidReadinessProfileConfig,
  evaluateReadinessSummary,
  estimatingBidReadinessProfile,
} from './index.js';

describe('bidReadinessConfig', () => {
  it('applies admin overrides with deterministic normalized weights', () => {
    const resolved = resolveBidReadinessProfileConfig({
      criteria: [
        { criterionId: 'cost-sections-populated', weight: 60 },
        { criterionId: 'bid-bond-confirmed', weight: 20 },
        { criterionId: 'addenda-acknowledged', weight: 20 },
      ],
      thresholds: {
        readyMinScore: 95,
        nearlyReadyMinScore: 80,
        attentionNeededMinScore: 60,
      },
    });

    expect(resolved.fallbackApplied).toBe(false);
    const totalWeight = resolved.profile.criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
    expect(Number(totalWeight.toFixed(4))).toBe(100);
    expect(resolved.profile.thresholds).toEqual({
      readyMinScore: 95,
      nearlyReadyMinScore: 80,
      attentionNeededMinScore: 60,
    });
  });

  it('falls back to baseline on invalid threshold ordering', () => {
    const resolved = resolveBidReadinessProfileConfig({
      thresholds: {
        readyMinScore: 60,
        nearlyReadyMinScore: 80,
        attentionNeededMinScore: 40,
      },
    });

    expect(resolved.fallbackApplied).toBe(true);
    expect(resolved.source).toBe('fallback');
    expect(resolved.profile.thresholds).toEqual(estimatingBidReadinessProfile.thresholds);
    expect(resolved.validationErrors.length).toBeGreaterThan(0);
  });

  it('falls back when duplicate criterion overrides are provided', () => {
    const resolved = resolveBidReadinessProfileConfig({
      criteria: [
        { criterionId: 'ce-sign-off', weight: 15 },
        { criterionId: 'ce-sign-off', weight: 20 },
      ],
    });

    expect(resolved.fallbackApplied).toBe(true);
    expect(resolved.validationErrors.some((error) => error.includes('Duplicate criterion overrides'))).toBe(true);
  });

  it('produces degraded recommendation outputs for partial readiness inputs', () => {
    const criteria = estimatingBidReadinessProfile.criteria.map((criterion) => ({
      ...criterion,
      isComplete: false,
    }));

    const { summary, config } = evaluateReadinessSummary(criteria);

    expect(config.profile.criteria.length).toBe(6);
    expect(summary.score.status).toBe('not-ready');
    expect(summary.recommendations.length).toBeGreaterThan(0);
    expect(summary.completeness.completedCount).toBe(0);
    expect(summary.completeness.requiredCount).toBe(6);
  });
});
