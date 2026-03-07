/**
 * Lifecycle status for a contract.
 */
export var ContractStatus;
(function (ContractStatus) {
    /** Contract is being drafted. */
    ContractStatus["Draft"] = "Draft";
    /** Contract is out for review / negotiation. */
    ContractStatus["UnderReview"] = "UnderReview";
    /** Contract has been fully executed. */
    ContractStatus["Executed"] = "Executed";
    /** Contract has been amended. */
    ContractStatus["Amended"] = "Amended";
    /** Contract has been terminated or voided. */
    ContractStatus["Terminated"] = "Terminated";
})(ContractStatus || (ContractStatus = {}));
/**
 * Approval status for a commitment.
 */
export var ApprovalStatus;
(function (ApprovalStatus) {
    /** Awaiting approval. */
    ApprovalStatus["Pending"] = "Pending";
    /** Approved by the required authority. */
    ApprovalStatus["Approved"] = "Approved";
    /** Rejected — revisions needed. */
    ApprovalStatus["Rejected"] = "Rejected";
    /** Returned for additional information. */
    ApprovalStatus["ReturnedForInfo"] = "ReturnedForInfo";
})(ApprovalStatus || (ApprovalStatus = {}));
//# sourceMappingURL=ContractEnums.js.map