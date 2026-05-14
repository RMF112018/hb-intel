/**
 * Adobe Sign OAuth return-path allowlist — B05 Prompt 03.
 *
 * The OAuth start route accepts a caller-supplied return path that the
 * callback route uses to send the operator back into My Dashboard after
 * Adobe consent. Because the callback is public, the return path is a
 * security boundary: it must be a same-origin relative path inside the
 * My Dashboard surface, never an absolute URL, protocol-relative URL,
 * or path outside the allowed prefixes.
 *
 * Validation rules:
 *   - must be a non-empty string,
 *   - must start with `/`,
 *   - must NOT start with `//` or `/\` (protocol-relative / scheme tricks),
 *   - must NOT contain `\\`,
 *   - must NOT contain `?` or `#` (we attach our own UX status query),
 *   - must match at least one allowed prefix.
 *
 * @module hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-oauth-return-path
 */

/**
 * Closed set of safe return-path prefixes. The first entry is the
 * default applied when the caller omits a return path.
 */
export const ADOBE_SIGN_OAUTH_RETURN_PATH_ALLOWLIST: readonly string[] = [
  '/sites/HBCentral/SitePages/MyDashboard.aspx',
  '/SitePages/MyDashboard.aspx',
  '/sites/',
];

export const ADOBE_SIGN_OAUTH_DEFAULT_RETURN_PATH = '/sites/HBCentral/SitePages/MyDashboard.aspx';
export const ADOBE_SIGN_OAUTH_FRONTEND_ORIGIN_ENV_KEY = 'MY_DASHBOARD_PUBLIC_ORIGIN';

export type AdobeSignReturnPathRejectionReason =
  | 'empty'
  | 'not-relative'
  | 'protocol-relative'
  | 'contains-query-or-fragment'
  | 'contains-backslash'
  | 'not-allowlisted';

export type AdobeSignReturnPathResult =
  | { readonly ok: true; readonly path: string }
  | { readonly ok: false; readonly reason: AdobeSignReturnPathRejectionReason };

export interface ValidateAdobeSignReturnPathOptions {
  readonly allowlist?: readonly string[];
  readonly defaultPath?: string;
}

export type AdobeSignFrontendOriginResult =
  | { readonly ok: true; readonly origin: string }
  | {
      readonly ok: false;
      readonly reason:
        | 'missing'
        | 'invalid-url'
        | 'not-https'
        | 'has-path'
        | 'has-query-or-fragment'
        | 'has-credentials';
    };

const FORBIDDEN_CHARS = /[?#]/;

const matchesAllowlist = (path: string, allowlist: readonly string[]): boolean =>
  allowlist.some((prefix) => path === prefix || path.startsWith(prefix));

/**
 * Validate a caller-supplied return path. `undefined` and the empty
 * string fall back to the configured default (which is itself validated
 * against the allowlist — misconfiguration cannot widen the contract).
 */
export function validateAdobeSignReturnPath(
  input: string | undefined,
  options: ValidateAdobeSignReturnPathOptions = {},
): AdobeSignReturnPathResult {
  const allowlist = options.allowlist ?? ADOBE_SIGN_OAUTH_RETURN_PATH_ALLOWLIST;
  const defaultPath = options.defaultPath ?? ADOBE_SIGN_OAUTH_DEFAULT_RETURN_PATH;

  const raw = typeof input === 'string' && input.trim().length > 0 ? input : defaultPath;

  if (!raw) return { ok: false, reason: 'empty' };
  if (raw.includes('\\')) return { ok: false, reason: 'contains-backslash' };
  if (FORBIDDEN_CHARS.test(raw)) return { ok: false, reason: 'contains-query-or-fragment' };
  if (!raw.startsWith('/')) return { ok: false, reason: 'not-relative' };
  if (raw.startsWith('//')) return { ok: false, reason: 'protocol-relative' };
  if (!matchesAllowlist(raw, allowlist)) return { ok: false, reason: 'not-allowlisted' };

  return { ok: true, path: raw };
}

export const resolveAdobeSignFrontendOrigin = (
  env: Record<string, string | undefined>,
): AdobeSignFrontendOriginResult => {
  const raw = env[ADOBE_SIGN_OAUTH_FRONTEND_ORIGIN_ENV_KEY]?.trim();
  if (!raw) return { ok: false, reason: 'missing' };

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return { ok: false, reason: 'invalid-url' };
  }

  if (parsed.protocol !== 'https:') return { ok: false, reason: 'not-https' };
  if (parsed.username || parsed.password) return { ok: false, reason: 'has-credentials' };
  if (parsed.pathname !== '/' && parsed.pathname !== '') return { ok: false, reason: 'has-path' };
  if (parsed.search || parsed.hash) return { ok: false, reason: 'has-query-or-fragment' };

  return { ok: true, origin: parsed.origin };
};

export const buildAdobeSignCallbackRedirectLocation = (args: {
  readonly origin: string;
  readonly returnPath: string;
  readonly status: string;
}): string => {
  const target = new URL(args.returnPath, `${args.origin}/`);
  target.searchParams.set('adobeSignAuthorization', args.status);
  return target.toString();
};
