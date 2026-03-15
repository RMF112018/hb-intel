import { describe, it, expect } from 'vitest';
import { createProvisioningFailureMonitor, provisioningFailureMonitor } from '../monitors/provisioningFailureMonitor.js';
import type { IProvisioningDataProvider } from '../types/IProvisioningDataProvider.js';
import type { IProjectSetupRequest } from '@hbc/models';

function makeRequest(overrides: Partial<IProjectSetupRequest> = {}): IProjectSetupRequest {
  return {
    requestId: 'req-1',
    projectId: 'proj-1',
    projectName: 'Test Project',
    projectLocation: 'New York, NY',
    projectType: 'Ground-Up',
    projectStage: 'Pursuit',
    submittedBy: 'coordinator@example.com',
    submittedAt: '2026-03-01T00:00:00.000Z',
    state: 'Failed',
    groupMembers: ['member@example.com'],
    retryCount: 0,
    ...overrides,
  };
}

function mockProvider(requests: IProjectSetupRequest[]): IProvisioningDataProvider {
  return {
    async listRequests() { return requests; },
    async listProvisioningRuns() { return []; },
  };
}

const NOW = '2026-03-15T12:00:00Z';

describe('createProvisioningFailureMonitor', () => {
  it('returns an alert for each failed request', async () => {
    const monitor = createProvisioningFailureMonitor(
      mockProvider([makeRequest(), makeRequest({ requestId: 'req-2', projectId: 'proj-2' })]),
    );
    const alerts = await monitor.run(NOW);
    expect(alerts).toHaveLength(2);
  });

  it('returns empty array when no requests are failed', async () => {
    const monitor = createProvisioningFailureMonitor(mockProvider([]));
    const alerts = await monitor.run(NOW);
    expect(alerts).toEqual([]);
  });

  it('generates correct alertId format', async () => {
    const monitor = createProvisioningFailureMonitor(mockProvider([makeRequest()]));
    const [alert] = await monitor.run(NOW);
    expect(alert.alertId).toBe('pf-req-1');
  });

  it('sets severity to critical when retryCount is 0', async () => {
    const monitor = createProvisioningFailureMonitor(
      mockProvider([makeRequest({ retryCount: 0 })]),
    );
    const [alert] = await monitor.run(NOW);
    expect(alert.severity).toBe('critical');
  });

  it('downgrades severity to high when retryCount > 0', async () => {
    const monitor = createProvisioningFailureMonitor(
      mockProvider([makeRequest({ retryCount: 2 })]),
    );
    const [alert] = await monitor.run(NOW);
    expect(alert.severity).toBe('high');
  });

  it('populates all required IAdminAlert fields', async () => {
    const monitor = createProvisioningFailureMonitor(mockProvider([makeRequest()]));
    const [alert] = await monitor.run(NOW);
    expect(alert.category).toBe('provisioning-failure');
    expect(alert.title).toContain('Test Project');
    expect(alert.description).toContain('proj-1');
    expect(alert.affectedEntityType).toBe('record');
    expect(alert.affectedEntityId).toBe('proj-1');
    expect(alert.occurredAt).toBe(NOW);
    expect(alert.ctaLabel).toBe('View Request');
    expect(alert.ctaHref).toBe('/admin/requests/req-1');
  });

  it('has correct key and defaultSeverity', () => {
    const monitor = createProvisioningFailureMonitor(mockProvider([]));
    expect(monitor.key).toBe('provisioning-failure');
    expect(monitor.defaultSeverity).toBe('critical');
  });

  it('dedupeKey matches stub pattern', () => {
    const monitor = createProvisioningFailureMonitor(mockProvider([]));
    const alert = {
      alertId: 'pf-req-1',
      category: 'provisioning-failure' as const,
      severity: 'critical' as const,
      title: 'test',
      description: 'test',
      affectedEntityType: 'record' as const,
      affectedEntityId: 'proj-1',
      occurredAt: NOW,
    };
    expect(monitor.dedupeKey(alert)).toBe('provisioning-failure:record:proj-1');
  });
});

describe('provisioningFailureMonitor (stub)', () => {
  it('returns empty array (backward compat)', async () => {
    const alerts = await provisioningFailureMonitor.run(NOW);
    expect(alerts).toEqual([]);
  });

  it('preserves key and defaultSeverity', () => {
    expect(provisioningFailureMonitor.key).toBe('provisioning-failure');
    expect(provisioningFailureMonitor.defaultSeverity).toBe('critical');
  });
});
