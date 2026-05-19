import type { SourceListKind } from '../projection-types.js';
import { MY_PROJECTS_PROJECTION_STORAGE_LIST_TITLES } from '../storage-list-descriptor.js';
import { SharePointStateStore } from './sharepoint-state-store.js';

export type PendingWorkStatus = 'pending' | 'claimed' | 'succeeded' | 'failed' | 'dead-lettered';

export interface IPendingWorkItem {
  readonly workKey: string;
  readonly sourceListKind: SourceListKind;
  readonly debounceBucketUtc: string;
  readonly notificationBatchId?: string;
  readonly subscriptionId?: string;
  readonly notificationCount: number;
  readonly status: PendingWorkStatus;
  readonly availableAfterUtc: string;
  readonly claimedBy?: string;
  readonly claimExpiresAtUtc?: string;
  readonly attemptCount: number;
  readonly lastAttemptAtUtc?: string;
  readonly lastFailureCode?: string;
  readonly correlationId?: string;
  readonly createdAtUtc: string;
  readonly updatedAtUtc: string;
}

export type PendingWorkClaimOutcome =
  | { readonly claimed: true; readonly item: IPendingWorkItem }
  | {
      readonly claimed: false;
      readonly reason:
        | 'not-found'
        | 'status-not-claimable'
        | 'not-due'
        | 'already-claimed'
        | 'max-attempts-reached'
        | 'conflict';
    };

export type PendingWorkFailureOutcome = 'retry-scheduled' | 'dead-lettered';

function e(v: unknown): string | undefined {
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

function n(v: unknown, fallback = 0): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

function fromFields(fields: Record<string, unknown>): IPendingWorkItem {
  return {
    workKey: String(fields.WorkKey ?? ''),
    sourceListKind: String(fields.SourceListKind) as SourceListKind,
    debounceBucketUtc: String(fields.DebounceBucketUtc ?? ''),
    notificationBatchId: e(fields.NotificationBatchId),
    subscriptionId: e(fields.SubscriptionId),
    notificationCount: n(fields.NotificationCount, 1),
    status: String(fields.Status ?? 'pending') as PendingWorkStatus,
    availableAfterUtc: String(fields.AvailableAfterUtc ?? ''),
    claimedBy: e(fields.ClaimedBy),
    claimExpiresAtUtc: e(fields.ClaimExpiresAtUtc),
    attemptCount: n(fields.AttemptCount),
    lastAttemptAtUtc: e(fields.LastAttemptAtUtc),
    lastFailureCode: e(fields.LastFailureCode),
    correlationId: e(fields.CorrelationId),
    createdAtUtc: String(fields.CreatedAtUtc ?? ''),
    updatedAtUtc: String(fields.UpdatedAtUtc ?? ''),
  };
}

export class PendingWorkRepository {
  private readonly store: SharePointStateStore;
  private readonly listTitle = MY_PROJECTS_PROJECTION_STORAGE_LIST_TITLES.pendingWork;

  constructor(store: SharePointStateStore) {
    this.store = store;
  }

  async upsertDebounced(args: {
    workKey: string;
    sourceListKind: SourceListKind;
    debounceBucketUtc: string;
    notificationBatchId: string;
    subscriptionId?: string | null;
    correlationId?: string | null;
    nowUtc: string;
  }): Promise<void> {
    const row = await this.store.getByTextField({ listTitle: this.listTitle, field: 'WorkKey', value: args.workKey, select: ['WorkKey','NotificationCount'] });
    if (!row) {
      await this.store.add({
        listTitle: this.listTitle,
        fields: {
          Title: args.workKey,
          WorkKey: args.workKey,
          SourceListKind: args.sourceListKind,
          DebounceBucketUtc: args.debounceBucketUtc,
          NotificationBatchId: args.notificationBatchId,
          SubscriptionId: args.subscriptionId ?? null,
          NotificationCount: 1,
          Status: 'pending',
          AvailableAfterUtc: args.nowUtc,
          AttemptCount: 0,
          CorrelationId: args.correlationId ?? null,
          CreatedAtUtc: args.nowUtc,
          UpdatedAtUtc: args.nowUtc,
        },
      });
      return;
    }
    await this.store.update({
      listTitle: this.listTitle,
      itemId: row.id,
      fields: {
        NotificationCount: n(row.fields.NotificationCount, 1) + 1,
        NotificationBatchId: args.notificationBatchId,
        SubscriptionId: args.subscriptionId ?? null,
        CorrelationId: args.correlationId ?? null,
        UpdatedAtUtc: args.nowUtc,
      },
    });
  }

  async listDue(nowUtc: string, limit = 25): Promise<IPendingWorkItem[]> {
    const rows = await this.store.listByFilter({
      listTitle: this.listTitle,
      filter: `fields/AvailableAfterUtc le '${nowUtc}' and (fields/Status eq 'pending' or fields/Status eq 'failed')`,
      select: ['WorkKey','SourceListKind','DebounceBucketUtc','NotificationBatchId','SubscriptionId','NotificationCount','Status','AvailableAfterUtc','ClaimedBy','ClaimExpiresAtUtc','AttemptCount','LastAttemptAtUtc','LastFailureCode','CorrelationId','CreatedAtUtc','UpdatedAtUtc'],
      top: limit,
    });
    return rows.map((r) => fromFields(r.fields));
  }

  async tryClaim(args: {
    workKey: string;
    workerId: string;
    nowUtc: string;
    leaseMinutes: number;
    maxAttempts: number;
  }): Promise<PendingWorkClaimOutcome> {
    const row = await this.store.getByTextField({
      listTitle: this.listTitle,
      field: 'WorkKey',
      value: args.workKey,
      select: [
        'WorkKey',
        'SourceListKind',
        'DebounceBucketUtc',
        'NotificationBatchId',
        'SubscriptionId',
        'NotificationCount',
        'Status',
        'AvailableAfterUtc',
        'ClaimedBy',
        'ClaimExpiresAtUtc',
        'AttemptCount',
        'LastAttemptAtUtc',
        'LastFailureCode',
        'CorrelationId',
        'CreatedAtUtc',
        'UpdatedAtUtc',
      ],
    });
    if (!row) return { claimed: false, reason: 'not-found' };

    const item = fromFields(row.fields);
    const nowMs = Date.parse(args.nowUtc);
    const dueMs = Date.parse(item.availableAfterUtc);
    if (Number.isFinite(dueMs) && nowMs < dueMs) return { claimed: false, reason: 'not-due' };

    if (item.status !== 'pending' && item.status !== 'failed' && item.status !== 'claimed') {
      return { claimed: false, reason: 'status-not-claimable' };
    }

    const claimExpiresMs = Date.parse(item.claimExpiresAtUtc ?? '');
    const hasActiveClaim =
      item.status === 'claimed' &&
      item.claimedBy &&
      Number.isFinite(claimExpiresMs) &&
      nowMs < claimExpiresMs &&
      item.claimedBy !== args.workerId;
    if (hasActiveClaim) return { claimed: false, reason: 'already-claimed' };

    const nextAttemptCount = item.attemptCount + 1;
    if (nextAttemptCount > args.maxAttempts) return { claimed: false, reason: 'max-attempts-reached' };

    const latest = await this.store.getByTextField({
      listTitle: this.listTitle,
      field: 'WorkKey',
      value: args.workKey,
      select: ['WorkKey', 'UpdatedAtUtc'],
    });
    if (!latest || String(latest.fields.UpdatedAtUtc ?? '') !== item.updatedAtUtc) {
      return { claimed: false, reason: 'conflict' };
    }

    const claimExpiresAtUtc = new Date(nowMs + args.leaseMinutes * 60_000).toISOString();
    await this.store.update({
      listTitle: this.listTitle,
      itemId: row.id,
      fields: {
        Status: 'claimed',
        ClaimedBy: args.workerId,
        ClaimExpiresAtUtc: claimExpiresAtUtc,
        AttemptCount: nextAttemptCount,
        LastAttemptAtUtc: args.nowUtc,
        UpdatedAtUtc: args.nowUtc,
      },
    });
    return {
      claimed: true,
      item: {
        ...item,
        status: 'claimed',
        claimedBy: args.workerId,
        claimExpiresAtUtc,
        attemptCount: nextAttemptCount,
        lastAttemptAtUtc: args.nowUtc,
        updatedAtUtc: args.nowUtc,
      },
    };
  }

  async markSucceeded(args: { workKey: string; workerId: string; nowUtc: string }): Promise<void> {
    const row = await this.store.getByTextField({
      listTitle: this.listTitle,
      field: 'WorkKey',
      value: args.workKey,
      select: ['WorkKey', 'ClaimedBy'],
    });
    if (!row) return;
    if (String(row.fields.ClaimedBy ?? '') !== args.workerId) return;
    await this.store.update({
      listTitle: this.listTitle,
      itemId: row.id,
      fields: {
        Status: 'succeeded',
        ClaimedBy: null,
        ClaimExpiresAtUtc: null,
        LastFailureCode: null,
        UpdatedAtUtc: args.nowUtc,
      },
    });
  }

  async markFailed(args: {
    workKey: string;
    workerId: string;
    nowUtc: string;
    failureCode: string;
    maxAttempts: number;
    retryDelaySeconds: number;
  }): Promise<PendingWorkFailureOutcome | null> {
    const row = await this.store.getByTextField({
      listTitle: this.listTitle,
      field: 'WorkKey',
      value: args.workKey,
      select: ['WorkKey', 'ClaimedBy', 'AttemptCount'],
    });
    if (!row) return null;
    if (String(row.fields.ClaimedBy ?? '') !== args.workerId) return null;
    const attempts = n(row.fields.AttemptCount);
    const deadLetter = attempts >= args.maxAttempts;
    const availableAfterUtc = new Date(
      Date.parse(args.nowUtc) + Math.max(args.retryDelaySeconds, 1) * 1000,
    ).toISOString();
    await this.store.update({
      listTitle: this.listTitle,
      itemId: row.id,
      fields: {
        Status: deadLetter ? 'dead-lettered' : 'failed',
        ClaimedBy: null,
        ClaimExpiresAtUtc: null,
        LastFailureCode: args.failureCode,
        AvailableAfterUtc: deadLetter ? args.nowUtc : availableAfterUtc,
        UpdatedAtUtc: args.nowUtc,
      },
    });
    return deadLetter ? 'dead-lettered' : 'retry-scheduled';
  }
}
