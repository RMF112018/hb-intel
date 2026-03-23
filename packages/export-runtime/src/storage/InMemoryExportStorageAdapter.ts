/**
 * SF24-T03 — In-memory export storage adapter (dev/test).
 *
 * Implements IExportStorageAdapter with a simple Map. Not for production.
 * Provides clear() and size() utilities for test setup/teardown.
 *
 * Governing: SF24-T03, L-04 (offline resilience)
 */

import type { IExportRequest } from '../types/index.js';
import type { IExportAuditEntry } from '../model/governance.js';
import type { IExportStorageAdapter, IExportStorageRecord } from './IExportStorageAdapter.js';
import { EXPORT_RUNTIME_SYNC_STATUSES } from '../types/index.js';

/**
 * In-memory storage adapter for development and testing.
 * Records are lost on page reload — use SharePoint or IndexedDB for persistence.
 */
export class InMemoryExportStorageAdapter implements IExportStorageAdapter {
  readonly storageSystemId = 'in-memory';
  private records = new Map<string, IExportStorageRecord>();

  async save(request: IExportRequest): Promise<IExportStorageRecord> {
    const now = new Date().toISOString();
    const record: IExportStorageRecord = {
      requestId: request.requestId,
      request,
      storedAtIso: now,
      updatedAtIso: now,
      storageSystem: this.storageSystemId,
      auditTrail: [],
    };
    this.records.set(request.requestId, record);
    return record;
  }

  async getByRequestId(requestId: string): Promise<IExportStorageRecord | null> {
    return this.records.get(requestId) ?? null;
  }

  async listByProject(projectId: string, limit?: number): Promise<IExportStorageRecord[]> {
    const results = Array.from(this.records.values())
      .filter(r => r.request.context.projectId === projectId)
      .sort((a, b) => b.storedAtIso.localeCompare(a.storedAtIso));

    return limit !== undefined ? results.slice(0, limit) : results;
  }

  async listPendingSync(): Promise<IExportStorageRecord[]> {
    const syncStatuses = new Set<string>(EXPORT_RUNTIME_SYNC_STATUSES);
    return Array.from(this.records.values())
      .filter(r => r.request.receipt !== null && syncStatuses.has(r.request.receipt.status));
  }

  async update(requestId: string, request: IExportRequest): Promise<IExportStorageRecord> {
    const existing = this.records.get(requestId);
    if (!existing) throw new Error(`InMemoryExportStorage: record not found: ${requestId}`);

    const updated: IExportStorageRecord = {
      ...existing,
      request,
      updatedAtIso: new Date().toISOString(),
    };
    this.records.set(requestId, updated);
    return updated;
  }

  async appendAudit(requestId: string, entry: IExportAuditEntry): Promise<void> {
    const existing = this.records.get(requestId);
    if (!existing) throw new Error(`InMemoryExportStorage: record not found: ${requestId}`);

    const updated: IExportStorageRecord = {
      ...existing,
      auditTrail: [...existing.auditTrail, entry],
      updatedAtIso: new Date().toISOString(),
    };
    this.records.set(requestId, updated);
  }

  // ── Test Utilities ───────────────────────────────────────────────────

  /** Clear all stored records (test teardown). */
  clear(): void {
    this.records.clear();
  }

  /** Get the number of stored records (test assertions). */
  size(): number {
    return this.records.size;
  }
}
