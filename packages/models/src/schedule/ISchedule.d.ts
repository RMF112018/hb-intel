/**
 * A single schedule activity within a project.
 *
 * @example
 * ```ts
 * import type { IScheduleActivity } from '@hbc/models';
 * ```
 */
export interface IScheduleActivity {
    /** Unique activity identifier. */
    id: number;
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
/**
 * Aggregate schedule metrics for a project.
 */
export interface IScheduleMetrics {
    /** Associated project identifier. */
    projectId: string;
    /** Total number of scheduled activities. */
    totalActivities: number;
    /** Number of completed activities. */
    completedActivities: number;
    /** Variance on the critical path (days — negative = behind). */
    criticalPathVariance: number;
    /** Overall project completion percentage (0–100). */
    overallPercentComplete: number;
}
//# sourceMappingURL=ISchedule.d.ts.map