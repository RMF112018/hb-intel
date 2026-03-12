/**
 * Canonical owner projection for BIC-aligned readiness assignments.
 *
 * @design D-SF18-T02
 */
export interface IBicOwner {
  readonly userId: string;
  readonly displayName: string;
  readonly role: string;
  readonly avatarUrl?: string;
}
