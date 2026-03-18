import type { IRiskRepository } from '../../ports/IRiskRepository.js';
import type { IRiskCostItem, IRiskCostManagement, IListQueryOptions, IPagedResult } from '@hbc/models';
import type { ProxyHttpClient } from './ProxyHttpClient.js';
import { BaseProxyProjectRepository } from './BaseProxyProjectRepository.js';
import { parseItemEnvelope } from './envelope.js';
import { buildResourcePath } from './paths.js';

export class ProxyRiskRepository
  extends BaseProxyProjectRepository<IRiskCostItem>
  implements IRiskRepository
{
  protected readonly domain = 'risks';

  constructor(client: ProxyHttpClient) { super(client); }

  async getItems(projectId: string, options?: IListQueryOptions): Promise<IPagedResult<IRiskCostItem>> {
    return this.fetchCollection(projectId, options);
  }

  async getItemById(id: number): Promise<IRiskCostItem | null> {
    this.validateId(id, 'RiskItem');
    return this.fetchById(id);
  }

  async createItem(data: Omit<IRiskCostItem, 'id'>): Promise<IRiskCostItem> {
    const raw = await this.client.post<unknown>(buildResourcePath(this.domain), data);
    return parseItemEnvelope<IRiskCostItem>(raw);
  }

  async updateItem(id: number, data: Partial<IRiskCostItem>): Promise<IRiskCostItem> {
    this.validateId(id, 'RiskItem');
    return this.fetchUpdate(id, data) as Promise<IRiskCostItem>;
  }

  async deleteItem(id: number): Promise<void> {
    this.validateId(id, 'RiskItem');
    return this.fetchDelete(id);
  }

  async getManagement(projectId: string): Promise<IRiskCostManagement> {
    return this.fetchAggregate<IRiskCostManagement>(projectId, 'management');
  }
}
