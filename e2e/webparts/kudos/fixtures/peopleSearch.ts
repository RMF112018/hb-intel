/**
 * Deterministic SharePoint people-search adapter fixtures.
 *
 * The harness exposes `window.__hbKudosPeopleSearchMode` which consumers
 * toggle via `setPeopleSearchMode()` below. Modes cover F8/F9/F10 plus
 * extra adversarial shapes required by prompt 04.
 */
import type { Page } from '@playwright/test';

export type PeopleSearchMode =
  | 'exact-match'
  | 'multiple-matches'
  | 'zero-matches'
  | 'malformed-partial'
  | 'photo-unavailable'
  | 'directory-error'
  | 'digest-failure';

export interface PeopleSearchResult {
  id: string;
  displayName: string;
  email?: string;
  hasPhoto: boolean;
}

export const PEOPLE_SEARCH_RESPONSES: Record<
  PeopleSearchMode,
  { results: PeopleSearchResult[]; errorKind?: 'directory' | 'digest' | null }
> = {
  'exact-match': {
    results: [
      { id: 'user-recipient', displayName: 'Ren Recipient', email: 'ren@example.com', hasPhoto: true },
    ],
    errorKind: null,
  },
  'multiple-matches': {
    results: [
      { id: 'user-recipient', displayName: 'Ren Recipient', email: 'ren@example.com', hasPhoto: true },
      {
        id: 'user-recipient-nophoto',
        displayName: 'Pat Recipient',
        email: 'pat@example.com',
        hasPhoto: false,
      },
      { id: 'user-reviewer', displayName: 'Rae Reviewer', email: 'rae@example.com', hasPhoto: true },
    ],
    errorKind: null,
  },
  'zero-matches': { results: [], errorKind: null },
  'malformed-partial': {
    // Shape the adapter must defensively handle (missing email, blank displayName).
    results: [
      { id: 'user-broken', displayName: '', hasPhoto: false },
      // @ts-expect-error intentional shape drift to prove defensive rendering
      { id: null, displayName: 'No-Id', hasPhoto: true },
    ] as PeopleSearchResult[],
    errorKind: null,
  },
  'photo-unavailable': {
    results: [
      {
        id: 'user-recipient-nophoto',
        displayName: 'Pat Recipient',
        email: 'pat@example.com',
        hasPhoto: false,
      },
    ],
    errorKind: null,
  },
  'directory-error': { results: [], errorKind: 'directory' },
  'digest-failure': { results: [], errorKind: 'digest' },
};

export async function setPeopleSearchMode(page: Page, mode: PeopleSearchMode): Promise<void> {
  await page.evaluate((m) => {
    const w = window as unknown as { __hbKudosPeopleSearchMode?: string };
    w.__hbKudosPeopleSearchMode = m;
  }, mode);
}
