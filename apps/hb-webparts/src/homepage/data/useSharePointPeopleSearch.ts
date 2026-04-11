/**
 * useSharePointPeopleSearch — SharePoint-aware people search adapter.
 *
 * Backs the kudos composer people picker with tenant-wide principal
 * resolution via ClientPeoplePickerSearchUser. Uses `fetchRequestDigest`
 * (proven in submission and governance write paths) to authenticate the
 * POST request.
 *
 * Debug mode: set `window.__HB_KUDOS_DEBUG__ = true` in the browser
 * console to log query text, endpoint, result count, first principals,
 * and error details. Safe to leave disabled in production.
 */
import { useCallback } from 'react';
import { getKudosListHostUrl } from './spContext.js';
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
 * Search SharePoint users via ClientPeoplePickerSearchUser.
 *
 * This is the same API the native SharePoint people picker uses.
 * It searches the User Profile Service / User Information List and
 * returns matching people with display names, emails, and metadata.
 *
 * Requires X-RequestDigest for POST authentication.
 */
async function searchSharePointPeople(
  siteUrl: string,
  query: string,
): Promise<PersonEntry[]> {
  const endpoint = `${siteUrl}/_api/SP.UI.ApplicationPages.ClientPeoplePickerWebServiceInterface.ClientPeoplePickerSearchUser`;

  const digest = await fetchRequestDigest(siteUrl);

  if (isDebug()) {
    console.log('[HB Kudos People Search] query:', query, '| endpoint:', endpoint);
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

  if (!response.ok) {
    const msg = `People search failed: ${response.status} ${response.statusText}`;
    if (isDebug()) console.error('[HB Kudos People Search]', msg);
    throw new Error(msg);
  }

  const body = (await response.json()) as {
    ClientPeoplePickerSearchUser?: string;
  };

  if (!body.ClientPeoplePickerSearchUser) {
    const msg = 'People search returned no ClientPeoplePickerSearchUser field';
    if (isDebug()) console.warn('[HB Kudos People Search]', msg);
    throw new Error(msg);
  }

  let results: ClientPeoplePickerResult[];
  try {
    results = JSON.parse(body.ClientPeoplePickerSearchUser) as ClientPeoplePickerResult[];
  } catch (parseErr) {
    const msg = 'Failed to parse ClientPeoplePickerSearchUser response';
    if (isDebug()) console.error('[HB Kudos People Search]', msg, parseErr);
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

  if (isDebug()) {
    console.log(
      '[HB Kudos People Search] results:', entries.length,
      '| first 3:', entries.slice(0, 3).map((e) => `${e.displayName} <${e.upn}>`),
    );
  }

  return entries;
}

/**
 * Hook returning a stable PeopleSearchFn backed by SharePoint
 * ClientPeoplePickerSearchUser. Returns undefined when no site URL
 * is available.
 */
export function useSharePointPeopleSearch(): PeopleSearchFn | undefined {
  const siteUrl = getKudosListHostUrl();

  return useCallback(
    async (query: string): Promise<PersonEntry[]> => {
      if (!siteUrl || !query || query.trim().length < 2) return [];
      try {
        return await searchSharePointPeople(siteUrl, query.trim());
      } catch (err) {
        if (isDebug()) {
          console.error('[HB Kudos People Search] hook-level error:', err);
        }
        return [];
      }
    },
    [siteUrl],
  ) as PeopleSearchFn | undefined;
}
