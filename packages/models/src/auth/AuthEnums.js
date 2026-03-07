/**
 * System-level roles that determine global access privileges.
 *
 * ADMIN has the highest privilege level, followed by C_SUITE.
 */
export var SystemRole;
(function (SystemRole) {
    /** Full administrative access. */
    SystemRole["Admin"] = "ADMIN";
    /** C-suite executives — global project access. */
    SystemRole["CSuite"] = "C_SUITE";
    /** Project executive oversight. */
    SystemRole["ProjectExecutive"] = "PROJECT_EXECUTIVE";
    /** Project management responsibilities. */
    SystemRole["ProjectManager"] = "PROJECT_MANAGER";
    /** Day-to-day operational staff. */
    SystemRole["OperationsStaff"] = "OPERATIONS_STAFF";
})(SystemRole || (SystemRole = {}));
//# sourceMappingURL=AuthEnums.js.map