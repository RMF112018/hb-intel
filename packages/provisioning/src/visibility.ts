import type { NormalizedAuthSession as IAuthSession } from '@hbc/auth';

const FULL_CHECKLIST_ROLES = ['Admin', 'HBIntelAdmin'];
const NO_NOTIFICATION_ROLES = ['Leadership', 'SharedServices'];

/**
 * D-PH6-09 role-based provisioning visibility resolver.
 * Traceability: docs/architecture/plans/PH6.9-Provisioning-Package.md §6.9.4
 */
export function getProvisioningVisibility(
  session: IAuthSession | null,
  submittedBy: string
): 'full' | 'notification' | 'none' {
  if (!session) return 'none';

  const roles = session.resolvedRoles ?? [];

  // Admin audiences always see the full 7-step checklist.
  if (roles.some((r) => FULL_CHECKLIST_ROLES.includes(r))) return 'full';
  if (session.user.email === submittedBy) return 'full';

  // Leadership + Shared Services never receive provisioning notifications.
  if (roles.some((r) => NO_NOTIFICATION_ROLES.includes(r))) return 'none';

  // OpEx, Pursuit Team, and Project Team receive start/finish notifications only.
  return 'notification';
}
