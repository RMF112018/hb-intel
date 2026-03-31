import type { useCurrentSession } from '@hbc/auth';

/**
 * P3-02: Token factory types for the Project Setup API client.
 *
 * Production mode requires a token provider that acquires fresh,
 * API-audience-scoped tokens on each call. The SPFx path uses
 * `createSpfxApiTokenProvider`; the PWA/MSAL path extracts from session.
 */

/**
 * Creates a token factory backed by an SPFx API token provider.
 * Each call acquires a fresh token scoped to the configured API audience.
 * This is the preferred production path for SPFx-hosted deployments.
 *
 * @param spfxTokenProvider - Provider created via `createSpfxApiTokenProvider()`
 */
export function createSpfxTokenFactory(
  spfxTokenProvider: () => Promise<string>,
): () => Promise<string> {
  return spfxTokenProvider;
}

/**
 * Creates a token factory that extracts the access token from the current
 * auth session on each call. Used in PWA/MSAL mode where the session store
 * is the token source.
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
      'The session does not contain an access token or provider identity reference. ' +
      'This indicates a session bootstrap problem or an expired/missing auth context.',
    );
  };
}

/**
 * Creates a dev-only token factory that returns a static placeholder.
 * Only for use in ui-review or dev mode — never in production.
 */
export function createDevTokenFactory(): () => Promise<string> {
  return async (): Promise<string> => 'dev-placeholder-token';
}

/**
 * @deprecated P3-07: Use `createSpfxTokenFactory`, `createSessionTokenFactory`,
 * or `createDevTokenFactory` instead. This function captures the token once at
 * call time and never refreshes it — unsafe for production use.
 *
 * Still consumed by:
 * - `apps/accounting/src/pages/ProjectReviewQueuePage.tsx` (PWA surface)
 * - `apps/admin/src/pages/ProvisioningOversightPage.tsx` (PWA surface)
 *
 * These are non-SPFx PWA surfaces outside the Project Setup domain boundary.
 * Migrating them to factory-based token providers is a cross-surface auth
 * convergence task, not a Project Setup Phase 3 deliverable.
 */
export function resolveSessionToken(session: ReturnType<typeof useCurrentSession>): string {
  const payload = session?.rawContext?.payload;
  if (payload && typeof payload === 'object') {
    const rawToken =
      (payload as Record<string, unknown>).accessToken ??
      (payload as Record<string, unknown>).token;
    if (typeof rawToken === 'string' && rawToken.trim().length > 0) return rawToken;
  }
  return session?.providerIdentityRef ?? 'mock-token';
}
