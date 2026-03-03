/**
 * MSAL initialization — Blueprint §2b, Foundation Plan Phase 4.
 * Async bootstrap: create PublicClientApplication, handle redirect,
 * attempt silent token, map AccountInfo → ICurrentUser + stores.
 */
import {
  PublicClientApplication,
  type AccountInfo,
  type AuthenticationResult,
} from '@azure/msal-browser';
import type { ICurrentUser } from '@hbc/models';
import { useAuthStore, usePermissionStore } from '@hbc/auth';
import { msalConfig, LOGIN_SCOPES } from './msal-config.js';

let msalInstance: PublicClientApplication | null = null;

export function getMsalInstance(): PublicClientApplication {
  if (!msalInstance) {
    throw new Error('MSAL not initialized — call initializeMsalAuth() first');
  }
  return msalInstance;
}

function mapAccountToUser(account: AccountInfo): ICurrentUser {
  return {
    id: account.localAccountId,
    displayName: account.name ?? account.username,
    email: account.username,
    roles: [
      {
        id: 'role-default',
        name: 'User',
        permissions: ['project:read', 'document:read'],
      },
    ],
  };
}

export async function initializeMsalAuth(): Promise<void> {
  const { setUser, setLoading, setError } = useAuthStore.getState();
  setLoading(true);

  try {
    msalInstance = new PublicClientApplication(msalConfig);
    await msalInstance.initialize();

    // Handle redirect promise (back from Azure AD login page)
    const redirectResult: AuthenticationResult | null =
      await msalInstance.handleRedirectPromise();

    let account: AccountInfo | null = null;

    if (redirectResult?.account) {
      account = redirectResult.account;
      msalInstance.setActiveAccount(account);
    } else {
      account = msalInstance.getActiveAccount();
    }

    if (account) {
      // Attempt silent token to confirm session is valid
      try {
        await msalInstance.acquireTokenSilent({
          scopes: LOGIN_SCOPES,
          account,
        });
      } catch {
        // Silent token failed — session expired, will need interactive login
        account = null;
      }
    }

    if (account) {
      const user = mapAccountToUser(account);
      setUser(user);
      usePermissionStore
        .getState()
        .setPermissions(
          user.roles.flatMap((r) => r.permissions),
        );
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : 'MSAL initialization failed');
  } finally {
    setLoading(false);
  }
}
