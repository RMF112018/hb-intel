/**
 * Lifecycle status for an estimating effort.
 */
export var EstimatingStatus;
(function (EstimatingStatus) {
    /** Estimate is being drafted. */
    EstimatingStatus["Draft"] = "Draft";
    /** Estimate is actively being worked on. */
    EstimatingStatus["InProgress"] = "InProgress";
    /** Estimate has been submitted to the client. */
    EstimatingStatus["Submitted"] = "Submitted";
    /** Bid was awarded. */
    EstimatingStatus["Awarded"] = "Awarded";
    /** Bid was lost. */
    EstimatingStatus["Lost"] = "Lost";
})(EstimatingStatus || (EstimatingStatus = {}));
//# sourceMappingURL=EstimatingEnums.js.map