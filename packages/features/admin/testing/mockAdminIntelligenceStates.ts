import { createMockAdminAlert } from './createMockAdminAlert.js';
import { createMockProbeResult, createMockProbeSnapshot } from './createMockProbeSnapshot.js';
import { createMockApprovalAuthorityRule } from './createMockApprovalAuthorityRule.js';

/**
 * Pre-built state presets for Admin Intelligence testing scenarios.
 */
export const mockAdminIntelligenceStates = {
  /** Empty state — no alerts, snapshots, or rules */
  empty: {
    alerts: [],
    snapshots: [],
    rules: [],
  },

  /** Healthy state — all probes green, no critical alerts */
  healthy: {
    alerts: [createMockAdminAlert({ severity: 'low', title: 'Routine check passed' })],
    snapshots: [
      createMockProbeSnapshot({
        results: [
          createMockProbeResult({ probeKey: 'sharepoint-infrastructure', status: 'healthy' }),
          createMockProbeResult({ probeId: 'probe-002', probeKey: 'azure-functions', status: 'healthy' }),
        ],
      }),
    ],
    rules: [createMockApprovalAuthorityRule()],
  },

  /** Degraded state — some probes unhealthy, warning alerts present */
  degraded: {
    alerts: [
      createMockAdminAlert({ severity: 'high', title: 'SharePoint latency elevated', category: 'stuck-workflow' }),
      createMockAdminAlert({ alertId: 'alert-002', severity: 'critical', title: 'Search index stale', category: 'stale-record' }),
    ],
    snapshots: [
      createMockProbeSnapshot({
        results: [
          createMockProbeResult({ probeKey: 'sharepoint-infrastructure', status: 'degraded', summary: 'Elevated latency' }),
          createMockProbeResult({ probeId: 'probe-002', probeKey: 'azure-search', status: 'error', summary: 'Index stale', anomalies: ['Index age > 24h'] }),
        ],
      }),
    ],
    rules: [createMockApprovalAuthorityRule()],
  },

  /** Approval rule with `any` mode — 2 users, 1 group */
  approvalRuleAny: {
    alerts: [],
    snapshots: [],
    rules: [
      createMockApprovalAuthorityRule({
        ruleId: 'rule-any-001',
        approvalMode: 'any',
        approverUserIds: ['user-001', 'user-002'],
        approverGroupIds: ['group-001'],
      }),
    ],
  },

  /** Approval rule with `all` mode — all approvers required */
  approvalRuleAll: {
    alerts: [],
    snapshots: [],
    rules: [
      createMockApprovalAuthorityRule({
        ruleId: 'rule-all-001',
        approvalMode: 'all',
        approverUserIds: ['user-001', 'user-002'],
        approverGroupIds: ['group-001'],
      }),
    ],
  },

  /** Mixed severity with acknowledged alerts and degraded probes */
  mixedSeverityAcknowledged: {
    alerts: [
      createMockAdminAlert({
        alertId: 'alert-crit-ack',
        severity: 'critical',
        title: 'Critical provisioning failure',
        category: 'provisioning-failure',
        acknowledgedAt: '2026-03-11T01:00:00Z',
        acknowledgedBy: 'admin-001',
      }),
      createMockAdminAlert({
        alertId: 'alert-high',
        severity: 'high',
        title: 'Permission anomaly detected',
        category: 'permission-anomaly',
      }),
      createMockAdminAlert({
        alertId: 'alert-med-ack',
        severity: 'medium',
        title: 'Overdue provisioning task',
        category: 'overdue-provisioning-task',
        acknowledgedAt: '2026-03-11T02:00:00Z',
        acknowledgedBy: 'admin-002',
      }),
      createMockAdminAlert({
        alertId: 'alert-low',
        severity: 'low',
        title: 'Stale record detected',
        category: 'stale-record',
      }),
    ],
    snapshots: [
      createMockProbeSnapshot({
        results: [
          createMockProbeResult({ probeKey: 'sharepoint-infrastructure', status: 'degraded', summary: 'Elevated latency' }),
          createMockProbeResult({ probeId: 'probe-002', probeKey: 'azure-functions', status: 'degraded', summary: 'Cold start delays' }),
          createMockProbeResult({ probeId: 'probe-003', probeKey: 'azure-search', status: 'healthy', summary: 'Index current' }),
          createMockProbeResult({ probeId: 'probe-004', probeKey: 'notification-system', status: 'healthy', summary: 'Operational' }),
          createMockProbeResult({ probeId: 'probe-005', probeKey: 'module-record-health', status: 'healthy', summary: 'All records valid' }),
        ],
      }),
    ],
    rules: [createMockApprovalAuthorityRule()],
  },
} as const;
