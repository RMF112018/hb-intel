/**
 * Adobe Sign actor normalizer — B05 Prompt 02 Lane A.
 *
 * Pure adapter from validated Entra ID claims to a stable My Work actor
 * representation usable as the grant/principal lookup key. The trusted
 * tenant ID is taken from backend identity config (env-resolved by
 * `validateToken`); the actor object ID is the JWT `oid` claim.
 *
 * Binding decisions enforced here:
 *   - Lookup key = trusted `tenantId` + `claims.oid` (NEVER UPN / email).
 *   - App-only HB identities (`idtyp === 'app'` or missing `upn`) are
 *     classified as `app-only` and may not retrieve a personal Adobe queue.
 *   - Missing `oid` is `missing-oid`.
 *   - UPN / displayName are retained for display + diagnostics only.
 *
 * This module is **contract / pure** — no I/O, no env reads, no logging,
 * no secret handling. The caller (resolver) injects the trusted tenant
 * ID so this module remains test-deterministic.
 *
 * @module hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-actor-normalizer
 */

import type { IValidatedClaims } from '../../../../middleware/validateToken.js';

/** Stable, opaque lookup key shape: `${tenantId}::${oid}`, lowercase trimmed. */
export type AdobeSignActorKey = string & { readonly __brand: 'AdobeSignActorKey' };

export interface AdobeSignDelegatedActor {
  /** Trusted Entra tenant ID (from server-side identity config, not claims). */
  readonly tenantId: string;
  /** Entra ID object ID — primary lookup key partition. */
  readonly oid: string;
  /** Stable grant/principal lookup key. NEVER UPN-derived. */
  readonly actorKey: AdobeSignActorKey;
  /** Display only — not load-bearing for lookup or authorization. */
  readonly displayName?: string;
  /** Diagnostic only — not load-bearing for lookup or authorization. */
  readonly upn?: string;
}

export type AdobeSignActorRejectionReason = 'app-only' | 'missing-oid' | 'missing-tenant';

export type AdobeSignActorNormalizationResult =
  | { readonly ok: true; readonly actor: AdobeSignDelegatedActor }
  | { readonly ok: false; readonly reason: AdobeSignActorRejectionReason };

export interface AdobeSignActorNormalizerInput {
  /** Trusted tenant ID resolved server-side (e.g. AZURE_TENANT_ID). */
  readonly tenantId: string | undefined;
  readonly claims: IValidatedClaims;
}

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const buildActorKey = (tenantId: string, oid: string): AdobeSignActorKey =>
  `${tenantId.trim().toLowerCase()}::${oid.trim().toLowerCase()}` as AdobeSignActorKey;

/**
 * Normalize validated claims into an Adobe Sign actor.
 *
 * Returns a discriminated result. The caller maps `ok: false` reasons to
 * the appropriate `MyWorkReadModelSourceStatus` (typically
 * `principal-unresolved` for `missing-oid` / `missing-tenant`, and
 * `principal-unresolved` for `app-only` since app-only identities cannot
 * stand in for a personal Adobe queue principal — there is no shared
 * Adobe principal fallback).
 */
export function normalizeAdobeSignActor(
  input: AdobeSignActorNormalizerInput,
): AdobeSignActorNormalizationResult {
  const { tenantId, claims } = input;

  if (!isNonEmptyString(tenantId)) {
    return { ok: false, reason: 'missing-tenant' };
  }

  // App-only detection: explicit `idtyp === 'app'`, or no upn at all.
  // This matches the validateToken classification but is enforced
  // independently here so the contract does not silently drift.
  const isAppOnly = claims.idtyp === 'app' || !isNonEmptyString(claims.upn);

  if (isAppOnly) {
    return { ok: false, reason: 'app-only' };
  }

  if (!isNonEmptyString(claims.oid)) {
    return { ok: false, reason: 'missing-oid' };
  }

  return {
    ok: true,
    actor: {
      tenantId,
      oid: claims.oid,
      actorKey: buildActorKey(tenantId, claims.oid),
      ...(isNonEmptyString(claims.displayName) ? { displayName: claims.displayName } : {}),
      ...(isNonEmptyString(claims.upn) ? { upn: claims.upn } : {}),
    },
  };
}

/**
 * Test-only helper to assemble an actor key without going through claims.
 * Exported for grant-record / principal-resolution call sites that already
 * have a normalized actor and need to derive a partition/row key.
 */
export function adobeSignActorKey(tenantId: string, oid: string): AdobeSignActorKey {
  return buildActorKey(tenantId, oid);
}
