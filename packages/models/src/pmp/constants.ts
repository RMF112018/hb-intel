import { PmpStatus, SignatureStatus } from './PmpEnums.js';

/**
 * PMP-specific constants.
 *
 * @module pmp/constants
 */

/** Human-readable labels for PMP statuses. */
export const PMP_STATUS_LABELS: Record<PmpStatus, string> = {
  [PmpStatus.Draft]: 'Draft',
  [PmpStatus.InReview]: 'In Review',
  [PmpStatus.Approved]: 'Approved',
  [PmpStatus.Superseded]: 'Superseded',
};

/** Human-readable labels for signature statuses. */
export const SIGNATURE_STATUS_LABELS: Record<SignatureStatus, string> = {
  [SignatureStatus.Pending]: 'Pending',
  [SignatureStatus.Signed]: 'Signed',
  [SignatureStatus.Declined]: 'Declined',
};
