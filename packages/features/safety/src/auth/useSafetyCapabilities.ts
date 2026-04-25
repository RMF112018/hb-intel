import { useMemo } from 'react';
import { useCurrentSession } from '@hbc/auth';
import {
  resolveSafetyCapabilities,
  type SafetyCapabilities,
} from './safetyCapabilities.js';
import { useSafetyCapabilityContext } from './SafetyCapabilityProvider.js';

/**
 * Resolve the Safety capability state.
 *
 * In hosted SPFx, a `<SafetyCapabilityProvider>` is in the React tree and
 * resolves capabilities authoritatively from the API access token's `roles`
 * claim. When the provider is present, this hook reads from its context and
 * NEVER falls back to `session.resolvedRoles` — pending stays pending,
 * token-unavailable stays token-unavailable.
 *
 * In mock-mode unit tests, Storybook, and other non-SPFx surfaces, no
 * provider is in tree; this hook then falls back to the existing
 * `session.resolvedRoles` path so persona-based test fixtures continue to
 * work.
 */
export function useSafetyCapabilities(): SafetyCapabilities {
  const provider = useSafetyCapabilityContext();
  const session = useCurrentSession();
  const sessionRoles = session?.resolvedRoles;

  return useMemo<SafetyCapabilities>(() => {
    if (provider) {
      return provider.capabilities;
    }
    return resolveSafetyCapabilities(sessionRoles);
  }, [provider, sessionRoles]);
}
