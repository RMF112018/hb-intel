import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@hbc/sharepoint-platform', () => ({
  fetchRequestDigest: vi.fn(async () => 'digest-token'),
}));

import {
  mapItemDraftToFields,
  savePriorityRailBandConfig,
  savePriorityRailItem,
} from '../data/priorityActionsListWriter.js';
import type {
  PriorityActionsConfigDraft,
  PriorityActionsItemDraft,
} from '../data/priorityActionsContracts.js';

const SITE_URL = 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral';

const CONFIG_DRAFT: PriorityActionsConfigDraft = {
  title: 'Priority Actions',
  bandKey: 'homepage-primary',
  enabled: true,
  isActive: true,
  headingText: 'Priority Actions',
  overflowLabel: 'More tools',
  showHeading: true,
  stickyAfterHero: false,
  showBadges: true,
  desktopLayoutMode: 'rail',
  tabletLayoutMode: 'grid',
  mobileLayoutMode: 'sheet-trigger',
  maxVisibleDesktop: 5,
  maxVisibleLaptop: 5,
  maxVisibleTabletLandscape: 4,
  maxVisibleTabletPortrait: 4,
  maxVisiblePhone: 4,
  openExternalInNewTabByDefault: true,
  adminNotes: '',
};

const ITEM_DRAFT: PriorityActionsItemDraft = {
  actionKey: 'submit-log',
  title: 'Submit Daily Log',
  href: '/daily-log',
  description: 'Log your daily activity',
  iconKey: 'clipboard',
  badgeLabel: 'Due',
  badgeVariant: 'warning',
  priority: 'primary',
  groupKey: 'daily',
  groupTitle: 'Daily',
  sortOrder: 10,
  overflowOnly: false,
  mobilePriority: 100,
  audienceMode: 'all',
  audienceKeys: [],
  isExternal: false,
  openInNewTab: false,
  visibleDesktop: true,
  visibleLaptop: true,
  visibleTabletLandscape: true,
  visibleTabletPortrait: true,
  visiblePhone: true,
  startsAtUtc: '',
  endsAtUtc: '',
};

describe('priorityActionsListWriter hardening', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('blocks config save when another active config exists for the band', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ value: [{ ID: 99 }] }),
    } as Response);

    const result = await savePriorityRailBandConfig(SITE_URL, undefined, CONFIG_DRAFT);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Multiple active config rows exist');
    }
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('normalizes item payload fields before write mapping', () => {
    const fields = mapItemDraftToFields(
      {
        ...ITEM_DRAFT,
        iconKey: ' CLIPBOARD ',
        audienceMode: 'all',
        audienceKeys: [' ops ', 'ops'],
        groupKey: 'team',
        groupTitle: '',
      },
      'homepage-primary',
    );

    expect(fields['IconKey']).toBe('clipboard');
    expect(fields['AudienceKeys']).toBeNull();
    expect(fields['GroupKey']).toBeNull();
    expect(fields['GroupTitle']).toBeNull();
  });

  it('rejects invalid icon keys before item write network calls', async () => {
    const fetchMock = vi.mocked(fetch);

    const result = await savePriorityRailItem(
      SITE_URL,
      undefined,
      {
        ...ITEM_DRAFT,
        iconKey: 'invalid-icon',
      },
      'homepage-primary',
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Icon key');
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
