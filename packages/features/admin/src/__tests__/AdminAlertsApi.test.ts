import { describe, it, expect, beforeEach } from 'vitest';
import { AdminAlertsApi } from '../api/AdminAlertsApi.js';
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

describe('AdminAlertsApi', () => {
  let api: AdminAlertsApi;

  beforeEach(() => {
    api = new AdminAlertsApi();
  });

  // ─── ingestAlerts ────────────────────────────────────────────────────

  it('stores ingested alerts', async () => {
    api.ingestAlerts([makeAlert(), makeAlert({ alertId: 'a-2' })]);
    const active = await api.listActive();
    expect(active).toHaveLength(2);
  });

  it('deduplicates by alertId on ingest (last write wins)', async () => {
    api.ingestAlerts([makeAlert({ title: 'first' })]);
    api.ingestAlerts([makeAlert({ title: 'second' })]);
    const active = await api.listActive();
    expect(active).toHaveLength(1);
    expect(active[0].title).toBe('second');
  });

  // ─── listActive ─────────────────────────────────────────────────────

  it('returns empty array when store is empty', async () => {
    expect(await api.listActive()).toEqual([]);
  });

  it('excludes acknowledged alerts from active list', async () => {
    api.ingestAlerts([
      makeAlert({ alertId: 'a-1' }),
      makeAlert({ alertId: 'a-2', acknowledgedAt: '2026-03-11T01:00:00Z', acknowledgedBy: 'u-1' }),
    ]);
    const active = await api.listActive();
    expect(active).toHaveLength(1);
    expect(active[0].alertId).toBe('a-1');
  });

  it('excludes resolved alerts from active list', async () => {
    api.ingestAlerts([
      makeAlert({ alertId: 'a-1' }),
      makeAlert({ alertId: 'a-2', resolvedAt: '2026-03-11T01:00:00Z' }),
    ]);
    const active = await api.listActive();
    expect(active).toHaveLength(1);
    expect(active[0].alertId).toBe('a-1');
  });

  // ─── acknowledge ────────────────────────────────────────────────────

  it('marks an alert as acknowledged', async () => {
    api.ingestAlerts([makeAlert()]);
    await api.acknowledge('a-1', 'admin@example.com');
    const active = await api.listActive();
    expect(active).toHaveLength(0);

    const all = await api.listHistory();
    expect(all).toHaveLength(1);
    expect(all[0].acknowledgedBy).toBe('admin@example.com');
    expect(all[0].acknowledgedAt).toBeDefined();
  });

  it('throws when acknowledging a non-existent alert', async () => {
    await expect(api.acknowledge('nope', 'admin@example.com')).rejects.toThrow(
      'alert "nope" not found',
    );
  });

  // ─── listHistory ────────────────────────────────────────────────────

  it('returns all alerts without a range filter', async () => {
    api.ingestAlerts([
      makeAlert({ alertId: 'a-1' }),
      makeAlert({ alertId: 'a-2', acknowledgedAt: '2026-03-11T01:00:00Z', acknowledgedBy: 'u' }),
    ]);
    const all = await api.listHistory();
    expect(all).toHaveLength(2);
  });

  it('filters alerts by occurredAt range', async () => {
    api.ingestAlerts([
      makeAlert({ alertId: 'a-1', occurredAt: '2026-03-10T00:00:00Z' }),
      makeAlert({ alertId: 'a-2', occurredAt: '2026-03-11T12:00:00Z' }),
      makeAlert({ alertId: 'a-3', occurredAt: '2026-03-12T00:00:00Z' }),
    ]);
    const filtered = await api.listHistory({
      from: '2026-03-11T00:00:00Z',
      to: '2026-03-11T23:59:59Z',
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].alertId).toBe('a-2');
  });

  it('includes boundary timestamps in range filter', async () => {
    api.ingestAlerts([
      makeAlert({ alertId: 'a-1', occurredAt: '2026-03-11T00:00:00Z' }),
    ]);
    const filtered = await api.listHistory({
      from: '2026-03-11T00:00:00Z',
      to: '2026-03-11T00:00:00Z',
    });
    expect(filtered).toHaveLength(1);
  });
});
