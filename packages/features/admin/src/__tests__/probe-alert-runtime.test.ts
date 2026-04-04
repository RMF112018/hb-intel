/**
 * Phase 12 — Probe and Alert Runtime Productionization Tests
 *
 * Tests covering:
 * - overdueProvisioningMonitor (real implementation)
 * - probe-to-alert bridge (generateProbeHealthAlerts)
 * - deferred stub behavior (explicit non-goals)
 * - monitor registry integration with new monitors
 */

import { describe, expect, it } from 'vitest';
import type { IAdminAlert } from '../types/IAdminAlert.js';
import type { IProvisioningDataProvider } from '../types/IProvisioningDataProvider.js';
import type { IProjectSetupRequest, IProvisioningStatus } from '@hbc/models';
import type { IProbeSnapshot } from '../types/IProbeSnapshot.js';
import { createOverdueProvisioningMonitor, overdueProvisioningMonitor } from '../monitors/overdueProvisioningMonitor.js';
import { generateProbeHealthAlerts } from '../monitors/probeHealthAlertBridge.js';
import { permissionAnomalyMonitor } from '../monitors/permissionAnomalyMonitor.js';
import { upcomingExpirationMonitor } from '../monitors/upcomingExpirationMonitor.js';
import { staleRecordMonitor } from '../monitors/staleRecordMonitor.js';
import { searchProbe } from '../probes/searchProbe.js';
import { notificationProbe } from '../probes/notificationProbe.js';
import { moduleRecordHealthProbe } from '../probes/moduleRecordHealthProbe.js';
import { createDefaultMonitorRegistry } from '../monitors/index.js';

// ─── Test Helpers ───────────────────────────────────────────────────────────────

const NOW = '2026-04-04T12:00:00.000Z';

function createMockProvider(
  requests: Partial<IProjectSetupRequest>[] = [],
  runs: Partial<IProvisioningStatus>[] = [],
): IProvisioningDataProvider {
  return {
    listRequests: async () => requests.map(r => ({
      requestId: r.requestId ?? 'req-001',
      projectId: r.projectId ?? 'proj-001',
      projectName: r.projectName ?? 'Test Project',
      submittedAt: r.submittedAt ?? '2026-04-04T08:00:00.000Z',
      ...r,
    } as IProjectSetupRequest)),
    listProvisioningRuns: async () => runs.map(r => ({
      projectId: r.projectId ?? 'proj-001',
      projectNumber: '26-001-01',
      projectName: r.projectName ?? 'Test Project',
      correlationId: r.correlationId ?? 'corr-001',
      overallStatus: r.overallStatus ?? 'InProgress',
      currentStep: r.currentStep ?? 3,
      steps: [],
      triggeredBy: 'admin@hb.com',
      startedAt: r.startedAt ?? '2026-04-04T08:00:00.000Z',
      ...r,
    } as IProvisioningStatus)),
  };
}

// ─── overdueProvisioningMonitor Tests ───────────────────────────────────────────

describe('createOverdueProvisioningMonitor', () => {
  it('returns empty when no requests are overdue', async () => {
    const provider = createMockProvider([{
      submittedAt: '2026-04-04T11:30:00.000Z', // 30 min ago — under threshold
    }]);
    const monitor = createOverdueProvisioningMonitor(provider);
    const alerts = await monitor.run(NOW);
    expect(alerts).toHaveLength(0);
  });

  it('detects submitted requests older than 1 hour', async () => {
    const provider = createMockProvider([{
      projectId: 'proj-overdue',
      projectName: 'Overdue Project',
      submittedAt: '2026-04-04T09:00:00.000Z', // 3h ago
    }]);
    const monitor = createOverdueProvisioningMonitor(provider);
    const alerts = await monitor.run(NOW);

    expect(alerts).toHaveLength(1);
    expect(alerts[0].category).toBe('overdue-provisioning-task');
    expect(alerts[0].affectedEntityId).toBe('proj-overdue');
    expect(alerts[0].severity).toBe('medium');
  });

  it('escalates to high severity after 4 hours', async () => {
    const provider = createMockProvider([{
      submittedAt: '2026-04-04T06:00:00.000Z', // 6h ago
    }]);
    const monitor = createOverdueProvisioningMonitor(provider);
    const alerts = await monitor.run(NOW);

    expect(alerts).toHaveLength(1);
    expect(alerts[0].severity).toBe('high');
  });

  it('generates CTA with projectId', async () => {
    const provider = createMockProvider([{
      projectId: 'proj-xyz',
      submittedAt: '2026-04-04T09:00:00.000Z',
    }]);
    const monitor = createOverdueProvisioningMonitor(provider);
    const alerts = await monitor.run(NOW);

    expect(alerts[0].ctaHref).toContain('proj-xyz');
  });

  it('deduplicates by entity type and ID', () => {
    const monitor = createOverdueProvisioningMonitor(createMockProvider());
    const alert: IAdminAlert = {
      alertId: 'a1',
      category: 'overdue-provisioning-task',
      severity: 'medium',
      title: 'test',
      description: 'test',
      affectedEntityType: 'record',
      affectedEntityId: 'proj-001',
      occurredAt: NOW,
    };
    expect(monitor.dedupeKey(alert)).toBe('overdue-provisioning-task:record:proj-001');
  });
});

describe('overdueProvisioningMonitor stub', () => {
  it('returns empty array', async () => {
    const alerts = await overdueProvisioningMonitor.run(NOW);
    expect(alerts).toHaveLength(0);
  });
});

// ─── Probe Health Alert Bridge Tests ────────────────────────────────────────────

describe('generateProbeHealthAlerts', () => {
  it('returns empty for all-healthy snapshot', () => {
    const snapshot: IProbeSnapshot = {
      snapshotId: 'snap-1',
      capturedAt: NOW,
      results: [
        {
          probeId: 'p1', probeKey: 'azure-functions',
          status: 'healthy', summary: 'ok',
          observedAt: NOW, metrics: {}, anomalies: [],
        },
      ],
    };
    const alerts = generateProbeHealthAlerts(snapshot, NOW);
    expect(alerts).toHaveLength(0);
  });

  it('generates alert for degraded probe', () => {
    const snapshot: IProbeSnapshot = {
      snapshotId: 'snap-1',
      capturedAt: NOW,
      results: [
        {
          probeId: 'p1', probeKey: 'sharepoint-infrastructure',
          status: 'degraded', summary: 'High latency',
          observedAt: NOW, metrics: { responseTimeMs: 5000 },
          anomalies: ['Response time > 3000ms'],
        },
      ],
    };
    const alerts = generateProbeHealthAlerts(snapshot, NOW);

    expect(alerts).toHaveLength(1);
    expect(alerts[0].severity).toBe('high');
    expect(alerts[0].affectedEntityType).toBe('system');
    expect(alerts[0].affectedEntityId).toBe('sharepoint-infrastructure');
    expect(alerts[0].description).toContain('Response time > 3000ms');
  });

  it('generates critical alert for error probe', () => {
    const snapshot: IProbeSnapshot = {
      snapshotId: 'snap-1',
      capturedAt: NOW,
      results: [
        {
          probeId: 'p1', probeKey: 'azure-functions',
          status: 'error', summary: 'Unreachable',
          observedAt: NOW, metrics: {}, anomalies: [],
        },
      ],
    };
    const alerts = generateProbeHealthAlerts(snapshot, NOW);

    expect(alerts).toHaveLength(1);
    expect(alerts[0].severity).toBe('critical');
  });

  it('skips unknown status probes', () => {
    const snapshot: IProbeSnapshot = {
      snapshotId: 'snap-1',
      capturedAt: NOW,
      results: [
        {
          probeId: 'p1', probeKey: 'azure-search',
          status: 'unknown', summary: 'Deferred',
          observedAt: NOW, metrics: {}, anomalies: [],
        },
      ],
    };
    const alerts = generateProbeHealthAlerts(snapshot, NOW);
    expect(alerts).toHaveLength(0);
  });

  it('generates multiple alerts for multiple unhealthy probes', () => {
    const snapshot: IProbeSnapshot = {
      snapshotId: 'snap-1',
      capturedAt: NOW,
      results: [
        {
          probeId: 'p1', probeKey: 'azure-functions',
          status: 'error', summary: 'Down',
          observedAt: NOW, metrics: {}, anomalies: [],
        },
        {
          probeId: 'p2', probeKey: 'sharepoint-infrastructure',
          status: 'degraded', summary: 'Slow',
          observedAt: NOW, metrics: {}, anomalies: [],
        },
        {
          probeId: 'p3', probeKey: 'azure-search',
          status: 'healthy', summary: 'OK',
          observedAt: NOW, metrics: {}, anomalies: [],
        },
      ],
    };
    const alerts = generateProbeHealthAlerts(snapshot, NOW);
    expect(alerts).toHaveLength(2);
  });
});

// ─── Deferred Stub Non-Goal Tests ───────────────────────────────────────────────

describe('Deferred monitors (explicit non-goals)', () => {
  it('permissionAnomalyMonitor returns empty', async () => {
    expect(await permissionAnomalyMonitor.run(NOW)).toHaveLength(0);
  });

  it('upcomingExpirationMonitor returns empty', async () => {
    expect(await upcomingExpirationMonitor.run(NOW)).toHaveLength(0);
  });

  it('staleRecordMonitor returns empty', async () => {
    expect(await staleRecordMonitor.run(NOW)).toHaveLength(0);
  });
});

describe('Deferred probes (explicit non-goals)', () => {
  it('searchProbe returns unknown status', async () => {
    const result = await searchProbe.run(NOW);
    expect(result.status).toBe('unknown');
    expect(result.summary).toContain('deferred');
  });

  it('notificationProbe returns unknown status', async () => {
    const result = await notificationProbe.run(NOW);
    expect(result.status).toBe('unknown');
    expect(result.summary).toContain('deferred');
  });

  it('moduleRecordHealthProbe returns unknown status', async () => {
    const result = await moduleRecordHealthProbe.run(NOW);
    expect(result.status).toBe('unknown');
    expect(result.summary).toContain('deferred');
  });
});

// ─── Monitor Registry Integration ───────────────────────────────────────────────

describe('createDefaultMonitorRegistry with provider', () => {
  it('wires 3 real monitors when provider is supplied', async () => {
    const provider = createMockProvider([], []);
    const registry = createDefaultMonitorRegistry(provider);
    const monitors = registry.getAll();

    expect(monitors).toHaveLength(6);

    // Run all monitors — real ones with empty data, stubs return empty
    const alerts = await registry.runAll(NOW);
    expect(alerts).toHaveLength(0); // no data = no alerts
  });

  it('detects overdue requests through the registry', async () => {
    const provider = createMockProvider([{
      projectId: 'proj-overdue',
      submittedAt: '2026-04-04T06:00:00.000Z', // 6h ago
    }], []);
    const registry = createDefaultMonitorRegistry(provider);
    const alerts = await registry.runAll(NOW);

    expect(alerts.length).toBeGreaterThanOrEqual(1);
    expect(alerts.some(a => a.category === 'overdue-provisioning-task')).toBe(true);
  });
});
