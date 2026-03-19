import { TableClient, odata } from '@azure/data-tables';
import type { IBuyoutEntry, IBuyoutSummary } from '@hbc/models';

const TABLE_NAME = 'HBBuyoutEntries';

export interface IBuyoutService {
  listEntries(projectId: string, page: number, pageSize: number): Promise<{ items: IBuyoutEntry[]; total: number }>;
  getEntryById(id: number): Promise<IBuyoutEntry | null>;
  createEntry(data: Omit<IBuyoutEntry, 'id'>): Promise<IBuyoutEntry>;
  updateEntry(id: number, data: Partial<IBuyoutEntry>): Promise<IBuyoutEntry | null>;
  deleteEntry(id: number): Promise<void>;
  getSummary(projectId: string): Promise<IBuyoutSummary>;
}

// ---------------------------------------------------------------------------
// Real (Azure Table Storage)
// ---------------------------------------------------------------------------

export class RealBuyoutService implements IBuyoutService {
  private readonly client: TableClient;

  constructor() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
    this.client = TableClient.fromConnectionString(connectionString, TABLE_NAME);
  }

  async listEntries(projectId: string, page: number, pageSize: number): Promise<{ items: IBuyoutEntry[]; total: number }> {
    const all = await this.listByProject(projectId);
    const start = (page - 1) * pageSize;
    return { items: all.slice(start, start + pageSize), total: all.length };
  }

  async getEntryById(id: number): Promise<IBuyoutEntry | null> {
    const all = await this.listAllEntities();
    return all.find((e) => e.id === id) ?? null;
  }

  async createEntry(data: Omit<IBuyoutEntry, 'id'>): Promise<IBuyoutEntry> {
    const id = Date.now();
    const entry: IBuyoutEntry = { id, ...data };

    await this.client.upsertEntity(
      {
        partitionKey: data.projectId,
        rowKey: String(id),
        costCode: entry.costCode,
        description: entry.description,
        budgetAmount: entry.budgetAmount,
        committedAmount: entry.committedAmount,
        status: entry.status,
      },
      'Replace',
    );

    return entry;
  }

  async updateEntry(id: number, data: Partial<IBuyoutEntry>): Promise<IBuyoutEntry | null> {
    const existing = await this.getEntryById(id);
    if (!existing) return null;

    const updated: IBuyoutEntry = { ...existing, ...data, id };

    await this.client.upsertEntity(
      {
        partitionKey: updated.projectId,
        rowKey: String(id),
        costCode: updated.costCode,
        description: updated.description,
        budgetAmount: updated.budgetAmount,
        committedAmount: updated.committedAmount,
        status: updated.status,
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

  async getSummary(projectId: string): Promise<IBuyoutSummary> {
    const entries = await this.listByProject(projectId);
    const totalBudget = entries.reduce((sum, e) => sum + e.budgetAmount, 0);
    const totalCommitted = entries.reduce((sum, e) => sum + e.committedAmount, 0);

    return {
      projectId,
      totalBudget,
      totalCommitted,
      totalRemaining: totalBudget - totalCommitted,
      percentBoughtOut: totalBudget > 0 ? Math.round((totalCommitted / totalBudget) * 100) : 0,
    };
  }

  private async listByProject(projectId: string): Promise<IBuyoutEntry[]> {
    const entities = this.client.listEntities<Record<string, unknown>>({
      queryOptions: { filter: odata`PartitionKey eq ${projectId}` },
    });
    const results: IBuyoutEntry[] = [];
    for await (const entity of entities) {
      results.push(this.toEntry(entity));
    }
    return results;
  }

  private async listAllEntities(): Promise<IBuyoutEntry[]> {
    const entities = this.client.listEntities<Record<string, unknown>>();
    const results: IBuyoutEntry[] = [];
    for await (const entity of entities) {
      results.push(this.toEntry(entity));
    }
    return results;
  }

  private toEntry(entity: Record<string, unknown>): IBuyoutEntry {
    return {
      id: Number(entity.rowKey),
      projectId: entity.partitionKey as string,
      costCode: entity.costCode as string,
      description: entity.description as string,
      budgetAmount: Number(entity.budgetAmount),
      committedAmount: Number(entity.committedAmount),
      status: entity.status as string,
    };
  }
}

// ---------------------------------------------------------------------------
// Mock (in-memory)
// ---------------------------------------------------------------------------

export class MockBuyoutService implements IBuyoutService {
  private readonly store = new Map<number, IBuyoutEntry>([
    [1, { id: 1, projectId: 'PRJ-001', costCode: '03-3100', description: 'Structural Concrete', budgetAmount: 2_400_000, committedAmount: 2_150_000, status: 'Committed' }],
    [2, { id: 2, projectId: 'PRJ-001', costCode: '05-1200', description: 'Structural Steel', budgetAmount: 3_800_000, committedAmount: 0, status: 'Pending' }],
  ]);

  async listEntries(projectId: string, page: number, pageSize: number): Promise<{ items: IBuyoutEntry[]; total: number }> {
    const all = [...this.store.values()].filter((e) => e.projectId === projectId);
    const start = (page - 1) * pageSize;
    return { items: all.slice(start, start + pageSize), total: all.length };
  }

  async getEntryById(id: number): Promise<IBuyoutEntry | null> {
    return this.store.get(id) ?? null;
  }

  async createEntry(data: Omit<IBuyoutEntry, 'id'>): Promise<IBuyoutEntry> {
    const id = Date.now();
    const entry: IBuyoutEntry = { id, ...data };
    this.store.set(id, entry);
    return entry;
  }

  async updateEntry(id: number, data: Partial<IBuyoutEntry>): Promise<IBuyoutEntry | null> {
    const existing = this.store.get(id);
    if (!existing) return null;
    const updated: IBuyoutEntry = { ...existing, ...data, id };
    this.store.set(id, updated);
    return updated;
  }

  async deleteEntry(id: number): Promise<void> {
    this.store.delete(id);
  }

  async getSummary(projectId: string): Promise<IBuyoutSummary> {
    const entries = [...this.store.values()].filter((e) => e.projectId === projectId);
    const totalBudget = entries.reduce((sum, e) => sum + e.budgetAmount, 0);
    const totalCommitted = entries.reduce((sum, e) => sum + e.committedAmount, 0);

    return {
      projectId,
      totalBudget,
      totalCommitted,
      totalRemaining: totalBudget - totalCommitted,
      percentBoughtOut: totalBudget > 0 ? Math.round((totalCommitted / totalBudget) * 100) : 0,
    };
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isNotFound(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'statusCode' in err && (err as { statusCode: number }).statusCode === 404;
}
