/**
 * Adobe Sign live OAuth code-exchange adapter — B05 remediation Prompt 03.
 *
 * Production HTTP implementation of `IAdobeSignOAuthService` against the
 * Adobe Acrobat Sign code-exchange endpoint
 * `POST {api_access_point}/oauth/v2/token`. Adobe's quickstart prose names
 * `/oauth/v2/token` even though one inline example still displays
 * `/oauth/token`; this adapter closes on `/oauth/v2/token`.
 *
 * Boundary guarantees:
 *
 *   - The `api_access_point` value supplied by Adobe's callback redirect is
 *     never trusted blindly. The adapter rejects non-HTTPS schemes and any
 *     hostname not matching the canonical commercial-Adobe-Sign suffix
 *     allow-list (`*.adobesign.com` / `*.echosign.com`). The same helper
 *     is exported so the callback layer can pre-validate
 *     `api_access_point` AND `web_access_point` before reaching this
 *     adapter.
 *   - Request bodies and Adobe response bodies are never logged. All
 *     failure outcomes use closed-enum `reason` values; `client_secret`,
 *     `code`, `access_token`, and `refresh_token` strings never appear in
 *     any thrown error or returned failure.
 *   - On a successful HTTP 200, the response is parsed defensively: every
 *     required field is type-checked; granted scopes are evaluated against
 *     the optional governed-scope allow-list and a divergence trips
 *     `'scope-mismatch'`. A malformed body never throws — it normalises to
 *     `{ status: 'unreachable', reason: 'malformed-response' }`.
 *
 * @module hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-live-oauth-service
 */

import type {
  AdobeSignEndpointSource,
  AdobeSignTokenExchangeInput,
  AdobeSignTokenExchangeResult,
  IAdobeSignOAuthService,
} from './adobe-sign-oauth-service.js';

export const ADOBE_SIGN_ACCESS_POINT_ALLOWED_SUFFIXES = [
  '.adobesign.com',
  '.echosign.com',
] as const;

export const ADOBE_SIGN_OAUTH_TOKEN_PATH = '/oauth/v2/token' as const;
export const ADOBE_SIGN_OAUTH_TOKEN_FALLBACK_API_ACCESS_POINT = 'https://api.na1.adobesign.com';

export const ADOBE_SIGN_LIVE_OAUTH_DEFAULT_TIMEOUT_MS = 10_000;

export type AdobeSignLiveFetch = typeof globalThis.fetch;

export interface AdobeSignLiveOAuthServiceDeps {
  /** Defaults to `globalThis.fetch`. */
  readonly fetch?: AdobeSignLiveFetch;
  /**
   * Optional governed-scope allow-list. When provided, any granted scope
   * outside this set produces a `'scope-mismatch'` result rather than
   * `'ok'`. When omitted, the adapter forwards Adobe's granted scopes
   * unchanged.
   */
  readonly governedScopes?: readonly string[];
  /** Defaults to `ADOBE_SIGN_LIVE_OAUTH_DEFAULT_TIMEOUT_MS`. */
  readonly timeoutMs?: number;
}

/**
 * Pure host validator. Accepts only `https:` URLs whose hostname ends in
 * one of the documented Adobe Sign suffixes. Returns `false` on any parse
 * error so callers can map that to `invalid-access-point` without a try.
 */
export function isAllowedAdobeAccessPoint(candidate: string): boolean {
  if (typeof candidate !== 'string' || candidate.length === 0) return false;
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:') return false;
  const host = url.hostname.toLowerCase();
  for (const suffix of ADOBE_SIGN_ACCESS_POINT_ALLOWED_SUFFIXES) {
    if (host === suffix.replace(/^\./, '') || host.endsWith(suffix)) return true;
  }
  return false;
}

function normalizeAllowedAccessPoint(candidate: string): string {
  const parsed = new URL(candidate);
  return parsed.origin;
}

function trimTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function parseScopes(raw: unknown): readonly string[] {
  if (typeof raw !== 'string' || raw.trim().length === 0) return [];
  return Array.from(
    new Set(
      raw
        .split(/\s+/)
        .map((s) => s.trim().toLowerCase())
        .filter((s) => s.length > 0),
    ),
  );
}

function grantedScopesAreSubset(granted: readonly string[], governed: readonly string[]): boolean {
  if (governed.length === 0) return true;
  const allow = new Set(governed.map((s) => s.toLowerCase()));
  for (const scope of granted) {
    if (!allow.has(scope.toLowerCase())) return false;
  }
  return true;
}

interface AdobeTokenSuccessBody {
  readonly access_token: string;
  readonly refresh_token: string;
  readonly expires_in: number;
  readonly scope?: string;
  readonly api_access_point?: string;
  readonly web_access_point?: string;
}

function isAdobeTokenSuccessBody(value: unknown): value is AdobeTokenSuccessBody {
  if (value === null || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.access_token === 'string' &&
    v.access_token.length > 0 &&
    typeof v.refresh_token === 'string' &&
    v.refresh_token.length > 0 &&
    isFiniteNumber(v.expires_in) &&
    (v.expires_in as number) > 0
  );
}

function readErrorCodeFromAdobeBody(body: unknown): string | undefined {
  if (body === null || typeof body !== 'object') return undefined;
  const raw = (body as Record<string, unknown>).error;
  return typeof raw === 'string' ? raw : undefined;
}

function normalizeSafeProviderErrorCode(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const normalized = raw.trim().toLowerCase();
  if (normalized.length === 0 || normalized.length > 64) return undefined;
  return /^[a-z0-9_-]+$/.test(normalized) ? normalized : undefined;
}

function buildExchangeRequestDiagnostics(
  url: string,
  endpointSource: AdobeSignEndpointSource,
  body: URLSearchParams,
) {
  const parsed = new URL(url);
  return {
    endpointHost: parsed.hostname,
    endpointPath: parsed.pathname,
    endpointSelectionMode:
      endpointSource === 'callback' ? 'callback-api-access-point' : 'partner-default-api-na1',
    bodyFieldCount: Array.from(body.keys()).length,
    hasGrantTypeField: body.has('grant_type'),
    hasCodeField: body.has('code'),
    hasClientIdField: body.has('client_id'),
    hasClientSecretField: body.has('client_secret'),
    hasRedirectUriField: body.has('redirect_uri'),
  };
}

export function createAdobeSignLiveOAuthService(
  deps: AdobeSignLiveOAuthServiceDeps = {},
): IAdobeSignOAuthService {
  const fetchImpl = deps.fetch ?? globalThis.fetch;
  const timeoutMs = deps.timeoutMs ?? ADOBE_SIGN_LIVE_OAUTH_DEFAULT_TIMEOUT_MS;
  const governedScopes = deps.governedScopes ?? [];

  return {
    async exchangeAuthorizationCode(
      input: AdobeSignTokenExchangeInput,
    ): Promise<AdobeSignTokenExchangeResult> {
      const callbackApiAccessPoint = input.apiAccessPoint?.trim();
      const callbackWebAccessPoint = input.webAccessPoint?.trim();
      const hasCallbackApiAccessPoint = Boolean(callbackApiAccessPoint);
      const hasCallbackWebAccessPoint = Boolean(callbackWebAccessPoint);
      const hasCallbackEndpoints = hasCallbackApiAccessPoint || hasCallbackWebAccessPoint;

      if (hasCallbackEndpoints) {
        if (!hasCallbackApiAccessPoint || !hasCallbackWebAccessPoint) {
          return { status: 'unreachable', reason: 'invalid-access-point' };
        }
        const callbackApi = callbackApiAccessPoint!;
        const callbackWeb = callbackWebAccessPoint!;
        if (!isAllowedAdobeAccessPoint(callbackApi)) {
          return { status: 'unreachable', reason: 'invalid-access-point' };
        }
        if (!isAllowedAdobeAccessPoint(callbackWeb)) {
          return { status: 'unreachable', reason: 'invalid-access-point' };
        }
      }

      const requestApiAccessPoint = callbackApiAccessPoint
        ? callbackApiAccessPoint
        : ADOBE_SIGN_OAUTH_TOKEN_FALLBACK_API_ACCESS_POINT;
      const endpointSource: AdobeSignEndpointSource = callbackApiAccessPoint
        ? 'callback'
        : 'configured-fallback';
      const url = `${trimTrailingSlash(requestApiAccessPoint)}${ADOBE_SIGN_OAUTH_TOKEN_PATH}`;
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: input.authorizationCode,
        client_id: input.clientId,
        client_secret: input.clientSecret,
        redirect_uri: input.redirectUri,
      });
      const exchangeRequestDiagnostics = buildExchangeRequestDiagnostics(url, endpointSource, body);

      const controller = new AbortController();
      const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);
      let response: Response;
      try {
        response = await fetchImpl(url, {
          method: 'POST',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            accept: 'application/json',
          },
          body,
          signal: controller.signal,
        });
      } catch (err: unknown) {
        const name = (err as { name?: string }).name;
        if (name === 'AbortError') {
          return { status: 'unreachable', reason: 'timeout', exchangeRequestDiagnostics };
        }
        return { status: 'unreachable', reason: 'network', exchangeRequestDiagnostics };
      } finally {
        clearTimeout(timeoutHandle);
      }

      if (response.status >= 500) {
        return { status: 'unreachable', reason: 'http-5xx', exchangeRequestDiagnostics };
      }
      if (response.status >= 400) {
        let parsed: unknown;
        try {
          parsed = await response.json();
        } catch {
          parsed = undefined;
        }
        const errorCode = readErrorCodeFromAdobeBody(parsed);
        if (errorCode === 'invalid_grant' || errorCode === 'invalid_authorization_code') {
          return { status: 'invalid-code' };
        }
        const providerErrorCode = normalizeSafeProviderErrorCode(errorCode);
        return {
          status: 'unreachable',
          reason: 'http-4xx',
          ...(providerErrorCode ? { providerErrorCode } : {}),
          exchangeRequestDiagnostics,
        };
      }

      let parsed: unknown;
      try {
        parsed = await response.json();
      } catch {
        return { status: 'unreachable', reason: 'malformed-response', exchangeRequestDiagnostics };
      }
      if (!isAdobeTokenSuccessBody(parsed)) {
        return { status: 'unreachable', reason: 'malformed-response', exchangeRequestDiagnostics };
      }

      const grantedScopes = parseScopes((parsed as AdobeTokenSuccessBody).scope);
      if (!grantedScopesAreSubset(grantedScopes, governedScopes)) {
        return { status: 'scope-mismatch', grantedScopes };
      }

      const responseApiAccessPoint = (parsed as AdobeTokenSuccessBody).api_access_point?.trim();
      const responseWebAccessPoint = (parsed as AdobeTokenSuccessBody).web_access_point?.trim();

      const resolvedApiAccessPointRaw = hasCallbackApiAccessPoint
        ? callbackApiAccessPoint
        : responseApiAccessPoint;
      const resolvedWebAccessPointRaw = hasCallbackWebAccessPoint
        ? callbackWebAccessPoint
        : responseWebAccessPoint;
      const resolvedSource: AdobeSignEndpointSource = hasCallbackApiAccessPoint
        ? 'callback'
        : 'token-response';

      if (
        !resolvedApiAccessPointRaw ||
        !resolvedWebAccessPointRaw ||
        !isAllowedAdobeAccessPoint(resolvedApiAccessPointRaw) ||
        !isAllowedAdobeAccessPoint(resolvedWebAccessPointRaw)
      ) {
        return {
          status: 'unreachable',
          reason: endpointSource === 'configured-fallback' ? 'missing-access-point' : 'invalid-access-point',
          exchangeRequestDiagnostics,
        };
      }
      const resolvedApiAccessPoint = normalizeAllowedAccessPoint(resolvedApiAccessPointRaw);
      const resolvedWebAccessPoint = normalizeAllowedAccessPoint(resolvedWebAccessPointRaw);

      return {
        status: 'ok',
        accessToken: (parsed as AdobeTokenSuccessBody).access_token,
        refreshToken: (parsed as AdobeTokenSuccessBody).refresh_token,
        grantedScopes,
        expiresInSeconds: (parsed as AdobeTokenSuccessBody).expires_in,
        resolvedApiAccessPoint,
        resolvedWebAccessPoint,
        endpointSource: resolvedSource,
      };
    },
  };
}
