import type { IBuyoutEntry, IBuyoutSummary, IPagedResult, IListQueryOptions } from '@hbc/models';
import type { IBuyoutRepository } from '../../ports/IBuyoutRepository.js';
import type { IdempotencyContext } from '../../retry/idempotency.js';
import { BaseRepository } from '../base.js';
import { paginate, genId } from './helpers.js';
import { SEED_BUYOUT_ENTRIES } from './seedData.js';

export class MockBuyoutRepository extends BaseRepository<IBuyoutEntry> implements IBuyoutRepository {
  private store: IBuyoutEntry[] = [...SEED_BUYOUT_ENTRIES];

  async getEntries(projectId: string, options?: IListQueryOptions): Promise<IPagedResult<IBuyoutEntry>> {
    const filtered = this.store.filter((e) => e.projectId === projectId);
    return paginate(filtered, options);
  }

  async getEntryById(id: number): Promise<IBuyoutEntry | null> {
    this.validateId(id, 'BuyoutEntry');
    return this.store.find((e) => e.id === id) ?? null;
  }

  async createEntry(data: Omit<IBuyoutEntry, 'id'>, _idempotencyContext?: IdempotencyContext): Promise<IBuyoutEntry> {
    const entry: IBuyoutEntry = { ...data, id: genId() };
    this.store.push(entry);
    return entry;
  }

  async updateEntry(id: number, data: Partial<IBuyoutEntry>, _idempotencyContext?: IdempotencyContext): Promise<IBuyoutEntry> {
    this.validateId(id, 'BuyoutEntry');
    const idx = this.store.findIndex((e) => e.id === id);
    if (idx === -1) this.throwNotFound('BuyoutEntry', id);
    this.store[idx] = { ...this.store[idx], ...data };
    return this.store[idx];
  }

  async deleteEntry(id: number): Promise<void> {
    this.validateId(id, 'BuyoutEntry');
    this.store = this.store.filter((e) => e.id !== id);
  }

  async getSummary(projectId: string): Promise<IBuyoutSummary> {
    const entries = this.store.filter((e) => e.projectId === projectId);
    const totalBudget = entries.reduce((sum, e) => sum + e.budgetAmount, 0);
    const totalCommitted = entries.reduce((sum, e) => sum + e.committedAmount, 0);
    return {
      projectId,
      totalBudget,
      totalCommitted,
      totalRemaining: totalBudget - totalCommitted,
      percentBoughtOut: totalBudget > 0 ? Math.round((totalCommitted / totalBudget) * 100) : 0,
    };
  }
}
