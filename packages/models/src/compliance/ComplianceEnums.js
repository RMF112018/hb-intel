/**
 * Overall compliance status for a vendor requirement.
 */
export var ComplianceStatus;
(function (ComplianceStatus) {
    /** Vendor is fully compliant. */
    ComplianceStatus["Compliant"] = "Compliant";
    /** Vendor is not compliant — action required. */
    ComplianceStatus["NonCompliant"] = "NonCompliant";
    /** Compliance documentation is expiring soon. */
    ComplianceStatus["ExpiringSoon"] = "ExpiringSoon";
    /** Compliance status is pending review. */
    ComplianceStatus["PendingReview"] = "PendingReview";
})(ComplianceStatus || (ComplianceStatus = {}));
/**
 * Type of compliance requirement tracked.
 */
export var ComplianceRequirementType;
(function (ComplianceRequirementType) {
    /** General liability or other insurance certificates. */
    ComplianceRequirementType["Insurance"] = "Insurance";
    /** Trade or business license. */
    ComplianceRequirementType["License"] = "License";
    /** Safety or OSHA certification. */
    ComplianceRequirementType["SafetyCertification"] = "SafetyCertification";
    /** Performance or payment bond. */
    ComplianceRequirementType["Bond"] = "Bond";
    /** Workers' compensation coverage. */
    ComplianceRequirementType["WorkersComp"] = "WorkersComp";
})(ComplianceRequirementType || (ComplianceRequirementType = {}));
//# sourceMappingURL=ComplianceEnums.js.map