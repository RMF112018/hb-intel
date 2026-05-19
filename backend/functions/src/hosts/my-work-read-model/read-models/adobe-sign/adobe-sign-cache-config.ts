/**
 * Adobe Sign cache configuration / readiness — B05.15 Prompt 01.
 *
 * Centralized helper that classifies the new Adobe Sign cache program's
 * runtime configuration (queue, dedupe table, lease table, webhook
 * receiver, read-mode flag, and operational tuning settings) as `ready`
 * or `configuration-required`. The returned value carries **no secret
 * material**: only key names that are missing, the parsed read-mode, and
 * the resolved tuning values. Callers map a `configuration-required`
 * outcome to whichever surface posture is appropriate (typically
 * `configuration-required` for read-model envelopes that depend on cache
 * readiness once Prompt 04 wires the cache provider).
 *
 * Recognized env keys:
 *
 *   Required (no safe default):
 *     - `ADOBE_SIGN_WEBHOOK_RECEIVER_PUBLIC_BASE_URL`
 *     - `ADOBE_SIGN_WEBHOOK_RECEIVER_ROUTE_BASE`
 *     - `ADOBE_SIGN_WEBHOOK_PAYLOAD_PROFILE`
 *     - `ADOBE_SIGN_CACHE_QUEUE_NAME`
 *     - `ADOBE_SIGN_WEBHOOK_DEDUPE_TABLE_NAME`
 *     - `ADOBE_SIGN_CACHE_REFRESH_LEASE_TABLE_NAME`
 *
 *   Numeric tuning (documented defaults; never blocks readiness):
 *     - `ADOBE_SIGN_CACHE_SYNC_RECONCILIATION_BATCH_SIZE` (default 25)
 *     - `ADOBE_SIGN_CACHE_RECONCILIATION_SUCCESS_HOURS`  (default 24)
 *     - `ADOBE_SIGN_CACHE_RECONCILIATION_FAILURE_BACKOFF_HOURS` (default 2)
 *     - `ADOBE_SIGN_CACHE_DEDUPE_RETENTION_DAYS`         (default 14)
 *     - `ADOBE_SIGN_CACHE_REFRESH_LEASE_MINUTES`         (default 10)
 *
 *   Read-mode flag (defaults to `live`):
 *     - `MY_WORK_ADOBE_SIGN_READ_MODE`
 *
 * This module is contract / pure given its `env` input — it never throws
 * and never echoes secret values. The cache config does not currently
 * carry secret material, but the same discipline is preserved.
 *
 * @module hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-cache-config
 */

import type { EnvLike } from './adobe-sign-config.js';

export const ADOBE_SIGN_CACHE_REQUIRED_CONFIG_KEYS = [
  'ADOBE_SIGN_WEBHOOK_RECEIVER_PUBLIC_BASE_URL',
  'ADOBE_SIGN_WEBHOOK_RECEIVER_ROUTE_BASE',
  'ADOBE_SIGN_WEBHOOK_PAYLOAD_PROFILE',
  'ADOBE_SIGN_CACHE_QUEUE_NAME',
  'ADOBE_SIGN_WEBHOOK_DEDUPE_TABLE_NAME',
  'ADOBE_SIGN_CACHE_REFRESH_LEASE_TABLE_NAME',
] as const;

export type AdobeSignCacheRequiredConfigKey =
  (typeof ADOBE_SIGN_CACHE_REQUIRED_CONFIG_KEYS)[number];

export const ADOBE_SIGN_CACHE_TUNING_CONFIG_KEYS = [
  'ADOBE_SIGN_CACHE_SYNC_RECONCILIATION_BATCH_SIZE',
  'ADOBE_SIGN_CACHE_RECONCILIATION_SUCCESS_HOURS',
  'ADOBE_SIGN_CACHE_RECONCILIATION_FAILURE_BACKOFF_HOURS',
  'ADOBE_SIGN_CACHE_DEDUPE_RETENTION_DAYS',
  'ADOBE_SIGN_CACHE_REFRESH_LEASE_MINUTES',
] as const;

export type AdobeSignCacheTuningConfigKey =
  (typeof ADOBE_SIGN_CACHE_TUNING_CONFIG_KEYS)[number];

export const MY_WORK_ADOBE_SIGN_READ_MODES = ['live', 'cache'] as const;

export type MyWorkAdobeSignReadMode = (typeof MY_WORK_ADOBE_SIGN_READ_MODES)[number];

export const ADOBE_SIGN_CACHE_TUNING_DEFAULTS: Readonly<
  Record<AdobeSignCacheTuningConfigKey, number>
> = {
  ADOBE_SIGN_CACHE_SYNC_RECONCILIATION_BATCH_SIZE: 25,
  ADOBE_SIGN_CACHE_RECONCILIATION_SUCCESS_HOURS: 24,
  ADOBE_SIGN_CACHE_RECONCILIATION_FAILURE_BACKOFF_HOURS: 2,
  ADOBE_SIGN_CACHE_DEDUPE_RETENTION_DAYS: 14,
  ADOBE_SIGN_CACHE_REFRESH_LEASE_MINUTES: 10,
};

export type AdobeSignCacheConfigReadinessStatus = 'ready' | 'configuration-required';

/**
 * Non-secret diagnostic surface. Carries only key names, the resolved
 * read-mode, and the resolved tuning values (numerics fall back to
 * documented defaults). Source env values themselves are never copied.
 */
export interface AdobeSignCacheConfigReadiness {
  readonly status: AdobeSignCacheConfigReadinessStatus;
  readonly missingKeys: readonly AdobeSignCacheRequiredConfigKey[];
  readonly readMode: MyWorkAdobeSignReadMode;
  readonly tuning: Readonly<Record<AdobeSignCacheTuningConfigKey, number>>;
}

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isMyWorkAdobeSignReadMode = (value: string): value is MyWorkAdobeSignReadMode =>
  (MY_WORK_ADOBE_SIGN_READ_MODES as readonly string[]).includes(value);

/**
 * Parse the cache read-mode env into a closed `'live' | 'cache'` value.
 * Unset, blank, or unrecognized values resolve to `'live'` (the safe
 * default — pre-cutover routine reads continue to use the live provider).
 */
export function parseAdobeSignCacheReadMode(raw: string | undefined): MyWorkAdobeSignReadMode {
  if (!isNonEmptyString(raw)) return 'live';
  const trimmed = raw.trim().toLowerCase();
  return isMyWorkAdobeSignReadMode(trimmed) ? trimmed : 'live';
}

/**
 * Parse a positive integer setting with a documented fallback. Returns
 * the fallback for unset, blank, non-numeric, non-finite, non-integer,
 * negative, or zero inputs. The fallback is the value documented in
 * `03_Azure_Infrastructure_And_Configuration_Specification.md` §4.2.
 */
export function parsePositiveIntegerSetting(raw: string | undefined, fallback: number): number {
  if (!isNonEmptyString(raw)) return fallback;
  const parsed = Number(raw.trim());
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

/**
 * Inspect the supplied env-like object and produce a cache-readiness
 * summary.
 *
 *   - Every required key present → `ready`.
 *   - Any required key missing  → `configuration-required` with the
 *     missing key names in `missingKeys`.
 *
 * Tuning values always resolve (env value when valid, documented default
 * otherwise). Tuning values never block readiness.
 *
 * Read-mode is always reported; an unset / unrecognized value falls back
 * to `'live'`.
 */
export function resolveAdobeSignCacheConfigReadiness(env: EnvLike): AdobeSignCacheConfigReadiness {
  const missingKeys: AdobeSignCacheRequiredConfigKey[] = [];
  for (const key of ADOBE_SIGN_CACHE_REQUIRED_CONFIG_KEYS) {
    if (!isNonEmptyString(env[key])) {
      missingKeys.push(key);
    }
  }

  const readMode = parseAdobeSignCacheReadMode(env.MY_WORK_ADOBE_SIGN_READ_MODE);

  const tuning: Record<AdobeSignCacheTuningConfigKey, number> = {
    ADOBE_SIGN_CACHE_SYNC_RECONCILIATION_BATCH_SIZE: parsePositiveIntegerSetting(
      env.ADOBE_SIGN_CACHE_SYNC_RECONCILIATION_BATCH_SIZE,
      ADOBE_SIGN_CACHE_TUNING_DEFAULTS.ADOBE_SIGN_CACHE_SYNC_RECONCILIATION_BATCH_SIZE,
    ),
    ADOBE_SIGN_CACHE_RECONCILIATION_SUCCESS_HOURS: parsePositiveIntegerSetting(
      env.ADOBE_SIGN_CACHE_RECONCILIATION_SUCCESS_HOURS,
      ADOBE_SIGN_CACHE_TUNING_DEFAULTS.ADOBE_SIGN_CACHE_RECONCILIATION_SUCCESS_HOURS,
    ),
    ADOBE_SIGN_CACHE_RECONCILIATION_FAILURE_BACKOFF_HOURS: parsePositiveIntegerSetting(
      env.ADOBE_SIGN_CACHE_RECONCILIATION_FAILURE_BACKOFF_HOURS,
      ADOBE_SIGN_CACHE_TUNING_DEFAULTS.ADOBE_SIGN_CACHE_RECONCILIATION_FAILURE_BACKOFF_HOURS,
    ),
    ADOBE_SIGN_CACHE_DEDUPE_RETENTION_DAYS: parsePositiveIntegerSetting(
      env.ADOBE_SIGN_CACHE_DEDUPE_RETENTION_DAYS,
      ADOBE_SIGN_CACHE_TUNING_DEFAULTS.ADOBE_SIGN_CACHE_DEDUPE_RETENTION_DAYS,
    ),
    ADOBE_SIGN_CACHE_REFRESH_LEASE_MINUTES: parsePositiveIntegerSetting(
      env.ADOBE_SIGN_CACHE_REFRESH_LEASE_MINUTES,
      ADOBE_SIGN_CACHE_TUNING_DEFAULTS.ADOBE_SIGN_CACHE_REFRESH_LEASE_MINUTES,
    ),
  };

  if (missingKeys.length > 0) {
    return {
      status: 'configuration-required',
      missingKeys,
      readMode,
      tuning,
    };
  }

  return {
    status: 'ready',
    missingKeys: [],
    readMode,
    tuning,
  };
}

/**
 * Caller-facing predicate: is the cache program ready to participate in
 * a routine page-load read path? Anything other than `'ready'` should
 * keep the route on the live provider regardless of `readMode`.
 */
export function isAdobeSignCacheConfigReady(
  readiness: AdobeSignCacheConfigReadiness,
): readiness is AdobeSignCacheConfigReadiness & { readonly status: 'ready' } {
  return readiness.status === 'ready';
}
