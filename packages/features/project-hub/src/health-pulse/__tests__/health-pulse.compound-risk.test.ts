import { describe, expect, it } from 'vitest';

import {
  applyCompoundRiskToRecommendation,
  applyCompoundRiskToTriage,
  evaluateCompoundRiskSignals,
} from '../computors/compound-risk/index.js';
import type { IHealthDimension, ITopRecommendedAction } from '../types/index.js';

const dimension = (
  label: IHealthDimension['label'],
  status: IHealthDimension['status'],
  trend: IHealthDimension['trend'],
  score: number
): IHealthDimension => ({
  score,
  status,
  label,
  leadingScore: score,
  laggingScore: score,
  metrics: [],
  keyMetric: `${label.toLowerCase()}-key`,
  trend,
  hasExcludedMetrics: false,
  confidence: {
    tier: 'moderate',
    score,
    reasons: [],
  },
});

describe('health pulse compound risk', () => {
  it('emits required rule family signals and severity metadata', () => {
    const result = evaluateCompoundRiskSignals({
      time: dimension('Time', 'critical', 'declining', 30),
      field: dimension('Field', 'at-risk', 'declining', 35),
      cost: dimension('Cost', 'at-risk', 'declining', 45),
      office: dimension('Office', 'watch', 'declining', 50),
    });

    expect(result.signals.map((signal) => signal.code)).toEqual(
      expect.arrayContaining([
        'time-field-deterioration',
        'cost-time-correlation',
        'office-field-amplification',
      ])
    );
    expect(result.triageSortDelta).toBeGreaterThan(0);
    expect(result.recommendationUrgencyDelta).toBeGreaterThan(0);
  });

  it('applies risk deltas to triage and recommendation outputs', () => {
    const result = evaluateCompoundRiskSignals({
      time: dimension('Time', 'watch', 'stable', 70),
      field: dimension('Field', 'watch', 'declining', 60),
      cost: dimension('Cost', 'watch', 'declining', 60),
      office: dimension('Office', 'watch', 'declining', 60),
    });

    const triage = applyCompoundRiskToTriage(
      { bucket: 'trending-down', sortScore: 50, triageReasons: [] },
      result
    );

    const recommendation: ITopRecommendedAction = {
      actionText: 'Prioritize schedule blockers',
      actionLink: '/source/schedule',
      reasonCode: 'time-field-risk',
      owner: 'PM',
      urgency: 50,
      impact: 70,
      confidenceWeight: 80,
    };

    const updatedRecommendation = applyCompoundRiskToRecommendation(recommendation, result);

    expect(triage.sortScore).toBeGreaterThanOrEqual(50);
    expect(updatedRecommendation?.urgency).toBeGreaterThanOrEqual(50);
  });
});
