import type { IProjectManagementPlan, IPMPSignature, IPagedResult, IListQueryOptions } from '@hbc/models';

/** Port interface for Project Management Plan domain data operations. */
export interface IPmpRepository {
  getPlans(projectId: string, options?: IListQueryOptions): Promise<IPagedResult<IProjectManagementPlan>>;
  getPlanById(id: number): Promise<IProjectManagementPlan | null>;
  createPlan(data: Omit<IProjectManagementPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<IProjectManagementPlan>;
  updatePlan(id: number, data: Partial<IProjectManagementPlan>): Promise<IProjectManagementPlan>;
  deletePlan(id: number): Promise<void>;
  getSignatures(pmpId: number): Promise<IPMPSignature[]>;
  createSignature(data: Omit<IPMPSignature, 'id'>): Promise<IPMPSignature>;
}
