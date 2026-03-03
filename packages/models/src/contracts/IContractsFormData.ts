/**
 * Form input shape for creating or editing a contract.
 */
export interface IContractFormData {
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
 * Form input shape for submitting a commitment approval.
 */
export interface ICommitmentApprovalFormData {
  /** Contract being approved. */
  contractId: number;
  /** Approval status. */
  status: string;
  /** Approver's notes or comments. */
  notes: string;
}
