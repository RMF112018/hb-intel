import type { IScheduleActivity, IScheduleMetrics, IPagedResult, IListQueryOptions } from '@hbc/models';
import type { IdempotencyContext } from '../retry/idempotency.js';

/**
 * Port interface for the Schedule (activity tracking) domain.
 *
 * @example
 * ```ts
 * const repo = createScheduleRepository();
 * const activities = await repo.getActivities('PRJ-001');
 * const metrics = await repo.getMetrics('PRJ-001');
 * ```
 */
export interface IScheduleRepository {
  /**
   * Retrieve paginated schedule activities for a project.
   * @param projectId - The project identifier.
   * @param options - Pagination and sort options.
   * @returns Paginated result set of activities.
   */
  getActivities(projectId: string, options?: IListQueryOptions): Promise<IPagedResult<IScheduleActivity>>;

  /**
   * Retrieve a single activity by its numeric ID.
   * @param id - The activity ID.
   * @returns The activity, or `null` if not found.
   */
  getActivityById(id: number): Promise<IScheduleActivity | null>;

  /**
   * Create a new schedule activity.
   * @param data - Activity data without the generated `id`.
   * @returns The newly created activity.
   */
  createActivity(data: Omit<IScheduleActivity, 'id'>, idempotencyContext?: IdempotencyContext): Promise<IScheduleActivity>;

  /**
   * Update an existing activity.
   * @param id - The activity ID to update.
   * @param data - Partial activity data to merge.
   * @returns The updated activity.
   * @throws {NotFoundError} If the activity does not exist.
   */
  updateActivity(id: number, data: Partial<IScheduleActivity>, idempotencyContext?: IdempotencyContext): Promise<IScheduleActivity>;

  /**
   * Delete an activity by ID.
   * @param id - The activity ID to remove.
   */
  deleteActivity(id: number): Promise<void>;

  /**
   * Compute aggregate schedule metrics for a project.
   * @param projectId - The project identifier.
   * @returns Schedule metrics including completion and critical-path variance.
   */
  getMetrics(projectId: string): Promise<IScheduleMetrics>;
}
