/**
 * useGraphPeopleSearch — Graph-backed people search adapter for HbcPeoplePicker.
 *
 * Creates a PeopleSearchFn that queries Microsoft Graph /users endpoint.
 * Accepts a token provider function so the caller controls auth (SPFx, MSAL, mock).
 *
 * Usage:
 *   const searchPeople = useGraphPeopleSearch(getGraphToken);
 *   <HbcPeoplePicker searchPeople={searchPeople} ... />
 */
import { useCallback } from 'react';
import type { PersonEntry, PeopleSearchFn } from './types.js';

const GRAPH_USERS_ENDPOINT = 'https://graph.microsoft.com/v1.0/users';
const GRAPH_SELECT_FIELDS = 'id,displayName,givenName,surname,mail,userPrincipalName,jobTitle,department';
const MAX_RESULTS = 10;

/**
 * Creates a stable PeopleSearchFn backed by Microsoft Graph /users.
 *
 * @param getAccessToken - Async function returning a Graph-scoped Bearer token.
 *   In SPFx: use createSpfxGraphTokenProvider() from @hbc/auth/spfx.
 *   In PWA: use MSAL acquireTokenSilent() with Graph scope.
 *   In tests: return a mock token or use the fallback adapter.
 */
export function useGraphPeopleSearch(
  getAccessToken?: () => Promise<string>,
): PeopleSearchFn | undefined {
  return useCallback(
    async (query: string): Promise<PersonEntry[]> => {
      if (!getAccessToken) return [];
      if (!query || query.trim().length < 2) return [];

      const token = await getAccessToken();
      const filter = `startswith(displayName,'${encodeURIComponent(query)}') or startswith(mail,'${encodeURIComponent(query)}') or startswith(userPrincipalName,'${encodeURIComponent(query)}')`;

      const url = `${GRAPH_USERS_ENDPOINT}?$filter=${filter}&$select=${GRAPH_SELECT_FIELDS}&$top=${MAX_RESULTS}&$orderby=displayName`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Graceful degradation — return empty results rather than throw
        console.warn(`[HbcPeoplePicker] Graph search failed: ${response.status} ${response.statusText}`);
        return [];
      }

      const data = (await response.json()) as {
        value: Array<{
          id?: string;
          displayName?: string;
          givenName?: string;
          surname?: string;
          mail?: string;
          userPrincipalName?: string;
          jobTitle?: string;
          department?: string;
        }>;
      };

      return data.value
        .filter((u) => u.userPrincipalName || u.mail)
        .map((u) => ({
          upn: u.userPrincipalName ?? u.mail ?? '',
          displayName: u.displayName ?? u.userPrincipalName ?? '',
          id: u.id ?? undefined,
          givenName: u.givenName ?? undefined,
          surname: u.surname ?? undefined,
          mail: u.mail ?? undefined,
          jobTitle: u.jobTitle ?? undefined,
          department: u.department ?? undefined,
        }));
    },
    [getAccessToken],
  ) as PeopleSearchFn | undefined;
}

/**
 * Creates a static/mock search adapter from a fixed list of people.
 * Useful for dev-harness, storybook, and UI-review mode.
 */
export function createStaticPeopleSearch(people: PersonEntry[]): PeopleSearchFn {
  return async (query: string): Promise<PersonEntry[]> => {
    if (!query || query.trim().length < 2) return [];
    const lower = query.toLowerCase();
    return people.filter(
      (p) =>
        p.displayName.toLowerCase().includes(lower) ||
        p.upn.toLowerCase().includes(lower),
    );
  };
}
