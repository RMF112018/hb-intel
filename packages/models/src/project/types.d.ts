/**
 * Project-specific type aliases.
 *
 * @module project/types
 */
/** Unique project identifier (UUID). */
export type ProjectId = string;
/** Project number string (e.g. "PRJ-A1B2C3"). */
export type ProjectNumber = string;
/** Search criteria for project list queries. */
export type ProjectSearchCriteria = {
    /** Filter by project status. */
    status?: string;
    /** Filter by project name (partial match). */
    name?: string;
};
//# sourceMappingURL=types.d.ts.map