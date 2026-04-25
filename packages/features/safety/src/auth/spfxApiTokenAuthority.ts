/**
 * SPFx API access-token authority for Safety frontend command gating.
 *
 * Acquires a delegated bearer token for the Safety API audience, decodes the
 * JWT payload client-side ONLY for UX gating and diagnostics (no signature
 * verification — backend remains the final authority), validates audience,
 * `access_as_user` scope presence, and `exp`, then exposes the token's
 * `roles` claim and selected diagnostics.
 *
 * This module deliberately does NOT import `@microsoft/sp-webpart-base` or
 * any SPFx framework type. It accepts a structural host shape so the package
 * remains consumable outside SPFx contexts.
 *
 * Security invariants:
 *  - The raw token string exists only as a local variable inside this
 *    function long enough to split and base64url-decode the middle segment.
 *    It is NEVER returned, NEVER stored, NEVER logged, NEVER published to
 *    proof objects, NEVER captured by callers.
 *  - The decoder does not enforce signature, `iss`, or `tid` — those are
 *    surfaced as diagnostics only. Backend validates them at the API call.
 *  - Frontend authorization is a UX hint; a stale or tampered frontend
 *    capability state cannot elevate access (backend gates every route).
 */

/**
 * Structural shape of the SPFx host's `aadTokenProviderFactory` seam. Mirrors
 * the relevant subset of `WebPartContext` without importing the SPFx package.
 */
export interface AadTokenProviderHost {
  readonly aadTokenProviderFactory: {
    getTokenProvider(): Promise<{
      getToken(audience: string): Promise<string>;
    }>;
  };
}

export type ApiTokenErrorClass =
  | 'token-provider-unavailable'
  | 'token-acquisition-failed'
  | 'token-decode-failed'
  | 'audience-mismatch'
  | 'token-expired'
  | 'scope-missing'
  | 'missing-api-audience';

export interface DecodedApiTokenClaims {
  readonly roles: readonly string[];
  readonly scp: string | null;
  readonly aud: string | null;
  readonly iss: string | null;
  readonly tid: string | null;
  readonly exp: number | null;
}

export type ApiTokenAuthority =
  | {
      readonly status: 'ok';
      readonly decoded: DecodedApiTokenClaims;
      readonly hasAccessAsUserScope: boolean;
      readonly acquiredAt: string;
    }
  | {
      readonly status: 'failed';
      readonly errorClass: ApiTokenErrorClass;
      readonly errorMessage: string;
    }
  | {
      readonly status: 'audience-mismatch';
      readonly errorClass: 'audience-mismatch';
      readonly expected: string;
      readonly actual: string | null;
      readonly decoded: DecodedApiTokenClaims;
    }
  | {
      readonly status: 'no-scope';
      readonly errorClass: 'scope-missing';
      readonly decoded: DecodedApiTokenClaims;
    }
  | {
      readonly status: 'expired';
      readonly errorClass: 'token-expired';
      readonly decoded: DecodedApiTokenClaims;
    };

const ACCESS_AS_USER_SCOPE = 'access_as_user';

/**
 * Acquire and decode the API access token for the given audience.
 *
 * @param host structural host providing `aadTokenProviderFactory`. If absent
 *             (e.g. mock/dev runs), returns `failed/'token-provider-unavailable'`.
 * @param expectedAudience the audience the caller is asking for. Empty or
 *             whitespace-only values short-circuit to
 *             `failed/'missing-api-audience'` without any provider call.
 */
export async function acquireSpfxApiTokenAuthority(
  host: AadTokenProviderHost | undefined,
  expectedAudience: string,
): Promise<ApiTokenAuthority> {
  if (typeof expectedAudience !== 'string' || expectedAudience.trim() === '') {
    return {
      status: 'failed',
      errorClass: 'missing-api-audience',
      errorMessage: 'No API audience configured for Safety capability gating.',
    };
  }
  if (!host || !host.aadTokenProviderFactory) {
    return {
      status: 'failed',
      errorClass: 'token-provider-unavailable',
      errorMessage: 'SPFx aadTokenProviderFactory is unavailable.',
    };
  }

  let provider: { getToken(audience: string): Promise<string> };
  try {
    provider = await host.aadTokenProviderFactory.getTokenProvider();
  } catch (error) {
    return {
      status: 'failed',
      errorClass: 'token-provider-unavailable',
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }
  if (!provider || typeof provider.getToken !== 'function') {
    return {
      status: 'failed',
      errorClass: 'token-provider-unavailable',
      errorMessage: 'SPFx token provider did not expose getToken().',
    };
  }

  // Local-only variable. Released after decode; never returned or persisted.
  let rawToken: string;
  try {
    rawToken = await provider.getToken(expectedAudience);
  } catch (error) {
    return {
      status: 'failed',
      errorClass: 'token-acquisition-failed',
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }
  if (typeof rawToken !== 'string' || rawToken.length === 0) {
    return {
      status: 'failed',
      errorClass: 'token-acquisition-failed',
      errorMessage: 'Token provider returned an empty token.',
    };
  }

  let decoded: DecodedApiTokenClaims;
  try {
    decoded = decodeJwtPayload(rawToken);
  } catch (error) {
    return {
      status: 'failed',
      errorClass: 'token-decode-failed',
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }
  // Discard the raw token reference as soon as decoding succeeds.
  rawToken = '';

  if (decoded.aud !== expectedAudience) {
    return {
      status: 'audience-mismatch',
      errorClass: 'audience-mismatch',
      expected: expectedAudience,
      actual: decoded.aud,
      decoded,
    };
  }

  const hasAccessAsUserScope = scopeIncludes(decoded.scp, ACCESS_AS_USER_SCOPE);
  if (!hasAccessAsUserScope) {
    return {
      status: 'no-scope',
      errorClass: 'scope-missing',
      decoded,
    };
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (typeof decoded.exp === 'number' && decoded.exp <= nowSec) {
    return {
      status: 'expired',
      errorClass: 'token-expired',
      decoded,
    };
  }

  return {
    status: 'ok',
    decoded,
    hasAccessAsUserScope: true,
    acquiredAt: new Date().toISOString(),
  };
}

function decodeJwtPayload(token: string): DecodedApiTokenClaims {
  const segments = token.split('.');
  if (segments.length !== 3) {
    throw new Error('JWT does not have three dot-separated segments.');
  }
  const payloadJson = base64UrlDecode(segments[1]);
  let payload: unknown;
  try {
    payload = JSON.parse(payloadJson);
  } catch (error) {
    throw new Error(
      `JWT payload is not valid JSON: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
  if (!payload || typeof payload !== 'object') {
    throw new Error('JWT payload is not an object.');
  }
  const obj = payload as Record<string, unknown>;
  return {
    roles: normalizeStringArray(obj.roles),
    scp: typeof obj.scp === 'string' ? obj.scp : null,
    aud: typeof obj.aud === 'string' ? obj.aud : null,
    iss: typeof obj.iss === 'string' ? obj.iss : null,
    tid: typeof obj.tid === 'string' ? obj.tid : null,
    exp: typeof obj.exp === 'number' && Number.isFinite(obj.exp) ? obj.exp : null,
  };
}

function base64UrlDecode(segment: string): string {
  if (typeof segment !== 'string' || segment.length === 0) {
    throw new Error('Empty JWT payload segment.');
  }
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + '='.repeat(padLen);
  const decoded = typeof atob === 'function'
    ? atob(padded)
    : Buffer.from(padded, 'base64').toString('binary');
  // Convert latin1 bytes back into UTF-8 (claims may include unicode display names).
  try {
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i += 1) {
      bytes[i] = decoded.charCodeAt(i) & 0xff;
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return decoded;
  }
}

function normalizeStringArray(value: unknown): readonly string[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === 'string' && v.length > 0);
  }
  if (typeof value === 'string' && value.length > 0) {
    return [value];
  }
  return [];
}

function scopeIncludes(scp: string | null, scope: string): boolean {
  if (!scp) return false;
  return scp.split(/\s+/).some((s) => s === scope);
}
