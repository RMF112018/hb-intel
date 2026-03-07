/**
 * Status of a schedule activity.
 */
export var ScheduleActivityStatus;
(function (ScheduleActivityStatus) {
    /** Activity has not started yet. */
    ScheduleActivityStatus["NotStarted"] = "NotStarted";
    /** Activity is currently in progress. */
    ScheduleActivityStatus["InProgress"] = "InProgress";
    /** Activity has been completed. */
    ScheduleActivityStatus["Completed"] = "Completed";
    /** Activity is behind schedule. */
    ScheduleActivityStatus["Delayed"] = "Delayed";
})(ScheduleActivityStatus || (ScheduleActivityStatus = {}));
//# sourceMappingURL=ScheduleEnums.js.map