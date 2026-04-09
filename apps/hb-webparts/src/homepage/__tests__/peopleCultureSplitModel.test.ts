import { describe, expect, it } from 'vitest';
import {
  buildCompanionOverview,
  countLifecycleStatesByFamily,
  deriveApprovalTrigger,
  deriveLifecycleState,
  detectHomepageConflicts,
  hasPeopleCultureCapability,
  isAudienceVisibleToViewer,
  normalizePeopleCulturePublicConfig,
  resolveMediaSource,
} from '../helpers/peopleCultureSplitModel.js';
import type {
  PeopleCultureAudienceScope,
  PeopleCultureAudienceTag,
  PeopleCultureHomepageGovernance,
  PeopleCultureItem,
  PeopleCultureMediaSource,
  PeopleCultureViewerAudience,
} from '../webparts/peopleCultureSplitContracts.js';

const NOW = new Date('2026-04-09T12:00:00Z');

function homepage(
  overrides: Partial<PeopleCultureHomepageGovernance> = {},
): PeopleCultureHomepageGovernance {
  return {
    tier: 'supporting',
    overrideSource: 'systemDefault',
    isPinned: false,
    ...overrides,
  };
}

function companyWide(): PeopleCultureAudienceScope {
  return { kind: 'companyWide' };
}

function targeted(tags: PeopleCultureAudienceTag[]): PeopleCultureAudienceScope {
  return { kind: 'targeted', tags };
}

function makeItem(overrides: Partial<PeopleCultureItem> & { id: string }): PeopleCultureItem {
  return {
    family: 'announcement',
    lifecycleState: 'live',
    title: 'Test title',
    body: 'Test body',
    approvalTrigger: 'standard',
    audience: companyWide(),
    homepage: homepage(),
    mediaSource: { kind: 'none' },
    publishedAt: '2026-04-01T00:00:00Z',
    ...overrides,
  };
}

describe('deriveLifecycleState', () => {
  it('prefers suppressed over every other state', () => {
    expect(
      deriveLifecycleState(
        {
          suppressedAt: '2026-04-05',
          archivedAt: '2026-04-05',
          expiresAt: '2026-04-06',
          publishedAt: '2026-04-01',
        },
        NOW,
      ),
    ).toBe('suppressed');
  });

  it('prefers archived over expired and live', () => {
    expect(
      deriveLifecycleState(
        {
          archivedAt: '2026-04-05',
          expiresAt: '2026-03-01',
          publishedAt: '2026-02-01',
        },
        NOW,
      ),
    ).toBe('archived');
  });

  it('marks items expired when now is past expiresAt', () => {
    expect(
      deriveLifecycleState(
        { publishedAt: '2026-01-01', expiresAt: '2026-03-01' },
        NOW,
      ),
    ).toBe('expired');
  });

  it('marks published items within the expiring-soon window as expiringSoon', () => {
    expect(
      deriveLifecycleState(
        { publishedAt: '2026-04-01', expiresAt: '2026-04-11' },
        NOW,
      ),
    ).toBe('expiringSoon');
  });

  it('marks published items with no expiry as live', () => {
    expect(deriveLifecycleState({ publishedAt: '2026-04-01' }, NOW)).toBe('live');
  });

  it('marks future-scheduled items as scheduled', () => {
    expect(
      deriveLifecycleState({ scheduledStart: '2026-04-20' }, NOW),
    ).toBe('scheduled');
  });

  it('marks approved-but-not-published items as scheduled', () => {
    expect(
      deriveLifecycleState({ approvedAt: '2026-04-05', submittedAt: '2026-04-04' }, NOW),
    ).toBe('scheduled');
  });

  it('marks submitted items as needsApproval', () => {
    expect(deriveLifecycleState({ submittedAt: '2026-04-05' }, NOW)).toBe('needsApproval');
  });

  it('falls back to draft for empty input', () => {
    expect(deriveLifecycleState({}, NOW)).toBe('draft');
  });

  it('keeps archived distinct from expired and suppressed', () => {
    const archived = deriveLifecycleState({ archivedAt: '2026-03-01' }, NOW);
    const suppressed = deriveLifecycleState({ suppressedAt: '2026-03-01' }, NOW);
    const expired = deriveLifecycleState(
      { publishedAt: '2026-01-01', expiresAt: '2026-03-01' },
      NOW,
    );
    expect(new Set([archived, suppressed, expired])).toEqual(
      new Set(['archived', 'suppressed', 'expired']),
    );
  });
});

describe('deriveApprovalTrigger', () => {
  it('returns homepagePinned when pinned regardless of audience', () => {
    expect(
      deriveApprovalTrigger({
        homepage: homepage({ isPinned: true }),
        audience: targeted([{ dimension: 'office', value: 'Coral Springs' }]),
      }),
    ).toBe('homepagePinned');
  });

  it('returns enterpriseWide for company-wide audience by default', () => {
    expect(
      deriveApprovalTrigger({
        homepage: homepage(),
        audience: companyWide(),
      }),
    ).toBe('enterpriseWide');
  });

  it('returns standard for targeted audience without pinning', () => {
    expect(
      deriveApprovalTrigger({
        homepage: homepage(),
        audience: targeted([{ dimension: 'department', value: 'SAFETY' }]),
      }),
    ).toBe('standard');
  });

  it('honors treatCompanyWideAsEnterprise=false', () => {
    expect(
      deriveApprovalTrigger(
        { homepage: homepage(), audience: companyWide() },
        { treatCompanyWideAsEnterprise: false },
      ),
    ).toBe('standard');
  });
});

describe('isAudienceVisibleToViewer', () => {
  const viewer: PeopleCultureViewerAudience = {
    tags: [
      { dimension: 'office', value: 'Coral Springs' },
      { dimension: 'department', value: 'SAFETY' },
    ],
  };

  it('company-wide scope always visible', () => {
    expect(isAudienceVisibleToViewer(companyWide(), viewer)).toBe(true);
    expect(isAudienceVisibleToViewer(companyWide(), undefined)).toBe(true);
  });

  it('targeted scope is visible when a tag matches', () => {
    expect(
      isAudienceVisibleToViewer(
        targeted([{ dimension: 'office', value: 'Coral Springs' }]),
        viewer,
      ),
    ).toBe(true);
  });

  it('targeted scope is invisible when no tag matches', () => {
    expect(
      isAudienceVisibleToViewer(
        targeted([{ dimension: 'office', value: 'Tampa' }]),
        viewer,
      ),
    ).toBe(false);
  });

  it('targeted scope is invisible without viewer', () => {
    expect(
      isAudienceVisibleToViewer(
        targeted([{ dimension: 'office', value: 'Coral Springs' }]),
        undefined,
      ),
    ).toBe(false);
  });

  it('empty targeted scope fails closed', () => {
    expect(isAudienceVisibleToViewer({ kind: 'targeted', tags: [] }, viewer)).toBe(false);
  });
});

describe('resolveMediaSource', () => {
  it('resolves a profilePhoto via the resolver and tags the source kind', () => {
    const resolved = resolveMediaSource({ kind: 'profilePhoto', personId: 'u1' }, (id) =>
      id === 'u1' ? { src: '/p/u1.jpg', alt: 'Jordan' } : undefined,
    );
    expect(resolved).toEqual({
      slot: { src: '/p/u1.jpg', alt: 'Jordan' },
      sourceKind: 'profilePhoto',
    });
  });

  it('returns undefined for profilePhoto when resolver has no match', () => {
    expect(resolveMediaSource({ kind: 'profilePhoto', personId: 'u1' })).toBeUndefined();
  });

  it('resolves direct uploads and tags them correctly', () => {
    const cases: Array<{ source: PeopleCultureMediaSource; expected: string }> = [
      { source: { kind: 'hrUpload', src: '/a', alt: 'A' }, expected: 'hrUpload' },
      { source: { kind: 'campaignArtwork', src: '/b', alt: 'B' }, expected: 'campaignArtwork' },
      { source: { kind: 'eventPhotography', src: '/c', alt: 'C' }, expected: 'eventPhotography' },
    ];
    for (const { source, expected } of cases) {
      const result = resolveMediaSource(source);
      expect(result?.sourceKind).toBe(expected);
      expect(result?.slot.src).toBeTruthy();
    }
  });

  it('returns undefined for none', () => {
    expect(resolveMediaSource({ kind: 'none' })).toBeUndefined();
  });
});

describe('hasPeopleCultureCapability', () => {
  it('grants editors create and submit but not approve', () => {
    expect(hasPeopleCultureCapability('editor', 'canCreate')).toBe(true);
    expect(hasPeopleCultureCapability('editor', 'canSubmitForApproval')).toBe(true);
    expect(hasPeopleCultureCapability('editor', 'canApprove')).toBe(false);
    expect(hasPeopleCultureCapability('editor', 'canPin')).toBe(false);
  });

  it('grants approvers publish and pin', () => {
    expect(hasPeopleCultureCapability('approver', 'canPublish')).toBe(true);
    expect(hasPeopleCultureCapability('approver', 'canPin')).toBe(true);
    expect(hasPeopleCultureCapability('approver', 'canManageHomepage')).toBe(true);
  });

  it('treats undefined role as no capability', () => {
    expect(hasPeopleCultureCapability(undefined, 'canCreate')).toBe(false);
  });
});

describe('normalizePeopleCulturePublicConfig', () => {
  const viewer: PeopleCultureViewerAudience = {
    tags: [{ dimension: 'office', value: 'Coral Springs' }],
  };

  it('returns empty output for undefined input', () => {
    const result = normalizePeopleCulturePublicConfig(undefined);
    expect(result.heading).toBe('People and Culture');
    expect(result.isEmpty).toBe(true);
    expect(result.featured).toEqual([]);
    expect(result.supporting).toEqual([]);
  });

  it('drops items outside the live/expiringSoon states', () => {
    const result = normalizePeopleCulturePublicConfig(
      {
        items: [
          makeItem({ id: 'a', lifecycleState: 'draft' }),
          makeItem({ id: 'b', lifecycleState: 'needsApproval' }),
          makeItem({ id: 'c', lifecycleState: 'scheduled' }),
          makeItem({ id: 'd', lifecycleState: 'archived' }),
          makeItem({ id: 'e', lifecycleState: 'expired' }),
          makeItem({ id: 'f', lifecycleState: 'suppressed' }),
          makeItem({ id: 'g', lifecycleState: 'live', homepage: homepage({ tier: 'supporting' }) }),
          makeItem({ id: 'h', lifecycleState: 'expiringSoon', homepage: homepage({ tier: 'supporting' }) }),
        ],
      },
      { viewer },
    );
    expect(result.supporting.map((i) => i.id)).toEqual(['g', 'h']);
    expect(result.featured).toEqual([]);
  });

  it('enforces tier caps and partitions featured/supporting', () => {
    const result = normalizePeopleCulturePublicConfig({
      maxFeatured: 1,
      maxSupporting: 2,
      items: [
        makeItem({ id: 'f1', homepage: homepage({ tier: 'featured', order: 2 }) }),
        makeItem({ id: 'f2', homepage: homepage({ tier: 'featured', order: 1 }) }),
        makeItem({ id: 's1', homepage: homepage({ tier: 'supporting', order: 1 }) }),
        makeItem({ id: 's2', homepage: homepage({ tier: 'supporting', order: 2 }) }),
        makeItem({ id: 's3', homepage: homepage({ tier: 'supporting', order: 3 }) }),
        makeItem({ id: 'x', homepage: homepage({ tier: 'excluded' }) }),
      ],
    });
    expect(result.featured.map((i) => i.id)).toEqual(['f2']);
    expect(result.supporting.map((i) => i.id)).toEqual(['s1', 's2']);
  });

  it('ranks pinned items above unpinned within a tier', () => {
    const result = normalizePeopleCulturePublicConfig({
      items: [
        makeItem({ id: 'a', homepage: homepage({ tier: 'featured', order: 1 }) }),
        makeItem({
          id: 'b',
          homepage: homepage({ tier: 'featured', order: 10, isPinned: true }),
        }),
      ],
    });
    expect(result.featured.map((i) => i.id)).toEqual(['b', 'a']);
  });

  it('filters targeted items by viewer audience', () => {
    const result = normalizePeopleCulturePublicConfig(
      {
        items: [
          makeItem({
            id: 'visible',
            homepage: homepage({ tier: 'supporting' }),
            audience: targeted([{ dimension: 'office', value: 'Coral Springs' }]),
          }),
          makeItem({
            id: 'hidden',
            homepage: homepage({ tier: 'supporting' }),
            audience: targeted([{ dimension: 'office', value: 'Tampa' }]),
          }),
        ],
      },
      { viewer },
    );
    expect(result.supporting.map((i) => i.id)).toEqual(['visible']);
  });
});

describe('countLifecycleStatesByFamily', () => {
  it('counts states per family independently', () => {
    const counts = countLifecycleStatesByFamily([
      makeItem({ id: 'a', family: 'announcement', lifecycleState: 'live' }),
      makeItem({ id: 'b', family: 'announcement', lifecycleState: 'draft' }),
      makeItem({ id: 'c', family: 'celebrationMilestone', lifecycleState: 'scheduled' }),
      makeItem({ id: 'd', family: 'cultureProgramEvent', lifecycleState: 'expired' }),
    ]);
    expect(counts.announcement.live).toBe(1);
    expect(counts.announcement.draft).toBe(1);
    expect(counts.celebrationMilestone.scheduled).toBe(1);
    expect(counts.cultureProgramEvent.expired).toBe(1);
    expect(counts.announcement.archived).toBe(0);
  });
});

describe('buildCompanionOverview', () => {
  it('aggregates pending approvals, upcoming scheduled, and homepage conflicts', () => {
    const result = buildCompanionOverview(
      {
        items: [
          makeItem({ id: 'a', lifecycleState: 'needsApproval' }),
          makeItem({
            id: 'b',
            lifecycleState: 'scheduled',
            scheduledStart: '2026-04-12T00:00:00Z',
          }),
          makeItem({ id: 'c', lifecycleState: 'expiringSoon' }),
          makeItem({
            id: 'd',
            lifecycleState: 'live',
            homepage: homepage({ conflictReason: 'pinnedOverflow' }),
          }),
        ],
        milestoneCandidates: [
          {
            id: 'm1',
            candidateType: 'birthday',
            personId: 'u1',
            personDisplayName: 'Jordan',
            occursOn: '2026-04-15',
            generatedAt: '2026-04-01T00:00:00Z',
            sourceSystem: 'PeopleData',
            reviewState: 'pendingReview',
          },
          {
            id: 'm2',
            candidateType: 'birthday',
            personId: 'u2',
            personDisplayName: 'Taylor',
            occursOn: '2026-04-16',
            generatedAt: '2026-04-01T00:00:00Z',
            sourceSystem: 'PeopleData',
            reviewState: 'accepted',
          },
        ],
        intakeSubmissions: [
          {
            id: 'i1',
            submittedBy: { id: 's1', displayName: 'Mgr' },
            submitterRole: 'manager',
            submittedAt: '2026-04-01T00:00:00Z',
            suggestedFamily: 'announcement',
            title: 'Foo',
            body: 'Bar',
            reviewState: 'awaitingHrReview',
          },
        ],
      },
      { now: NOW },
    );
    expect(result.pendingApprovals.map((i) => i.id)).toEqual(['a']);
    expect(result.upcomingScheduled.map((i) => i.id)).toEqual(['b']);
    expect(result.expiringSoonItems.map((i) => i.id)).toEqual(['c']);
    expect(result.homepageConflicts.map((i) => i.id)).toEqual(['d']);
    expect(result.pendingMilestoneCandidates.map((c) => c.id)).toEqual(['m1']);
    expect(result.pendingIntakeSubmissions.map((s) => s.id)).toEqual(['i1']);
  });
});

describe('detectHomepageConflicts', () => {
  it('flags pinned overflow', () => {
    const items = [
      makeItem({ id: 'p1', homepage: homepage({ tier: 'featured', isPinned: true, order: 1 }) }),
      makeItem({ id: 'p2', homepage: homepage({ tier: 'featured', isPinned: true, order: 2 }) }),
      makeItem({ id: 'p3', homepage: homepage({ tier: 'featured', isPinned: true, order: 3 }) }),
    ];
    const result = detectHomepageConflicts(items, { maxPinned: 2, maxFeatured: 3 });
    expect(result.get('p3')).toBe('pinnedOverflow');
    expect(result.has('p1')).toBe(false);
    expect(result.has('p2')).toBe(false);
  });

  it('flags featured overflow', () => {
    const items = [
      makeItem({ id: 'a', homepage: homepage({ tier: 'featured', order: 1 }) }),
      makeItem({ id: 'b', homepage: homepage({ tier: 'featured', order: 2 }) }),
      makeItem({ id: 'c', homepage: homepage({ tier: 'featured', order: 3 }) }),
    ];
    const result = detectHomepageConflicts(items, { maxFeatured: 2 });
    expect(result.get('c')).toBe('featuredOverflow');
  });

  it('flags expiringWhilePinned', () => {
    const items = [
      makeItem({
        id: 'e',
        lifecycleState: 'expiringSoon',
        homepage: homepage({ tier: 'featured', isPinned: true }),
      }),
    ];
    const result = detectHomepageConflicts(items);
    expect(result.get('e')).toBe('expiringWhilePinned');
  });
});
