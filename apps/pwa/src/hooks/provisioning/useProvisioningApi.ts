/**
 * W0-G5-T01: PWA-local provisioning API client hook.
 * Wraps createProvisioningApiClient with env base URL + auth session token.
 */
import { useMemo, useCallback } from 'react';
import { useCurrentSession } from '@hbc/auth';
import type { NormalizedAuthSession } from '@hbc/auth';
import { createProvisioningApiClient } from '@hbc/provisioning';
import type { IProvisioningApiClient } from '@hbc/provisioning';

function resolveSessionToken(session: NormalizedAuthSession | null): string {
  const payload = session?.rawContext?.payload;
  if (payload && typeof payload === 'object') {
    const rawToken =
      (payload as Record<string, unknown>).accessToken ??
      (payload as Record<string, unknown>).token;
    if (typeof rawToken === 'string' && rawToken.trim().length > 0) return rawToken;
  }
  return session?.providerIdentityRef ?? 'mock-token';
}

export function useProvisioningApi(): IProvisioningApiClient {
  const session = useCurrentSession();
  const token = useMemo(() => resolveSessionToken(session), [session]);
  const getToken = useCallback(async () => token, [token]);

  return useMemo(
    () => createProvisioningApiClient(import.meta.env.VITE_API_BASE_URL ?? '', getToken),
    [getToken],
  );
}
