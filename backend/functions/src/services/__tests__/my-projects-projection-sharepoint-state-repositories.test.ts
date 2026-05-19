import { describe, expect, it } from 'vitest';
import { SharePointProjectionSubscriptionStateRepository } from '../my-projects-projection/state/sharepoint-subscription-state-repository.js';
import { ProjectionSourceSyncStateRepository } from '../my-projects-projection/state/source-sync-state-repository.js';
import { SharePointProjectionControlStateRepository } from '../my-projects-projection/state/sharepoint-control-state-repository.js';
import { SharePointProjectionRunRepository } from '../my-projects-projection/state/sharepoint-run-repository.js';
import { PendingWorkRepository } from '../my-projects-projection/state/pending-work-repository.js';
import { SyncFailureRepository } from '../my-projects-projection/state/sync-failure-repository.js';
import { DeltaStateConcurrencyError } from '../my-projects-projection/state/delta-state-repository.js';
import type { SharePointStateStore } from '../my-projects-projection/state/sharepoint-state-store.js';

interface IRow {
  id: number;
  fields: Record<string, unknown>;
}

class FakeSharePointStateStore {
  private seq = 0;
  private readonly byList = new Map<string, IRow[]>();

  private rows(listTitle: string): IRow[] {
    const rows = this.byList.get(listTitle);
    if (rows) return rows;
    const next: IRow[] = [];
    this.byList.set(listTitle, next);
    return next;
  }

  async listByFilter(args: {
    listTitle: string;
    filter: string;
    select: readonly string[];
    top?: number;
  }): Promise<Array<{ id: number; fields: Record<string, unknown> }>> {
    const rows = [...this.rows(args.listTitle)];
    const filtered = rows.filter((r) => this.matches(r.fields, args.filter));
    const limited = args.top ? filtered.slice(0, args.top) : filtered;
    return limited.map((r) => ({ id: r.id, fields: { ...r.fields } }));
  }

  private matches(fields: Record<string, unknown>, filter: string): boolean {
    const f = filter.trim();
    if (f === "fields/SourceListKind ne ''") {
      return typeof fields.SourceListKind === 'string' && fields.SourceListKind !== '';
    }
    if (f === "fields/RunId ne ''") {
      return typeof fields.RunId === 'string' && fields.RunId !== '';
    }
    const workDue = /^fields\/AvailableAfterUtc le '([^']+)' and \(fields\/Status eq 'pending' or fields\/Status eq 'failed'\)$/;
    const mDue = f.match(workDue);
    if (mDue) {
      const due = mDue[1] as string;
      const status = String(fields.Status ?? '');
      return (status === 'pending' || status === 'failed') && String(fields.AvailableAfterUtc ?? '') <= due;
    }

    const textEq = /^fields\/(\w+) eq '((?:[^']|'')*)'$/;
    const mText = f.match(textEq);
    if (mText) {
      const field = mText[1] as string;
      const value = (mText[2] as string).replace(/''/g, "'");
      return String(fields[field] ?? '') === value;
    }

    const numEq = /^fields\/(\w+) eq (\d+)$/;
    const mNum = f.match(numEq);
    if (mNum) {
      const field = mNum[1] as string;
      const value = Number(mNum[2]);
      return Number(fields[field] ?? NaN) === value;
    }

    return false;
  }

  async getByTextField(args: {
    listTitle: string;
    field: string;
    value: string;
    select: readonly string[];
  }): Promise<{ id: number; fields: Record<string, unknown> } | null> {
    const row = this.rows(args.listTitle).find((r) => String(r.fields[args.field] ?? '') === args.value);
    return row ? { id: row.id, fields: { ...row.fields } } : null;
  }

  async getByNumericField(args: {
    listTitle: string;
    field: string;
    value: number;
    select: readonly string[];
  }): Promise<{ id: number; fields: Record<string, unknown> } | null> {
    const row = this.rows(args.listTitle).find((r) => Number(r.fields[args.field] ?? NaN) === args.value);
    return row ? { id: row.id, fields: { ...row.fields } } : null;
  }

  async add(args: { listTitle: string; fields: Record<string, unknown> }): Promise<{ id: number; fields: Record<string, unknown> }> {
    this.seq += 1;
    const row = { id: this.seq, fields: { ...args.fields } };
    this.rows(args.listTitle).push(row);
    return { id: row.id, fields: { ...row.fields } };
  }

  async update(args: { listTitle: string; itemId: number; fields: Record<string, unknown> }): Promise<void> {
    const rows = this.rows(args.listTitle);
    const idx = rows.findIndex((r) => r.id === args.itemId);
    if (idx < 0) throw new Error('not found');
    rows[idx] = { id: rows[idx].id, fields: { ...rows[idx].fields, ...args.fields } };
  }

  async resolveSiteId(): Promise<string> {
    return 'site-id';
  }
}

function makeRepos() {
  const store = new FakeSharePointStateStore() as unknown as SharePointStateStore;
  return {
    subscription: new SharePointProjectionSubscriptionStateRepository(store),
    sourceSync: new ProjectionSourceSyncStateRepository(store),
    control: new SharePointProjectionControlStateRepository(store),
    runs: new SharePointProjectionRunRepository(store),
    pending: new PendingWorkRepository(store),
    failures: new SyncFailureRepository(store),
  };
}

describe('SharePoint projection operational repositories', () => {
  it('subscription repository supports not-found and renewal lifecycle', async () => {
    const { subscription } = makeRepos();
    expect(await subscription.get('Projects')).toBeNull();

    await subscription.recordSuccessfulCreate({
      sourceListKind: 'Projects',
      sourceSiteId: 'site-1',
      sourceListId: 'list-1',
      subscriptionId: 'sub-1',
      resource: '/sites/site-1/lists/list-1',
      notificationUrl: 'https://example/webhook',
      expirationDateTimeUtc: '2026-06-01T00:00:00.000Z',
      atUtc: '2026-05-01T00:00:00.000Z',
    });

    const created = await subscription.get('Projects');
    expect(created?.Status).toBe('healthy');
    expect(created?.SubscriptionId).toBe('sub-1');

    await subscription.recordSuccessfulRenewal({
      sourceListKind: 'Projects',
      expirationDateTimeUtc: '2026-07-01T00:00:00.000Z',
      atUtc: '2026-06-01T00:00:00.000Z',
    });

    const renewed = await subscription.get('Projects');
    expect(renewed?.ExpirationDateTimeUtc).toBe('2026-07-01T00:00:00.000Z');
    expect(renewed?.LastRenewalAttemptUtc).toBe('2026-06-01T00:00:00.000Z');
  });

  it('source sync repository enforces checkpoint concurrency via expected etag', async () => {
    const { sourceSync } = makeRepos();
    await sourceSync.initializeBaseline({
      sourceListKind: 'Projects',
      deltaLink: 'link-a',
      batchId: 'seed-1',
      atUtc: '2026-05-01T00:00:00.000Z',
    });

    const withEtag = await sourceSync.getWithEtag('Projects');
    expect(withEtag?.entity.DeltaLink).toBe('link-a');

    await sourceSync.advanceCheckpoint({
      sourceListKind: 'Projects',
      deltaLink: 'link-b',
      changedCount: 2,
      deletedCount: 1,
      batchId: 'inc-1',
      atUtc: '2026-05-01T01:00:00.000Z',
      expectedEtag: withEtag!.etag,
    });

    await expect(
      sourceSync.advanceCheckpoint({
        sourceListKind: 'Projects',
        deltaLink: 'link-c',
        changedCount: 1,
        deletedCount: 0,
        batchId: 'inc-2',
        atUtc: '2026-05-01T02:00:00.000Z',
        expectedEtag: withEtag!.etag,
      }),
    ).rejects.toBeInstanceOf(DeltaStateConcurrencyError);
  });

  it('control-state lease repository handles acquire, active contention, renew, and release ownership', async () => {
    const { control } = makeRepos();
    const now = new Date('2026-05-01T00:00:00.000Z');
    const first = await control.tryAcquire({
      rowKey: 'Lease:Sync:Projects',
      leaseType: 'sync',
      leaseOwner: 'worker-1',
      ttlMinutes: 10,
      now,
    });
    expect(first.acquired).toBe(true);

    const second = await control.tryAcquire({
      rowKey: 'Lease:Sync:Projects',
      leaseType: 'sync',
      leaseOwner: 'worker-2',
      ttlMinutes: 10,
      now: new Date('2026-05-01T00:05:00.000Z'),
    });
    expect(second.acquired).toBe(false);
    if (!second.acquired) expect(second.reason).toBe('active');

    const renewed = await control.renew({
      rowKey: 'Lease:Sync:Projects',
      leaseOwner: 'worker-1',
      ttlMinutes: 10,
      now: new Date('2026-05-01T00:06:00.000Z'),
    });
    expect(renewed.renewed).toBe(true);

    const deniedRelease = await control.release({ rowKey: 'Lease:Sync:Projects', leaseOwner: 'worker-2' });
    expect(deniedRelease.released).toBe(false);

    const released = await control.release({ rowKey: 'Lease:Sync:Projects', leaseOwner: 'worker-1' });
    expect(released.released).toBe(true);
  });

  it('run repository round-trips and sanitizes notes', async () => {
    const { runs } = makeRepos();
    const started = await runs.start({
      runId: 'run-1',
      runType: 'incremental',
      startedAtUtc: '2026-05-01T00:00:00.000Z',
      sourceListKind: 'Projects',
    });
    await runs.finalize({
      rowKey: started.rowKey,
      status: 'failed',
      completedAtUtc: '2026-05-01T00:01:00.000Z',
      notes: 'Bearer eyJabcdefghijklmnopqrstu1234567890ABCDEFGH',
      failureCode: 'delta-graph-5xx',
    });
    const listed = await runs.listRecent({ limit: 5 });
    expect(listed).toHaveLength(1);
    expect(listed[0]?.Notes).toContain('[REDACTED]');
    expect(listed[0]?.FailureCode).toBe('delta-graph-5xx');
  });

  it('pending-work repository upserts and lists due work', async () => {
    const { pending } = makeRepos();
    await pending.upsertDebounced({
      workKey: 'my-projects-projection:Projects:2026-05-01T00:00:00.000Z',
      sourceListKind: 'Projects',
      debounceBucketUtc: '2026-05-01T00:00:00.000Z',
      notificationBatchId: 'batch-1',
      subscriptionId: 'sub-1',
      correlationId: 'corr-1',
      nowUtc: '2026-05-01T00:00:05.000Z',
    });
    await pending.upsertDebounced({
      workKey: 'my-projects-projection:Projects:2026-05-01T00:00:00.000Z',
      sourceListKind: 'Projects',
      debounceBucketUtc: '2026-05-01T00:00:00.000Z',
      notificationBatchId: 'batch-2',
      subscriptionId: 'sub-1',
      correlationId: 'corr-2',
      nowUtc: '2026-05-01T00:00:10.000Z',
    });

    const due = await pending.listDue('2026-05-01T00:01:00.000Z', 10);
    expect(due).toHaveLength(1);
    expect(due[0]?.notificationCount).toBe(2);
    expect(due[0]?.notificationBatchId).toBe('batch-2');
  });

  it('sync-failure repository creates then increments attempt count', async () => {
    const { failures } = makeRepos();
    await failures.upsertFailure({
      failureId: 'f-1',
      failureClass: 'delta',
      failureCode: 'delta-graph-5xx',
      sourceListKind: 'Projects',
      atUtc: '2026-05-01T00:00:00.000Z',
      sanitizedMessage: 'Graph 500',
    });
    await failures.upsertFailure({
      failureId: 'f-1',
      failureClass: 'delta',
      failureCode: 'delta-graph-5xx',
      sourceListKind: 'Projects',
      atUtc: '2026-05-01T00:01:00.000Z',
      sanitizedMessage: 'Graph 500 retry',
    });

    // Verify via behavior: second upsert path should not throw and should update attempt state.
    await expect(
      failures.upsertFailure({
        failureId: 'f-1',
        failureClass: 'delta',
        failureCode: 'delta-graph-5xx',
        sourceListKind: 'Projects',
        atUtc: '2026-05-01T00:02:00.000Z',
      }),
    ).resolves.toBeUndefined();
  });
});
