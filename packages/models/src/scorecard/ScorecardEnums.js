/**
 * Recommendation outcome for a Go/No-Go scorecard evaluation.
 */
export var ScorecardRecommendation;
(function (ScorecardRecommendation) {
    /** Proceed with the project pursuit. */
    ScorecardRecommendation["Go"] = "Go";
    /** Do not pursue this project. */
    ScorecardRecommendation["NoGo"] = "NoGo";
    /** Conditional pursuit — requires specific conditions to be met. */
    ScorecardRecommendation["Conditional"] = "Conditional";
    /** Decision is deferred pending additional information. */
    ScorecardRecommendation["Deferred"] = "Deferred";
})(ScorecardRecommendation || (ScorecardRecommendation = {}));
//# sourceMappingURL=ScorecardEnums.js.map