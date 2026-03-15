import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AlertPollingService } from '../services/alertPollingService.js';
import type { AlertPollingServiceConfig } from '../services/alertPollingService.js';
import type { IProjectSetupRequest, IProvisioningStatus } from '@hbc/models';

function makeFailedRequest(overrides: Partial<IProjectSetupRequest> = {}): IProjectSetupRequest {
  return {
    requestId: 'req-1',
    projectId: 'proj-1',
    projectName: 'Test Project',
    projectLocation: 'Denver, CO',
    projectType: 'Commercial',
    projectStage: 'Active',
    submittedBy: 'coordinator@hb.com',
    submittedAt: '2026-03-01T00:00:00Z',
    state: 'Failed',
    groupMembers: [],
    retryCount: 0,
    ...overrides,
  };
}

function makeStuckRun(overrides: Partial<IProvisioningStatus> = {}): IProvisioningStatus {
  return {
    projectId: 'proj-1',
    projectNumber: '25-001-01',
    projectName: 'Test Project',
    correlationId: 'corr-1',
    overallStatus: 'InProgress',
    currentStep: 2,
    steps: [],
    triggeredBy: 'admin@hb.com',
    submittedBy: 'coordinator@hb.com',
    groupMembers: [],
    startedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
    step5DeferredToTimer: false,
    step5TimerRetryCount: 0,
    retryCount: 0,
    ...overrides,
  };
}

function createConfig(
  requests: IProjectSetupRequest[] = [],
  runs: IProvisioningStatus[] = [],
): AlertPollingServiceConfig {
  return {
    provider: {
      listRequests: vi.fn().mockResolvedValue(requests),
      listProvisioningRuns: vi.fn().mockResolvedValue(runs),
    },
  };
}

describe('AlertPollingService', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('runOnce produces alerts from failed requests', async () => {
    const service = new AlertPollingService(createConfig([makeFailedRequest()]));
    const alerts = await service.runOnce();
    expect(alerts.length).toBeGreaterThanOrEqual(1);
    expect(alerts[0].category).toBe('provisioning-failure');
  });

  it('runOnce produces alerts from stuck provisioning runs', async () => {
    const service = new AlertPollingService(createConfig([], [makeStuckRun()]));
    const alerts = await service.runOnce();
    const stuckAlerts = alerts.filter((a) => a.category === 'stuck-workflow');
    expect(stuckAlerts.length).toBeGreaterThanOrEqual(1);
  });

  it('runOnce ingests alerts into the API', async () => {
    const service = new AlertPollingService(createConfig([makeFailedRequest()]));
    await service.runOnce();
    const active = await service.api.listActive();
    expect(active.length).toBeGreaterThanOrEqual(1);
  });

  it('runOnce returns empty when no failures or stuck runs', async () => {
    const service = new AlertPollingService(createConfig());
    const alerts = await service.runOnce();
    expect(alerts).toEqual([]);
  });

  it('start/stop manages the polling interval', () => {
    vi.useFakeTimers();
    const service = new AlertPollingService(createConfig());

    service.start();
    // Should not throw on double-start
    service.start();

    service.stop();
    // Should not throw on double-stop
    service.stop();

    vi.useRealTimers();
  });

  it('start is a no-op if already running', () => {
    vi.useFakeTimers();
    const service = new AlertPollingService(createConfig());
    service.start();
    service.start(); // second call should be ignored
    service.stop();
    vi.useRealTimers();
  });

  it('api getter returns the AdminAlertsApi instance', () => {
    const service = new AlertPollingService(createConfig());
    expect(service.api).toBeDefined();
    expect(typeof service.api.listActive).toBe('function');
  });

  it('severity is high for initial failure (retryCount=0)', async () => {
    const service = new AlertPollingService(
      createConfig([makeFailedRequest({ retryCount: 0 })]),
    );
    const alerts = await service.runOnce();
    const pfAlerts = alerts.filter((a) => a.category === 'provisioning-failure');
    expect(pfAlerts[0].severity).toBe('high');
  });

  it('severity is critical when retry ceiling reached (retryCount=3)', async () => {
    const service = new AlertPollingService(
      createConfig([makeFailedRequest({ retryCount: 3 })]),
    );
    const alerts = await service.runOnce();
    const pfAlerts = alerts.filter((a) => a.category === 'provisioning-failure');
    expect(pfAlerts[0].severity).toBe('critical');
  });
});
