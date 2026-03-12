import { describe, it, expect, vi } from 'vitest';
import { ProbeScheduler } from '../probes/probeScheduler.js';
import { createDefaultProbeScheduler } from '../probes/index.js';
import type { IInfrastructureProbeDefinition } from '../types/IInfrastructureProbeDefinition.js';
import type { IInfrastructureProbeResult } from '../types/IInfrastructureProbeResult.js';

function makeProbe(
  probeKey: IInfrastructureProbeResult['probeKey'],
  runFn?: (nowIso: string) => Promise<IInfrastructureProbeResult>,
): IInfrastructureProbeDefinition {
  return {
    probeKey,
    run:
      runFn ??
      (async (nowIso: string) => ({
        probeId: `${probeKey}-${nowIso}`,
        probeKey,
        status: 'healthy' as const,
        summary: `${probeKey} OK`,
        observedAt: nowIso,
        metrics: {},
        anomalies: [],
      })),
  };
}

describe('ProbeScheduler', () => {
  it('rejects duplicate probeKeys', () => {
    const scheduler = new ProbeScheduler();
    scheduler.register(makeProbe('sharepoint-infrastructure'));
    expect(() =>
      scheduler.register(makeProbe('sharepoint-infrastructure')),
    ).toThrow('duplicate probeKey "sharepoint-infrastructure"');
  });

  it('maintains deterministic execution order', async () => {
    const scheduler = new ProbeScheduler();
    const executionOrder: string[] = [];

    const track = (key: IInfrastructureProbeResult['probeKey']) =>
      makeProbe(key, async (nowIso) => {
        executionOrder.push(key);
        return {
          probeId: `${key}-${nowIso}`,
          probeKey: key,
          status: 'healthy' as const,
          summary: '',
          observedAt: nowIso,
          metrics: {},
          anomalies: [],
        };
      });

    scheduler.register(track('sharepoint-infrastructure'));
    scheduler.register(track('azure-functions'));
    scheduler.register(track('azure-search'));
    scheduler.register(track('notification-system'));
    scheduler.register(track('module-record-health'));

    await scheduler.runAll('2026-03-11T00:00:00Z');

    expect(executionOrder).toEqual([
      'sharepoint-infrastructure',
      'azure-functions',
      'azure-search',
      'notification-system',
      'module-record-health',
    ]);
  });

  it('yields error result on partial failure (not dropped)', async () => {
    const scheduler = new ProbeScheduler();

    scheduler.register(makeProbe('sharepoint-infrastructure'));
    scheduler.register(
      makeProbe('azure-functions', async () => {
        throw new Error('connection refused');
      }),
    );
    scheduler.register(makeProbe('azure-search'));

    const results = await scheduler.runAll('2026-03-11T00:00:00Z');

    expect(results).toHaveLength(3);
    expect(results[0].status).toBe('healthy');
    expect(results[1].status).toBe('error');
    expect(results[1].probeKey).toBe('azure-functions');
    expect(results[1].summary).toContain('connection refused');
    expect(results[2].status).toBe('healthy');
  });

  it('retries up to PROBE_MAX_RETRY times before yielding error', async () => {
    vi.useFakeTimers();
    const scheduler = new ProbeScheduler();
    let callCount = 0;

    scheduler.register(
      makeProbe('sharepoint-infrastructure', async () => {
        callCount++;
        throw new Error('fail');
      }),
    );

    const resultPromise = scheduler.runAll('2026-03-11T00:00:00Z');

    // Advance timers for exponential backoff delays
    await vi.advanceTimersByTimeAsync(100); // 1st retry delay
    await vi.advanceTimersByTimeAsync(200); // 2nd retry delay

    const results = await resultPromise;
    expect(callCount).toBe(3); // PROBE_MAX_RETRY = 3
    expect(results[0].status).toBe('error');

    vi.useRealTimers();
  });

  it('buildSnapshot creates atomic snapshot from results', () => {
    const scheduler = new ProbeScheduler();
    const results: IInfrastructureProbeResult[] = [
      {
        probeId: 'p1',
        probeKey: 'sharepoint-infrastructure',
        status: 'healthy',
        summary: 'ok',
        observedAt: '2026-03-11T00:00:00Z',
        metrics: {},
        anomalies: [],
      },
    ];

    const snapshot = scheduler.buildSnapshot(
      results,
      'snap-1',
      '2026-03-11T00:00:00Z',
    );

    expect(snapshot.snapshotId).toBe('snap-1');
    expect(snapshot.capturedAt).toBe('2026-03-11T00:00:00Z');
    expect(snapshot.results).toHaveLength(1);
    expect(snapshot.results).not.toBe(results); // defensive copy
  });

  it('applies exponential backoff timing between retries', async () => {
    vi.useFakeTimers();
    const scheduler = new ProbeScheduler();
    const callTimestamps: number[] = [];

    scheduler.register(
      makeProbe('sharepoint-infrastructure', async () => {
        callTimestamps.push(Date.now());
        throw new Error('fail');
      }),
    );

    const resultPromise = scheduler.runAll('2026-03-11T00:00:00Z');

    // 1st retry delay: 2^0 * 100 = 100ms
    await vi.advanceTimersByTimeAsync(100);
    // 2nd retry delay: 2^1 * 100 = 200ms
    await vi.advanceTimersByTimeAsync(200);

    await resultPromise;

    expect(callTimestamps).toHaveLength(3); // PROBE_MAX_RETRY = 3
    // Verify exponential gaps: ~100ms then ~200ms
    const gap1 = callTimestamps[1] - callTimestamps[0];
    const gap2 = callTimestamps[2] - callTimestamps[1];
    expect(gap1).toBe(100);
    expect(gap2).toBe(200);

    vi.useRealTimers();
  });

  it('aggregates degraded status across multiple probes in snapshot', async () => {
    const scheduler = new ProbeScheduler();

    scheduler.register(
      makeProbe('sharepoint-infrastructure', async (nowIso) => ({
        probeId: `sp-${nowIso}`,
        probeKey: 'sharepoint-infrastructure',
        status: 'degraded' as const,
        summary: 'Elevated latency',
        observedAt: nowIso,
        metrics: {},
        anomalies: ['Latency > 2s'],
      })),
    );
    scheduler.register(
      makeProbe('azure-functions', async (nowIso) => ({
        probeId: `af-${nowIso}`,
        probeKey: 'azure-functions',
        status: 'degraded' as const,
        summary: 'Cold start delays',
        observedAt: nowIso,
        metrics: {},
        anomalies: ['Cold start > 5s'],
      })),
    );
    scheduler.register(makeProbe('azure-search'));

    const results = await scheduler.runAll('2026-03-11T00:00:00Z');
    const snapshot = scheduler.buildSnapshot(results, 'snap-deg', '2026-03-11T00:00:00Z');

    expect(snapshot.results).toHaveLength(3);
    const degradedResults = snapshot.results.filter((r) => r.status === 'degraded');
    expect(degradedResults).toHaveLength(2);
    expect(degradedResults.map((r) => r.probeKey)).toEqual([
      'sharepoint-infrastructure',
      'azure-functions',
    ]);
    expect(snapshot.results[2].status).toBe('healthy');
  });

  it('createDefaultProbeScheduler registers all 5 probes in correct order', () => {
    const scheduler = createDefaultProbeScheduler();
    expect(scheduler.size).toBe(5);
    const keys = scheduler.getAll().map((p) => p.probeKey);
    expect(keys).toEqual([
      'sharepoint-infrastructure',
      'azure-functions',
      'azure-search',
      'notification-system',
      'module-record-health',
    ]);
  });
});
