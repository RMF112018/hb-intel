import type { IBuyoutRepository } from '../../ports/IBuyoutRepository.js';
import type { IBuyoutEntry, IBuyoutSummary, IListQueryOptions, IPagedResult } from '@hbc/models';
import type { ProxyHttpClient } from './ProxyHttpClient.js';
import type { IdempotencyContext } from '../../retry/idempotency.js';
import { BaseProxyProjectRepository } from './BaseProxyProjectRepository.js';
import { parseItemEnvelope } from './envelope.js';
import { buildResourcePath } from './paths.js';

export class ProxyBuyoutRepository
  extends BaseProxyProjectRepository<IBuyoutEntry>
  implements IBuyoutRepository
{
  protected readonly domain = 'buyouts';

  constructor(client: ProxyHttpClient) { super(client); }

  async getEntries(projectId: string, options?: IListQueryOptions): Promise<IPagedResult<IBuyoutEntry>> {
    return this.fetchCollection(projectId, options);
  }

  async getEntryById(id: number): Promise<IBuyoutEntry | null> {
    this.validateId(id, 'BuyoutEntry');
    return this.fetchById(id);
  }

  async createEntry(data: Omit<IBuyoutEntry, 'id'>, idempotencyContext?: IdempotencyContext): Promise<IBuyoutEntry> {
    const raw = await this.client.post<unknown>(buildResourcePath(this.domain), data, { domain: this.domain, operation: 'createEntry' }, idempotencyContext);
    return parseItemEnvelope<IBuyoutEntry>(raw);
  }

  async updateEntry(id: number, data: Partial<IBuyoutEntry>, idempotencyContext?: IdempotencyContext): Promise<IBuyoutEntry> {
    this.validateId(id, 'BuyoutEntry');
    return this.fetchUpdate(id, data, idempotencyContext) as Promise<IBuyoutEntry>;
  }

  async deleteEntry(id: number): Promise<void> {
    this.validateId(id, 'BuyoutEntry');
    return this.fetchDelete(id);
  }

  async getSummary(projectId: string): Promise<IBuyoutSummary> {
    return this.fetchAggregate<IBuyoutSummary>(projectId, 'summary');
  }
}
