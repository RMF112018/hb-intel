import type { IRiskCostItem, IRiskCostManagement, IPagedResult, IListQueryOptions } from '@hbc/models';

/**
 * Port interface for the Risk (risk cost management) domain.
 *
 * @example
 * ```ts
 * const repo = createRiskRepository();
 * const items = await repo.getItems('PRJ-001');
 * const mgmt = await repo.getManagement('PRJ-001');
 * ```
 */
export interface IRiskRepository {
  /**
   * Retrieve paginated risk cost items for a project.
   * @param projectId - The project identifier.
   * @param options - Pagination and sort options.
   * @returns Paginated result set of risk items.
   */
  getItems(projectId: string, options?: IListQueryOptions): Promise<IPagedResult<IRiskCostItem>>;

  /**
   * Retrieve a single risk item by its numeric ID.
   * @param id - The risk item ID.
   * @returns The risk item, or `null` if not found.
   */
  getItemById(id: number): Promise<IRiskCostItem | null>;

  /**
   * Create a new risk cost item.
   * @param data - Risk item data without the generated `id`.
   * @returns The newly created risk item.
   */
  createItem(data: Omit<IRiskCostItem, 'id'>): Promise<IRiskCostItem>;

  /**
   * Update an existing risk item.
   * @param id - The risk item ID to update.
   * @param data - Partial risk item data to merge.
   * @returns The updated risk item.
   * @throws {NotFoundError} If the risk item does not exist.
   */
  updateItem(id: number, data: Partial<IRiskCostItem>): Promise<IRiskCostItem>;

  /**
   * Delete a risk item by ID.
   * @param id - The risk item ID to remove.
   */
  deleteItem(id: number): Promise<void>;

  /**
   * Compute aggregate risk cost management data for a project.
   * @param projectId - The project identifier.
   * @returns Management summary with totalExposure, mitigatedAmount, contingencyBudget, and items.
   */
  getManagement(projectId: string): Promise<IRiskCostManagement>;
}
