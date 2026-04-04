/**
 * Admin Control Plane — Observability Probe Snapshot Store
 *
 * Durable and in-memory implementations for infrastructure probe snapshot
 * persistence. Probe snapshots are append-only — they are never updated
 * after creation.
 *
 * Table: ObservabilityProbeSnapshots
 * Partition key: probeKey (for per-probe queries) or '__snapshot__' (for full snapshots)
 * Row key: snapshotId (UUID v4)
 *
 * @module admin-control-plane/services
 */

import { odata } from '@azure/data-tables';
import { ObservabilityProbeHealthStatus } from '@hbc/models/admin-control-plane';
import type {
  IObservabilityProbeSnapshotRecord,
  IObservabilityProbeSubmissionPayload,
  IObservabilityProbeSnapshotQuery,
  IObservabilityProbeHealthSummary,
  IObservabilityPagedResponse,
  IObservabilityProbeResultRecord,
} from '@hbc/models/admin-control-plane';
import { createAppTableClient } from '../../utils/table-client-factory.js';
import type { IObservabilityProbeSnapshotStore } from './types.js';

// ─── Constants ──────────────────────────────────────────────────────────────────

export const OBSERVABILITY_PROBE_SNAPSHOTS_TABLE = 'ObservabilityProbeSnapshots';
const SNAPSHOT_PARTITION = '__snapshot__';

/** Probe staleness threshold: 30 minutes */
const PROBE_STALENESS_MS = 1_800_000;

// ─── Serialization ──────────────────────────────────────────────────────────────

export function serializeProbeSnapshot(
  record: IObservabilityProbeSnapshotRecord,
): { partitionKey: string; rowKey: string } & Record<string, unknown> {
  return {
    partitionKey: SNAPSHOT_PARTITION,
    rowKey: record.snapshotId,
    capturedAt: record.capturedAt,
    persistedAt: record.persistedAt,
    triggerMode: record.triggerMode,
    resultsJson: JSON.stringify(record.results),
    overallStatus: record.overallStatus,
  };
}

export function deserializeProbeSnapshot(entity: Record<string, unknown>): IObservabilityProbeSnapshotRecord {
  const results = JSON.parse((entity.resultsJson as string) || '[]') as IObservabilityProbeResultRecord[];
  return {
    snapshotId: entity.rowKey as string,
    capturedAt: entity.capturedAt as string,
    persistedAt: entity.persistedAt as string,
    triggerMode: entity.triggerMode as 'scheduled' | 'manual',
    results,
    overallStatus: entity.overallStatus as ObservabilityProbeHealthStatus,
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function computeOverallStatus(results: readonly IObservabilityProbeResultRecord[]): ObservabilityProbeHealthStatus {
  const statusPriority: Record<string, number> = { error: 3, degraded: 2, unknown: 1, healthy: 0 };
  let worst: ObservabilityProbeHealthStatus = ObservabilityProbeHealthStatus.Healthy;
  for (const r of results) {
    if ((statusPriority[r.status] ?? 0) > (statusPriority[worst] ?? 0)) {
      worst = r.status;
    }
  }
  return worst;
}

// ─── Durable Implementation ─────────────────────────────────────────────────────

export class DurableObservabilityProbeSnapshotStore implements IObservabilityProbeSnapshotStore {
  private readonly client = createAppTableClient(OBSERVABILITY_PROBE_SNAPSHOTS_TABLE);
  private tableEnsured = false;

  private async ensureTable(): Promise<void> {
    if (this.tableEnsured) return;
    await this.client.createTable().catch(() => { /* table may already exist */ });
    this.tableEnsured = true;
  }

  async saveSnapshot(
    payload: IObservabilityProbeSubmissionPayload,
  ): Promise<IObservabilityProbeSnapshotRecord> {
    await this.ensureTable();
    const now = new Date().toISOString();
    const record: IObservabilityProbeSnapshotRecord = {
      snapshotId: payload.snapshotId,
      capturedAt: payload.capturedAt,
      persistedAt: now,
      triggerMode: payload.triggerMode,
      results: payload.results,
      overallStatus: computeOverallStatus(payload.results),
    };
    await this.client.upsertEntity(serializeProbeSnapshot(record), 'Replace');
    return record;
  }

  async getLatestSnapshot(): Promise<IObservabilityProbeSnapshotRecord | null> {
    await this.ensureTable();
    let latest: IObservabilityProbeSnapshotRecord | null = null;

    for await (const entity of this.client.listEntities<Record<string, unknown>>({
      queryOptions: { filter: odata`PartitionKey eq ${SNAPSHOT_PARTITION}` },
    })) {
      const record = deserializeProbeSnapshot(entity);
      if (!latest || record.capturedAt > latest.capturedAt) {
        latest = record;
      }
    }
    return latest;
  }

  async listSnapshots(
    query: IObservabilityProbeSnapshotQuery,
  ): Promise<IObservabilityPagedResponse<IObservabilityProbeSnapshotRecord>> {
    await this.ensureTable();
    const filters: string[] = [odata`PartitionKey eq ${SNAPSHOT_PARTITION}`];
    if (query.from) filters.push(odata`capturedAt ge ${query.from}`);
    if (query.to) filters.push(odata`capturedAt le ${query.to}`);

    const filter = filters.join(' and ');
    const items: IObservabilityProbeSnapshotRecord[] = [];

    for await (const entity of this.client.listEntities<Record<string, unknown>>({
      queryOptions: { filter },
    })) {
      const record = deserializeProbeSnapshot(entity);
      if (query.probeKey) {
        // Filter by probeKey — include snapshot only if it has a result for this probe
        if (!record.results.some(r => r.probeKey === query.probeKey)) continue;
      }
      items.push(record);
      if (items.length >= query.limit) break;
    }

    items.sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));
    return { items, nextCursor: null, totalCount: items.length };
  }

  async getHealthSummary(): Promise<IObservabilityProbeHealthSummary> {
    const latest = await this.getLatestSnapshot();
    if (!latest) {
      return {
        healthyCount: 0, degradedCount: 0, errorCount: 0, unknownCount: 0,
        overallStatus: ObservabilityProbeHealthStatus.Unknown, lastSnapshotAt: null, isStale: true,
      };
    }

    const counts = { healthy: 0, degraded: 0, error: 0, unknown: 0 };
    for (const r of latest.results) counts[r.status]++;

    const age = Date.now() - new Date(latest.capturedAt).getTime();
    return {
      healthyCount: counts.healthy,
      degradedCount: counts.degraded,
      errorCount: counts.error,
      unknownCount: counts.unknown,
      overallStatus: latest.overallStatus,
      lastSnapshotAt: latest.capturedAt,
      isStale: age > PROBE_STALENESS_MS,
    };
  }
}

// ─── Mock Implementation ────────────────────────────────────────────────────────

export class MockObservabilityProbeSnapshotStore implements IObservabilityProbeSnapshotStore {
  private readonly snapshots: IObservabilityProbeSnapshotRecord[] = [];

  async saveSnapshot(
    payload: IObservabilityProbeSubmissionPayload,
  ): Promise<IObservabilityProbeSnapshotRecord> {
    const now = new Date().toISOString();
    const record: IObservabilityProbeSnapshotRecord = {
      snapshotId: payload.snapshotId,
      capturedAt: payload.capturedAt,
      persistedAt: now,
      triggerMode: payload.triggerMode,
      results: payload.results,
      overallStatus: computeOverallStatus(payload.results),
    };
    this.snapshots.push(record);
    return record;
  }

  async getLatestSnapshot(): Promise<IObservabilityProbeSnapshotRecord | null> {
    if (this.snapshots.length === 0) return null;
    return [...this.snapshots].sort((a, b) => b.capturedAt.localeCompare(a.capturedAt))[0];
  }

  async listSnapshots(
    query: IObservabilityProbeSnapshotQuery,
  ): Promise<IObservabilityPagedResponse<IObservabilityProbeSnapshotRecord>> {
    let results = [...this.snapshots];
    if (query.from) results = results.filter(r => r.capturedAt >= query.from!);
    if (query.to) results = results.filter(r => r.capturedAt <= query.to!);
    if (query.probeKey) {
      results = results.filter(r => r.results.some(p => p.probeKey === query.probeKey));
    }
    results.sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));
    const limited = results.slice(0, query.limit);
    return { items: limited, nextCursor: null, totalCount: results.length };
  }

  async getHealthSummary(): Promise<IObservabilityProbeHealthSummary> {
    const latest = await this.getLatestSnapshot();
    if (!latest) {
      return {
        healthyCount: 0, degradedCount: 0, errorCount: 0, unknownCount: 0,
        overallStatus: ObservabilityProbeHealthStatus.Unknown, lastSnapshotAt: null, isStale: true,
      };
    }

    const counts = { healthy: 0, degraded: 0, error: 0, unknown: 0 };
    for (const r of latest.results) counts[r.status]++;

    const age = Date.now() - new Date(latest.capturedAt).getTime();
    return {
      healthyCount: counts.healthy,
      degradedCount: counts.degraded,
      errorCount: counts.error,
      unknownCount: counts.unknown,
      overallStatus: latest.overallStatus,
      lastSnapshotAt: latest.capturedAt,
      isStale: age > PROBE_STALENESS_MS,
    };
  }
}
