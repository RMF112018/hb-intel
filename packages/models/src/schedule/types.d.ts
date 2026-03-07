/**
 * Schedule-specific type aliases.
 *
 * @module schedule/types
 */
/** Unique schedule activity identifier. */
export type ScheduleActivityId = number;
/** Search criteria for schedule activity list queries. */
export type ScheduleSearchCriteria = {
    /** Filter by activity status. */
    status?: string;
    /** Filter to only critical path activities. */
    criticalPathOnly?: boolean;
};
//# sourceMappingURL=types.d.ts.map