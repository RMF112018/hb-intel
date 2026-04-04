/**
 * Config Override Store — Phase 10 live config persistence.
 *
 * Provider abstraction and implementations for the live admin-maintained
 * config override store. Only non-secret, live-editable config items may
 * have override records stored here.
 *
 * Storage design:
 * - Table: ConfigOverrides (current published/reverted state per key)
 * - Table: ConfigAuditLog (append-only history of all changes)
 * - PartitionKey: domain (enables domain-scoped queries)
 * - RowKey: configKey (unique per item)
 *
 * Follows the DurableAdminRunStore / MockAdminRunStore pattern.
 *
 * @module admin-control-plane/services
 */

import { odata } from '@azure/data-tables';
import type {
  IConfigOverrideRecord,
  IConfigAuditEvent,
  ConfigOverrideStatus,
  ConfigAuditEventType,
  IAdminActorContext,
  IConfigOverrideWriteRequest,
  IConfigOverrideRevertRequest,
} from '@hbc/models/admin-control-plane';
import { createAppTableClient } from '../../utils/table-client-factory.js';

// ─── Provider Interface ─────────────────────────────────────────────────────────

/**
 * Provider abstraction for the live config override store.
 *
 * Implementations must support:
 * - CRUD for published override records
 * - Optimistic concurrency via expectedVersion
 * - Append-only audit log
 * - Domain-scoped queries
 * - Version history retrieval
 */
export interface IConfigOverrideStore {
  /** Get the current override for a config key. Returns null if no override exists. */
  getOverride(key: string): Promise<IConfigOverrideRecord | null>;

  /** List all overrides, optionally filtered by domain. */
  listOverrides(domain?: string): Promise<readonly IConfigOverrideRecord[]>;

  /**
   * Create or update a live config override.
   * Rejects with an error if expectedVersion doesn't match (optimistic concurrency).
   */
  putOverride(request: IConfigOverrideWriteRequest, actor: IAdminActorContext): Promise<IConfigOverrideRecord>;

  /**
   * Revert an override to code default.
   * Rejects with an error if expectedVersion doesn't match.
   */
  revertOverride(request: IConfigOverrideRevertRequest, actor: IAdminActorContext): Promise<IConfigOverrideRecord>;

  /** Get the audit history for a config key, ordered by timestamp descending. */
  getHistory(key: string): Promise<readonly IConfigAuditEvent[]>;
}

// ─── Serialization ──────────────────────────────────────────────────────────────

interface SerializedOverrideEntity {
  partitionKey: string;
  rowKey: string;
  domain: string;
  valueJson: string;
  version: number;
  status: string;
  lastModifiedByJson: string;
  lastModifiedAt: string;
  createdAt: string;
  reason: string;
}

interface SerializedAuditEntity {
  partitionKey: string;
  rowKey: string;
  eventType: string;
  domain: string;
  previousValueJson: string;
  newValueJson: string;
  previousVersion: number;
  newVersion: number;
  actorJson: string;
  timestamp: string;
  reason: string;
}

export function serializeOverrideRecord(record: IConfigOverrideRecord): SerializedOverrideEntity {
  return {
    partitionKey: record.domain,
    rowKey: record.key,
    domain: record.domain,
    valueJson: JSON.stringify(record.value ?? null),
    version: record.version,
    status: record.status,
    lastModifiedByJson: JSON.stringify(record.lastModifiedBy),
    lastModifiedAt: record.lastModifiedAt,
    createdAt: record.createdAt,
    reason: record.reason,
  };
}

export function deserializeOverrideRecord(entity: Record<string, unknown>): IConfigOverrideRecord {
  return {
    key: entity.rowKey as string,
    domain: (entity.domain as string) || (entity.partitionKey as string),
    value: safeJsonParse(entity.valueJson as string, null),
    version: (entity.version as number) ?? 0,
    status: (entity.status as ConfigOverrideStatus) ?? 'published',
    lastModifiedBy: safeJsonParse(entity.lastModifiedByJson as string, { upn: '', objectId: '', displayName: '', capturedAt: '' }),
    lastModifiedAt: (entity.lastModifiedAt as string) ?? '',
    createdAt: (entity.createdAt as string) ?? '',
    reason: (entity.reason as string) ?? '',
  };
}

export function serializeAuditEvent(event: IConfigAuditEvent): SerializedAuditEntity {
  return {
    partitionKey: event.configKey,
    rowKey: event.eventId,
    eventType: event.eventType,
    domain: event.domain,
    previousValueJson: JSON.stringify(event.previousValue ?? null),
    newValueJson: JSON.stringify(event.newValue ?? null),
    previousVersion: event.previousVersion ?? 0,
    newVersion: event.newVersion,
    actorJson: JSON.stringify(event.actor),
    timestamp: event.timestamp,
    reason: event.reason,
  };
}

export function deserializeAuditEvent(entity: Record<string, unknown>): IConfigAuditEvent {
  return {
    eventId: entity.rowKey as string,
    eventType: (entity.eventType as ConfigAuditEventType) ?? 'updated',
    configKey: entity.partitionKey as string,
    domain: (entity.domain as string) ?? '',
    previousValue: safeJsonParse(entity.previousValueJson as string, null),
    newValue: safeJsonParse(entity.newValueJson as string, null),
    previousVersion: (entity.previousVersion as number) || null,
    newVersion: (entity.newVersion as number) ?? 0,
    actor: safeJsonParse(entity.actorJson as string, { upn: '', objectId: '', displayName: '', capturedAt: '' }),
    timestamp: (entity.timestamp as string) ?? '',
    reason: (entity.reason as string) ?? '',
  };
}

function safeJsonParse<T>(value: string | undefined | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

// ─── Durable Implementation ─────────────────────────────────────────────────────

const OVERRIDES_TABLE = 'ConfigOverrides';
const AUDIT_TABLE = 'ConfigAuditLog';

/**
 * Azure Table Storage implementation of the config override store.
 */
export class DurableConfigOverrideStore implements IConfigOverrideStore {
  private readonly overridesClient = createAppTableClient(OVERRIDES_TABLE);
  private readonly auditClient = createAppTableClient(AUDIT_TABLE);

  async getOverride(key: string): Promise<IConfigOverrideRecord | null> {
    // We don't know the partition key (domain) upfront, so scan all partitions for this key.
    // For production scale this is acceptable since the override table is small (< 100 items).
    const entities = this.overridesClient.listEntities({
      queryOptions: { filter: odata`RowKey eq ${key}` },
    });

    for await (const entity of entities) {
      return deserializeOverrideRecord(entity as unknown as Record<string, unknown>);
    }
    return null;
  }

  async listOverrides(domain?: string): Promise<readonly IConfigOverrideRecord[]> {
    const filter = domain ? odata`PartitionKey eq ${domain}` : undefined;
    const entities = this.overridesClient.listEntities({
      queryOptions: filter ? { filter } : undefined,
    });

    const results: IConfigOverrideRecord[] = [];
    for await (const entity of entities) {
      results.push(deserializeOverrideRecord(entity as unknown as Record<string, unknown>));
    }
    return results;
  }

  async putOverride(request: IConfigOverrideWriteRequest, actor: IAdminActorContext): Promise<IConfigOverrideRecord> {
    await this.ensureTable(this.overridesClient);
    await this.ensureTable(this.auditClient);

    const existing = await this.getOverride(request.key);

    // Optimistic concurrency check
    if (request.expectedVersion !== null) {
      const currentVersion = existing?.version ?? 0;
      if (currentVersion !== request.expectedVersion) {
        throw new Error(
          `Concurrency conflict: expected version ${request.expectedVersion} but found ${currentVersion} for key "${request.key}"`,
        );
      }
    } else if (existing) {
      throw new Error(
        `Override already exists for key "${request.key}" at version ${existing.version}. Provide expectedVersion for updates.`,
      );
    }

    const now = new Date().toISOString();
    const newVersion = (existing?.version ?? 0) + 1;
    const eventType: ConfigAuditEventType = existing ? 'updated' : 'created';

    const record: IConfigOverrideRecord = {
      key: request.key,
      domain: request.domain,
      value: request.value,
      version: newVersion,
      status: 'published',
      lastModifiedBy: actor,
      lastModifiedAt: now,
      createdAt: existing?.createdAt ?? now,
      reason: request.reason,
    };

    // Write override record
    await this.overridesClient.upsertEntity(serializeOverrideRecord(record), 'Replace');

    // Write audit event
    const auditEvent: IConfigAuditEvent = {
      eventId: crypto.randomUUID(),
      eventType,
      configKey: request.key,
      domain: request.domain,
      previousValue: existing?.value ?? null,
      newValue: request.value,
      previousVersion: existing?.version ?? null,
      newVersion,
      actor,
      timestamp: now,
      reason: request.reason,
    };
    await this.auditClient.createEntity(serializeAuditEvent(auditEvent));

    return record;
  }

  async revertOverride(request: IConfigOverrideRevertRequest, actor: IAdminActorContext): Promise<IConfigOverrideRecord> {
    await this.ensureTable(this.overridesClient);
    await this.ensureTable(this.auditClient);

    const existing = await this.getOverride(request.key);
    if (!existing) {
      throw new Error(`No override found for key "${request.key}"`);
    }

    if (existing.version !== request.expectedVersion) {
      throw new Error(
        `Concurrency conflict: expected version ${request.expectedVersion} but found ${existing.version} for key "${request.key}"`,
      );
    }

    const now = new Date().toISOString();
    const newVersion = existing.version + 1;

    const record: IConfigOverrideRecord = {
      key: existing.key,
      domain: existing.domain,
      value: null,
      version: newVersion,
      status: 'reverted',
      lastModifiedBy: actor,
      lastModifiedAt: now,
      createdAt: existing.createdAt,
      reason: request.reason,
    };

    // Write override record
    await this.overridesClient.upsertEntity(serializeOverrideRecord(record), 'Replace');

    // Write audit event
    const auditEvent: IConfigAuditEvent = {
      eventId: crypto.randomUUID(),
      eventType: 'reverted',
      configKey: request.key,
      domain: existing.domain,
      previousValue: existing.value,
      newValue: null,
      previousVersion: existing.version,
      newVersion,
      actor,
      timestamp: now,
      reason: request.reason,
    };
    await this.auditClient.createEntity(serializeAuditEvent(auditEvent));

    return record;
  }

  async getHistory(key: string): Promise<readonly IConfigAuditEvent[]> {
    const entities = this.auditClient.listEntities({
      queryOptions: { filter: odata`PartitionKey eq ${key}` },
    });

    const results: IConfigAuditEvent[] = [];
    for await (const entity of entities) {
      results.push(deserializeAuditEvent(entity as unknown as Record<string, unknown>));
    }

    // Sort descending by timestamp, then by version as tiebreaker (newest first)
    results.sort((a, b) => b.timestamp.localeCompare(a.timestamp) || b.newVersion - a.newVersion);
    return results;
  }

  private async ensureTable(client: { createTable(): Promise<void> }): Promise<void> {
    try {
      await client.createTable();
    } catch (err: unknown) {
      // 409 = table already exists — safe to ignore
      if ((err as { statusCode?: number }).statusCode !== 409) throw err;
    }
  }
}

// ─── Mock Implementation ────────────────────────────────────────────────────────

/**
 * In-memory implementation for mock/test mode.
 */
export class MockConfigOverrideStore implements IConfigOverrideStore {
  private readonly overrides = new Map<string, IConfigOverrideRecord>();
  private readonly auditLog: IConfigAuditEvent[] = [];

  async getOverride(key: string): Promise<IConfigOverrideRecord | null> {
    const record = this.overrides.get(key);
    return record ? { ...record } : null;
  }

  async listOverrides(domain?: string): Promise<readonly IConfigOverrideRecord[]> {
    const all = [...this.overrides.values()];
    const filtered = domain ? all.filter(r => r.domain === domain) : all;
    return filtered.map(r => ({ ...r }));
  }

  async putOverride(request: IConfigOverrideWriteRequest, actor: IAdminActorContext): Promise<IConfigOverrideRecord> {
    const existing = this.overrides.get(request.key);

    // Optimistic concurrency check
    if (request.expectedVersion !== null) {
      const currentVersion = existing?.version ?? 0;
      if (currentVersion !== request.expectedVersion) {
        throw new Error(
          `Concurrency conflict: expected version ${request.expectedVersion} but found ${currentVersion} for key "${request.key}"`,
        );
      }
    } else if (existing) {
      throw new Error(
        `Override already exists for key "${request.key}" at version ${existing.version}. Provide expectedVersion for updates.`,
      );
    }

    const now = new Date().toISOString();
    const newVersion = (existing?.version ?? 0) + 1;
    const eventType: ConfigAuditEventType = existing ? 'updated' : 'created';

    const record: IConfigOverrideRecord = {
      key: request.key,
      domain: request.domain,
      value: request.value,
      version: newVersion,
      status: 'published',
      lastModifiedBy: actor,
      lastModifiedAt: now,
      createdAt: existing?.createdAt ?? now,
      reason: request.reason,
    };

    this.overrides.set(request.key, record);

    this.auditLog.push({
      eventId: crypto.randomUUID(),
      eventType,
      configKey: request.key,
      domain: request.domain,
      previousValue: existing?.value ?? null,
      newValue: request.value,
      previousVersion: existing?.version ?? null,
      newVersion,
      actor,
      timestamp: now,
      reason: request.reason,
    });

    return { ...record };
  }

  async revertOverride(request: IConfigOverrideRevertRequest, actor: IAdminActorContext): Promise<IConfigOverrideRecord> {
    const existing = this.overrides.get(request.key);
    if (!existing) {
      throw new Error(`No override found for key "${request.key}"`);
    }

    if (existing.version !== request.expectedVersion) {
      throw new Error(
        `Concurrency conflict: expected version ${request.expectedVersion} but found ${existing.version} for key "${request.key}"`,
      );
    }

    const now = new Date().toISOString();
    const newVersion = existing.version + 1;

    const record: IConfigOverrideRecord = {
      key: existing.key,
      domain: existing.domain,
      value: null,
      version: newVersion,
      status: 'reverted',
      lastModifiedBy: actor,
      lastModifiedAt: now,
      createdAt: existing.createdAt,
      reason: request.reason,
    };

    this.overrides.set(request.key, record);

    this.auditLog.push({
      eventId: crypto.randomUUID(),
      eventType: 'reverted',
      configKey: request.key,
      domain: existing.domain,
      previousValue: existing.value,
      newValue: null,
      previousVersion: existing.version,
      newVersion,
      actor,
      timestamp: now,
      reason: request.reason,
    });

    return { ...record };
  }

  async getHistory(key: string): Promise<readonly IConfigAuditEvent[]> {
    return this.auditLog
      .filter(e => e.configKey === key)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp) || b.newVersion - a.newVersion)
      .map(e => ({ ...e }));
  }
}
