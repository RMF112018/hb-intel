/**
 * Admin Control Plane — Observability Error Event Store
 *
 * Durable and in-memory implementations for observability error event
 * persistence. Error events are append-only records — they are never
 * updated after creation.
 *
 * Table: ObservabilityErrors
 * Partition key: domain (AdminDomain)
 * Row key: errorId (UUID v4)
 *
 * @module admin-control-plane/services
 */

import { odata } from '@azure/data-tables';
import type {
  IObservabilityErrorRecord,
  IObservabilityErrorIngestionPayload,
  IObservabilityErrorQuery,
  IObservabilityPagedResponse,
} from '@hbc/models/admin-control-plane';
import { createAppTableClient } from '../../utils/table-client-factory.js';
import type { IObservabilityErrorStore } from './types.js';

// ─── Constants ──────────────────────────────────────────────────────────────────

export const OBSERVABILITY_ERRORS_TABLE = 'ObservabilityErrors';

// ─── Serialization ──────────────────────────────────────────────────────────────

export function serializeErrorRecord(
  record: IObservabilityErrorRecord,
): { partitionKey: string; rowKey: string } & Record<string, unknown> {
  return {
    partitionKey: record.domain,
    rowKey: record.errorId,
    domain: record.domain,
    source: record.source,
    classification: record.classification,
    severity: record.severity,
    title: record.title,
    message: record.message,
    detailsJson: JSON.stringify(record.details),
    runId: record.runId ?? '',
    actionKey: record.actionKey ?? '',
    stepNumber: record.stepNumber ?? -1,
    incidentId: record.incidentId ?? '',
    occurredAt: record.occurredAt,
    ingestedAt: record.ingestedAt,
  };
}

export function deserializeErrorRecord(entity: Record<string, unknown>): IObservabilityErrorRecord {
  return {
    errorId: entity.rowKey as string,
    domain: entity.domain as IObservabilityErrorRecord['domain'],
    source: entity.source as IObservabilityErrorRecord['source'],
    classification: entity.classification as IObservabilityErrorRecord['classification'],
    severity: entity.severity as IObservabilityErrorRecord['severity'],
    title: entity.title as string,
    message: entity.message as string,
    details: parseJsonOrNull<Record<string, string | number | boolean>>(entity.detailsJson as string),
    runId: (entity.runId as string) || null,
    actionKey: (entity.actionKey as string) || null,
    stepNumber: (entity.stepNumber as number) === -1 ? null : (entity.stepNumber as number),
    incidentId: (entity.incidentId as string) || null,
    occurredAt: entity.occurredAt as string,
    ingestedAt: entity.ingestedAt as string,
  };
}

function parseJsonOrNull<T>(json: string | undefined | null): T | null {
  if (!json || json === 'null') return null;
  try { return JSON.parse(json) as T; } catch { return null; }
}

// ─── Durable Implementation ─────────────────────────────────────────────────────

export class DurableObservabilityErrorStore implements IObservabilityErrorStore {
  private readonly client = createAppTableClient(OBSERVABILITY_ERRORS_TABLE);
  private tableEnsured = false;

  private async ensureTable(): Promise<void> {
    if (this.tableEnsured) return;
    await this.client.createTable().catch(() => { /* table may already exist */ });
    this.tableEnsured = true;
  }

  async ingestErrors(
    payload: IObservabilityErrorIngestionPayload,
  ): Promise<readonly IObservabilityErrorRecord[]> {
    await this.ensureTable();
    const now = new Date().toISOString();
    const results: IObservabilityErrorRecord[] = [];

    for (const item of payload.errors) {
      const record: IObservabilityErrorRecord = {
        errorId: crypto.randomUUID(),
        domain: item.domain,
        source: item.source,
        classification: item.classification,
        severity: item.severity,
        title: item.title,
        message: item.message,
        details: item.details,
        runId: item.runId,
        actionKey: item.actionKey,
        stepNumber: item.stepNumber,
        incidentId: null,
        occurredAt: item.occurredAt,
        ingestedAt: now,
      };
      await this.client.createEntity(serializeErrorRecord(record));
      results.push(record);
    }
    return results;
  }

  async getError(errorId: string): Promise<IObservabilityErrorRecord | null> {
    await this.ensureTable();
    for await (const entity of this.client.listEntities<Record<string, unknown>>({
      queryOptions: { filter: odata`RowKey eq ${errorId}` },
    })) {
      return deserializeErrorRecord(entity);
    }
    return null;
  }

  async listErrors(
    query: IObservabilityErrorQuery,
  ): Promise<IObservabilityPagedResponse<IObservabilityErrorRecord>> {
    await this.ensureTable();
    const filters: string[] = [];
    if (query.domain) filters.push(odata`PartitionKey eq ${query.domain}`);
    if (query.source) filters.push(odata`source eq ${query.source}`);
    if (query.classification) filters.push(odata`classification eq ${query.classification}`);
    if (query.severity) filters.push(odata`severity eq ${query.severity}`);
    if (query.runId) filters.push(odata`runId eq ${query.runId}`);
    if (query.from) filters.push(odata`occurredAt ge ${query.from}`);
    if (query.to) filters.push(odata`occurredAt le ${query.to}`);

    const filter = filters.length > 0 ? filters.join(' and ') : undefined;
    const items: IObservabilityErrorRecord[] = [];

    for await (const entity of this.client.listEntities<Record<string, unknown>>({
      queryOptions: { filter },
    })) {
      items.push(deserializeErrorRecord(entity));
      if (items.length >= query.limit) break;
    }

    items.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
    return { items, nextCursor: null, totalCount: items.length };
  }
}

// ─── Mock Implementation ────────────────────────────────────────────────────────

export class MockObservabilityErrorStore implements IObservabilityErrorStore {
  private readonly records: IObservabilityErrorRecord[] = [];
  private nextId = 1;

  async ingestErrors(
    payload: IObservabilityErrorIngestionPayload,
  ): Promise<readonly IObservabilityErrorRecord[]> {
    const now = new Date().toISOString();
    const results: IObservabilityErrorRecord[] = [];

    for (const item of payload.errors) {
      const record: IObservabilityErrorRecord = {
        errorId: `error-${String(this.nextId++).padStart(3, '0')}`,
        domain: item.domain,
        source: item.source,
        classification: item.classification,
        severity: item.severity,
        title: item.title,
        message: item.message,
        details: item.details,
        runId: item.runId,
        actionKey: item.actionKey,
        stepNumber: item.stepNumber,
        incidentId: null,
        occurredAt: item.occurredAt,
        ingestedAt: now,
      };
      this.records.push(record);
      results.push(record);
    }
    return results;
  }

  async getError(errorId: string): Promise<IObservabilityErrorRecord | null> {
    return this.records.find(r => r.errorId === errorId) ?? null;
  }

  async listErrors(
    query: IObservabilityErrorQuery,
  ): Promise<IObservabilityPagedResponse<IObservabilityErrorRecord>> {
    let results = [...this.records];
    if (query.domain) results = results.filter(r => r.domain === query.domain);
    if (query.source) results = results.filter(r => r.source === query.source);
    if (query.classification) results = results.filter(r => r.classification === query.classification);
    if (query.severity) results = results.filter(r => r.severity === query.severity);
    if (query.runId) results = results.filter(r => r.runId === query.runId);
    if (query.from) results = results.filter(r => r.occurredAt >= query.from!);
    if (query.to) results = results.filter(r => r.occurredAt <= query.to!);

    results.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
    const limited = results.slice(0, query.limit);
    return { items: limited, nextCursor: null, totalCount: results.length };
  }
}
