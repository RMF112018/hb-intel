/**
 * My Projects projection — coarse-lease repository.
 *
 * Table: `MyProjectsProjectionLeases`. Single PartitionKey, RowKey carries
 * the lease kind:
 *
 *   Lease:Sync:Projects
 *   Lease:Sync:LegacyRegistry
 *   Lease:Rebuild:Global
 *   Lease:DriftAudit:Global
 *   Lease:Purge:Global
 *
 * Acquisition uses optimistic concurrency:
 *   - cold (entity absent)        → createEntity (409 → race-conflict)
 *   - expired or same-owner       → updateEntity('Replace', { etag })
 *   - active and other-owner      → return { acquired: false, reason: 'active' }
 *
 * TTL is supplied by the caller (per memory feedback_optional_contract_fields_skip_dont_synthesize.md):
 * the repository does not read config.
 */

import { type TableClient, type TableEntity } from '@azure/data-tables';
import {
  PROJECTION_STATE_PARTITION_KEY,
  type IProjectionLeaseEntity,
  type ProjectionLeaseType,
} from '../projection-state-entities.js';
import type { SourceListKind } from '../projection-types.js';
import {
  PROJECTION_DEFAULT_LEASES_TABLE,
  createProjectionTableClient,
  ensureProjectionTable,
} from './projection-table-client-factory.js';

export type ProjectionLeaseRowKey = IProjectionLeaseEntity['rowKey'];

export type LeaseAcquireOutcome =
  | { readonly acquired: true; readonly expiresAtUtc: string }
  | {
      readonly acquired: false;
      readonly reason: 'active';
      readonly currentOwner: string;
      readonly expiresAtUtc: string;
    }
  | { readonly acquired: false; readonly reason: 'race-conflict' };

interface ILeaseTableEntity {
  partitionKey: string;
  rowKey: string;
  LeaseOwner: string;
  LeaseAcquiredAtUtc: string;
  LeaseExpiresAtUtc: string;
  LeaseType: ProjectionLeaseType;
  SourceListKind: string;
}

function emptyToUndefined(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  return value.length === 0 ? undefined : value;
}

function deserialize(record: Record<string, unknown>): IProjectionLeaseEntity {
  return {
    partitionKey: PROJECTION_STATE_PARTITION_KEY,
    rowKey: String(record.rowKey) as ProjectionLeaseRowKey,
    LeaseOwner: String(record.LeaseOwner ?? ''),
    LeaseAcquiredAtUtc: String(record.LeaseAcquiredAtUtc ?? ''),
    LeaseExpiresAtUtc: String(record.LeaseExpiresAtUtc ?? ''),
    LeaseType: String(record.LeaseType) as ProjectionLeaseType,
    SourceListKind: emptyToUndefined(record.SourceListKind) as SourceListKind | undefined,
  };
}

function computeExpiresAtUtc(now: Date, ttlMinutes: number): string {
  return new Date(now.getTime() + ttlMinutes * 60_000).toISOString();
}

export class ProjectionLeaseRepository {
  private readonly client: TableClient;
  private tableEnsured = false;

  constructor(opts: { client?: TableClient; tableName?: string } = {}) {
    this.client =
      opts.client ?? createProjectionTableClient(opts.tableName ?? PROJECTION_DEFAULT_LEASES_TABLE);
  }

  private async ensureTable(): Promise<void> {
    if (this.tableEnsured) return;
    await ensureProjectionTable(this.client);
    this.tableEnsured = true;
  }

  async get(rowKey: ProjectionLeaseRowKey): Promise<IProjectionLeaseEntity | null> {
    await this.ensureTable();
    try {
      const record = await this.client.getEntity<Record<string, unknown>>(
        PROJECTION_STATE_PARTITION_KEY,
        rowKey,
      );
      return deserialize(record);
    } catch (err: unknown) {
      if ((err as { statusCode?: number }).statusCode === 404) return null;
      throw err;
    }
  }

  async tryAcquire(args: {
    rowKey: ProjectionLeaseRowKey;
    leaseType: ProjectionLeaseType;
    leaseOwner: string;
    ttlMinutes: number;
    sourceListKind?: SourceListKind;
    now: Date;
  }): Promise<LeaseAcquireOutcome> {
    if (args.ttlMinutes <= 0 || !Number.isFinite(args.ttlMinutes)) {
      throw new RangeError(
        `ProjectionLeaseRepository.tryAcquire: ttlMinutes must be a positive finite number (got ${args.ttlMinutes}).`,
      );
    }
    if (args.leaseOwner.length === 0) {
      throw new RangeError('ProjectionLeaseRepository.tryAcquire: leaseOwner must be non-empty.');
    }
    await this.ensureTable();

    const expiresAtUtc = computeExpiresAtUtc(args.now, args.ttlMinutes);
    const nowUtc = args.now.toISOString();

    let existingRecord: Record<string, unknown> | null = null;
    let existingEtag: string | undefined;
    try {
      const fetched = await this.client.getEntity<Record<string, unknown>>(
        PROJECTION_STATE_PARTITION_KEY,
        args.rowKey,
      );
      existingRecord = fetched;
      existingEtag = (fetched as { etag?: string }).etag;
    } catch (err: unknown) {
      if ((err as { statusCode?: number }).statusCode !== 404) throw err;
    }

    if (existingRecord === null) {
      const next: ILeaseTableEntity = {
        partitionKey: PROJECTION_STATE_PARTITION_KEY,
        rowKey: args.rowKey,
        LeaseOwner: args.leaseOwner,
        LeaseAcquiredAtUtc: nowUtc,
        LeaseExpiresAtUtc: expiresAtUtc,
        LeaseType: args.leaseType,
        SourceListKind: args.sourceListKind ?? '',
      };
      try {
        await this.client.createEntity(next as TableEntity<ILeaseTableEntity>);
        return { acquired: true, expiresAtUtc };
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 409) return { acquired: false, reason: 'race-conflict' };
        throw err;
      }
    }

    const existing = deserialize(existingRecord);
    const currentExpiresMs = Date.parse(existing.LeaseExpiresAtUtc);
    const isExpired = !Number.isFinite(currentExpiresMs) || args.now.getTime() >= currentExpiresMs;
    if (!isExpired && existing.LeaseOwner !== args.leaseOwner) {
      return {
        acquired: false,
        reason: 'active',
        currentOwner: existing.LeaseOwner,
        expiresAtUtc: existing.LeaseExpiresAtUtc,
      };
    }

    const next: ILeaseTableEntity = {
      partitionKey: PROJECTION_STATE_PARTITION_KEY,
      rowKey: args.rowKey,
      LeaseOwner: args.leaseOwner,
      LeaseAcquiredAtUtc: nowUtc,
      LeaseExpiresAtUtc: expiresAtUtc,
      LeaseType: args.leaseType,
      SourceListKind: args.sourceListKind ?? '',
    };
    try {
      await this.client.updateEntity<TableEntity<ILeaseTableEntity>>(
        next as TableEntity<ILeaseTableEntity>,
        'Replace',
        existingEtag !== undefined ? { etag: existingEtag } : undefined,
      );
      return { acquired: true, expiresAtUtc };
    } catch (err: unknown) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 412 || status === 409) {
        return { acquired: false, reason: 'race-conflict' };
      }
      throw err;
    }
  }

  async renew(args: {
    rowKey: ProjectionLeaseRowKey;
    leaseOwner: string;
    ttlMinutes: number;
    now: Date;
  }): Promise<{ renewed: boolean; expiresAtUtc?: string }> {
    if (args.ttlMinutes <= 0 || !Number.isFinite(args.ttlMinutes)) {
      throw new RangeError(
        `ProjectionLeaseRepository.renew: ttlMinutes must be a positive finite number (got ${args.ttlMinutes}).`,
      );
    }
    await this.ensureTable();
    let record: Record<string, unknown>;
    try {
      record = await this.client.getEntity<Record<string, unknown>>(
        PROJECTION_STATE_PARTITION_KEY,
        args.rowKey,
      );
    } catch (err: unknown) {
      if ((err as { statusCode?: number }).statusCode === 404) return { renewed: false };
      throw err;
    }
    const existing = deserialize(record);
    if (existing.LeaseOwner !== args.leaseOwner) return { renewed: false };

    const etag = (record as { etag?: string }).etag;
    const expiresAtUtc = computeExpiresAtUtc(args.now, args.ttlMinutes);
    const next: ILeaseTableEntity = {
      partitionKey: PROJECTION_STATE_PARTITION_KEY,
      rowKey: args.rowKey,
      LeaseOwner: existing.LeaseOwner,
      LeaseAcquiredAtUtc: existing.LeaseAcquiredAtUtc,
      LeaseExpiresAtUtc: expiresAtUtc,
      LeaseType: existing.LeaseType,
      SourceListKind: existing.SourceListKind ?? '',
    };
    try {
      await this.client.updateEntity<TableEntity<ILeaseTableEntity>>(
        next as TableEntity<ILeaseTableEntity>,
        'Replace',
        etag !== undefined ? { etag } : undefined,
      );
      return { renewed: true, expiresAtUtc };
    } catch (err: unknown) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 412 || status === 409) return { renewed: false };
      throw err;
    }
  }

  async release(args: {
    rowKey: ProjectionLeaseRowKey;
    leaseOwner: string;
  }): Promise<{ released: boolean }> {
    await this.ensureTable();
    let record: Record<string, unknown>;
    try {
      record = await this.client.getEntity<Record<string, unknown>>(
        PROJECTION_STATE_PARTITION_KEY,
        args.rowKey,
      );
    } catch (err: unknown) {
      if ((err as { statusCode?: number }).statusCode === 404) return { released: false };
      throw err;
    }
    const existing = deserialize(record);
    if (existing.LeaseOwner !== args.leaseOwner) return { released: false };
    try {
      await this.client.deleteEntity(PROJECTION_STATE_PARTITION_KEY, args.rowKey, {
        etag: (record as { etag?: string }).etag,
      });
      return { released: true };
    } catch (err: unknown) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 412 || status === 409 || status === 404) return { released: false };
      throw err;
    }
  }
}
