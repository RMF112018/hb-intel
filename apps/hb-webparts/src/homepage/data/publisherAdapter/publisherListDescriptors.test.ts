/**
 * Tenant list-title drift guard.
 *
 * The publisher binds to SharePoint lists by Title (`getbytitle(...)`).
 * If any descriptor silently reverts to the obsolete
 * `Project Spotlight *` names, every read/write will fail against the
 * live tenant at HBCentral. This suite pins each descriptor's
 * `displayName` to the authoritative tenant list title from
 *   docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md
 * so Phase-02 Prompt-01's realignment cannot regress unnoticed.
 */
import { describe, expect, it } from 'vitest';
import {
  PUBLISHER_LIST_HOST_SITE_URL,
  PUBLISHER_LISTS,
  type PublisherListKey,
} from './publisherListDescriptors';

const EXPECTED_TENANT_TITLES: Readonly<Record<PublisherListKey, string>> = {
  posts: 'HB Articles',
  teamMembers: 'HB Article Team Members',
  media: 'HB Article Media',
  templateRegistry: 'HB Article Template Registry',
  pageBindings: 'HB Article Destination Pages',
  workflowHistory: 'HB Article Workflow History',
  publishingErrors: 'HB Article Publishing Errors',
};

describe('publisherListDescriptors — tenant title binding', () => {
  it.each(Object.entries(EXPECTED_TENANT_TITLES) as Array<[PublisherListKey, string]>)(
    'binds %s to the tenant title "%s"',
    (key, expectedTitle) => {
      expect(PUBLISHER_LISTS[key].displayName).toBe(expectedTitle);
    },
  );

  it('no descriptor uses an obsolete "Project Spotlight *" title', () => {
    for (const descriptor of Object.values(PUBLISHER_LISTS)) {
      expect(descriptor.displayName.startsWith('Project Spotlight')).toBe(false);
    }
  });

  it('every descriptor is scoped to the HBCentral host site', () => {
    for (const descriptor of Object.values(PUBLISHER_LISTS)) {
      expect(descriptor.hostSiteUrl).toBe(PUBLISHER_LIST_HOST_SITE_URL);
    }
  });
});
