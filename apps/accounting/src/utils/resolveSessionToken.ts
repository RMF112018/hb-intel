import type { useCurrentSession } from '@hbc/auth';

/**
 * P3-09: Session-based token factory for the Accounting surface.
 *
 * Creates a token factory that extracts the access token from the current
 * auth session on each call.
 *
 * **Transitional pattern (P10-03):** In SPFx production mode, the preferred
 * token acquisition path is `createSpfxApiTokenProvider()` via `mount.tsx`,
 * which acquires audience-scoped tokens through the SPFx AadTokenProvider.
 * This session-based factory remains the fallback for dev mode and for
 * page-level API client creation until the centralized backend context
 * provider (Prompt-05) replaces direct page-level client instantiation.
 *
 * @param getSession - Accessor returning the current session snapshot
 */
export function createSessionTokenFactory(
  getSession: () => ReturnType<typeof useCurrentSession>,
): () => Promise<string> {
  return async (): Promise<string> => {
    const session = getSession();
    const payload = session?.rawContext?.payload;
    if (payload && typeof payload === 'object') {
      const rawToken =
        (payload as Record<string, unknown>).accessToken ??
        (payload as Record<string, unknown>).token;
      if (typeof rawToken === 'string' && rawToken.trim().length > 0) {
        return rawToken;
      }
    }

    const ref = session?.providerIdentityRef;
    if (ref && ref.trim().length > 0) {
      return ref;
    }

    throw new Error(
      '[HB-Intel] No valid auth token available. ' +
      'The session does not contain an access token or provider identity reference.',
    );
  };
}
