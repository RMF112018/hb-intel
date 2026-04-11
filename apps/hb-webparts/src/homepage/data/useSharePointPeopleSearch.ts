/**
 * useSharePointPeopleSearch — SharePoint-aware people search adapter.
 *
 * Backs the kudos composer people picker with tenant-wide principal
 * resolution via ClientPeoplePickerSearchUser. Uses `fetchRequestDigest`
 * (proven in submission and governance write paths) to authenticate the
 * POST request.
 *
 * Site URL resolution chain:
 *   1. Hosting site (`getSiteUrl()`) — preferred because the browser
 *      session established by SPFx is guaranteed valid here.
 *   2. Kudos list host (`getKudosListHostUrl()`) — fallback; the
 *      hardcoded HBCentral URL always provides a value. Same-origin
 *      SharePoint cookies are shared across site collections on the
 *      same tenant domain, so auth typically works here too.
 *
 * `ClientPeoplePickerSearchUser` is a tenant-wide directory search.
 * Results are org-wide regardless of which site URL routes the request.
 *
 * Instrumentation: every decision point logs to console.warn (always on)
 * so failures are never silent. Detailed debug logging is available via
 * `window.__HB_KUDOS_DEBUG__ = true`.
 */
import { useCallback, useRef } from 'react';
import { getSiteUrl, getKudosListHostUrl } from './spContext.js';
import { fetchRequestDigest } from './peopleCultureSubmissionSource.js';
import type { PersonEntry, PeopleSearchFn } from '@hbc/ui-kit/homepage';

declare global {
  interface Window {
    __HB_KUDOS_DEBUG__?: boolean;
  }
}

function isDebug(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.__HB_KUDOS_DEBUG__;
  } catch {
    return false;
  }
}

const TAG = '[HB Kudos People Search]';
const MAX_SUGGESTIONS = 10;

interface ClientPeoplePickerResult {
  Key?: string;
  DisplayText?: string;
  EntityData?: {
    Email?: string;
    Title?: string;
    Department?: string;
  };
  Description?: string;
}

/**
 * Resolve the best available site URL for the people search request.
 *
 * Prefers the hosting site (SPFx session guaranteed), falls back to the
 * Kudos list host (hardcoded HBCentral). Returns undefined only when
 * both are unavailable (non-SPFx context with no override).
 */
function resolvePeopleSearchSiteUrl(): string | undefined {
  const hostingSite = getSiteUrl();
  const kudosHost = getKudosListHostUrl();
  const resolved = hostingSite ?? kudosHost;

  if (isDebug()) {
    console.log(TAG, 'URL resolution:', {
      hostingSite: hostingSite ?? '(undefined)',
      kudosHost: kudosHost ?? '(undefined)',
      resolved: resolved ?? '(undefined)',
    });
  }

  return resolved;
}

/**
 * Search SharePoint users via ClientPeoplePickerSearchUser.
 *
 * This is the same API the native SharePoint people picker uses.
 * It searches the User Profile Service / Azure AD across the entire
 * tenant. The site URL is only the routing entry point — results are
 * org-wide regardless of which site collection is targeted.
 *
 * Requires X-RequestDigest for POST authentication.
 *
 * **Throws on any failure** — callers must handle errors and must
 * not conflate a thrown error with a genuine empty result set.
 */
async function searchSharePointPeople(
  siteUrl: string,
  query: string,
): Promise<PersonEntry[]> {
  const endpoint = `${siteUrl}/_api/SP.UI.ApplicationPages.ClientPeoplePickerWebServiceInterface.ClientPeoplePickerSearchUser`;

  console.log(TAG, 'dispatch:', { query, siteUrl, endpoint });

  let digest: string;
  try {
    digest = await fetchRequestDigest(siteUrl);
    if (isDebug()) console.log(TAG, 'digest acquired');
  } catch (digestErr) {
    console.warn(TAG, 'digest fetch failed for', siteUrl, digestErr);
    throw digestErr;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json;odata=nometadata',
      'Content-Type': 'application/json;odata=nometadata',
      'X-RequestDigest': digest,
    },
    body: JSON.stringify({
      queryParams: {
        QueryString: query,
        MaximumEntitySuggestions: MAX_SUGGESTIONS,
        AllowEmailAddresses: true,
        AllowOnlyEmailAddresses: false,
        PrincipalType: 1, // Users only
        PrincipalSource: 15, // All sources
        SharePointGroupID: 0,
      },
    }),
  });

  console.log(TAG, 'response:', response.status, response.statusText);

  if (!response.ok) {
    const msg = `People search failed: ${response.status} ${response.statusText}`;
    console.warn(TAG, msg);
    throw new Error(msg);
  }

  const body = (await response.json()) as {
    ClientPeoplePickerSearchUser?: string;
  };

  if (!body.ClientPeoplePickerSearchUser) {
    const msg = 'People search returned no ClientPeoplePickerSearchUser field';
    console.warn(TAG, msg, body);
    throw new Error(msg);
  }

  let results: ClientPeoplePickerResult[];
  try {
    results = JSON.parse(body.ClientPeoplePickerSearchUser) as ClientPeoplePickerResult[];
  } catch (parseErr) {
    const msg = 'Failed to parse ClientPeoplePickerSearchUser response';
    console.warn(TAG, msg, parseErr);
    throw new Error(msg);
  }

  const entries = results
    .filter((r) => r.Key && r.DisplayText)
    .map((r) => ({
      upn: r.EntityData?.Email ?? r.Description ?? r.Key ?? '',
      displayName: r.DisplayText ?? '',
      jobTitle: r.EntityData?.Title ?? undefined,
      department: r.EntityData?.Department ?? undefined,
    }));

  console.log(
    TAG, 'results:', entries.length,
    '| first 3:', entries.slice(0, 3).map((e) => `${e.displayName} <${e.upn}>`),
  );

  return entries;
}

/**
 * Hook returning a stable PeopleSearchFn backed by SharePoint
 * ClientPeoplePickerSearchUser.
 *
 * Returns `undefined` when no site URL is available at all (truly
 * non-SPFx context). When a URL is available, errors from the search
 * adapter propagate to the calling UI component — they are never
 * collapsed into empty arrays.
 */
export function useSharePointPeopleSearch(): PeopleSearchFn | undefined {
  // Resolve on every render so we pick up late-stored URLs.
  const siteUrl = resolvePeopleSearchSiteUrl();

  // Track whether we've logged the URL resolution (once per resolved value).
  const loggedUrlRef = useRef<string | undefined>(undefined);
  if (loggedUrlRef.current !== siteUrl) {
    loggedUrlRef.current = siteUrl;
    if (siteUrl) {
      console.log(TAG, 'hook: resolved site URL =', siteUrl);
    } else {
      console.warn(TAG, 'hook: NO site URL available — people search will be disabled');
    }
  }

  const searchFn = useCallback(
    async (query: string): Promise<PersonEntry[]> => {
      // Re-resolve at call time in case the URL became available after
      // the hook last rendered (module-level variable, not React state).
      const callTimeSiteUrl = resolvePeopleSearchSiteUrl();

      if (!callTimeSiteUrl) {
        console.warn(TAG, 'call: no site URL at call time — cannot dispatch. getSiteUrl()=', getSiteUrl(), 'getKudosListHostUrl()=', getKudosListHostUrl());
        throw new Error('People search unavailable: no SharePoint site URL resolved');
      }

      if (!query || query.trim().length < 2) {
        if (isDebug()) console.log(TAG, 'call: query too short, skipping:', JSON.stringify(query));
        return [];
      }

      console.log(TAG, 'call: dispatching search for', JSON.stringify(query.trim()), 'via', callTimeSiteUrl);
      return await searchSharePointPeople(callTimeSiteUrl, query.trim());
    },
    [siteUrl],
  );

  // Return undefined only when truly no URL is available, so the
  // consumer can render a text fallback instead of a broken picker.
  if (!siteUrl) {
    // Re-check at return time — the module variable may have been set
    // between render start and return.
    const lateCheck = resolvePeopleSearchSiteUrl();
    if (!lateCheck) return undefined;
  }

  return searchFn;
}
