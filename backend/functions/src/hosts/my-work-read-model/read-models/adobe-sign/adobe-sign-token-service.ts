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
import type { IAdobeSignRefreshClient } from './adobe-sign-refresh-client.js';

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
    async getAccessToken(actorKey, now) {
      const grant = await deps.grantStore.findGrant(actorKey);
      if (!grant) {
        return { status: 'authorization-required', reason: 'no-grant-found' };
      }
      if (grant.state === 'revoked') {
        return { status: 'authorization-required', reason: 'grant-revoked' };
      }
      if (grant.state === 'requires-reauth') {
        return { status: 'authorization-required', reason: 'grant-requires-reauth' };
      }
      if (grant.state === 'pending') {
        return { status: 'authorization-required', reason: 'no-grant-found' };
      }

      // grant.state === 'active'
      const cached = cache.get(actorKey);
      if (cached) {
        const remainingMs = new Date(cached.expiresAtUtc).getTime() - now.getTime();
        if (remainingMs > margin) {
          return {
            status: 'ok',
            accessToken: cached.accessToken,
            expiresAtUtc: cached.expiresAtUtc,
            apiAccessPoint: cached.apiAccessPoint,
          };
        }
        cache.delete(actorKey);
      }

      let refresh;
      try {
        refresh = await deps.refreshClient.refresh({ actorKey, grant, now });
      } catch {
        // The refresh client is contract-bound to return a normalized
        // result; treat any thrown exception as a source-unavailable
        // outcome so callers cannot leak a stack trace upstream.
        return { status: 'source-unavailable', reason: 'adobe-unreachable' };
      }

      if (refresh.status === 'invalid-grant') {
        await deps.grantStore.markReauthorizationRequired(actorKey, {
          kind: 'refresh-failed',
          observedAtUtc: now.toISOString(),
        });
        return { status: 'authorization-required', reason: 'refresh-invalid' };
      }

      if (refresh.status === 'unreachable') {
        return { status: 'source-unavailable', reason: 'adobe-unreachable' };
      }

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

      return {
        status: 'ok',
        accessToken: refresh.accessToken,
        expiresAtUtc: refresh.expiresAtUtc,
        apiAccessPoint: grant.adobeApiAccessPoint,
      };
    },
  };
}
