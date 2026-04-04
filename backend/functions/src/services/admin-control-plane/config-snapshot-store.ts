/**
 * Config Snapshot Store — Phase 10 immutable config snapshot persistence.
 *
 * Stores point-in-time config snapshots that downstream runs reference
 * for traceability. Snapshots are immutable after creation.
 *
 * @module admin-control-plane/services
 */

import type { IConfigSnapshot, ConfigValueSource } from '@hbc/models/admin-control-plane';
import { createAppTableClient } from '../../utils/table-client-factory.js';

// ─── Provider Interface ─────────────────────────────────────────────────────────

/**
 * Store for immutable config snapshots.
 */
export interface IConfigSnapshotStore {
  /** Save a snapshot. Immutable — subsequent saves with the same ID are rejected. */
  saveSnapshot(snapshot: IConfigSnapshot): Promise<void>;

  /** Retrieve a snapshot by ID. Returns null if not found. */
  getSnapshot(snapshotId: string): Promise<IConfigSnapshot | null>;
}

// ─── Serialization ──────────────────────────────────────────────────────────────

interface SerializedSnapshotEntity {
  partitionKey: string;
  rowKey: string;
  resolvedAt: string;
  versionMapJson: string;
  effectiveValuesJson: string;
  sourceMapJson: string;
}

export function serializeSnapshot(snapshot: IConfigSnapshot): SerializedSnapshotEntity {
  return {
    partitionKey: 'snapshot',
    rowKey: snapshot.snapshotId,
    resolvedAt: snapshot.resolvedAt,
    versionMapJson: JSON.stringify(snapshot.versionMap),
    effectiveValuesJson: JSON.stringify(snapshot.effectiveValues),
    sourceMapJson: JSON.stringify(snapshot.sourceMap),
  };
}

export function deserializeSnapshot(entity: Record<string, unknown>): IConfigSnapshot {
  return {
    snapshotId: entity.rowKey as string,
    resolvedAt: (entity.resolvedAt as string) ?? '',
    versionMap: safeJsonParse<Record<string, number>>(entity.versionMapJson as string, {}),
    effectiveValues: safeJsonParse<Record<string, unknown>>(entity.effectiveValuesJson as string, {}),
    sourceMap: safeJsonParse<Record<string, ConfigValueSource>>(entity.sourceMapJson as string, {}),
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

const SNAPSHOTS_TABLE = 'ConfigSnapshots';

export class DurableConfigSnapshotStore implements IConfigSnapshotStore {
  private readonly client = createAppTableClient(SNAPSHOTS_TABLE);

  async saveSnapshot(snapshot: IConfigSnapshot): Promise<void> {
    try {
      await this.client.createTable();
    } catch (err: unknown) {
      if ((err as { statusCode?: number }).statusCode !== 409) throw err;
    }

    // createEntity = insert-only; will fail with 409 if already exists (immutability)
    await this.client.createEntity(serializeSnapshot(snapshot));
  }

  async getSnapshot(snapshotId: string): Promise<IConfigSnapshot | null> {
    try {
      const entity = await this.client.getEntity('snapshot', snapshotId);
      return deserializeSnapshot(entity as unknown as Record<string, unknown>);
    } catch (err: unknown) {
      if ((err as { statusCode?: number }).statusCode === 404) return null;
      throw err;
    }
  }
}

// ─── Mock Implementation ────────────────────────────────────────────────────────

export class MockConfigSnapshotStore implements IConfigSnapshotStore {
  private readonly snapshots = new Map<string, IConfigSnapshot>();

  async saveSnapshot(snapshot: IConfigSnapshot): Promise<void> {
    if (this.snapshots.has(snapshot.snapshotId)) {
      throw new Error(`Snapshot ${snapshot.snapshotId} already exists (immutable)`);
    }
    this.snapshots.set(snapshot.snapshotId, { ...snapshot });
  }

  async getSnapshot(snapshotId: string): Promise<IConfigSnapshot | null> {
    const snapshot = this.snapshots.get(snapshotId);
    return snapshot ? { ...snapshot } : null;
  }
}
