/**
 * Buyout lifecycle status for a cost code / trade.
 */
export var BuyoutStatus;
(function (BuyoutStatus) {
    /** Buyout has not yet started for this trade. */
    BuyoutStatus["Pending"] = "Pending";
    /** Buyout is actively being negotiated. */
    BuyoutStatus["InProgress"] = "InProgress";
    /** Subcontract has been committed / executed. */
    BuyoutStatus["Committed"] = "Committed";
    /** Buyout is fully complete (all paperwork finalized). */
    BuyoutStatus["Complete"] = "Complete";
})(BuyoutStatus || (BuyoutStatus = {}));
//# sourceMappingURL=BuyoutEnums.js.map