/**
 * MSAL initialization helpers — Blueprint §2b.
 * Shared utilities that apps/pwa/src/auth/msal-init.ts delegates to.
 * Keeps @hbc/auth as the single auth abstraction layer.
 */
import type { IInternalUser } from '@hbc/models';
import type { IMsalConfig } from '../adapters/index.js';

/**
 * Map an MSAL-like account object to ICurrentUser.
 * Used by the PWA's msal-init.ts after successful authentication.
 */
export function mapMsalAccountToUser(account: {
  localAccountId: string;
  name?: string;
  username: string;
}): IInternalUser {
  return {
    type: 'internal',
    id: account.localAccountId,
    displayName: account.name ?? account.username,
    email: account.username,
    roles: [
      {
        id: 'role-default',
        name: 'User',
        grants: ['project:read', 'document:read'],
        source: 'manual',
      },
    ],
  };
}

/**
 * Validate MSAL configuration. Throws if required fields are missing.
 */
export function validateMsalConfig(config: IMsalConfig): void {
  if (!config.clientId) throw new Error('MSAL clientId is required');
  if (!config.authority) throw new Error('MSAL authority is required');
  if (!config.redirectUri) throw new Error('MSAL redirectUri is required');
}
