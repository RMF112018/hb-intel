import { describe, it, expect, beforeEach } from 'vitest';
import { InfrastructureProbeApi } from '../api/InfrastructureProbeApi.js';
import type { IProbeSnapshot } from '../types/IProbeSnapshot.js';

function makeSnapshot(overrides: Partial<IProbeSnapshot> = {}): IProbeSnapshot {
  return {
    snapshotId: 'snap-1',
    capturedAt: '2026-03-15T12:00:00Z',
    results: [],
    ...overrides,
  };
}

describe('InfrastructureProbeApi', () => {
  let api: InfrastructureProbeApi;

  beforeEach(() => {
    api = new InfrastructureProbeApi();
  });

  it('getLatestSnapshot returns null when empty', async () => {
    expect(await api.getLatestSnapshot()).toBeNull();
  });

  it('saveSnapshot stores and getLatestSnapshot returns it', async () => {
    const snap = makeSnapshot();
    api.saveSnapshot(snap);
    const latest = await api.getLatestSnapshot();
    expect(latest).toEqual(snap);
  });

  it('getLatestSnapshot returns most recent by capturedAt', async () => {
    api.saveSnapshot(makeSnapshot({ snapshotId: 's1', capturedAt: '2026-03-15T11:00:00Z' }));
    api.saveSnapshot(makeSnapshot({ snapshotId: 's2', capturedAt: '2026-03-15T12:00:00Z' }));
    api.saveSnapshot(makeSnapshot({ snapshotId: 's3', capturedAt: '2026-03-15T10:00:00Z' }));
    const latest = await api.getLatestSnapshot();
    expect(latest!.snapshotId).toBe('s2');
  });

  it('listSnapshots returns all without range', async () => {
    api.saveSnapshot(makeSnapshot({ snapshotId: 's1' }));
    api.saveSnapshot(makeSnapshot({ snapshotId: 's2' }));
    const all = await api.listSnapshots();
    expect(all).toHaveLength(2);
  });

  it('listSnapshots filters by range', async () => {
    api.saveSnapshot(makeSnapshot({ snapshotId: 's1', capturedAt: '2026-03-14T00:00:00Z' }));
    api.saveSnapshot(makeSnapshot({ snapshotId: 's2', capturedAt: '2026-03-15T12:00:00Z' }));
    const filtered = await api.listSnapshots({ from: '2026-03-15T00:00:00Z', to: '2026-03-15T23:59:59Z' });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].snapshotId).toBe('s2');
  });

  it('runNow returns latest snapshot when available', async () => {
    const snap = makeSnapshot();
    api.saveSnapshot(snap);
    const result = await api.runNow();
    expect(result).toEqual(snap);
  });

  it('runNow returns empty snapshot when no data', async () => {
    const result = await api.runNow();
    expect(result.results).toEqual([]);
    expect(result.snapshotId).toContain('on-demand');
  });
});
