import {
  ADOBE_SIGN_LIVE_OAUTH_DEFAULT_TIMEOUT_MS,
  isAllowedAdobeAccessPoint,
} from './adobe-sign-live-oauth-service.js';
import type {
  AdobeSignActionLinkClientInput,
  AdobeSignActionLinkClientResult,
  IAdobeSignActionLinkClient,
} from './adobe-sign-action-link-client.js';

export const ADOBE_SIGN_AGREEMENT_SIGNING_URLS_PATH_SUFFIX = '/signingUrls' as const;

export type AdobeSignLiveFetch = typeof globalThis.fetch;

export interface AdobeSignLiveActionLinkClientDeps {
  readonly fetch?: AdobeSignLiveFetch;
  readonly timeoutMs?: number;
}

interface AdobeSignSigningUrlItem {
  readonly email: string;
  readonly esignUrl: string;
}

function trimTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function parseSigningUrlItems(value: unknown): readonly AdobeSignSigningUrlItem[] | undefined {
  if (value === null || typeof value !== 'object') return undefined;

  const root = value as Record<string, unknown>;
  const sets = root.signingUrlSetInfos;
  if (!Array.isArray(sets)) return undefined;

  const items: AdobeSignSigningUrlItem[] = [];
  for (const setInfo of sets) {
    if (setInfo === null || typeof setInfo !== 'object') continue;
    const urls = (setInfo as Record<string, unknown>).signingUrls;
    if (!Array.isArray(urls)) continue;

    for (const rawItem of urls) {
      if (rawItem === null || typeof rawItem !== 'object') continue;
      const candidate = rawItem as Record<string, unknown>;
      if (!isNonEmptyString(candidate.esignUrl)) continue;
      if (!isNonEmptyString(candidate.email)) continue;
      items.push({
        email: candidate.email.trim().toLowerCase(),
        esignUrl: candidate.esignUrl,
      });
    }
  }

  return items;
}

function pickSigningUrl(
  items: readonly AdobeSignSigningUrlItem[],
  actorUpn: string | undefined,
): { status: 'ok'; redirectUrl: string } | { status: 'no-action-url' | 'no-recipient-match' } {
  if (items.length === 0) {
    return { status: 'no-action-url' };
  }

  const normalizedUpn = actorUpn?.trim().toLowerCase();
  if (normalizedUpn) {
    const exactMatches = items.filter((item) => item.email === normalizedUpn);
    if (exactMatches.length > 0) {
      return {
        status: 'ok',
        redirectUrl: exactMatches[0]!.esignUrl,
      };
    }
  }

  if (items.length === 1) {
    return { status: 'ok', redirectUrl: items[0]!.esignUrl };
  }

  return { status: 'no-recipient-match' };
}

export function createAdobeSignLiveActionLinkClient(
  deps: AdobeSignLiveActionLinkClientDeps = {},
): IAdobeSignActionLinkClient {
  const fetchImpl = deps.fetch ?? globalThis.fetch;
  const timeoutMs = deps.timeoutMs ?? ADOBE_SIGN_LIVE_OAUTH_DEFAULT_TIMEOUT_MS;

  return {
    async resolveActionLink(input: AdobeSignActionLinkClientInput): Promise<AdobeSignActionLinkClientResult> {
      if (!isAllowedAdobeAccessPoint(input.apiAccessPoint)) {
        return { status: 'unreachable', reason: 'invalid-access-point' };
      }

      const encodedAgreementId = encodeURIComponent(input.agreementId);
      const url = `${trimTrailingSlash(input.apiAccessPoint)}/api/rest/v6/agreements/${encodedAgreementId}${ADOBE_SIGN_AGREEMENT_SIGNING_URLS_PATH_SUFFIX}`;

      const controller = new AbortController();
      const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

      let response: Response;
      try {
        response = await fetchImpl(url, {
          method: 'GET',
          headers: {
            authorization: `Bearer ${input.accessToken}`,
            accept: 'application/json',
          },
          signal: controller.signal,
        });
      } catch (err: unknown) {
        const name = (err as { name?: string }).name;
        if (name === 'AbortError') {
          return { status: 'unreachable', reason: 'timeout' };
        }
        return { status: 'unreachable', reason: 'network' };
      } finally {
        clearTimeout(timeoutHandle);
      }

      if (response.status === 401 || response.status === 403) {
        return { status: 'unauthorized' };
      }
      if (response.status === 404) {
        return { status: 'not-ready' };
      }
      if (response.status === 429) {
        return { status: 'rate-limited' };
      }
      if (response.status >= 500) {
        return { status: 'unreachable', reason: 'http-5xx', providerStatusCode: response.status };
      }
      if (response.status >= 400) {
        return { status: 'unreachable', reason: 'http-4xx', providerStatusCode: response.status };
      }

      let parsed: unknown;
      try {
        parsed = await response.json();
      } catch {
        return { status: 'unreachable', reason: 'malformed-response' };
      }

      const parsedItems = parseSigningUrlItems(parsed);
      if (!parsedItems) {
        return { status: 'unreachable', reason: 'malformed-response' };
      }

      const picked = pickSigningUrl(parsedItems, input.actor.upn);
      if (picked.status !== 'ok') {
        return picked;
      }

      return {
        status: 'ok',
        redirectUrl: picked.redirectUrl,
      };
    },
  };
}
