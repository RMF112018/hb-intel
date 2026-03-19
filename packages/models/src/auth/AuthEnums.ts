/**
 * System-level roles that determine global access privileges.
 *
 * SYSTEM_ADMIN has the highest privilege level.
 */
export enum SystemRole {
  /** Full administrative access. */
  SystemAdmin = 'SYSTEM_ADMIN',
  /** Executive leadership — global project access. */
  Executive = 'EXECUTIVE',
  /** Project executive oversight. */
  ProjectExecutive = 'PROJECT_EXECUTIVE',
  /** Project management responsibilities. */
  ProjectManager = 'PROJECT_MANAGER',
  /** On-site construction superintendent. */
  Superintendent = 'SUPERINTENDENT',
  /** Preconstruction / estimating role. */
  Preconstruction = 'PRECONSTRUCTION',
  /** Project support / coordination. */
  ProjectSupport = 'PROJECT_SUPPORT',
  /** Office-based administrative staff. */
  OfficeStaff = 'OFFICE_STAFF',
  /** Field-based operational staff. */
  FieldStaff = 'FIELD_STAFF',
}

/**
 * Authentication mode used by the application.
 *
 * - `msal` — Azure Entra ID (production)
 * - `dev` — Credentials provider (development only)
 */
export type AuthMode = 'msal' | 'dev';
