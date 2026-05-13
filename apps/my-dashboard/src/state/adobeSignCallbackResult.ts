/**
 * Adobe Sign OAuth callback result parser.
 *
 * The backend's GET /api/my-work/adobe-sign/oauth/callback route
 * (backend/functions/src/hosts/my-work-read-model/adobe-sign-oauth-routes.ts:289–310)
 * redirects the browser back to the SharePoint return path with a
 * `adobeSignAuthorization=<status>` query parameter. This pure parser
 * reads that query string and returns a typed user-facing result the
 * frontend banner can render. Unknown values map to a generic safe
 * outcome — no raw provider tokens, body text, or error codes ever
 * leak into the UI.
 *
 * @module state/adobeSignCallbackResult
 */

export const ADOBE_SIGN_CALLBACK_PARAM = 'adobeSignAuthorization';

export type AdobeSignCallbackKind =
  | 'success'
  | 'retryable-failure'
  | 'operator-action-required'
  | 'transient-failure'
  | 'unknown';

export interface AdobeSignCallbackResult {
  /** Outcome class consumed by UI for tone (status vs alert) + iconography. */
  readonly kind: AdobeSignCallbackKind;
  /**
   * Raw backend status value (already validated to be a simple slug; safe to
   * use as a DOM attribute marker). Exposed for telemetry / diagnostics —
   * NOT for display.
   */
  readonly backendStatus: string;
  readonly headline: string;
  readonly message: string;
}

interface CopyEntry {
  readonly kind: AdobeSignCallbackKind;
  readonly headline: string;
  readonly message: string;
}

const COPY_BY_STATUS: Readonly<Record<string, CopyEntry>> = {
  success: {
    kind: 'success',
    headline: 'Adobe Sign is connected.',
    message: 'Your action queue will refresh on next load.',
  },
  'invalid-state': {
    kind: 'retryable-failure',
    headline: 'Adobe Sign authorization could not be verified.',
    message: "The authorization request didn't pass validation. Please try connecting again.",
  },
  'expired-state': {
    kind: 'retryable-failure',
    headline: 'Adobe Sign authorization expired.',
    message: 'The authorization request expired before it could complete. Please try again.',
  },
  'consumed-state': {
    kind: 'retryable-failure',
    headline: 'Adobe Sign authorization link already used.',
    message: 'This authorization link has already been used. Please start a new authorization.',
  },
  'configuration-required': {
    kind: 'operator-action-required',
    headline: 'Adobe Sign is not fully configured.',
    message: 'An administrator needs to complete setup before you can authorize the connection.',
  },
  'source-unavailable': {
    kind: 'transient-failure',
    headline: 'Adobe Sign is unavailable.',
    message: 'Adobe Sign could not be reached right now. Please try again shortly.',
  },
  'invalid-grant': {
    kind: 'retryable-failure',
    headline: 'Adobe Sign rejected the authorization.',
    message: 'Adobe Sign declined the authorization request. Please try again.',
  },
};

const UNKNOWN_COPY: CopyEntry = {
  kind: 'unknown',
  headline: 'Adobe Sign returned an unexpected response.',
  message: 'The authorization attempt did not complete in a recognized way. Please try again.',
};

// Pattern for the raw backend status: slug-friendly chars only, so it is
// always safe to emit as a DOM data-attribute marker even when "unknown".
const SAFE_STATUS_PATTERN = /^[a-z0-9-]+$/i;
const UNSAFE_STATUS_FALLBACK = 'unknown';

/**
 * Parse a `window.location.search` string and return the typed callback
 * result, or `null` if the marker is absent.
 */
export function parseAdobeSignCallbackResult(search: string): AdobeSignCallbackResult | null {
  if (!search) return null;
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const raw = params.get(ADOBE_SIGN_CALLBACK_PARAM);
  if (raw === null) return null;
  const safeStatus = SAFE_STATUS_PATTERN.test(raw) ? raw : UNSAFE_STATUS_FALLBACK;
  const entry = COPY_BY_STATUS[raw] ?? UNKNOWN_COPY;
  return {
    kind: entry.kind,
    backendStatus: safeStatus,
    headline: entry.headline,
    message: entry.message,
  };
}

/**
 * Return a query string (including leading '?', or '' when no params
 * remain) with the Adobe Sign callback marker removed. Used by the hook
 * to clean the URL via `history.replaceState` so a refresh doesn't
 * re-show the banner.
 */
export function stripAdobeSignCallbackFromSearch(search: string): string {
  if (!search) return '';
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  if (!params.has(ADOBE_SIGN_CALLBACK_PARAM)) return search;
  params.delete(ADOBE_SIGN_CALLBACK_PARAM);
  const next = params.toString();
  return next ? `?${next}` : '';
}
