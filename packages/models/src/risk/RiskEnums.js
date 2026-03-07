/**
 * Category classification for a risk item.
 */
export var RiskCategory;
(function (RiskCategory) {
    /** Safety-related risk. */
    RiskCategory["Safety"] = "Safety";
    /** Financial / budget risk. */
    RiskCategory["Financial"] = "Financial";
    /** Schedule / timeline risk. */
    RiskCategory["Schedule"] = "Schedule";
    /** Quality / workmanship risk. */
    RiskCategory["Quality"] = "Quality";
    /** Regulatory or legal risk. */
    RiskCategory["Regulatory"] = "Regulatory";
    /** Environmental risk. */
    RiskCategory["Environmental"] = "Environmental";
})(RiskCategory || (RiskCategory = {}));
/**
 * Lifecycle status for a risk item.
 */
export var RiskStatus;
(function (RiskStatus) {
    /** Risk has been identified but not yet assessed. */
    RiskStatus["Identified"] = "Identified";
    /** Risk is being actively monitored. */
    RiskStatus["Open"] = "Open";
    /** Mitigation actions are in progress. */
    RiskStatus["Mitigating"] = "Mitigating";
    /** Risk has been fully mitigated. */
    RiskStatus["Mitigated"] = "Mitigated";
    /** Risk materialized into an actual issue. */
    RiskStatus["Realized"] = "Realized";
    /** Risk was closed without materializing. */
    RiskStatus["Closed"] = "Closed";
})(RiskStatus || (RiskStatus = {}));
//# sourceMappingURL=RiskEnums.js.map