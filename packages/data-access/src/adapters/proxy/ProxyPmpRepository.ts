import type { IPmpRepository } from '../../ports/IPmpRepository.js';
import type { IProjectManagementPlan, IPMPSignature, IListQueryOptions, IPagedResult } from '@hbc/models';
import type { ProxyHttpClient } from './ProxyHttpClient.js';
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

  async createPlan(data: Omit<IProjectManagementPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<IProjectManagementPlan> {
    const raw = await this.client.post<unknown>(buildResourcePath(this.domain), data);
    return parseItemEnvelope<IProjectManagementPlan>(raw);
  }

  async updatePlan(id: number, data: Partial<IProjectManagementPlan>): Promise<IProjectManagementPlan> {
    this.validateId(id, 'PMP');
    return this.fetchUpdate(id, data) as Promise<IProjectManagementPlan>;
  }

  async deletePlan(id: number): Promise<void> {
    this.validateId(id, 'PMP');
    return this.fetchDelete(id);
  }

  async getSignatures(pmpId: number): Promise<IPMPSignature[]> {
    this.validateId(pmpId, 'PMP');
    return this.fetchSubResource<IPMPSignature>(pmpId, 'signatures');
  }

  async createSignature(data: Omit<IPMPSignature, 'id'>): Promise<IPMPSignature> {
    const raw = await this.client.post<unknown>(buildResourcePath(this.domain) + '/signatures', data);
    return parseItemEnvelope<IPMPSignature>(raw);
  }
}
