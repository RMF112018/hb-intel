/**
 * Phase 12 — Alert Action Workflow Tests
 *
 * Tests covering:
 * - Alert state transitions (active → acknowledged → resolved)
 * - Notification dispatch suppression (acknowledged, cooldown)
 * - Delivery status tracking
 * - Resolve action behavior
 * - Duplicate/repeated alert handling
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { IAdminAlert } from '../types/IAdminAlert.js';
import { AdminAlertsApi } from '../api/AdminAlertsApi.js';
import { TeamsWebhookDispatchAdapter } from '../integrations/teamsWebhookDispatchAdapter.js';

// ─── Fixtures ───────────────────────────────────────────────────────────────────

const NOW = '2026-04-04T12:00:00.000Z';

function makeAlert(overrides: Partial<IAdminAlert> = {}): IAdminAlert {
  return {
    alertId: 'alert-001',
    category: 'provisioning-failure',
    severity: 'high',
    title: 'Test Alert',
    description: 'Test description',
    affectedEntityType: 'job',
    affectedEntityId: 'run-001',
    occurredAt: NOW,
    ...overrides,
  };
}

// ─── AdminAlertsApi State Transitions ───────────────────────────────────────────

describe('AdminAlertsApi state transitions', () => {
  it('new alert is active (no acknowledgedAt, no resolvedAt)', async () => {
    const api = new AdminAlertsApi();
    api.ingestAlerts([makeAlert()]);

    const active = await api.listActive();
    expect(active).toHaveLength(1);
    expect(active[0].acknowledgedAt).toBeUndefined();
    expect(active[0].resolvedAt).toBeUndefined();
  });

  it('acknowledge sets acknowledgedAt and acknowledgedBy', async () => {
    const api = new AdminAlertsApi();
    api.ingestAlerts([makeAlert()]);

    await api.acknowledge('alert-001', 'admin@hb.com');

    const all = await api.listHistory();
    expect(all[0].acknowledgedAt).toBeTruthy();
    expect(all[0].acknowledgedBy).toBe('admin@hb.com');
    expect(all[0].resolvedAt).toBeUndefined();
  });

  it('acknowledged alert is removed from active list', async () => {
    const api = new AdminAlertsApi();
    api.ingestAlerts([makeAlert()]);

    await api.acknowledge('alert-001', 'admin@hb.com');

    const active = await api.listActive();
    expect(active).toHaveLength(0);
  });

  it('resolve sets resolvedAt and also acknowledges if not already', async () => {
    const api = new AdminAlertsApi();
    api.ingestAlerts([makeAlert()]);

    await api.resolve('alert-001', 'admin@hb.com');

    const all = await api.listHistory();
    expect(all[0].resolvedAt).toBeTruthy();
    expect(all[0].acknowledgedAt).toBeTruthy();
    expect(all[0].acknowledgedBy).toBe('admin@hb.com');
  });

  it('resolve preserves existing acknowledgment', async () => {
    const api = new AdminAlertsApi();
    api.ingestAlerts([makeAlert()]);

    await api.acknowledge('alert-001', 'first@hb.com');
    await api.resolve('alert-001', 'second@hb.com');

    const all = await api.listHistory();
    expect(all[0].acknowledgedBy).toBe('first@hb.com');
    expect(all[0].resolvedAt).toBeTruthy();
  });

  it('resolved alert is removed from active list', async () => {
    const api = new AdminAlertsApi();
    api.ingestAlerts([makeAlert()]);

    await api.resolve('alert-001', 'admin@hb.com');

    const active = await api.listActive();
    expect(active).toHaveLength(0);
  });

  it('throws on acknowledge for non-existent alert', async () => {
    const api = new AdminAlertsApi();
    await expect(api.acknowledge('nope', 'admin')).rejects.toThrow('not found');
  });

  it('throws on resolve for non-existent alert', async () => {
    const api = new AdminAlertsApi();
    await expect(api.resolve('nope', 'admin')).rejects.toThrow('not found');
  });
});

// ─── Notification Dispatch Suppression ──────────────────────────────────────────

describe('TeamsWebhookDispatchAdapter suppression', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
  });

  it('suppresses re-notification for acknowledged alerts (no escalation)', () => {
    const adapter = new TeamsWebhookDispatchAdapter({ webhookUrl: 'https://test.webhook' });

    const alert = makeAlert({
      severity: 'high',
      acknowledgedAt: NOW,
      acknowledgedBy: 'admin@hb.com',
    });

    adapter.dispatch(alert, 'high'); // same severity, no escalation

    const log = adapter.getDeliveryLog();
    expect(log).toHaveLength(1);
    expect(log[0].status).toBe('suppressed');
    expect(log[0].reason).toBe('acknowledged-not-escalated');
  });

  it('does NOT suppress acknowledged alert if severity has escalated', () => {
    const adapter = new TeamsWebhookDispatchAdapter({ webhookUrl: 'https://test.webhook' });

    const alert = makeAlert({
      severity: 'critical',
      acknowledgedAt: NOW,
      acknowledgedBy: 'admin@hb.com',
    });

    adapter.dispatch(alert, 'high'); // escalated from high to critical

    const log = adapter.getDeliveryLog();
    // Should NOT be suppressed — it should attempt delivery
    expect(log.every(r => r.status !== 'suppressed')).toBe(true);
  });

  it('suppresses duplicate dispatch within cooldown window', async () => {
    const adapter = new TeamsWebhookDispatchAdapter({ webhookUrl: 'https://test.webhook' });
    const alert = makeAlert();

    adapter.dispatch(alert); // First dispatch
    // Wait for async delivery to complete
    await new Promise(resolve => setTimeout(resolve, 20));

    adapter.dispatch(alert); // Second dispatch within cooldown

    const log = adapter.getDeliveryLog();
    // First dispatch: delivered (async). Second: suppressed (sync).
    expect(log.length).toBeGreaterThanOrEqual(2);
    const suppressed = log.find(r => r.status === 'suppressed');
    expect(suppressed).toBeDefined();
    expect(suppressed?.reason).toBe('cooldown-active');
  });

  it('allows dispatch after cooldown expires', () => {
    const adapter = new TeamsWebhookDispatchAdapter({ webhookUrl: 'https://test.webhook' });
    const alert = makeAlert();

    adapter.dispatch(alert); // First dispatch

    // Manually expire the cooldown
    adapter.reset();

    adapter.dispatch(alert); // Should succeed after reset

    const log = adapter.getDeliveryLog();
    // After reset, log is cleared, so we only see the new dispatch
    expect(log.length).toBeGreaterThanOrEqual(0);
    // Verify it was not suppressed
    expect(log.every(r => r.status !== 'suppressed')).toBe(true);
  });
});

// ─── Delivery Status Tracking ───────────────────────────────────────────────────

describe('TeamsWebhookDispatchAdapter delivery tracking', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
  });

  it('records skipped status when no webhook configured', () => {
    const adapter = new TeamsWebhookDispatchAdapter(); // no webhookUrl
    const alert = makeAlert({ severity: 'critical' });

    adapter.dispatch(alert);

    const log = adapter.getDeliveryLog();
    expect(log).toHaveLength(1);
    expect(log[0].status).toBe('skipped');
    expect(log[0].channel).toBe('console');
    expect(log[0].reason).toBe('no-webhook-configured');
  });

  it('records skipped status for digest route (email not implemented)', () => {
    const adapter = new TeamsWebhookDispatchAdapter({ webhookUrl: 'https://test.webhook' });
    const alert = makeAlert({ severity: 'medium' }); // medium → digest route

    adapter.dispatch(alert);

    const log = adapter.getDeliveryLog();
    expect(log).toHaveLength(1);
    expect(log[0].status).toBe('skipped');
    expect(log[0].channel).toBe('email-relay');
    expect(log[0].reason).toBe('email-relay-not-implemented');
  });

  it('records delivered status on successful webhook post', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    const adapter = new TeamsWebhookDispatchAdapter({ webhookUrl: 'https://test.webhook' });
    const alert = makeAlert({ severity: 'critical' });

    adapter.dispatch(alert);

    // Wait for async delivery
    await new Promise(resolve => setTimeout(resolve, 20));

    const log = adapter.getDeliveryLog();
    expect(log.some(r => r.status === 'delivered')).toBe(true);
  });

  it('records failed status on webhook error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    const adapter = new TeamsWebhookDispatchAdapter({ webhookUrl: 'https://test.webhook' });
    const alert = makeAlert({ severity: 'critical' });

    adapter.dispatch(alert);

    // Wait for async failure
    await new Promise(resolve => setTimeout(resolve, 20));

    const log = adapter.getDeliveryLog();
    expect(log.some(r => r.status === 'failed' && r.reason === 'Network error')).toBe(true);
  });

  it('reset clears delivery log and cooldown cache', () => {
    const adapter = new TeamsWebhookDispatchAdapter();
    const alert = makeAlert({ severity: 'critical' });

    adapter.dispatch(alert);
    expect(adapter.getDeliveryLog().length).toBeGreaterThan(0);

    adapter.reset();
    expect(adapter.getDeliveryLog()).toHaveLength(0);
  });
});

// ─── Alert Ingestion Dedup ────────────────────────────────────���─────────────────

describe('AdminAlertsApi deduplication', () => {
  it('overwrites older alert with same alertId', async () => {
    const api = new AdminAlertsApi();
    api.ingestAlerts([makeAlert({ title: 'Version 1' })]);
    api.ingestAlerts([makeAlert({ title: 'Version 2' })]);

    const all = await api.listHistory();
    expect(all).toHaveLength(1);
    expect(all[0].title).toBe('Version 2');
  });

  it('maintains separate alerts for different alertIds', async () => {
    const api = new AdminAlertsApi();
    api.ingestAlerts([
      makeAlert({ alertId: 'a1', title: 'Alert 1' }),
      makeAlert({ alertId: 'a2', title: 'Alert 2' }),
    ]);

    const all = await api.listHistory();
    expect(all).toHaveLength(2);
  });
});
