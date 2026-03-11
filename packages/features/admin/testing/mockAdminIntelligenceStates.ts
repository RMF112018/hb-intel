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
} as const;
