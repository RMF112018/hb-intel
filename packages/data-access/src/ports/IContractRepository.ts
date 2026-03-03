import type { IContractInfo, ICommitmentApproval, IPagedResult, IListQueryOptions } from '@hbc/models';

/** Port interface for Contracts domain data operations. */
export interface IContractRepository {
  getContracts(projectId: string, options?: IListQueryOptions): Promise<IPagedResult<IContractInfo>>;
  getContractById(id: number): Promise<IContractInfo | null>;
  createContract(data: Omit<IContractInfo, 'id'>): Promise<IContractInfo>;
  updateContract(id: number, data: Partial<IContractInfo>): Promise<IContractInfo>;
  deleteContract(id: number): Promise<void>;
  getApprovals(contractId: number): Promise<ICommitmentApproval[]>;
  createApproval(data: Omit<ICommitmentApproval, 'id'>): Promise<ICommitmentApproval>;
}
