/**
 * MSAL configuration — Blueprint §2b.
 * Reads VITE_MSAL_* env vars at build time.
 * In development mode these are unused (mock auth).
 */
import type { Configuration } from '@azure/msal-browser';
import { validateMsalConfig, type IMsalConfig } from '@hbc/auth';

const DEFAULT_AUTHORITY = 'https://login.microsoftonline.com/common';
const DEFAULT_SCOPE = 'User.Read';

function normalizeEnvValue(value: string | undefined): string {
  return (value ?? '').trim();
}

export const LOGIN_SCOPES = (normalizeEnvValue(import.meta.env.VITE_MSAL_SCOPES) || DEFAULT_SCOPE)
  .split(',')
  .map((scope) => scope.trim())
  .filter((scope) => scope.length > 0);

/**
 * Resolve and validate MSAL runtime configuration before provider bootstrap.
 *
 * Traceability:
 * - Phase 5.2/Option C keeps auth-provider specifics at explicit adapter seams.
 * - Phase 5 remediation: prevent AADSTS900144 by rejecting empty `clientId`
 *   before creating `PublicClientApplication`.
 */
export function getValidatedMsalRuntimeConfig(): IMsalConfig {
  const runtimeConfig: IMsalConfig = {
    clientId: normalizeEnvValue(import.meta.env.VITE_MSAL_CLIENT_ID),
    authority: normalizeEnvValue(import.meta.env.VITE_MSAL_AUTHORITY) || DEFAULT_AUTHORITY,
    redirectUri: normalizeEnvValue(import.meta.env.VITE_MSAL_REDIRECT_URI) || window.location.origin,
    scopes: LOGIN_SCOPES,
  };

  validateMsalConfig(runtimeConfig);
  return runtimeConfig;
}

export function toMsalBrowserConfig(config: IMsalConfig): Configuration {
  return {
    auth: {
      clientId: config.clientId,
      authority: config.authority,
      redirectUri: config.redirectUri,
      postLogoutRedirectUri: window.location.origin,
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: false,
    },
  };
}
