/**
 * Compliance-specific type aliases.
 *
 * @module compliance/types
 */

/** Unique compliance entry identifier. */
export type ComplianceEntryId = number;

/** Search criteria for compliance list queries. */
export type ComplianceSearchCriteria = {
  /** Filter by compliance status. */
  status?: string;
  /** Filter by vendor name (partial match). */
  vendorName?: string;
  /** Filter by requirement type. */
  requirementType?: string;
};
