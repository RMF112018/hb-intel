/**
 * Adobe Sign OAuth configuration / readiness — B05 Prompt 02 Lane D.
 *
 * Centralized helper that classifies Adobe Sign OAuth + token-store
 * configuration as `ready` or `configuration-required`. The returned
 * value carries **no secret material**: only key names that are missing
 * and the non-secret presence flag for each setting. Callers map a
 * `configuration-required` outcome to `MyWorkReadModelSourceStatus`
 * `configuration-required` (and the matching warning).
 *
 * Recognized env keys:
 *   - `ADOBE_SIGN_OAUTH_CLIENT_ID`            — Adobe app client id
 *   - `ADOBE_SIGN_OAUTH_CLIENT_SECRET`        — Adobe app client secret
 *   - `ADOBE_SIGN_OAUTH_REDIRECT_URI`         — Tenant-routed redirect
 *   - `ADOBE_SIGN_OAUTH_SCOPES`               — Space- or comma-delimited
 *   - `ADOBE_SIGN_TOKEN_STORE_MODE`           — Governance gate; the final
 *     durable store ('table-storage' | 'key-vault') is decided by
 *     B05/B06 governance. While unset (or set to 'pending-selection'),
 *     readiness reports `pending-store-selection` so callers can return
 *     `configuration-required` without enabling production-bound writes.
 *
 * This module is contract / pure given its `env` input — it never
 * throws and never echoes secret values. Callers either pass
 * `process.env` directly or a stub for tests.
 *
 * @module hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-config
 */

export const ADOBE_SIGN_OAUTH_CONFIG_KEYS = [
  'ADOBE_SIGN_OAUTH_CLIENT_ID',
  'ADOBE_SIGN_OAUTH_CLIENT_SECRET',
  'ADOBE_SIGN_OAUTH_REDIRECT_URI',
  'ADOBE_SIGN_OAUTH_SCOPES',
] as const;

export type AdobeSignOAuthConfigKey = (typeof ADOBE_SIGN_OAUTH_CONFIG_KEYS)[number];

export const ADOBE_SIGN_TOKEN_STORE_MODES = [
  'pending-selection',
  'table-storage',
  'key-vault',
] as const;

export type AdobeSignTokenStoreMode = (typeof ADOBE_SIGN_TOKEN_STORE_MODES)[number];

export type AdobeSignConfigReadinessStatus =
  | 'ready'
  | 'configuration-required'
  | 'pending-store-selection'
  | 'unsupported-store-mode';

export const ADOBE_SIGN_STORAGE_INFRASTRUCTURE_KEYS = [
  'AZURE_TABLE_ENDPOINT',
  'ADOBE_SIGN_TOKEN_ENCRYPTION_KEY',
] as const;

export type AdobeSignStorageInfrastructureKey =
  (typeof ADOBE_SIGN_STORAGE_INFRASTRUCTURE_KEYS)[number];

/**
 * Non-secret diagnostic surface. Carries only key names and presence
 * flags. The actual config values are never copied here.
 */
export interface AdobeSignOAuthConfigReadiness {
  readonly status: AdobeSignConfigReadinessStatus;
  readonly missingKeys: readonly AdobeSignOAuthConfigKey[];
  /** Durable-storage infrastructure keys (Azure / encryption) missing for the selected store mode. */
  readonly missingStorageKeys: readonly AdobeSignStorageInfrastructureKey[];
  /** Final selected durable store. `pending-selection` blocks production writes. */
  readonly tokenStoreMode: AdobeSignTokenStoreMode;
  /** True when at least one governed OAuth scope is configured. */
  readonly hasGovernedScopes: boolean;
}

export type EnvLike = Readonly<Record<string, string | undefined>>;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isAdobeSignTokenStoreMode = (value: string): value is AdobeSignTokenStoreMode =>
  (ADOBE_SIGN_TOKEN_STORE_MODES as readonly string[]).includes(value);

const resolveTokenStoreMode = (raw: string | undefined): AdobeSignTokenStoreMode => {
  if (!isNonEmptyString(raw)) return 'pending-selection';
  const trimmed = raw.trim();
  return isAdobeSignTokenStoreMode(trimmed) ? trimmed : 'pending-selection';
};

/**
 * Parse the governed-scope env into a deduped, trimmed, lower-cased list.
 * Returns an empty list when the env value is missing or whitespace.
 *
 * The actual *governance* (which scopes are allowed) is enforced upstream
 * at deployment time — this helper merely classifies presence.
 */
export function parseAdobeSignScopes(raw: string | undefined): readonly string[] {
  if (!isNonEmptyString(raw)) return [];
  return Array.from(
    new Set(
      raw
        .split(/[\s,]+/)
        .map((s) => s.trim().toLowerCase())
        .filter((s) => s.length > 0),
    ),
  );
}

/**
 * Inspect the supplied env-like object and produce a readiness summary.
 *
 * - All four OAuth keys present + at least one parsed scope + a non-pending
 *   store mode + every durable-storage infrastructure key present → `ready`.
 * - Any required OAuth key missing or no governed scopes →
 *   `configuration-required`.
 * - All OAuth keys present + scopes parsed, but store mode is pending
 *   (or unset / unknown) → `pending-store-selection`.
 * - `tokenStoreMode === 'table-storage'` but `AZURE_TABLE_ENDPOINT` or
 *   `ADOBE_SIGN_TOKEN_ENCRYPTION_KEY` missing → `configuration-required`
 *   with the missing infrastructure keys in `missingStorageKeys`.
 * - `tokenStoreMode === 'key-vault'` → `unsupported-store-mode` (no
 *   production adapter wired in this remediation).
 *
 * The function never echoes the values themselves — only key names.
 */
export function resolveAdobeSignOAuthConfigReadiness(env: EnvLike): AdobeSignOAuthConfigReadiness {
  const missingKeys: AdobeSignOAuthConfigKey[] = [];
  for (const key of ADOBE_SIGN_OAUTH_CONFIG_KEYS) {
    if (!isNonEmptyString(env[key])) {
      missingKeys.push(key);
    }
  }

  const scopes = parseAdobeSignScopes(env.ADOBE_SIGN_OAUTH_SCOPES);
  const hasGovernedScopes = scopes.length > 0;

  // If the SCOPES key was present but parsing yielded zero, treat the
  // SCOPES key itself as missing for readiness purposes — empty / garbage
  // scope strings are not a valid governed posture.
  if (!missingKeys.includes('ADOBE_SIGN_OAUTH_SCOPES') && !hasGovernedScopes) {
    missingKeys.push('ADOBE_SIGN_OAUTH_SCOPES');
  }

  const tokenStoreMode = resolveTokenStoreMode(env.ADOBE_SIGN_TOKEN_STORE_MODE);

  if (missingKeys.length > 0) {
    return {
      status: 'configuration-required',
      missingKeys,
      missingStorageKeys: [],
      tokenStoreMode,
      hasGovernedScopes,
    };
  }

  if (tokenStoreMode === 'pending-selection') {
    return {
      status: 'pending-store-selection',
      missingKeys: [],
      missingStorageKeys: [],
      tokenStoreMode,
      hasGovernedScopes,
    };
  }

  if (tokenStoreMode === 'key-vault') {
    return {
      status: 'unsupported-store-mode',
      missingKeys: [],
      missingStorageKeys: [],
      tokenStoreMode,
      hasGovernedScopes,
    };
  }

  // tokenStoreMode === 'table-storage'
  const missingStorageKeys: AdobeSignStorageInfrastructureKey[] = [];
  for (const key of ADOBE_SIGN_STORAGE_INFRASTRUCTURE_KEYS) {
    if (!isNonEmptyString(env[key])) {
      missingStorageKeys.push(key);
    }
  }

  if (missingStorageKeys.length > 0) {
    return {
      status: 'configuration-required',
      missingKeys: [],
      missingStorageKeys,
      tokenStoreMode,
      hasGovernedScopes,
    };
  }

  return {
    status: 'ready',
    missingKeys: [],
    missingStorageKeys: [],
    tokenStoreMode,
    hasGovernedScopes,
  };
}

/**
 * Caller-facing predicate: is the surface ready to issue an outbound
 * Adobe OAuth call (or load a grant) at this moment? Anything other than
 * `'ready'` should be surfaced to the read-model envelope as
 * `configuration-required`.
 */
export function isAdobeSignConfigReady(
  readiness: AdobeSignOAuthConfigReadiness,
): readiness is AdobeSignOAuthConfigReadiness & { readonly status: 'ready' } {
  return readiness.status === 'ready';
}
