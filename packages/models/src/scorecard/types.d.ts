/**
 * Scorecard-specific type aliases.
 *
 * @module scorecard/types
 */
/** Unique scorecard identifier. */
export type ScorecardId = number;
/** Search criteria for scorecard list queries. */
export type ScorecardSearchCriteria = {
    /** Filter by recommendation. */
    recommendation?: string;
    /** Minimum overall score. */
    minScore?: number;
};
//# sourceMappingURL=types.d.ts.map