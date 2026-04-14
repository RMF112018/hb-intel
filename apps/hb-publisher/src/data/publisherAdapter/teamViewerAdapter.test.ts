import { describe, expect, it } from 'vitest';
import type {
  PublisherArticleRow,
  PublisherTeamMemberRow,
} from './publisherContracts';
import {
  buildTeamViewerPersonList,
  buildTeamViewerProperties,
  classifyTeamSize,
  mapPublisherRowToTeamViewerPerson,
  selectVisibleTeamMembers,
  TEAM_VIEWER_DEFAULT_HEADING,
} from './teamViewerAdapter';

function article(over: Partial<PublisherArticleRow> = {}): PublisherArticleRow {
  return {
    ArticleId: 'art-tv-1',
    Title: 'T',
    Subhead: 'S',
    SummaryExcerpt: 'x',
    BodyRichText: 'y',
    ArticleContentType: 'monthlySpotlight',
    Destination: 'projectSpotlight',
    TemplateKey: 'ps-inprogress-monthly-v1',
    Slug: 'art-tv-1',
    WorkflowState: 'approved',
    CreatedDateUtc: '2026-04-10T00:00:00Z',
    UpdatedDateUtc: '2026-04-12T00:00:00Z',
    ProjectId: 'PRJ-1',
    ProjectName: 'Project',
    HeroPrimaryImage: 'https://img/x.jpg',
    HeroPrimaryImageAltText: 'alt',
    TargetSiteUrl: 'https://example.com/sites/ProjectSpotlight',
    ...over,
  } as PublisherArticleRow;
}

function member(
  id: string,
  over: Partial<PublisherTeamMemberRow> = {},
): PublisherTeamMemberRow {
  return {
    ArticleId: 'art-tv-1',
    TeamMemberId: id,
    Title: id,
    PersonPrincipal: `${id}@example.com`,
    DisplayName: id,
    ...over,
  };
}

describe('buildTeamViewerProperties', () => {
  it('uses the article TeamViewerTitle as the heading and propagates the article identity', () => {
    const props = buildTeamViewerProperties(
      article({ TeamViewerTitle: 'Project Team' }),
    );
    expect(props).toEqual({
      heading: 'Project Team',
      articleId: 'art-tv-1',
      destinationKey: 'projectSpotlight',
      listHostOverride: undefined,
      layout: 'grid',
      density: 'standard',
      flags: { profileDetailDrawer: false },
    });
  });

  it('falls back to canonical defaults when optional article fields are unset', () => {
    const props = buildTeamViewerProperties(article());
    expect(props.heading).toBe(TEAM_VIEWER_DEFAULT_HEADING);
    expect(props.layout).toBe('grid');
    expect(props.density).toBe('standard');
    expect(props.flags.profileDetailDrawer).toBe(false);
    expect(props.destinationKey).toBe('projectSpotlight');
  });

  it('maps TeamViewerMode to runtime layout/density and TeamViewerAllowExpand to drawer flag', () => {
    const grouped = buildTeamViewerProperties(
      article({ TeamViewerMode: 'grouped', TeamViewerAllowExpand: true }),
    );
    expect(grouped.layout).toBe('grouped');
    expect(grouped.density).toBe('standard');
    expect(grouped.flags.profileDetailDrawer).toBe(true);

    const summaryExpand = buildTeamViewerProperties(
      article({ TeamViewerMode: 'summaryExpand', TeamViewerAllowExpand: false }),
    );
    expect(summaryExpand.layout).toBe('strip');
    expect(summaryExpand.density).toBe('expanded');
    expect(summaryExpand.flags.profileDetailDrawer).toBe(false);
  });

  it('mirrors the article Destination as the canvas destinationKey', () => {
    const ps = buildTeamViewerProperties(article({ Destination: 'projectSpotlight' }));
    expect(ps.destinationKey).toBe('projectSpotlight');
    const cp = buildTeamViewerProperties(article({ Destination: 'companyPulse' }));
    expect(cp.destinationKey).toBe('companyPulse');
  });
});

describe('selectVisibleTeamMembers', () => {
  it('keeps every authored row (tenant schema has no IncludeInViewer column)', () => {
    const rows = [member('alice'), member('bob'), member('carol')];
    expect(selectVisibleTeamMembers(rows).map((r) => r.TeamMemberId)).toEqual([
      'alice',
      'bob',
      'carol',
    ]);
  });

  it('orders by SortOrder ascending with DisplayName tiebreaker', () => {
    const rows = [
      member('carol', { SortOrder: 2, DisplayName: 'Carol' }),
      member('bob', { SortOrder: 1, DisplayName: 'Bob' }),
      member('bart', { SortOrder: 1, DisplayName: 'Bart' }),
    ];
    expect(selectVisibleTeamMembers(rows).map((r) => r.TeamMemberId)).toEqual([
      'bart',
      'bob',
      'carol',
    ]);
  });
});

describe('mapPublisherRowToTeamViewerPerson', () => {
  it('maps every render-visible field and preserves the child-row id', () => {
    const row = member('alice', {
      Role: 'PM',
      Department: 'Delivery',
      GroupKey: 'leads',
      SortOrder: 3,
      BioSnippet: 'bio',
      ContactLink: 'https://contact/a',
    });
    expect(mapPublisherRowToTeamViewerPerson(row)).toEqual({
      id: 'alice',
      articleId: 'art-tv-1',
      articleTeamMemberId: 'alice',
      displayName: 'alice',
      jobTitle: 'PM',
      projectRole: 'PM',
      department: 'Delivery',
      groupKey: 'leads',
      sortOrder: 3,
      bio: 'bio',
      profileUrl: 'https://contact/a',
    });
  });
});

describe('buildTeamViewerPersonList', () => {
  it('orders + maps every authored row', () => {
    const out = buildTeamViewerPersonList([
      member('alice', { SortOrder: 2 }),
      member('bob', { SortOrder: 3 }),
      member('carol', { SortOrder: 1 }),
    ]);
    expect(out.map((p) => p.id)).toEqual(['carol', 'alice', 'bob']);
  });
});

describe('classifyTeamSize', () => {
  it('classifies team counts into informational buckets', () => {
    expect(classifyTeamSize(0)).toBe('empty');
    expect(classifyTeamSize(1)).toBe('small');
    expect(classifyTeamSize(3)).toBe('small');
    expect(classifyTeamSize(4)).toBe('medium');
    expect(classifyTeamSize(8)).toBe('medium');
    expect(classifyTeamSize(9)).toBe('large');
    expect(classifyTeamSize(40)).toBe('large');
  });
});
