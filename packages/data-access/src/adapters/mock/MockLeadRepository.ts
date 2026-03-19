import type { ILead, ILeadFormData, IPagedResult, IListQueryOptions } from '@hbc/models';
import type { ILeadRepository } from '../../ports/ILeadRepository.js';
import type { IdempotencyContext } from '../../retry/idempotency.js';
import { BaseRepository } from '../base.js';
import { paginate, genId } from './helpers.js';
import { SEED_LEADS } from './seedData.js';

export class MockLeadRepository extends BaseRepository<ILead> implements ILeadRepository {
  private store: ILead[] = [...SEED_LEADS];

  async getAll(options?: IListQueryOptions): Promise<IPagedResult<ILead>> {
    return paginate(this.store, options);
  }

  async getById(id: number): Promise<ILead | null> {
    this.validateId(id, 'Lead');
    return this.store.find((l) => l.id === id) ?? null;
  }

  async create(data: ILeadFormData, _idempotencyContext?: IdempotencyContext): Promise<ILead> {
    const lead: ILead = {
      ...data,
      id: genId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.store.push(lead);
    return lead;
  }

  async update(id: number, data: Partial<ILeadFormData>, _idempotencyContext?: IdempotencyContext): Promise<ILead> {
    this.validateId(id, 'Lead');
    const idx = this.store.findIndex((l) => l.id === id);
    if (idx === -1) this.throwNotFound('Lead', id);
    this.store[idx] = { ...this.store[idx], ...data, updatedAt: new Date().toISOString() };
    return this.store[idx];
  }

  async delete(id: number): Promise<void> {
    this.validateId(id, 'Lead');
    this.store = this.store.filter((l) => l.id !== id);
  }

  async search(query: string, options?: IListQueryOptions): Promise<IPagedResult<ILead>> {
    const q = query.toLowerCase();
    const filtered = this.store.filter(
      (l) => l.title.toLowerCase().includes(q) || l.clientName.toLowerCase().includes(q),
    );
    return paginate(filtered, options);
  }
}
