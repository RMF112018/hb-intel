import type { IBuyoutEntry, IBuyoutSummary, IPagedResult, IListQueryOptions } from '@hbc/models';

/**
 * Port interface for the Buyout (procurement) domain.
 *
 * @example
 * ```ts
 * const repo = createBuyoutRepository();
 * const entries = await repo.getEntries('PRJ-001');
 * const summary = await repo.getSummary('PRJ-001');
 * ```
 */
export interface IBuyoutRepository {
  /**
   * Retrieve paginated buyout entries for a project.
   * @param projectId - The project identifier.
   * @param options - Pagination and sort options.
   * @returns Paginated result set of buyout entries.
   */
  getEntries(projectId: string, options?: IListQueryOptions): Promise<IPagedResult<IBuyoutEntry>>;

  /**
   * Retrieve a single buyout entry by its numeric ID.
   * @param id - The buyout entry ID.
   * @returns The entry, or `null` if not found.
   */
  getEntryById(id: number): Promise<IBuyoutEntry | null>;

  /**
   * Create a new buyout entry.
   * @param data - Entry data without the generated `id`.
   * @returns The newly created entry.
   */
  createEntry(data: Omit<IBuyoutEntry, 'id'>): Promise<IBuyoutEntry>;

  /**
   * Update an existing buyout entry.
   * @param id - The entry ID to update.
   * @param data - Partial entry data to merge.
   * @returns The updated entry.
   * @throws {NotFoundError} If the entry does not exist.
   */
  updateEntry(id: number, data: Partial<IBuyoutEntry>): Promise<IBuyoutEntry>;

  /**
   * Delete a buyout entry by ID.
   * @param id - The entry ID to remove.
   */
  deleteEntry(id: number): Promise<void>;

  /**
   * Compute aggregate buyout summary for a project.
   * @param projectId - The project identifier.
   * @returns Summary with totalBudget, totalCommitted, totalRemaining, percentBoughtOut.
   */
  getSummary(projectId: string): Promise<IBuyoutSummary>;
}
