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
 */
import { useCallback, useRef } from 'react';
import { getSiteUrl, getKudosListHostUrl } from './spContext.js';
import { fetchRequestDigest } from './peopleCultureSubmissionSource.js';
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
  // Shape 1b: already-parsed array
  if (Array.isArray(body.ClientPeoplePickerSearchUser)) {
    return body.ClientPeoplePickerSearchUser as unknown[];
  }

  // Shape 2: static method value wrapper — { value: "..." }
  if (typeof body.value === 'string') {
    return body.value;
  }
  // Shape 2b: already-parsed array
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

  console.warn(TAG, 'dispatch:', { query, siteUrl, endpoint });

  let digest: string;
  try {
    digest = await fetchRequestDigest(siteUrl);
    console.warn(TAG, 'digest acquired');
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

  console.warn(TAG, 'response:', response.status, response.statusText, '| ok:', response.ok);

  if (!response.ok) {
    const msg = `People search failed: ${response.status} ${response.statusText}`;
    console.warn(TAG, msg);
    throw new Error(msg);
  }

  // A. Read raw response body as text first — never skip this.
  const rawText = await response.text();
  console.warn(TAG, 'response-raw-body', {
    length: rawText.length,
    first500: rawText.slice(0, 500),
  });

  // B. Parse outer JSON
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawText) as Record<string, unknown>;
  } catch (outerParseErr) {
    console.warn(TAG, 'response-outer-parse FAILED', { rawFirst200: rawText.slice(0, 200), error: outerParseErr });
    throw new Error('People search: outer JSON parse failed');
  }

  const outerKeys = Object.keys(body);
  console.warn(TAG, 'response-outer-parse', {
    keys: outerKeys,
    hasClientPeoplePickerSearchUser: 'ClientPeoplePickerSearchUser' in body,
    hasValue: 'value' in body,
    hasD: 'd' in body,
    typeOfClientPPS: typeof body.ClientPeoplePickerSearchUser,
    typeOfValue: typeof body.value,
  });

  // C. Extract principal payload from whichever shape SP returned
  const principalPayload = extractPrincipalPayload(body);

  if (principalPayload === undefined || principalPayload === null || principalPayload === '') {
    const msg = 'People search: no principal payload found in response body';
    console.warn(TAG, msg, { outerKeys, bodySnapshot: JSON.stringify(body).slice(0, 300) });
    throw new Error(msg);
  }

  // D. Parse principals — either from string or already-parsed array
  let rawPrincipals: ClientPeoplePickerResult[];

  if (Array.isArray(principalPayload)) {
    // Already an array (some SP builds return pre-parsed)
    rawPrincipals = principalPayload as ClientPeoplePickerResult[];
    console.warn(TAG, 'principals-raw-string', '(already array, no parse needed)', { count: rawPrincipals.length });
  } else {
    // It's a JSON string that needs parsing
    console.warn(TAG, 'principals-raw-string', {
      length: principalPayload.length,
      first300: principalPayload.slice(0, 300),
    });

    try {
      rawPrincipals = JSON.parse(principalPayload) as ClientPeoplePickerResult[];
      console.warn(TAG, 'principals-parse-success', {
        count: rawPrincipals.length,
        first3: rawPrincipals.slice(0, 3).map((r) => ({
          Key: r.Key?.slice(0, 60),
          DisplayText: r.DisplayText,
          Email: r.EntityData?.Email,
        })),
      });
    } catch (parseErr) {
      console.warn(TAG, 'principals-parse-failure', {
        error: parseErr,
        rawFirst200: principalPayload.slice(0, 200),
      });
      throw new Error('People search: principal JSON parse failed');
    }
  }

  // E. Map raw principals to PersonEntry[]
  console.warn(TAG, 'mapping-start', { rawCount: rawPrincipals.length });

  const entries: PersonEntry[] = [];
  for (let i = 0; i < rawPrincipals.length; i++) {
    const r = rawPrincipals[i];
    if (!r.Key && !r.DisplayText) {
      console.warn(TAG, 'mapping-drop', { index: i, reason: 'missing Key and DisplayText', raw: JSON.stringify(r).slice(0, 200) });
      continue;
    }
    const displayName = r.DisplayText ?? r.Key ?? '';

    // Best-effort parse of givenName/surname from DisplayText.
    // SharePoint principal DisplayText is typically "First Last".
    const nameParts = displayName.trim().split(/\s+/);
    const givenName = nameParts.length >= 2 ? nameParts[0] : undefined;
    const surname = nameParts.length >= 2 ? nameParts.slice(1).join(' ') : undefined;

    const entry: PersonEntry = {
      upn: r.EntityData?.Email ?? r.Description ?? r.Key ?? '',
      displayName,
      givenName,
      surname,
      mail: r.EntityData?.Email ?? undefined,
      jobTitle: r.EntityData?.Title ?? undefined,
      department: r.EntityData?.Department ?? undefined,
    };
    entries.push(entry);
  }

  console.warn(TAG, 'mapping-result', {
    rawCount: rawPrincipals.length,
    mappedCount: entries.length,
    droppedCount: rawPrincipals.length - entries.length,
    first3: entries.slice(0, 3).map((e) => `${e.displayName} <${e.upn}>`),
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

  const loggedUrlRef = useRef<string | undefined>(undefined);
  if (loggedUrlRef.current !== siteUrl) {
    loggedUrlRef.current = siteUrl;
    if (siteUrl) {
      console.warn(TAG, 'hook: resolved site URL =', siteUrl);
    } else {
      console.warn(TAG, 'hook: NO site URL available — people search will be disabled');
    }
  }

  const searchFn = useCallback(
    async (query: string): Promise<PersonEntry[]> => {
      const callTimeSiteUrl = resolvePeopleSearchSiteUrl();

      if (!callTimeSiteUrl) {
        console.warn(TAG, 'call: no site URL at call time — cannot dispatch. getSiteUrl()=', getSiteUrl(), 'getKudosListHostUrl()=', getKudosListHostUrl());
        throw new Error('People search unavailable: no SharePoint site URL resolved');
      }

      if (!query || query.trim().length < 2) {
        if (isDebug()) console.log(TAG, 'call: query too short, skipping:', JSON.stringify(query));
        return [];
      }

      console.warn(TAG, 'call: dispatching search for', JSON.stringify(query.trim()), 'via', callTimeSiteUrl);
      return await searchSharePointPeople(callTimeSiteUrl, query.trim());
    },
    [siteUrl],
  );

  if (!siteUrl) {
    const lateCheck = resolvePeopleSearchSiteUrl();
    if (!lateCheck) return undefined;
  }

  return searchFn;
}
