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
}
