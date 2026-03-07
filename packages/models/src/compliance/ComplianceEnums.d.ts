/**
 * Overall compliance status for a vendor requirement.
 */
export declare enum ComplianceStatus {
    /** Vendor is fully compliant. */
    Compliant = "Compliant",
    /** Vendor is not compliant — action required. */
    NonCompliant = "NonCompliant",
    /** Compliance documentation is expiring soon. */
    ExpiringSoon = "ExpiringSoon",
    /** Compliance status is pending review. */
    PendingReview = "PendingReview"
}
/**
 * Type of compliance requirement tracked.
 */
export declare enum ComplianceRequirementType {
    /** General liability or other insurance certificates. */
    Insurance = "Insurance",
    /** Trade or business license. */
    License = "License",
    /** Safety or OSHA certification. */
    SafetyCertification = "SafetyCertification",
    /** Performance or payment bond. */
    Bond = "Bond",
    /** Workers' compensation coverage. */
    WorkersComp = "WorkersComp"
}
//# sourceMappingURL=ComplianceEnums.d.ts.map