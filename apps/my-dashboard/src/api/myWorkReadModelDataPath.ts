/**
 * Production acceptance guard for fixture-data leakage on the
 * `backend-live` data path.
 *
 * The Adobe Sign action queue fixtures used by `ui-review` and by the
 * backend-unavailable fallback ship a fixed set of agreement names. If
 * those agreement names appear in a queue rendered on the `backend-live`
 * data path, the hosted surface is showing fixture-shaped rows under a
 * label that implies real backend data — a production-acceptance
 * failure. The detector and assertion guard below derive the known-title
 * set directly from the fixture so the contract cannot drift.
 *
 * Pure: no React, no I/O.
 *
 * @module api/myWorkReadModelDataPath
 */

import type { MyWorkReadModelDataPath } from '@hbc/models/myWork';
import {
  ADOBE_SIGN_QUEUE_AVAILABLE,
  ADOBE_SIGN_QUEUE_AVAILABLE_PAGED,
} from '@hbc/models/myWork/fixtures';

export type { MyWorkReadModelDataPath } from '@hbc/models/myWork';

const collectFixtureTitles = (): ReadonlySet<string> => {
  const set = new Set<string>();
  for (const item of ADOBE_SIGN_QUEUE_AVAILABLE.data.items) {
    set.add(item.agreementName);
  }
  for (const item of ADOBE_SIGN_QUEUE_AVAILABLE_PAGED.data.items) {
    set.add(item.agreementName);
  }
  return set;
};

/**
 * Agreement-name strings emitted by the shipped Adobe Sign action queue
 * fixtures. Derived from the live fixture arrays — no hand-maintained
 * list — so the detector cannot drift from the fixtures.
 */
export const KNOWN_FIXTURE_AGREEMENT_TITLES: ReadonlySet<string> = collectFixtureTitles();

/**
 * Returns the subset of agreement names in `items` that match known
 * fixture titles. Empty when the items look real.
 */
export function detectFixtureTitleLeakage(
  items: readonly { readonly agreementName: string }[],
): readonly string[] {
  const leaked: string[] = [];
  for (const item of items) {
    if (KNOWN_FIXTURE_AGREEMENT_TITLES.has(item.agreementName)) {
      leaked.push(item.agreementName);
    }
  }
  return leaked;
}

export interface FixtureLeakAssertionInput {
  readonly dataPath: MyWorkReadModelDataPath | undefined;
  readonly items: readonly { readonly agreementName: string }[];
}

/**
 * Throws when an envelope claims the `backend-live` data path but the
 * rendered items contain known fixture titles — the production
 * acceptance failure this prompt guards against. No-op for any other
 * data path (fixture-ui-review and backend-unavailable-fallback are
 * allowed to show fixture rows; they are explicit-fixture postures).
 */
export function assertNoFixtureTitleLeakageOnBackendLive(input: FixtureLeakAssertionInput): void {
  if (input.dataPath !== 'backend-live') return;
  const leaked = detectFixtureTitleLeakage(input.items);
  if (leaked.length === 0) return;
  throw new Error(
    `My Work production acceptance: fixture-title leakage on backend-live data path. Offending titles: ${leaked
      .map((t) => JSON.stringify(t))
      .join(', ')}`,
  );
}
