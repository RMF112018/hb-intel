/**
 * Adobe Sign access-token service — B05 Prompt 04.
 *
 * Composes the grant store + refresh client into a per-actor access-token
 * provider. This is the seam future live action-queue reads call into
 * when they need a usable Adobe access token.
 *
 * Algorithm (deterministic; clock + cache injected):
 *   1. Look up the grant via the store.
 *      - missing → `authorization-required` (`no-grant-found`)
 *      - `revoked` / `requires-reauth` / `pending` → `authorization-required`
 *   2. Check the in-process access-token cache.
 *      - cached + safe remaining margin → `ok` immediately
 *   3. Otherwise refresh via the refresh client.
 *      - `invalid-grant` → transition grant to `requires-reauth` and
 *        return `authorization-required` (`refresh-invalid`)
 *      - `unreachable` → return `source-unavailable` (`adobe-unreachable`)
 *        WITHOUT mutating grant state
 *      - `ok` → persist updated lifecycle metadata (rotated encrypted
 *        ref, lastRefreshedAtUtc, current scopes, state='active'), cache,
 *        return `ok`
 *
 * Failure results never carry token strings, raw vendor bodies, or
 * encrypted-refresh ciphertext. Public callers see only closed-enum
 * `status` + `reason` fields plus the safe `apiAccessPoint` URL.
 *
 * @module hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-token-service
 */

import type { AdobeSignActorKey } from './adobe-sign-actor-normalizer.js';
import type { IAdobeSignGrantStore } from './adobe-sign-grant-store.js';
import type { AdobeSignRefreshResult, IAdobeSignRefreshClient } from './adobe-sign-refresh-client.js';
import type { AdobeSignRuntimeDiagnosticReporter } from './adobe-sign-runtime-diagnostics.js';

/**
 * Margin before an access token is considered too close to expiry for the
 * caller to use safely. Default 60 s so handlers do not race a refresh.
 */
export const ADOBE_SIGN_ACCESS_TOKEN_REFRESH_MARGIN_MS = 60 * 1000;

export interface AdobeSignAccessTokenAcquireOk {
  readonly status: 'ok';
  readonly accessToken: string;
  readonly expiresAtUtc: string;
  readonly apiAccessPoint: string;
}

export type AdobeSignAccessTokenAuthorizationRequiredReason =
  | 'no-grant-found'
  | 'grant-revoked'
  | 'grant-requires-reauth'
  | 'refresh-invalid';

export type AdobeSignAccessTokenSourceUnavailableReason =
  | 'adobe-unreachable'
  | 'token-store-unavailable';

export type AdobeSignAccessTokenAcquireResult =
  | AdobeSignAccessTokenAcquireOk
  | {
      readonly status: 'authorization-required';
      readonly reason: AdobeSignAccessTokenAuthorizationRequiredReason;
    }
  | {
      readonly status: 'source-unavailable';
      readonly reason: AdobeSignAccessTokenSourceUnavailableReason;
    };

export interface IAdobeSignTokenService {
  getAccessToken(
    actorKey: AdobeSignActorKey,
    now: Date,
    diagnostics?: AdobeSignRuntimeDiagnosticReporter,
  ): Promise<AdobeSignAccessTokenAcquireResult>;
}

interface CachedToken {
  readonly accessToken: string;
  readonly expiresAtUtc: string;
  readonly apiAccessPoint: string;
}

export interface AdobeSignTokenServiceDeps {
  readonly grantStore: IAdobeSignGrantStore;
  readonly refreshClient: IAdobeSignRefreshClient;
  /** Optional override of the refresh-margin used to decide cache freshness. */
  readonly refreshMarginMs?: number;
}

/**
 * Public diagnostic shape returned through telemetry-safe surfaces.
 * Excludes any token / ciphertext / refresh-token field by construction.
 */
export interface AdobeSignTokenServicePublicDiagnostic {
  readonly status: AdobeSignAccessTokenAcquireResult['status'];
  readonly reason?: string;
}

/**
 * Reduce an acquire result to a public diagnostic that is safe to log /
 * include in error envelopes. Strips `accessToken`, `expiresAtUtc`, and
 * `apiAccessPoint` from the success branch — none of those belong in a
 * telemetry-or-error context.
 */
export function toAdobeSignTokenPublicDiagnostic(
  result: AdobeSignAccessTokenAcquireResult,
): AdobeSignTokenServicePublicDiagnostic {
  if (result.status === 'ok') return { status: 'ok' };
  return { status: result.status, reason: result.reason };
}

export function createAdobeSignTokenService(
  deps: AdobeSignTokenServiceDeps,
): IAdobeSignTokenService {
  const margin = deps.refreshMarginMs ?? ADOBE_SIGN_ACCESS_TOKEN_REFRESH_MARGIN_MS;
  const cache = new Map<AdobeSignActorKey, CachedToken>();

  return {
    async getAccessToken(actorKey, now, diagnostics) {
      const tokenStart = Date.now();
      let refreshStart = 0;
      const trackTokenResult = (
        result: AdobeSignAccessTokenAcquireResult,
        durationMs: number = Date.now() - tokenStart,
      ) => {
        diagnostics?.trackAdobeSignRuntimeEvent('adobeSign.read.tokenAcquisition.result', {
          status: result.status === 'ok' ? 'ok' : result.status,
          reason: result.status === 'ok' ? undefined : result.reason,
          durationMs,
        });
      };
      const trackRefreshResult = (
        refresh:
          | { readonly status: 'ok' }
          | { readonly status: 'invalid-grant' }
          | Extract<AdobeSignRefreshResult, { readonly status: 'unreachable' }>,
        durationMs: number = Date.now() - refreshStart,
      ) => {
        diagnostics?.trackAdobeSignRuntimeEvent('adobeSign.read.refresh.result', {
          status: refresh.status,
          durationMs,
          ...(refresh.status === 'unreachable' ? { reason: refresh.reason } : {}),
          ...(refresh.status === 'unreachable' && refresh.providerErrorCode
            ? { providerErrorCode: refresh.providerErrorCode }
            : {}),
          ...(refresh.status === 'unreachable' && refresh.refreshRequestDiagnostics
            ? {
                refreshEndpointHost: refresh.refreshRequestDiagnostics.endpointHost,
                refreshEndpointPath: refresh.refreshRequestDiagnostics.endpointPath,
                refreshEndpointSelectionMode:
                  refresh.refreshRequestDiagnostics.endpointSelectionMode,
                refreshBodyFieldCount: refresh.refreshRequestDiagnostics.bodyFieldCount,
                refreshHasGrantTypeField: refresh.refreshRequestDiagnostics.hasGrantTypeField,
                refreshHasRefreshTokenField:
                  refresh.refreshRequestDiagnostics.hasRefreshTokenField,
                refreshHasClientIdField: refresh.refreshRequestDiagnostics.hasClientIdField,
                refreshHasClientSecretField:
                  refresh.refreshRequestDiagnostics.hasClientSecretField,
              }
            : {}),
          ...(refresh.status === 'unreachable' && refresh.malformedResponseDiagnostics
            ? {
                refreshMalformedHasAccessToken:
                  refresh.malformedResponseDiagnostics.hasAccessToken,
                refreshMalformedHasRefreshToken:
                  refresh.malformedResponseDiagnostics.hasRefreshToken,
                refreshMalformedHasExpiresIn:
                  refresh.malformedResponseDiagnostics.hasExpiresIn,
              }
            : {}),
        });
      };

      const grant = await deps.grantStore.findGrant(actorKey);
      if (!grant) {
        const result = { status: 'authorization-required', reason: 'no-grant-found' } as const;
        trackTokenResult(result);
        return result;
      }
      if (grant.state === 'revoked') {
        const result = { status: 'authorization-required', reason: 'grant-revoked' } as const;
        trackTokenResult(result);
        return result;
      }
      if (grant.state === 'requires-reauth') {
        const result = {
          status: 'authorization-required',
          reason: 'grant-requires-reauth',
        } as const;
        trackTokenResult(result);
        return result;
      }
      if (grant.state === 'pending') {
        const result = { status: 'authorization-required', reason: 'no-grant-found' } as const;
        trackTokenResult(result);
        return result;
      }

      // grant.state === 'active'
      const cached = cache.get(actorKey);
      if (cached) {
        const remainingMs = new Date(cached.expiresAtUtc).getTime() - now.getTime();
        if (remainingMs > margin) {
          const result = {
            status: 'ok',
            accessToken: cached.accessToken,
            expiresAtUtc: cached.expiresAtUtc,
            apiAccessPoint: cached.apiAccessPoint,
          } as const;
          trackTokenResult(result);
          return result;
        }
        cache.delete(actorKey);
      }

      let refresh;
      refreshStart = Date.now();
      try {
        refresh = await deps.refreshClient.refresh({ actorKey, grant, now });
      } catch {
        // The refresh client is contract-bound to return a normalized
        // result; treat any thrown exception as a source-unavailable
        // outcome so callers cannot leak a stack trace upstream.
        trackRefreshResult({ status: 'unreachable', reason: 'network' });
        const result = { status: 'source-unavailable', reason: 'adobe-unreachable' } as const;
        trackTokenResult(result);
        return result;
      }

      if (refresh.status === 'invalid-grant') {
        trackRefreshResult({ status: 'invalid-grant' });
        await deps.grantStore.markReauthorizationRequired(actorKey, {
          kind: 'refresh-failed',
          observedAtUtc: now.toISOString(),
        });
        const result = { status: 'authorization-required', reason: 'refresh-invalid' } as const;
        trackTokenResult(result);
        return result;
      }

      if (refresh.status === 'unreachable') {
        trackRefreshResult(refresh);
        const result = { status: 'source-unavailable', reason: 'adobe-unreachable' } as const;
        trackTokenResult(result);
        return result;
      }

      trackRefreshResult({ status: 'ok' });

      // refresh.status === 'ok'
      await deps.grantStore.upsertGrant({
        ...grant,
        state: 'active',
        lastRefreshedAtUtc: now.toISOString(),
        encryptedRefreshTokenRef: refresh.updatedEncryptedRefreshTokenRef,
        grantedScopes: refresh.grantedScopes,
        expiresAtUtc: refresh.expiresAtUtc,
      });

      cache.set(actorKey, {
        accessToken: refresh.accessToken,
        expiresAtUtc: refresh.expiresAtUtc,
        apiAccessPoint: grant.adobeApiAccessPoint,
      });

      const result = {
        status: 'ok',
        accessToken: refresh.accessToken,
        expiresAtUtc: refresh.expiresAtUtc,
        apiAccessPoint: grant.adobeApiAccessPoint,
      } as const;
      trackTokenResult(result);
      return result;
    },
  };
}
