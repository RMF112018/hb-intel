import type { TableClient } from '@azure/data-tables';
import { describe, expect, it } from 'vitest';
import {
  ProjectionRunRepository,
  sanitizeProjectionRunNotes,
} from '../my-projects-projection/state/run-repository.js';

interface FakeRow {
  partitionKey: string;
  rowKey: string;
  etag: string;
  data: Record<string, unknown>;
}

function createFakeTableClient(): { rows: Map<string, FakeRow>; client: TableClient } {
  const rows = new Map<string, FakeRow>();
  let etagSeq = 0;
  const key = (pk: string, rk: string) => `${pk}|${rk}`;
  const fake = {
    createTable: async () => undefined,
    createEntity: async (entity: Record<string, unknown>) => {
      const k = key(entity.partitionKey as string, entity.rowKey as string);
      if (rows.has(k)) {
        const err = new Error('conflict') as Error & { statusCode: number };
        err.statusCode = 409;
        throw err;
      }
      etagSeq += 1;
      rows.set(k, {
        partitionKey: entity.partitionKey as string,
        rowKey: entity.rowKey as string,
        etag: `W/"etag-${etagSeq}"`,
        data: { ...entity },
      });
    },
    getEntity: async <T>(pk: string, rk: string): Promise<T> => {
      const row = rows.get(key(pk, rk));
      if (!row) {
        const err = new Error('not found') as Error & { statusCode: number };
        err.statusCode = 404;
        throw err;
      }
      return { ...row.data, etag: row.etag } as unknown as T;
    },
    updateEntity: async (entity: Record<string, unknown>, mode: unknown) => {
      const k = key(entity.partitionKey as string, entity.rowKey as string);
      const existing = rows.get(k);
      if (!existing) {
        const err = new Error('not found') as Error & { statusCode: number };
        err.statusCode = 404;
        throw err;
      }
      etagSeq += 1;
      const merged = mode === 'Merge' ? { ...existing.data, ...entity } : { ...entity };
      rows.set(k, {
        partitionKey: existing.partitionKey,
        rowKey: existing.rowKey,
        etag: `W/"etag-${etagSeq}"`,
        data: merged,
      });
    },
    listEntities: <T>() => {
      const snapshot = [...rows.values()].map((row) => ({ ...row.data, etag: row.etag }));
      return {
        async *[Symbol.asyncIterator]() {
          for (const entry of snapshot) yield entry as T;
        },
      } as unknown as AsyncIterableIterator<T>;
    },
  };
  return { rows, client: fake as unknown as TableClient };
}

describe('sanitizeProjectionRunNotes', () => {
  it('returns undefined for empty input', () => {
    expect(sanitizeProjectionRunNotes(undefined)).toBeUndefined();
    expect(sanitizeProjectionRunNotes('')).toBeUndefined();
  });

  it('redacts Bearer-prefixed tokens', () => {
    const result = sanitizeProjectionRunNotes(
      'Auth header was Bearer eyJabcdefghijklmnopqrstu1234567890ABCDEFGH',
    );
    expect(result).toContain('[REDACTED]');
    expect(result).not.toContain('eyJabcdef');
    expect(result).not.toMatch(/Bearer /);
  });

  it('redacts long base64-url runs (potential tokens)', () => {
    const longish = 'a'.repeat(50);
    const result = sanitizeProjectionRunNotes(`failure: token=${longish}`);
    expect(result).toContain('[REDACTED]');
    expect(result).not.toContain(longish);
  });

  it('keeps short readable values intact', () => {
    expect(sanitizeProjectionRunNotes('Drift detected on row 42')).toBe('Drift detected on row 42');
  });
});

describe('ProjectionRunRepository.start', () => {
  it('creates a Status=running row at the canonical RowKey', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionRunRepository({ client: fake.client });
    const { rowKey } = await repo.start({
      runId: '1111',
      runType: 'incremental',
      startedAtUtc: '2026-05-17T12:00:00.000Z',
      sourceListKind: 'Projects',
      projectionBatchId: 'inc-1',
    });
    expect(rowKey).toBe('Run:2026-05-17T12:00:00.000Z:1111');
    const stored = fake.rows.get(`MyProjectsProjection|${rowKey}`);
    expect(stored?.data.Status).toBe('running');
    expect(stored?.data.RunType).toBe('incremental');
    expect(stored?.data.SourceListKind).toBe('Projects');
    expect(stored?.data.ProjectionBatchId).toBe('inc-1');
  });
});

describe('ProjectionRunRepository.finalize', () => {
  it('merges terminal status, counts, and sanitized notes', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionRunRepository({ client: fake.client });
    const { rowKey } = await repo.start({
      runId: '2222',
      runType: 'seed',
      startedAtUtc: '2026-05-17T13:00:00.000Z',
    });
    await repo.finalize({
      rowKey,
      status: 'succeeded',
      completedAtUtc: '2026-05-17T13:05:00.000Z',
      counts: {
        ChangedItemCount: 100,
        HelperRowsInserted: 90,
        HelperRowsUpdated: 10,
        HelperRowsDeactivated: 5,
      },
      notes: 'Seed completed cleanly.',
    });
    const stored = fake.rows.get(`MyProjectsProjection|${rowKey}`);
    expect(stored?.data.Status).toBe('succeeded');
    expect(stored?.data.CompletedAtUtc).toBe('2026-05-17T13:05:00.000Z');
    expect(stored?.data.ChangedItemCount).toBe(100);
    expect(stored?.data.HelperRowsInserted).toBe(90);
    expect(stored?.data.HelperRowsUpdated).toBe(10);
    expect(stored?.data.HelperRowsDeactivated).toBe(5);
    expect(stored?.data.Notes).toBe('Seed completed cleanly.');
  });

  it('redacts token-shaped notes before writing', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionRunRepository({ client: fake.client });
    const { rowKey } = await repo.start({
      runId: '3333',
      runType: 'incremental',
      startedAtUtc: '2026-05-17T14:00:00.000Z',
    });
    await repo.finalize({
      rowKey,
      status: 'failed',
      completedAtUtc: '2026-05-17T14:00:30.000Z',
      failureCode: 'graph-5xx',
      notes: 'Bearer eyJabcdefghijklmnopqrstu1234567890ABCDEFGH',
    });
    const stored = fake.rows.get(`MyProjectsProjection|${rowKey}`);
    expect(String(stored?.data.Notes)).toContain('[REDACTED]');
    expect(String(stored?.data.Notes)).not.toContain('eyJabcdef');
    expect(stored?.data.FailureCode).toBe('graph-5xx');
  });
});

describe('ProjectionRunRepository.listRecent', () => {
  it('returns rows in descending RowKey order filtered by runType', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionRunRepository({ client: fake.client });
    await repo.start({
      runId: 'a',
      runType: 'incremental',
      startedAtUtc: '2026-05-17T12:00:00.000Z',
      sourceListKind: 'Projects',
    });
    await repo.start({
      runId: 'b',
      runType: 'incremental',
      startedAtUtc: '2026-05-17T12:01:00.000Z',
      sourceListKind: 'Projects',
    });
    await repo.start({
      runId: 'c',
      runType: 'seed',
      startedAtUtc: '2026-05-17T12:02:00.000Z',
    });
    const incrementals = await repo.listRecent({ runType: 'incremental', limit: 10 });
    expect(incrementals.map((entry) => entry.RunId)).toEqual(['b', 'a']);
  });

  it('limits the response', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionRunRepository({ client: fake.client });
    for (let i = 0; i < 5; i += 1) {
      await repo.start({
        runId: `run-${i}`,
        runType: 'drift-audit',
        startedAtUtc: `2026-05-17T12:0${i}:00.000Z`,
      });
    }
    const out = await repo.listRecent({ runType: 'drift-audit', limit: 2 });
    expect(out).toHaveLength(2);
    expect(out[0].RunId).toBe('run-4');
    expect(out[1].RunId).toBe('run-3');
  });

  it('rejects non-positive limit', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionRunRepository({ client: fake.client });
    await expect(repo.listRecent({ limit: 0 })).rejects.toThrow(RangeError);
  });

  it('filters by sourceListKind', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionRunRepository({ client: fake.client });
    await repo.start({
      runId: 'p1',
      runType: 'incremental',
      startedAtUtc: '2026-05-17T12:00:00.000Z',
      sourceListKind: 'Projects',
    });
    await repo.start({
      runId: 'l1',
      runType: 'incremental',
      startedAtUtc: '2026-05-17T12:01:00.000Z',
      sourceListKind: 'LegacyRegistry',
    });
    const out = await repo.listRecent({ sourceListKind: 'LegacyRegistry', limit: 5 });
    expect(out.map((entry) => entry.RunId)).toEqual(['l1']);
  });
});

describe('ProjectionRunRepository.appendNotes', () => {
  it('appends sanitized notes to an existing run row', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionRunRepository({ client: fake.client });
    const { rowKey } = await repo.start({
      runId: '9999',
      runType: 'manual-rebuild',
      startedAtUtc: '2026-05-17T15:00:00.000Z',
    });
    await repo.appendNotes({ rowKey, additionalNotes: 'first note' });
    await repo.appendNotes({ rowKey, additionalNotes: 'second note' });
    const stored = fake.rows.get(`MyProjectsProjection|${rowKey}`);
    expect(String(stored?.data.Notes)).toBe('first note\nsecond note');
  });

  it('no-ops when the row does not exist', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionRunRepository({ client: fake.client });
    await expect(
      repo.appendNotes({
        rowKey: 'Run:2026-05-17T12:00:00.000Z:missing',
        additionalNotes: 'x',
      }),
    ).resolves.toBeUndefined();
  });
});
