import type { IContractInfo, ICommitmentApproval, IPagedResult, IListQueryOptions } from '@hbc/models';
import type { IdempotencyContext } from '../retry/idempotency.js';

/**
 * Port interface for the Contract (contract management and approvals) domain.
 *
 * @example
 * ```ts
 * const repo = createContractRepository();
 * const contracts = await repo.getContracts('PRJ-001');
 * const approvals = await repo.getApprovals(1);
 * ```
 */
export interface IContractRepository {
  /**
   * Retrieve paginated contracts for a project.
   * @param projectId - The project identifier.
   * @param options - Pagination and sort options.
   * @returns Paginated result set of contracts.
   */
  getContracts(projectId: string, options?: IListQueryOptions): Promise<IPagedResult<IContractInfo>>;

  /**
   * Retrieve a single contract by its numeric ID.
   * @param id - The contract ID.
   * @returns The contract, or `null` if not found.
   */
  getContractById(id: number): Promise<IContractInfo | null>;

  /**
   * Create a new contract.
   * @param data - Contract data without the generated `id`.
   * @returns The newly created contract.
   */
  createContract(data: Omit<IContractInfo, 'id'>, idempotencyContext?: IdempotencyContext): Promise<IContractInfo>;

  /**
   * Update an existing contract.
   * @param id - The contract ID to update.
   * @param data - Partial contract data to merge.
   * @returns The updated contract.
   * @throws {NotFoundError} If the contract does not exist.
   */
  updateContract(id: number, data: Partial<IContractInfo>, idempotencyContext?: IdempotencyContext): Promise<IContractInfo>;

  /**
   * Delete a contract by ID.
   * @param id - The contract ID to remove.
   */
  deleteContract(id: number): Promise<void>;

  /**
   * Retrieve all commitment approvals for a contract.
   * @param contractId - The contract ID.
   * @returns Array of approvals for the specified contract.
   */
  getApprovals(contractId: number): Promise<ICommitmentApproval[]>;

  /**
   * Create a new commitment approval.
   * @param data - Approval data without the generated `id`.
   * @returns The newly created approval.
   */
  createApproval(data: Omit<ICommitmentApproval, 'id'>, idempotencyContext?: IdempotencyContext): Promise<ICommitmentApproval>;
}
