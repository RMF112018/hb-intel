import { ContractStatus, ApprovalStatus } from './ContractEnums.js';

/**
 * Contracts-specific constants.
 *
 * @module contracts/constants
 */

/** Human-readable labels for contract statuses. */
export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  [ContractStatus.Draft]: 'Draft',
  [ContractStatus.UnderReview]: 'Under Review',
  [ContractStatus.Executed]: 'Executed',
  [ContractStatus.Amended]: 'Amended',
  [ContractStatus.Terminated]: 'Terminated',
};

/** Human-readable labels for approval statuses. */
export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  [ApprovalStatus.Pending]: 'Pending',
  [ApprovalStatus.Approved]: 'Approved',
  [ApprovalStatus.Rejected]: 'Rejected',
  [ApprovalStatus.ReturnedForInfo]: 'Returned for Info',
};
