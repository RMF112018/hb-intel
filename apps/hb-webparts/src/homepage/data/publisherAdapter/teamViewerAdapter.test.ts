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

function post(over: Partial<PublisherArticleRow> = {}): PublisherArticleRow {
  return {
    ArticleId: 'post-tv-1',
    Title: 'T',
    Subhead: 'S',
    SummaryExcerpt: 'x',
    BodyRichText: 'y',
    ArticleContentType: 'monthlySpotlight',
    TemplateKey: 'ps-inprogress-monthly-v1',
    Slug: 'post-tv-1',
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
    ArticleId: 'post-tv-1',
    TeamMemberId: id,
    PersonPrincipal: `${id}@example.com`,
    DisplayName: id,
    ...over,
  };
}

describe('buildTeamViewerProperties', () => {
  it('emits the exact property contract the Project Spotlight shell expects', () => {
    const props = buildTeamViewerProperties(
      post({
      }),
    );
    expect(props).toEqual({
      heading: 'Project Team',
      articleId: 'post-tv-1',
      destinationKey: 'projectSpotlight',
      listHostOverride: undefined,
      layout: 'list',
      density: 'compact',
      featureFlags: { profileDetailDrawer: true },
    });
  });

  it('falls back to canonical defaults when optional post fields are unset', () => {
    const props = buildTeamViewerProperties(post());
    expect(props.heading).toBe(TEAM_VIEWER_DEFAULT_HEADING);
    expect(props.layout).toBe('grid');
    expect(props.density).toBe('standard');
    expect(props.featureFlags.profileDetailDrawer).toBe(false);
    expect(props.destinationKey).toBe('projectSpotlight');
  });

  it('locks destinationKey to projectSpotlight regardless of post input', () => {
    // Operating-charter rule 1: single destination.
    const props = buildTeamViewerProperties(post());
    expect(props.destinationKey).toBe('projectSpotlight');
  });
});

describe('selectVisibleTeamMembers', () => {
  it('drops members explicitly excluded from the viewer', () => {
    const rows = [
      member('alice'),
      member('bob', { IncludeInViewer: false }),
      member('carol'),
    ];
    expect(selectVisibleTeamMembers(rows).map((r) => r.TeamMemberId)).toEqual([
      'alice',
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
      JobTitle: 'PM',
      PhotoUrl: 'https://img/a.jpg',
      SortOrder: 3,
      BioSnippet: 'bio',
      ResumeRichText: '<p>resume</p>',
      ResumeDocumentUrl: 'https://doc/a.pdf',
      ContactLink: 'https://contact/a',
    });
    expect(mapPublisherRowToTeamViewerPerson(row)).toEqual({
      id: 'alice',
      articleId: 'post-tv-1',
      articleTeamMemberId: 'alice',
      displayName: 'alice',
      jobTitle: 'PM',
      photoUrl: 'https://img/a.jpg',
      sortOrder: 3,
      bio: 'bio',
      resumeRichText: '<p>resume</p>',
      resumeDocumentUrl: 'https://doc/a.pdf',
      profileUrl: 'https://contact/a',
    });
  });
});

describe('buildTeamViewerPersonList', () => {
  it('applies visibility filter + ordering + row mapping in one pass', () => {
    const out = buildTeamViewerPersonList([
      member('alice', { SortOrder: 2 }),
      member('bob', { IncludeInViewer: false }),
      member('carol', { SortOrder: 1 }),
    ]);
    expect(out.map((p) => p.id)).toEqual(['carol', 'alice']);
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
