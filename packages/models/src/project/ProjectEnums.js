/**
 * Lifecycle status for a construction project.
 */
export var ProjectStatus;
(function (ProjectStatus) {
    /** Project is actively under construction or management. */
    ProjectStatus["Active"] = "Active";
    /** Project is temporarily paused. */
    ProjectStatus["OnHold"] = "OnHold";
    /** Project has been completed and closed out. */
    ProjectStatus["Completed"] = "Completed";
    /** Project was cancelled before completion. */
    ProjectStatus["Cancelled"] = "Cancelled";
})(ProjectStatus || (ProjectStatus = {}));
//# sourceMappingURL=ProjectEnums.js.map