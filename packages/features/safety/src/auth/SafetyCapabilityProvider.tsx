/**
 * Safety-local React provider for token-authoritative capability gating.
 *
 * Acquires the API access token for the configured Safety audience via the
 * SPFx token-provider seam, decodes its `roles` claim client-side ONLY for
 * UX gating, validates audience/scope/expiry, and exposes the resulting
 * capability state via a React context consumed by `useSafetyCapabilities`.
 *
 * No `@microsoft/sp-webpart-base` import — the provider accepts a structural
 * `AadTokenProviderHost` so this package remains usable outside SPFx.
 *
 * Backend remains the final authority. The provider's state is a UX hint
 * only; tampered or stale frontend state cannot elevate access.
 */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  acquireSpfxApiTokenAuthority,
  type AadTokenProviderHost,
  type ApiTokenAuthority,
} from './spfxApiTokenAuthority.js';
import {
  PENDING_SAFETY_CAPABILITIES,
  SCOPE_MISSING_SAFETY_CAPABILITIES,
  TOKEN_UNAVAILABLE_SAFETY_CAPABILITIES,
  UNAUTHORIZED_SAFETY_CAPABILITIES,
  safetyCapabilitiesFromTokenRoles,
  type SafetyCapabilities,
} from './safetyCapabilities.js';
import {
  publishSafetyCapabilityProof,
  type SafetyCapabilityProof,
} from './safetyCapabilityProof.js';

interface SafetyCapabilityContextValue {
  readonly hasProvider: true;
  readonly capabilities: SafetyCapabilities;
  readonly resolvedRoles: readonly string[];
  readonly authority: ApiTokenAuthority | { readonly status: 'pending' };
}

const SafetyCapabilityContext = createContext<SafetyCapabilityContextValue | null>(null);

export interface SafetyCapabilityProviderProps {
  /**
   * SPFx token-provider host. Pass the SPFx context (which structurally
   * matches `AadTokenProviderHost`). Omit in mock/test/dev surfaces — the
   * provider then exposes a "no host" sentinel and `useSafetyCapabilities`
   * falls back to the session-roles path.
   */
  readonly host?: AadTokenProviderHost;
  /**
   * Audience to acquire the token for (e.g. `api://08c399eb-...`).
   * Empty/whitespace short-circuits to a `missing-api-audience` failure
   * without invoking the token provider.
   */
  readonly apiAudience: string;
  /**
   * Optional SharePoint-derived permission keys (diagnostic-only). Kept out
   * of capability decisions; surfaced in the proof object for triage.
   */
  readonly permissionKeys?: readonly string[];
  readonly children: ReactNode;
}

export function SafetyCapabilityProvider({
  host,
  apiAudience,
  permissionKeys,
  children,
}: SafetyCapabilityProviderProps): JSX.Element {
  const [authority, setAuthority] = useState<ApiTokenAuthority | { status: 'pending' }>(
    () => ({ status: 'pending' }),
  );

  // Guard against state updates after unmount or a re-acquisition supersedes
  // an earlier in-flight call (audience changed mid-flight, etc.).
  useEffect(() => {
    if (!host) {
      // Without a host we are not in a hosted SPFx surface — surface a
      // distinct token-unavailable state. Tests / mock surfaces typically
      // render the provider without a host, in which case
      // useSafetyCapabilities falls through to the session-roles fallback;
      // see the `hasProvider` flag in the context value.
      const failure: ApiTokenAuthority = {
        status: 'failed',
        errorClass: 'token-provider-unavailable',
        errorMessage: 'No SPFx aadTokenProviderFactory host provided.',
      };
      setAuthority(failure);
      return;
    }

    let cancelled = false;
    setAuthority({ status: 'pending' });
    void acquireSpfxApiTokenAuthority(host, apiAudience).then((result) => {
      if (cancelled) return;
      setAuthority(result);
    });
    return () => {
      cancelled = true;
    };
  }, [host, apiAudience]);

  const capabilities = useMemo<SafetyCapabilities>(() => {
    if (!authority || authority.status === 'pending') {
      return PENDING_SAFETY_CAPABILITIES;
    }
    switch (authority.status) {
      case 'failed':
      case 'audience-mismatch':
      case 'expired':
        return TOKEN_UNAVAILABLE_SAFETY_CAPABILITIES;
      case 'no-scope':
        return SCOPE_MISSING_SAFETY_CAPABILITIES;
      case 'ok': {
        const result = safetyCapabilitiesFromTokenRoles(authority.decoded.roles);
        return result.state === 'unauthorized' ? UNAUTHORIZED_SAFETY_CAPABILITIES : result;
      }
      default: {
        // Exhaustiveness fallback — should be unreachable.
        const _exhaustive: never = authority;
        void _exhaustive;
        return UNAUTHORIZED_SAFETY_CAPABILITIES;
      }
    }
  }, [authority]);

  const resolvedRoles = useMemo<readonly string[]>(() => {
    if (authority && authority.status === 'ok') {
      return [...authority.decoded.roles];
    }
    return [];
  }, [authority]);

  const proofRef = useRef<SafetyCapabilityProof | null>(null);
  useEffect(() => {
    proofRef.current = publishSafetyCapabilityProof({
      authority,
      capabilities,
      resolvedRoles,
      permissionKeys: permissionKeys ?? [],
      hasProvider: !!host,
    });
  }, [authority, capabilities, resolvedRoles, permissionKeys, host]);

  const value = useMemo<SafetyCapabilityContextValue>(
    () => ({
      hasProvider: true,
      capabilities,
      resolvedRoles,
      authority,
    }),
    [capabilities, resolvedRoles, authority],
  );

  return (
    <SafetyCapabilityContext.Provider value={value}>
      {children}
    </SafetyCapabilityContext.Provider>
  );
}

/**
 * Internal hook used by `useSafetyCapabilities` to read the provider's
 * resolved capabilities. Returns `null` when no provider is in the tree
 * (mock-mode unit tests / Storybook); the consumer hook then falls back to
 * the session-roles path.
 */
export function useSafetyCapabilityContext(): SafetyCapabilityContextValue | null {
  return useContext(SafetyCapabilityContext);
}
