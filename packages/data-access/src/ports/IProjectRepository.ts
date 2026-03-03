import type { IActiveProject, IPortfolioSummary, IPagedResult, IListQueryOptions } from '@hbc/models';

/** Port interface for Project domain data operations. */
export interface IProjectRepository {
  getProjects(options?: IListQueryOptions): Promise<IPagedResult<IActiveProject>>;
  getProjectById(id: string): Promise<IActiveProject | null>;
  createProject(data: Omit<IActiveProject, 'id'>): Promise<IActiveProject>;
  updateProject(id: string, data: Partial<IActiveProject>): Promise<IActiveProject>;
  deleteProject(id: string): Promise<void>;
  getPortfolioSummary(): Promise<IPortfolioSummary>;
}
