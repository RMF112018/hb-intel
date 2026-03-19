import type { IEstimatingTracker, IEstimatingKickoff, IPagedResult, IListQueryOptions } from '@hbc/models';
import type { IdempotencyContext } from '../retry/idempotency.js';

/**
 * Port interface for the Estimating (bid tracking and kickoff) domain.
 *
 * @example
 * ```ts
 * const repo = createEstimatingRepository();
 * const trackers = await repo.getAllTrackers({ page: 1 });
 * const kickoff = await repo.getKickoff('PRJ-001');
 * ```
 */
export interface IEstimatingRepository {
  /**
   * Retrieve a paginated list of all estimating trackers.
   * @param options - Pagination and sort options.
   * @returns Paginated result set of trackers.
   */
  getAllTrackers(options?: IListQueryOptions): Promise<IPagedResult<IEstimatingTracker>>;

  /**
   * Retrieve a single tracker by its numeric ID.
   * @param id - The tracker ID.
   * @returns The tracker, or `null` if not found.
   */
  getTrackerById(id: number): Promise<IEstimatingTracker | null>;

  /**
   * Create a new estimating tracker.
   * @param data - Tracker data without generated fields (id, timestamps).
   * @returns The newly created tracker.
   */
  createTracker(data: Omit<IEstimatingTracker, 'id' | 'createdAt' | 'updatedAt'>, idempotencyContext?: IdempotencyContext): Promise<IEstimatingTracker>;

  /**
   * Update an existing tracker.
   * @param id - The tracker ID to update.
   * @param data - Partial tracker data to merge.
   * @returns The updated tracker.
   * @throws {NotFoundError} If the tracker does not exist.
   */
  updateTracker(id: number, data: Partial<IEstimatingTracker>, idempotencyContext?: IdempotencyContext): Promise<IEstimatingTracker>;

  /**
   * Delete a tracker by ID.
   * @param id - The tracker ID to remove.
   */
  deleteTracker(id: number): Promise<void>;

  /**
   * Retrieve the kickoff record for a project.
   * @param projectId - The project identifier (e.g. `'PRJ-001'`).
   * @returns The kickoff, or `null` if none exists.
   */
  getKickoff(projectId: string): Promise<IEstimatingKickoff | null>;

  /**
   * Create a new estimating kickoff record.
   * @param data - Kickoff data without generated fields (id, createdAt).
   * @returns The newly created kickoff.
   */
  createKickoff(data: Omit<IEstimatingKickoff, 'id' | 'createdAt'>, idempotencyContext?: IdempotencyContext): Promise<IEstimatingKickoff>;
}
