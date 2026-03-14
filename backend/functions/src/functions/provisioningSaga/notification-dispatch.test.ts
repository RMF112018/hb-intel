import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { IProvisioningStatus } from '@hbc/models';
import { resolveRecipients, dispatchProvisioningNotification } from './notification-dispatch.js';
import type { IServiceContainer } from '../../services/service-factory.js';
import type { ILogger } from '../../utils/logger.js';

function makeStatus(overrides?: Partial<IProvisioningStatus>): IProvisioningStatus {
  return {
    projectId: 'proj-1',
    projectNumber: '25-001-01',
    projectName: 'Test Project',
    correlationId: 'corr-1',
    overallStatus: 'InProgress',
    currentStep: 6,
    steps: [],
    triggeredBy: 'trigger@hb.com',
    submittedBy: 'submitter@hb.com',
    groupMembers: ['member1@hb.com', 'member2@hb.com'],
    startedAt: new Date().toISOString(),
    step5DeferredToTimer: false,
    step5TimerRetryCount: 0,
    retryCount: 0,
    ...overrides,
  };
}

function makeLogger(): ILogger {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    trackEvent: vi.fn(),
    trackMetric: vi.fn(),
  };
}

describe('resolveRecipients', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('resolves submitter group', () => {
    const status = makeStatus({ submittedBy: 'sub@hb.com' });
    const result = resolveRecipients(['submitter'], status);
    expect(result).toEqual(['sub@hb.com']);
  });

  it('resolves controller group from env', () => {
    process.env.CONTROLLER_UPNS = 'ctrl1@hb.com, ctrl2@hb.com';
    const result = resolveRecipients(['controller'], makeStatus());
    expect(result).toContain('ctrl1@hb.com');
    expect(result).toContain('ctrl2@hb.com');
  });

  it('resolves group: members + leaders', () => {
    const status = makeStatus({
      groupMembers: ['m@hb.com'],
      groupLeaders: ['l@hb.com'],
    });
    const result = resolveRecipients(['group'], status);
    expect(result).toContain('m@hb.com');
    expect(result).toContain('l@hb.com');
  });

  it('resolves admin group from env', () => {
    process.env.ADMIN_UPNS = 'admin@hb.com';
    const result = resolveRecipients(['admin'], makeStatus());
    expect(result).toContain('admin@hb.com');
  });

  it('deduplicates across groups', () => {
    process.env.ADMIN_UPNS = 'submitter@hb.com';
    const status = makeStatus({ submittedBy: 'submitter@hb.com' });
    const result = resolveRecipients(['submitter', 'admin'], status);
    expect(result.filter((r) => r === 'submitter@hb.com')).toHaveLength(1);
  });

  it('handles empty groupMembers and groupLeaders', () => {
    const status = makeStatus({ groupMembers: [], groupLeaders: [] });
    const result = resolveRecipients(['group'], status);
    expect(result).toEqual([]);
  });

  it('handles missing CONTROLLER_UPNS env var', () => {
    delete process.env.CONTROLLER_UPNS;
    const result = resolveRecipients(['controller'], makeStatus());
    // submitter/group/admin not requested, controller env missing
    expect(result).toEqual([]);
  });

  it('handles missing ADMIN_UPNS env var', () => {
    delete process.env.ADMIN_UPNS;
    const result = resolveRecipients(['admin'], makeStatus());
    expect(result).toEqual([]);
  });
});

describe('dispatchProvisioningNotification', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('dispatches to each recipient', () => {
    const sendMock = vi.fn().mockResolvedValue(undefined);
    const services = { notifications: { send: sendMock } } as unknown as IServiceContainer;
    const logger = makeLogger();
    const status = makeStatus({ submittedBy: 'a@hb.com', groupMembers: ['b@hb.com'] });

    dispatchProvisioningNotification(services, logger, {
      eventType: 'provisioning.completed',
      title: 'Done',
      body: 'Site ready',
      actionUrl: '/site',
      sourceRecordId: 'req-1',
      recipientGroups: ['submitter', 'group'],
      status,
    });

    // a@hb.com (submitter), b@hb.com (groupMember) — a@hb.com is also in groupMembers but not in this test
    expect(sendMock).toHaveBeenCalledTimes(2);
  });

  it('is non-blocking on send failure — catches and logs warning', async () => {
    const sendMock = vi.fn().mockRejectedValue(new Error('network error'));
    const services = { notifications: { send: sendMock } } as unknown as IServiceContainer;
    const logger = makeLogger();

    dispatchProvisioningNotification(services, logger, {
      eventType: 'provisioning.completed',
      title: 'Done',
      body: 'body',
      actionUrl: '/site',
      sourceRecordId: 'req-1',
      recipientGroups: ['submitter'],
      status: makeStatus(),
    });

    // Let the promise rejection handler run
    await vi.waitFor(() => {
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Non-critical'),
        expect.objectContaining({ error: 'network error' }),
      );
    });
  });

  it('logs stringified error on non-Error rejection', async () => {
    const sendMock = vi.fn().mockRejectedValue('string-failure');
    const services = { notifications: { send: sendMock } } as unknown as IServiceContainer;
    const logger = makeLogger();

    dispatchProvisioningNotification(services, logger, {
      eventType: 'provisioning.completed',
      title: 'Done',
      body: 'body',
      actionUrl: '/site',
      sourceRecordId: 'req-1',
      recipientGroups: ['submitter'],
      status: makeStatus(),
    });

    await vi.waitFor(() => {
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Non-critical'),
        expect.objectContaining({ error: 'string-failure' }),
      );
    });
  });

  it('logs warning and returns when zero recipients', () => {
    const sendMock = vi.fn();
    const services = { notifications: { send: sendMock } } as unknown as IServiceContainer;
    const logger = makeLogger();
    const status = makeStatus({
      submittedBy: '',
      groupMembers: [],
      groupLeaders: [],
    });
    delete process.env.ADMIN_UPNS;
    delete process.env.CONTROLLER_UPNS;

    dispatchProvisioningNotification(services, logger, {
      eventType: 'provisioning.completed',
      title: 'Done',
      body: 'body',
      actionUrl: '/site',
      sourceRecordId: 'req-1',
      recipientGroups: ['submitter'],
      status,
    });

    expect(sendMock).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('no recipients'),
      expect.anything(),
    );
  });
});
