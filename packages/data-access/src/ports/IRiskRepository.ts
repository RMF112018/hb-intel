import type { IRiskCostItem, IRiskCostManagement, IPagedResult, IListQueryOptions } from '@hbc/models';

/** Port interface for Risk domain data operations. */
export interface IRiskRepository {
  getItems(projectId: string, options?: IListQueryOptions): Promise<IPagedResult<IRiskCostItem>>;
  getItemById(id: number): Promise<IRiskCostItem | null>;
  createItem(data: Omit<IRiskCostItem, 'id'>): Promise<IRiskCostItem>;
  updateItem(id: number, data: Partial<IRiskCostItem>): Promise<IRiskCostItem>;
  deleteItem(id: number): Promise<void>;
  getManagement(projectId: string): Promise<IRiskCostManagement>;
}
