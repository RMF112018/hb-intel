/**
 * Deterministic user identities for the HB Kudos stress suite.
 *
 * Each fixture below represents a "current user" perspective. The
 * harness seed installs `currentUserId` + `currentUserRole` to drive
 * role-capability gating and visibility predicates (C5/C6/C7).
 */
export type KudosUserRole = 'public' | 'reviewer' | 'admin';

export interface KudosUser {
  id: string;
  displayName: string;
  role: KudosUserRole;
  hasPhoto: boolean;
}

export const USERS = {
  submitter: { id: 'user-submitter', displayName: 'Sam Submitter', role: 'public', hasPhoto: true },
  recipient: { id: 'user-recipient', displayName: 'Ren Recipient', role: 'public', hasPhoto: true },
  recipientNoPhoto: {
    id: 'user-recipient-nophoto',
    displayName: 'Pat Recipient',
    role: 'public',
    hasPhoto: false,
  },
  unrelated: { id: 'user-unrelated', displayName: 'Unrelated User', role: 'public', hasPhoto: true },
  reviewer: { id: 'user-reviewer', displayName: 'Rae Reviewer', role: 'reviewer', hasPhoto: true },
  admin: { id: 'user-admin', displayName: 'Ava Admin', role: 'admin', hasPhoto: true },
  otherAdmin: {
    id: 'user-other-admin',
    displayName: 'Ollie Admin',
    role: 'admin',
    hasPhoto: true,
  },
} as const satisfies Record<string, KudosUser>;

export type KudosUserKey = keyof typeof USERS;
