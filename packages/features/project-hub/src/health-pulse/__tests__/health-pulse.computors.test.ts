import { describe, expect, it } from 'vitest';

import {
  computeProjectHealthPulse,
  type IComputeProjectHealthPulseInput,
} from '../computors/index.js';
import type { IHealthMetric } from '../types/index.js';

const baseConfig: IComputeProjectHealthPulseInput['adminConfig'] = {
  weights: { field: 0.4, time: 0.3, cost: 0.15, office: 0.15 },
  stalenessThresholdDays: 14,
  metricStalenessOverrides: {},
  manualEntryGovernance: {
    approvalRequiredMetricKeys: ['forecast-confidence'],
    maxManualInfluencePercent: 50,
    maxOverrideAgeDays: 30,
  },
  officeHealthSuppression: {
    lowImpactSuppressionEnabled: true,
    duplicateClusterWindowHours: 24,
    severityWeights: { minor: 1, major: 2, critical: 4 },
  },
  portfolioTriageDefaults: {
    defaultBucket: 'attention-now',
    defaultSort: 'compound-risk-severity',
  },
};

const metric = (
  key: string,
  value: number | null,
  weight: IHealthMetric['weight'],
  label = key
): IHealthMetric => ({
  key,
  label,
  value,
  isStale: false,
  isManualEntry: false,
  lastUpdatedAt: '2026-03-10T00:00:00.000Z',
  weight,
});

describe('health pulse computors', () => {
  it('computes leading/lagging scores, weighted status, and data-pending edge cases', () => {
    const input: IComputeProjectHealthPulseInput = {
      projectId: 'p-001',
      adminConfig: baseConfig,
      computedAt: '2026-03-12T00:00:00.000Z',
      metricsByDimension: {
        cost: [
          metric('forecast-confidence', 80, 'leading'),
          metric('forecast-update-age', 90, 'leading'),
          metric('pending-change-order-aging', 70, 'lagging'),
        ],
        time: [
          metric('look-ahead-reliability', 40, 'leading'),
          metric('near-critical-path-volatility', 35, 'leading'),
          metric('schedule-update-quality', 45, 'lagging'),
        ],
        field: [
          metric('production-throughput-reliability', 88, 'leading'),
          metric('rework-trend', 86, 'leading'),
          metric('plan-complete-reliability', 82, 'lagging'),
        ],
        office: [
          metric('clustering', 60, 'leading'),
          metric('severity-weighted-overdue-signals', 50, 'lagging'),
          metric('low-impact-suppression', 55, 'leading'),
          metric('office-low-impact-reminder-1', 15, 'lagging', 'Minor reminder overdue'),
          metric('office-low-impact-reminder-2', 18, 'lagging', 'Minor reminder overdue'),
        ],
      },
    };

    const { pulse } = computeProjectHealthPulse(input);

    expect(pulse.dimensions.cost.leadingScore).toBe(85);
    expect(pulse.dimensions.cost.laggingScore).toBe(70);
    expect(pulse.dimensions.cost.score).toBe(81);
    expect(pulse.dimensions.time.status).toBe('at-risk');
    expect(pulse.dimensions.field.status).toBe('on-track');
    expect(pulse.dimensions.office.hasExcludedMetrics).toBe(false);
    expect(pulse.explainability.whyThisStatus.join(' ')).toContain('suppression');
    expect(pulse.overallScore).toBeGreaterThanOrEqual(0);

    const noValidInput: IComputeProjectHealthPulseInput = {
      ...input,
      metricsByDimension: {
        ...input.metricsByDimension,
        cost: [metric('forecast-confidence', null, 'leading')],
      },
    };

    const noValid = computeProjectHealthPulse(noValidInput);
    expect(noValid.pulse.dimensions.cost.status).toBe('data-pending');
  });

  it('excludes stale metrics and re-normalizes remaining scores', () => {
    const input: IComputeProjectHealthPulseInput = {
      projectId: 'p-002',
      adminConfig: baseConfig,
      computedAt: '2026-03-12T00:00:00.000Z',
      metricsByDimension: {
        cost: [
          metric('forecast-confidence', 100, 'leading'),
          {
            ...metric('forecast-update-age', 0, 'leading'),
            isStale: true,
          },
          metric('pending-change-order-aging', 100, 'lagging'),
        ],
        time: [
          metric('look-ahead-reliability', 80, 'leading'),
          metric('near-critical-path-volatility', 80, 'leading'),
          metric('schedule-update-quality', 80, 'lagging'),
        ],
        field: [
          metric('production-throughput-reliability', 80, 'leading'),
          metric('rework-trend', 80, 'leading'),
          metric('plan-complete-reliability', 80, 'lagging'),
        ],
        office: [
          metric('clustering', 80, 'leading'),
          metric('severity-weighted-overdue-signals', 80, 'lagging'),
          metric('low-impact-suppression', 80, 'leading'),
        ],
      },
    };

    const { pulse } = computeProjectHealthPulse(input);

    expect(pulse.dimensions.cost.leadingScore).toBe(100);
    expect(pulse.dimensions.cost.hasExcludedMetrics).toBe(true);
    expect(pulse.dimensions.cost.confidence.reasons.join(' ')).toContain('excluded');
  });
});
