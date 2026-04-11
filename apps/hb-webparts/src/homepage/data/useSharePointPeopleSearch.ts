/**
 * useSharePointPeopleSearch — SharePoint-aware people search adapter.
 *
 * Creates a PeopleSearchFn backed by the SharePoint
 * ClientPeoplePickerSearchUser REST API. Works with existing SharePoint
 * authentication — no Graph API permissions or AadTokenProvider needed.
 *
 * Returns undefined when no site URL is available (non-SPFx context).
 */
import { useCallback } from 'react';
import { getKudosListHostUrl } from './spContext.js';
import type { PersonEntry, PeopleSearchFn } from '@hbc/ui-kit/homepage';

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
 */
async function searchSharePointPeople(
  siteUrl: string,
  query: string,
): Promise<PersonEntry[]> {
  const endpoint = `${siteUrl}/_api/SP.UI.ApplicationPages.ClientPeoplePickerWebServiceInterface.ClientPeoplePickerSearchUser`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json;odata=nometadata',
      'Content-Type': 'application/json;odata=nometadata',
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

  if (!response.ok) return [];

  const body = (await response.json()) as {
    ClientPeoplePickerSearchUser?: string;
  };

  if (!body.ClientPeoplePickerSearchUser) return [];

  let results: ClientPeoplePickerResult[];
  try {
    results = JSON.parse(body.ClientPeoplePickerSearchUser) as ClientPeoplePickerResult[];
  } catch {
    return [];
  }

  return results
    .filter((r) => r.Key && r.DisplayText)
    .map((r) => ({
      upn: r.EntityData?.Email ?? r.Description ?? r.Key ?? '',
      displayName: r.DisplayText ?? '',
      jobTitle: r.EntityData?.Title ?? undefined,
      department: r.EntityData?.Department ?? undefined,
    }));
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
      } catch {
        return [];
      }
    },
    [siteUrl],
  ) as PeopleSearchFn | undefined;
}
