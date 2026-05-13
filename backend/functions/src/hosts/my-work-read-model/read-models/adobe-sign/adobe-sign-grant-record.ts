/**
 * Adobe Sign grant-record contract — B05 Prompt 02 Lane C.
 *
 * Backend-only record describing a per-actor delegated OAuth grant. The
 * **secret material is never stored on this record** — only an opaque
 * reference (the future durable token-store address) plus non-secret
 * lifecycle metadata. The actual encrypted refresh token lives in the
 * durable store selected by B05/B06 governance and is opaque to this
 * layer.
 *
 * Partition / row keys:
 *   - `actorTenantId` (Entra tenant) + `actorOid` (Entra object id) —
 *     identical to the `AdobeSignActorKey` produced by the actor
 *     normalizer. UPN / email are **not** used as keys; they are stored
 *     only as display snapshots and may be null.
 *
 * Public projection:
 *   - `toAdobeSignGrantPublic()` returns a representation safe to surface
 *     through admin / diagnostic UI: it strips the token-store reference
 *     and any failure metadata that might carry vendor codes the caller
 *     should not echo.
 *
 * @module hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-grant-record
 */

import type { AdobeSignActorKey } from './adobe-sign-actor-normalizer.js';

export const ADOBE_SIGN_GRANT_STATES = ['pending', 'active', 'requires-reauth', 'revoked'] as const;

export type AdobeSignGrantState = (typeof ADOBE_SIGN_GRANT_STATES)[number];

export const ADOBE_SIGN_GRANT_FAILURE_KINDS = [
  'refresh-failed',
  'scope-changed',
  'revoked-upstream',
  'token-store-unavailable',
] as const;

export type AdobeSignGrantFailureKind = (typeof ADOBE_SIGN_GRANT_FAILURE_KINDS)[number];

export interface AdobeSignGrantFailureMetadata {
  readonly kind: AdobeSignGrantFailureKind;
  /** Non-secret message safe to record in telemetry. Never includes tokens or vendor secrets. */
  readonly message?: string;
  /** ISO-8601 UTC of last failure observation. */
  readonly observedAtUtc: string;
}

/**
 * Opaque pointer to where the encrypted refresh token lives in the
 * durable store. **No secret material crosses this boundary.** The store
 * adapter resolves `address` to the real ciphertext at use time.
 *
 * `storeKind` is intentionally a string union the future store adapter
 * widens; the value is informational only and never affects lookup.
 */
export interface AdobeSignEncryptedRefreshTokenRef {
  readonly storeKind: 'pending-selection' | 'table-storage' | 'key-vault' | string;
  /** Opaque address inside the chosen store. Empty string until the store writes a grant. */
  readonly address: string;
  /** ISO-8601 UTC of the last successful refresh persist; absent until first persist. */
  readonly lastPersistedAtUtc?: string;
}

export interface IAdobeSignGrantRecord {
  /** Trusted Entra tenant id — partition. */
  readonly actorTenantId: string;
  /** Entra object id of the granting user — row. */
  readonly actorOid: string;
  /** Stable composite key — mirrors `AdobeSignActorKey` from the normalizer. */
  readonly actorKey: AdobeSignActorKey;

  /** Display snapshot at grant time. Diagnostic only. */
  readonly upnSnapshot?: string;
  /** Display snapshot at grant time. Diagnostic only. */
  readonly displayNameSnapshot?: string;

  /** Adobe Sign tenant-routed API access point (e.g. https://api.na1.adobesign.com). */
  readonly adobeApiAccessPoint: string;
  /** Adobe Sign tenant-routed web access point (e.g. https://secure.na1.adobesign.com). */
  readonly adobeWebAccessPoint: string;

  /** Encrypted refresh-token reference — secret material lives in the durable store. */
  readonly encryptedRefreshTokenRef: AdobeSignEncryptedRefreshTokenRef;

  /** Adobe-granted scopes (governed subset only — enforced upstream by config gate). */
  readonly grantedScopes: readonly string[];

  /** Lifecycle timestamps — ISO-8601 UTC. */
  readonly grantedAtUtc: string;
  readonly lastRefreshedAtUtc?: string;
  readonly expiresAtUtc?: string;
  readonly revokedAtUtc?: string;

  readonly state: AdobeSignGrantState;
  readonly failureMetadata?: AdobeSignGrantFailureMetadata;
}

/**
 * Subset of `IAdobeSignGrantRecord` safe to surface through diagnostic /
 * admin UI. Excludes any field that could carry secret-adjacent content.
 */
export interface AdobeSignGrantPublicProjection {
  readonly actorTenantId: string;
  readonly actorOid: string;
  readonly actorKey: AdobeSignActorKey;
  readonly upnSnapshot?: string;
  readonly displayNameSnapshot?: string;
  readonly adobeApiAccessPoint: string;
  readonly adobeWebAccessPoint: string;
  readonly grantedScopes: readonly string[];
  readonly grantedAtUtc: string;
  readonly lastRefreshedAtUtc?: string;
  readonly expiresAtUtc?: string;
  readonly revokedAtUtc?: string;
  readonly state: AdobeSignGrantState;
  /** Failure kind only — message is stripped to avoid leaking vendor strings. */
  readonly failureKind?: AdobeSignGrantFailureKind;
}

/**
 * Project an `IAdobeSignGrantRecord` to its public form. This is the only
 * sanctioned path from a stored grant to a caller-visible object; route
 * handlers / admin endpoints MUST go through this helper rather than
 * spreading the record directly.
 */
export function toAdobeSignGrantPublic(
  record: IAdobeSignGrantRecord,
): AdobeSignGrantPublicProjection {
  return {
    actorTenantId: record.actorTenantId,
    actorOid: record.actorOid,
    actorKey: record.actorKey,
    ...(record.upnSnapshot !== undefined ? { upnSnapshot: record.upnSnapshot } : {}),
    ...(record.displayNameSnapshot !== undefined
      ? { displayNameSnapshot: record.displayNameSnapshot }
      : {}),
    adobeApiAccessPoint: record.adobeApiAccessPoint,
    adobeWebAccessPoint: record.adobeWebAccessPoint,
    grantedScopes: record.grantedScopes,
    grantedAtUtc: record.grantedAtUtc,
    ...(record.lastRefreshedAtUtc !== undefined
      ? { lastRefreshedAtUtc: record.lastRefreshedAtUtc }
      : {}),
    ...(record.expiresAtUtc !== undefined ? { expiresAtUtc: record.expiresAtUtc } : {}),
    ...(record.revokedAtUtc !== undefined ? { revokedAtUtc: record.revokedAtUtc } : {}),
    state: record.state,
    ...(record.failureMetadata !== undefined ? { failureKind: record.failureMetadata.kind } : {}),
  };
}
