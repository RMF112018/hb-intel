import { describe, expect, it } from 'vitest';

import {
  useHealthPulseAdminConfig,
  useProjectHealthPulse,
} from '../hooks/index.js';
import type { IHealthMetric } from '../types/index.js';

const metric = (key: string, value: number): IHealthMetric => ({
  key,
  label: key,
  value,
  isStale: false,
  isManualEntry: false,
  lastUpdatedAt: '2026-03-10T00:00:00.000Z',
  weight: 'leading',
});

const config = {
  weights: { field: 0.4, time: 0.3, cost: 0.15, office: 0.15 },
  stalenessThresholdDays: 14,
  metricStalenessOverrides: {},
  manualEntryGovernance: {
    approvalRequiredMetricKeys: ['forecast-confidence'],
    maxManualInfluencePercent: 40,
    maxOverrideAgeDays: 14,
  },
  officeHealthSuppression: {
    lowImpactSuppressionEnabled: true,
    duplicateClusterWindowHours: 24,
    severityWeights: { minor: 1, major: 2, critical: 3 },
  },
  portfolioTriageDefaults: {
    defaultBucket: 'attention-now' as const,
    defaultSort: 'deterioration-velocity' as const,
  },
};

describe('health pulse hooks orchestration', () => {
  it('composes deterministic pulse output over computors', async () => {
    const result = useProjectHealthPulse({
      projectId: 'p-hooks',
      adminConfig: config,
      now: () => new Date('2026-03-12T00:00:00.000Z'),
      metricsByDimension: {
        cost: [metric('forecast-confidence', 90), metric('forecast-update-age', 90), metric('pending-change-order-aging', 90)],
        time: [metric('look-ahead-reliability', 90), metric('near-critical-path-volatility', 90), metric('schedule-update-quality', 90)],
        field: [metric('production-throughput-reliability', 90), metric('rework-trend', 90), metric('plan-complete-reliability', 90)],
        office: [metric('clustering', 90), metric('severity-weighted-overdue-signals', 90), metric('low-impact-suppression', 90)],
      },
    });

    expect(result.pulse?.projectId).toBe('p-hooks');
    expect(result.derivation.evaluatedAt).toBe('2026-03-12T00:00:00.000Z');
    await result.refresh();
  });

  it('returns validation-backed config state for admin config hook', async () => {
    const result = useHealthPulseAdminConfig({ initialConfig: config });

    expect(result.isValid).toBe(true);
    await result.save(config);
    await result.save({
      ...config,
      weights: { field: 1, time: 1, cost: 1, office: 1 },
    });
    result.reset();
    await result.refresh();
  });
});
