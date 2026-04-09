/**
 * Admin Control Plane — evidence service (metadata persistence + inline/offload).
 *
 * Manages evidence reference metadata in Azure Table Storage (`AdminEvidence`).
 * Small payloads (< 32 KB) are stored inline as a JSON field on the entity.
 * Larger payloads generate a blob storageLocator reference for Phase 6 offload.
 *
 * Table: `AdminEvidence`, PartitionKey: `runId`, RowKey: `evidenceId`.
 *
 * See: Phase 4 baseline (P4-02), evidence and retention boundaries (P4-06)
 *
 * @module admin-control-plane/services
 */

import { odata } from '@azure/data-tables';
import type { IAdminEvidenceReference } from '@hbc/models/admin-control-plane';
import { createAppTableClient } from '../../utils/table-client-factory.js';
import type { IAdminEvidenceService, EvidenceRetentionClass, IAdminEvidencePayloadRecord } from './types.js';

const ADMIN_EVIDENCE_TABLE = 'AdminEvidence';

/**
 * Maximum inline evidence payload size in bytes (32 KB).
 * Payloads exceeding this threshold are offloaded to blob storage (Phase 6).
 */
export const EVIDENCE_INLINE_MAX_BYTES = 32_768;

/**
 * Determine whether an evidence payload is small enough to store inline.
 *
 * @param payload - The evidence payload to evaluate
 * @returns true if the serialized payload is under the inline threshold
 */
export function isEvidenceInlineable(payload: Record<string, unknown> | undefined | null): boolean {
  if (!payload) return true;
  try {
    const serialized = JSON.stringify(payload);
    return Buffer.byteLength(serialized, 'utf-8') <= EVIDENCE_INLINE_MAX_BYTES;
  } catch {
    return false;
  }
}

/**
 * Generate a blob storage locator reference for oversized evidence.
 * Phase 6 implements actual blob writes; Phase 4 generates the reference pattern.
 */
export function generateBlobLocator(runId: string, evidenceId: string): string {
  return `blob://admin-evidence/${runId}/${evidenceId}.json`;
}

/**
 * Durable evidence store backed by Azure Table Storage.
 */
export class DurableAdminEvidenceStore implements IAdminEvidenceService {
  private readonly client = createAppTableClient(ADMIN_EVIDENCE_TABLE);
  private tableEnsured = false;

  private async ensureTable(): Promise<void> {
    if (this.tableEnsured) return;
    await this.client.createTable().catch(() => { /* table may already exist */ });
    this.tableEnsured = true;
  }

  async recordEvidence(
    ref: IAdminEvidenceReference,
    retentionClass: EvidenceRetentionClass,
    inlinePayload?: Record<string, unknown>,
  ): Promise<void> {
    await this.ensureTable();

    const isInline = isEvidenceInlineable(inlinePayload);
    const storageLocator = isInline
      ? ref.storageLocator
      : generateBlobLocator(ref.runId ?? 'orphan', ref.evidenceId);

    await this.client.createEntity({
      partitionKey: ref.runId ?? '__orphan__',
      rowKey: ref.evidenceId,
      evidenceType: ref.evidenceType,
      label: ref.label,
      runId: ref.runId ?? '',
      stepNumber: ref.stepNumber ?? -1,
      capturedAt: ref.capturedAt,
      storageLocator,
      retentionClass,
      inlinePayloadJson: isInline && inlinePayload ? JSON.stringify(inlinePayload) : '',
      isOffloaded: !isInline,
    });
  }

  async listByRunId(runId: string): Promise<readonly IAdminEvidenceReference[]> {
    await this.ensureTable();

    const entities = this.client.listEntities<Record<string, unknown>>({
      queryOptions: { filter: odata`PartitionKey eq ${runId}` },
    });

    const results: IAdminEvidenceReference[] = [];
    for await (const entity of entities) {
      results.push(deserializeEvidenceRef(entity as Record<string, unknown>));
    }
    results.sort((a, b) => a.capturedAt.localeCompare(b.capturedAt));
    return results;
  }

  async getEvidence(evidenceId: string): Promise<IAdminEvidenceReference | null> {
    await this.ensureTable();

    const entities = this.client.listEntities<Record<string, unknown>>({
      queryOptions: { filter: odata`RowKey eq ${evidenceId}` },
    });

    for await (const entity of entities) {
      return deserializeEvidenceRef(entity as Record<string, unknown>);
    }
    return null;
  }

  async getEvidencePayload(evidenceId: string): Promise<IAdminEvidencePayloadRecord | null> {
    await this.ensureTable();
    const entities = this.client.listEntities<Record<string, unknown>>({
      queryOptions: { filter: odata`RowKey eq ${evidenceId}` },
    });
    for await (const entity of entities) {
      const inlineRaw = (entity.inlinePayloadJson as string) || '';
      let inlinePayload: Record<string, unknown> | null = null;
      if (inlineRaw) {
        try {
          inlinePayload = JSON.parse(inlineRaw) as Record<string, unknown>;
        } catch {
          inlinePayload = null;
        }
      }
      return {
        evidenceId: entity.rowKey as string,
        runId: (entity.runId as string) || null,
        storageLocator: (entity.storageLocator as string) || '',
        offloaded: entity.isOffloaded === true,
        inlinePayload,
      };
    }
    return null;
  }
}

/**
 * In-memory evidence store for mock/test mode.
 */
export class MockAdminEvidenceStore implements IAdminEvidenceService {
  private readonly store = new Map<string, { ref: IAdminEvidenceReference; retentionClass: EvidenceRetentionClass; inlinePayload?: Record<string, unknown> }>();

  async recordEvidence(
    ref: IAdminEvidenceReference,
    retentionClass: EvidenceRetentionClass,
    inlinePayload?: Record<string, unknown>,
  ): Promise<void> {
    this.store.set(ref.evidenceId, { ref, retentionClass, inlinePayload });
  }

  async listByRunId(runId: string): Promise<readonly IAdminEvidenceReference[]> {
    return [...this.store.values()]
      .filter(e => e.ref.runId === runId)
      .map(e => e.ref)
      .sort((a, b) => a.capturedAt.localeCompare(b.capturedAt));
  }

  async getEvidence(evidenceId: string): Promise<IAdminEvidenceReference | null> {
    return this.store.get(evidenceId)?.ref ?? null;
  }

  async getEvidencePayload(evidenceId: string): Promise<IAdminEvidencePayloadRecord | null> {
    const entry = this.store.get(evidenceId);
    if (!entry) {
      return null;
    }
    return {
      evidenceId: entry.ref.evidenceId,
      runId: entry.ref.runId,
      storageLocator: entry.ref.storageLocator,
      offloaded: false,
      inlinePayload: entry.inlinePayload ?? null,
    };
  }
}

// ── Serialization ──────────────────────────────────────────────────────────────

function deserializeEvidenceRef(entity: Record<string, unknown>): IAdminEvidenceReference {
  return {
    evidenceId: entity.rowKey as string,
    evidenceType: entity.evidenceType as IAdminEvidenceReference['evidenceType'],
    label: entity.label as string,
    runId: (entity.runId as string) || null,
    stepNumber: (entity.stepNumber as number) === -1 ? null : (entity.stepNumber as number),
    capturedAt: entity.capturedAt as string,
    storageLocator: entity.storageLocator as string,
  };
}
