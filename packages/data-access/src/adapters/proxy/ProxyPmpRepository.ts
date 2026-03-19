import type { IPmpRepository } from '../../ports/IPmpRepository.js';
import type { IProjectManagementPlan, IPMPSignature, IListQueryOptions, IPagedResult } from '@hbc/models';
import type { ProxyHttpClient } from './ProxyHttpClient.js';
import type { IdempotencyContext } from '../../retry/idempotency.js';
import { BaseProxyProjectRepository } from './BaseProxyProjectRepository.js';
import { parseItemEnvelope } from './envelope.js';
import { buildResourcePath } from './paths.js';

export class ProxyPmpRepository
  extends BaseProxyProjectRepository<IProjectManagementPlan>
  implements IPmpRepository
{
  protected readonly domain = 'pmp';

  constructor(client: ProxyHttpClient) { super(client); }

  async getPlans(projectId: string, options?: IListQueryOptions): Promise<IPagedResult<IProjectManagementPlan>> {
    return this.fetchCollection(projectId, options);
  }

  async getPlanById(id: number): Promise<IProjectManagementPlan | null> {
    this.validateId(id, 'PMP');
    return this.fetchById(id);
  }

  async createPlan(data: Omit<IProjectManagementPlan, 'id' | 'createdAt' | 'updatedAt'>, idempotencyContext?: IdempotencyContext): Promise<IProjectManagementPlan> {
    const raw = await this.client.post<unknown>(buildResourcePath(this.domain), data, { domain: this.domain, operation: 'createPlan' }, idempotencyContext);
    return parseItemEnvelope<IProjectManagementPlan>(raw);
  }

  async updatePlan(id: number, data: Partial<IProjectManagementPlan>, idempotencyContext?: IdempotencyContext): Promise<IProjectManagementPlan> {
    this.validateId(id, 'PMP');
    return this.fetchUpdate(id, data, idempotencyContext) as Promise<IProjectManagementPlan>;
  }

  async deletePlan(id: number): Promise<void> {
    this.validateId(id, 'PMP');
    return this.fetchDelete(id);
  }

  async getSignatures(pmpId: number): Promise<IPMPSignature[]> {
    this.validateId(pmpId, 'PMP');
    return this.fetchSubResource<IPMPSignature>(pmpId, 'signatures');
  }

  async createSignature(data: Omit<IPMPSignature, 'id'>, idempotencyContext?: IdempotencyContext): Promise<IPMPSignature> {
    const raw = await this.client.post<unknown>(buildResourcePath(this.domain) + '/signatures', data, { domain: this.domain, operation: 'createSignature' }, idempotencyContext);
    return parseItemEnvelope<IPMPSignature>(raw);
  }
}
