import type { IGoNoGoScorecard, IScorecardVersion, IPagedResult, IListQueryOptions } from '@hbc/models';
import type { IScorecardRepository } from '../../ports/IScorecardRepository.js';
import type { IdempotencyContext } from '../../retry/idempotency.js';
import { BaseRepository } from '../base.js';
import { paginate, genId } from './helpers.js';
import { SEED_SCORECARDS, SEED_SCORECARD_VERSIONS } from './seedData.js';

export class MockScorecardRepository extends BaseRepository<IGoNoGoScorecard> implements IScorecardRepository {
  private scorecards: IGoNoGoScorecard[] = [...SEED_SCORECARDS];
  private versions: IScorecardVersion[] = [...SEED_SCORECARD_VERSIONS];

  async getScorecards(projectId: string, options?: IListQueryOptions): Promise<IPagedResult<IGoNoGoScorecard>> {
    const filtered = this.scorecards.filter((s) => s.projectId === projectId);
    return paginate(filtered, options);
  }

  async getScorecardById(id: number): Promise<IGoNoGoScorecard | null> {
    this.validateId(id, 'Scorecard');
    return this.scorecards.find((s) => s.id === id) ?? null;
  }

  async createScorecard(data: Omit<IGoNoGoScorecard, 'id' | 'createdAt' | 'updatedAt'>, _idempotencyContext?: IdempotencyContext): Promise<IGoNoGoScorecard> {
    const scorecard: IGoNoGoScorecard = {
      ...data,
      id: genId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.scorecards.push(scorecard);
    return scorecard;
  }

  async updateScorecard(id: number, data: Partial<IGoNoGoScorecard>, _idempotencyContext?: IdempotencyContext): Promise<IGoNoGoScorecard> {
    this.validateId(id, 'Scorecard');
    const idx = this.scorecards.findIndex((s) => s.id === id);
    if (idx === -1) this.throwNotFound('Scorecard', id);
    this.scorecards[idx] = { ...this.scorecards[idx], ...data, updatedAt: new Date().toISOString() };
    return this.scorecards[idx];
  }

  async deleteScorecard(id: number): Promise<void> {
    this.validateId(id, 'Scorecard');
    this.scorecards = this.scorecards.filter((s) => s.id !== id);
  }

  async getVersions(scorecardId: number): Promise<IScorecardVersion[]> {
    this.validateId(scorecardId, 'Scorecard');
    return this.versions.filter((v) => v.scorecardId === scorecardId);
  }
}
