import type { ILead, ILeadFormData, IPagedResult, IListQueryOptions } from '@hbc/models';
import type { IdempotencyContext } from '../retry/idempotency.js';

/**
 * Port interface for the Lead (business development pipeline) domain.
 *
 * @example
 * ```ts
 * const repo = createLeadRepository();
 * const page = await repo.getAll({ page: 1, pageSize: 10 });
 * ```
 */
export interface ILeadRepository {
  /**
   * Retrieve a paginated list of all leads.
   * @param options - Pagination and sort options.
   * @returns Paginated result set of leads.
   */
  getAll(options?: IListQueryOptions): Promise<IPagedResult<ILead>>;

  /**
   * Retrieve a single lead by its numeric ID.
   * @param id - The lead ID.
   * @returns The lead, or `null` if not found.
   */
  getById(id: number): Promise<ILead | null>;

  /**
   * Create a new lead.
   * @param data - Lead form data (title, stage, clientName, estimatedValue).
   * @returns The newly created lead with generated `id` and timestamps.
   */
  create(data: ILeadFormData, idempotencyContext?: IdempotencyContext): Promise<ILead>;

  /**
   * Update an existing lead.
   * @param id - The lead ID to update.
   * @param data - Partial lead form data to merge.
   * @returns The updated lead.
   * @throws {NotFoundError} If the lead does not exist.
   */
  update(id: number, data: Partial<ILeadFormData>, idempotencyContext?: IdempotencyContext): Promise<ILead>;

  /**
   * Delete a lead by ID.
   * @param id - The lead ID to remove.
   */
  delete(id: number): Promise<void>;

  /**
   * Search leads by free-text query (matched against title and client name).
   * @param query - The search string.
   * @param options - Pagination and sort options.
   * @returns Paginated result set of matching leads.
   */
  search(query: string, options?: IListQueryOptions): Promise<IPagedResult<ILead>>;
}
