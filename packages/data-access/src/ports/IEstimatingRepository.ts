import type { IEstimatingTracker, IEstimatingKickoff, IPagedResult, IListQueryOptions } from '@hbc/models';

/** Port interface for Estimating domain data operations. */
export interface IEstimatingRepository {
  getAllTrackers(options?: IListQueryOptions): Promise<IPagedResult<IEstimatingTracker>>;
  getTrackerById(id: number): Promise<IEstimatingTracker | null>;
  createTracker(data: Omit<IEstimatingTracker, 'id' | 'createdAt' | 'updatedAt'>): Promise<IEstimatingTracker>;
  updateTracker(id: number, data: Partial<IEstimatingTracker>): Promise<IEstimatingTracker>;
  deleteTracker(id: number): Promise<void>;
  getKickoff(projectId: string): Promise<IEstimatingKickoff | null>;
  createKickoff(data: Omit<IEstimatingKickoff, 'id' | 'createdAt'>): Promise<IEstimatingKickoff>;
}
