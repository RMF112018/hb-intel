/**
 * A compliance entry tracking a vendor's regulatory requirement.
 *
 * @example
 * ```ts
 * import type { IComplianceEntry } from '@hbc/models';
 * ```
 */
export interface IComplianceEntry {
  /** Unique compliance entry identifier. */
  id: number;
  /** Associated project identifier. */
  projectId: string;
  /** Name of the vendor or subcontractor. */
  vendorName: string;
  /** Type of compliance requirement (e.g. insurance, license). */
  requirementType: string;
  /** Current compliance status. */
  status: string;
  /** ISO-8601 expiration date for this requirement. */
  expirationDate: string;
}

/**
 * Aggregate compliance summary for a project.
 */
export interface IComplianceSummary {
  /** Associated project identifier. */
  projectId: string;
  /** Total number of compliance entries. */
  totalEntries: number;
  /** Number of entries currently compliant. */
  compliant: number;
  /** Number of non-compliant entries. */
  nonCompliant: number;
  /** Number of entries expiring within the warning window. */
  expiringSoon: number;
}
