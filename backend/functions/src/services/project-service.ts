import { odata } from '@azure/data-tables';
import { randomUUID } from 'node:crypto';
import type { IActiveProject, IPortfolioSummary } from '@hbc/models';
import { createAppTableClient } from '../utils/table-client-factory.js';

const TABLE_NAME = 'HBProjects';
const PARTITION_KEY = 'project';

export interface IProjectService {
  list(page: number, pageSize: number): Promise<{ items: IActiveProject[]; total: number }>;
  getById(id: string): Promise<IActiveProject | null>;
  create(data: Omit<IActiveProject, 'id'>): Promise<IActiveProject>;
  update(id: string, data: Partial<IActiveProject>): Promise<IActiveProject | null>;
  delete(id: string): Promise<void>;
  getPortfolioSummary(): Promise<IPortfolioSummary>;
}

// ---------------------------------------------------------------------------
// Real (Azure Table Storage)
// ---------------------------------------------------------------------------

export class RealProjectService implements IProjectService {
  private readonly client = createAppTableClient(TABLE_NAME);

  async list(page: number, pageSize: number): Promise<{ items: IActiveProject[]; total: number }> {
    const all = await this.listAll();
    const start = (page - 1) * pageSize;
    return { items: all.slice(start, start + pageSize), total: all.length };
  }

  async getById(id: string): Promise<IActiveProject | null> {
    try {
      const entity = await this.client.getEntity<Record<string, unknown>>(PARTITION_KEY, id);
      return this.toProject(entity);
    } catch (err: unknown) {
      if (isNotFound(err)) return null;
      throw err;
    }
  }

  async create(data: Omit<IActiveProject, 'id'>): Promise<IActiveProject> {
    const id = randomUUID();
    const project: IActiveProject = { id, ...data };

    await this.client.upsertEntity(
      {
        partitionKey: PARTITION_KEY,
        rowKey: id,
        name: project.name,
        number: project.number,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate,
      },
      'Replace',
    );

    return project;
  }

  async update(id: string, data: Partial<IActiveProject>): Promise<IActiveProject | null> {
    const existing = await this.getById(id);
    if (!existing) return null;

    const updated: IActiveProject = { ...existing, ...data, id };

    await this.client.upsertEntity(
      {
        partitionKey: PARTITION_KEY,
        rowKey: id,
        name: updated.name,
        number: updated.number,
        status: updated.status,
        startDate: updated.startDate,
        endDate: updated.endDate,
      },
      'Replace',
    );

    return updated;
  }

  async delete(id: string): Promise<void> {
    try {
      await this.client.deleteEntity(PARTITION_KEY, id);
    } catch (err: unknown) {
      if (!isNotFound(err)) throw err;
    }
  }

  async getPortfolioSummary(): Promise<IPortfolioSummary> {
    const all = await this.listAll();
    return {
      totalProjects: all.length,
      activeProjects: all.filter((p) => p.status === 'Active').length,
      totalContractValue: 0,
      averagePercentComplete: 0,
    };
  }

  private async listAll(): Promise<IActiveProject[]> {
    const entities = this.client.listEntities<Record<string, unknown>>({
      queryOptions: { filter: odata`PartitionKey eq ${PARTITION_KEY}` },
    });
    const results: IActiveProject[] = [];
    for await (const entity of entities) {
      results.push(this.toProject(entity));
    }
    return results;
  }

  private toProject(entity: Record<string, unknown>): IActiveProject {
    return {
      id: entity.rowKey as string,
      name: entity.name as string,
      number: entity.number as string,
      status: entity.status as string,
      startDate: entity.startDate as string,
      endDate: entity.endDate as string,
    };
  }
}

// ---------------------------------------------------------------------------
// Mock (in-memory)
// ---------------------------------------------------------------------------

export class MockProjectService implements IProjectService {
  private readonly store = new Map<string, IActiveProject>([
    ['proj-uuid-001', { id: 'proj-uuid-001', name: 'City Center Tower', number: 'PRJ-001', status: 'Active', startDate: '2026-01-01', endDate: '2028-06-30' }],
    ['proj-uuid-002', { id: 'proj-uuid-002', name: 'Harbor Bridge Renovation', number: 'PRJ-002', status: 'Active', startDate: '2026-03-01', endDate: '2027-12-31' }],
  ]);

  async list(page: number, pageSize: number): Promise<{ items: IActiveProject[]; total: number }> {
    const all = [...this.store.values()];
    const start = (page - 1) * pageSize;
    return { items: all.slice(start, start + pageSize), total: all.length };
  }

  async getById(id: string): Promise<IActiveProject | null> {
    return this.store.get(id) ?? null;
  }

  async create(data: Omit<IActiveProject, 'id'>): Promise<IActiveProject> {
    const id = randomUUID();
    const project: IActiveProject = { id, ...data };
    this.store.set(id, project);
    return project;
  }

  async update(id: string, data: Partial<IActiveProject>): Promise<IActiveProject | null> {
    const existing = this.store.get(id);
    if (!existing) return null;
    const updated: IActiveProject = { ...existing, ...data, id };
    this.store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  async getPortfolioSummary(): Promise<IPortfolioSummary> {
    const all = [...this.store.values()];
    return {
      totalProjects: all.length,
      activeProjects: all.filter((p) => p.status === 'Active').length,
      totalContractValue: 0,
      averagePercentComplete: 0,
    };
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isNotFound(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'statusCode' in err && (err as { statusCode: number }).statusCode === 404;
}
