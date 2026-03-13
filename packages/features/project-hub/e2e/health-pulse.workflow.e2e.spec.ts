import { expect, test } from '@playwright/test';

import { computeProjectHealthPulse } from '../src/health-pulse/computors/index.js';
import {
  projectHealthPulseToNotificationPayloads,
  projectHealthPulseToTelemetryPayload,
} from '../src/health-pulse/integrations/index.js';
import {
  createMockHealthMetric,
  createMockHealthPulseAdminConfig,
  createMockProjectHealthPulse,
  mockProjectHealthStates,
} from '../testing/index.js';

test('health-pulse workflow: open detail tab with stale metric warning', async () => {
  const pulse = mockProjectHealthStates.atRiskLowConfidenceStaleExcluded;
  const office = pulse.dimensions.cost;
  const staleOrMissing = office.metrics.filter((metric) => metric.isStale || metric.value === null);
  expect(staleOrMissing.length).toBeGreaterThan(0);
  expect(office.hasExcludedMetrics).toBe(true);
});

test('health-pulse workflow: submit manual override with governance metadata', async () => {
  const metric = createMockHealthMetric({
    key: 'pending-change-order-aging',
    value: 48,
    isStale: false,
    isManualEntry: true,
    manualOverride: {
      reason: 'Manual update from validated field report',
      enteredBy: 'pm-1',
      enteredAt: '2026-03-12T00:00:00.000Z',
      requiresApproval: true,
      approvedBy: null,
      approvedAt: null,
    },
  });

  expect(metric.manualOverride?.reason).toContain('validated field report');
  expect(metric.manualOverride?.requiresApproval).toBe(true);
});

test('health-pulse workflow: recompute pulse and observe confidence reason change', async () => {
  const adminConfig = createMockHealthPulseAdminConfig();

  const baseline = computeProjectHealthPulse({
    projectId: 'workflow-recompute',
    adminConfig,
    computedAt: '2026-03-12T00:00:00.000Z',
    metricsByDimension: {
      cost: [createMockHealthMetric({ key: 'forecast-confidence', value: 90 })],
      time: [createMockHealthMetric({ key: 'look-ahead-reliability', value: 90 })],
      field: [createMockHealthMetric({ key: 'production-throughput-reliability', value: 90 })],
      office: [createMockHealthMetric({ key: 'clustering', value: 90 })],
    },
  });

  const degraded = computeProjectHealthPulse({
    projectId: 'workflow-recompute',
    adminConfig,
    computedAt: '2026-03-12T00:00:00.000Z',
    metricsByDimension: {
      cost: [createMockHealthMetric({ key: 'forecast-confidence', value: null, isStale: true })],
      time: [createMockHealthMetric({ key: 'look-ahead-reliability', value: 90 })],
      field: [createMockHealthMetric({ key: 'production-throughput-reliability', value: 90 })],
      office: [createMockHealthMetric({ key: 'clustering', value: 90 })],
    },
  });

  expect(degraded.pulse.overallConfidence.score).toBeLessThan(baseline.pulse.overallConfidence.score);
  expect(degraded.pulse.overallConfidence.reasons.join(' ').toLowerCase()).toContain('excluded');
});

test('health-pulse workflow: verify top action reason code and compound-risk warning projection', async () => {
  const pulse = mockProjectHealthStates.criticalCompoundRiskEscalation;
  const notifications = projectHealthPulseToNotificationPayloads({
    pulse,
    recipientUserId: 'workflow-user',
    projectName: 'Workflow Critical Project',
    actionUrl: '/projects/workflow-critical/health',
    includeTriagePriority: true,
  });

  expect(pulse.topRecommendedAction?.reasonCode).toBe('CRITICAL_COMPOUND_RISK');
  expect(notifications.some((item) => item.payload.eventType === 'project-health-pulse.compound-risk')).toBe(true);
});

test('health-pulse workflow: verify triage bucket movement in portfolio-oriented set', async () => {
  const portfolio = mockProjectHealthStates.portfolioMixedStatusTriageSet;
  const hasAttentionNow = portfolio.some((pulse) => pulse.triage.bucket === 'attention-now');
  const hasRecovering = portfolio.some((pulse) => pulse.triage.bucket === 'recovering');

  expect(hasAttentionNow).toBe(true);
  expect(hasRecovering).toBe(true);

  const telemetryPayload = projectHealthPulseToTelemetryPayload(
    createMockProjectHealthPulse(),
    {
      interventionLeadTime: 5,
      falseAlarmRate: 0.07,
      preLagDetectionRate: 0.65,
      actionAdoptionRate: 0.73,
      portfolioReviewCycleTime: 6,
      suppressionImpactRate: 0.31,
    }
  );

  expect(telemetryPayload.triageBucket).toBeDefined();
  expect(telemetryPayload.metrics.portfolioReviewCycleTime).toBe(6);
});
