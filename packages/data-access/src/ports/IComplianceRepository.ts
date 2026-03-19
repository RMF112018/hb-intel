import type { IComplianceEntry, IComplianceSummary, IPagedResult, IListQueryOptions } from '@hbc/models';
import type { IdempotencyContext } from '../retry/idempotency.js';

/**
 * Port interface for the Compliance (vendor requirement tracking) domain.
 *
 * @example
 * ```ts
 * const repo = createComplianceRepository();
 * const entries = await repo.getEntries('PRJ-001');
 * const summary = await repo.getSummary('PRJ-001');
 * ```
 */
export interface IComplianceRepository {
  /**
   * Retrieve paginated compliance entries for a project.
   * @param projectId - The project identifier.
   * @param options - Pagination and sort options.
   * @returns Paginated result set of compliance entries.
   */
  getEntries(projectId: string, options?: IListQueryOptions): Promise<IPagedResult<IComplianceEntry>>;

  /**
   * Retrieve a single compliance entry by its numeric ID.
   * @param id - The compliance entry ID.
   * @returns The entry, or `null` if not found.
   */
  getEntryById(id: number): Promise<IComplianceEntry | null>;

  /**
   * Create a new compliance entry.
   * @param data - Entry data without the generated `id`.
   * @returns The newly created entry.
   */
  createEntry(data: Omit<IComplianceEntry, 'id'>, idempotencyContext?: IdempotencyContext): Promise<IComplianceEntry>;

  /**
   * Update an existing compliance entry.
   * @param id - The entry ID to update.
   * @param data - Partial entry data to merge.
   * @returns The updated entry.
   * @throws {NotFoundError} If the entry does not exist.
   */
  updateEntry(id: number, data: Partial<IComplianceEntry>, idempotencyContext?: IdempotencyContext): Promise<IComplianceEntry>;

  /**
   * Delete a compliance entry by ID.
   * @param id - The entry ID to remove.
   */
  deleteEntry(id: number): Promise<void>;

  /**
   * Compute aggregate compliance summary for a project.
   * @param projectId - The project identifier.
   * @returns Summary with counts of compliant, nonCompliant, and expiringSoon entries.
   */
  getSummary(projectId: string): Promise<IComplianceSummary>;
}
