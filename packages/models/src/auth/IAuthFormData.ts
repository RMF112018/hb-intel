/**
 * Form input for credential-based sign-in (dev mode).
 *
 * Production uses Azure Entra ID / MSAL and does not require form data.
 */
export interface ILoginFormData {
  /** User's email address. */
  email: string;
  /** User's password. */
  password: string;
}

/**
 * Form input for assigning a role to a user.
 */
export interface IRoleAssignmentFormData {
  /** User ID receiving the role. */
  userId: string;
  /** Role ID to assign. */
  roleId: string;
}
