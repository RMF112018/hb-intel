/**
 * Lifecycle status for a Project Management Plan.
 */
export var PmpStatus;
(function (PmpStatus) {
    /** PMP is being drafted. */
    PmpStatus["Draft"] = "Draft";
    /** PMP is out for review. */
    PmpStatus["InReview"] = "InReview";
    /** PMP has been approved and is active. */
    PmpStatus["Approved"] = "Approved";
    /** PMP has been superseded by a newer version. */
    PmpStatus["Superseded"] = "Superseded";
})(PmpStatus || (PmpStatus = {}));
/**
 * Status of a PMP signature.
 */
export var SignatureStatus;
(function (SignatureStatus) {
    /** Signature is pending (not yet signed). */
    SignatureStatus["Pending"] = "Pending";
    /** Signature has been applied. */
    SignatureStatus["Signed"] = "Signed";
    /** Signer declined to sign. */
    SignatureStatus["Declined"] = "Declined";
})(SignatureStatus || (SignatureStatus = {}));
//# sourceMappingURL=PmpEnums.js.map