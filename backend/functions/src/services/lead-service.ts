import { odata } from '@azure/data-tables';
import type { ILead, ILeadFormData } from '@hbc/models';
import { createAppTableClient } from '../utils/table-client-factory.js';

const TABLE_NAME = 'HBLeads';
const PARTITION_KEY = 'lead';

export interface ILeadService {
  list(page: number, pageSize: number): Promise<{ items: ILead[]; total: number }>;
  search(query: string, page: number, pageSize: number): Promise<{ items: ILead[]; total: number }>;
  getById(id: number): Promise<ILead | null>;
  create(data: ILeadFormData): Promise<ILead>;
  update(id: number, data: Partial<ILeadFormData>): Promise<ILead | null>;
  delete(id: number): Promise<void>;
}

// ---------------------------------------------------------------------------
// Real (Azure Table Storage)
// ---------------------------------------------------------------------------

export class RealLeadService implements ILeadService {
  private readonly client = createAppTableClient(TABLE_NAME);

  async list(page: number, pageSize: number): Promise<{ items: ILead[]; total: number }> {
    const all = await this.listAll();
    all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const start = (page - 1) * pageSize;
    return { items: all.slice(start, start + pageSize), total: all.length };
  }

  async search(query: string, page: number, pageSize: number): Promise<{ items: ILead[]; total: number }> {
    const all = await this.listAll();
    const q = query.toLowerCase();
    const filtered = all.filter(
      (lead) => lead.title.toLowerCase().includes(q) || lead.clientName.toLowerCase().includes(q),
    );
    filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const start = (page - 1) * pageSize;
    return { items: filtered.slice(start, start + pageSize), total: filtered.length };
  }

  async getById(id: number): Promise<ILead | null> {
    try {
      const entity = await this.client.getEntity<Record<string, unknown>>(PARTITION_KEY, String(id));
      return this.toILead(entity);
    } catch (err: unknown) {
      if (isNotFound(err)) return null;
      throw err;
    }
  }

  async create(data: ILeadFormData): Promise<ILead> {
    const id = Date.now();
    const now = new Date().toISOString();
    const lead: ILead = {
      id,
      title: data.title,
      stage: data.stage,
      clientName: data.clientName,
      estimatedValue: data.estimatedValue,
      createdAt: now,
      updatedAt: now,
    };

    await this.client.upsertEntity(
      {
        partitionKey: PARTITION_KEY,
        rowKey: String(id),
        title: lead.title,
        stage: lead.stage,
        clientName: lead.clientName,
        estimatedValue: lead.estimatedValue,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
      },
      'Replace',
    );

    return lead;
  }

  async update(id: number, data: Partial<ILeadFormData>): Promise<ILead | null> {
    const existing = await this.getById(id);
    if (!existing) return null;

    const updated: ILead = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await this.client.upsertEntity(
      {
        partitionKey: PARTITION_KEY,
        rowKey: String(id),
        title: updated.title,
        stage: updated.stage,
        clientName: updated.clientName,
        estimatedValue: updated.estimatedValue,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
      'Replace',
    );

    return updated;
  }

  async delete(id: number): Promise<void> {
    try {
      await this.client.deleteEntity(PARTITION_KEY, String(id));
    } catch (err: unknown) {
      if (!isNotFound(err)) throw err;
    }
  }

  private async listAll(): Promise<ILead[]> {
    const entities = this.client.listEntities<Record<string, unknown>>({
      queryOptions: { filter: odata`PartitionKey eq ${PARTITION_KEY}` },
    });
    const results: ILead[] = [];
    for await (const entity of entities) {
      results.push(this.toILead(entity));
    }
    return results;
  }

  private toILead(entity: Record<string, unknown>): ILead {
    return {
      id: Number(entity.rowKey),
      title: entity.title as string,
      stage: entity.stage as ILead['stage'],
      clientName: entity.clientName as string,
      estimatedValue: Number(entity.estimatedValue),
      createdAt: entity.createdAt as string,
      updatedAt: entity.updatedAt as string,
    };
  }
}

// ---------------------------------------------------------------------------
// Mock (in-memory)
// ---------------------------------------------------------------------------

export class MockLeadService implements ILeadService {
  private readonly store = new Map<number, ILead>([
    [1, { id: 1, title: 'City Center Tower', stage: 'Qualifying' as ILead['stage'], clientName: 'Metro Development Corp', estimatedValue: 45_000_000, createdAt: '2025-11-01T00:00:00Z', updatedAt: '2025-12-15T00:00:00Z' }],
    [2, { id: 2, title: 'Harbor Bridge Renovation', stage: 'Bidding' as ILead['stage'], clientName: 'State DOT', estimatedValue: 18_500_000, createdAt: '2025-10-10T00:00:00Z', updatedAt: '2026-01-05T00:00:00Z' }],
    [3, { id: 3, title: 'Airport Terminal Expansion', stage: 'Identified' as ILead['stage'], clientName: 'Regional Airport Authority', estimatedValue: 62_000_000, createdAt: '2026-01-15T00:00:00Z', updatedAt: '2026-01-15T00:00:00Z' }],
  ]);

  async list(page: number, pageSize: number): Promise<{ items: ILead[]; total: number }> {
    const all = [...this.store.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const start = (page - 1) * pageSize;
    return { items: all.slice(start, start + pageSize), total: all.length };
  }

  async search(query: string, page: number, pageSize: number): Promise<{ items: ILead[]; total: number }> {
    const q = query.toLowerCase();
    const filtered = [...this.store.values()].filter(
      (lead) => lead.title.toLowerCase().includes(q) || lead.clientName.toLowerCase().includes(q),
    );
    filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const start = (page - 1) * pageSize;
    return { items: filtered.slice(start, start + pageSize), total: filtered.length };
  }

  async getById(id: number): Promise<ILead | null> {
    return this.store.get(id) ?? null;
  }

  async create(data: ILeadFormData): Promise<ILead> {
    const id = Date.now();
    const now = new Date().toISOString();
    const lead: ILead = { id, ...data, createdAt: now, updatedAt: now };
    this.store.set(id, lead);
    return lead;
  }

  async update(id: number, data: Partial<ILeadFormData>): Promise<ILead | null> {
    const existing = this.store.get(id);
    if (!existing) return null;
    const updated: ILead = { ...existing, ...data, updatedAt: new Date().toISOString() };
    this.store.set(id, updated);
    return updated;
  }

  async delete(id: number): Promise<void> {
    this.store.delete(id);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isNotFound(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'statusCode' in err && (err as { statusCode: number }).statusCode === 404;
}
