import type {
  ILead,
  ILeadFormData,
  IScheduleActivity,
  IScheduleMetrics,
  IBuyoutEntry,
  IBuyoutSummary,
  IPagedResult,
  IListQueryOptions,
} from '@hbc/models';
import { LeadStage } from '@hbc/models';
import type { ILeadRepository } from '../../ports/ILeadRepository.js';
import type { IScheduleRepository } from '../../ports/IScheduleRepository.js';
import type { IBuyoutRepository } from '../../ports/IBuyoutRepository.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function paginate<T>(items: T[], options?: IListQueryOptions): IPagedResult<T> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 25;
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
  };
}

let nextId = 1000;
function genId(): number {
  return nextId++;
}

// ---------------------------------------------------------------------------
// MockLeadRepository
// ---------------------------------------------------------------------------

export class MockLeadRepository implements ILeadRepository {
  private store: ILead[] = [
    {
      id: 1,
      title: 'City Center Tower',
      stage: LeadStage.Qualifying,
      clientName: 'Metro Development Corp',
      estimatedValue: 45_000_000,
      createdAt: '2025-11-01T00:00:00Z',
      updatedAt: '2025-12-15T00:00:00Z',
    },
    {
      id: 2,
      title: 'Harbor Bridge Renovation',
      stage: LeadStage.Bidding,
      clientName: 'State DOT',
      estimatedValue: 18_500_000,
      createdAt: '2025-10-10T00:00:00Z',
      updatedAt: '2026-01-05T00:00:00Z',
    },
  ];

  async getAll(options?: IListQueryOptions): Promise<IPagedResult<ILead>> {
    return paginate(this.store, options);
  }

  async getById(id: number): Promise<ILead | null> {
    return this.store.find((l) => l.id === id) ?? null;
  }

  async create(data: ILeadFormData): Promise<ILead> {
    const lead: ILead = {
      ...data,
      id: genId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.store.push(lead);
    return lead;
  }

  async update(id: number, data: Partial<ILeadFormData>): Promise<ILead> {
    const idx = this.store.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error(`Lead ${id} not found`);
    this.store[idx] = { ...this.store[idx], ...data, updatedAt: new Date().toISOString() };
    return this.store[idx];
  }

  async delete(id: number): Promise<void> {
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

// ---------------------------------------------------------------------------
// MockScheduleRepository
// ---------------------------------------------------------------------------

export class MockScheduleRepository implements IScheduleRepository {
  private store: IScheduleActivity[] = [
    {
      id: 1,
      projectId: 'PRJ-001',
      name: 'Foundation Excavation',
      startDate: '2026-01-15',
      endDate: '2026-03-01',
      percentComplete: 100,
      isCriticalPath: true,
    },
    {
      id: 2,
      projectId: 'PRJ-001',
      name: 'Structural Steel Erection',
      startDate: '2026-03-02',
      endDate: '2026-06-15',
      percentComplete: 35,
      isCriticalPath: true,
    },
  ];

  async getActivities(projectId: string, options?: IListQueryOptions): Promise<IPagedResult<IScheduleActivity>> {
    const filtered = this.store.filter((a) => a.projectId === projectId);
    return paginate(filtered, options);
  }

  async getActivityById(id: number): Promise<IScheduleActivity | null> {
    return this.store.find((a) => a.id === id) ?? null;
  }

  async createActivity(data: Omit<IScheduleActivity, 'id'>): Promise<IScheduleActivity> {
    const activity: IScheduleActivity = { ...data, id: genId() };
    this.store.push(activity);
    return activity;
  }

  async updateActivity(id: number, data: Partial<IScheduleActivity>): Promise<IScheduleActivity> {
    const idx = this.store.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error(`Activity ${id} not found`);
    this.store[idx] = { ...this.store[idx], ...data };
    return this.store[idx];
  }

  async deleteActivity(id: number): Promise<void> {
    this.store = this.store.filter((a) => a.id !== id);
  }

  async getMetrics(projectId: string): Promise<IScheduleMetrics> {
    const activities = this.store.filter((a) => a.projectId === projectId);
    const completed = activities.filter((a) => a.percentComplete === 100).length;
    const cpVariance = activities.filter((a) => a.isCriticalPath).length > 0 ? 2 : 0;
    const avgPercent = activities.length > 0
      ? activities.reduce((sum, a) => sum + a.percentComplete, 0) / activities.length
      : 0;
    return {
      projectId,
      totalActivities: activities.length,
      completedActivities: completed,
      criticalPathVariance: cpVariance,
      overallPercentComplete: Math.round(avgPercent),
    };
  }
}

// ---------------------------------------------------------------------------
// MockBuyoutRepository
// ---------------------------------------------------------------------------

export class MockBuyoutRepository implements IBuyoutRepository {
  private store: IBuyoutEntry[] = [
    {
      id: 1,
      projectId: 'PRJ-001',
      costCode: '03-3100',
      description: 'Structural Concrete',
      budgetAmount: 2_400_000,
      committedAmount: 2_150_000,
      status: 'Committed',
    },
    {
      id: 2,
      projectId: 'PRJ-001',
      costCode: '05-1200',
      description: 'Structural Steel',
      budgetAmount: 3_800_000,
      committedAmount: 0,
      status: 'Pending',
    },
  ];

  async getEntries(projectId: string, options?: IListQueryOptions): Promise<IPagedResult<IBuyoutEntry>> {
    const filtered = this.store.filter((e) => e.projectId === projectId);
    return paginate(filtered, options);
  }

  async getEntryById(id: number): Promise<IBuyoutEntry | null> {
    return this.store.find((e) => e.id === id) ?? null;
  }

  async createEntry(data: Omit<IBuyoutEntry, 'id'>): Promise<IBuyoutEntry> {
    const entry: IBuyoutEntry = { ...data, id: genId() };
    this.store.push(entry);
    return entry;
  }

  async updateEntry(id: number, data: Partial<IBuyoutEntry>): Promise<IBuyoutEntry> {
    const idx = this.store.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error(`Buyout entry ${id} not found`);
    this.store[idx] = { ...this.store[idx], ...data };
    return this.store[idx];
  }

  async deleteEntry(id: number): Promise<void> {
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
