/**
 * Lifecycle status for a contract.
 */
export enum ContractStatus {
  /** Contract is being drafted. */
  Draft = 'Draft',
  /** Contract is out for review / negotiation. */
  UnderReview = 'UnderReview',
  /** Contract has been fully executed. */
  Executed = 'Executed',
  /** Contract has been amended. */
  Amended = 'Amended',
  /** Contract has been terminated or voided. */
  Terminated = 'Terminated',
}

/**
 * Approval status for a commitment.
 */
export enum ApprovalStatus {
  /** Awaiting approval. */
  Pending = 'Pending',
  /** Approved by the required authority. */
  Approved = 'Approved',
  /** Rejected — revisions needed. */
  Rejected = 'Rejected',
  /** Returned for additional information. */
  ReturnedForInfo = 'ReturnedForInfo',
}
