import { TableClient, odata } from '@azure/data-tables';
import type { IRiskCostItem, IRiskCostManagement } from '@hbc/models';

const TABLE_NAME = 'HBRiskItems';

export interface IRiskService {
  listItems(projectId: string, page: number, pageSize: number): Promise<{ items: IRiskCostItem[]; total: number }>;
  getItemById(id: number): Promise<IRiskCostItem | null>;
  createItem(data: Omit<IRiskCostItem, 'id'>): Promise<IRiskCostItem>;
  updateItem(id: number, data: Partial<IRiskCostItem>): Promise<IRiskCostItem | null>;
  deleteItem(id: number): Promise<void>;
  getManagement(projectId: string): Promise<IRiskCostManagement>;
}

// ---------------------------------------------------------------------------
// Real (Azure Table Storage)
// ---------------------------------------------------------------------------

export class RealRiskService implements IRiskService {
  private readonly client: TableClient;

  constructor() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
    this.client = TableClient.fromConnectionString(connectionString, TABLE_NAME);
  }

  async listItems(projectId: string, page: number, pageSize: number): Promise<{ items: IRiskCostItem[]; total: number }> {
    const all = await this.listByProject(projectId);
    const start = (page - 1) * pageSize;
    return { items: all.slice(start, start + pageSize), total: all.length };
  }

  async getItemById(id: number): Promise<IRiskCostItem | null> {
    const all = await this.listAllEntities();
    return all.find((i) => i.id === id) ?? null;
  }

  async createItem(data: Omit<IRiskCostItem, 'id'>): Promise<IRiskCostItem> {
    const id = Date.now();
    const item: IRiskCostItem = { id, ...data };
    await this.client.upsertEntity(
      { partitionKey: data.projectId, rowKey: String(id), description: item.description, category: item.category, estimatedImpact: item.estimatedImpact, probability: item.probability, status: item.status },
      'Replace',
    );
    return item;
  }

  async updateItem(id: number, data: Partial<IRiskCostItem>): Promise<IRiskCostItem | null> {
    const existing = await this.getItemById(id);
    if (!existing) return null;
    const updated: IRiskCostItem = { ...existing, ...data, id };
    await this.client.upsertEntity(
      { partitionKey: updated.projectId, rowKey: String(id), description: updated.description, category: updated.category, estimatedImpact: updated.estimatedImpact, probability: updated.probability, status: updated.status },
      'Replace',
    );
    return updated;
  }

  async deleteItem(id: number): Promise<void> {
    const existing = await this.getItemById(id);
    if (!existing) return;
    try { await this.client.deleteEntity(existing.projectId, String(id)); } catch (err: unknown) { if (!isNotFound(err)) throw err; }
  }

  async getManagement(projectId: string): Promise<IRiskCostManagement> {
    const items = await this.listByProject(projectId);
    return {
      projectId,
      totalExposure: items.reduce((sum, i) => sum + i.estimatedImpact * i.probability, 0),
      mitigatedAmount: 0,
      contingencyBudget: 0,
      items,
    };
  }

  private async listByProject(projectId: string): Promise<IRiskCostItem[]> {
    const entities = this.client.listEntities<Record<string, unknown>>({
      queryOptions: { filter: odata`PartitionKey eq ${projectId}` },
    });
    const results: IRiskCostItem[] = [];
    for await (const entity of entities) { results.push(this.toItem(entity)); }
    return results;
  }

  private async listAllEntities(): Promise<IRiskCostItem[]> {
    const entities = this.client.listEntities<Record<string, unknown>>();
    const results: IRiskCostItem[] = [];
    for await (const entity of entities) { results.push(this.toItem(entity)); }
    return results;
  }

  private toItem(entity: Record<string, unknown>): IRiskCostItem {
    return { id: Number(entity.rowKey), projectId: entity.partitionKey as string, description: entity.description as string, category: entity.category as string, estimatedImpact: Number(entity.estimatedImpact), probability: Number(entity.probability), status: entity.status as string };
  }
}

// ---------------------------------------------------------------------------
// Mock (in-memory)
// ---------------------------------------------------------------------------

export class MockRiskService implements IRiskService {
  private readonly store = new Map<number, IRiskCostItem>([
    [1, { id: 1, projectId: 'PRJ-001', description: 'Steel price escalation beyond budget allowance', category: 'Financial', estimatedImpact: 450_000, probability: 0.35, status: 'Open' }],
    [2, { id: 2, projectId: 'PRJ-001', description: 'Subcontractor workforce shortage during peak season', category: 'Schedule', estimatedImpact: 220_000, probability: 0.5, status: 'Mitigating' }],
  ]);

  async listItems(projectId: string, page: number, pageSize: number): Promise<{ items: IRiskCostItem[]; total: number }> {
    const all = [...this.store.values()].filter((i) => i.projectId === projectId);
    const start = (page - 1) * pageSize;
    return { items: all.slice(start, start + pageSize), total: all.length };
  }

  async getItemById(id: number): Promise<IRiskCostItem | null> { return this.store.get(id) ?? null; }

  async createItem(data: Omit<IRiskCostItem, 'id'>): Promise<IRiskCostItem> {
    const id = Date.now();
    const item: IRiskCostItem = { id, ...data };
    this.store.set(id, item);
    return item;
  }

  async updateItem(id: number, data: Partial<IRiskCostItem>): Promise<IRiskCostItem | null> {
    const existing = this.store.get(id);
    if (!existing) return null;
    const updated: IRiskCostItem = { ...existing, ...data, id };
    this.store.set(id, updated);
    return updated;
  }

  async deleteItem(id: number): Promise<void> { this.store.delete(id); }

  async getManagement(projectId: string): Promise<IRiskCostManagement> {
    const items = [...this.store.values()].filter((i) => i.projectId === projectId);
    return {
      projectId,
      totalExposure: items.reduce((sum, i) => sum + i.estimatedImpact * i.probability, 0),
      mitigatedAmount: 0,
      contingencyBudget: 0,
      items,
    };
  }
}

function isNotFound(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'statusCode' in err && (err as { statusCode: number }).statusCode === 404;
}
