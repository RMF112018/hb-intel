/**
 * Risk-specific type aliases.
 *
 * @module risk/types
 */
/** Unique risk cost item identifier. */
export type RiskItemId = number;
/** Search criteria for risk list queries. */
export type RiskSearchCriteria = {
    /** Filter by risk category. */
    category?: string;
    /** Filter by risk status. */
    status?: string;
    /** Minimum probability threshold (0–1). */
    minProbability?: number;
};
//# sourceMappingURL=types.d.ts.map