import type { IActiveProject, IPortfolioSummary, IPagedResult, IListQueryOptions } from '@hbc/models';
import type { IdempotencyContext } from '../retry/idempotency.js';

/**
 * Port interface for the Project (active project context and portfolio) domain.
 *
 * Note: Project IDs are strings (UUIDs), not numeric.
 *
 * @example
 * ```ts
 * const repo = createProjectRepository();
 * const projects = await repo.getProjects();
 * const summary = await repo.getPortfolioSummary();
 * ```
 */
export interface IProjectRepository {
  /**
   * Retrieve a paginated list of all projects.
   * @param options - Pagination and sort options.
   * @returns Paginated result set of projects.
   */
  getProjects(options?: IListQueryOptions): Promise<IPagedResult<IActiveProject>>;

  /**
   * Retrieve a single project by its string ID.
   * @param id - The project UUID.
   * @returns The project, or `null` if not found.
   */
  getProjectById(id: string): Promise<IActiveProject | null>;

  /**
   * Retrieve a single project by its project number (legacy reference key).
   * Used for dual-key inbound routing normalization (P3-A1 §3.4).
   * @param projectNumber - The project number (format: ##-###-##).
   * @returns The project, or `null` if not found.
   */
  getProjectByNumber(projectNumber: string): Promise<IActiveProject | null>;

  /**
   * Create a new project.
   * @param data - Project data without the generated `id`.
   * @returns The newly created project with a generated UUID.
   */
  createProject(data: Omit<IActiveProject, 'id'>, idempotencyContext?: IdempotencyContext): Promise<IActiveProject>;

  /**
   * Update an existing project.
   * @param id - The project UUID to update.
   * @param data - Partial project data to merge.
   * @returns The updated project.
   * @throws {NotFoundError} If the project does not exist.
   */
  updateProject(id: string, data: Partial<IActiveProject>, idempotencyContext?: IdempotencyContext): Promise<IActiveProject>;

  /**
   * Delete a project by ID.
   * @param id - The project UUID to remove.
   */
  deleteProject(id: string): Promise<void>;

  /**
   * Compute an aggregate portfolio summary across all projects.
   * @returns Summary with totalProjects, activeProjects, totalContractValue, averagePercentComplete.
   */
  getPortfolioSummary(): Promise<IPortfolioSummary>;
}
