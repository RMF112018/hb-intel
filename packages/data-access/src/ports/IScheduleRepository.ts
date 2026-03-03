import type { IScheduleActivity, IScheduleMetrics, IPagedResult, IListQueryOptions } from '@hbc/models';

/** Port interface for Schedule domain data operations. */
export interface IScheduleRepository {
  getActivities(projectId: string, options?: IListQueryOptions): Promise<IPagedResult<IScheduleActivity>>;
  getActivityById(id: number): Promise<IScheduleActivity | null>;
  createActivity(data: Omit<IScheduleActivity, 'id'>): Promise<IScheduleActivity>;
  updateActivity(id: number, data: Partial<IScheduleActivity>): Promise<IScheduleActivity>;
  deleteActivity(id: number): Promise<void>;
  getMetrics(projectId: string): Promise<IScheduleMetrics>;
}
