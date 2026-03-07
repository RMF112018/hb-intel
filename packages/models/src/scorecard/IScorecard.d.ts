/**
 * A Go/No-Go scorecard for evaluating project pursuit decisions.
 *
 * @example
 * ```ts
 * import type { IGoNoGoScorecard } from '@hbc/models';
 * ```
 */
export interface IGoNoGoScorecard {
    /** Unique scorecard identifier. */
    id: number;
    /** Associated project identifier. */
    projectId: string;
    /** Version number of this scorecard revision. */
    version: number;
    /** Computed overall score (0–100). */
    overallScore: number;
    /** Final recommendation based on score and criteria. */
    recommendation: string;
    /** ISO-8601 creation timestamp. */
    createdAt: string;
    /** ISO-8601 last-updated timestamp. */
    updatedAt: string;
}
/**
 * A historical snapshot of a scorecard version.
 */
export interface IScorecardVersion {
    /** Unique version record identifier. */
    id: number;
    /** Parent scorecard identifier. */
    scorecardId: number;
    /** Version number. */
    version: number;
    /** Full scorecard data snapshot. */
    snapshot: Record<string, unknown>;
    /** ISO-8601 creation timestamp of this version. */
    createdAt: string;
}
//# sourceMappingURL=IScorecard.d.ts.map