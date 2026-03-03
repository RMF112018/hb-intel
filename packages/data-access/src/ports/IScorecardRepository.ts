import type { IGoNoGoScorecard, IScorecardVersion, IPagedResult, IListQueryOptions } from '@hbc/models';

/** Port interface for Scorecard domain data operations. */
export interface IScorecardRepository {
  getScorecards(projectId: string, options?: IListQueryOptions): Promise<IPagedResult<IGoNoGoScorecard>>;
  getScorecardById(id: number): Promise<IGoNoGoScorecard | null>;
  createScorecard(data: Omit<IGoNoGoScorecard, 'id' | 'createdAt' | 'updatedAt'>): Promise<IGoNoGoScorecard>;
  updateScorecard(id: number, data: Partial<IGoNoGoScorecard>): Promise<IGoNoGoScorecard>;
  deleteScorecard(id: number): Promise<void>;
  getVersions(scorecardId: number): Promise<IScorecardVersion[]>;
}
