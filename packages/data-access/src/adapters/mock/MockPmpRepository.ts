import type { IProjectManagementPlan, IPMPSignature, IPagedResult, IListQueryOptions } from '@hbc/models';
import type { IPmpRepository } from '../../ports/IPmpRepository.js';
import { BaseRepository } from '../base.js';
import { paginate, genId } from './helpers.js';
import { SEED_PMPS, SEED_PMP_SIGNATURES } from './seedData.js';

export class MockPmpRepository extends BaseRepository<IProjectManagementPlan> implements IPmpRepository {
  private plans: IProjectManagementPlan[] = [...SEED_PMPS];
  private signatures: IPMPSignature[] = [...SEED_PMP_SIGNATURES];

  async getPlans(projectId: string, options?: IListQueryOptions): Promise<IPagedResult<IProjectManagementPlan>> {
    const filtered = this.plans.filter((p) => p.projectId === projectId);
    return paginate(filtered, options);
  }

  async getPlanById(id: number): Promise<IProjectManagementPlan | null> {
    this.validateId(id, 'PMP');
    return this.plans.find((p) => p.id === id) ?? null;
  }

  async createPlan(data: Omit<IProjectManagementPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<IProjectManagementPlan> {
    const plan: IProjectManagementPlan = {
      ...data,
      id: genId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.plans.push(plan);
    return plan;
  }

  async updatePlan(id: number, data: Partial<IProjectManagementPlan>): Promise<IProjectManagementPlan> {
    this.validateId(id, 'PMP');
    const idx = this.plans.findIndex((p) => p.id === id);
    if (idx === -1) this.throwNotFound('PMP', id);
    this.plans[idx] = { ...this.plans[idx], ...data, updatedAt: new Date().toISOString() };
    return this.plans[idx];
  }

  async deletePlan(id: number): Promise<void> {
    this.validateId(id, 'PMP');
    this.plans = this.plans.filter((p) => p.id !== id);
  }

  async getSignatures(pmpId: number): Promise<IPMPSignature[]> {
    this.validateId(pmpId, 'PMP');
    return this.signatures.filter((s) => s.pmpId === pmpId);
  }

  async createSignature(data: Omit<IPMPSignature, 'id'>): Promise<IPMPSignature> {
    const signature: IPMPSignature = { ...data, id: genId() };
    this.signatures.push(signature);
    return signature;
  }
}
