/**
 * System-level roles that determine global access privileges.
 *
 * ADMIN has the highest privilege level, followed by C_SUITE.
 */
export declare enum SystemRole {
    /** Full administrative access. */
    Admin = "ADMIN",
    /** C-suite executives — global project access. */
    CSuite = "C_SUITE",
    /** Project executive oversight. */
    ProjectExecutive = "PROJECT_EXECUTIVE",
    /** Project management responsibilities. */
    ProjectManager = "PROJECT_MANAGER",
    /** Day-to-day operational staff. */
    OperationsStaff = "OPERATIONS_STAFF"
}
/**
 * Authentication mode used by the application.
 *
 * - `msal` — Azure Entra ID (production)
 * - `dev` — Credentials provider (development only)
 */
export type AuthMode = 'msal' | 'dev';
//# sourceMappingURL=AuthEnums.d.ts.map