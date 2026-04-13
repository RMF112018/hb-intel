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
 * Response shape handling: SharePoint can return the principal string
 * under several property names depending on OData metadata settings:
 *   - `ClientPeoplePickerSearchUser` (common with odata=nometadata)
 *   - `value` (common with some SP Online builds for static methods)
 *   - `d.ClientPeoplePickerSearchUser` (odata=verbose)
 * The adapter handles all three shapes.
 *
 * Phase-19 Wave 2 scrub: all production console traces are now gated
 * behind the `__HB_KUDOS_DEBUG__` window flag via the `debug()` helper.
 * The previous adapter emitted ~15 `console.warn` calls per search in
 * production; those are now silent unless diagnostics are explicitly
 * enabled. Genuine failures still throw — callers own error handling.
 */
import { useCallback, useEffect, useRef } from 'react';
import { getSiteUrl, getKudosListHostUrl } from './spContext.js';
import { fetchRequestDigest } from '@hbc/sharepoint-platform';
import { rankPeopleResults } from '@hbc/ui-kit/homepage';
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

/**
 * Gated debug log. Silent by default; opt in via `window.__HB_KUDOS_DEBUG__`.
 */
function debug(...args: unknown[]): void {
  if (!isDebug()) return;
  // eslint-disable-next-line no-console
  console.log(TAG, ...args);
}

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
 */
function resolvePeopleSearchSiteUrl(): string | undefined {
  const hostingSite = getSiteUrl();
  const kudosHost = getKudosListHostUrl();
  const resolved = hostingSite ?? kudosHost;

  debug('URL resolution:', {
    hostingSite: hostingSite ?? '(undefined)',
    kudosHost: kudosHost ?? '(undefined)',
    resolved: resolved ?? '(undefined)',
  });

  return resolved;
}

/**
 * Extract the principal JSON string from the SharePoint response body.
 *
 * SharePoint returns the people-picker results under different property
 * names depending on the OData format negotiated. This function checks
 * all known shapes and returns the raw string (or array) for parsing.
 */
function extractPrincipalPayload(body: Record<string, unknown>): string | unknown[] | undefined {
  // Shape 1: odata=nometadata — { ClientPeoplePickerSearchUser: "..." }
  if (typeof body.ClientPeoplePickerSearchUser === 'string') {
    return body.ClientPeoplePickerSearchUser;
  }
  if (Array.isArray(body.ClientPeoplePickerSearchUser)) {
    return body.ClientPeoplePickerSearchUser as unknown[];
  }

  // Shape 2: static method value wrapper — { value: "..." }
  if (typeof body.value === 'string') {
    return body.value;
  }
  if (Array.isArray(body.value)) {
    return body.value as unknown[];
  }

  // Shape 3: odata=verbose — { d: { ClientPeoplePickerSearchUser: "..." } }
  if (body.d && typeof body.d === 'object') {
    const d = body.d as Record<string, unknown>;
    if (typeof d.ClientPeoplePickerSearchUser === 'string') {
      return d.ClientPeoplePickerSearchUser;
    }
    if (Array.isArray(d.ClientPeoplePickerSearchUser)) {
      return d.ClientPeoplePickerSearchUser as unknown[];
    }
  }

  return undefined;
}

/**
 * Search SharePoint users via ClientPeoplePickerSearchUser.
 *
 * Throws on any failure. Callers must handle errors and must not
 * conflate a thrown error with a genuine empty result set.
 */
async function searchSharePointPeople(
  siteUrl: string,
  query: string,
): Promise<PersonEntry[]> {
  const endpoint = `${siteUrl}/_api/SP.UI.ApplicationPages.ClientPeoplePickerWebServiceInterface.ClientPeoplePickerSearchUser`;

  debug('dispatch:', { query, siteUrl, endpoint });

  const digest = await fetchRequestDigest(siteUrl);
  debug('digest acquired');

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

  debug('response:', response.status, response.statusText, '| ok:', response.ok);

  if (!response.ok) {
    throw new Error(`People search failed: ${response.status} ${response.statusText}`);
  }

  // A. Read raw response body as text first — never skip this.
  const rawText = await response.text();
  debug('response-raw-body length:', rawText.length);

  // B. Parse outer JSON
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawText) as Record<string, unknown>;
  } catch {
    throw new Error('People search: outer JSON parse failed');
  }

  debug('response-outer-parse keys:', Object.keys(body));

  // C. Extract principal payload from whichever shape SP returned
  const principalPayload = extractPrincipalPayload(body);

  if (principalPayload === undefined || principalPayload === null || principalPayload === '') {
    throw new Error('People search: no principal payload found in response body');
  }

  // D. Parse principals — either from string or already-parsed array
  let rawPrincipals: ClientPeoplePickerResult[];

  if (Array.isArray(principalPayload)) {
    rawPrincipals = principalPayload as ClientPeoplePickerResult[];
    debug('principals: already-array, count=', rawPrincipals.length);
  } else {
    try {
      rawPrincipals = JSON.parse(principalPayload) as ClientPeoplePickerResult[];
      debug('principals: parse-success, count=', rawPrincipals.length);
    } catch {
      throw new Error('People search: principal JSON parse failed');
    }
  }

  // E. Map raw principals to PersonEntry[]
  const entries: PersonEntry[] = [];
  for (const r of rawPrincipals) {
    if (!r.Key && !r.DisplayText) continue;
    const displayName = r.DisplayText ?? r.Key ?? '';

    // Best-effort parse of givenName/surname from DisplayText.
    // SharePoint principal DisplayText is typically "First Last".
    const nameParts = displayName.trim().split(/\s+/);
    const givenName = nameParts.length >= 2 ? nameParts[0] : undefined;
    const surname = nameParts.length >= 2 ? nameParts.slice(1).join(' ') : undefined;

    entries.push({
      upn: r.EntityData?.Email ?? r.Description ?? r.Key ?? '',
      displayName,
      givenName,
      surname,
      mail: r.EntityData?.Email ?? undefined,
      jobTitle: r.EntityData?.Title ?? undefined,
      department: r.EntityData?.Department ?? undefined,
    });
  }

  debug('mapping-result:', {
    rawCount: rawPrincipals.length,
    mappedCount: entries.length,
    droppedCount: rawPrincipals.length - entries.length,
  });

  return rankPeopleResults(entries, query);
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
  const siteUrl = resolvePeopleSearchSiteUrl();

  // One-time debug trace when the resolved site URL changes — runs
  // after commit so we do not emit side effects during render.
  const loggedUrlRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (loggedUrlRef.current === siteUrl) return;
    loggedUrlRef.current = siteUrl;
    if (siteUrl) {
      debug('hook: resolved site URL =', siteUrl);
    } else {
      debug('hook: no site URL resolved — people search disabled');
    }
  }, [siteUrl]);

  const searchFn = useCallback(
    async (query: string): Promise<PersonEntry[]> => {
      const callTimeSiteUrl = resolvePeopleSearchSiteUrl();

      if (!callTimeSiteUrl) {
        throw new Error('People search unavailable: no SharePoint site URL resolved');
      }

      if (!query || query.trim().length < 2) {
        return [];
      }

      return await searchSharePointPeople(callTimeSiteUrl, query.trim());
    },
    [],
  );

  if (!siteUrl) {
    const lateCheck = resolvePeopleSearchSiteUrl();
    if (!lateCheck) return undefined;
  }

  return searchFn;
}
