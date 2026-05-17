/**
 * My Projects projection — Graph subscription state repository.
 *
 * Table: `MyProjectsProjectionSubscriptions`.
 * PartitionKey: `'MyProjectsProjection'`. RowKey: `Subscription:{SourceListKind}`.
 *
 * Stores the latest known state for each of the two source-list Graph
 * subscriptions (Projects, LegacyRegistry). Used by the daily renewal timer
 * and the webhook ingress to classify source-list kind from subscription ID.
 *
 * No JWTs, raw assertions, bearer tokens, or webhook clientState are stored
 * here — only sanitized closed-set failure codes and ISO timestamps.
 */

import { type TableClient, type TableEntity } from '@azure/data-tables';
import {
  PROJECTION_STATE_PARTITION_KEY,
  type IProjectionSubscriptionEntity,
  type ProjectionSubscriptionStatus,
} from '../projection-state-entities.js';
import type { SourceListKind } from '../projection-types.js';
import {
  PROJECTION_DEFAULT_SUBSCRIPTIONS_TABLE,
  createProjectionTableClient,
  ensureProjectionTable,
} from './projection-table-client-factory.js';

function subscriptionRowKey(sourceListKind: SourceListKind): `Subscription:${SourceListKind}` {
  return `Subscription:${sourceListKind}`;
}

interface ISubscriptionTableEntity {
  partitionKey: string;
  rowKey: string;
  SourceListKind: SourceListKind;
  SourceSiteId: string;
  SourceListId: string;
  SubscriptionId: string;
  Resource: string;
  NotificationUrl: string;
  ExpirationDateTimeUtc: string;
  Status: ProjectionSubscriptionStatus;
  LastCreateAttemptUtc: string;
  LastRenewalAttemptUtc: string;
  LastRenewalSuccessUtc: string;
  LastFailureCode: string;
  LastFailureAtUtc: string;
}

function serializeSubscription(entity: IProjectionSubscriptionEntity): ISubscriptionTableEntity {
  return {
    partitionKey: entity.partitionKey,
    rowKey: entity.rowKey,
    SourceListKind: entity.SourceListKind,
    SourceSiteId: entity.SourceSiteId,
    SourceListId: entity.SourceListId,
    SubscriptionId: entity.SubscriptionId ?? '',
    Resource: entity.Resource ?? '',
    NotificationUrl: entity.NotificationUrl ?? '',
    ExpirationDateTimeUtc: entity.ExpirationDateTimeUtc ?? '',
    Status: entity.Status,
    LastCreateAttemptUtc: entity.LastCreateAttemptUtc ?? '',
    LastRenewalAttemptUtc: entity.LastRenewalAttemptUtc ?? '',
    LastRenewalSuccessUtc: entity.LastRenewalSuccessUtc ?? '',
    LastFailureCode: entity.LastFailureCode ?? '',
    LastFailureAtUtc: entity.LastFailureAtUtc ?? '',
  };
}

function deserializeSubscription(record: Record<string, unknown>): IProjectionSubscriptionEntity {
  const rowKey = String(record.rowKey);
  const sourceListKind = String(record.SourceListKind) as SourceListKind;
  return {
    partitionKey: PROJECTION_STATE_PARTITION_KEY,
    rowKey: rowKey as `Subscription:${SourceListKind}`,
    SourceListKind: sourceListKind,
    SourceSiteId: String(record.SourceSiteId ?? ''),
    SourceListId: String(record.SourceListId ?? ''),
    SubscriptionId: emptyToUndefined(record.SubscriptionId),
    Resource: emptyToUndefined(record.Resource),
    NotificationUrl: emptyToUndefined(record.NotificationUrl),
    ExpirationDateTimeUtc: emptyToUndefined(record.ExpirationDateTimeUtc),
    Status: String(record.Status) as ProjectionSubscriptionStatus,
    LastCreateAttemptUtc: emptyToUndefined(record.LastCreateAttemptUtc),
    LastRenewalAttemptUtc: emptyToUndefined(record.LastRenewalAttemptUtc),
    LastRenewalSuccessUtc: emptyToUndefined(record.LastRenewalSuccessUtc),
    LastFailureCode: emptyToUndefined(record.LastFailureCode),
    LastFailureAtUtc: emptyToUndefined(record.LastFailureAtUtc),
  };
}

function emptyToUndefined(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  return value.length === 0 ? undefined : value;
}

export interface IProjectionSubscriptionStateRepository {
  get(sourceListKind: SourceListKind): Promise<IProjectionSubscriptionEntity | null>;
  upsert(entity: IProjectionSubscriptionEntity): Promise<void>;
  list(): Promise<IProjectionSubscriptionEntity[]>;
  recordSuccessfulCreate(args: {
    sourceListKind: SourceListKind;
    sourceSiteId: string;
    sourceListId: string;
    subscriptionId: string;
    resource: string;
    notificationUrl: string;
    expirationDateTimeUtc: string;
    atUtc: string;
  }): Promise<void>;
  recordSuccessfulRenewal(args: {
    sourceListKind: SourceListKind;
    expirationDateTimeUtc: string;
    atUtc: string;
  }): Promise<void>;
  recordFailure(args: {
    sourceListKind: SourceListKind;
    failureCode: string;
    atUtc: string;
    status?: ProjectionSubscriptionStatus;
  }): Promise<void>;
}

export class ProjectionSubscriptionStateRepository implements IProjectionSubscriptionStateRepository {
  private readonly client: TableClient;
  private tableEnsured = false;

  constructor(opts: { client?: TableClient; tableName?: string } = {}) {
    this.client =
      opts.client ??
      createProjectionTableClient(opts.tableName ?? PROJECTION_DEFAULT_SUBSCRIPTIONS_TABLE);
  }

  private async ensureTable(): Promise<void> {
    if (this.tableEnsured) return;
    await ensureProjectionTable(this.client);
    this.tableEnsured = true;
  }

  async get(sourceListKind: SourceListKind): Promise<IProjectionSubscriptionEntity | null> {
    await this.ensureTable();
    try {
      const entity = await this.client.getEntity<Record<string, unknown>>(
        PROJECTION_STATE_PARTITION_KEY,
        subscriptionRowKey(sourceListKind),
      );
      return deserializeSubscription(entity);
    } catch (err: unknown) {
      if ((err as { statusCode?: number }).statusCode === 404) return null;
      throw err;
    }
  }

  async upsert(entity: IProjectionSubscriptionEntity): Promise<void> {
    await this.ensureTable();
    const tableEntity = serializeSubscription(entity) as TableEntity<ISubscriptionTableEntity>;
    await this.client.upsertEntity(tableEntity, 'Replace');
  }

  async list(): Promise<IProjectionSubscriptionEntity[]> {
    await this.ensureTable();
    const out: IProjectionSubscriptionEntity[] = [];
    const iterator = this.client.listEntities<Record<string, unknown>>({
      queryOptions: { filter: `PartitionKey eq '${PROJECTION_STATE_PARTITION_KEY}'` },
    });
    for await (const record of iterator) {
      const rowKey = String(record.rowKey);
      if (!rowKey.startsWith('Subscription:')) continue;
      out.push(deserializeSubscription(record));
    }
    return out;
  }

  async recordSuccessfulCreate(args: {
    sourceListKind: SourceListKind;
    sourceSiteId: string;
    sourceListId: string;
    subscriptionId: string;
    resource: string;
    notificationUrl: string;
    expirationDateTimeUtc: string;
    atUtc: string;
  }): Promise<void> {
    const next: IProjectionSubscriptionEntity = {
      partitionKey: PROJECTION_STATE_PARTITION_KEY,
      rowKey: subscriptionRowKey(args.sourceListKind),
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
    };
    await this.upsert(next);
  }

  async recordSuccessfulRenewal(args: {
    sourceListKind: SourceListKind;
    expirationDateTimeUtc: string;
    atUtc: string;
  }): Promise<void> {
    const existing = await this.get(args.sourceListKind);
    if (!existing) {
      throw new Error(
        `Subscription state for source list '${args.sourceListKind}' not found; cannot record renewal.`,
      );
    }
    const next: IProjectionSubscriptionEntity = {
      ...existing,
      Status: 'healthy',
      ExpirationDateTimeUtc: args.expirationDateTimeUtc,
      LastRenewalAttemptUtc: args.atUtc,
      LastRenewalSuccessUtc: args.atUtc,
      LastFailureCode: undefined,
      LastFailureAtUtc: undefined,
    };
    await this.upsert(next);
  }

  async recordFailure(args: {
    sourceListKind: SourceListKind;
    failureCode: string;
    atUtc: string;
    status?: ProjectionSubscriptionStatus;
  }): Promise<void> {
    const existing = await this.get(args.sourceListKind);
    if (!existing) {
      const next: IProjectionSubscriptionEntity = {
        partitionKey: PROJECTION_STATE_PARTITION_KEY,
        rowKey: subscriptionRowKey(args.sourceListKind),
        SourceListKind: args.sourceListKind,
        SourceSiteId: '',
        SourceListId: '',
        Status: args.status ?? 'failed',
        LastFailureCode: args.failureCode,
        LastFailureAtUtc: args.atUtc,
        LastRenewalAttemptUtc: args.atUtc,
      };
      await this.upsert(next);
      return;
    }
    const next: IProjectionSubscriptionEntity = {
      ...existing,
      Status: args.status ?? 'failed',
      LastFailureCode: args.failureCode,
      LastFailureAtUtc: args.atUtc,
      LastRenewalAttemptUtc: args.atUtc,
    };
    await this.upsert(next);
  }
}
