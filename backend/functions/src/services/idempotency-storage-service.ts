/**
 * P1-D1 Task 2.2a: Idempotency record persistence.
 *
 * Stores deduplicated write responses in the `IdempotencyRecords` Azure Table
 * so the backend can return cached responses for replayed idempotent requests.
 * Uses the same table-storage pattern established by RealTableStorageService.
 *
 * PartitionKey = operation name (low-cardinality, groups by operation type).
 * RowKey = idempotency key (UUID, globally unique per write attempt).
 *
 * TTL is application-enforced: cleanup is run by the nightly
 * `cleanupIdempotency` timer trigger.
 */

import { TableClient } from '@azure/data-tables';

const TABLE_NAME = 'IdempotencyRecords';

// ---------------------------------------------------------------------------
// Record shape
// ---------------------------------------------------------------------------

/** Persisted idempotency record in Azure Table Storage. */
export interface IIdempotencyRecord {
  /** Azure Table partitionKey: the operation name (e.g., 'createLead'). */
  partitionKey: string;
  /** Azure Table rowKey: the UUID idempotency key from the client. */
  rowKey: string;
  /** HTTP status code of the original response. */
  statusCode: number;
  /** JSON-serialized response body from the original handler. */
  responseBodyJson: string;
  /** ISO timestamp when this record expires. Application-enforced TTL. */
  expiresAt: string;
  /** ISO timestamp when this record was written. */
  recordedAt: string;
  /** UPN of the user who made the original request. */
  recordedBy: string;
}

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface IIdempotencyStorageService {
  /**
   * Retrieve an existing idempotency record by operation + key.
   * Returns null if not found or if the record has expired.
   */
  getRecord(operation: string, key: string): Promise<IIdempotencyRecord | null>;

  /**
   * Persist an idempotency record after a successful handler execution.
   * Uses upsert semantics — a duplicate key replaces the existing record.
   */
  saveRecord(record: IIdempotencyRecord): Promise<void>;

  /**
   * Delete idempotency records whose `expiresAt` is before the cutoff.
   * Called by the nightly cleanup timer.
   */
  deleteExpiredRecords(before: Date): Promise<void>;
}

// ---------------------------------------------------------------------------
// Real implementation
// ---------------------------------------------------------------------------

export class RealIdempotencyStorageService implements IIdempotencyStorageService {
  private readonly client: TableClient;
  private tableEnsured = false;

  constructor() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error('AZURE_STORAGE_CONNECTION_STRING is required for IdempotencyStorageService');
    }
    this.client = TableClient.fromConnectionString(connectionString, TABLE_NAME);
  }

  async getRecord(operation: string, key: string): Promise<IIdempotencyRecord | null> {
    await this.ensureTable();
    try {
      const entity = await this.client.getEntity<IIdempotencyRecord>(operation, key);
      // Check TTL — expired records are treated as absent.
      if (new Date(entity.expiresAt) <= new Date()) {
        return null;
      }
      return {
        partitionKey: entity.partitionKey,
        rowKey: entity.rowKey,
        statusCode: entity.statusCode,
        responseBodyJson: entity.responseBodyJson,
        expiresAt: entity.expiresAt,
        recordedAt: entity.recordedAt,
        recordedBy: entity.recordedBy,
      };
    } catch (err: unknown) {
      // Azure SDK throws a RestError with statusCode 404 for missing entities.
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 404) return null;
      throw err;
    }
  }

  async saveRecord(record: IIdempotencyRecord): Promise<void> {
    await this.ensureTable();
    await this.client.upsertEntity(
      {
        partitionKey: record.partitionKey,
        rowKey: record.rowKey,
        statusCode: record.statusCode,
        responseBodyJson: record.responseBodyJson,
        expiresAt: record.expiresAt,
        recordedAt: record.recordedAt,
        recordedBy: record.recordedBy,
      },
      'Replace',
    );
  }

  async deleteExpiredRecords(before: Date): Promise<void> {
    await this.ensureTable();
    const cutoff = before.toISOString();
    const entities = this.client.listEntities<IIdempotencyRecord>({
      queryOptions: {
        filter: `expiresAt lt '${cutoff}'`,
      },
    });
    const deletions: Promise<void>[] = [];
    for await (const entity of entities) {
      deletions.push(
        this.client.deleteEntity(entity.partitionKey, entity.rowKey).then(() => undefined),
      );
    }
    await Promise.all(deletions);
  }

  private async ensureTable(): Promise<void> {
    if (this.tableEnsured) return;
    try {
      await this.client.createTable();
    } catch (err: unknown) {
      // 409 TableAlreadyExists is expected after first creation.
      const code = (err as { code?: string }).code;
      if (code !== 'TableAlreadyExists') throw err;
    }
    this.tableEnsured = true;
  }
}

// ---------------------------------------------------------------------------
// Mock implementation
// ---------------------------------------------------------------------------

export class MockIdempotencyStorageService implements IIdempotencyStorageService {
  private readonly store = new Map<string, IIdempotencyRecord>();

  private static key(operation: string, key: string): string {
    return `${operation}:${key}`;
  }

  async getRecord(operation: string, key: string): Promise<IIdempotencyRecord | null> {
    const record = this.store.get(MockIdempotencyStorageService.key(operation, key)) ?? null;
    if (!record) return null;
    if (new Date(record.expiresAt) <= new Date()) return null;
    return record;
  }

  async saveRecord(record: IIdempotencyRecord): Promise<void> {
    this.store.set(MockIdempotencyStorageService.key(record.partitionKey, record.rowKey), record);
  }

  async deleteExpiredRecords(before: Date): Promise<void> {
    for (const [k, record] of this.store.entries()) {
      if (new Date(record.expiresAt) < before) {
        this.store.delete(k);
      }
    }
  }

  /** Test helper — clear all stored records. */
  reset(): void {
    this.store.clear();
  }
}
