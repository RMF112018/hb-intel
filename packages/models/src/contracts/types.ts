/**
 * Contracts-specific type aliases.
 *
 * @module contracts/types
 */

/** Unique contract identifier. */
export type ContractId = number;

/** Unique approval identifier. */
export type ApprovalId = number;

/** Search criteria for contract list queries. */
export type ContractSearchCriteria = {
  /** Filter by contract status. */
  status?: string;
  /** Filter by vendor name (partial match). */
  vendorName?: string;
};
