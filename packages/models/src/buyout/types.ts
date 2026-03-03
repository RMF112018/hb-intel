/**
 * Buyout-specific type aliases.
 *
 * @module buyout/types
 */

/** Unique buyout entry identifier. */
export type BuyoutEntryId = number;

/** Search criteria for buyout list queries. */
export type BuyoutSearchCriteria = {
  /** Filter by buyout status. */
  status?: string;
  /** Filter by cost code (partial match). */
  costCode?: string;
};
