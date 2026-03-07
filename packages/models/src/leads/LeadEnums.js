/**
 * Pipeline stages for a construction lead.
 *
 * The lifecycle progresses roughly left-to-right:
 * Identified → Qualifying → BidDecision → Bidding → Awarded | Lost | Declined
 */
export var LeadStage;
(function (LeadStage) {
    /** Lead has been identified but not yet evaluated. */
    LeadStage["Identified"] = "Identified";
    /** Lead is being qualified for fit and feasibility. */
    LeadStage["Qualifying"] = "Qualifying";
    /** Decision point: pursue the bid or decline. */
    LeadStage["BidDecision"] = "BidDecision";
    /** Actively preparing and submitting a bid. */
    LeadStage["Bidding"] = "Bidding";
    /** Bid was awarded — lead converts to a project. */
    LeadStage["Awarded"] = "Awarded";
    /** Bid was lost to a competitor. */
    LeadStage["Lost"] = "Lost";
    /** Opportunity was declined internally. */
    LeadStage["Declined"] = "Declined";
})(LeadStage || (LeadStage = {}));
//# sourceMappingURL=LeadEnums.js.map