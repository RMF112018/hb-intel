/**
 * My Projects projection — delta-state repository.
 *
 * Table: `MyProjectsProjectionDeltaState`.
 * PartitionKey: `'MyProjectsProjection'`. RowKey: `DeltaState:{SourceListKind}`.
 *
 * Owns the per-source delta-link checkpoint advanced by the sync worker after
 * a successful projection write. Advances use ETag-guarded `Replace` so two
 * workers can't double-advance past each other. `410 Gone` from Graph is
 * surfaced by the worker as a `markNeedsResync` call — this repo never
 * overwrites a valid `DeltaLink` once the resync path is required.
 */

import { type TableClient, type TableEntity } from '@azure/data-tables';
import {
  PROJECTION_STATE_PARTITION_KEY,
  type IProjectionDeltaStateEntity,
} from '../projection-state-entities.js';
import type { SourceListKind } from '../projection-types.js';
import {
  PROJECTION_DEFAULT_DELTA_STATE_TABLE,
  createProjectionTableClient,
  ensureProjectionTable,
} from './projection-table-client-factory.js';

function deltaRowKey(sourceListKind: SourceListKind): `DeltaState:${SourceListKind}` {
  return `DeltaState:${sourceListKind}`;
}

export class DeltaStateAlreadyInitializedError extends Error {
  readonly sourceListKind: SourceListKind;
  constructor(sourceListKind: SourceListKind) {
    super(`Delta state for source list '${sourceListKind}' is already initialized.`);
    this.name = 'DeltaStateAlreadyInitializedError';
    this.sourceListKind = sourceListKind;
  }
}

export class DeltaStateConcurrencyError extends Error {
  readonly sourceListKind: SourceListKind;
  readonly latest: IProjectionDeltaStateEntity | null;
  constructor(sourceListKind: SourceListKind, latest: IProjectionDeltaStateEntity | null) {
    super(
      `Delta state concurrency conflict for source list '${sourceListKind}'. Latest snapshot ${
        latest === null ? 'is absent' : 'returned'
      } for caller-side retry.`,
    );
    this.name = 'DeltaStateConcurrencyError';
    this.sourceListKind = sourceListKind;
    this.latest = latest;
  }
}

interface IDeltaTableEntity {
  partitionKey: string;
  rowKey: string;
  SourceListKind: SourceListKind;
  DeltaLink: string;
  NeedsResync: boolean;
  LastDeltaPullStartedUtc: string;
  LastDeltaPullSucceededUtc: string;
  LastDeltaPullFailedUtc: string;
  LastFailureCode: string;
  LastChangedItemCount: number;
  LastDeletedItemCount: number;
  LastProjectionBatchId: string;
}

function emptyToUndefined(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  return value.length === 0 ? undefined : value;
}

function numberOrUndefined(value: unknown): number | undefined {
  if (typeof value !== 'number' || Number.isNaN(value)) return undefined;
  return value;
}

function deserialize(record: Record<string, unknown>): IProjectionDeltaStateEntity {
  const rowKey = String(record.rowKey);
  const sourceListKind = String(record.SourceListKind) as SourceListKind;
  return {
    partitionKey: PROJECTION_STATE_PARTITION_KEY,
    rowKey: rowKey as `DeltaState:${SourceListKind}`,
    SourceListKind: sourceListKind,
    DeltaLink: emptyToUndefined(record.DeltaLink),
    NeedsResync: record.NeedsResync === true,
    LastDeltaPullStartedUtc: emptyToUndefined(record.LastDeltaPullStartedUtc),
    LastDeltaPullSucceededUtc: emptyToUndefined(record.LastDeltaPullSucceededUtc),
    LastDeltaPullFailedUtc: emptyToUndefined(record.LastDeltaPullFailedUtc),
    LastFailureCode: emptyToUndefined(record.LastFailureCode),
    LastChangedItemCount: numberOrUndefined(record.LastChangedItemCount),
    LastDeletedItemCount: numberOrUndefined(record.LastDeletedItemCount),
    LastProjectionBatchId: emptyToUndefined(record.LastProjectionBatchId),
  };
}

function serialize(entity: IProjectionDeltaStateEntity): IDeltaTableEntity {
  return {
    partitionKey: entity.partitionKey,
    rowKey: entity.rowKey,
    SourceListKind: entity.SourceListKind,
    DeltaLink: entity.DeltaLink ?? '',
    NeedsResync: entity.NeedsResync,
    LastDeltaPullStartedUtc: entity.LastDeltaPullStartedUtc ?? '',
    LastDeltaPullSucceededUtc: entity.LastDeltaPullSucceededUtc ?? '',
    LastDeltaPullFailedUtc: entity.LastDeltaPullFailedUtc ?? '',
    LastFailureCode: entity.LastFailureCode ?? '',
    LastChangedItemCount: entity.LastChangedItemCount ?? 0,
    LastDeletedItemCount: entity.LastDeletedItemCount ?? 0,
    LastProjectionBatchId: entity.LastProjectionBatchId ?? '',
  };
}

export class ProjectionDeltaStateRepository {
  private readonly client: TableClient;
  private tableEnsured = false;

  constructor(opts: { client?: TableClient; tableName?: string } = {}) {
    this.client =
      opts.client ??
      createProjectionTableClient(opts.tableName ?? PROJECTION_DEFAULT_DELTA_STATE_TABLE);
  }

  private async ensureTable(): Promise<void> {
    if (this.tableEnsured) return;
    await ensureProjectionTable(this.client);
    this.tableEnsured = true;
  }

  async get(sourceListKind: SourceListKind): Promise<IProjectionDeltaStateEntity | null> {
    await this.ensureTable();
    try {
      const entity = await this.client.getEntity<Record<string, unknown>>(
        PROJECTION_STATE_PARTITION_KEY,
        deltaRowKey(sourceListKind),
      );
      return deserialize(entity);
    } catch (err: unknown) {
      if ((err as { statusCode?: number }).statusCode === 404) return null;
      throw err;
    }
  }

  async initializeBaseline(args: {
    sourceListKind: SourceListKind;
    deltaLink: string;
    batchId: string;
    atUtc: string;
  }): Promise<void> {
    await this.ensureTable();
    const next: IProjectionDeltaStateEntity = {
      partitionKey: PROJECTION_STATE_PARTITION_KEY,
      rowKey: deltaRowKey(args.sourceListKind),
      SourceListKind: args.sourceListKind,
      DeltaLink: args.deltaLink,
      NeedsResync: false,
      LastDeltaPullSucceededUtc: args.atUtc,
      LastProjectionBatchId: args.batchId,
      LastChangedItemCount: 0,
      LastDeletedItemCount: 0,
    };
    try {
      await this.client.createEntity(serialize(next) as TableEntity<IDeltaTableEntity>);
    } catch (err: unknown) {
      if ((err as { statusCode?: number }).statusCode === 409) {
        throw new DeltaStateAlreadyInitializedError(args.sourceListKind);
      }
      throw err;
    }
  }

  async advanceCheckpoint(args: {
    sourceListKind: SourceListKind;
    deltaLink: string;
    changedCount: number;
    deletedCount: number;
    batchId: string;
    atUtc: string;
    expectedEtag: string;
  }): Promise<void> {
    await this.ensureTable();
    const next: IProjectionDeltaStateEntity = {
      partitionKey: PROJECTION_STATE_PARTITION_KEY,
      rowKey: deltaRowKey(args.sourceListKind),
      SourceListKind: args.sourceListKind,
      DeltaLink: args.deltaLink,
      NeedsResync: false,
      LastDeltaPullSucceededUtc: args.atUtc,
      LastChangedItemCount: args.changedCount,
      LastDeletedItemCount: args.deletedCount,
      LastProjectionBatchId: args.batchId,
    };
    try {
      await this.client.updateEntity<TableEntity<IDeltaTableEntity>>(
        serialize(next) as TableEntity<IDeltaTableEntity>,
        'Replace',
        { etag: args.expectedEtag },
      );
    } catch (err: unknown) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 412 || status === 409) {
        const latest = await this.get(args.sourceListKind);
        throw new DeltaStateConcurrencyError(args.sourceListKind, latest);
      }
      throw err;
    }
  }

  async markFailure(args: {
    sourceListKind: SourceListKind;
    failureCode: string;
    atUtc: string;
    expectedEtag: string;
  }): Promise<void> {
    await this.ensureTable();
    const existing = await this.get(args.sourceListKind);
    if (!existing) {
      throw new Error(
        `Delta state for source list '${args.sourceListKind}' is not initialized; cannot mark failure.`,
      );
    }
    const next: IProjectionDeltaStateEntity = {
      ...existing,
      LastDeltaPullFailedUtc: args.atUtc,
      LastFailureCode: args.failureCode,
    };
    try {
      await this.client.updateEntity<TableEntity<IDeltaTableEntity>>(
        serialize(next) as TableEntity<IDeltaTableEntity>,
        'Replace',
        { etag: args.expectedEtag },
      );
    } catch (err: unknown) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 412 || status === 409) {
        const latest = await this.get(args.sourceListKind);
        throw new DeltaStateConcurrencyError(args.sourceListKind, latest);
      }
      throw err;
    }
  }

  async markNeedsResync(args: {
    sourceListKind: SourceListKind;
    failureCode: string;
    atUtc: string;
    expectedEtag: string;
  }): Promise<void> {
    await this.ensureTable();
    const existing = await this.get(args.sourceListKind);
    if (!existing) {
      throw new Error(
        `Delta state for source list '${args.sourceListKind}' is not initialized; cannot mark needs-resync.`,
      );
    }
    const next: IProjectionDeltaStateEntity = {
      ...existing,
      NeedsResync: true,
      LastDeltaPullFailedUtc: args.atUtc,
      LastFailureCode: args.failureCode,
    };
    try {
      await this.client.updateEntity<TableEntity<IDeltaTableEntity>>(
        serialize(next) as TableEntity<IDeltaTableEntity>,
        'Replace',
        { etag: args.expectedEtag },
      );
    } catch (err: unknown) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 412 || status === 409) {
        const latest = await this.get(args.sourceListKind);
        throw new DeltaStateConcurrencyError(args.sourceListKind, latest);
      }
      throw err;
    }
  }

  async clearNeedsResync(args: {
    sourceListKind: SourceListKind;
    deltaLink: string;
    batchId: string;
    atUtc: string;
    expectedEtag: string;
  }): Promise<void> {
    await this.ensureTable();
    const existing = await this.get(args.sourceListKind);
    if (!existing) {
      throw new Error(
        `Delta state for source list '${args.sourceListKind}' is not initialized; cannot clear needs-resync.`,
      );
    }
    const next: IProjectionDeltaStateEntity = {
      ...existing,
      NeedsResync: false,
      DeltaLink: args.deltaLink,
      LastProjectionBatchId: args.batchId,
      LastDeltaPullSucceededUtc: args.atUtc,
      LastFailureCode: undefined,
      LastDeltaPullFailedUtc: undefined,
    };
    try {
      await this.client.updateEntity<TableEntity<IDeltaTableEntity>>(
        serialize(next) as TableEntity<IDeltaTableEntity>,
        'Replace',
        { etag: args.expectedEtag },
      );
    } catch (err: unknown) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 412 || status === 409) {
        const latest = await this.get(args.sourceListKind);
        throw new DeltaStateConcurrencyError(args.sourceListKind, latest);
      }
      throw err;
    }
  }
}
