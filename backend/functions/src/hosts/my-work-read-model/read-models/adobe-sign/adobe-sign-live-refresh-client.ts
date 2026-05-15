/**
 * Adobe Sign live refresh-token HTTP adapter — B05 remediation Prompt 04.
 *
 * Production implementation of `IAdobeSignRefreshClient` against the
 * Adobe Acrobat Sign refresh endpoint
 * `POST {api_access_point}/oauth/v2/refresh`. Closes the contract
 * already declared in `adobe-sign-refresh-client.ts` so
 * `createAdobeSignTokenService` can mint fresh access tokens from
 * stored encrypted refresh-token material end-to-end.
 *
 * Boundary guarantees:
 *
 *   - Refresh-token plaintext exists only inside this module's
 *     `refresh()` call. It is decrypted from the Prompt-02 cipher
 *     envelope, used once to build the form-urlencoded body, and the
 *     fresh plaintext returned by Adobe is immediately re-encrypted
 *     before crossing the persistence boundary again. No plaintext
 *     value ever appears in thrown errors, returned failure outcomes,
 *     or telemetry payloads.
 *   - `client_id` and `client_secret` are bound at composition time
 *     via `deps`; they are never read from a per-call parameter or
 *     env lookup inside `refresh()`.
 *   - `grant.adobeApiAccessPoint` is validated against the canonical
 *     Adobe-Sign suffix allow-list (`isAllowedAdobeAccessPoint`)
 *     before any network call so a forged grant cannot redirect the
 *     refresh round trip.
 *   - Every failure path maps to the closed
 *     `AdobeSignRefreshResult` discriminated union — `'invalid-grant'`
 *     forces user reauth via the token service's
 *     `markReauthorizationRequired` path; `'unreachable'` with a
 *     closed-enum `reason` preserves the grant state.
 *
 * @module hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-live-refresh-client
 */

import {
  ADOBE_SIGN_LIVE_OAUTH_DEFAULT_TIMEOUT_MS,
  isAllowedAdobeAccessPoint,
} from './adobe-sign-live-oauth-service.js';
import type {
  AdobeSignRefreshInput,
  AdobeSignRefreshResult,
  IAdobeSignRefreshClient,
} from './adobe-sign-refresh-client.js';
import type { AdobeSignRefreshTokenCipher } from './adobe-sign-refresh-token-crypto.js';
import type { IAdobeSignRefreshTokenStore } from './adobe-sign-refresh-token-store.js';

export const ADOBE_SIGN_OAUTH_REFRESH_PATH = '/oauth/v2/refresh' as const;

export type AdobeSignLiveFetch = typeof globalThis.fetch;

export interface AdobeSignLiveRefreshClientDeps {
  readonly clientId: string;
  readonly clientSecret: string;
  readonly refreshTokenStore: IAdobeSignRefreshTokenStore;
  readonly cipher: AdobeSignRefreshTokenCipher;
  /** Defaults to `globalThis.fetch`. */
  readonly fetch?: AdobeSignLiveFetch;
  /** Defaults to `ADOBE_SIGN_LIVE_OAUTH_DEFAULT_TIMEOUT_MS`. */
  readonly timeoutMs?: number;
}

interface AdobeRefreshSuccessBody {
  readonly access_token: string;
  readonly refresh_token: string;
  readonly expires_in: number;
  readonly scope?: string;
}

function trimTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isAdobeRefreshSuccessBody(value: unknown): value is AdobeRefreshSuccessBody {
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

function buildRefreshRequestDiagnostics(url: string, body: URLSearchParams) {
  const parsed = new URL(url);
  return {
    endpointHost: parsed.hostname,
    endpointPath: parsed.pathname,
    endpointSelectionMode: 'grant-api-access-point',
    bodyFieldCount: Array.from(body.keys()).length,
    hasGrantTypeField: body.has('grant_type'),
    hasRefreshTokenField: body.has('refresh_token'),
    hasClientIdField: body.has('client_id'),
    hasClientSecretField: body.has('client_secret'),
  };
}

export function createAdobeSignLiveRefreshClient(
  deps: AdobeSignLiveRefreshClientDeps,
): IAdobeSignRefreshClient {
  const fetchImpl = deps.fetch ?? globalThis.fetch;
  const timeoutMs = deps.timeoutMs ?? ADOBE_SIGN_LIVE_OAUTH_DEFAULT_TIMEOUT_MS;

  return {
    async refresh(input: AdobeSignRefreshInput): Promise<AdobeSignRefreshResult> {
      const apiAccessPoint = input.grant.adobeApiAccessPoint;
      if (!isAllowedAdobeAccessPoint(apiAccessPoint)) {
        return { status: 'unreachable', reason: 'invalid-access-point' };
      }

      // ---------------------------------------------------------------
      // 1. Read encrypted refresh-token material from the durable store.
      // ---------------------------------------------------------------
      let envelope;
      try {
        envelope = await deps.refreshTokenStore.getCiphertext(input.grant.encryptedRefreshTokenRef);
      } catch {
        return { status: 'unreachable', reason: 'store-unavailable' };
      }
      if (envelope === undefined) {
        // Missing ciphertext is a store anomaly — never force reauth solely
        // because the row vanished. The next attempt may succeed once the
        // store recovers; the caller's outer logic decides whether to
        // escalate.
        return { status: 'unreachable', reason: 'store-unavailable' };
      }

      // ---------------------------------------------------------------
      // 2. Decrypt the refresh-token plaintext (narrow scope).
      // ---------------------------------------------------------------
      let plaintext: string;
      try {
        plaintext = deps.cipher.decrypt(envelope);
      } catch {
        // The stored material can no longer be decrypted (tamper / cipher
        // key rotation / version mismatch). Treat as invalid grant so the
        // user reauths and a fresh ciphertext is persisted.
        return { status: 'invalid-grant' };
      }

      // ---------------------------------------------------------------
      // 3. Build and dispatch the refresh request.
      // ---------------------------------------------------------------
      const url = `${trimTrailingSlash(apiAccessPoint)}${ADOBE_SIGN_OAUTH_REFRESH_PATH}`;
      const body = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: plaintext,
        client_id: deps.clientId,
        client_secret: deps.clientSecret,
      });
      const refreshRequestDiagnostics = buildRefreshRequestDiagnostics(url, body);

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
          return { status: 'unreachable', reason: 'timeout', refreshRequestDiagnostics };
        }
        return { status: 'unreachable', reason: 'network', refreshRequestDiagnostics };
      } finally {
        clearTimeout(timeoutHandle);
      }

      // ---------------------------------------------------------------
      // 4. Response mapping.
      // ---------------------------------------------------------------
      if (response.status >= 500) {
        return { status: 'unreachable', reason: 'http-5xx', refreshRequestDiagnostics };
      }
      if (response.status >= 400) {
        let parsed: unknown;
        try {
          parsed = await response.json();
        } catch {
          parsed = undefined;
        }
        const errorCode = readErrorCodeFromAdobeBody(parsed);
        if (errorCode === 'invalid_grant' || errorCode === 'invalid_token') {
          return { status: 'invalid-grant' };
        }
        const providerErrorCode = normalizeSafeProviderErrorCode(errorCode);
        return {
          status: 'unreachable',
          reason: 'http-4xx',
          ...(providerErrorCode ? { providerErrorCode } : {}),
          refreshRequestDiagnostics,
        };
      }

      let parsed: unknown;
      try {
        parsed = await response.json();
      } catch {
        return { status: 'unreachable', reason: 'malformed-response', refreshRequestDiagnostics };
      }
      if (!isAdobeRefreshSuccessBody(parsed)) {
        return { status: 'unreachable', reason: 'malformed-response', refreshRequestDiagnostics };
      }

      const successBody = parsed;
      const newRefreshToken = successBody.refresh_token;

      // ---------------------------------------------------------------
      // 5. Re-encrypt and persist the (possibly rotated) refresh token.
      //    The random IV per encrypt guarantees fresh ciphertext even when
      //    Adobe did not rotate the plaintext value.
      // ---------------------------------------------------------------
      const newEnvelope = deps.cipher.encrypt(newRefreshToken);
      let updatedEncryptedRefreshTokenRef;
      try {
        updatedEncryptedRefreshTokenRef = await deps.refreshTokenStore.putCiphertext(
          input.actorKey,
          newEnvelope,
          input.now,
        );
      } catch {
        return { status: 'unreachable', reason: 'store-unavailable' };
      }

      const expiresAtUtc = new Date(
        input.now.getTime() + successBody.expires_in * 1000,
      ).toISOString();

      return {
        status: 'ok',
        accessToken: successBody.access_token,
        expiresAtUtc,
        updatedEncryptedRefreshTokenRef,
        grantedScopes: parseScopes(successBody.scope),
      };
    },
  };
}
