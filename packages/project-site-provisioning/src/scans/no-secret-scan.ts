import type { ScanResult } from '../contracts/provisioning-manifest.js';

/**
 * Key names that must never appear in a planned manifest. The scan is
 * deliberately key-scoped (not value-scoped) for this step to avoid
 * false positives on descriptive prose. Value scanning is documented as
 * deferred in README.md and the Step 3 closeout.
 */
export const SECRET_KEY_TOKENS = [
  'client_secret',
  'clientsecret',
  'refresh_token',
  'refreshtoken',
  'dmsa_credential',
  'dmsacredential',
  'oauth_secret',
  'oauthsecret',
  'api_key',
  'apikey',
  'bearer_token',
  'bearertoken',
  'accesstoken',
  'access_token',
] as const;

const TOKEN_SET = new Set(SECRET_KEY_TOKENS.map((t) => t.toLowerCase()));

function walk(value: unknown, path: string, hits: string[]): void {
  if (value === null || typeof value !== 'object') return;

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) {
      walk(value[i], `${path}[${i}]`, hits);
    }
    return;
  }

  for (const key of Object.keys(value)) {
    if (TOKEN_SET.has(key.toLowerCase())) {
      hits.push(`${path}.${key}`);
    }
    walk((value as Record<string, unknown>)[key], `${path}.${key}`, hits);
  }
}

export function runNoSecretScan(value: unknown): ScanResult {
  const hits: string[] = [];
  walk(value, '$', hits);
  return { ok: hits.length === 0, hits: Object.freeze([...hits]) };
}
