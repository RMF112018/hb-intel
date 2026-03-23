/**
 * SF25-T03 — In-memory storage adapter (dev/test).
 */
import type { IPublishRequest } from '../types/index.js';
import type { IPublishAuditEntry } from '../model/governance.js';
import type { IPublishStorageAdapter, IPublishStorageRecord } from './IPublishStorageAdapter.js';

export class InMemoryPublishStorageAdapter implements IPublishStorageAdapter {
  readonly storageSystemId = 'in-memory';
  private records = new Map<string, IPublishStorageRecord>();

  async save(request: IPublishRequest): Promise<IPublishStorageRecord> {
    const now = new Date().toISOString();
    const record: IPublishStorageRecord = { publishRequestId: request.publishRequestId, request, storedAtIso: now, updatedAtIso: now, storageSystem: this.storageSystemId, auditTrail: [] };
    this.records.set(request.publishRequestId, record);
    return record;
  }
  async getByRequestId(id: string) { return this.records.get(id) ?? null; }
  async listByProject(_projectId: string, limit?: number) {
    const all = Array.from(this.records.values()).sort((a, b) => b.storedAtIso.localeCompare(a.storedAtIso));
    return limit ? all.slice(0, limit) : all;
  }
  async listPendingSync() { return Array.from(this.records.values()).filter(r => r.request.state === 'draft' || r.request.state === 'ready-for-review'); }
  async update(id: string, request: IPublishRequest) {
    const existing = this.records.get(id);
    if (!existing) throw new Error(`Not found: ${id}`);
    const updated = { ...existing, request, updatedAtIso: new Date().toISOString() };
    this.records.set(id, updated);
    return updated;
  }
  async appendAudit(id: string, entry: IPublishAuditEntry) {
    const existing = this.records.get(id);
    if (!existing) throw new Error(`Not found: ${id}`);
    this.records.set(id, { ...existing, auditTrail: [...existing.auditTrail, entry], updatedAtIso: new Date().toISOString() });
  }
  clear() { this.records.clear(); }
  size() { return this.records.size; }
}
