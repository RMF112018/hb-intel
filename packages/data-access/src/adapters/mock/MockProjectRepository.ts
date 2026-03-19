import type { IActiveProject, IPortfolioSummary, IPagedResult, IListQueryOptions } from '@hbc/models';
import type { IProjectRepository } from '../../ports/IProjectRepository.js';
import type { IdempotencyContext } from '../../retry/idempotency.js';
import { BaseRepository } from '../base.js';
import { paginate } from './helpers.js';
import { SEED_PROJECTS } from './seedData.js';

export class MockProjectRepository extends BaseRepository<IActiveProject> implements IProjectRepository {
  private store: IActiveProject[] = [...SEED_PROJECTS];

  async getProjects(options?: IListQueryOptions): Promise<IPagedResult<IActiveProject>> {
    return paginate(this.store, options);
  }

  async getProjectById(id: string): Promise<IActiveProject | null> {
    this.validateId(id, 'Project');
    return this.store.find((p) => p.id === id) ?? null;
  }

  async createProject(data: Omit<IActiveProject, 'id'>, _idempotencyContext?: IdempotencyContext): Promise<IActiveProject> {
    const project: IActiveProject = {
      ...data,
      id: crypto.randomUUID(),
    };
    this.store.push(project);
    return project;
  }

  async updateProject(id: string, data: Partial<IActiveProject>, _idempotencyContext?: IdempotencyContext): Promise<IActiveProject> {
    this.validateId(id, 'Project');
    const idx = this.store.findIndex((p) => p.id === id);
    if (idx === -1) this.throwNotFound('Project', id);
    this.store[idx] = { ...this.store[idx], ...data };
    return this.store[idx];
  }

  async deleteProject(id: string): Promise<void> {
    this.validateId(id, 'Project');
    this.store = this.store.filter((p) => p.id !== id);
  }

  async getPortfolioSummary(): Promise<IPortfolioSummary> {
    const activeProjects = this.store.filter((p) => p.status === 'Active');
    return {
      totalProjects: this.store.length,
      activeProjects: activeProjects.length,
      totalContractValue: 0,
      averagePercentComplete: 0,
    };
  }
}
