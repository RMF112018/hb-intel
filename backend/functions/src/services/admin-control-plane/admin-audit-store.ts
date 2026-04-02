/**
 * Admin Control Plane — durable audit store (Azure Table Storage).
 *
 * Replaces StubAdminAuditService with Table Storage-backed append-only persistence.
 * Table: `AdminAuditEvents`, PartitionKey: `runId`, RowKey: `auditId`.
 *
 * Audit events are immutable after creation — Insert mode only, no Replace.
 *
 * See: Phase 4 baseline (P4-02), persistence boundary matrix
 *
 * @module admin-control-plane/services
 */

import { odata } from '@azure/data-tables';
import type {
  IAdminAuditRecord,
  AdminAuditEventType,
} from '@hbc/models/admin-control-plane';

import { createAppTableClient } from '../../utils/table-client-factory.js';

import type {
  IAdminAuditService,
  IAdminAuditListOptions,
} from './types.js';

const ADMIN_AUDIT_TABLE = 'AdminAuditEvents';

/**
 * Durable admin audit store backed by Azure Table Storage.
 *
 * Entity keying:
 * - PartitionKey: `runId` — groups all events for one run
 * - RowKey: `auditId` (UUID v4) — unique per event, enables direct lookup
 *
 * Write mode: Insert (append-only — audit events are immutable)
 * JSON-serialized fields: actor, rationale, evidenceRef, configSnapshotRef
 */
export class DurableAdminAuditStore implements IAdminAuditService {
  private readonly client = createAppTableClient(ADMIN_AUDIT_TABLE);
  private tableEnsured = false;

  private async ensureTable(): Promise<void> {
    if (this.tableEnsured) return;
    await this.client.createTable().catch(() => { /* table may already exist */ });
    this.tableEnsured = true;
  }

  async recordEvent(record: IAdminAuditRecord): Promise<void> {
    await this.ensureTable();

    await this.client.createEntity(serializeAuditRecord(record));
    console.log(`[DurableAdminAuditStore] Recorded audit event: ${record.eventType} (${record.auditId}) for run ${record.runId ?? 'none'}`);
  }

  async listByRunId(runId: string): Promise<readonly IAdminAuditRecord[]> {
    await this.ensureTable();

    const entities = this.client.listEntities<Record<string, unknown>>({
      queryOptions: { filter: odata`PartitionKey eq ${runId}` },
    });

    const results: IAdminAuditRecord[] = [];
    for await (const entity of entities) {
      results.push(deserializeAuditRecord(entity as Record<string, unknown>));
    }

    // Sort by timestamp ascending (chronological order)
    results.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    return results;
  }

  async listByEventType(eventType: AdminAuditEventType, options?: IAdminAuditListOptions): Promise<readonly IAdminAuditRecord[]> {
    await this.ensureTable();

    const filters: string[] = [odata`eventType eq ${eventType}`];
    if (options?.since) {
      filters.push(odata`timestamp ge ${options.since}`);
    }

    const entities = this.client.listEntities<Record<string, unknown>>({
      queryOptions: { filter: filters.join(' and ') },
    });

    const results: IAdminAuditRecord[] = [];
    for await (const entity of entities) {
      results.push(deserializeAuditRecord(entity as Record<string, unknown>));
      if (options?.limit && results.length >= options.limit) break;
    }

    results.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    return results;
  }
}

/**
 * In-memory admin audit store for mock/test mode.
 *
 * Preserves the same interface as DurableAdminAuditStore but stores
 * events in memory for deterministic testing.
 */
export class MockAdminAuditStore implements IAdminAuditService {
  private readonly records: IAdminAuditRecord[] = [];

  async recordEvent(record: IAdminAuditRecord): Promise<void> {
    this.records.push(record);
  }

  async listByRunId(runId: string): Promise<readonly IAdminAuditRecord[]> {
    return this.records
      .filter(r => r.runId === runId)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  async listByEventType(eventType: AdminAuditEventType, options?: IAdminAuditListOptions): Promise<readonly IAdminAuditRecord[]> {
    let results = this.records.filter(r => r.eventType === eventType);
    if (options?.since) {
      results = results.filter(r => r.timestamp >= options.since!);
    }
    results.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    if (options?.limit) results = results.slice(0, options.limit);
    return results;
  }
}

// ── Serialization ──────────────────────────────────────────────────────────────

/** Serialize an IAdminAuditRecord to a Table Storage entity. */
export function serializeAuditRecord(record: IAdminAuditRecord): { partitionKey: string; rowKey: string } & Record<string, unknown> {
  return {
    partitionKey: record.runId ?? '__global__',
    rowKey: record.auditId,
    eventType: record.eventType,
    timestamp: record.timestamp,
    domain: String(record.domain),
    actionKey: record.actionKey ? String(record.actionKey) : '',
    runId: record.runId ?? '',
    checkpointInstanceId: record.checkpointInstanceId ?? '',
    actorJson: JSON.stringify(record.actor),
    rationaleJson: JSON.stringify(record.rationale),
    evidenceRefJson: JSON.stringify(record.evidenceRef),
    configSnapshotRefJson: JSON.stringify(record.configSnapshotRef),
    runStatusAtEvent: record.runStatusAtEvent ?? '',
    summary: record.summary,
  };
}

/** Deserialize a Table Storage entity to IAdminAuditRecord. */
export function deserializeAuditRecord(entity: Record<string, unknown>): IAdminAuditRecord {
  return {
    auditId: entity.rowKey as string,
    eventType: entity.eventType as AdminAuditEventType,
    timestamp: entity.timestamp as string,
    domain: entity.domain as never,
    actionKey: ((entity.actionKey as string) || null) as IAdminAuditRecord['actionKey'],
    runId: (entity.runId as string) || null,
    checkpointInstanceId: (entity.checkpointInstanceId as string) || null,
    actor: JSON.parse((entity.actorJson as string) || '{}'),
    rationale: parseJsonOrNull(entity.rationaleJson as string),
    evidenceRef: parseJsonOrNull(entity.evidenceRefJson as string),
    configSnapshotRef: parseJsonOrNull(entity.configSnapshotRefJson as string),
    runStatusAtEvent: ((entity.runStatusAtEvent as string) || null) as IAdminAuditRecord['runStatusAtEvent'],
    summary: entity.summary as string,
  };
}

function parseJsonOrNull<T>(json: string | undefined | null): T | null {
  if (!json || json === 'null') return null;
  try { return JSON.parse(json) as T; } catch { return null; }
}
