import { ComplianceStatus } from './ComplianceEnums.js';
/**
 * Compliance-specific constants.
 *
 * @module compliance/constants
 */
/** Human-readable labels for compliance statuses. */
export const COMPLIANCE_STATUS_LABELS = {
    [ComplianceStatus.Compliant]: 'Compliant',
    [ComplianceStatus.NonCompliant]: 'Non-Compliant',
    [ComplianceStatus.ExpiringSoon]: 'Expiring Soon',
    [ComplianceStatus.PendingReview]: 'Pending Review',
};
/** Number of days before expiration to trigger the "expiring soon" warning. */
export const COMPLIANCE_EXPIRY_WARNING_DAYS = 30;
//# sourceMappingURL=constants.js.map