import type { IScheduleActivity, IScheduleMetrics, IPagedResult, IListQueryOptions } from '@hbc/models';
import type { IScheduleRepository } from '../../ports/IScheduleRepository.js';
import { BaseRepository } from '../base.js';
import { paginate, genId } from './helpers.js';
import { SEED_SCHEDULE_ACTIVITIES } from './seedData.js';

export class MockScheduleRepository extends BaseRepository<IScheduleActivity> implements IScheduleRepository {
  private store: IScheduleActivity[] = [...SEED_SCHEDULE_ACTIVITIES];

  async getActivities(projectId: string, options?: IListQueryOptions): Promise<IPagedResult<IScheduleActivity>> {
    const filtered = this.store.filter((a) => a.projectId === projectId);
    return paginate(filtered, options);
  }

  async getActivityById(id: number): Promise<IScheduleActivity | null> {
    this.validateId(id, 'Activity');
    return this.store.find((a) => a.id === id) ?? null;
  }

  async createActivity(data: Omit<IScheduleActivity, 'id'>): Promise<IScheduleActivity> {
    const activity: IScheduleActivity = { ...data, id: genId() };
    this.store.push(activity);
    return activity;
  }

  async updateActivity(id: number, data: Partial<IScheduleActivity>): Promise<IScheduleActivity> {
    this.validateId(id, 'Activity');
    const idx = this.store.findIndex((a) => a.id === id);
    if (idx === -1) this.throwNotFound('Activity', id);
    this.store[idx] = { ...this.store[idx], ...data };
    return this.store[idx];
  }

  async deleteActivity(id: number): Promise<void> {
    this.validateId(id, 'Activity');
    this.store = this.store.filter((a) => a.id !== id);
  }

  async getMetrics(projectId: string): Promise<IScheduleMetrics> {
    const activities = this.store.filter((a) => a.projectId === projectId);
    const completed = activities.filter((a) => a.percentComplete === 100).length;
    const cpVariance = activities.filter((a) => a.isCriticalPath).length > 0 ? 2 : 0;
    const avgPercent = activities.length > 0
      ? activities.reduce((sum, a) => sum + a.percentComplete, 0) / activities.length
      : 0;
    return {
      projectId,
      totalActivities: activities.length,
      completedActivities: completed,
      criticalPathVariance: cpVariance,
      overallPercentComplete: Math.round(avgPercent),
    };
  }
}
