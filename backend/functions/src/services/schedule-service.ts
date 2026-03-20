import { odata } from '@azure/data-tables';
import type { IScheduleActivity, IScheduleMetrics } from '@hbc/models';
import { createAppTableClient } from '../utils/table-client-factory.js';

const TABLE_NAME = 'HBScheduleActivities';

export interface IScheduleService {
  listActivities(projectId: string, page: number, pageSize: number): Promise<{ items: IScheduleActivity[]; total: number }>;
  getActivityById(id: number): Promise<IScheduleActivity | null>;
  createActivity(data: Omit<IScheduleActivity, 'id'>): Promise<IScheduleActivity>;
  updateActivity(id: number, data: Partial<IScheduleActivity>): Promise<IScheduleActivity | null>;
  deleteActivity(id: number): Promise<void>;
  getMetrics(projectId: string): Promise<IScheduleMetrics>;
}

// ---------------------------------------------------------------------------
// Real (Azure Table Storage)
// ---------------------------------------------------------------------------

export class RealScheduleService implements IScheduleService {
  private readonly client = createAppTableClient(TABLE_NAME);

  async listActivities(projectId: string, page: number, pageSize: number): Promise<{ items: IScheduleActivity[]; total: number }> {
    const all = await this.listByProject(projectId);
    const start = (page - 1) * pageSize;
    return { items: all.slice(start, start + pageSize), total: all.length };
  }

  async getActivityById(id: number): Promise<IScheduleActivity | null> {
    const all = await this.listAllEntities();
    return all.find((a) => a.id === id) ?? null;
  }

  async createActivity(data: Omit<IScheduleActivity, 'id'>): Promise<IScheduleActivity> {
    const id = Date.now();
    const activity: IScheduleActivity = { id, ...data };

    await this.client.upsertEntity(
      {
        partitionKey: data.projectId,
        rowKey: String(id),
        name: activity.name,
        startDate: activity.startDate,
        endDate: activity.endDate,
        percentComplete: activity.percentComplete,
        isCriticalPath: activity.isCriticalPath,
      },
      'Replace',
    );

    return activity;
  }

  async updateActivity(id: number, data: Partial<IScheduleActivity>): Promise<IScheduleActivity | null> {
    const existing = await this.getActivityById(id);
    if (!existing) return null;

    const updated: IScheduleActivity = { ...existing, ...data, id };

    await this.client.upsertEntity(
      {
        partitionKey: updated.projectId,
        rowKey: String(id),
        name: updated.name,
        startDate: updated.startDate,
        endDate: updated.endDate,
        percentComplete: updated.percentComplete,
        isCriticalPath: updated.isCriticalPath,
      },
      'Replace',
    );

    return updated;
  }

  async deleteActivity(id: number): Promise<void> {
    const existing = await this.getActivityById(id);
    if (!existing) return;
    try {
      await this.client.deleteEntity(existing.projectId, String(id));
    } catch (err: unknown) {
      if (!isNotFound(err)) throw err;
    }
  }

  async getMetrics(projectId: string): Promise<IScheduleMetrics> {
    const activities = await this.listByProject(projectId);
    const totalActivities = activities.length;
    const completedActivities = activities.filter((a) => a.percentComplete === 100).length;
    const overallPercentComplete =
      totalActivities > 0
        ? Math.round(activities.reduce((sum, a) => sum + a.percentComplete, 0) / totalActivities)
        : 0;

    return {
      projectId,
      totalActivities,
      completedActivities,
      criticalPathVariance: 0,
      overallPercentComplete,
    };
  }

  private async listByProject(projectId: string): Promise<IScheduleActivity[]> {
    const entities = this.client.listEntities<Record<string, unknown>>({
      queryOptions: { filter: odata`PartitionKey eq ${projectId}` },
    });
    const results: IScheduleActivity[] = [];
    for await (const entity of entities) {
      results.push(this.toActivity(entity));
    }
    return results;
  }

  private async listAllEntities(): Promise<IScheduleActivity[]> {
    const entities = this.client.listEntities<Record<string, unknown>>();
    const results: IScheduleActivity[] = [];
    for await (const entity of entities) {
      results.push(this.toActivity(entity));
    }
    return results;
  }

  private toActivity(entity: Record<string, unknown>): IScheduleActivity {
    return {
      id: Number(entity.rowKey),
      projectId: entity.partitionKey as string,
      name: entity.name as string,
      startDate: entity.startDate as string,
      endDate: entity.endDate as string,
      percentComplete: Number(entity.percentComplete),
      isCriticalPath: Boolean(entity.isCriticalPath),
    };
  }
}

// ---------------------------------------------------------------------------
// Mock (in-memory)
// ---------------------------------------------------------------------------

export class MockScheduleService implements IScheduleService {
  private readonly store = new Map<number, IScheduleActivity>([
    [1, { id: 1, projectId: 'PRJ-001', name: 'Foundation Excavation', startDate: '2026-01-15', endDate: '2026-03-01', percentComplete: 100, isCriticalPath: true }],
    [2, { id: 2, projectId: 'PRJ-001', name: 'Structural Steel Erection', startDate: '2026-03-02', endDate: '2026-06-15', percentComplete: 35, isCriticalPath: true }],
  ]);

  async listActivities(projectId: string, page: number, pageSize: number): Promise<{ items: IScheduleActivity[]; total: number }> {
    const all = [...this.store.values()].filter((a) => a.projectId === projectId);
    const start = (page - 1) * pageSize;
    return { items: all.slice(start, start + pageSize), total: all.length };
  }

  async getActivityById(id: number): Promise<IScheduleActivity | null> {
    return this.store.get(id) ?? null;
  }

  async createActivity(data: Omit<IScheduleActivity, 'id'>): Promise<IScheduleActivity> {
    const id = Date.now();
    const activity: IScheduleActivity = { id, ...data };
    this.store.set(id, activity);
    return activity;
  }

  async updateActivity(id: number, data: Partial<IScheduleActivity>): Promise<IScheduleActivity | null> {
    const existing = this.store.get(id);
    if (!existing) return null;
    const updated: IScheduleActivity = { ...existing, ...data, id };
    this.store.set(id, updated);
    return updated;
  }

  async deleteActivity(id: number): Promise<void> {
    this.store.delete(id);
  }

  async getMetrics(projectId: string): Promise<IScheduleMetrics> {
    const activities = [...this.store.values()].filter((a) => a.projectId === projectId);
    const totalActivities = activities.length;
    const completedActivities = activities.filter((a) => a.percentComplete === 100).length;
    const overallPercentComplete =
      totalActivities > 0
        ? Math.round(activities.reduce((sum, a) => sum + a.percentComplete, 0) / totalActivities)
        : 0;

    return {
      projectId,
      totalActivities,
      completedActivities,
      criticalPathVariance: 0,
      overallPercentComplete,
    };
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isNotFound(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'statusCode' in err && (err as { statusCode: number }).statusCode === 404;
}
