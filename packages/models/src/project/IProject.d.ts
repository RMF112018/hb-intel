/**
 * The currently active project within the user's session.
 *
 * Set via the project picker and persisted in the `activeProjectId` cookie.
 *
 * @example
 * ```ts
 * import type { IActiveProject } from '@hbc/models';
 * ```
 */
export interface IActiveProject {
    /** Unique project identifier (UUID). */
    id: string;
    /** Project display name. */
    name: string;
    /** Project number / code (e.g. "PRJ-A1B2C3"). */
    number: string;
    /** Current project status. */
    status: string;
    /** ISO-8601 project start date. */
    startDate: string;
    /** ISO-8601 project end date. */
    endDate: string;
}
/**
 * Summary statistics for the project portfolio dashboard.
 */
export interface IPortfolioSummary {
    /** Total number of projects in the portfolio. */
    totalProjects: number;
    /** Number of currently active projects. */
    activeProjects: number;
    /** Sum of all contract values in USD. */
    totalContractValue: number;
    /** Weighted average percent complete across active projects. */
    averagePercentComplete: number;
}
//# sourceMappingURL=IProject.d.ts.map