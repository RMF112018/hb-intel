import type { IProjectionSubscriptionEntity, ProjectionSubscriptionStatus } from '../projection-state-entities.js';
import type { SourceListKind } from '../projection-types.js';
import { MY_PROJECTS_PROJECTION_STORAGE_LIST_TITLES } from '../storage-list-descriptor.js';
import { SharePointStateStore } from './sharepoint-state-store.js';

function empty(v: unknown): string | undefined {
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

function fromRow(fields: Record<string, unknown>): IProjectionSubscriptionEntity {
  const kind = String(fields.SourceListKind) as SourceListKind;
  return {
    partitionKey: 'MyProjectsProjection',
    rowKey: `Subscription:${kind}`,
    SourceListKind: kind,
    SourceSiteId: String(fields.SourceSiteId ?? ''),
    SourceListId: String(fields.SourceListId ?? ''),
    SubscriptionId: empty(fields.SubscriptionId),
    Resource: empty(fields.Resource),
    NotificationUrl: empty(fields.NotificationUrl),
    ExpirationDateTimeUtc: empty(fields.ExpirationDateTimeUtc),
    Status: String(fields.Status ?? 'missing') as ProjectionSubscriptionStatus,
    LastCreateAttemptUtc: empty(fields.LastCreateAttemptUtc),
    LastRenewalAttemptUtc: empty(fields.LastRenewalAttemptUtc),
    LastRenewalSuccessUtc: empty(fields.LastRenewalSuccessUtc),
    LastFailureCode: empty(fields.LastFailureCode),
    LastFailureAtUtc: empty(fields.LastFailureAtUtc),
  };
}

export class SharePointProjectionSubscriptionStateRepository {
  private readonly store: SharePointStateStore;
  private readonly listTitle = MY_PROJECTS_PROJECTION_STORAGE_LIST_TITLES.subscriptionState;

  constructor(store: SharePointStateStore) {
    this.store = store;
  }

  async get(sourceListKind: SourceListKind): Promise<IProjectionSubscriptionEntity | null> {
    const row = await this.store.getByTextField({
      listTitle: this.listTitle,
      field: 'SourceListKind',
      value: sourceListKind,
      select: [
        'SourceListKind','SourceSiteId','SourceListId','SubscriptionId','Resource','NotificationUrl','ExpirationDateTimeUtc',
        'Status','LastCreateAttemptUtc','LastRenewalAttemptUtc','LastRenewalSuccessUtc','LastFailureCode','LastFailureAtUtc',
      ],
    });
    return row ? fromRow(row.fields) : null;
  }

  async upsert(entity: IProjectionSubscriptionEntity): Promise<void> {
    const existing = await this.store.getByTextField({
      listTitle: this.listTitle,
      field: 'SourceListKind',
      value: entity.SourceListKind,
      select: ['SourceListKind'],
    });
    const patch = {
      Title: entity.SourceListKind,
      SourceListKind: entity.SourceListKind,
      SourceSiteId: entity.SourceSiteId,
      SourceListId: entity.SourceListId,
      SubscriptionId: entity.SubscriptionId ?? null,
      Resource: entity.Resource ?? null,
      NotificationUrl: entity.NotificationUrl ?? null,
      ExpirationDateTimeUtc: entity.ExpirationDateTimeUtc ?? null,
      Status: entity.Status,
      LastCreateAttemptUtc: entity.LastCreateAttemptUtc ?? null,
      LastRenewalAttemptUtc: entity.LastRenewalAttemptUtc ?? null,
      LastRenewalSuccessUtc: entity.LastRenewalSuccessUtc ?? null,
      LastFailureCode: entity.LastFailureCode ?? null,
      LastFailureAtUtc: entity.LastFailureAtUtc ?? null,
      UpdatedAtUtc: new Date().toISOString(),
    };
    if (!existing) {
      await this.store.add({ listTitle: this.listTitle, fields: patch });
      return;
    }
    await this.store.update({ listTitle: this.listTitle, itemId: existing.id, fields: patch });
  }

  async list(): Promise<IProjectionSubscriptionEntity[]> {
    const rows = await this.store.listByFilter({
      listTitle: this.listTitle,
      filter: "fields/SourceListKind ne ''",
      select: [
        'SourceListKind','SourceSiteId','SourceListId','SubscriptionId','Resource','NotificationUrl','ExpirationDateTimeUtc',
        'Status','LastCreateAttemptUtc','LastRenewalAttemptUtc','LastRenewalSuccessUtc','LastFailureCode','LastFailureAtUtc',
      ],
      top: 500,
    });
    return rows.map((r) => fromRow(r.fields));
  }

  async recordSuccessfulCreate(args: { sourceListKind: SourceListKind; sourceSiteId: string; sourceListId: string; subscriptionId: string; resource: string; notificationUrl: string; expirationDateTimeUtc: string; atUtc: string; }): Promise<void> {
    await this.upsert({
      partitionKey: 'MyProjectsProjection',
      rowKey: `Subscription:${args.sourceListKind}`,
      SourceListKind: args.sourceListKind,
      SourceSiteId: args.sourceSiteId,
      SourceListId: args.sourceListId,
      SubscriptionId: args.subscriptionId,
      Resource: args.resource,
      NotificationUrl: args.notificationUrl,
      ExpirationDateTimeUtc: args.expirationDateTimeUtc,
      Status: 'healthy',
      LastCreateAttemptUtc: args.atUtc,
      LastRenewalSuccessUtc: args.atUtc,
    });
  }

  async recordSuccessfulRenewal(args: { sourceListKind: SourceListKind; expirationDateTimeUtc: string; atUtc: string; }): Promise<void> {
    const existing = await this.get(args.sourceListKind);
    if (!existing) throw new Error(`Subscription state for source list '${args.sourceListKind}' not found; cannot record renewal.`);
    await this.upsert({
      ...existing,
      Status: 'healthy',
      ExpirationDateTimeUtc: args.expirationDateTimeUtc,
      LastRenewalAttemptUtc: args.atUtc,
      LastRenewalSuccessUtc: args.atUtc,
      LastFailureCode: undefined,
      LastFailureAtUtc: undefined,
    });
  }

  async recordFailure(args: { sourceListKind: SourceListKind; failureCode: string; atUtc: string; status?: ProjectionSubscriptionStatus; }): Promise<void> {
    const existing = await this.get(args.sourceListKind);
    if (!existing) {
      await this.upsert({
        partitionKey: 'MyProjectsProjection',
        rowKey: `Subscription:${args.sourceListKind}`,
        SourceListKind: args.sourceListKind,
        SourceSiteId: '',
        SourceListId: '',
        Status: args.status ?? 'failed',
        LastFailureCode: args.failureCode,
        LastFailureAtUtc: args.atUtc,
        LastRenewalAttemptUtc: args.atUtc,
      });
      return;
    }
    await this.upsert({
      ...existing,
      Status: args.status ?? 'failed',
      LastFailureCode: args.failureCode,
      LastFailureAtUtc: args.atUtc,
      LastRenewalAttemptUtc: args.atUtc,
    });
  }
}
