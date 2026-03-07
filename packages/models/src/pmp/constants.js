import { PmpStatus, SignatureStatus } from './PmpEnums.js';
/**
 * PMP-specific constants.
 *
 * @module pmp/constants
 */
/** Human-readable labels for PMP statuses. */
export const PMP_STATUS_LABELS = {
    [PmpStatus.Draft]: 'Draft',
    [PmpStatus.InReview]: 'In Review',
    [PmpStatus.Approved]: 'Approved',
    [PmpStatus.Superseded]: 'Superseded',
};
/** Human-readable labels for signature statuses. */
export const SIGNATURE_STATUS_LABELS = {
    [SignatureStatus.Pending]: 'Pending',
    [SignatureStatus.Signed]: 'Signed',
    [SignatureStatus.Declined]: 'Declined',
};
//# sourceMappingURL=constants.js.map