import type { IBuyoutEntry, IBuyoutSummary, IPagedResult, IListQueryOptions } from '@hbc/models';

/** Port interface for Buyout domain data operations. */
export interface IBuyoutRepository {
  getEntries(projectId: string, options?: IListQueryOptions): Promise<IPagedResult<IBuyoutEntry>>;
  getEntryById(id: number): Promise<IBuyoutEntry | null>;
  createEntry(data: Omit<IBuyoutEntry, 'id'>): Promise<IBuyoutEntry>;
  updateEntry(id: number, data: Partial<IBuyoutEntry>): Promise<IBuyoutEntry>;
  deleteEntry(id: number): Promise<void>;
  getSummary(projectId: string): Promise<IBuyoutSummary>;
}
