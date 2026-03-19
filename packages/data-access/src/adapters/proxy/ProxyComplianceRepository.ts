import type { IComplianceRepository } from '../../ports/IComplianceRepository.js';
import type { IComplianceEntry, IComplianceSummary, IListQueryOptions, IPagedResult } from '@hbc/models';
import type { ProxyHttpClient } from './ProxyHttpClient.js';
import { BaseProxyProjectRepository } from './BaseProxyProjectRepository.js';
import { parseItemEnvelope } from './envelope.js';
import { buildResourcePath } from './paths.js';

export class ProxyComplianceRepository
  extends BaseProxyProjectRepository<IComplianceEntry>
  implements IComplianceRepository
{
  protected readonly domain = 'compliance';

  constructor(client: ProxyHttpClient) { super(client); }

  async getEntries(projectId: string, options?: IListQueryOptions): Promise<IPagedResult<IComplianceEntry>> {
    return this.fetchCollection(projectId, options);
  }

  async getEntryById(id: number): Promise<IComplianceEntry | null> {
    this.validateId(id, 'ComplianceEntry');
    return this.fetchById(id);
  }

  async createEntry(data: Omit<IComplianceEntry, 'id'>): Promise<IComplianceEntry> {
    const raw = await this.client.post<unknown>(buildResourcePath(this.domain), data, { domain: this.domain, operation: 'createEntry' });
    return parseItemEnvelope<IComplianceEntry>(raw);
  }

  async updateEntry(id: number, data: Partial<IComplianceEntry>): Promise<IComplianceEntry> {
    this.validateId(id, 'ComplianceEntry');
    return this.fetchUpdate(id, data) as Promise<IComplianceEntry>;
  }

  async deleteEntry(id: number): Promise<void> {
    this.validateId(id, 'ComplianceEntry');
    return this.fetchDelete(id);
  }

  async getSummary(projectId: string): Promise<IComplianceSummary> {
    return this.fetchAggregate<IComplianceSummary>(projectId, 'summary');
  }
}
