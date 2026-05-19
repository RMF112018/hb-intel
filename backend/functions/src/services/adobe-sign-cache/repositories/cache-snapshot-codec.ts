/**
 * My Dashboard | Adobe Sign cache — sanitized JSON snapshot codec
 * (B05.15 Prompt 04).
 *
 * The UserCache and AgreementProjectionCache lists store DTO fragments
 * as serialized JSON in `*Json` columns. The codec wraps every payload
 * with a `schemaVersion` envelope so the reader can detect schema drift
 * and degrade gracefully (UI sees `backend-unavailable` instead of a
 * partial-shape envelope when a row is on an older or unknown schema).
 *
 * Parse failures NEVER throw — the result discriminates `ok=false` with
 * a closed reason string so the reader can emit a sanitized diagnostic
 * event and substitute the truthful empty-cache posture for the row.
 *
 * @module services/adobe-sign-cache/repositories/cache-snapshot-codec
 */

export interface CachedSnapshotEnvelope<TPayload> {
  readonly schemaVersion: number;
  readonly payload: TPayload;
}

export type CachedSnapshotParseFailureReason =
  | 'empty'
  | 'parse-error'
  | 'envelope-shape-invalid'
  | 'missing-schema-version'
  | 'schema-version-mismatch'
  | 'payload-shape-invalid';

export type CachedSnapshotParseResult<TPayload> =
  | { readonly ok: true; readonly payload: TPayload; readonly schemaVersion: number }
  | { readonly ok: false; readonly reason: CachedSnapshotParseFailureReason };

/**
 * Optional payload-shape validator. Return `true` for accepted shapes;
 * the codec converts a `false` return into a `'payload-shape-invalid'`
 * rejection. The validator is intentionally narrow — the codec doesn't
 * know domain semantics; consumers compose richer validators.
 */
export type CachedSnapshotPayloadValidator<TPayload> = (value: unknown) => value is TPayload;

/**
 * Parse a JSON snapshot string. Returns the unwrapped payload when the
 * envelope's `schemaVersion` matches `expectedSchemaVersion` and the
 * optional `validate` predicate accepts the payload shape.
 *
 * `raw === null | undefined | ''` returns `{ ok: false, reason: 'empty' }`
 * so the caller can distinguish "row column was blank" from "row column
 * had unparseable contents".
 */
export function parseCachedJsonSnapshot<TPayload>(
  raw: string | null | undefined,
  expectedSchemaVersion: number,
  validate?: CachedSnapshotPayloadValidator<TPayload>,
): CachedSnapshotParseResult<TPayload> {
  if (raw === null || raw === undefined || raw === '') {
    return { ok: false, reason: 'empty' };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, reason: 'parse-error' };
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { ok: false, reason: 'envelope-shape-invalid' };
  }
  const envelope = parsed as Record<string, unknown>;
  if (!('schemaVersion' in envelope)) {
    return { ok: false, reason: 'missing-schema-version' };
  }
  const schemaVersion = envelope.schemaVersion;
  if (typeof schemaVersion !== 'number' || !Number.isInteger(schemaVersion) || schemaVersion <= 0) {
    return { ok: false, reason: 'missing-schema-version' };
  }
  if (schemaVersion !== expectedSchemaVersion) {
    return { ok: false, reason: 'schema-version-mismatch' };
  }
  if (!('payload' in envelope)) {
    return { ok: false, reason: 'envelope-shape-invalid' };
  }
  const payload = envelope.payload;
  if (validate && !validate(payload)) {
    return { ok: false, reason: 'payload-shape-invalid' };
  }
  return { ok: true, payload: payload as TPayload, schemaVersion };
}

/**
 * Stringify a payload into the canonical `{ schemaVersion, payload }`
 * envelope for persistence. Round-trip with `parseCachedJsonSnapshot`
 * returns the original payload when `expectedSchemaVersion ===
 * schemaVersion` and the payload survives JSON.stringify/parse.
 */
export function stringifyCachedJsonSnapshot<TPayload>(
  payload: TPayload,
  schemaVersion: number,
): string {
  if (!Number.isInteger(schemaVersion) || schemaVersion <= 0) {
    throw new RangeError(
      `stringifyCachedJsonSnapshot: schemaVersion must be a positive integer (got ${schemaVersion}).`,
    );
  }
  const envelope: CachedSnapshotEnvelope<TPayload> = { schemaVersion, payload };
  return JSON.stringify(envelope);
}

/**
 * Canonical schema versions for the cache snapshot columns. Centralized
 * here so the repositories and the worker (Prompt 09) read from one
 * source of truth.
 */
export const ADOBE_SIGN_CACHE_USER_CACHE_SCHEMA_VERSION = 1 as const;
export const ADOBE_SIGN_CACHE_AGREEMENT_PROJECTION_SCHEMA_VERSION = 1 as const;
