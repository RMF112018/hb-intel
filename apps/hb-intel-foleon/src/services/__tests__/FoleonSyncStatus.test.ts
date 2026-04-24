import { describe, expect, it } from 'vitest';
import {
  deriveFoleonSyncStatus,
  type FoleonSyncRunRow,
} from '../FoleonSyncStatus.js';

const NOW = new Date('2026-04-24T12:00:00.000Z');

function run(overrides: Partial<FoleonSyncRunRow>): FoleonSyncRunRow {
  return {
    runId: 'r-1',
    runKind: 'Docs',
    status: 'Succeeded',
    startedUtc: '2026-04-24T10:00:00.000Z',
    ...overrides,
  };
}

describe('deriveFoleonSyncStatus', () => {
  it('reports stale and no success when no runs exist', () => {
    const status = deriveFoleonSyncStatus([], 'Docs', NOW, 60);
    expect(status).toEqual({
      runKind: 'Docs',
      isStale: true,
      hasInFlight: false,
    });
  });

  it('computes minutes-since-last-success from the most recent success', () => {
    const rows: FoleonSyncRunRow[] = [
      run({ runId: 'a', startedUtc: '2026-04-24T10:00:00.000Z' }),
      run({ runId: 'b', startedUtc: '2026-04-24T11:30:00.000Z' }),
    ];
    const status = deriveFoleonSyncStatus(rows, 'Docs', NOW, 180);
    expect(status.lastSuccessUtc).toBe('2026-04-24T11:30:00.000Z');
    expect(status.minutesSinceLastSuccess).toBe(30);
    expect(status.isStale).toBe(false);
  });

  it('flags stale when the last success is older than the threshold', () => {
    const rows: FoleonSyncRunRow[] = [
      run({ startedUtc: '2026-04-24T09:00:00.000Z' }),
    ];
    const status = deriveFoleonSyncStatus(rows, 'Docs', NOW, 60);
    expect(status.minutesSinceLastSuccess).toBe(180);
    expect(status.isStale).toBe(true);
  });

  it('records last failure separately from last success', () => {
    const rows: FoleonSyncRunRow[] = [
      run({ runId: 'a', status: 'Succeeded', startedUtc: '2026-04-24T11:30:00.000Z' }),
      run({ runId: 'b', status: 'Failed', startedUtc: '2026-04-24T11:45:00.000Z' }),
    ];
    const status = deriveFoleonSyncStatus(rows, 'Docs', NOW, 60);
    expect(status.lastSuccessUtc).toBe('2026-04-24T11:30:00.000Z');
    expect(status.lastFailureUtc).toBe('2026-04-24T11:45:00.000Z');
    expect(status.lastRunStatus).toBe('Failed');
  });

  it('detects an in-flight run', () => {
    const rows: FoleonSyncRunRow[] = [
      run({ runId: 'a', status: 'Succeeded', startedUtc: '2026-04-24T11:00:00.000Z' }),
      run({ runId: 'b', status: 'Running', startedUtc: '2026-04-24T11:55:00.000Z' }),
    ];
    const status = deriveFoleonSyncStatus(rows, 'Docs', NOW, 60);
    expect(status.hasInFlight).toBe(true);
    expect(status.lastRunStatus).toBe('Running');
  });

  it('filters by run kind', () => {
    const rows: FoleonSyncRunRow[] = [
      run({ runId: 'a', runKind: 'Docs', startedUtc: '2026-04-24T11:30:00.000Z' }),
      run({ runId: 'b', runKind: 'Projects', startedUtc: '2026-04-24T11:55:00.000Z' }),
    ];
    const docs = deriveFoleonSyncStatus(rows, 'Docs', NOW, 60);
    const projects = deriveFoleonSyncStatus(rows, 'Projects', NOW, 60);
    expect(docs.lastSuccessUtc).toBe('2026-04-24T11:30:00.000Z');
    expect(projects.lastSuccessUtc).toBe('2026-04-24T11:55:00.000Z');
  });

  it('ignores rows with unparseable timestamps', () => {
    const rows: FoleonSyncRunRow[] = [
      run({ runId: 'bad', startedUtc: 'not-a-date' }),
      run({ runId: 'good', startedUtc: '2026-04-24T11:30:00.000Z' }),
    ];
    const status = deriveFoleonSyncStatus(rows, 'Docs', NOW, 60);
    expect(status.lastSuccessUtc).toBe('2026-04-24T11:30:00.000Z');
  });

  it('throws on non-positive or non-finite threshold', () => {
    expect(() => deriveFoleonSyncStatus([], 'Docs', NOW, 0)).toThrow();
    expect(() => deriveFoleonSyncStatus([], 'Docs', NOW, -5)).toThrow();
    expect(() => deriveFoleonSyncStatus([], 'Docs', NOW, Number.NaN)).toThrow();
    expect(() => deriveFoleonSyncStatus([], 'Docs', NOW, Infinity)).toThrow();
  });
});
