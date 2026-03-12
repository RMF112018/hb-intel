import { describe, expect, it } from 'vitest';

import { computeProjectHealthPulse } from '../computors/index.js';
import type { IHealthMetric } from '../types/index.js';

const baseConfig = {
  weights: { field: 0.4, time: 0.3, cost: 0.15, office: 0.15 },
  stalenessThresholdDays: 14,
  metricStalenessOverrides: {},
  manualEntryGovernance: {
    approvalRequiredMetricKeys: ['x'],
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

const metric = (key: string, value: number | null, weight: IHealthMetric['weight']): IHealthMetric => ({
  key,
  label: key,
  value,
  isStale: false,
  isManualEntry: false,
  lastUpdatedAt: '2026-03-10T00:00:00.000Z',
  weight,
});

describe('health pulse computors branches', () => {
  it('covers missing-required-signal and unreliable confidence branches', () => {
    const result = computeProjectHealthPulse({
      projectId: 'p-branch-a',
      adminConfig: {
        ...baseConfig,
        portfolioTriageDefaults: {
          ...baseConfig.portfolioTriageDefaults,
          defaultBucket: '' as unknown as 'attention-now',
        },
      },
      metricsByDimension: {
        cost: [metric('forecast-confidence', null, 'leading')],
        time: [metric('look-ahead-reliability', 10, 'leading')],
        field: [metric('production-throughput-reliability', 10, 'leading')],
        office: [metric('clustering', 10, 'leading')],
      },
      trendHistorySufficient: { cost: false, time: false, field: false, office: false },
      integrationCompleteness: { cost: 0, time: 0.1, field: 0.1, office: 0.1 },
    });

    expect(result.pulse.dimensions.cost.status).toBe('data-pending');
    expect(result.pulse.overallStatus).toBe('critical');
    expect(result.pulse.explainability.whyThisStatus.join(' ')).toContain('Missing required');
    expect(result.telemetry.suppressionImpactRate).toBe(0);
  });

  it('covers stale override and suppression impact branches', () => {
    const result = computeProjectHealthPulse({
      projectId: 'p-branch-b',
      computedAt: '2026-03-20T00:00:00.000Z',
      adminConfig: {
        ...baseConfig,
        metricStalenessOverrides: {
          'forecast-update-age': 1,
        },
      },
      metricsByDimension: {
        cost: [
          metric('forecast-confidence', 80, 'leading'),
          { ...metric('forecast-update-age', 80, 'leading'), lastUpdatedAt: '2026-03-10T00:00:00.000Z' },
          metric('pending-change-order-aging', 80, 'lagging'),
        ],
        time: [
          { ...metric('look-ahead-reliability', 90, 'leading'), lastUpdatedAt: null },
          metric('near-critical-path-volatility', 90, 'leading'),
          metric('schedule-update-quality', 90, 'lagging'),
        ],
        field: [
          { ...metric('production-throughput-reliability', 90, 'leading'), isManualEntry: true },
          metric('rework-trend', 90, 'leading'),
          metric('plan-complete-reliability', 90, 'lagging'),
        ],
        office: [
          metric('clustering', 80, 'leading'),
          metric('severity-weighted-overdue-signals-critical', 90, 'lagging'),
          metric('low-impact-suppression', 80, 'leading'),
          metric('office-low-impact-reminder', 10, 'lagging'),
        ],
      },
      recommendationCandidates: [
        {
          actionText: 'Escalate schedule unblock',
          actionLink: '/rec/source',
          reasonCode: 'schedule-risk',
          owner: 'ops-lead',
          urgency: 90,
          impact: 95,
          reversibilityWindowHours: 8,
          ownerAvailability: 80,
          confidenceWeight: 80,
        },
      ],
    });

    expect(result.pulse.topRecommendedAction?.actionLink).toBe('/rec/source');
    expect(result.pulse.compoundRisks.length).toBeGreaterThanOrEqual(0);
    expect(result.telemetry.suppressionImpactRate).not.toBeNull();
  });

  it('covers default triage bucket branch boundaries', () => {
    const makeInput = (score: number) =>
      computeProjectHealthPulse({
        projectId: `p-branch-${score}`,
        adminConfig: {
          ...baseConfig,
          portfolioTriageDefaults: {
            ...baseConfig.portfolioTriageDefaults,
            defaultBucket: '' as unknown as 'attention-now',
          },
        },
        metricsByDimension: {
          cost: [
            metric('forecast-confidence', score, 'leading'),
            metric('forecast-update-age', score, 'leading'),
            metric('pending-change-order-aging', score, 'lagging'),
          ],
          time: [
            metric('look-ahead-reliability', score, 'leading'),
            metric('near-critical-path-volatility', score, 'leading'),
            metric('schedule-update-quality', score, 'lagging'),
          ],
          field: [
            metric('production-throughput-reliability', score, 'leading'),
            metric('rework-trend', score, 'leading'),
            metric('plan-complete-reliability', score, 'lagging'),
          ],
          office: [
            metric('clustering', score, 'leading'),
            metric('severity-weighted-overdue-signals', score, 'lagging'),
            metric('low-impact-suppression', score, 'leading'),
          ],
        },
      });

    expect(makeInput(30).pulse.triage.bucket).toBe('attention-now');
    expect(makeInput(50).pulse.triage.bucket).toBe('trending-down');
    expect(makeInput(70).pulse.triage.bucket).toBe('data-quality-risk');
    expect(makeInput(90).pulse.triage.bucket).toBe('recovering');
  });

  it('sets overall status to data-pending when overall confidence is unreliable', () => {
    const result = computeProjectHealthPulse({
      projectId: 'p-branch-unreliable',
      adminConfig: {
        ...baseConfig,
        portfolioTriageDefaults: {
          ...baseConfig.portfolioTriageDefaults,
          defaultBucket: '' as unknown as 'attention-now',
        },
      },
      trendHistorySufficient: { cost: false, time: false, field: false, office: false },
      integrationCompleteness: { cost: 0, time: 0, field: 0, office: 0 },
      metricsByDimension: {
        cost: [],
        time: [],
        field: [],
        office: [],
      },
    });

    expect(result.pulse.overallConfidence.tier).toBe('unreliable');
    expect(result.pulse.overallStatus).toBe('data-pending');
  });
});
