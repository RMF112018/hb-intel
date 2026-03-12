import { describe, it, expect } from 'vitest';
import { MonitorRegistry } from '../monitors/monitorRegistry.js';
import { provisioningFailureMonitor } from '../monitors/provisioningFailureMonitor.js';
import { permissionAnomalyMonitor } from '../monitors/permissionAnomalyMonitor.js';
import { stuckWorkflowMonitor } from '../monitors/stuckWorkflowMonitor.js';
import { overdueProvisioningMonitor } from '../monitors/overdueProvisioningMonitor.js';
import { upcomingExpirationMonitor } from '../monitors/upcomingExpirationMonitor.js';
import { staleRecordMonitor } from '../monitors/staleRecordMonitor.js';
import { createDefaultMonitorRegistry } from '../monitors/index.js';
import { routeAlert } from '../monitors/notificationRouter.js';
import type { IAdminAlert } from '../types/IAdminAlert.js';

function makeAlert(
  overrides: Partial<IAdminAlert> = {},
): IAdminAlert {
  return {
    alertId: 'a-1',
    category: 'provisioning-failure',
    severity: 'critical',
    title: 'Test alert',
    description: 'desc',
    affectedEntityType: 'record',
    affectedEntityId: 'e-1',
    occurredAt: '2026-03-11T00:00:00Z',
    ...overrides,
  };
}

describe('MonitorRegistry', () => {
  it('rejects duplicate keys', () => {
    const registry = new MonitorRegistry();
    registry.register(provisioningFailureMonitor);
    expect(() => registry.register(provisioningFailureMonitor)).toThrow(
      'duplicate key "provisioning-failure"',
    );
  });

  it('returns monitors in deterministic insertion order via getAll()', () => {
    const registry = new MonitorRegistry();
    registry.register(staleRecordMonitor);
    registry.register(provisioningFailureMonitor);
    registry.register(permissionAnomalyMonitor);

    const keys = registry.getAll().map((m) => m.key);
    expect(keys).toEqual([
      'stale-record',
      'provisioning-failure',
      'permission-anomaly',
    ]);
  });

  it('runAll flattens results from all monitors', async () => {
    const registry = new MonitorRegistry();

    const mockMonitor = {
      key: 'provisioning-failure' as const,
      defaultSeverity: 'critical' as const,
      run: async () => [makeAlert(), makeAlert({ alertId: 'a-2' })],
      dedupeKey: (a: IAdminAlert) => a.alertId,
    };

    registry.register(mockMonitor);
    registry.register(permissionAnomalyMonitor);

    const results = await registry.runAll('2026-03-11T00:00:00Z');
    expect(results).toHaveLength(2);
  });

  it('deduplicateAlerts removes duplicates by dedupeKey', () => {
    const registry = new MonitorRegistry();
    registry.register(provisioningFailureMonitor);

    const alert1 = makeAlert();
    const alert2 = makeAlert({ alertId: 'a-2' }); // same entity → same dedupeKey
    const alert3 = makeAlert({
      alertId: 'a-3',
      affectedEntityId: 'e-2',
    });

    const result = registry.deduplicateAlerts([alert1, alert2, alert3]);
    expect(result).toHaveLength(2);
    expect(result[0].alertId).toBe('a-1');
    expect(result[1].alertId).toBe('a-3');
  });

  it('deduplicates alerts with same category and entity', () => {
    const registry = new MonitorRegistry();
    registry.register(provisioningFailureMonitor);

    const alerts = [
      makeAlert({ alertId: 'a-1', category: 'provisioning-failure', affectedEntityId: 'e-1' }),
      makeAlert({ alertId: 'a-2', category: 'provisioning-failure', affectedEntityId: 'e-1' }),
      makeAlert({ alertId: 'a-3', category: 'provisioning-failure', affectedEntityId: 'e-2' }),
    ];

    const result = registry.deduplicateAlerts(alerts);
    // Same category + same entity → same dedupeKey → first wins
    expect(result).toHaveLength(2);
    expect(result[0].alertId).toBe('a-1');
    expect(result[1].alertId).toBe('a-3');
  });

  it('auto-resolves: alert with resolvedAt is excluded from active set', async () => {
    const registry = new MonitorRegistry();
    const resolvedAlert = makeAlert({
      alertId: 'a-resolved',
      resolvedAt: '2026-03-11T01:00:00Z',
    });
    const activeAlert = makeAlert({ alertId: 'a-active' });

    const mockMonitor = {
      key: 'provisioning-failure' as const,
      defaultSeverity: 'critical' as const,
      run: async () => [resolvedAlert, activeAlert],
      dedupeKey: (a: IAdminAlert) => a.alertId,
    };

    registry.register(mockMonitor);
    const results = await registry.runAll('2026-03-11T02:00:00Z');

    // Both returned by run; consumer filters by resolvedAt
    expect(results).toHaveLength(2);
    const active = results.filter((a) => !a.resolvedAt);
    expect(active).toHaveLength(1);
    expect(active[0].alertId).toBe('a-active');
  });

  it('createDefaultMonitorRegistry registers all 6 monitors', () => {
    const registry = createDefaultMonitorRegistry();
    expect(registry.size).toBe(6);
    const keys = registry.getAll().map((m) => m.key);
    expect(keys).toEqual([
      'provisioning-failure',
      'permission-anomaly',
      'stuck-workflow',
      'overdue-provisioning-task',
      'upcoming-expiration',
      'stale-record',
    ]);
  });
});

describe('Individual monitors', () => {
  it.each([
    { monitor: provisioningFailureMonitor, key: 'provisioning-failure', severity: 'critical' },
    { monitor: permissionAnomalyMonitor, key: 'permission-anomaly', severity: 'high' },
    { monitor: stuckWorkflowMonitor, key: 'stuck-workflow', severity: 'high' },
    { monitor: overdueProvisioningMonitor, key: 'overdue-provisioning-task', severity: 'medium' },
    { monitor: upcomingExpirationMonitor, key: 'upcoming-expiration', severity: 'medium' },
    { monitor: staleRecordMonitor, key: 'stale-record', severity: 'low' },
  ])('$key has correct key and defaultSeverity', ({ monitor, key, severity }) => {
    expect(monitor.key).toBe(key);
    expect(monitor.defaultSeverity).toBe(severity);
  });
});

describe('routeAlert (notificationRouter)', () => {
  it('routes critical alerts to immediate', () => {
    expect(routeAlert(makeAlert({ severity: 'critical' }))).toBe('immediate');
  });

  it('routes high alerts to immediate', () => {
    expect(routeAlert(makeAlert({ severity: 'high' }))).toBe('immediate');
  });

  it('routes medium alerts to digest', () => {
    expect(routeAlert(makeAlert({ severity: 'medium' }))).toBe('digest');
  });

  it('routes low alerts to digest', () => {
    expect(routeAlert(makeAlert({ severity: 'low' }))).toBe('digest');
  });

  it('skips immediate for acknowledged alerts (downgrades to digest)', () => {
    const alert = makeAlert({
      severity: 'critical',
      acknowledgedAt: '2026-03-11T00:00:00Z',
      acknowledgedBy: 'user-1',
    });
    expect(routeAlert(alert)).toBe('digest');
  });

  it('allows immediate for acknowledged alert when severity escalated', () => {
    const alert = makeAlert({
      severity: 'critical',
      acknowledgedAt: '2026-03-11T00:00:00Z',
      acknowledgedBy: 'user-1',
    });
    expect(routeAlert(alert, 'medium')).toBe('immediate');
  });

  it('does not re-notify immediate for acknowledged alert at same severity', () => {
    const alert = makeAlert({
      severity: 'high',
      acknowledgedAt: '2026-03-11T00:00:00Z',
      acknowledgedBy: 'user-1',
    });
    expect(routeAlert(alert, 'high')).toBe('digest');
  });
});
