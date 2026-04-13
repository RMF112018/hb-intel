/**
 * Kudos domain-adapter — read paths.
 *
 * Layer 2 boundary over Layer 1 (`@hbc/sharepoint-platform`) and the
 * app-local SharePoint readers. Consumers (Layer 3) should import
 * Kudos reads from `../kudosAdapter` rather than reaching into
 * `peopleCultureListSource` or `kudosGovernanceWriter` directly.
 */
import { fetchPeopleCultureListData } from '../peopleCultureListSource.js';
import { fetchKudosAuditTimeline } from '../kudosGovernanceWriter.js';
import type { KudosEntry } from '../../webparts/communicationsContracts.js';

export type { KudosEntry };

export interface GetKudosEntriesResult {
  /** Mapped Kudos entries from the live People Culture Kudos list. */
  entries: ReadonlyArray<KudosEntry>;
  /** Binding/network errors surfaced by the underlying reader (non-fatal). */
  errors: ReadonlyArray<string>;
}

/**
 * Read the Kudos slice from the People & Culture reader. Narrows the
 * broader PC read to the Kudos content family only.
 */
export async function getKudosEntries(siteUrl: string): Promise<GetKudosEntriesResult> {
  const { config, errors } = await fetchPeopleCultureListData(siteUrl);
  return {
    entries: config.kudos ?? [],
    errors,
  };
}

/**
 * Read the Kudos Audit Events timeline for a given app-side `KudosId`.
 * Thin re-export of the existing audit-timeline reader so the adapter
 * is the single Kudos domain front door.
 */
export { fetchKudosAuditTimeline as getKudosAuditTimeline };
