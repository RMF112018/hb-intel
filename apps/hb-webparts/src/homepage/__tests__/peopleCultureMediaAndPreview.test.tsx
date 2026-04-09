import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import {
  composeProfilePhotoResolvers,
  createSharePointUserPhotoResolver,
  createStaticProfilePhotoResolver,
} from '../helpers/peopleCultureProfilePhotoResolver.js';
import { generateMilestoneCandidates } from '../helpers/peopleCultureMilestoneGenerator.js';
import { PeopleCultureCompanion } from '../../webparts/peopleCultureCompanion/PeopleCultureCompanion.js';
import { PeopleCulturePublic } from '../../webparts/peopleCulturePublic/PeopleCulturePublic.js';
import type {
  PeopleCultureCompanionConfig,
  PeopleCultureItem,
} from '../webparts/peopleCultureSplitContracts.js';

afterEach(() => {
  cleanup();
});

const NOW = new Date('2026-04-09T12:00:00Z');

function makeItem(overrides: Partial<PeopleCultureItem> & { id: string }): PeopleCultureItem {
  return {
    family: 'announcement',
    lifecycleState: 'live',
    title: `Item ${overrides.id}`,
    body: `Body ${overrides.id}`,
    approvalTrigger: 'standard',
    audience: { kind: 'companyWide' },
    homepage: { tier: 'supporting', overrideSource: 'systemDefault', isPinned: false },
    mediaSource: { kind: 'none' },
    publishedAt: '2026-04-01T00:00:00Z',
    ...overrides,
  };
}

describe('createSharePointUserPhotoResolver', () => {
  it('builds a /_layouts/15/userphoto.aspx URL for an email account name', () => {
    const resolver = createSharePointUserPhotoResolver({
      siteUrl: 'https://tenant.sharepoint.com/sites/HB',
    });
    const hit = resolver('jordan@hb.com');
    expect(hit).toBeDefined();
    expect(hit!.src).toBe(
      'https://tenant.sharepoint.com/sites/HB/_layouts/15/userphoto.aspx?accountname=jordan%40hb.com&size=L',
    );
    expect(hit!.alt).toContain('jordan');
  });

  it('returns undefined for the legacy:<name> placeholder', () => {
    const resolver = createSharePointUserPhotoResolver({
      siteUrl: 'https://tenant.sharepoint.com/sites/HB',
    });
    expect(resolver('legacy:Jordan Lee')).toBeUndefined();
  });

  it('honors a custom accountName lookup', () => {
    const resolver = createSharePointUserPhotoResolver({
      siteUrl: 'https://tenant.sharepoint.com/sites/HB',
      accountNameLookup: (id) =>
        id === 'guid-1' ? 'i:0#.f|membership|jordan@hb.com' : undefined,
    });
    const hit = resolver('guid-1');
    expect(hit!.src).toContain(encodeURIComponent('i:0#.f|membership|jordan@hb.com'));
  });

  it('returns undefined when the site URL is blank', () => {
    const resolver = createSharePointUserPhotoResolver({ siteUrl: '' });
    expect(resolver('jordan@hb.com')).toBeUndefined();
  });

  it('composes multiple resolvers and takes the first hit', () => {
    const staticResolver = createStaticProfilePhotoResolver({
      'static-1': { src: '/static.jpg', alt: 'Static' },
    });
    const spResolver = createSharePointUserPhotoResolver({
      siteUrl: 'https://tenant.sharepoint.com/sites/HB',
    });
    const composed = composeProfilePhotoResolvers(staticResolver, spResolver);
    expect(composed('static-1')?.src).toBe('/static.jpg');
    expect(composed('email@hb.com')?.src).toContain('userphoto.aspx');
  });
});

describe('generateMilestoneCandidates', () => {
  it('generates a birthday candidate inside the forward window', () => {
    const candidates = generateMilestoneCandidates(
      [{ id: 'u1', displayName: 'Jordan', birthDate: '1990-04-15' }],
      { referenceDate: NOW },
    );
    expect(candidates).toHaveLength(1);
    expect(candidates[0].candidateType).toBe('birthday');
    expect(candidates[0].occursOn).toBe('2026-04-15');
    expect(candidates[0].reviewState).toBe('pendingReview');
  });

  it('skips birthdays outside the forward window', () => {
    const candidates = generateMilestoneCandidates(
      [{ id: 'u1', displayName: 'Jordan', birthDate: '1990-06-01' }],
      { referenceDate: NOW, windowDays: 14 },
    );
    expect(candidates).toHaveLength(0);
  });

  it('produces newHireAnniversary for year 1 and serviceAnniversary for later years', () => {
    const candidates = generateMilestoneCandidates(
      [
        { id: 'u1', displayName: 'Taylor', hireDate: '2025-04-12' },
        { id: 'u2', displayName: 'Morgan', hireDate: '2016-04-14' },
      ],
      { referenceDate: NOW, windowDays: 14 },
    );
    const taylor = candidates.find((c) => c.personId === 'u1')!;
    const morgan = candidates.find((c) => c.personId === 'u2')!;
    expect(taylor.candidateType).toBe('newHireAnniversary');
    expect(taylor.anniversaryYears).toBe(1);
    expect(morgan.candidateType).toBe('serviceAnniversary');
    expect(morgan.anniversaryYears).toBe(10);
  });

  it('dedupes against previously generated candidates', () => {
    const first = generateMilestoneCandidates(
      [{ id: 'u1', displayName: 'Jordan', birthDate: '1990-04-15' }],
      { referenceDate: NOW },
    );
    const second = generateMilestoneCandidates(
      [{ id: 'u1', displayName: 'Jordan', birthDate: '1990-04-15' }],
      { referenceDate: NOW, dedupeAgainst: first },
    );
    expect(second).toHaveLength(0);
  });

  it('never publishes directly — every candidate lands in pendingReview', () => {
    const candidates = generateMilestoneCandidates(
      [
        { id: 'u1', displayName: 'Jordan', birthDate: '1990-04-15' },
        { id: 'u2', displayName: 'Taylor', hireDate: '2025-04-12' },
      ],
      { referenceDate: NOW },
    );
    expect(candidates.every((c) => c.reviewState === 'pendingReview')).toBe(true);
  });
});

describe('PeopleCultureCompanion preview panel', () => {
  function previewConfig(): PeopleCultureCompanionConfig {
    return {
      heading: 'Ops',
      items: [
        makeItem({
          id: 'ann-preview',
          family: 'announcement',
          title: 'Preview announcement',
          personRef: { id: 'jordan@hb.com', displayName: 'Jordan Lee' },
          mediaSource: { kind: 'profilePhoto', personId: 'jordan@hb.com' },
          homepage: { tier: 'featured', overrideSource: 'systemDefault', isPinned: true },
        }),
      ],
      milestoneCandidates: [],
      intakeSubmissions: [],
      currentUserRole: 'approver',
    };
  }

  it('renders the preview panel placeholder when no item is selected', () => {
    const { getByRole, container } = render(
      <PeopleCultureCompanion splitConfig={previewConfig()} />,
    );
    fireEvent.click(getByRole('tab', { name: 'Preview' }));
    expect(
      container.querySelector('[data-hbc-companion-section="preview"]'),
    ).toBeTruthy();
    expect(container.querySelector('[data-hbc-companion-preview-item]')).toBeNull();
  });

  it('opens the preview panel for a specific item from a content-family row', () => {
    const resolver = createStaticProfilePhotoResolver({
      'jordan@hb.com': { src: '/photos/jordan.jpg', alt: 'Jordan' },
    });
    const { getByRole, container } = render(
      <PeopleCultureCompanion
        splitConfig={previewConfig()}
        profilePhotoResolver={resolver}
      />,
    );
    fireEvent.click(getByRole('tab', { name: 'Announcements' }));
    const previewBtn = container.querySelector(
      '[data-hbc-companion-action="preview-item"][data-hbc-companion-action-target="ann-preview"]',
    ) as HTMLButtonElement;
    fireEvent.click(previewBtn);
    const previewSection = container.querySelector(
      '[data-hbc-companion-section="preview"]',
    );
    expect(previewSection?.getAttribute('data-hbc-companion-preview-item')).toBe(
      'ann-preview',
    );
    expect(previewSection?.getAttribute('data-hbc-companion-preview-media-source')).toBe(
      'profilePhoto',
    );
    // Default preview keys produce 4 frames.
    const frames = container.querySelectorAll('[data-hbc-companion-preview-frame]');
    expect(frames.length).toBe(4);
  });

  it('exposes the active media source kind on each content-family list row', () => {
    const resolver = createStaticProfilePhotoResolver({
      'jordan@hb.com': { src: '/photos/jordan.jpg', alt: 'Jordan' },
    });
    const { getByRole, container } = render(
      <PeopleCultureCompanion
        splitConfig={previewConfig()}
        profilePhotoResolver={resolver}
      />,
    );
    fireEvent.click(getByRole('tab', { name: 'Announcements' }));
    const row = container.querySelector(
      '[data-hbc-companion-item-id="ann-preview"]',
    );
    expect(row?.getAttribute('data-hbc-companion-item-media-source')).toBe(
      'profilePhoto',
    );
  });

  it('still reports the declared profilePhoto source when no resolver is supplied', () => {
    // The data-attribute reports the declared source kind so HR can see
    // what the item is asking for. A missing resolver does not morph the
    // intent into `none` — the render path still falls through to the
    // initials placeholder (tested separately via the public surface).
    const { getByRole, container } = render(
      <PeopleCultureCompanion splitConfig={previewConfig()} />,
    );
    fireEvent.click(getByRole('tab', { name: 'Announcements' }));
    const row = container.querySelector(
      '[data-hbc-companion-item-id="ann-preview"]',
    );
    expect(row?.getAttribute('data-hbc-companion-item-media-source')).toBe(
      'profilePhoto',
    );
  });
});

describe('PeopleCultureCompanion milestone generator wiring', () => {
  it('seeds the milestone queue from a people-source snapshot at mount', () => {
    const { container } = render(
      <PeopleCultureCompanion
        splitConfig={{
          items: [],
          milestoneCandidates: [],
          intakeSubmissions: [],
          currentUserRole: 'approver',
        }}
        peopleSource={[
          {
            id: 'u1',
            displayName: 'Jordan Lee',
            birthDate: '1990-04-15',
          },
        ]}
      />,
    );
    // Candidate should be visible on the overview dashboard; id format
    // is `mc:birthday:<personId>:<yyyy-mm-dd>`.
    const expected = container.querySelector(
      '[data-hbc-companion-milestone-id^="mc:birthday:u1:"]',
    );
    expect(expected).toBeTruthy();
  });

  it('dedupes generated candidates against candidates already in the config', () => {
    const seed = generateMilestoneCandidates(
      [{ id: 'u1', displayName: 'Jordan Lee', birthDate: '1990-04-15' }],
      { referenceDate: NOW },
    );
    const { container } = render(
      <PeopleCultureCompanion
        splitConfig={{
          items: [],
          milestoneCandidates: seed,
          intakeSubmissions: [],
          currentUserRole: 'approver',
        }}
        peopleSource={[
          { id: 'u1', displayName: 'Jordan Lee', birthDate: '1990-04-15' },
        ]}
      />,
    );
    const allBirthdayRows = container.querySelectorAll(
      '[data-hbc-companion-milestone-id^="mc:birthday:u1:"]',
    );
    expect(allBirthdayRows.length).toBe(1);
  });
});

describe('PeopleCultureCompanion homepage conflict propagation', () => {
  it('tags over-pinned items with a conflict badge on the list row', () => {
    const items: PeopleCultureItem[] = [
      makeItem({
        id: 'p1',
        homepage: { tier: 'featured', overrideSource: 'systemDefault', isPinned: true, order: 1 },
      }),
      makeItem({
        id: 'p2',
        homepage: { tier: 'featured', overrideSource: 'systemDefault', isPinned: true, order: 2 },
      }),
      makeItem({
        id: 'p3',
        homepage: { tier: 'featured', overrideSource: 'systemDefault', isPinned: true, order: 3 },
      }),
      makeItem({
        id: 'p4',
        homepage: { tier: 'featured', overrideSource: 'systemDefault', isPinned: true, order: 4 },
      }),
    ];
    const { getByRole, container } = render(
      <PeopleCultureCompanion
        splitConfig={{
          items,
          milestoneCandidates: [],
          intakeSubmissions: [],
          currentUserRole: 'approver',
        }}
      />,
    );
    fireEvent.click(getByRole('tab', { name: 'Homepage' }));
    // At least one row should carry a conflict reason (max featured = 2 default).
    const conflictRows = container.querySelectorAll(
      '[data-hbc-companion-homepage-conflict="pinnedOverflow"]',
    );
    expect(conflictRows.length).toBeGreaterThan(0);
  });
});

describe('PeopleCulturePublic profile-photo resolver integration', () => {
  it('renders profile-photo media when a resolver supplies a hit', () => {
    const resolver = createStaticProfilePhotoResolver({
      'jordan@hb.com': { src: '/photos/jordan.jpg', alt: 'Jordan Lee' },
    });
    const item: PeopleCultureItem = makeItem({
      id: 'a',
      family: 'announcement',
      title: 'Profile announcement',
      homepage: { tier: 'featured', overrideSource: 'systemDefault', isPinned: false },
      mediaSource: { kind: 'profilePhoto', personId: 'jordan@hb.com' },
    });
    const { container } = render(
      <PeopleCulturePublic
        splitConfig={{ items: [item] }}
        profilePhotoResolver={resolver}
      />,
    );
    const card = container.querySelector('[data-hbc-pc-tier="featured"]');
    expect(card?.getAttribute('data-hbc-pc-media-source')).toBe('profilePhoto');
  });
});
