import { describe, expect, it } from 'vitest';

import { computeProjectHealthPulse } from '../computors/index.js';
import { projectHealthPulseToTelemetryPayload } from '../integrations/index.js';
import { createMockHealthMetric, createMockHealthPulseAdminConfig } from '../../../testing/index.js';

describe('health pulse telemetry verification', () => {
  it('maps all telemetry KPI fields with confidence and reason context', () => {
    const adminConfig = createMockHealthPulseAdminConfig();

    const result = computeProjectHealthPulse({
      projectId: 'telemetry-project',
      adminConfig,
      computedAt: '2026-03-12T00:00:00.000Z',
      metricsByDimension: {
        cost: [
          createMockHealthMetric({ key: 'forecast-confidence', value: 70 }),
          createMockHealthMetric({ key: 'forecast-update-age', value: 72, weight: 'lagging' }),
          createMockHealthMetric({ key: 'pending-change-order-aging', value: 65, weight: 'lagging' }),
        ],
        time: [
          createMockHealthMetric({ key: 'look-ahead-reliability', value: 68 }),
          createMockHealthMetric({ key: 'near-critical-path-volatility', value: 62, weight: 'lagging' }),
          createMockHealthMetric({ key: 'schedule-update-quality', value: 64, weight: 'lagging' }),
        ],
        field: [
          createMockHealthMetric({ key: 'production-throughput-reliability', value: 66 }),
          createMockHealthMetric({ key: 'rework-trend', value: 61, weight: 'lagging' }),
          createMockHealthMetric({ key: 'plan-complete-reliability', value: 63, weight: 'lagging' }),
        ],
        office: [
          createMockHealthMetric({ key: 'clustering', value: 67 }),
          createMockHealthMetric({ key: 'severity-weighted-overdue-signals', value: 58, weight: 'lagging' }),
          createMockHealthMetric({ key: 'low-impact-suppression', value: 54, weight: 'lagging' }),
        ],
      },
      recommendationCandidates: [
        {
          actionText: 'Reduce office backlog',
          actionLink: '/projects/telemetry-project/health',
          reasonCode: 'OFFICE_BACKLOG',
          owner: 'Ops',
          urgency: 80,
          impact: 70,
          reversibilityWindow: 3,
          ownerAvailability: 0.8,
          confidenceWeight: 0.6,
        },
      ],
    });

    const payload = projectHealthPulseToTelemetryPayload(result.pulse, result.telemetry);
    expect(payload.eventType).toBe('project-health-pulse.snapshot');
    expect(payload.projectId).toBe('telemetry-project');
    expect(payload.overallConfidenceTier).toBe(result.pulse.overallConfidence.tier);
    expect(payload.confidenceReasons).toEqual(result.pulse.overallConfidence.reasons);
    expect(payload.topActionReasonCode).toBe(result.pulse.topRecommendedAction?.reasonCode ?? null);

    expect(payload.metrics.interventionLeadTime === null || typeof payload.metrics.interventionLeadTime === 'number').toBe(true);
    expect(payload.metrics.falseAlarmRate === null || typeof payload.metrics.falseAlarmRate === 'number').toBe(true);
    expect(payload.metrics.preLagDetectionRate === null || typeof payload.metrics.preLagDetectionRate === 'number').toBe(true);
    expect(payload.metrics.actionAdoptionRate === null || typeof payload.metrics.actionAdoptionRate === 'number').toBe(true);
    expect(payload.metrics.portfolioReviewCycleTime === null || typeof payload.metrics.portfolioReviewCycleTime === 'number').toBe(true);
    expect(payload.metrics.suppressionImpactRate === null || typeof payload.metrics.suppressionImpactRate === 'number').toBe(true);
  });
});
