import { TableClient, odata } from '@azure/data-tables';
import type { IEstimatingTracker, IEstimatingKickoff } from '@hbc/models';

const TRACKER_TABLE = 'HBEstimatingTrackers';
const KICKOFF_TABLE = 'HBEstimatingKickoffs';
const TRACKER_PK = 'tracker';

export interface IEstimatingService {
  listTrackers(page: number, pageSize: number): Promise<{ items: IEstimatingTracker[]; total: number }>;
  getTrackerById(id: number): Promise<IEstimatingTracker | null>;
  createTracker(data: Omit<IEstimatingTracker, 'id' | 'createdAt' | 'updatedAt'>): Promise<IEstimatingTracker>;
  updateTracker(id: number, data: Partial<IEstimatingTracker>): Promise<IEstimatingTracker | null>;
  deleteTracker(id: number): Promise<void>;
  getKickoff(projectId: string): Promise<IEstimatingKickoff | null>;
  createKickoff(data: Omit<IEstimatingKickoff, 'id' | 'createdAt'>): Promise<IEstimatingKickoff>;
}

// ---------------------------------------------------------------------------
// Real (Azure Table Storage)
// ---------------------------------------------------------------------------

export class RealEstimatingService implements IEstimatingService {
  private readonly trackerClient: TableClient;
  private readonly kickoffClient: TableClient;

  constructor() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
    this.trackerClient = TableClient.fromConnectionString(connectionString, TRACKER_TABLE);
    this.kickoffClient = TableClient.fromConnectionString(connectionString, KICKOFF_TABLE);
  }

  // ── Trackers ──────────────────────────────────────────────────────────────

  async listTrackers(page: number, pageSize: number): Promise<{ items: IEstimatingTracker[]; total: number }> {
    const all = await this.listAllTrackers();
    all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const start = (page - 1) * pageSize;
    return { items: all.slice(start, start + pageSize), total: all.length };
  }

  async getTrackerById(id: number): Promise<IEstimatingTracker | null> {
    try {
      const entity = await this.trackerClient.getEntity<Record<string, unknown>>(TRACKER_PK, String(id));
      return this.toTracker(entity);
    } catch (err: unknown) {
      if (isNotFound(err)) return null;
      throw err;
    }
  }

  async createTracker(data: Omit<IEstimatingTracker, 'id' | 'createdAt' | 'updatedAt'>): Promise<IEstimatingTracker> {
    const id = Date.now();
    const now = new Date().toISOString();
    const tracker: IEstimatingTracker = { id, ...data, createdAt: now, updatedAt: now };

    await this.trackerClient.upsertEntity(
      {
        partitionKey: TRACKER_PK,
        rowKey: String(id),
        projectId: tracker.projectId,
        bidNumber: tracker.bidNumber,
        status: tracker.status,
        dueDate: tracker.dueDate,
        createdAt: tracker.createdAt,
        updatedAt: tracker.updatedAt,
      },
      'Replace',
    );

    return tracker;
  }

  async updateTracker(id: number, data: Partial<IEstimatingTracker>): Promise<IEstimatingTracker | null> {
    const existing = await this.getTrackerById(id);
    if (!existing) return null;

    const updated: IEstimatingTracker = { ...existing, ...data, id, updatedAt: new Date().toISOString() };

    await this.trackerClient.upsertEntity(
      {
        partitionKey: TRACKER_PK,
        rowKey: String(id),
        projectId: updated.projectId,
        bidNumber: updated.bidNumber,
        status: updated.status,
        dueDate: updated.dueDate,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
      'Replace',
    );

    return updated;
  }

  async deleteTracker(id: number): Promise<void> {
    try {
      await this.trackerClient.deleteEntity(TRACKER_PK, String(id));
    } catch (err: unknown) {
      if (!isNotFound(err)) throw err;
    }
  }

  // ── Kickoffs ──────────────────────────────────────────────────────────────

  async getKickoff(projectId: string): Promise<IEstimatingKickoff | null> {
    try {
      const entity = await this.kickoffClient.getEntity<Record<string, unknown>>(projectId, 'kickoff');
      return this.toKickoff(entity);
    } catch (err: unknown) {
      if (isNotFound(err)) return null;
      throw err;
    }
  }

  async createKickoff(data: Omit<IEstimatingKickoff, 'id' | 'createdAt'>): Promise<IEstimatingKickoff> {
    const id = Date.now();
    const now = new Date().toISOString();
    const kickoff: IEstimatingKickoff = { id, ...data, createdAt: now };

    await this.kickoffClient.upsertEntity(
      {
        partitionKey: data.projectId,
        rowKey: 'kickoff',
        kickoffDate: kickoff.kickoffDate,
        attendeesJson: JSON.stringify(kickoff.attendees),
        notes: kickoff.notes,
        createdAt: kickoff.createdAt,
      },
      'Replace',
    );

    return kickoff;
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private async listAllTrackers(): Promise<IEstimatingTracker[]> {
    const entities = this.trackerClient.listEntities<Record<string, unknown>>({
      queryOptions: { filter: odata`PartitionKey eq ${TRACKER_PK}` },
    });
    const results: IEstimatingTracker[] = [];
    for await (const entity of entities) {
      results.push(this.toTracker(entity));
    }
    return results;
  }

  private toTracker(entity: Record<string, unknown>): IEstimatingTracker {
    return {
      id: Number(entity.rowKey),
      projectId: entity.projectId as string,
      bidNumber: entity.bidNumber as string,
      status: entity.status as string,
      dueDate: entity.dueDate as string,
      createdAt: entity.createdAt as string,
      updatedAt: entity.updatedAt as string,
    };
  }

  private toKickoff(entity: Record<string, unknown>): IEstimatingKickoff {
    return {
      id: Number(entity.rowKey === 'kickoff' ? Date.now() : entity.rowKey),
      projectId: entity.partitionKey as string,
      kickoffDate: entity.kickoffDate as string,
      attendees: JSON.parse((entity.attendeesJson as string) || '[]') as string[],
      notes: entity.notes as string,
      createdAt: entity.createdAt as string,
    };
  }
}

// ---------------------------------------------------------------------------
// Mock (in-memory)
// ---------------------------------------------------------------------------

export class MockEstimatingService implements IEstimatingService {
  private readonly trackers = new Map<number, IEstimatingTracker>([
    [1, { id: 1, projectId: 'PRJ-001', bidNumber: 'BID-2026-001', status: 'InProgress', dueDate: '2026-04-15', createdAt: '2026-01-10T00:00:00Z', updatedAt: '2026-02-20T00:00:00Z' }],
    [2, { id: 2, projectId: 'PRJ-002', bidNumber: 'BID-2026-002', status: 'Draft', dueDate: '2026-05-01', createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' }],
  ]);

  private readonly kickoffs = new Map<string, IEstimatingKickoff>([
    ['PRJ-001', { id: 1, projectId: 'PRJ-001', kickoffDate: '2026-01-12T09:00:00Z', attendees: ['John Smith', 'Jane Doe', 'Bob Builder'], notes: 'Initial kickoff for City Center Tower bid.', createdAt: '2026-01-10T00:00:00Z' }],
  ]);

  async listTrackers(page: number, pageSize: number): Promise<{ items: IEstimatingTracker[]; total: number }> {
    const all = [...this.trackers.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const start = (page - 1) * pageSize;
    return { items: all.slice(start, start + pageSize), total: all.length };
  }

  async getTrackerById(id: number): Promise<IEstimatingTracker | null> {
    return this.trackers.get(id) ?? null;
  }

  async createTracker(data: Omit<IEstimatingTracker, 'id' | 'createdAt' | 'updatedAt'>): Promise<IEstimatingTracker> {
    const id = Date.now();
    const now = new Date().toISOString();
    const tracker: IEstimatingTracker = { id, ...data, createdAt: now, updatedAt: now };
    this.trackers.set(id, tracker);
    return tracker;
  }

  async updateTracker(id: number, data: Partial<IEstimatingTracker>): Promise<IEstimatingTracker | null> {
    const existing = this.trackers.get(id);
    if (!existing) return null;
    const updated: IEstimatingTracker = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
    this.trackers.set(id, updated);
    return updated;
  }

  async deleteTracker(id: number): Promise<void> {
    this.trackers.delete(id);
  }

  async getKickoff(projectId: string): Promise<IEstimatingKickoff | null> {
    return this.kickoffs.get(projectId) ?? null;
  }

  async createKickoff(data: Omit<IEstimatingKickoff, 'id' | 'createdAt'>): Promise<IEstimatingKickoff> {
    const id = Date.now();
    const now = new Date().toISOString();
    const kickoff: IEstimatingKickoff = { id, ...data, createdAt: now };
    this.kickoffs.set(data.projectId, kickoff);
    return kickoff;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isNotFound(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'statusCode' in err && (err as { statusCode: number }).statusCode === 404;
}
