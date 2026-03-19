/**
 * Proxy adapter for the Lead (business development pipeline) repository.
 *
 * Implements ILeadRepository using the B1 HTTP proxy contract.
 * Leads are top-level resources (not project-scoped).
 *
 * API paths:
 *   GET    /leads                    → paginated collection
 *   GET    /leads/{id}               → single lead
 *   POST   /leads                    → create
 *   PUT    /leads/{id}               → update
 *   DELETE /leads/{id}               → delete
 *   GET    /leads/search?q=...       → search
 */

import type { ILeadRepository } from '../../ports/ILeadRepository.js';
import type { ILead, ILeadFormData, IListQueryOptions, IPagedResult } from '@hbc/models';
import type { ProxyHttpClient } from './ProxyHttpClient.js';
import { BaseRepository } from '../base.js';
import { NotFoundError } from '../../errors/index.js';
import { parseItemEnvelope, parsePagedEnvelope } from './envelope.js';
import { buildResourcePath, buildQueryParams } from './paths.js';

export class ProxyLeadRepository extends BaseRepository<ILead> implements ILeadRepository {
  constructor(private readonly client: ProxyHttpClient) {
    super();
  }

  async getAll(options?: IListQueryOptions): Promise<IPagedResult<ILead>> {
    const raw = await this.client.get<unknown>(
      buildResourcePath('leads'),
      buildQueryParams(options),
    );
    return parsePagedEnvelope<ILead>(raw);
  }

  async getById(id: number): Promise<ILead | null> {
    this.validateId(id, 'Lead');
    try {
      const raw = await this.client.get<unknown>(
        buildResourcePath('leads', id),
      );
      return parseItemEnvelope<ILead>(raw);
    } catch (err) {
      if (err instanceof NotFoundError) return null;
      throw err;
    }
  }

  async create(data: ILeadFormData): Promise<ILead> {
    const raw = await this.client.post<unknown>(
      buildResourcePath('leads'),
      data,
    );
    return parseItemEnvelope<ILead>(raw);
  }

  async update(id: number, data: Partial<ILeadFormData>): Promise<ILead> {
    this.validateId(id, 'Lead');
    const raw = await this.client.put<unknown>(
      buildResourcePath('leads', id),
      data,
    );
    return parseItemEnvelope<ILead>(raw);
  }

  async delete(id: number): Promise<void> {
    this.validateId(id, 'Lead');
    await this.client.delete(buildResourcePath('leads', id));
  }

  async search(query: string, options?: IListQueryOptions): Promise<IPagedResult<ILead>> {
    const params = buildQueryParams(options) ?? {};
    params.q = query;
    const raw = await this.client.get<unknown>(
      buildResourcePath('leads', 'search'),
      params,
    );
    return parsePagedEnvelope<ILead>(raw);
  }
}
