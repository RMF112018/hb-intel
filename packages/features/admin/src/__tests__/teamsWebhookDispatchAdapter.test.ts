import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TeamsWebhookDispatchAdapter } from '../integrations/teamsWebhookDispatchAdapter.js';
import type { IAdminAlert } from '../types/IAdminAlert.js';

function makeAlert(overrides: Partial<IAdminAlert> = {}): IAdminAlert {
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

describe('TeamsWebhookDispatchAdapter', () => {
  const mockFetch = vi.fn().mockResolvedValue({ ok: true });
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    globalThis.fetch = mockFetch;
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('returns a valid IAdminNotificationEvent', () => {
    const adapter = new TeamsWebhookDispatchAdapter();
    const event = adapter.dispatch(makeAlert());
    expect(event.alert).toBeDefined();
    expect(event.route).toBe('immediate');
    expect(event.dispatchedAt).toBeDefined();
  });

  it('routes critical alerts as immediate', () => {
    const adapter = new TeamsWebhookDispatchAdapter();
    const event = adapter.dispatch(makeAlert({ severity: 'critical' }));
    expect(event.route).toBe('immediate');
  });

  it('routes medium alerts as digest', () => {
    const adapter = new TeamsWebhookDispatchAdapter();
    const event = adapter.dispatch(makeAlert({ severity: 'medium' }));
    expect(event.route).toBe('digest');
  });

  it('posts to Teams webhook for immediate alerts when webhookUrl is configured', () => {
    const adapter = new TeamsWebhookDispatchAdapter({
      webhookUrl: 'https://webhook.example.com/incoming',
    });
    adapter.dispatch(makeAlert({ severity: 'critical' }));
    expect(mockFetch).toHaveBeenCalledWith(
      'https://webhook.example.com/incoming',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  });

  it('does not call fetch when webhookUrl is not configured', () => {
    const adapter = new TeamsWebhookDispatchAdapter({});
    adapter.dispatch(makeAlert({ severity: 'critical' }));
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('logs a warning for immediate alerts without webhook', () => {
    const adapter = new TeamsWebhookDispatchAdapter({});
    adapter.dispatch(makeAlert({ severity: 'critical' }));
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('no webhook configured'),
      'a-1',
    );
  });

  it('logs digest info with email relay target', () => {
    const adapter = new TeamsWebhookDispatchAdapter({
      emailRelay: 'hbtech@hedrickbrothers.com',
    });
    adapter.dispatch(makeAlert({ severity: 'medium' }));
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining('hbtech@hedrickbrothers.com'),
      'a-1',
    );
  });

  it('logs digest info without email relay configured', () => {
    const adapter = new TeamsWebhookDispatchAdapter({});
    adapter.dispatch(makeAlert({ severity: 'low' }));
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining('no relay configured'),
      'a-1',
    );
  });

  it('does not call fetch for digest-routed alerts', () => {
    const adapter = new TeamsWebhookDispatchAdapter({
      webhookUrl: 'https://webhook.example.com/incoming',
    });
    adapter.dispatch(makeAlert({ severity: 'medium' }));
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('sends Adaptive Card payload in webhook body', () => {
    const adapter = new TeamsWebhookDispatchAdapter({
      webhookUrl: 'https://webhook.example.com/incoming',
    });
    adapter.dispatch(makeAlert({
      severity: 'critical',
      title: 'Server down',
      ctaHref: '/admin/view',
      ctaLabel: 'View Details',
    }));
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.type).toBe('message');
    expect(body.attachments).toHaveLength(1);
    expect(body.attachments[0].contentType).toBe('application/vnd.microsoft.card.adaptive');
    const card = body.attachments[0].content;
    expect(card.type).toBe('AdaptiveCard');
    expect(card.body[0].text).toContain('CRITICAL');
    expect(card.body[0].text).toContain('Server down');
    expect(card.actions).toHaveLength(1);
    expect(card.actions[0].url).toBe('/admin/view');
  });

  it('handles fetch errors gracefully via console.error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network fail'));
    const adapter = new TeamsWebhookDispatchAdapter({
      webhookUrl: 'https://webhook.example.com/incoming',
    });
    // dispatch itself should not throw
    const event = adapter.dispatch(makeAlert({ severity: 'critical' }));
    expect(event.route).toBe('immediate');

    // Wait for the fire-and-forget promise to settle
    await new Promise((r) => setTimeout(r, 10));
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('webhook failed'),
      expect.any(Error),
    );
  });

  it('defaults to empty config when none provided', () => {
    const adapter = new TeamsWebhookDispatchAdapter();
    const event = adapter.dispatch(makeAlert({ severity: 'critical' }));
    expect(event).toBeDefined();
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
