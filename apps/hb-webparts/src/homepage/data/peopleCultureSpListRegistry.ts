/**
 * People & Culture SharePoint list registry.
 *
 * Phase-14 data-schema conformance audit (Prompt-after-Prompt-05).
 *
 * This module is the single place that knows about the three live
 * People & Culture SharePoint lists. It is the authoritative source
 * for binding by **list ID** instead of display title, which is the
 * rule the extracted schema report requires because the live list
 * titles and URL labels do not match 1:1.
 *
 * Critical live-reality (see
 * `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/people-culture-announcements-sharepoint-schema-report.md`):
 *
 *   - The list at URL `/sites/HBCentral/Lists/People Culture Announcements1/`
 *     has the **live title** `People Culture Announcements` and
 *     contains the announcements schema (AnnouncementPerson,
 *     AnnouncementType, Headline, Summary, PublishDateMapstopublishDate_x00).
 *     **This is the announcements list.**
 *
 *   - The list at URL `/sites/HBCentral/Lists/People Culture Announcements/`
 *     has the **live title** `People Culture Celebrations` and
 *     contains the celebrations schema (PersonName (UserMulti),
 *     CelebrationType, CelebrationDate, AnniversaryYears,
 *     HomepageEnabledGovernanceextensi).
 *     **This is the celebrations list.**
 *
 *   - `People Culture Kudos` is the recognition list (separate
 *     boundary, not read by the PC public webpart). Still registered
 *     here because the legacy merged PC webpart and the Kudos
 *     submission path both reference it.
 *
 * Phase 01 (synchronous-weaving-thacker): the generic list-descriptor
 * and endpoint-builder shape is now owned by
 * `@hbc/sharepoint-platform`. `PeopleCultureListDescriptor` extends
 * that shape with the People & Culture-specific `key` discriminator;
 * `buildPcListItemsEndpoint` / `buildPcListFieldsEndpoint` remain as
 * thin adapters so existing callers that pass a `PeopleCultureListKey`
 * keep working.
 */
import {
  buildListItemsEndpoint,
  buildListFieldsEndpoint,
  type SharePointListDescriptor,
} from '@hbc/sharepoint-platform';

/** A stable key for each known list. Consumers use this, never titles. */
export type PeopleCultureListKey = 'announcements' | 'celebrations' | 'kudos' | 'kudosAuditEvents';

export interface PeopleCultureListDescriptor extends SharePointListDescriptor {
  /** Stable app-facing key. Never change. */
  key: PeopleCultureListKey;
  /** Human-readable description of the list's purpose. */
  purpose: string;
  /**
   * Critical custom field internal names the adapter MUST see in
   * the live schema for the list to be considered usable. Used by
   * the runtime guardrails.
   */
  criticalFieldInternalNames: ReadonlyArray<string>;
}

/**
 * Authoritative People & Culture list registry. Verified against
 * the extracted schema artifacts in
 * `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/`.
 */
export const PEOPLE_CULTURE_LIST_REGISTRY: Readonly<
  Record<PeopleCultureListKey, PeopleCultureListDescriptor>
> = {
  announcements: {
    key: 'announcements',
    id: '2cd191fc-a7ea-49f2-af05-c395c2326e57',
    title: 'People Culture Announcements',
    urlSegment: 'People Culture Announcements1',
    purpose:
      'Person-centric announcements (promotions, new hires, baby, wedding, special). ' +
      'Single-user AnnouncementPerson field.',
    criticalFieldInternalNames: [
      'AnnouncementId',
      'AnnouncementPerson',
      'AnnouncementType',
      'Headline',
      'Summary',
      'HomepageEnabled',
      'PublishDateMapstopublishDate_x00',
    ],
  },
  celebrations: {
    key: 'celebrations',
    id: 'b87bf664-0531-418b-902c-726e5fb87083',
    title: 'People Culture Celebrations',
    urlSegment: 'People Culture Announcements',
    purpose:
      'Recurring and one-off celebrations (birthdays, anniversaries, promotions, ' +
      'weddings, engagements, babies). Multi-user PersonName field.',
    criticalFieldInternalNames: [
      'AnnouncementId',
      'PersonName',
      'CelebrationType',
      'CelebrationDate',
      'HomepageEnabledGovernanceextensi',
    ],
  },
  kudos: {
    key: 'kudos',
    id: 'b01fa4d2-29b1-4e11-b581-4cb3d0951a79',
    title: 'People Culture Kudos',
    urlSegment: 'People Culture Kudos',
    purpose:
      'HB Kudos recognition list. Owned by the HB Kudos product boundary. ' +
      'WorkflowStatus is the authoritative publish/approval state — not _ModerationStatus.',
    criticalFieldInternalNames: [
      'KudosId',
      'Headline',
      'Excerpt',
      'SubmittedBy',
      'SubmittedDate',
      'WorkflowStatus',
      'WasEverPublished',
      'HomepageEnabled',
      'IsPinned',
      'CelebrateCount',
    ],
  },
  kudosAuditEvents: {
    key: 'kudosAuditEvents',
    id: 'c031c08f-25ac-407c-aa15-650b791efeb0',
    title: 'Kudos Audit Events',
    urlSegment: 'Kudos Audit Events',
    purpose:
      'Append-only audit journal for the People Culture Kudos list. ' +
      'Keyed by KudosId; EventType is the authoritative event kind.',
    criticalFieldInternalNames: ['KudosId', 'EventType', 'Actor', 'EventAt'],
  },
};

/**
 * Build the REST endpoint for fetching items from a PC list by GUID.
 * Thin adapter over `@hbc/sharepoint-platform`'s `buildListItemsEndpoint`
 * that accepts either a `PeopleCultureListKey` or a descriptor. Always
 * binds by GUID so title drift cannot cross-bind the adapter to the
 * wrong list.
 */
export function buildPcListItemsEndpoint(
  siteUrl: string,
  list: PeopleCultureListDescriptor | PeopleCultureListKey,
  query?: { select?: string; expand?: string; filter?: string; top?: number },
): string {
  const descriptor =
    typeof list === 'string' ? PEOPLE_CULTURE_LIST_REGISTRY[list] : list;
  return buildListItemsEndpoint(siteUrl, descriptor, query);
}

/**
 * Build the REST endpoint for fetching the field metadata of a PC
 * list by GUID. Thin adapter over `buildListFieldsEndpoint`.
 */
export function buildPcListFieldsEndpoint(
  siteUrl: string,
  list: PeopleCultureListDescriptor | PeopleCultureListKey,
  filter?: string,
): string {
  const descriptor =
    typeof list === 'string' ? PEOPLE_CULTURE_LIST_REGISTRY[list] : list;
  return buildListFieldsEndpoint(siteUrl, descriptor, filter);
}

/** Convenience lookup. */
export function getPeopleCultureList(
  key: PeopleCultureListKey,
): PeopleCultureListDescriptor {
  return PEOPLE_CULTURE_LIST_REGISTRY[key];
}
