import type { IProjectManagementPlan, IPMPSignature, IPagedResult, IListQueryOptions } from '@hbc/models';
import type { IdempotencyContext } from '../retry/idempotency.js';

/**
 * Port interface for the PMP (Project Management Plan) domain.
 *
 * @example
 * ```ts
 * const repo = createPmpRepository();
 * const plans = await repo.getPlans('PRJ-001');
 * const sigs = await repo.getSignatures(1);
 * ```
 */
export interface IPmpRepository {
  /**
   * Retrieve paginated project management plans for a project.
   * @param projectId - The project identifier.
   * @param options - Pagination and sort options.
   * @returns Paginated result set of plans.
   */
  getPlans(projectId: string, options?: IListQueryOptions): Promise<IPagedResult<IProjectManagementPlan>>;

  /**
   * Retrieve a single plan by its numeric ID.
   * @param id - The PMP ID.
   * @returns The plan, or `null` if not found.
   */
  getPlanById(id: number): Promise<IProjectManagementPlan | null>;

  /**
   * Create a new project management plan.
   * @param data - Plan data without generated fields (id, timestamps).
   * @returns The newly created plan.
   */
  createPlan(data: Omit<IProjectManagementPlan, 'id' | 'createdAt' | 'updatedAt'>, idempotencyContext?: IdempotencyContext): Promise<IProjectManagementPlan>;

  /**
   * Update an existing plan.
   * @param id - The plan ID to update.
   * @param data - Partial plan data to merge.
   * @returns The updated plan.
   * @throws {NotFoundError} If the plan does not exist.
   */
  updatePlan(id: number, data: Partial<IProjectManagementPlan>, idempotencyContext?: IdempotencyContext): Promise<IProjectManagementPlan>;

  /**
   * Delete a plan by ID.
   * @param id - The plan ID to remove.
   */
  deletePlan(id: number): Promise<void>;

  /**
   * Retrieve all signatures for a PMP.
   * @param pmpId - The plan ID.
   * @returns Array of signatures for the specified plan.
   */
  getSignatures(pmpId: number): Promise<IPMPSignature[]>;

  /**
   * Create a new PMP signature.
   * @param data - Signature data without the generated `id`.
   * @returns The newly created signature.
   */
  createSignature(data: Omit<IPMPSignature, 'id'>, idempotencyContext?: IdempotencyContext): Promise<IPMPSignature>;
}
