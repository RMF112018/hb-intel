import { describe, expect, it } from 'vitest';

import {
  canEditHealthPulseMetric,
  canManageHealthPulseAdminConfig,
  canViewHealthPulseApproval,
  createProjectHealthPulseReferenceIntegrations,
  projectHealthPulseByComplexity,
  projectHealthPulseToBicItem,
  projectHealthPulseToCanvasTile,
  projectHealthPulseToNotificationPayloads,
  projectHealthPulseToTelemetryPayload,
  projectManualOverrideToVersionedProvenance,
  projectMetricFreshness,
  projectPolicyChangeLineage,
} from './index.js';
import { confidenceTierToNotificationTier } from './helpers.js';
import {
  createMockHealthPulseAdminConfig,
  createMockProjectHealthPulseSnapshot,
  createMockProjectHealthTelemetry,
} from '../../../testing/createMockProjectHealthPulseSnapshot.js';

describe('health pulse integrations', () => {
  it('maps deterministic BIC payload projection with stable item key', () => {
    const pulse = createMockProjectHealthPulseSnapshot();
    pulse.topRecommendedAction = {
      actionText: 'Escalate schedule variance',
      actionLink: '/projects/42/health',
      reasonCode: 'schedule-drift',
      owner: 'user-42',
      urgency: 80,
      impact: 90,
      confidenceWeight: 0.8,
    };

    const projection = projectHealthPulseToBicItem({
      pulse,
      projectName: 'Project Atlas',
      href: '/projects/42',
    });

    expect(projection.item.moduleKey).toBe('project-health-pulse');
    expect(projection.item.itemKey).toBe('project-health-pulse::project-sf21-fixture');
    expect(projection.item.state.currentOwner?.userId).toBe('user-42');
  });

  it('maps notification payloads for status, compound risk, confidence degradation, and triage', () => {
    const pulse = createMockProjectHealthPulseSnapshot();
    pulse.overallStatus = 'critical';
    pulse.overallConfidence.tier = 'unreliable';
    pulse.overallConfidence.reasons = ['missing-required-signals'];
    pulse.compoundRisks = [
      {
        code: 'time-field-deterioration',
        severity: 'high',
        affectedDimensions: ['time', 'field'],
        summary: 'Time and field indicators are deteriorating together.',
      },
    ];
    pulse.triage.bucket = 'attention-now';

    const payloads = projectHealthPulseToNotificationPayloads({
      pulse,
      recipientUserId: 'recipient-1',
      projectName: 'Project Atlas',
      actionUrl: '/projects/42/health',
      includeTriagePriority: true,
    });

    expect(payloads.some((item) => item.payload.eventType === 'project-health-pulse.status-escalation')).toBe(true);
    expect(payloads.some((item) => item.payload.eventType === 'project-health-pulse.compound-risk')).toBe(true);
    expect(payloads.some((item) => item.payload.eventType === 'project-health-pulse.confidence-degradation')).toBe(
      true
    );
    expect(payloads.some((item) => item.payload.eventType === 'project-health-pulse.triage-priority')).toBe(true);
    expect(payloads.every((item) => item.payload.sourceModule === 'project-health-pulse')).toBe(true);
  });

  it('maps low-severity and low-confidence notification tiers deterministically', () => {
    const pulse = createMockProjectHealthPulseSnapshot();
    pulse.overallStatus = 'at-risk';
    pulse.overallConfidence.tier = 'low';
    pulse.compoundRisks = [
      {
        code: 'custom',
        severity: 'low',
        affectedDimensions: ['office'],
        summary: 'Low severity signal.',
      },
    ];

    const payloads = projectHealthPulseToNotificationPayloads({
      pulse,
      recipientUserId: 'recipient-low',
      projectName: 'Project Low Severity',
      actionUrl: '/projects/low/health',
      includeTriagePriority: false,
    });

    expect(payloads.find((item) => item.payload.eventType === 'project-health-pulse.compound-risk')?.tier).toBe(
      'digest'
    );
    expect(payloads.find((item) => item.payload.eventType === 'project-health-pulse.confidence-degradation')?.tier).toBe(
      'watch'
    );
  });

  it('covers critical severity, empty-reason fallbacks, and helper default tier mapping', () => {
    const pulse = createMockProjectHealthPulseSnapshot();
    pulse.overallStatus = 'at-risk';
    pulse.overallConfidence.tier = 'low';
    pulse.overallConfidence.reasons = [];
    pulse.compoundRisks = [
      {
        code: 'custom',
        severity: 'critical',
        affectedDimensions: ['cost', 'time'],
        summary: 'Critical severity signal.',
      },
    ];
    pulse.triage.bucket = 'attention-now';
    pulse.triage.triageReasons = [];

    const payloads = projectHealthPulseToNotificationPayloads({
      pulse,
      recipientUserId: 'recipient-critical',
      projectName: 'Project Critical',
      actionUrl: '/projects/critical/health',
      includeTriagePriority: true,
    });

    expect(payloads.find((item) => item.payload.eventType === 'project-health-pulse.compound-risk')?.tier).toBe(
      'immediate'
    );
    expect(
      payloads.find((item) => item.payload.eventType === 'project-health-pulse.confidence-degradation')?.payload.body
    ).toContain('Confidence quality degraded.');
    expect(payloads.find((item) => item.payload.eventType === 'project-health-pulse.triage-priority')?.tier).toBe(
      'watch'
    );
    expect(confidenceTierToNotificationTier('high')).toBe('digest');
  });

  it('enforces deny-by-default auth gates', () => {
    expect(
      canEditHealthPulseMetric({
        auth: { canWriteProjectHealth: false, canApproveOverrides: false, isAdmin: false },
        metricKey: 'k1',
        editableMetricKeys: ['k1'],
      })
    ).toBe(false);

    expect(
      canViewHealthPulseApproval({
        auth: { canWriteProjectHealth: true, canApproveOverrides: false, isAdmin: false },
        requiresApproval: true,
      })
    ).toBe(false);

    expect(
      canManageHealthPulseAdminConfig({ canWriteProjectHealth: true, canApproveOverrides: false, isAdmin: true })
    ).toBe(true);

    expect(
      canEditHealthPulseMetric({
        auth: { canWriteProjectHealth: true, canApproveOverrides: false, isAdmin: false },
        metricKey: 'k1',
      })
    ).toBe(false);

    expect(
      canEditHealthPulseMetric({
        auth: { canWriteProjectHealth: true, canApproveOverrides: false, isAdmin: false },
        metricKey: 'k1',
        editableMetricKeys: ['k1'],
      })
    ).toBe(true);

    expect(
      canViewHealthPulseApproval({
        auth: { canWriteProjectHealth: true, canApproveOverrides: false, isAdmin: false },
        requiresApproval: false,
      })
    ).toBe(false);

    expect(
      canViewHealthPulseApproval({
        auth: { canWriteProjectHealth: true, canApproveOverrides: true, isAdmin: false },
        requiresApproval: true,
      })
    ).toBe(true);
  });

  it('projects complexity disclosure depth without changing pulse semantics', () => {
    const pulse = createMockProjectHealthPulseSnapshot();
    pulse.compoundRisks = [
      {
        code: 'cost-time-correlation',
        severity: 'low',
        affectedDimensions: ['cost', 'time'],
        summary: 'Low risk',
      },
      {
        code: 'office-field-amplification',
        severity: 'critical',
        affectedDimensions: ['office', 'field'],
        summary: 'Critical risk',
      },
    ];

    const essential = projectHealthPulseByComplexity(pulse, 'essential');
    const standard = projectHealthPulseByComplexity(pulse, 'standard');
    const expert = projectHealthPulseByComplexity(pulse, 'expert');

    expect(essential.showDiagnosticBreakdown).toBe(false);
    expect(standard.showDetailPanels).toBe(true);
    expect(standard.showDiagnosticBreakdown).toBe(false);
    expect(expert.showDiagnosticBreakdown).toBe(true);
    expect(essential.visibleCompoundRisks).toHaveLength(1);
    expect(expert.visibleCompoundRisks).toHaveLength(2);
  });

  it('projects project canvas tile and drill-in metadata deterministically', () => {
    const pulse = createMockProjectHealthPulseSnapshot();
    pulse.topRecommendedAction = {
      actionText: 'Tighten closeout tracking',
      actionLink: null,
      reasonCode: 'office-backlog',
      owner: null,
      urgency: 70,
      impact: 60,
      confidenceWeight: 0.7,
    };

    const tile = projectHealthPulseToCanvasTile({
      pulse,
      placement: { colStart: 4 },
    });

    expect(tile.tileId).toBe('project-health-pulse-tile::project-sf21-fixture');
    expect(tile.placement.colStart).toBe(4);
    expect(tile.context.recommendationReasonCode).toBe('office-backlog');

    const withoutAction = projectHealthPulseToCanvasTile({
      pulse: { ...pulse, topRecommendedAction: null },
    });
    expect(withoutAction.context.recommendationReasonCode).toBeNull();
  });

  it('projects versioned provenance and policy lineage using deterministic records', () => {
    const pulse = createMockProjectHealthPulseSnapshot();
    const metric = {
      key: 'forecast-confidence',
      value: 55,
      isStale: false,
      isManualEntry: true,
      weight: 'leading' as const,
      label: 'Forecast confidence',
      lastUpdatedAt: '2026-03-12T00:00:00.000Z',
      manualOverride: {
        reason: 'Manual review due to source outage',
        enteredBy: 'pm-1',
        enteredAt: '2026-03-12T00:00:00.000Z',
      },
    };

    const provenance = projectManualOverrideToVersionedProvenance(pulse, metric, 'manual-source-outage');
    expect(provenance?.metadata.snapshotId).toContain('project-health-pulse-override::project-sf21-fixture');
    expect(provenance?.reasonCode).toBe('manual-source-outage');
    expect(provenance?.metadata.tag).toBe('submitted');

    const prev = createMockHealthPulseAdminConfig();
    const next = createMockHealthPulseAdminConfig();
    next.weights.field = 0.1;
    next.stalenessThresholdDays = prev.stalenessThresholdDays + 1;
    next.metricStalenessOverrides['x'] = 1;
    next.manualEntryGovernance.maxOverrideAgeDays = prev.manualEntryGovernance.maxOverrideAgeDays + 1;
    next.officeHealthSuppression.duplicateClusterWindowHours =
      prev.officeHealthSuppression.duplicateClusterWindowHours + 1;
    next.portfolioTriageDefaults.defaultSort = 'compound-risk-severity';
    const lineage = projectPolicyChangeLineage('project-sf21-fixture', prev, next, '2026-03-12T00:00:00.000Z');
    expect(lineage.changedPaths).toContain('stalenessThresholdDays');
    expect(lineage.changedPaths).toContain('weights');
    expect(lineage.changedPaths).toContain('metricStalenessOverrides');
    expect(lineage.changedPaths).toContain('manualEntryGovernance');
    expect(lineage.changedPaths).toContain('officeHealthSuppression');
    expect(lineage.changedPaths).toContain('portfolioTriageDefaults');

    const approvedMetric = {
      ...metric,
      manualOverride: {
        ...metric.manualOverride,
        approvedAt: '2026-03-12T01:00:00.000Z',
      },
    };
    const approved = projectManualOverrideToVersionedProvenance(pulse, approvedMetric, 'manual-approved');
    expect(approved?.metadata.tag).toBe('approved');

    const withoutOverride = projectManualOverrideToVersionedProvenance(
      pulse,
      { ...metric, manualOverride: null },
      'none'
    );
    expect(withoutOverride).toBeNull();
  });

  it('maps manual-entry freshness and telemetry payload context', () => {
    const freshness = projectMetricFreshness(
      {
        key: 'metric-a',
        label: 'Metric A',
        value: 10,
        isStale: false,
        isManualEntry: true,
        lastUpdatedAt: '2026-03-10T00:00:00.000Z',
        weight: 'leading',
        manualOverride: null,
      },
      14,
      '2026-03-12T00:00:00.000Z'
    );

    expect(freshness.source).toBe('manual-entry');
    expect(freshness.freshness).toBe('fresh');

    const staleFreshness = projectMetricFreshness(
      {
        key: 'metric-stale',
        label: 'Metric stale',
        value: 10,
        isStale: false,
        isManualEntry: false,
        lastUpdatedAt: '2026-01-01T00:00:00.000Z',
        weight: 'lagging',
        manualOverride: null,
      },
      14,
      '2026-03-12T00:00:00.000Z'
    );
    expect(staleFreshness.freshness).toBe('stale');

    const missingFreshness = projectMetricFreshness(
      {
        key: 'metric-missing',
        label: 'Metric missing',
        value: null,
        isStale: false,
        isManualEntry: false,
        lastUpdatedAt: null,
        weight: 'lagging',
        manualOverride: null,
      },
      14,
      '2026-03-12T00:00:00.000Z'
    );
    expect(missingFreshness.freshness).toBe('missing');
    expect(missingFreshness.source).toBe('unknown');

    const unknownAgeFreshness = projectMetricFreshness(
      {
        key: 'metric-unknown-age',
        label: 'Metric unknown age',
        value: 10,
        isStale: false,
        isManualEntry: false,
        lastUpdatedAt: null,
        weight: 'lagging',
        manualOverride: null,
      },
      14,
      '2026-03-12T00:00:00.000Z'
    );
    expect(unknownAgeFreshness.ageDays).toBeNull();

    const pulse = createMockProjectHealthPulseSnapshot();
    const telemetry = createMockProjectHealthTelemetry();
    const payload = projectHealthPulseToTelemetryPayload(pulse, telemetry);
    expect(payload.eventType).toBe('project-health-pulse.snapshot');
    expect(payload.overallConfidenceTier).toBe(pulse.overallConfidence.tier);
    expect(payload.topActionReasonCode).toBeNull();
  });

  it('provides a bundled reference integration factory', () => {
    const integrations = createProjectHealthPulseReferenceIntegrations();
    expect(typeof integrations.projectNotifications).toBe('function');
    expect(typeof integrations.projectTelemetry).toBe('function');
    expect(typeof integrations.projectByComplexity).toBe('function');
  });

  it('returns no notifications for healthy high-confidence pulses without risks', () => {
    const pulse = createMockProjectHealthPulseSnapshot();
    pulse.overallStatus = 'on-track';
    pulse.overallConfidence.tier = 'high';
    pulse.compoundRisks = [];
    pulse.triage.bucket = 'recovering';

    const payloads = projectHealthPulseToNotificationPayloads({
      pulse,
      recipientUserId: 'recipient-2',
      projectName: 'Project Low Risk',
      actionUrl: '/projects/99/health',
      includeTriagePriority: true,
    });

    expect(payloads).toEqual([]);
  });

  it('covers BIC fallback owner and upcoming urgency branches', () => {
    const pulse = createMockProjectHealthPulseSnapshot();
    pulse.overallStatus = 'on-track';
    pulse.topRecommendedAction = null;

    const noOwnerProjection = projectHealthPulseToBicItem({
      pulse,
      projectName: 'Project No Owner',
      href: '/projects/no-owner',
    });
    expect(noOwnerProjection.item.state.currentOwner).toBeNull();
    expect(noOwnerProjection.item.state.urgencyTier).toBe('upcoming');

    pulse.topRecommendedAction = {
      actionText: 'Action',
      actionLink: null,
      reasonCode: 'rc',
      owner: 'owner-key',
      urgency: 20,
      impact: 20,
      confidenceWeight: 0.2,
    };

    const withDirectoryOwner = projectHealthPulseToBicItem({
      pulse,
      projectName: 'Project Owner',
      href: '/projects/owner',
      ownerDirectory: {
        'owner-key': { userId: 'uid-1', displayName: 'Owner One', role: 'PM' },
      },
    });
    expect(withDirectoryOwner.item.state.currentOwner?.displayName).toBe('Owner One');

    pulse.overallStatus = 'at-risk';
    pulse.compoundRisks = [
      {
        code: 'office-field-amplification',
        severity: 'high',
        affectedDimensions: ['office', 'field'],
        summary: 'Office risk summary',
      },
    ];
    const blocked = projectHealthPulseToBicItem({
      pulse,
      projectName: 'Project Risk',
      href: '/projects/risk',
    });
    expect(blocked.item.state.urgencyTier).toBe('immediate');
    expect(blocked.item.state.blockedReason).toBe('Office risk summary');
  });

  it('maps telemetry top-action reason and missing manual-entry source branch', () => {
    const pulse = createMockProjectHealthPulseSnapshot();
    pulse.topRecommendedAction = {
      actionText: 'Top action',
      actionLink: null,
      reasonCode: 'reason-1',
      owner: null,
      urgency: 1,
      impact: 1,
      confidenceWeight: 0.5,
    };

    const telemetry = createMockProjectHealthTelemetry();
    const payload = projectHealthPulseToTelemetryPayload(pulse, telemetry);
    expect(payload.topActionReasonCode).toBe('reason-1');

    const missingManual = projectMetricFreshness(
      {
        key: 'metric-missing-manual',
        label: 'Missing manual',
        value: null,
        isStale: false,
        isManualEntry: true,
        lastUpdatedAt: null,
        weight: 'leading',
        manualOverride: null,
      },
      14,
      '2026-03-12T00:00:00.000Z'
    );
    expect(missingManual.source).toBe('manual-entry');
  });
});
