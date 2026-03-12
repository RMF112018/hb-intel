import { describe, expect, it } from 'vitest';

import { applyOfficeSuppressionPolicy } from '../computors/office-suppression/index.js';
import type { IHealthMetric, IOfficeSuppressionPolicy } from '../types/index.js';

const metric = (key: string, label: string, value: number): IHealthMetric => ({
  key,
  label,
  value,
  isStale: false,
  isManualEntry: false,
  lastUpdatedAt: '2026-03-10T00:00:00.000Z',
  weight: 'lagging',
});

const policy: IOfficeSuppressionPolicy = {
  lowImpactSuppressionEnabled: true,
  duplicateClusterWindowHours: 24,
  severityWeights: { minor: 1, major: 2, critical: 4 },
};

describe('health pulse office suppression', () => {
  it('suppresses low-impact and duplicate clustered metrics', () => {
    const result = applyOfficeSuppressionPolicy(
      [
        metric('office-low-impact-reminder', 'low impact reminder overdue', 5),
        metric('office-major-overdue-a', 'major overdue', 10),
        {
          ...metric('office-major-overdue-b', 'major overdue newer', 20),
          lastUpdatedAt: '2026-03-11T00:00:00.000Z',
        },
      ],
      policy
    );

    expect(result.summary.suppressedCount).toBeGreaterThan(0);
    expect(result.retainedMetrics.length).toBe(1);
    expect(result.summary.severityWeightedOverdueScore).toBe(40);
  });

  it('suppresses the candidate when a duplicate cluster metric is older than existing', () => {
    const result = applyOfficeSuppressionPolicy(
      [
        {
          ...metric('office-major-overdue-a', 'major overdue existing', 10),
          lastUpdatedAt: '2026-03-11T00:00:00.000Z',
        },
        metric('office-major-overdue-b', 'major overdue older candidate', 20),
      ],
      policy
    );

    expect(result.retainedMetrics).toHaveLength(1);
    expect(result.summary.suppressedMetricKeys).toContain('office-major-overdue-b');
  });

  it('keeps low-impact metrics when suppression is disabled', () => {
    const result = applyOfficeSuppressionPolicy(
      [metric('office-low-impact-reminder', 'low impact reminder overdue', 5)],
      { ...policy, lowImpactSuppressionEnabled: false }
    );

    expect(result.retainedMetrics).toHaveLength(1);
  });

  it('ignores overdue metrics with null values for weighted score', () => {
    const nullValueMetric: IHealthMetric = {
      ...metric('office-critical-overdue', 'critical overdue', 10),
      value: null,
    };

    const result = applyOfficeSuppressionPolicy([nullValueMetric], policy);
    expect(result.summary.severityWeightedOverdueScore).toBe(0);
  });
});
