import type { TableClient } from '@azure/data-tables';
import { describe, expect, it } from 'vitest';
import {
  DeltaStateAlreadyInitializedError,
  DeltaStateConcurrencyError,
  ProjectionDeltaStateRepository,
} from '../my-projects-projection/state/delta-state-repository.js';

interface FakeRow {
  partitionKey: string;
  rowKey: string;
  etag: string;
  data: Record<string, unknown>;
}

function createFakeTableClient(): {
  rows: Map<string, FakeRow>;
  client: TableClient;
} {
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
    updateEntity: async (
      entity: Record<string, unknown>,
      _mode: unknown,
      opts?: { etag?: string },
    ) => {
      const k = key(entity.partitionKey as string, entity.rowKey as string);
      const existing = rows.get(k);
      if (!existing) {
        const err = new Error('not found') as Error & { statusCode: number };
        err.statusCode = 404;
        throw err;
      }
      if (opts?.etag !== undefined && opts.etag !== existing.etag) {
        const err = new Error('etag mismatch') as Error & { statusCode: number };
        err.statusCode = 412;
        throw err;
      }
      etagSeq += 1;
      rows.set(k, {
        partitionKey: existing.partitionKey,
        rowKey: existing.rowKey,
        etag: `W/"etag-${etagSeq}"`,
        data: { ...entity },
      });
    },
  };
  return { rows, client: fake as unknown as TableClient };
}

describe('ProjectionDeltaStateRepository', () => {
  it('initializeBaseline succeeds on first call', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionDeltaStateRepository({ client: fake.client });
    await repo.initializeBaseline({
      sourceListKind: 'Projects',
      deltaLink: 'https://graph/delta/token=latest',
      batchId: 'seed-1',
      atUtc: '2026-05-17T00:00:00.000Z',
    });
    const got = await repo.get('Projects');
    expect(got?.DeltaLink).toBe('https://graph/delta/token=latest');
    expect(got?.NeedsResync).toBe(false);
    expect(got?.LastProjectionBatchId).toBe('seed-1');
  });

  it('initializeBaseline throws DeltaStateAlreadyInitializedError on second call', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionDeltaStateRepository({ client: fake.client });
    await repo.initializeBaseline({
      sourceListKind: 'Projects',
      deltaLink: 'link-a',
      batchId: 'seed-1',
      atUtc: '2026-05-17T00:00:00.000Z',
    });
    await expect(
      repo.initializeBaseline({
        sourceListKind: 'Projects',
        deltaLink: 'link-b',
        batchId: 'seed-2',
        atUtc: '2026-05-17T00:01:00.000Z',
      }),
    ).rejects.toBeInstanceOf(DeltaStateAlreadyInitializedError);
  });

  it('advanceCheckpoint writes new deltaLink + counts under correct ETag', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionDeltaStateRepository({ client: fake.client });
    await repo.initializeBaseline({
      sourceListKind: 'Projects',
      deltaLink: 'link-a',
      batchId: 'seed-1',
      atUtc: '2026-05-17T00:00:00.000Z',
    });
    const stored = fake.rows.get('MyProjectsProjection|DeltaState:Projects');
    expect(stored).toBeDefined();
    await repo.advanceCheckpoint({
      sourceListKind: 'Projects',
      deltaLink: 'link-b',
      changedCount: 3,
      deletedCount: 1,
      batchId: 'inc-1',
      atUtc: '2026-05-17T00:01:00.000Z',
      expectedEtag: stored!.etag,
    });
    const got = await repo.get('Projects');
    expect(got?.DeltaLink).toBe('link-b');
    expect(got?.LastChangedItemCount).toBe(3);
    expect(got?.LastDeletedItemCount).toBe(1);
    expect(got?.LastProjectionBatchId).toBe('inc-1');
  });

  it('advanceCheckpoint with stale ETag throws DeltaStateConcurrencyError carrying latest', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionDeltaStateRepository({ client: fake.client });
    await repo.initializeBaseline({
      sourceListKind: 'Projects',
      deltaLink: 'link-a',
      batchId: 'seed-1',
      atUtc: '2026-05-17T00:00:00.000Z',
    });
    let thrown: unknown;
    try {
      await repo.advanceCheckpoint({
        sourceListKind: 'Projects',
        deltaLink: 'link-b',
        changedCount: 1,
        deletedCount: 0,
        batchId: 'inc-1',
        atUtc: '2026-05-17T00:01:00.000Z',
        expectedEtag: 'W/"etag-NOPE"',
      });
    } catch (err: unknown) {
      thrown = err;
    }
    expect(thrown).toBeInstanceOf(DeltaStateConcurrencyError);
    const conflict = thrown as DeltaStateConcurrencyError;
    expect(conflict.sourceListKind).toBe('Projects');
    expect(conflict.latest?.DeltaLink).toBe('link-a');
  });

  it('markNeedsResync preserves prior DeltaLink and stamps failure code', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionDeltaStateRepository({ client: fake.client });
    await repo.initializeBaseline({
      sourceListKind: 'Projects',
      deltaLink: 'link-a',
      batchId: 'seed-1',
      atUtc: '2026-05-17T00:00:00.000Z',
    });
    const stored = fake.rows.get('MyProjectsProjection|DeltaState:Projects');
    await repo.markNeedsResync({
      sourceListKind: 'Projects',
      failureCode: 'delta-token-expired-or-invalid',
      atUtc: '2026-05-17T00:01:00.000Z',
      expectedEtag: stored!.etag,
    });
    const got = await repo.get('Projects');
    expect(got?.NeedsResync).toBe(true);
    expect(got?.DeltaLink).toBe('link-a');
    expect(got?.LastFailureCode).toBe('delta-token-expired-or-invalid');
    expect(got?.LastDeltaPullFailedUtc).toBe('2026-05-17T00:01:00.000Z');
  });

  it('clearNeedsResync flips NeedsResync=false and adopts new deltaLink', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionDeltaStateRepository({ client: fake.client });
    await repo.initializeBaseline({
      sourceListKind: 'Projects',
      deltaLink: 'link-a',
      batchId: 'seed-1',
      atUtc: '2026-05-17T00:00:00.000Z',
    });
    let stored = fake.rows.get('MyProjectsProjection|DeltaState:Projects');
    await repo.markNeedsResync({
      sourceListKind: 'Projects',
      failureCode: 'delta-token-expired-or-invalid',
      atUtc: '2026-05-17T00:01:00.000Z',
      expectedEtag: stored!.etag,
    });
    stored = fake.rows.get('MyProjectsProjection|DeltaState:Projects');
    await repo.clearNeedsResync({
      sourceListKind: 'Projects',
      deltaLink: 'link-c',
      batchId: 'rebuild-1',
      atUtc: '2026-05-17T01:00:00.000Z',
      expectedEtag: stored!.etag,
    });
    const got = await repo.get('Projects');
    expect(got?.NeedsResync).toBe(false);
    expect(got?.DeltaLink).toBe('link-c');
    expect(got?.LastProjectionBatchId).toBe('rebuild-1');
    expect(got?.LastFailureCode).toBeUndefined();
  });

  it('markFailure throws if delta state is not initialized', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionDeltaStateRepository({ client: fake.client });
    await expect(
      repo.markFailure({
        sourceListKind: 'Projects',
        failureCode: 'graph-5xx',
        atUtc: '2026-05-17T00:01:00.000Z',
        expectedEtag: 'W/"etag-x"',
      }),
    ).rejects.toThrow(/not initialized/);
  });
});
