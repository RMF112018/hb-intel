/**
 * W0-G5-T04: Resolves a bearer token from the normalized auth session.
 * Mirrors the proven pattern from apps/estimating/src/utils/resolveSessionToken.ts.
 * Used by both the operation executor (outside React) and page components.
 */
import type { NormalizedAuthSession } from '@hbc/auth';

export function resolveSessionToken(session: NormalizedAuthSession | null): string {
  const payload = session?.rawContext?.payload;
  if (payload && typeof payload === 'object') {
    const rawToken =
      (payload as Record<string, unknown>).accessToken ??
      (payload as Record<string, unknown>).token;
    if (typeof rawToken === 'string' && rawToken.trim().length > 0) return rawToken;
  }
  return session?.providerIdentityRef ?? 'mock-token';
}
