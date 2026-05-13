/**
 * Adobe Sign OAuth state lifecycle — B05 Prompt 03.
 *
 * Pure helpers for the one-time OAuth `state` parameter. State is:
 *   - 32 random bytes (256 bits) → base64url, ~43 chars,
 *   - bound to the actor lookup key (tenant + oid) at creation time,
 *   - bound to a validated return path,
 *   - issued with a TTL (default 600 s),
 *   - consumable exactly once.
 *
 * The store seam (`adobe-sign-oauth-state-store.ts`) provides put/take.
 * This module only describes the record shape and the lifecycle math.
 *
 * @module hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-oauth-state
 */

import type { AdobeSignActorKey } from './adobe-sign-actor-normalizer.js';

/** Default state TTL — long enough for the Adobe consent flow, short enough to bound replay risk. */
export const ADOBE_SIGN_OAUTH_STATE_DEFAULT_TTL_SECONDS = 600;

/** Random bytes for OAuth `state` value (256 bits → 32 bytes → ~43 base64url chars). */
export const ADOBE_SIGN_OAUTH_STATE_BYTE_LENGTH = 32;

export interface AdobeSignOAuthStateRecord {
  /** Opaque, unpredictable, URL-safe state value sent to Adobe and echoed back. */
  readonly stateValue: string;
  /** Actor (tenant + oid) the state is bound to. */
  readonly actorKey: AdobeSignActorKey;
  /** Validated relative return path the callback should redirect to. */
  readonly returnPath: string;
  /** ISO-8601 UTC creation timestamp. */
  readonly createdAtUtc: string;
  /** ISO-8601 UTC expiry. */
  readonly expiresAtUtc: string;
  /** ISO-8601 UTC; present only after take/consume. */
  readonly consumedAtUtc?: string;
}

export type AdobeSignOAuthStateConsumeOutcome =
  | { readonly status: 'valid'; readonly record: AdobeSignOAuthStateRecord }
  | { readonly status: 'expired' }
  | { readonly status: 'consumed' }
  | { readonly status: 'missing' }
  | { readonly status: 'store-unavailable' };

export interface CreateAdobeSignOAuthStateInput {
  readonly actorKey: AdobeSignActorKey;
  readonly returnPath: string;
  readonly now: () => Date;
  readonly randomBytes: (n: number) => Uint8Array;
  readonly ttlSeconds?: number;
}

/**
 * Encode bytes as base64url (RFC 4648 §5 — `-` `_`, no padding). Browser-safe
 * implementation that does not depend on Node `Buffer`'s base64url variant
 * so tests can run in any vitest environment.
 */
export function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const b64 = typeof btoa === 'function' ? btoa(binary) : Buffer.from(bytes).toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

/**
 * Create a fresh state record. The `now` + `randomBytes` callbacks are
 * injected so this is a pure function of its inputs — tests pass
 * deterministic stubs; production code passes `() => new Date()` and
 * `(n) => crypto.randomBytes(n)`.
 */
export function createAdobeSignOAuthState(
  input: CreateAdobeSignOAuthStateInput,
): AdobeSignOAuthStateRecord {
  const ttlSeconds = input.ttlSeconds ?? ADOBE_SIGN_OAUTH_STATE_DEFAULT_TTL_SECONDS;
  if (ttlSeconds <= 0) {
    throw new Error('ADOBE_SIGN_OAUTH_STATE: ttlSeconds must be positive');
  }
  const createdAt = input.now();
  const expiresAt = new Date(createdAt.getTime() + ttlSeconds * 1000);

  const bytes = input.randomBytes(ADOBE_SIGN_OAUTH_STATE_BYTE_LENGTH);
  if (bytes.length !== ADOBE_SIGN_OAUTH_STATE_BYTE_LENGTH) {
    throw new Error(
      `ADOBE_SIGN_OAUTH_STATE: randomBytes must return ${ADOBE_SIGN_OAUTH_STATE_BYTE_LENGTH} bytes`,
    );
  }

  return {
    stateValue: toBase64Url(bytes),
    actorKey: input.actorKey,
    returnPath: input.returnPath,
    createdAtUtc: createdAt.toISOString(),
    expiresAtUtc: expiresAt.toISOString(),
  };
}

/**
 * Classify a stored record at consume time. Pure: no clock or store I/O.
 * The caller mediates store I/O (consume-on-read), then applies this
 * helper to decide what to do with the returned record.
 */
export function classifyOAuthStateAtConsume(
  record: AdobeSignOAuthStateRecord,
  now: Date,
): 'valid' | 'expired' | 'consumed' {
  if (record.consumedAtUtc !== undefined) return 'consumed';
  if (new Date(record.expiresAtUtc).getTime() <= now.getTime()) return 'expired';
  return 'valid';
}
