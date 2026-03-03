/**
 * Status of a schedule activity.
 */
export enum ScheduleActivityStatus {
  /** Activity has not started yet. */
  NotStarted = 'NotStarted',
  /** Activity is currently in progress. */
  InProgress = 'InProgress',
  /** Activity has been completed. */
  Completed = 'Completed',
  /** Activity is behind schedule. */
  Delayed = 'Delayed',
}
