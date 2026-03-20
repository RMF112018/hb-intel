import { odata } from '@azure/data-tables';
import type { IGoNoGoScorecard, IScorecardVersion } from '@hbc/models';
import { createAppTableClient } from '../utils/table-client-factory.js';

const SCORECARD_TABLE = 'HBScorecards';
const VERSION_TABLE = 'HBScorecardVersions';

export interface IScorecardService {
  listScorecards(projectId: string, page: number, pageSize: number): Promise<{ items: IGoNoGoScorecard[]; total: number }>;
  getScorecardById(id: number): Promise<IGoNoGoScorecard | null>;
  createScorecard(data: Omit<IGoNoGoScorecard, 'id' | 'createdAt' | 'updatedAt'>): Promise<IGoNoGoScorecard>;
  updateScorecard(id: number, data: Partial<IGoNoGoScorecard>): Promise<IGoNoGoScorecard | null>;
  deleteScorecard(id: number): Promise<void>;
  getVersions(scorecardId: number): Promise<IScorecardVersion[]>;
}

// ---------------------------------------------------------------------------
// Real (Azure Table Storage)
// ---------------------------------------------------------------------------

export class RealScorecardService implements IScorecardService {
  private readonly scorecardClient = createAppTableClient(SCORECARD_TABLE);
  private readonly versionClient = createAppTableClient(VERSION_TABLE);

  async listScorecards(projectId: string, page: number, pageSize: number): Promise<{ items: IGoNoGoScorecard[]; total: number }> {
    const all = await this.listByProject(projectId);
    const start = (page - 1) * pageSize;
    return { items: all.slice(start, start + pageSize), total: all.length };
  }

  async getScorecardById(id: number): Promise<IGoNoGoScorecard | null> {
    const all = await this.listAllScorecards();
    return all.find((s) => s.id === id) ?? null;
  }

  async createScorecard(data: Omit<IGoNoGoScorecard, 'id' | 'createdAt' | 'updatedAt'>): Promise<IGoNoGoScorecard> {
    const id = Date.now();
    const now = new Date().toISOString();
    const scorecard: IGoNoGoScorecard = { id, ...data, createdAt: now, updatedAt: now };
    await this.scorecardClient.upsertEntity(
      { partitionKey: data.projectId, rowKey: String(id), version: scorecard.version, overallScore: scorecard.overallScore, recommendation: scorecard.recommendation, createdAt: scorecard.createdAt, updatedAt: scorecard.updatedAt },
      'Replace',
    );
    return scorecard;
  }

  async updateScorecard(id: number, data: Partial<IGoNoGoScorecard>): Promise<IGoNoGoScorecard | null> {
    const existing = await this.getScorecardById(id);
    if (!existing) return null;
    const updated: IGoNoGoScorecard = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
    await this.scorecardClient.upsertEntity(
      { partitionKey: updated.projectId, rowKey: String(id), version: updated.version, overallScore: updated.overallScore, recommendation: updated.recommendation, createdAt: updated.createdAt, updatedAt: updated.updatedAt },
      'Replace',
    );
    return updated;
  }

  async deleteScorecard(id: number): Promise<void> {
    const existing = await this.getScorecardById(id);
    if (!existing) return;
    try { await this.scorecardClient.deleteEntity(existing.projectId, String(id)); } catch (err: unknown) { if (!isNotFound(err)) throw err; }
  }

  async getVersions(scorecardId: number): Promise<IScorecardVersion[]> {
    const entities = this.versionClient.listEntities<Record<string, unknown>>({
      queryOptions: { filter: odata`PartitionKey eq ${String(scorecardId)}` },
    });
    const results: IScorecardVersion[] = [];
    for await (const entity of entities) { results.push(this.toVersion(entity, scorecardId)); }
    return results;
  }

  private async listByProject(projectId: string): Promise<IGoNoGoScorecard[]> {
    const entities = this.scorecardClient.listEntities<Record<string, unknown>>({
      queryOptions: { filter: odata`PartitionKey eq ${projectId}` },
    });
    const results: IGoNoGoScorecard[] = [];
    for await (const entity of entities) { results.push(this.toScorecard(entity)); }
    return results;
  }

  private async listAllScorecards(): Promise<IGoNoGoScorecard[]> {
    const entities = this.scorecardClient.listEntities<Record<string, unknown>>();
    const results: IGoNoGoScorecard[] = [];
    for await (const entity of entities) { results.push(this.toScorecard(entity)); }
    return results;
  }

  private toScorecard(entity: Record<string, unknown>): IGoNoGoScorecard {
    return { id: Number(entity.rowKey), projectId: entity.partitionKey as string, version: Number(entity.version), overallScore: Number(entity.overallScore), recommendation: entity.recommendation as string, createdAt: entity.createdAt as string, updatedAt: entity.updatedAt as string };
  }

  private toVersion(entity: Record<string, unknown>, scorecardId: number): IScorecardVersion {
    return { id: Number(entity.rowKey), scorecardId, version: Number(entity.version), snapshot: JSON.parse((entity.snapshotJson as string) || '{}') as Record<string, unknown>, createdAt: entity.createdAt as string };
  }
}

// ---------------------------------------------------------------------------
// Mock (in-memory)
// ---------------------------------------------------------------------------

export class MockScorecardService implements IScorecardService {
  private readonly scorecards = new Map<number, IGoNoGoScorecard>([
    [1, { id: 1, projectId: 'PRJ-001', version: 1, overallScore: 78, recommendation: 'Go', createdAt: '2026-01-05T00:00:00Z', updatedAt: '2026-01-10T00:00:00Z' }],
  ]);
  private readonly versions = new Map<number, IScorecardVersion>([
    [1, { id: 1, scorecardId: 1, version: 1, snapshot: { overallScore: 78, recommendation: 'Go' }, createdAt: '2026-01-05T00:00:00Z' }],
  ]);

  async listScorecards(projectId: string, page: number, pageSize: number): Promise<{ items: IGoNoGoScorecard[]; total: number }> {
    const all = [...this.scorecards.values()].filter((s) => s.projectId === projectId);
    const start = (page - 1) * pageSize;
    return { items: all.slice(start, start + pageSize), total: all.length };
  }

  async getScorecardById(id: number): Promise<IGoNoGoScorecard | null> { return this.scorecards.get(id) ?? null; }

  async createScorecard(data: Omit<IGoNoGoScorecard, 'id' | 'createdAt' | 'updatedAt'>): Promise<IGoNoGoScorecard> {
    const id = Date.now();
    const now = new Date().toISOString();
    const scorecard: IGoNoGoScorecard = { id, ...data, createdAt: now, updatedAt: now };
    this.scorecards.set(id, scorecard);
    return scorecard;
  }

  async updateScorecard(id: number, data: Partial<IGoNoGoScorecard>): Promise<IGoNoGoScorecard | null> {
    const existing = this.scorecards.get(id);
    if (!existing) return null;
    const updated: IGoNoGoScorecard = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
    this.scorecards.set(id, updated);
    return updated;
  }

  async deleteScorecard(id: number): Promise<void> { this.scorecards.delete(id); }

  async getVersions(scorecardId: number): Promise<IScorecardVersion[]> {
    return [...this.versions.values()].filter((v) => v.scorecardId === scorecardId);
  }
}

function isNotFound(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'statusCode' in err && (err as { statusCode: number }).statusCode === 404;
}
