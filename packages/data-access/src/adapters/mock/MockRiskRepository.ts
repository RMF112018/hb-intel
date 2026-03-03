import type { IRiskCostItem, IRiskCostManagement, IPagedResult, IListQueryOptions } from '@hbc/models';
import type { IRiskRepository } from '../../ports/IRiskRepository.js';
import { BaseRepository } from '../base.js';
import { paginate, genId } from './helpers.js';
import { SEED_RISK_ITEMS } from './seedData.js';

export class MockRiskRepository extends BaseRepository<IRiskCostItem> implements IRiskRepository {
  private store: IRiskCostItem[] = [...SEED_RISK_ITEMS];

  async getItems(projectId: string, options?: IListQueryOptions): Promise<IPagedResult<IRiskCostItem>> {
    const filtered = this.store.filter((r) => r.projectId === projectId);
    return paginate(filtered, options);
  }

  async getItemById(id: number): Promise<IRiskCostItem | null> {
    this.validateId(id, 'RiskItem');
    return this.store.find((r) => r.id === id) ?? null;
  }

  async createItem(data: Omit<IRiskCostItem, 'id'>): Promise<IRiskCostItem> {
    const item: IRiskCostItem = { ...data, id: genId() };
    this.store.push(item);
    return item;
  }

  async updateItem(id: number, data: Partial<IRiskCostItem>): Promise<IRiskCostItem> {
    this.validateId(id, 'RiskItem');
    const idx = this.store.findIndex((r) => r.id === id);
    if (idx === -1) this.throwNotFound('RiskItem', id);
    this.store[idx] = { ...this.store[idx], ...data };
    return this.store[idx];
  }

  async deleteItem(id: number): Promise<void> {
    this.validateId(id, 'RiskItem');
    this.store = this.store.filter((r) => r.id !== id);
  }

  async getManagement(projectId: string): Promise<IRiskCostManagement> {
    const items = this.store.filter((r) => r.projectId === projectId);
    const totalExposure = items.reduce((sum, r) => sum + r.estimatedImpact * r.probability, 0);
    const mitigatedAmount = items
      .filter((r) => r.status === 'Mitigated')
      .reduce((sum, r) => sum + r.estimatedImpact * r.probability, 0);
    return {
      projectId,
      totalExposure: Math.round(totalExposure),
      mitigatedAmount: Math.round(mitigatedAmount),
      contingencyBudget: Math.round(totalExposure * 1.1),
      items,
    };
  }
}
