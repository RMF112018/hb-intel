/**
 * Admin Control Plane — Observability Alert Store
 *
 * Durable and in-memory implementations for admin observability alert
 * persistence. Follows the Phase 4 adapter pattern (DurableAdminRunStore,
 * DurableAdminAuditStore) with Table Storage persistence, serialization
 * round-trip helpers, and a mock implementation for test/dev mode.
 *
 * Table: ObservabilityAlerts
 * Partition key: category (ObservabilityAlertCategory)
 * Row key: alertId (UUID v4)
 *
 * @module admin-control-plane/services
 */

import { odata } from '@azure/data-tables';
import {
  ObservabilityAlertStatus,
  ObservabilityAlertSeverity,
  ObservabilityAffectedEntityType,
} from '@hbc/models/admin-control-plane';
import type {
  IAdminActorContext,
  IObservabilityAlertRecord,
  IObservabilityAlertIngestionPayload,
  IObservabilityAlertIngestionItem,
  IObservabilityAlertQuery,
  IObservabilityAlertSummary,
  IObservabilityPagedResponse,
} from '@hbc/models/admin-control-plane';
import { createAppTableClient } from '../../utils/table-client-factory.js';
import type { IObservabilityAlertStore } from './types.js';

// ─── Constants ──────────────────────────────────────────────────────────────────

export const OBSERVABILITY_ALERTS_TABLE = 'ObservabilityAlerts';

// ─── Serialization ──────────────────────────────────────────────────────────────

export function serializeAlertRecord(
  record: IObservabilityAlertRecord,
): { partitionKey: string; rowKey: string } & Record<string, unknown> {
  return {
    partitionKey: record.category,
    rowKey: record.alertId,
    category: record.category,
    severity: record.severity,
    previousSeverity: record.previousSeverity ?? '',
    status: record.status,
    title: record.title,
    description: record.description,
    affectedEntityType: record.affectedEntityType,
    affectedEntityId: record.affectedEntityId,
    domain: record.domain ?? '',
    runId: record.runId ?? '',
    occurredAt: record.occurredAt,
    ingestedAt: record.ingestedAt,
    acknowledgedAt: record.acknowledgedAt ?? '',
    acknowledgedByJson: JSON.stringify(record.acknowledgedBy),
    resolvedAt: record.resolvedAt ?? '',
    resolvedByJson: JSON.stringify(record.resolvedBy),
    dedupeKey: record.dedupeKey,
    evaluationCount: record.evaluationCount,
    lastEvaluatedAt: record.lastEvaluatedAt,
    ctaLabel: record.ctaLabel ?? '',
    ctaHref: record.ctaHref ?? '',
  };
}

export function deserializeAlertRecord(entity: Record<string, unknown>): IObservabilityAlertRecord {
  const previousSev = (entity.previousSeverity as string) || null;
  const domainVal = (entity.domain as string) || null;
  return {
    alertId: entity.rowKey as string,
    category: entity.category as IObservabilityAlertRecord['category'],
    severity: entity.severity as ObservabilityAlertSeverity,
    previousSeverity: previousSev as ObservabilityAlertSeverity | null,
    status: entity.status as ObservabilityAlertStatus,
    title: entity.title as string,
    description: entity.description as string,
    affectedEntityType: entity.affectedEntityType as ObservabilityAffectedEntityType,
    affectedEntityId: entity.affectedEntityId as string,
    domain: domainVal as IObservabilityAlertRecord['domain'],
    runId: (entity.runId as string) || null,
    occurredAt: entity.occurredAt as string,
    ingestedAt: entity.ingestedAt as string,
    acknowledgedAt: (entity.acknowledgedAt as string) || null,
    acknowledgedBy: parseJsonOrNull<IAdminActorContext>(entity.acknowledgedByJson as string),
    resolvedAt: (entity.resolvedAt as string) || null,
    resolvedBy: parseJsonOrNull<IAdminActorContext>(entity.resolvedByJson as string),
    dedupeKey: entity.dedupeKey as string,
    evaluationCount: entity.evaluationCount as number,
    lastEvaluatedAt: entity.lastEvaluatedAt as string,
    ctaLabel: (entity.ctaLabel as string) || null,
    ctaHref: (entity.ctaHref as string) || null,
  };
}

function parseJsonOrNull<T>(json: string | undefined | null): T | null {
  if (!json || json === 'null') return null;
  try { return JSON.parse(json) as T; } catch { return null; }
}

// ─── Durable Implementation ─────────────────────────────────────────────────────

export class DurableObservabilityAlertStore implements IObservabilityAlertStore {
  private readonly client = createAppTableClient(OBSERVABILITY_ALERTS_TABLE);
  private tableEnsured = false;

  private async ensureTable(): Promise<void> {
    if (this.tableEnsured) return;
    await this.client.createTable().catch(() => { /* table may already exist */ });
    this.tableEnsured = true;
  }

  async ingestAlerts(
    payload: IObservabilityAlertIngestionPayload,
  ): Promise<readonly IObservabilityAlertRecord[]> {
    await this.ensureTable();
    const now = new Date().toISOString();
    const results: IObservabilityAlertRecord[] = [];

    for (const item of payload.alerts) {
      // Check for existing alert by dedupeKey
      const existing = await this.findByDedupeKey(item.category, item.dedupeKey);

      if (existing) {
        // Update evaluation count and severity
        const updated: IObservabilityAlertRecord = {
          ...existing,
          severity: item.severity,
          previousSeverity: existing.severity !== item.severity ? existing.severity : existing.previousSeverity,
          title: item.title,
          description: item.description,
          evaluationCount: existing.evaluationCount + 1,
          lastEvaluatedAt: payload.evaluatedAt,
          ctaLabel: item.ctaLabel,
          ctaHref: item.ctaHref,
        };
        await this.client.upsertEntity(serializeAlertRecord(updated), 'Replace');
        results.push(updated);
      } else {
        // Create new alert
        const record: IObservabilityAlertRecord = {
          alertId: crypto.randomUUID(),
          category: item.category,
          severity: item.severity,
          previousSeverity: null,
          status: ObservabilityAlertStatus.Active,
          title: item.title,
          description: item.description,
          affectedEntityType: item.affectedEntityType,
          affectedEntityId: item.affectedEntityId,
          domain: item.domain,
          runId: item.runId,
          occurredAt: item.occurredAt,
          ingestedAt: now,
          acknowledgedAt: null,
          acknowledgedBy: null,
          resolvedAt: null,
          resolvedBy: null,
          dedupeKey: item.dedupeKey,
          evaluationCount: 1,
          lastEvaluatedAt: payload.evaluatedAt,
          ctaLabel: item.ctaLabel,
          ctaHref: item.ctaHref,
        };
        await this.client.upsertEntity(serializeAlertRecord(record), 'Replace');
        results.push(record);
      }
    }
    return results;
  }

  async getAlert(alertId: string): Promise<IObservabilityAlertRecord | null> {
    await this.ensureTable();
    for await (const entity of this.client.listEntities<Record<string, unknown>>({
      queryOptions: { filter: odata`RowKey eq ${alertId}` },
    })) {
      return deserializeAlertRecord(entity);
    }
    return null;
  }

  async listAlerts(
    query: IObservabilityAlertQuery,
  ): Promise<IObservabilityPagedResponse<IObservabilityAlertRecord>> {
    await this.ensureTable();
    const filters: string[] = [];
    if (query.status) filters.push(odata`status eq ${query.status}`);
    if (query.category) filters.push(odata`PartitionKey eq ${query.category}`);
    if (query.severity) filters.push(odata`severity eq ${query.severity}`);
    if (query.domain) filters.push(odata`domain eq ${query.domain}`);
    if (query.from) filters.push(odata`occurredAt ge ${query.from}`);
    if (query.to) filters.push(odata`occurredAt le ${query.to}`);

    const filter = filters.length > 0 ? filters.join(' and ') : undefined;
    const items: IObservabilityAlertRecord[] = [];

    for await (const entity of this.client.listEntities<Record<string, unknown>>({
      queryOptions: { filter },
    })) {
      items.push(deserializeAlertRecord(entity));
      if (items.length >= query.limit) break;
    }

    return { items, nextCursor: null, totalCount: items.length };
  }

  async acknowledgeAlert(
    alertId: string,
    actor: IAdminActorContext,
  ): Promise<IObservabilityAlertRecord> {
    const existing = await this.getAlert(alertId);
    if (!existing) throw new Error(`Alert not found: ${alertId}`);

    const now = new Date().toISOString();
    const updated: IObservabilityAlertRecord = {
      ...existing,
      status: ObservabilityAlertStatus.Acknowledged,
      acknowledgedAt: now,
      acknowledgedBy: actor,
    };
    await this.client.upsertEntity(serializeAlertRecord(updated), 'Replace');
    return updated;
  }

  async resolveAlert(
    alertId: string,
    actor: IAdminActorContext,
  ): Promise<IObservabilityAlertRecord> {
    const existing = await this.getAlert(alertId);
    if (!existing) throw new Error(`Alert not found: ${alertId}`);

    const now = new Date().toISOString();
    const updated: IObservabilityAlertRecord = {
      ...existing,
      status: ObservabilityAlertStatus.Resolved,
      resolvedAt: now,
      resolvedBy: actor,
    };
    await this.client.upsertEntity(serializeAlertRecord(updated), 'Replace');
    return updated;
  }

  async getAlertSummary(): Promise<IObservabilityAlertSummary> {
    await this.ensureTable();
    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;
    let mostRecentAt: string | null = null;

    for await (const entity of this.client.listEntities<Record<string, unknown>>({
      queryOptions: { filter: odata`status eq ${'active'}` },
    })) {
      const severity = entity.severity as string;
      if (severity === 'critical') criticalCount++;
      else if (severity === 'high') highCount++;
      else if (severity === 'medium') mediumCount++;
      else if (severity === 'low') lowCount++;

      const occurredAt = entity.occurredAt as string;
      if (!mostRecentAt || occurredAt > mostRecentAt) mostRecentAt = occurredAt;
    }

    return {
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      totalActiveCount: criticalCount + highCount + mediumCount + lowCount,
      mostRecentAt,
    };
  }

  private async findByDedupeKey(
    category: string,
    dedupeKey: string,
  ): Promise<IObservabilityAlertRecord | null> {
    for await (const entity of this.client.listEntities<Record<string, unknown>>({
      queryOptions: { filter: odata`PartitionKey eq ${category} and dedupeKey eq ${dedupeKey}` },
    })) {
      return deserializeAlertRecord(entity);
    }
    return null;
  }
}

// ─── Mock Implementation ────────────────────────────────────────────────────────

export class MockObservabilityAlertStore implements IObservabilityAlertStore {
  private readonly records: IObservabilityAlertRecord[] = [];
  private nextId = 1;

  async ingestAlerts(
    payload: IObservabilityAlertIngestionPayload,
  ): Promise<readonly IObservabilityAlertRecord[]> {
    const now = new Date().toISOString();
    const results: IObservabilityAlertRecord[] = [];

    for (const item of payload.alerts) {
      const existing = this.records.find(r => r.dedupeKey === item.dedupeKey);
      if (existing) {
        const idx = this.records.indexOf(existing);
        const updated: IObservabilityAlertRecord = {
          ...existing,
          severity: item.severity,
          previousSeverity: existing.severity !== item.severity ? existing.severity : existing.previousSeverity,
          title: item.title,
          description: item.description,
          evaluationCount: existing.evaluationCount + 1,
          lastEvaluatedAt: payload.evaluatedAt,
          ctaLabel: item.ctaLabel,
          ctaHref: item.ctaHref,
        };
        this.records[idx] = updated;
        results.push(updated);
      } else {
        const record: IObservabilityAlertRecord = {
          alertId: `alert-${String(this.nextId++).padStart(3, '0')}`,
          category: item.category,
          severity: item.severity,
          previousSeverity: null,
          status: ObservabilityAlertStatus.Active,
          title: item.title,
          description: item.description,
          affectedEntityType: item.affectedEntityType,
          affectedEntityId: item.affectedEntityId,
          domain: item.domain,
          runId: item.runId,
          occurredAt: item.occurredAt,
          ingestedAt: now,
          acknowledgedAt: null,
          acknowledgedBy: null,
          resolvedAt: null,
          resolvedBy: null,
          dedupeKey: item.dedupeKey,
          evaluationCount: 1,
          lastEvaluatedAt: payload.evaluatedAt,
          ctaLabel: item.ctaLabel,
          ctaHref: item.ctaHref,
        };
        this.records.push(record);
        results.push(record);
      }
    }
    return results;
  }

  async getAlert(alertId: string): Promise<IObservabilityAlertRecord | null> {
    return this.records.find(r => r.alertId === alertId) ?? null;
  }

  async listAlerts(
    query: IObservabilityAlertQuery,
  ): Promise<IObservabilityPagedResponse<IObservabilityAlertRecord>> {
    let results = [...this.records];
    if (query.status) results = results.filter(r => r.status === query.status);
    if (query.category) results = results.filter(r => r.category === query.category);
    if (query.severity) results = results.filter(r => r.severity === query.severity);
    if (query.domain) results = results.filter(r => r.domain === query.domain);
    if (query.from) results = results.filter(r => r.occurredAt >= query.from!);
    if (query.to) results = results.filter(r => r.occurredAt <= query.to!);

    results.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
    const limited = results.slice(0, query.limit);

    return { items: limited, nextCursor: null, totalCount: results.length };
  }

  async acknowledgeAlert(
    alertId: string,
    actor: IAdminActorContext,
  ): Promise<IObservabilityAlertRecord> {
    const idx = this.records.findIndex(r => r.alertId === alertId);
    if (idx === -1) throw new Error(`Alert not found: ${alertId}`);

    const now = new Date().toISOString();
    const updated: IObservabilityAlertRecord = {
      ...this.records[idx],
      status: ObservabilityAlertStatus.Acknowledged,
      acknowledgedAt: now,
      acknowledgedBy: actor,
    };
    this.records[idx] = updated;
    return updated;
  }

  async resolveAlert(
    alertId: string,
    actor: IAdminActorContext,
  ): Promise<IObservabilityAlertRecord> {
    const idx = this.records.findIndex(r => r.alertId === alertId);
    if (idx === -1) throw new Error(`Alert not found: ${alertId}`);

    const now = new Date().toISOString();
    const updated: IObservabilityAlertRecord = {
      ...this.records[idx],
      status: ObservabilityAlertStatus.Resolved,
      resolvedAt: now,
      resolvedBy: actor,
    };
    this.records[idx] = updated;
    return updated;
  }

  async getAlertSummary(): Promise<IObservabilityAlertSummary> {
    const active = this.records.filter(r => r.status === ObservabilityAlertStatus.Active);
    let mostRecentAt: string | null = null;
    for (const a of active) {
      if (!mostRecentAt || a.occurredAt > mostRecentAt) mostRecentAt = a.occurredAt;
    }
    return {
      criticalCount: active.filter(r => r.severity === ObservabilityAlertSeverity.Critical).length,
      highCount: active.filter(r => r.severity === ObservabilityAlertSeverity.High).length,
      mediumCount: active.filter(r => r.severity === ObservabilityAlertSeverity.Medium).length,
      lowCount: active.filter(r => r.severity === ObservabilityAlertSeverity.Low).length,
      totalActiveCount: active.length,
      mostRecentAt,
    };
  }
}
