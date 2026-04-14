/**
 * Publisher ↔ TeamViewer integration contract drift guard.
 *
 * Pins the unification settled by Phase-02 Prompt-13:
 *   - The publisher's `PublisherTeamViewerProperties` is the canonical
 *     `TeamViewerConfig` from the TeamViewer webpart contracts. The
 *     two surfaces share one shape.
 *   - The publisher's person-row mapper produces the canonical
 *     `TeamViewerPerson` shape (the publisher fills the subset of
 *     fields it can know; Graph enrichment fills the rest at render).
 *   - Both surfaces key off `articleId` (no `PostId` translation
 *     anywhere in the integration seam).
 *   - Layout / density enum values produced by the publisher are
 *     valid members of the webpart's enums (no enum drift).
 */
import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  TEAM_VIEWER_DEFAULT_HEADING,
  buildTeamViewerProperties,
  mapPublisherRowToTeamViewerPerson,
  selectVisibleTeamMembers,
  type PublisherTeamViewerPerson,
  type PublisherTeamViewerProperties,
} from './teamViewerAdapter';
import type {
  PublisherArticleRow,
  PublisherTeamMemberRow,
} from './publisherContracts';
import type {
  TeamViewerConfig,
  TeamViewerDensity,
  TeamViewerLayout,
  TeamViewerPerson,
} from '../teamViewerContracts';

const ARTICLE_ID = 'art-shared-001';

function article(over: Partial<PublisherArticleRow> = {}): PublisherArticleRow {
  return {
    ArticleId: ARTICLE_ID,
    Title: 'Shared contract article',
    ArticleContentType: 'monthlySpotlight',
    Destination: 'projectSpotlight',
    Slug: 'shared',
    TemplateKey: 'tmpl-v1',
    WorkflowState: 'approved',
    Subhead: 'sub',
    SummaryExcerpt: 'sum',
    BodyRichText: '<p>body</p>',
    HeroPrimaryImage: 'https://img.example/h.jpg',
    HeroPrimaryImageAltText: 'alt',
    CreatedDateUtc: '2026-04-01T00:00:00Z',
    UpdatedDateUtc: '2026-04-10T00:00:00Z',
    TargetSiteUrl:
      'https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight',
    ...over,
  };
}

describe('publisher ↔ TeamViewer integration uses one shared contract', () => {
  it('PublisherTeamViewerProperties is exactly TeamViewerConfig', () => {
    expectTypeOf<PublisherTeamViewerProperties>().toEqualTypeOf<TeamViewerConfig>();
  });

  it('PublisherTeamViewerPerson is exactly TeamViewerPerson', () => {
    expectTypeOf<PublisherTeamViewerPerson>().toEqualTypeOf<TeamViewerPerson>();
  });

  it('publisher emits the canonical TeamViewer JSON shape (flags, never featureFlags)', () => {
    const props = buildTeamViewerProperties(article());
    expect(props.heading).toBe(TEAM_VIEWER_DEFAULT_HEADING);
    expect(props.articleId).toBe(ARTICLE_ID);
    expect(props.destinationKey).toBe('projectSpotlight');
    expect(props.layout).toBe<TeamViewerLayout>('grid');
    expect(props.density).toBe<TeamViewerDensity>('standard');
    expect(props.flags.profileDetailDrawer).toBe(false);
    // The legacy 'featureFlags' name is gone from the seam.
    expect((props as unknown as Record<string, unknown>)['featureFlags']).toBeUndefined();
  });

  it('publisher uses the article.Destination as the canvas destinationKey (no hard-coded value)', () => {
    const props = buildTeamViewerProperties(
      article({ Destination: 'companyPulse' }),
    );
    expect(props.destinationKey).toBe('companyPulse');
  });

  it('emitted layout / density values are members of the canonical webpart enums', () => {
    const props = buildTeamViewerProperties(article());
    const validLayouts: readonly TeamViewerLayout[] = [
      'grid',
      'rail',
      'strip',
      'grouped',
    ];
    const validDensities: readonly TeamViewerDensity[] = [
      'compact',
      'standard',
      'expanded',
    ];
    expect(validLayouts).toContain(props.layout);
    expect(validDensities).toContain(props.density);
  });

  it('row mapper yields a TeamViewerPerson keyed by articleId (no PostId translation)', () => {
    const childRow: PublisherTeamMemberRow = {
      ArticleId: ARTICLE_ID,
      TeamMemberId: 'tm-1',
      Title: 'Alice',
      PersonPrincipal: 'alice@example.com',
      DisplayName: 'Alice',
      Role: 'PM',
      SortOrder: 1,
      BioSnippet: 'Bio.',
      ContactLink: 'https://ppl.example/alice',
    };
    const person: TeamViewerPerson = mapPublisherRowToTeamViewerPerson(childRow);
    expect(person.id).toBe('tm-1');
    expect(person.articleId).toBe(ARTICLE_ID);
    expect(person.articleTeamMemberId).toBe('tm-1');
    expect(person.displayName).toBe('Alice');
    // No PostId field exists on the integration seam.
    expect((person as unknown as Record<string, unknown>)['postId']).toBeUndefined();
    expect((person as unknown as Record<string, unknown>)['PostId']).toBeUndefined();
  });

  it('selectVisibleTeamMembers stable-sorts every authored row by SortOrder + DisplayName', () => {
    const rows: PublisherTeamMemberRow[] = [
      {
        ArticleId: ARTICLE_ID,
        TeamMemberId: 'tm-2',
        Title: 'Bob',
        PersonPrincipal: 'b',
        DisplayName: 'Bob',
        SortOrder: 2,
      },
      {
        ArticleId: ARTICLE_ID,
        TeamMemberId: 'tm-1',
        Title: 'Alice',
        PersonPrincipal: 'a',
        DisplayName: 'Alice',
        SortOrder: 1,
      },
    ];
    const visible = selectVisibleTeamMembers(rows);
    expect(visible.map((r) => r.TeamMemberId)).toEqual(['tm-1', 'tm-2']);
  });
});
