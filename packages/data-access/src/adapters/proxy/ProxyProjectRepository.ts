import type { IProjectRepository } from '../../ports/IProjectRepository.js';
import type { IActiveProject, IPortfolioSummary, IListQueryOptions, IPagedResult } from '@hbc/models';
import type { ProxyHttpClient, RequestMetadata } from './ProxyHttpClient.js';
import type { IdempotencyContext } from '../../retry/idempotency.js';
import { BaseRepository } from '../base.js';
import { NotFoundError } from '../../errors/index.js';
import { parseItemEnvelope, parsePagedEnvelope } from './envelope.js';
import { buildResourcePath, buildQueryParams } from './paths.js';

/**
 * Proxy repository for the Project domain (top-level, non-scoped).
 *
 * Projects define the scope for other domains (schedules, contracts, etc.)
 * and are themselves retrieved from `/api/projects` endpoints.
 */
export class ProxyProjectRepository extends BaseRepository<IActiveProject> implements IProjectRepository {
  constructor(private readonly client: ProxyHttpClient) {
    super();
  }

  async getProjects(options?: IListQueryOptions): Promise<IPagedResult<IActiveProject>> {
    const raw = await this.client.get<unknown>(
      buildResourcePath('projects'),
      buildQueryParams(options),
      { domain: 'projects', operation: 'getProjects' },
    );
    return parsePagedEnvelope<IActiveProject>(raw);
  }

  async getProjectById(id: string): Promise<IActiveProject | null> {
    this.validateId(id, 'Project');
    try {
      const raw = await this.client.get<unknown>(buildResourcePath('projects', id), undefined, { domain: 'projects', operation: 'getProjectById' });
      return parseItemEnvelope<IActiveProject>(raw);
    } catch (err) {
      if (err instanceof NotFoundError) return null;
      throw err;
    }
  }

  async createProject(data: Omit<IActiveProject, 'id'>, idempotencyContext?: IdempotencyContext): Promise<IActiveProject> {
    const raw = await this.client.post<unknown>(buildResourcePath('projects'), data, { domain: 'projects', operation: 'createProject' }, idempotencyContext);
    return parseItemEnvelope<IActiveProject>(raw);
  }

  async updateProject(id: string, data: Partial<IActiveProject>, idempotencyContext?: IdempotencyContext): Promise<IActiveProject> {
    this.validateId(id, 'Project');
    const raw = await this.client.put<unknown>(buildResourcePath('projects', id), data, { domain: 'projects', operation: 'updateProject' }, idempotencyContext);
    return parseItemEnvelope<IActiveProject>(raw);
  }

  async deleteProject(id: string): Promise<void> {
    this.validateId(id, 'Project');
    await this.client.delete(buildResourcePath('projects', id), { domain: 'projects', operation: 'deleteProject' });
  }

  async getPortfolioSummary(): Promise<IPortfolioSummary> {
    const raw = await this.client.get<unknown>(buildResourcePath('projects', 'summary'), undefined, { domain: 'projects', operation: 'getPortfolioSummary' });
    return parseItemEnvelope<IPortfolioSummary>(raw);
  }
}
