import type { useCurrentSession } from '@hbc/auth';

/**
 * W0-G4-T03: Extracts a Bearer token from the current auth session.
 * Falls back to providerIdentityRef or a mock token for dev-harness use.
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
