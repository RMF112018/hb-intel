import { ScheduleActivityStatus } from './ScheduleEnums.js';

/**
 * Schedule-specific constants.
 *
 * @module schedule/constants
 */

/** Human-readable labels for schedule activity statuses. */
export const SCHEDULE_STATUS_LABELS: Record<ScheduleActivityStatus, string> = {
  [ScheduleActivityStatus.NotStarted]: 'Not Started',
  [ScheduleActivityStatus.InProgress]: 'In Progress',
  [ScheduleActivityStatus.Completed]: 'Completed',
  [ScheduleActivityStatus.Delayed]: 'Delayed',
};
