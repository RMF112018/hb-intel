import type { IComplianceEntry, IComplianceSummary, IPagedResult, IListQueryOptions } from '@hbc/models';
import type { IComplianceRepository } from '../../ports/IComplianceRepository.js';
import { BaseRepository } from '../base.js';
import { paginate, genId } from './helpers.js';
import { SEED_COMPLIANCE_ENTRIES } from './seedData.js';

export class MockComplianceRepository extends BaseRepository<IComplianceEntry> implements IComplianceRepository {
  private store: IComplianceEntry[] = [...SEED_COMPLIANCE_ENTRIES];

  async getEntries(projectId: string, options?: IListQueryOptions): Promise<IPagedResult<IComplianceEntry>> {
    const filtered = this.store.filter((e) => e.projectId === projectId);
    return paginate(filtered, options);
  }

  async getEntryById(id: number): Promise<IComplianceEntry | null> {
    this.validateId(id, 'ComplianceEntry');
    return this.store.find((e) => e.id === id) ?? null;
  }

  async createEntry(data: Omit<IComplianceEntry, 'id'>): Promise<IComplianceEntry> {
    const entry: IComplianceEntry = { ...data, id: genId() };
    this.store.push(entry);
    return entry;
  }

  async updateEntry(id: number, data: Partial<IComplianceEntry>): Promise<IComplianceEntry> {
    this.validateId(id, 'ComplianceEntry');
    const idx = this.store.findIndex((e) => e.id === id);
    if (idx === -1) this.throwNotFound('ComplianceEntry', id);
    this.store[idx] = { ...this.store[idx], ...data };
    return this.store[idx];
  }

  async deleteEntry(id: number): Promise<void> {
    this.validateId(id, 'ComplianceEntry');
    this.store = this.store.filter((e) => e.id !== id);
  }

  async getSummary(projectId: string): Promise<IComplianceSummary> {
    const entries = this.store.filter((e) => e.projectId === projectId);
    return {
      projectId,
      totalEntries: entries.length,
      compliant: entries.filter((e) => e.status === 'Compliant').length,
      nonCompliant: entries.filter((e) => e.status === 'NonCompliant').length,
      expiringSoon: entries.filter((e) => e.status === 'ExpiringSoon').length,
    };
  }
}
