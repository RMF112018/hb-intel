import { describe, expect, it } from 'vitest';
import { normalizePeopleCultureMergedConfig } from '../helpers/communicationsConfig.js';
import type {
  AnnouncementEntry,
  KudosEntry,
  WeeklyCelebrationEntry,
} from '../webparts/communicationsContracts.js';

// Fixed reference date: 2026-04-07T12:00:00Z
const NOW = new Date('2026-04-07T12:00:00Z');

function makeAnnouncement(overrides: Partial<AnnouncementEntry> & { id: string }): AnnouncementEntry {
  return {
    personName: 'Test Person',
    announcementType: 'promotion',
    headline: 'Test Headline',
    summary: 'Test summary',
    publishDate: '2026-04-05',
    ...overrides,
  };
}

function makeKudos(overrides: Partial<KudosEntry> & { id: string }): KudosEntry {
  return {
    headline: 'Test Kudos',
    excerpt: 'Great work',
    submittedBy: { id: 'u1', displayName: 'Submitter' },
    submittedDate: '2026-04-01',
    status: 'approved',
    approvedDate: '2026-04-02',
    recipients: [{ id: 'r1', name: 'Recipient', recipientType: 'individual' }],
    ...overrides,
  };
}

function makeCelebration(overrides: Partial<WeeklyCelebrationEntry> & { id: string }): WeeklyCelebrationEntry {
  return {
    personName: 'Test Person',
    celebrationType: 'birthday',
    celebrationDate: '2026-04-09',
    ...overrides,
  };
}

describe('normalizePeopleCultureMergedConfig', () => {
  it('returns empty output for undefined input', () => {
    const result = normalizePeopleCultureMergedConfig(undefined, undefined, NOW);

    expect(result.heading).toBe('Celebrating Our People');
    expect(result.bandA.isEmpty).toBe(true);
    expect(result.bandA.items).toEqual([]);
    expect(result.kudos.isEmpty).toBe(true);
    expect(result.kudos.featured).toBeUndefined();
    expect(result.kudos.recentHeadlines).toEqual([]);
    expect(result.bandB.isEmpty).toBe(true);
    expect(result.bandB.items).toEqual([]);
  });

  it('uses custom heading when provided', () => {
    const result = normalizePeopleCultureMergedConfig({ heading: '  Our People  ' }, undefined, NOW);
    expect(result.heading).toBe('Our People');
  });

  // ---------------------------------------------------------------------------
  // Band A — Announcements
  // ---------------------------------------------------------------------------

  describe('Band A — Announcements', () => {
    it('shows announcements within persistence window', () => {
      const result = normalizePeopleCultureMergedConfig({
        announcements: [
          makeAnnouncement({ id: 'a1', announcementType: 'promotion', publishDate: '2026-04-04' }), // 3 days ago, 5-day window → visible
        ],
      }, undefined, NOW);

      expect(result.bandA.isEmpty).toBe(false);
      expect(result.bandA.items).toHaveLength(1);
    });

    it('hides announcements past their persistence window', () => {
      const result = normalizePeopleCultureMergedConfig({
        announcements: [
          makeAnnouncement({ id: 'a1', announcementType: 'baby', publishDate: '2026-04-01' }), // 6 days ago, 3-day window → expired
        ],
      }, undefined, NOW);

      expect(result.bandA.isEmpty).toBe(true);
    });

    it('applies correct persistence windows per type', () => {
      const result = normalizePeopleCultureMergedConfig({
        announcements: [
          makeAnnouncement({ id: 'promo', personName: 'Bob', announcementType: 'promotion', publishDate: '2026-04-03' }), // 4 days ago, 5-day → visible
          makeAnnouncement({ id: 'baby', personName: 'Charlie', announcementType: 'baby', publishDate: '2026-04-03' }),   // 4 days ago, 3-day → expired
          makeAnnouncement({ id: 'hire', personName: 'Alice', announcementType: 'newHire', publishDate: '2026-04-03' }),   // 4 days ago, 5-day → visible
        ],
      }, undefined, NOW);

      expect(result.bandA.items.map((i) => i.id)).toEqual(['hire', 'promo']); // both visible, sorted by personName (Alice < Bob)
    });

    it('pinned announcements bypass persistence expiry', () => {
      const result = normalizePeopleCultureMergedConfig({
        announcements: [
          makeAnnouncement({ id: 'a1', publishDate: '2026-03-01', isPinned: true }), // 37 days ago but pinned
        ],
      }, undefined, NOW);

      expect(result.bandA.items).toHaveLength(1);
      expect(result.bandA.items[0].id).toBe('a1');
    });

    it('homepageEnabled=false suppresses the item', () => {
      const result = normalizePeopleCultureMergedConfig({
        announcements: [
          makeAnnouncement({ id: 'a1', publishDate: '2026-04-06', homepageEnabled: false }),
        ],
      }, undefined, NOW);

      expect(result.bandA.isEmpty).toBe(true);
    });

    it('editorial startDisplayDate/endDisplayDate override persistence', () => {
      const result = normalizePeopleCultureMergedConfig({
        announcements: [
          makeAnnouncement({ id: 'a1', publishDate: '2026-03-01', startDisplayDate: '2026-04-06', endDisplayDate: '2026-04-10' }),
        ],
      }, undefined, NOW);

      expect(result.bandA.items).toHaveLength(1);
    });

    it('sorts by pinned > priorityOverride > publishDate desc > personName', () => {
      const result = normalizePeopleCultureMergedConfig({
        announcements: [
          makeAnnouncement({ id: 'c', personName: 'Charlie', publishDate: '2026-04-06' }),
          makeAnnouncement({ id: 'a', personName: 'Alice', publishDate: '2026-04-06', isPinned: true }),
          makeAnnouncement({ id: 'b', personName: 'Bob', publishDate: '2026-04-07', priorityOverride: 1 }),
        ],
      }, undefined, NOW);

      expect(result.bandA.items.map((i) => i.id)).toEqual(['a', 'b', 'c']);
    });

    it('caps at maxAnnouncements (default 4)', () => {
      const result = normalizePeopleCultureMergedConfig({
        announcements: Array.from({ length: 6 }, (_, i) =>
          makeAnnouncement({ id: `a${i}`, personName: `Person ${i}`, publishDate: '2026-04-06' }),
        ),
      }, undefined, NOW);

      expect(result.bandA.items).toHaveLength(4);
    });

    it('filters by audience', () => {
      const result = normalizePeopleCultureMergedConfig({
        announcements: [
          makeAnnouncement({ id: 'field', publishDate: '2026-04-06', audiences: ['field'] }),
          makeAnnouncement({ id: 'admin', publishDate: '2026-04-06', audiences: ['admin'] }),
        ],
      }, 'field', NOW);

      expect(result.bandA.items.map((i) => i.id)).toEqual(['field']);
    });

    it('drops entries with missing required fields', () => {
      const result = normalizePeopleCultureMergedConfig({
        announcements: [
          makeAnnouncement({ id: 'good', publishDate: '2026-04-06' }),
          makeAnnouncement({ id: '', publishDate: '2026-04-06' }),
          makeAnnouncement({ id: 'no-headline', headline: '', publishDate: '2026-04-06' }),
        ],
      }, undefined, NOW);

      expect(result.bandA.items.map((i) => i.id)).toEqual(['good']);
    });
  });

  // ---------------------------------------------------------------------------
  // Kudos Module
  // ---------------------------------------------------------------------------

  describe('Kudos Module', () => {
    it('only shows approved Kudos', () => {
      const result = normalizePeopleCultureMergedConfig({
        kudos: [
          makeKudos({ id: 'approved', status: 'approved', approvedDate: '2026-04-05' }),
          makeKudos({ id: 'pending', status: 'pending' }),
          makeKudos({ id: 'rejected', status: 'rejected' }),
        ],
      }, undefined, NOW);

      expect(result.kudos.isEmpty).toBe(false);
      expect(result.kudos.featured?.id).toBe('approved');
      expect(result.kudos.recentHeadlines).toEqual([]);
    });

    it('ages off after 14 days from approvedDate', () => {
      const result = normalizePeopleCultureMergedConfig({
        kudos: [
          makeKudos({ id: 'old', approvedDate: '2026-03-20' }), // 18 days ago → expired
          makeKudos({ id: 'recent', approvedDate: '2026-04-01' }), // 6 days ago → visible
        ],
      }, undefined, NOW);

      expect(result.kudos.featured?.id).toBe('recent');
      expect(result.kudos.recentHeadlines).toEqual([]);
    });

    it('pinned Kudos bypass 14-day age-off', () => {
      const result = normalizePeopleCultureMergedConfig({
        kudos: [
          makeKudos({ id: 'pinned-old', approvedDate: '2026-03-01', isPinned: true }),
        ],
      }, undefined, NOW);

      expect(result.kudos.featured?.id).toBe('pinned-old');
    });

    it('selects pinned item as featured over more recent unpinned', () => {
      const result = normalizePeopleCultureMergedConfig({
        kudos: [
          makeKudos({ id: 'recent', approvedDate: '2026-04-06' }),
          makeKudos({ id: 'pinned', approvedDate: '2026-04-03', isPinned: true }),
        ],
      }, undefined, NOW);

      expect(result.kudos.featured?.id).toBe('pinned');
      expect(result.kudos.recentHeadlines[0].id).toBe('recent');
    });

    it('most recently approved pinned item wins featured when multiple pinned', () => {
      const result = normalizePeopleCultureMergedConfig({
        kudos: [
          makeKudos({ id: 'pin-old', approvedDate: '2026-04-01', isPinned: true }),
          makeKudos({ id: 'pin-new', approvedDate: '2026-04-05', isPinned: true }),
          makeKudos({ id: 'unpinned', approvedDate: '2026-04-06' }),
        ],
      }, undefined, NOW);

      expect(result.kudos.featured?.id).toBe('pin-new');
      expect(result.kudos.recentHeadlines.map((i) => i.id)).toEqual(['pin-old', 'unpinned']);
    });

    it('caps recent headlines at maxKudosHeadlines (default 6)', () => {
      const kudos = Array.from({ length: 9 }, (_, i) =>
        makeKudos({ id: `k${i}`, headline: `Kudos ${i}`, approvedDate: `2026-04-0${Math.min(i + 1, 7)}` }),
      );

      const result = normalizePeopleCultureMergedConfig({ kudos }, undefined, NOW);

      expect(result.kudos.featured).toBeDefined();
      expect(result.kudos.recentHeadlines).toHaveLength(6);
    });

    it('homepageEnabled=false suppresses from homepage', () => {
      const result = normalizePeopleCultureMergedConfig({
        kudos: [
          makeKudos({ id: 'suppressed', approvedDate: '2026-04-05', homepageEnabled: false }),
        ],
      }, undefined, NOW);

      expect(result.kudos.isEmpty).toBe(true);
    });

    it('publishStartDate/publishEndDate override age-off', () => {
      const result = normalizePeopleCultureMergedConfig({
        kudos: [
          makeKudos({ id: 'k1', approvedDate: '2026-03-01', publishStartDate: '2026-04-06', publishEndDate: '2026-04-20' }),
        ],
      }, undefined, NOW);

      expect(result.kudos.featured?.id).toBe('k1');
    });
  });

  // ---------------------------------------------------------------------------
  // Band B — Weekly Celebrations
  // ---------------------------------------------------------------------------

  describe('Band B — Weekly Celebrations', () => {
    it('shows celebrations within next 7 days', () => {
      const result = normalizePeopleCultureMergedConfig({
        celebrations: [
          makeCelebration({ id: 'c1', celebrationDate: '2026-04-10' }), // 3 days out → visible
        ],
      }, undefined, NOW);

      expect(result.bandB.isEmpty).toBe(false);
      expect(result.bandB.items).toHaveLength(1);
    });

    it('hides celebrations beyond 7 days', () => {
      const result = normalizePeopleCultureMergedConfig({
        celebrations: [
          makeCelebration({ id: 'c1', celebrationDate: '2026-04-20' }), // 13 days out → hidden
        ],
      }, undefined, NOW);

      expect(result.bandB.isEmpty).toBe(true);
    });

    it('hides past celebrations', () => {
      const result = normalizePeopleCultureMergedConfig({
        celebrations: [
          makeCelebration({ id: 'c1', celebrationDate: '2026-04-05' }), // 2 days ago → hidden
        ],
      }, undefined, NOW);

      expect(result.bandB.isEmpty).toBe(true);
    });

    it('includes today as a valid celebration date', () => {
      const result = normalizePeopleCultureMergedConfig({
        celebrations: [
          makeCelebration({ id: 'today', celebrationDate: '2026-04-07' }),
        ],
      }, undefined, NOW);

      expect(result.bandB.items).toHaveLength(1);
    });

    it('sorts by celebrationDate ascending then personName', () => {
      const result = normalizePeopleCultureMergedConfig({
        celebrations: [
          makeCelebration({ id: 'c3', personName: 'Charlie', celebrationDate: '2026-04-10' }),
          makeCelebration({ id: 'c1', personName: 'Alice', celebrationDate: '2026-04-08' }),
          makeCelebration({ id: 'c2', personName: 'Bob', celebrationDate: '2026-04-08' }),
        ],
      }, undefined, NOW);

      expect(result.bandB.items.map((i) => i.id)).toEqual(['c1', 'c2', 'c3']);
    });

    it('caps at maxCelebrations (default 8)', () => {
      const result = normalizePeopleCultureMergedConfig({
        celebrations: Array.from({ length: 10 }, (_, i) =>
          makeCelebration({ id: `c${i}`, personName: `Person ${i}`, celebrationDate: '2026-04-09' }),
        ),
      }, undefined, NOW);

      expect(result.bandB.items).toHaveLength(8);
    });

    it('filters by audience', () => {
      const result = normalizePeopleCultureMergedConfig({
        celebrations: [
          makeCelebration({ id: 'field', celebrationDate: '2026-04-09', audiences: ['field'] }),
          makeCelebration({ id: 'admin', celebrationDate: '2026-04-09', audiences: ['admin'] }),
        ],
      }, 'field', NOW);

      expect(result.bandB.items.map((i) => i.id)).toEqual(['field']);
    });
  });

  // ---------------------------------------------------------------------------
  // Cross-region independence
  // ---------------------------------------------------------------------------

  describe('Cross-region independence', () => {
    it('each region is independently empty or populated', () => {
      const result = normalizePeopleCultureMergedConfig({
        announcements: [makeAnnouncement({ id: 'a1', publishDate: '2026-04-06' })],
        kudos: [],
        celebrations: [makeCelebration({ id: 'c1', celebrationDate: '2026-04-09' })],
      }, undefined, NOW);

      expect(result.bandA.isEmpty).toBe(false);
      expect(result.kudos.isEmpty).toBe(true);
      expect(result.bandB.isEmpty).toBe(false);
    });

    it('full three-region populated state', () => {
      const result = normalizePeopleCultureMergedConfig({
        announcements: [makeAnnouncement({ id: 'a1', publishDate: '2026-04-06' })],
        kudos: [
          makeKudos({ id: 'k1', approvedDate: '2026-04-05' }),
          makeKudos({ id: 'k2', approvedDate: '2026-04-04' }),
        ],
        celebrations: [makeCelebration({ id: 'c1', celebrationDate: '2026-04-09' })],
      }, undefined, NOW);

      expect(result.bandA.isEmpty).toBe(false);
      expect(result.bandA.items).toHaveLength(1);
      expect(result.kudos.isEmpty).toBe(false);
      expect(result.kudos.featured?.id).toBe('k1');
      expect(result.kudos.recentHeadlines).toHaveLength(1);
      expect(result.bandB.isEmpty).toBe(false);
      expect(result.bandB.items).toHaveLength(1);
    });

    it('all three regions empty', () => {
      const result = normalizePeopleCultureMergedConfig({
        announcements: [],
        kudos: [],
        celebrations: [],
      }, undefined, NOW);

      expect(result.bandA.isEmpty).toBe(true);
      expect(result.kudos.isEmpty).toBe(true);
      expect(result.bandB.isEmpty).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Media normalization
  // ---------------------------------------------------------------------------

  describe('Media normalization', () => {
    it('strips media without alt text across all regions', () => {
      const result = normalizePeopleCultureMergedConfig({
        announcements: [makeAnnouncement({ id: 'a1', publishDate: '2026-04-06', media: { src: '/img.jpg', alt: '' } })],
        kudos: [makeKudos({ id: 'k1', approvedDate: '2026-04-05', media: { src: '/img.jpg', alt: '' } })],
        celebrations: [makeCelebration({ id: 'c1', celebrationDate: '2026-04-09', media: { src: '/img.jpg', alt: '' } })],
      }, undefined, NOW);

      expect(result.bandA.items[0].media).toBeUndefined();
      expect(result.kudos.featured?.media).toBeUndefined();
      expect(result.bandB.items[0].media).toBeUndefined();
    });

    it('preserves valid media', () => {
      const result = normalizePeopleCultureMergedConfig({
        announcements: [makeAnnouncement({ id: 'a1', publishDate: '2026-04-06', media: { src: '/img.jpg', alt: 'Photo' } })],
      }, undefined, NOW);

      expect(result.bandA.items[0].media?.src).toBe('/img.jpg');
    });
  });

  // ---------------------------------------------------------------------------
  // Partial-data resilience (Phase 8B)
  // ---------------------------------------------------------------------------

  describe('Partial-data resilience', () => {
    it('skips null/undefined items in arrays', () => {
      const result = normalizePeopleCultureMergedConfig({
        announcements: [null, undefined, makeAnnouncement({ id: 'a1', publishDate: '2026-04-06' })] as unknown as AnnouncementEntry[],
        kudos: [null, makeKudos({ id: 'k1', approvedDate: '2026-04-05' })] as unknown as KudosEntry[],
        celebrations: [undefined, makeCelebration({ id: 'c1', celebrationDate: '2026-04-09' })] as unknown as WeeklyCelebrationEntry[],
      }, undefined, NOW);

      expect(result.bandA.items).toHaveLength(1);
      expect(result.kudos.featured?.id).toBe('k1');
      expect(result.bandB.items).toHaveLength(1);
    });

    it('drops announcements with invalid announcementType', () => {
      const result = normalizePeopleCultureMergedConfig({
        announcements: [
          makeAnnouncement({ id: 'good', announcementType: 'promotion', publishDate: '2026-04-06' }),
          { ...makeAnnouncement({ id: 'bad', publishDate: '2026-04-06' }), announcementType: 'unknown' as AnnouncementEntry['announcementType'] },
        ],
      }, undefined, NOW);

      expect(result.bandA.items.map((i) => i.id)).toEqual(['good']);
    });

    it('drops Kudos with missing submittedBy', () => {
      const result = normalizePeopleCultureMergedConfig({
        kudos: [
          makeKudos({ id: 'good', approvedDate: '2026-04-05' }),
          { ...makeKudos({ id: 'bad', approvedDate: '2026-04-05' }), submittedBy: null } as unknown as KudosEntry,
        ],
      }, undefined, NOW);

      expect(result.kudos.featured?.id).toBe('good');
      expect(result.kudos.recentHeadlines).toEqual([]);
    });

    it('drops Kudos with empty submittedBy displayName', () => {
      const result = normalizePeopleCultureMergedConfig({
        kudos: [
          makeKudos({ id: 'good', approvedDate: '2026-04-05' }),
          { ...makeKudos({ id: 'bad', approvedDate: '2026-04-05' }), submittedBy: { id: 'u1', displayName: '' } } as KudosEntry,
        ],
      }, undefined, NOW);

      expect(result.kudos.featured?.id).toBe('good');
    });

    it('normalizes Kudos recipients — filters out invalid entries', () => {
      const result = normalizePeopleCultureMergedConfig({
        kudos: [
          makeKudos({
            id: 'k1',
            approvedDate: '2026-04-05',
            recipients: [
              { id: 'r1', name: 'Valid', recipientType: 'individual' },
              null,
              { id: '', name: 'No ID', recipientType: 'team' },
            ] as unknown as KudosEntry['recipients'],
          }),
        ],
      }, undefined, NOW);

      expect(result.kudos.featured?.recipients).toHaveLength(1);
      expect(result.kudos.featured?.recipients[0].name).toBe('Valid');
    });

    it('drops celebrations with invalid celebrationType', () => {
      const result = normalizePeopleCultureMergedConfig({
        celebrations: [
          makeCelebration({ id: 'good', celebrationType: 'birthday', celebrationDate: '2026-04-09' }),
          { ...makeCelebration({ id: 'bad', celebrationDate: '2026-04-09' }), celebrationType: 'unknown' as WeeklyCelebrationEntry['celebrationType'] },
        ],
      }, undefined, NOW);

      expect(result.bandB.items.map((i) => i.id)).toEqual(['good']);
    });

    it('handles completely undefined config gracefully', () => {
      const result = normalizePeopleCultureMergedConfig(undefined, undefined, NOW);
      expect(result.bandA.isEmpty).toBe(true);
      expect(result.kudos.isEmpty).toBe(true);
      expect(result.bandB.isEmpty).toBe(true);
    });

    it('handles empty object config gracefully', () => {
      const result = normalizePeopleCultureMergedConfig({}, undefined, NOW);
      expect(result.heading).toBe('Celebrating Our People');
      expect(result.bandA.isEmpty).toBe(true);
      expect(result.kudos.isEmpty).toBe(true);
      expect(result.bandB.isEmpty).toBe(true);
    });
  });
});
