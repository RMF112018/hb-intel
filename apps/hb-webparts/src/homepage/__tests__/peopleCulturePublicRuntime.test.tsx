import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import * as React from 'react';
import {
  adaptLegacyConfigToSplit,
  isLegacyMergedConfig,
  isSplitPublicConfig,
  resolvePublicConfig,
} from '../../webparts/peopleCulturePublic/legacyAdapter.js';
import { PeopleCulturePublic } from '../../webparts/peopleCulturePublic/PeopleCulturePublic.js';
import type {
  AnnouncementEntry,
  KudosEntry,
  PeopleCultureMergedConfig,
  WeeklyCelebrationEntry,
} from '../webparts/communicationsContracts.js';
import type {
  PeopleCultureItem,
  PeopleCultureViewerAudience,
} from '../webparts/peopleCultureSplitContracts.js';

const NOW = new Date('2026-04-09T12:00:00Z');

describe('legacyAdapter - adaptLegacyConfigToSplit', () => {
  it('returns empty items for undefined input', () => {
    const result = adaptLegacyConfigToSplit(undefined, { now: NOW });
    expect(result.items).toEqual([]);
    expect(result.heading).toBe('People and Culture');
  });

  it('drops kudos entries entirely (split boundary)', () => {
    const kudos: KudosEntry = {
      id: 'k1',
      headline: 'Great work',
      excerpt: 'They did great things',
      submittedBy: { id: 'u1', displayName: 'Submitter' },
      submittedDate: '2026-04-01',
      status: 'approved',
      approvedDate: '2026-04-02',
      recipients: [{ id: 'r1', name: 'Recipient', recipientType: 'individual' }],
    };
    const legacy: Partial<PeopleCultureMergedConfig> = {
      heading: 'Our People',
      kudos: [kudos],
    };
    const result = adaptLegacyConfigToSplit(legacy, { now: NOW });
    expect(result.items).toEqual([]);
    expect(result.heading).toBe('Our People');
  });

  it('adapts announcements to live split items', () => {
    const announcement: AnnouncementEntry = {
      id: 'ann-1',
      personName: 'Jordan Lee',
      announcementType: 'promotion',
      headline: 'Promoted to Senior PM',
      summary: 'Well deserved.',
      publishDate: '2026-04-07',
      isPinned: true,
      priorityOverride: 1,
    };
    const result = adaptLegacyConfigToSplit({ announcements: [announcement] }, { now: NOW });
    expect(result.items).toHaveLength(1);
    const item = result.items![0];
    expect(item.family).toBe('announcement');
    expect(item.title).toBe('Promoted to Senior PM');
    expect(item.body).toBe('Well deserved.');
    expect(item.homepage.tier).toBe('featured');
    expect(item.homepage.isPinned).toBe(true);
    expect(item.homepage.order).toBe(1);
    expect(item.audience.kind).toBe('companyWide');
    expect(item.lifecycleState === 'live' || item.lifecycleState === 'expiringSoon').toBe(true);
    expect(item.personRef?.displayName).toBe('Jordan Lee');
  });

  it('marks homepageEnabled=false announcements as excluded tier', () => {
    const result = adaptLegacyConfigToSplit(
      {
        announcements: [
          {
            id: 'a',
            personName: 'X',
            announcementType: 'promotion',
            headline: 'H',
            summary: 'S',
            publishDate: '2026-04-08',
            homepageEnabled: false,
          },
        ],
      },
      { now: NOW },
    );
    expect(result.items![0].homepage.tier).toBe('excluded');
  });

  it('adapts celebrations with an active week window', () => {
    const celebration: WeeklyCelebrationEntry = {
      id: 'cel-1',
      personName: 'Morgan Chen',
      celebrationType: 'anniversary',
      celebrationDate: '2026-04-10',
      anniversaryYears: 10,
    };
    const result = adaptLegacyConfigToSplit({ celebrations: [celebration] }, { now: NOW });
    expect(result.items).toHaveLength(1);
    const item = result.items![0];
    expect(item.family).toBe('celebrationMilestone');
    expect(item.title).toContain('Morgan Chen');
    expect(item.title).toContain('10');
    expect(item.homepage.tier).toBe('supporting');
    expect(item.lifecycleState === 'live' || item.lifecycleState === 'expiringSoon').toBe(true);
  });

  it('projects legacy audience strings onto office-dimension tags', () => {
    const result = adaptLegacyConfigToSplit(
      {
        announcements: [
          {
            id: 'a',
            personName: 'X',
            announcementType: 'promotion',
            headline: 'H',
            summary: 'S',
            publishDate: '2026-04-08',
            audiences: ['Coral Springs', 'Tampa'],
          },
        ],
      },
      { now: NOW },
    );
    const audience = result.items![0].audience;
    expect(audience.kind).toBe('targeted');
    if (audience.kind === 'targeted') {
      expect(audience.tags).toEqual([
        { dimension: 'office', value: 'Coral Springs' },
        { dimension: 'office', value: 'Tampa' },
      ]);
    }
  });
});

describe('legacyAdapter - detectors and resolvePublicConfig', () => {
  it('isSplitPublicConfig recognizes split shape', () => {
    const item: PeopleCultureItem = {
      id: 's1',
      family: 'announcement',
      lifecycleState: 'live',
      title: 't',
      body: 'b',
      approvalTrigger: 'standard',
      audience: { kind: 'companyWide' },
      homepage: { tier: 'featured', overrideSource: 'systemDefault', isPinned: false },
      mediaSource: { kind: 'none' },
    };
    expect(isSplitPublicConfig({ items: [item] })).toBe(true);
    expect(isSplitPublicConfig({ items: [{ foo: 'bar' }] })).toBe(false);
    expect(isSplitPublicConfig(undefined)).toBe(false);
  });

  it('isLegacyMergedConfig recognizes legacy shape', () => {
    expect(isLegacyMergedConfig({ announcements: [] })).toBe(true);
    expect(isLegacyMergedConfig({ heading: 'x' })).toBe(true);
    expect(isLegacyMergedConfig(undefined)).toBe(false);
  });

  it('resolvePublicConfig prefers split when present', () => {
    const item: PeopleCultureItem = {
      id: 's1',
      family: 'announcement',
      lifecycleState: 'live',
      title: 'Split title',
      body: 'b',
      approvalTrigger: 'standard',
      audience: { kind: 'companyWide' },
      homepage: { tier: 'featured', overrideSource: 'systemDefault', isPinned: false },
      mediaSource: { kind: 'none' },
    };
    const result = resolvePublicConfig({ items: [item] });
    expect(result.items).toHaveLength(1);
    expect(result.items![0].title).toBe('Split title');
  });

  it('resolvePublicConfig bridges legacy when split not present', () => {
    const result = resolvePublicConfig(
      {
        announcements: [
          {
            id: 'a',
            personName: 'X',
            announcementType: 'promotion',
            headline: 'Legacy headline',
            summary: 'Legacy body',
            publishDate: '2026-04-08',
          },
        ],
      },
      { now: NOW },
    );
    expect(result.items?.[0].title).toBe('Legacy headline');
  });
});

describe('PeopleCulturePublic runtime', () => {
  it('renders featured + supporting hierarchy from legacy config', () => {
    const legacy: Partial<PeopleCultureMergedConfig> = {
      heading: 'Our People',
      announcements: [
        {
          id: 'pinned',
          personName: 'Jordan',
          announcementType: 'promotion',
          headline: 'Pinned featured story',
          summary: 'This one is pinned and featured.',
          publishDate: '2026-04-08',
          isPinned: true,
        },
        {
          id: 'support',
          personName: 'Taylor',
          announcementType: 'newHire',
          headline: 'Supporting story',
          summary: 'This one is supporting.',
          publishDate: '2026-04-07',
        },
      ],
    };
    const { container, getByText, queryByText } = render(
      <PeopleCulturePublic config={legacy as unknown as Record<string, unknown>} />,
    );
    expect(getByText('Pinned featured story')).toBeTruthy();
    expect(getByText('Supporting story')).toBeTruthy();
    expect(getByText('Our People')).toBeTruthy();
    expect(queryByText(/Phase-14 structural scaffold/)).toBeNull();
    expect(container.querySelector('[data-hbc-pc-section="featured"]')).toBeTruthy();
    expect(container.querySelector('[data-hbc-pc-section="supporting"]')).toBeTruthy();
  });

  it('renders the empty state when no items are visible', () => {
    const { getByRole } = render(<PeopleCulturePublic config={{} as Record<string, unknown>} />);
    expect(getByRole('status').textContent).toContain('People and Culture');
  });

  it('never renders kudos content from a legacy merged config', () => {
    const legacy: Partial<PeopleCultureMergedConfig> = {
      announcements: [],
      celebrations: [],
      kudos: [
        {
          id: 'k1',
          headline: 'Great kudos headline',
          excerpt: 'kudos excerpt',
          submittedBy: { id: 'u1', displayName: 'Submitter' },
          submittedDate: '2026-04-01',
          status: 'approved',
          approvedDate: '2026-04-02',
          recipients: [{ id: 'r1', name: 'Recipient', recipientType: 'individual' }],
        },
      ],
    };
    const { queryByText, container } = render(
      <PeopleCulturePublic config={legacy as unknown as Record<string, unknown>} />,
    );
    expect(queryByText('Great kudos headline')).toBeNull();
    expect(queryByText('kudos excerpt')).toBeNull();
    expect(container.querySelector('[data-hbc-pc-empty="true"]')).toBeTruthy();
  });

  it('filters targeted items by viewer audience', () => {
    const visibleItem: PeopleCultureItem = {
      id: 'visible',
      family: 'announcement',
      lifecycleState: 'live',
      title: 'Visible to Coral Springs',
      body: 'body',
      approvalTrigger: 'standard',
      audience: {
        kind: 'targeted',
        tags: [{ dimension: 'office', value: 'Coral Springs' }],
      },
      homepage: { tier: 'supporting', overrideSource: 'systemDefault', isPinned: false },
      mediaSource: { kind: 'none' },
      publishedAt: '2026-04-01T00:00:00Z',
    };
    const hiddenItem: PeopleCultureItem = {
      ...visibleItem,
      id: 'hidden',
      title: 'Visible to Tampa only',
      audience: {
        kind: 'targeted',
        tags: [{ dimension: 'office', value: 'Tampa' }],
      },
    };
    const viewer: PeopleCultureViewerAudience = {
      tags: [{ dimension: 'office', value: 'Coral Springs' }],
    };
    const { getByText, queryByText } = render(
      <PeopleCulturePublic
        splitConfig={{ items: [visibleItem, hiddenItem] }}
        viewerAudience={viewer}
      />,
    );
    expect(getByText('Visible to Coral Springs')).toBeTruthy();
    expect(queryByText('Visible to Tampa only')).toBeNull();
  });

  it('honors HR-override media for supporting rows', () => {
    const item: PeopleCultureItem = {
      id: 's1',
      family: 'celebrationMilestone',
      lifecycleState: 'live',
      title: 'Celebration',
      body: 'Celebrating.',
      approvalTrigger: 'standard',
      audience: { kind: 'companyWide' },
      homepage: { tier: 'supporting', overrideSource: 'hrOverride', isPinned: false },
      mediaSource: { kind: 'hrUpload', src: '/assets/hr.jpg', alt: 'HR-selected image' },
      publishedAt: '2026-04-01T00:00:00Z',
    };
    const { container } = render(
      <PeopleCulturePublic splitConfig={{ items: [item] }} />,
    );
    const row = container.querySelector('[data-hbc-pc-tier="supporting"]');
    expect(row?.getAttribute('data-hbc-pc-media-source')).toBe('hrUpload');
  });

  it('resolves profile-photo media when a resolver is provided', () => {
    const item: PeopleCultureItem = {
      id: 'a',
      family: 'announcement',
      lifecycleState: 'live',
      title: 'Profile photo item',
      body: 'body',
      approvalTrigger: 'standard',
      audience: { kind: 'companyWide' },
      homepage: { tier: 'featured', overrideSource: 'systemDefault', isPinned: false },
      mediaSource: { kind: 'profilePhoto', personId: 'u1' },
      publishedAt: '2026-04-01T00:00:00Z',
    };
    const { container } = render(
      <PeopleCulturePublic
        splitConfig={{ items: [item] }}
        profilePhotoResolver={(id) =>
          id === 'u1' ? { src: '/photos/u1.jpg', alt: 'Jordan' } : undefined
        }
      />,
    );
    const card = container.querySelector('[data-hbc-pc-tier="featured"]');
    expect(card?.getAttribute('data-hbc-pc-media-source')).toBe('profilePhoto');
  });
});
