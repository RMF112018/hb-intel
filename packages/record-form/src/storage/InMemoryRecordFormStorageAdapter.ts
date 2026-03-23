/**
 * SF23-T03 — In-memory record form storage adapter (dev/test).
 *
 * Governing: SF23-T03, L-04 (offline resilience)
 */

import type { IRecordFormState } from '../types/index.js';
import type { IRecordFormAuditEntry } from '../model/governance.js';
import type { IRecordFormStorageAdapter, IRecordFormStorageRecord } from './IRecordFormStorageAdapter.js';

const SYNC_STATUSES = new Set(['saved-locally', 'queued-to-sync']);

export class InMemoryRecordFormStorageAdapter implements IRecordFormStorageAdapter {
  readonly storageSystemId = 'in-memory';
  private records = new Map<string, IRecordFormStorageRecord>();

  async save(state: IRecordFormState): Promise<IRecordFormStorageRecord> {
    const now = new Date().toISOString();
    const record: IRecordFormStorageRecord = {
      draftId: state.draft.draftId,
      state,
      storedAtIso: now,
      updatedAtIso: now,
      storageSystem: this.storageSystemId,
      auditTrail: [],
    };
    this.records.set(state.draft.draftId, record);
    return record;
  }

  async getByDraftId(draftId: string): Promise<IRecordFormStorageRecord | null> {
    return this.records.get(draftId) ?? null;
  }

  async listByProject(projectId: string, limit?: number): Promise<IRecordFormStorageRecord[]> {
    const results = Array.from(this.records.values())
      .filter(r => r.state.draft.projectId === projectId)
      .sort((a, b) => b.storedAtIso.localeCompare(a.storedAtIso));
    return limit !== undefined ? results.slice(0, limit) : results;
  }

  async listPendingSync(): Promise<IRecordFormStorageRecord[]> {
    return Array.from(this.records.values())
      .filter(r => SYNC_STATUSES.has(r.state.sync.state));
  }

  async update(draftId: string, state: IRecordFormState): Promise<IRecordFormStorageRecord> {
    const existing = this.records.get(draftId);
    if (!existing) throw new Error(`InMemoryRecordFormStorage: not found: ${draftId}`);
    const updated: IRecordFormStorageRecord = { ...existing, state, updatedAtIso: new Date().toISOString() };
    this.records.set(draftId, updated);
    return updated;
  }

  async appendAudit(draftId: string, entry: IRecordFormAuditEntry): Promise<void> {
    const existing = this.records.get(draftId);
    if (!existing) throw new Error(`InMemoryRecordFormStorage: not found: ${draftId}`);
    this.records.set(draftId, { ...existing, auditTrail: [...existing.auditTrail, entry], updatedAtIso: new Date().toISOString() });
  }

  clear(): void { this.records.clear(); }
  size(): number { return this.records.size; }
}
