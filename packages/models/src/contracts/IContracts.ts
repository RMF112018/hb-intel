/**
 * Contract information for a vendor / subcontractor agreement.
 *
 * @example
 * ```ts
 * import type { IContractInfo } from '@hbc/models';
 * ```
 */
export interface IContractInfo {
  /** Unique contract identifier. */
  id: number;
  /** Associated project identifier. */
  projectId: string;
  /** Contract number / reference. */
  contractNumber: string;
  /** Vendor or subcontractor name. */
  vendorName: string;
  /** Contract amount in USD. */
  amount: number;
  /** Current contract status. */
  status: string;
  /** ISO-8601 date when the contract was executed. */
  executedDate: string;
}

/**
 * An approval record for a commitment / contract.
 */
export interface ICommitmentApproval {
  /** Unique approval identifier. */
  id: number;
  /** Contract being approved. */
  contractId: number;
  /** Name of the approver. */
  approverName: string;
  /** ISO-8601 timestamp when approval was granted. */
  approvedAt: string;
  /** Approval status. */
  status: string;
  /** Approver's notes or comments. */
  notes: string;
}
