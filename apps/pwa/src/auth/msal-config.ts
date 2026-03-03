/**
 * MSAL configuration — Blueprint §2b.
 * Reads VITE_MSAL_* env vars at build time.
 * In development mode these are unused (mock auth).
 */
import type { Configuration } from '@azure/msal-browser';

export const LOGIN_SCOPES = (
  import.meta.env.VITE_MSAL_SCOPES || 'User.Read'
).split(',');

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_MSAL_CLIENT_ID || '',
    authority:
      import.meta.env.VITE_MSAL_AUTHORITY ||
      'https://login.microsoftonline.com/common',
    redirectUri:
      import.meta.env.VITE_MSAL_REDIRECT_URI || window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};
