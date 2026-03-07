import { ScheduleActivityStatus } from './ScheduleEnums.js';
/**
 * Schedule-specific constants.
 *
 * @module schedule/constants
 */
/** Human-readable labels for schedule activity statuses. */
export const SCHEDULE_STATUS_LABELS = {
    [ScheduleActivityStatus.NotStarted]: 'Not Started',
    [ScheduleActivityStatus.InProgress]: 'In Progress',
    [ScheduleActivityStatus.Completed]: 'Completed',
    [ScheduleActivityStatus.Delayed]: 'Delayed',
};
//# sourceMappingURL=constants.js.map