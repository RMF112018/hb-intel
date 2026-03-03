/**
 * Form input shape for creating or editing a schedule activity.
 */
export interface IScheduleActivityFormData {
  /** Associated project identifier. */
  projectId: string;
  /** Activity name / description. */
  name: string;
  /** ISO-8601 planned start date. */
  startDate: string;
  /** ISO-8601 planned end date. */
  endDate: string;
  /** Completion percentage (0–100). */
  percentComplete: number;
  /** Whether this activity is on the critical path. */
  isCriticalPath: boolean;
}
