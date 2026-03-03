import type { ILead, ILeadFormData, IPagedResult, IListQueryOptions } from '@hbc/models';

/** Port interface for Lead domain data operations. */
export interface ILeadRepository {
  getAll(options?: IListQueryOptions): Promise<IPagedResult<ILead>>;
  getById(id: number): Promise<ILead | null>;
  create(data: ILeadFormData): Promise<ILead>;
  update(id: number, data: Partial<ILeadFormData>): Promise<ILead>;
  delete(id: number): Promise<void>;
  search(query: string, options?: IListQueryOptions): Promise<IPagedResult<ILead>>;
}
