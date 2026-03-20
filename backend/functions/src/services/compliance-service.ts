import { odata } from '@azure/data-tables';
import type { IComplianceEntry, IComplianceSummary } from '@hbc/models';
import { createAppTableClient } from '../utils/table-client-factory.js';

const TABLE_NAME = 'HBComplianceEntries';

export interface IComplianceService {
  listEntries(projectId: string, page: number, pageSize: number): Promise<{ items: IComplianceEntry[]; total: number }>;
  getEntryById(id: number): Promise<IComplianceEntry | null>;
  createEntry(data: Omit<IComplianceEntry, 'id'>): Promise<IComplianceEntry>;
  updateEntry(id: number, data: Partial<IComplianceEntry>): Promise<IComplianceEntry | null>;
  deleteEntry(id: number): Promise<void>;
  getSummary(projectId: string): Promise<IComplianceSummary>;
}

// ---------------------------------------------------------------------------
// Real (Azure Table Storage)
// ---------------------------------------------------------------------------

export class RealComplianceService implements IComplianceService {
  private readonly client = createAppTableClient(TABLE_NAME);

  async listEntries(projectId: string, page: number, pageSize: number): Promise<{ items: IComplianceEntry[]; total: number }> {
    const all = await this.listByProject(projectId);
    const start = (page - 1) * pageSize;
    return { items: all.slice(start, start + pageSize), total: all.length };
  }

  async getEntryById(id: number): Promise<IComplianceEntry | null> {
    const all = await this.listAllEntities();
    return all.find((e) => e.id === id) ?? null;
  }

  async createEntry(data: Omit<IComplianceEntry, 'id'>): Promise<IComplianceEntry> {
    const id = Date.now();
    const entry: IComplianceEntry = { id, ...data };

    await this.client.upsertEntity(
      {
        partitionKey: data.projectId,
        rowKey: String(id),
        vendorName: entry.vendorName,
        requirementType: entry.requirementType,
        status: entry.status,
        expirationDate: entry.expirationDate,
      },
      'Replace',
    );

    return entry;
  }

  async updateEntry(id: number, data: Partial<IComplianceEntry>): Promise<IComplianceEntry | null> {
    const existing = await this.getEntryById(id);
    if (!existing) return null;

    const updated: IComplianceEntry = { ...existing, ...data, id };

    await this.client.upsertEntity(
      {
        partitionKey: updated.projectId,
        rowKey: String(id),
        vendorName: updated.vendorName,
        requirementType: updated.requirementType,
        status: updated.status,
        expirationDate: updated.expirationDate,
      },
      'Replace',
    );

    return updated;
  }

  async deleteEntry(id: number): Promise<void> {
    const existing = await this.getEntryById(id);
    if (!existing) return;
    try {
      await this.client.deleteEntity(existing.projectId, String(id));
    } catch (err: unknown) {
      if (!isNotFound(err)) throw err;
    }
  }

  async getSummary(projectId: string): Promise<IComplianceSummary> {
    const entries = await this.listByProject(projectId);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return {
      projectId,
      totalEntries: entries.length,
      compliant: entries.filter((e) => e.status === 'Compliant').length,
      nonCompliant: entries.filter((e) => e.status === 'NonCompliant').length,
      expiringSoon: entries.filter((e) => {
        const expDate = new Date(e.expirationDate);
        return expDate > now && expDate <= thirtyDaysFromNow;
      }).length,
    };
  }

  private async listByProject(projectId: string): Promise<IComplianceEntry[]> {
    const entities = this.client.listEntities<Record<string, unknown>>({
      queryOptions: { filter: odata`PartitionKey eq ${projectId}` },
    });
    const results: IComplianceEntry[] = [];
    for await (const entity of entities) {
      results.push(this.toEntry(entity));
    }
    return results;
  }

  private async listAllEntities(): Promise<IComplianceEntry[]> {
    const entities = this.client.listEntities<Record<string, unknown>>();
    const results: IComplianceEntry[] = [];
    for await (const entity of entities) {
      results.push(this.toEntry(entity));
    }
    return results;
  }

  private toEntry(entity: Record<string, unknown>): IComplianceEntry {
    return {
      id: Number(entity.rowKey),
      projectId: entity.partitionKey as string,
      vendorName: entity.vendorName as string,
      requirementType: entity.requirementType as string,
      status: entity.status as string,
      expirationDate: entity.expirationDate as string,
    };
  }
}

// ---------------------------------------------------------------------------
// Mock (in-memory)
// ---------------------------------------------------------------------------

export class MockComplianceService implements IComplianceService {
  private readonly store = new Map<number, IComplianceEntry>([
    [1, { id: 1, projectId: 'PRJ-001', vendorName: 'Acme Concrete LLC', requirementType: 'Insurance', status: 'Compliant', expirationDate: '2027-01-15' }],
    [2, { id: 2, projectId: 'PRJ-001', vendorName: 'Steel Works Inc', requirementType: 'License', status: 'ExpiringSoon', expirationDate: '2026-04-01' }],
  ]);

  async listEntries(projectId: string, page: number, pageSize: number): Promise<{ items: IComplianceEntry[]; total: number }> {
    const all = [...this.store.values()].filter((e) => e.projectId === projectId);
    const start = (page - 1) * pageSize;
    return { items: all.slice(start, start + pageSize), total: all.length };
  }

  async getEntryById(id: number): Promise<IComplianceEntry | null> {
    return this.store.get(id) ?? null;
  }

  async createEntry(data: Omit<IComplianceEntry, 'id'>): Promise<IComplianceEntry> {
    const id = Date.now();
    const entry: IComplianceEntry = { id, ...data };
    this.store.set(id, entry);
    return entry;
  }

  async updateEntry(id: number, data: Partial<IComplianceEntry>): Promise<IComplianceEntry | null> {
    const existing = this.store.get(id);
    if (!existing) return null;
    const updated: IComplianceEntry = { ...existing, ...data, id };
    this.store.set(id, updated);
    return updated;
  }

  async deleteEntry(id: number): Promise<void> {
    this.store.delete(id);
  }

  async getSummary(projectId: string): Promise<IComplianceSummary> {
    const entries = [...this.store.values()].filter((e) => e.projectId === projectId);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return {
      projectId,
      totalEntries: entries.length,
      compliant: entries.filter((e) => e.status === 'Compliant').length,
      nonCompliant: entries.filter((e) => e.status === 'NonCompliant').length,
      expiringSoon: entries.filter((e) => {
        const expDate = new Date(e.expirationDate);
        return expDate > now && expDate <= thirtyDaysFromNow;
      }).length,
    };
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isNotFound(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'statusCode' in err && (err as { statusCode: number }).statusCode === 404;
}
