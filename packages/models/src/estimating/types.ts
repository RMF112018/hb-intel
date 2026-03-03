/**
 * Estimating-specific type aliases.
 *
 * @module estimating/types
 */

/** Unique estimating tracker identifier. */
export type EstimatingTrackerId = number;

/** Search criteria for estimating list queries. */
export type EstimatingSearchCriteria = {
  /** Filter by estimating status. */
  status?: string;
  /** Filter by bid number (partial match). */
  bidNumber?: string;
};
