import type { IGoNoGoScorecard, IScorecardVersion, IPagedResult, IListQueryOptions } from '@hbc/models';
import type { IdempotencyContext } from '../retry/idempotency.js';

/**
 * Port interface for the Scorecard (Go/No-Go evaluation) domain.
 *
 * @example
 * ```ts
 * const repo = createScorecardRepository();
 * const scorecards = await repo.getScorecards('PRJ-001');
 * const versions = await repo.getVersions(1);
 * ```
 */
export interface IScorecardRepository {
  /**
   * Retrieve paginated scorecards for a project.
   * @param projectId - The project identifier.
   * @param options - Pagination and sort options.
   * @returns Paginated result set of scorecards.
   */
  getScorecards(projectId: string, options?: IListQueryOptions): Promise<IPagedResult<IGoNoGoScorecard>>;

  /**
   * Retrieve a single scorecard by its numeric ID.
   * @param id - The scorecard ID.
   * @returns The scorecard, or `null` if not found.
   */
  getScorecardById(id: number): Promise<IGoNoGoScorecard | null>;

  /**
   * Create a new Go/No-Go scorecard.
   * @param data - Scorecard data without generated fields (id, timestamps).
   * @returns The newly created scorecard.
   */
  createScorecard(data: Omit<IGoNoGoScorecard, 'id' | 'createdAt' | 'updatedAt'>, idempotencyContext?: IdempotencyContext): Promise<IGoNoGoScorecard>;

  /**
   * Update an existing scorecard.
   * @param id - The scorecard ID to update.
   * @param data - Partial scorecard data to merge.
   * @returns The updated scorecard.
   * @throws {NotFoundError} If the scorecard does not exist.
   */
  updateScorecard(id: number, data: Partial<IGoNoGoScorecard>, idempotencyContext?: IdempotencyContext): Promise<IGoNoGoScorecard>;

  /**
   * Delete a scorecard by ID.
   * @param id - The scorecard ID to remove.
   */
  deleteScorecard(id: number): Promise<void>;

  /**
   * Retrieve all version snapshots for a scorecard.
   * @param scorecardId - The scorecard ID.
   * @returns Array of version snapshots ordered by version number.
   */
  getVersions(scorecardId: number): Promise<IScorecardVersion[]>;
}
