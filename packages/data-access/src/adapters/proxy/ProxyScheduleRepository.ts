import type { IScheduleRepository } from '../../ports/IScheduleRepository.js';
import type { IScheduleActivity, IScheduleMetrics, IListQueryOptions, IPagedResult } from '@hbc/models';
import type { ProxyHttpClient } from './ProxyHttpClient.js';
import { BaseProxyProjectRepository } from './BaseProxyProjectRepository.js';
import { parseItemEnvelope } from './envelope.js';
import { buildResourcePath } from './paths.js';

export class ProxyScheduleRepository
  extends BaseProxyProjectRepository<IScheduleActivity>
  implements IScheduleRepository
{
  protected readonly domain = 'schedules';

  constructor(client: ProxyHttpClient) { super(client); }

  async getActivities(projectId: string, options?: IListQueryOptions): Promise<IPagedResult<IScheduleActivity>> {
    return this.fetchCollection(projectId, options);
  }

  async getActivityById(id: number): Promise<IScheduleActivity | null> {
    this.validateId(id, 'ScheduleActivity');
    return this.fetchById(id);
  }

  async createActivity(data: Omit<IScheduleActivity, 'id'>): Promise<IScheduleActivity> {
    const raw = await this.client.post<unknown>(buildResourcePath(this.domain), data);
    return parseItemEnvelope<IScheduleActivity>(raw);
  }

  async updateActivity(id: number, data: Partial<IScheduleActivity>): Promise<IScheduleActivity> {
    this.validateId(id, 'ScheduleActivity');
    return this.fetchUpdate(id, data) as Promise<IScheduleActivity>;
  }

  async deleteActivity(id: number): Promise<void> {
    this.validateId(id, 'ScheduleActivity');
    return this.fetchDelete(id);
  }

  async getMetrics(projectId: string): Promise<IScheduleMetrics> {
    return this.fetchAggregate<IScheduleMetrics>(projectId, 'metrics');
  }
}
