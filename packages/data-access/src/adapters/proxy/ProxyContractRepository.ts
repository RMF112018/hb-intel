import type { IContractRepository } from '../../ports/IContractRepository.js';
import type { IContractInfo, ICommitmentApproval, IListQueryOptions, IPagedResult } from '@hbc/models';
import type { ProxyHttpClient } from './ProxyHttpClient.js';
import type { IdempotencyContext } from '../../retry/idempotency.js';
import { BaseProxyProjectRepository } from './BaseProxyProjectRepository.js';
import { parseItemEnvelope } from './envelope.js';
import { buildResourcePath } from './paths.js';

export class ProxyContractRepository
  extends BaseProxyProjectRepository<IContractInfo>
  implements IContractRepository
{
  protected readonly domain = 'contracts';

  constructor(client: ProxyHttpClient) { super(client); }

  async getContracts(projectId: string, options?: IListQueryOptions): Promise<IPagedResult<IContractInfo>> {
    return this.fetchCollection(projectId, options);
  }

  async getContractById(id: number): Promise<IContractInfo | null> {
    this.validateId(id, 'Contract');
    return this.fetchById(id);
  }

  async createContract(data: Omit<IContractInfo, 'id'>, idempotencyContext?: IdempotencyContext): Promise<IContractInfo> {
    const raw = await this.client.post<unknown>(buildResourcePath(this.domain), data, { domain: this.domain, operation: 'createContract' }, idempotencyContext);
    return parseItemEnvelope<IContractInfo>(raw);
  }

  async updateContract(id: number, data: Partial<IContractInfo>, idempotencyContext?: IdempotencyContext): Promise<IContractInfo> {
    this.validateId(id, 'Contract');
    return this.fetchUpdate(id, data, idempotencyContext) as Promise<IContractInfo>;
  }

  async deleteContract(id: number): Promise<void> {
    this.validateId(id, 'Contract');
    return this.fetchDelete(id);
  }

  async getApprovals(contractId: number): Promise<ICommitmentApproval[]> {
    this.validateId(contractId, 'Contract');
    return this.fetchSubResource<ICommitmentApproval>(contractId, 'approvals');
  }

  async createApproval(data: Omit<ICommitmentApproval, 'id'>, idempotencyContext?: IdempotencyContext): Promise<ICommitmentApproval> {
    const raw = await this.client.post<unknown>(buildResourcePath(this.domain) + '/approvals', data, { domain: this.domain, operation: 'createApproval' }, idempotencyContext);
    return parseItemEnvelope<ICommitmentApproval>(raw);
  }
}
