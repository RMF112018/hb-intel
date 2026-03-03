import type { IEstimatingTracker, IEstimatingKickoff, IPagedResult, IListQueryOptions } from '@hbc/models';
import type { IEstimatingRepository } from '../../ports/IEstimatingRepository.js';
import { BaseRepository } from '../base.js';
import { paginate, genId } from './helpers.js';
import { SEED_ESTIMATING_TRACKERS, SEED_ESTIMATING_KICKOFFS } from './seedData.js';

export class MockEstimatingRepository extends BaseRepository<IEstimatingTracker> implements IEstimatingRepository {
  private trackers: IEstimatingTracker[] = [...SEED_ESTIMATING_TRACKERS];
  private kickoffs: IEstimatingKickoff[] = [...SEED_ESTIMATING_KICKOFFS];

  async getAllTrackers(options?: IListQueryOptions): Promise<IPagedResult<IEstimatingTracker>> {
    return paginate(this.trackers, options);
  }

  async getTrackerById(id: number): Promise<IEstimatingTracker | null> {
    this.validateId(id, 'EstimatingTracker');
    return this.trackers.find((t) => t.id === id) ?? null;
  }

  async createTracker(data: Omit<IEstimatingTracker, 'id' | 'createdAt' | 'updatedAt'>): Promise<IEstimatingTracker> {
    const tracker: IEstimatingTracker = {
      ...data,
      id: genId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.trackers.push(tracker);
    return tracker;
  }

  async updateTracker(id: number, data: Partial<IEstimatingTracker>): Promise<IEstimatingTracker> {
    this.validateId(id, 'EstimatingTracker');
    const idx = this.trackers.findIndex((t) => t.id === id);
    if (idx === -1) this.throwNotFound('EstimatingTracker', id);
    this.trackers[idx] = { ...this.trackers[idx], ...data, updatedAt: new Date().toISOString() };
    return this.trackers[idx];
  }

  async deleteTracker(id: number): Promise<void> {
    this.validateId(id, 'EstimatingTracker');
    this.trackers = this.trackers.filter((t) => t.id !== id);
  }

  async getKickoff(projectId: string): Promise<IEstimatingKickoff | null> {
    return this.kickoffs.find((k) => k.projectId === projectId) ?? null;
  }

  async createKickoff(data: Omit<IEstimatingKickoff, 'id' | 'createdAt'>): Promise<IEstimatingKickoff> {
    const kickoff: IEstimatingKickoff = {
      ...data,
      id: genId(),
      createdAt: new Date().toISOString(),
    };
    this.kickoffs.push(kickoff);
    return kickoff;
  }
}
