/**
 * Foleon origin allowlist and URL-shape policy.
 *
 * Design rules (from integration-plan §05 security/governance):
 * - Exact-origin match only. No wildcards ever. A list of allowed
 *   origins is configured at mount time.
 * - Preview URLs (any Foleon URL containing a `/preview/` path segment)
 *   are blocked for production reader flow unless the host has opted
 *   in via `allowPreview=true` (admin-review builds only).
 * - Only `http:` / `https:` schemes accepted.
 */

export const DEFAULT_FOLEON_ORIGINS: ReadonlyArray<string> = [
  'https://viewer.us.foleon.com',
];

export interface FoleonOriginPolicy {
  readonly allowedOrigins: ReadonlyArray<string>;
  readonly allowPreview: boolean;
}

export function createFoleonOriginPolicy(
  acceptedFoleonOrigins?: ReadonlyArray<string>,
  allowPreview?: boolean,
): FoleonOriginPolicy {
  const normalized = (acceptedFoleonOrigins ?? DEFAULT_FOLEON_ORIGINS)
    .map((origin) => tryNormalizeOrigin(origin))
    .filter((origin): origin is string => origin !== null);
  return {
    allowedOrigins: Array.from(new Set(normalized)),
    allowPreview: !!allowPreview,
  };
}

export type OriginCheckReason =
  | 'ok'
  | 'invalid-url'
  | 'wrong-scheme'
  | 'origin-not-allowlisted'
  | 'preview-url-blocked';

export interface OriginCheckResult {
  readonly allowed: boolean;
  readonly reason: OriginCheckReason;
  readonly normalizedOrigin?: string;
}

export function isAllowedFoleonUrl(
  policy: FoleonOriginPolicy,
  candidateUrl: string | undefined,
): OriginCheckResult {
  if (!candidateUrl) return { allowed: false, reason: 'invalid-url' };
  let parsed: URL;
  try {
    parsed = new URL(candidateUrl);
  } catch {
    return { allowed: false, reason: 'invalid-url' };
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { allowed: false, reason: 'wrong-scheme' };
  }
  if (!policy.allowPreview && parsed.pathname.includes('/preview/')) {
    return { allowed: false, reason: 'preview-url-blocked', normalizedOrigin: parsed.origin };
  }
  if (!policy.allowedOrigins.includes(parsed.origin)) {
    return { allowed: false, reason: 'origin-not-allowlisted', normalizedOrigin: parsed.origin };
  }
  return { allowed: true, reason: 'ok', normalizedOrigin: parsed.origin };
}

function tryNormalizeOrigin(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.includes('*')) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return parsed.origin;
  } catch {
    return null;
  }
}
