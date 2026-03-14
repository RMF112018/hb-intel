import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NotificationService, MockNotificationService } from './notification-service.js';
import type { NotificationSendPayload } from '@hbc/notification-intelligence';

const makePayload = (overrides?: Partial<NotificationSendPayload>): NotificationSendPayload => ({
  eventType: 'provisioning.completed',
  sourceModule: 'provisioning',
  sourceRecordType: 'ProvisioningStatus',
  sourceRecordId: 'req-001',
  recipientUserId: 'user@hb.com',
  title: 'Test',
  body: 'Test body',
  actionUrl: '/test',
  ...overrides,
});

describe('NotificationService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('constructs URL from NOTIFICATION_API_BASE_URL env var', () => {
    process.env.NOTIFICATION_API_BASE_URL = 'https://my-func.azurewebsites.net';
    const svc = new NotificationService();
    // Access private baseUrl via casting
    expect((svc as unknown as { baseUrl: string }).baseUrl).toBe('https://my-func.azurewebsites.net');
  });

  it('defaults to localhost:7071 when env var not set', () => {
    delete process.env.NOTIFICATION_API_BASE_URL;
    const svc = new NotificationService();
    expect((svc as unknown as { baseUrl: string }).baseUrl).toBe('http://localhost:7071');
  });

  it('sends payload via HTTP POST and resolves on success', async () => {
    process.env.NOTIFICATION_API_BASE_URL = 'https://func.test';
    const svc = new NotificationService();
    const payload = makePayload();

    const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200, statusText: 'OK' });
    vi.stubGlobal('fetch', mockFetch);

    await svc.send(payload);

    expect(mockFetch).toHaveBeenCalledWith('https://func.test/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  });

  it('throws on non-ok response', async () => {
    const svc = new NotificationService();
    const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 500, statusText: 'Internal Server Error' });
    vi.stubGlobal('fetch', mockFetch);

    await expect(svc.send(makePayload())).rejects.toThrow('500');
  });
});

describe('MockNotificationService', () => {
  it('send resolves without error', async () => {
    const svc = new MockNotificationService();
    await expect(svc.send(makePayload())).resolves.toBeUndefined();
  });

  it('logs payload to console', async () => {
    const svc = new MockNotificationService();
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await svc.send(makePayload({ eventType: 'provisioning.started' }));
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('provisioning.started'));
    spy.mockRestore();
  });
});
