/**
 * Lead-specific type aliases.
 *
 * @module leads/types
 */

/** Unique numeric identifier for a lead record. */
export type LeadId = number;

/** Search criteria passed to lead list queries. */
export type LeadSearchCriteria = {
  /** Filter by pipeline stage. */
  stage?: string;
  /** Filter by client name (partial match). */
  clientName?: string;
  /** Minimum estimated value in USD. */
  minValue?: number;
  /** Maximum estimated value in USD. */
  maxValue?: number;
};
