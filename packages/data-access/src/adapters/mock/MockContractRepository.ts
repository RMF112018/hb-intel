import type { IContractInfo, ICommitmentApproval, IPagedResult, IListQueryOptions } from '@hbc/models';
import type { IContractRepository } from '../../ports/IContractRepository.js';
import type { IdempotencyContext } from '../../retry/idempotency.js';
import { BaseRepository } from '../base.js';
import { paginate, genId } from './helpers.js';
import { SEED_CONTRACTS, SEED_CONTRACT_APPROVALS } from './seedData.js';

export class MockContractRepository extends BaseRepository<IContractInfo> implements IContractRepository {
  private contracts: IContractInfo[] = [...SEED_CONTRACTS];
  private approvals: ICommitmentApproval[] = [...SEED_CONTRACT_APPROVALS];

  async getContracts(projectId: string, options?: IListQueryOptions): Promise<IPagedResult<IContractInfo>> {
    const filtered = this.contracts.filter((c) => c.projectId === projectId);
    return paginate(filtered, options);
  }

  async getContractById(id: number): Promise<IContractInfo | null> {
    this.validateId(id, 'Contract');
    return this.contracts.find((c) => c.id === id) ?? null;
  }

  async createContract(data: Omit<IContractInfo, 'id'>, _idempotencyContext?: IdempotencyContext): Promise<IContractInfo> {
    const contract: IContractInfo = { ...data, id: genId() };
    this.contracts.push(contract);
    return contract;
  }

  async updateContract(id: number, data: Partial<IContractInfo>, _idempotencyContext?: IdempotencyContext): Promise<IContractInfo> {
    this.validateId(id, 'Contract');
    const idx = this.contracts.findIndex((c) => c.id === id);
    if (idx === -1) this.throwNotFound('Contract', id);
    this.contracts[idx] = { ...this.contracts[idx], ...data };
    return this.contracts[idx];
  }

  async deleteContract(id: number): Promise<void> {
    this.validateId(id, 'Contract');
    this.contracts = this.contracts.filter((c) => c.id !== id);
  }

  async getApprovals(contractId: number): Promise<ICommitmentApproval[]> {
    this.validateId(contractId, 'Contract');
    return this.approvals.filter((a) => a.contractId === contractId);
  }

  async createApproval(data: Omit<ICommitmentApproval, 'id'>, _idempotencyContext?: IdempotencyContext): Promise<ICommitmentApproval> {
    const approval: ICommitmentApproval = { ...data, id: genId() };
    this.approvals.push(approval);
    return approval;
  }
}
