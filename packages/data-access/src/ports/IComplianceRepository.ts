import type { IComplianceEntry, IComplianceSummary, IPagedResult, IListQueryOptions } from '@hbc/models';

/** Port interface for Compliance domain data operations. */
export interface IComplianceRepository {
  getEntries(projectId: string, options?: IListQueryOptions): Promise<IPagedResult<IComplianceEntry>>;
  getEntryById(id: number): Promise<IComplianceEntry | null>;
  createEntry(data: Omit<IComplianceEntry, 'id'>): Promise<IComplianceEntry>;
  updateEntry(id: number, data: Partial<IComplianceEntry>): Promise<IComplianceEntry>;
  deleteEntry(id: number): Promise<void>;
  getSummary(projectId: string): Promise<IComplianceSummary>;
}
