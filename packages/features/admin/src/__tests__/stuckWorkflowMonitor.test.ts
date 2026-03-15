import { describe, it, expect } from 'vitest';
import { createStuckWorkflowMonitor, stuckWorkflowMonitor } from '../monitors/stuckWorkflowMonitor.js';
import type { IProvisioningDataProvider } from '../types/IProvisioningDataProvider.js';
import type { IProvisioningStatus } from '@hbc/models';

function makeRun(overrides: Partial<IProvisioningStatus> = {}): IProvisioningStatus {
  return {
    projectId: 'proj-1',
    projectNumber: '26-001-01',
    projectName: 'Test Project',
    correlationId: 'corr-1',
    overallStatus: 'InProgress',
    currentStep: 3,
    steps: [],
    triggeredBy: 'admin@example.com',
    submittedBy: 'coordinator@example.com',
    groupMembers: ['member@example.com'],
    startedAt: '2026-03-15T10:00:00Z',
    step5DeferredToTimer: false,
    step5TimerRetryCount: 0,
    retryCount: 0,
    ...overrides,
  };
}

function mockProvider(runs: IProvisioningStatus[]): IProvisioningDataProvider {
  return {
    async listRequests() { return []; },
    async listProvisioningRuns() { return runs; },
  };
}

// "now" is 2026-03-15T12:00:00Z (120 minutes after the default startedAt of 10:00)
const NOW = '2026-03-15T12:00:00Z';

describe('createStuckWorkflowMonitor', () => {
  it('returns alerts only for runs older than 30 minutes', async () => {
    const monitor = createStuckWorkflowMonitor(mockProvider([
      makeRun({ projectId: 'p1', startedAt: '2026-03-15T11:45:00Z' }), // 15 min — not stuck
      makeRun({ projectId: 'p2', startedAt: '2026-03-15T11:00:00Z' }), // 60 min — stuck
    ]));
    const alerts = await monitor.run(NOW);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].affectedEntityId).toBe('p2');
  });

  it('returns empty array when no runs are stuck', async () => {
    const monitor = createStuckWorkflowMonitor(mockProvider([
      makeRun({ startedAt: '2026-03-15T11:50:00Z' }), // 10 min
    ]));
    const alerts = await monitor.run(NOW);
    expect(alerts).toEqual([]);
  });

  it('returns empty array when no runs exist', async () => {
    const monitor = createStuckWorkflowMonitor(mockProvider([]));
    const alerts = await monitor.run(NOW);
    expect(alerts).toEqual([]);
  });

  it('sets severity to high for runs stuck 30 min – 2 h', async () => {
    const monitor = createStuckWorkflowMonitor(mockProvider([
      makeRun({ startedAt: '2026-03-15T11:15:00Z' }), // 45 min
    ]));
    const [alert] = await monitor.run(NOW);
    expect(alert.severity).toBe('high');
  });

  it('escalates severity to critical for runs stuck > 2 h', async () => {
    const monitor = createStuckWorkflowMonitor(mockProvider([
      makeRun({ startedAt: '2026-03-15T09:00:00Z' }), // 180 min
    ]));
    const [alert] = await monitor.run(NOW);
    expect(alert.severity).toBe('critical');
  });

  it('sets severity to high at exactly 120 min (boundary)', async () => {
    const monitor = createStuckWorkflowMonitor(mockProvider([
      makeRun({ startedAt: '2026-03-15T10:00:00Z' }), // exactly 120 min
    ]));
    const [alert] = await monitor.run(NOW);
    // 120 is NOT > 120, so stays high
    expect(alert.severity).toBe('high');
  });

  it('generates correct alertId format', async () => {
    const monitor = createStuckWorkflowMonitor(mockProvider([
      makeRun({ projectId: 'proj-1', correlationId: 'corr-1', startedAt: '2026-03-15T11:00:00Z' }),
    ]));
    const [alert] = await monitor.run(NOW);
    expect(alert.alertId).toBe('sw-proj-1-corr-1');
  });

  it('includes age in title', async () => {
    const monitor = createStuckWorkflowMonitor(mockProvider([
      makeRun({ startedAt: '2026-03-15T11:00:00Z' }), // 60 min
    ]));
    const [alert] = await monitor.run(NOW);
    expect(alert.title).toContain('60 min');
  });

  it('populates all required IAdminAlert fields', async () => {
    const monitor = createStuckWorkflowMonitor(mockProvider([
      makeRun({ startedAt: '2026-03-15T11:00:00Z' }),
    ]));
    const [alert] = await monitor.run(NOW);
    expect(alert.category).toBe('stuck-workflow');
    expect(alert.title).toContain('Test Project');
    expect(alert.description).toContain('proj-1');
    expect(alert.affectedEntityType).toBe('job');
    expect(alert.affectedEntityId).toBe('proj-1');
    expect(alert.occurredAt).toBe(NOW);
    expect(alert.ctaLabel).toBe('View Run');
    expect(alert.ctaHref).toBe('/admin/provisioning/proj-1');
  });

  it('has correct key and defaultSeverity', () => {
    const monitor = createStuckWorkflowMonitor(mockProvider([]));
    expect(monitor.key).toBe('stuck-workflow');
    expect(monitor.defaultSeverity).toBe('high');
  });
});

describe('stuckWorkflowMonitor (stub)', () => {
  it('returns empty array (backward compat)', async () => {
    const alerts = await stuckWorkflowMonitor.run(NOW);
    expect(alerts).toEqual([]);
  });

  it('preserves key and defaultSeverity', () => {
    expect(stuckWorkflowMonitor.key).toBe('stuck-workflow');
    expect(stuckWorkflowMonitor.defaultSeverity).toBe('high');
  });
});
