import type { IScorecardRepository } from '../../ports/IScorecardRepository.js';
import type { IGoNoGoScorecard, IScorecardVersion, IListQueryOptions, IPagedResult } from '@hbc/models';
import type { ProxyHttpClient } from './ProxyHttpClient.js';
import { BaseProxyProjectRepository } from './BaseProxyProjectRepository.js';
import { parseItemEnvelope } from './envelope.js';
import { buildResourcePath } from './paths.js';

export class ProxyScorecardRepository
  extends BaseProxyProjectRepository<IGoNoGoScorecard>
  implements IScorecardRepository
{
  protected readonly domain = 'scorecards';

  constructor(client: ProxyHttpClient) { super(client); }

  async getScorecards(projectId: string, options?: IListQueryOptions): Promise<IPagedResult<IGoNoGoScorecard>> {
    return this.fetchCollection(projectId, options);
  }

  async getScorecardById(id: number): Promise<IGoNoGoScorecard | null> {
    this.validateId(id, 'Scorecard');
    return this.fetchById(id);
  }

  async createScorecard(data: Omit<IGoNoGoScorecard, 'id' | 'createdAt' | 'updatedAt'>): Promise<IGoNoGoScorecard> {
    const raw = await this.client.post<unknown>(buildResourcePath(this.domain), data);
    return parseItemEnvelope<IGoNoGoScorecard>(raw);
  }

  async updateScorecard(id: number, data: Partial<IGoNoGoScorecard>): Promise<IGoNoGoScorecard> {
    this.validateId(id, 'Scorecard');
    return this.fetchUpdate(id, data) as Promise<IGoNoGoScorecard>;
  }

  async deleteScorecard(id: number): Promise<void> {
    this.validateId(id, 'Scorecard');
    return this.fetchDelete(id);
  }

  async getVersions(scorecardId: number): Promise<IScorecardVersion[]> {
    this.validateId(scorecardId, 'Scorecard');
    return this.fetchSubResource<IScorecardVersion>(scorecardId, 'versions');
  }
}
