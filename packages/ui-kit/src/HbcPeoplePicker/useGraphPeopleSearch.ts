/**
 * useGraphPeopleSearch — Graph-backed people search adapter for HbcPeoplePicker.
 *
 * Creates a PeopleSearchFn that queries Microsoft Graph /users endpoint.
 * Accepts a token provider function so the caller controls auth (SPFx, MSAL, mock).
 *
 * Search strategy — human-name-first:
 *   Graph $filter supports startswith on displayName, mail, and
 *   userPrincipalName. The surname/givenName startswith filter is
 *   unsupported in some tenant configurations (confirmed via live
 *   evidence: Request_UnsupportedQuery). Therefore this adapter uses
 *   $filter for broad candidate retrieval, then applies client-side
 *   ranking via `rankPeopleResults` to promote human-name matches
 *   above email-only matches.
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

// ── Human-name-first ranking ─────────────────────────────────────────────

/**
 * Score a PersonEntry against a query for human-name-first ranking.
 *
 * Scoring tiers (lower = better match):
 *   0 — givenName or surname starts with query (strongest name signal)
 *   1 — displayName starts with query
 *   2 — givenName, surname, or displayName contains query
 *   3 — email/UPN starts with query
 *   4 — email/UPN contains query
 *   5 — no match (fallback)
 */
function scorePersonMatch(person: PersonEntry, queryLower: string): number {
  const given = person.givenName?.toLowerCase() ?? '';
  const last = person.surname?.toLowerCase() ?? '';
  const display = person.displayName.toLowerCase();
  const email = (person.mail ?? person.upn).toLowerCase();

  if (given.startsWith(queryLower) || last.startsWith(queryLower)) return 0;
  if (display.startsWith(queryLower)) return 1;
  if (given.includes(queryLower) || last.includes(queryLower) || display.includes(queryLower)) return 2;
  if (email.startsWith(queryLower)) return 3;
  if (email.includes(queryLower)) return 4;
  return 5;
}

/**
 * Rank people search results with human-name-first priority.
 *
 * Exported so environment-specific adapters (e.g. SharePoint) can
 * apply the same ranking after their own retrieval step.
 */
export function rankPeopleResults(results: PersonEntry[], query: string): PersonEntry[] {
  if (results.length <= 1) return results;
  const q = query.trim().toLowerCase();
  if (!q) return results;
  return [...results].sort((a, b) => scorePersonMatch(a, q) - scorePersonMatch(b, q));
}

// ── Graph adapter ────────────────────────────────────────────────────────

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
      const encoded = encodeURIComponent(query);
      const filter = `startswith(displayName,'${encoded}') or startswith(mail,'${encoded}') or startswith(userPrincipalName,'${encoded}')`;

      const url = `${GRAPH_USERS_ENDPOINT}?$filter=${filter}&$select=${GRAPH_SELECT_FIELDS}&$top=${MAX_RESULTS}&$orderby=displayName`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
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

      const entries = data.value
        .filter((u) => u.userPrincipalName || u.mail)
        .map((u): PersonEntry => ({
          upn: u.userPrincipalName ?? u.mail ?? '',
          displayName: u.displayName ?? u.userPrincipalName ?? '',
          id: u.id ?? undefined,
          givenName: u.givenName ?? undefined,
          surname: u.surname ?? undefined,
          mail: u.mail ?? undefined,
          jobTitle: u.jobTitle ?? undefined,
          department: u.department ?? undefined,
        }));

      return rankPeopleResults(entries, query);
    },
    [getAccessToken],
  ) as PeopleSearchFn | undefined;
}

// ── Static/mock adapter ──────────────────────────────────────────────────

/**
 * Creates a static/mock search adapter from a fixed list of people.
 * Useful for dev-harness, storybook, and UI-review mode.
 *
 * Searches givenName, surname, displayName, mail, and UPN —
 * human-name-first ranking applied automatically.
 */
export function createStaticPeopleSearch(people: PersonEntry[]): PeopleSearchFn {
  return async (query: string): Promise<PersonEntry[]> => {
    if (!query || query.trim().length < 2) return [];
    const lower = query.toLowerCase();
    const matched = people.filter(
      (p) =>
        p.displayName.toLowerCase().includes(lower) ||
        p.upn.toLowerCase().includes(lower) ||
        (p.givenName && p.givenName.toLowerCase().includes(lower)) ||
        (p.surname && p.surname.toLowerCase().includes(lower)) ||
        (p.mail && p.mail.toLowerCase().includes(lower)),
    );
    return rankPeopleResults(matched, query);
  };
}
