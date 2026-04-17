import { describe, expect, it } from 'vitest';
import type {
  PublisherMediaRow,
  PublisherPageBindingRow,
  PublisherArticleRow,
  PublisherTeamMemberRow,
  PublisherTemplateRegistryRow,
} from '../publisherContracts';
import type { PublishResolutionContext } from '../publishResolutionContext';
import type { TemplateResolutionTrace } from '../templateResolver';
import {
  composeProjectSpotlightPage,
  validateComposedPageStructure,
  type BannerControlPayload,
  type TeamViewerControlPayload,
  type ImageGalleryControlPayload,
} from './pageCompositor';
import { PROJECT_SPOTLIGHT_V1_SHELL } from './xmlShellManifest';

function article(over: Partial<PublisherArticleRow> = {}): PublisherArticleRow {
  return {
    ArticleId: 'art-001',
    Title: 'Acme Tower — April Spotlight',
    Subhead: 'Concrete pour wrapped under budget',
    SummaryExcerpt: 'A short rollup summary.',
    BodyRichText: '<p>Full body rich text.</p>',
    ArticleContentType: 'monthlySpotlight',
    SpotlightType: 'inProgress',
    TemplateKey: 'ps-inprogress-monthly-v1',
    Slug: 'acme-tower-april',
    WorkflowState: 'approved',
    CreatedDateUtc: '2026-04-10T00:00:00Z',
    UpdatedDateUtc: '2026-04-12T00:00:00Z',
    ProjectId: 'PRJ-0099',
    ProjectName: 'Acme Tower',
    HeroPrimaryImage: 'https://img.example/banner.jpg',
    HeroPrimaryImageAltText: 'Aerial view of Acme Tower',
    TargetSiteUrl:
      'https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight',
    SourceTemplatePath:
      'SitePages/Templates/Project-Spotlight---In-Progress.aspx',
    ...over,
  } as PublisherArticleRow;
}

function template(
  over: Partial<PublisherTemplateRegistryRow> = {},
): PublisherTemplateRegistryRow {
  return {
    TemplateKey: 'ps-inprogress-monthly-v1',
    TemplateName: "Test Template",
    IsActive: true,
    TemplatePriority: 100,
    VersionLabel: "1.0.0",
    ContentTypes: ["monthlySpotlight"],
    Destination: "projectSpotlight",
    PageShellTemplateKey: "ps-shell-inprogress-oob-banner-team-gallery-v1",
    HeroProfileKey: "hbSignatureHero",
    BodyProfileKey: "oobText",
    TeamViewerProfileKey: "teamViewer",
    GalleryProfileKey: "oobImageGallery",
    ShowHero: true,
    ShowBody: true,
    ShowTeamViewer: true,
    ShowGallery: true,
    ShowSecondaryImage: false,
    RequiredFieldSetKey: "req-ps-inprogress-monthly-v1",
    ...over,
  } as PublisherTemplateRegistryRow;
}

function member(id: string, over: Partial<PublisherTeamMemberRow> = {}): PublisherTeamMemberRow {
  return {
    ArticleId: 'art-001',
    TeamMemberId: id,
    Title: id,
    PersonPrincipal: `${id}@example.com`,
    DisplayName: id,
    ...over,
  };
}

function mediaRow(id: string, over: Partial<PublisherMediaRow> = {}): PublisherMediaRow {
  return {
    ArticleId: 'art-001',
    MediaId: id,
    Title: id,
    MediaRole: 'gallery',
    ImageAsset: `https://img.example/${id}.jpg`,
    AltText: `${id} alt`,
    ...over,
  };
}

function context(over: {
  article?: Partial<PublisherArticleRow>;
  template?: Partial<PublisherTemplateRegistryRow>;
  teamMembers?: readonly PublisherTeamMemberRow[];
  media?: readonly PublisherMediaRow[];
  existingBinding?: PublisherPageBindingRow;
} = {}): PublishResolutionContext {
  const trace: TemplateResolutionTrace = {
    input: { ArticleContentType: 'monthlySpotlight', Destination: 'projectSpotlight' },
    steps: [],
    selectedKey: 'ps-inprogress-monthly-v1',
    selectionRule: 'applicability',
  };
  return {
    article: article(over.article),
    template: template(over.template),
    teamMembers: over.teamMembers ?? [],
    media: over.media ?? [],
    existingBinding: over.existingBinding,
    decisionTrace: trace,
  };
}

describe('composeProjectSpotlightPage', () => {
  it('emits exactly five slot controls in shell order', () => {
    const page = composeProjectSpotlightPage(
      context({
        teamMembers: [member('alice'), member('bob')],
        media: [mediaRow('img-1'), mediaRow('img-2')],
      }),
      PROJECT_SPOTLIGHT_V1_SHELL,
    );
    expect(page.controls.map((c) => c.slot)).toEqual([
      'banner',
      'subhead',
      'body',
      'team',
      'gallery',
    ]);
    expect(validateComposedPageStructure(page)).toEqual([]);
  });

  it('populates the banner from article fields and falls back to Title when HeroTitle is unset', () => {
    const page = composeProjectSpotlightPage(
      context({
        teamMembers: [member('alice')],
        media: [mediaRow('img-1')],
      }),
      PROJECT_SPOTLIGHT_V1_SHELL,
    );
    const banner = page.controls.find((c) => c.slot === 'banner') as BannerControlPayload;
    expect(banner.visible).toBe(true);
    expect(banner.title).toBe('Acme Tower — April Spotlight');
    expect(banner.imageUrl).toBe('https://img.example/banner.jpg');
    expect(banner.imageAltText).toBe('Aerial view of Acme Tower');
    expect(banner.layoutType).toBe('FullWidthImage');
  });

  it('sets TeamViewer properties from advanced article fields', () => {
    const page = composeProjectSpotlightPage(
      context({
        article: {
          TeamViewerTitle: 'Project Team',
          TeamViewerMode: 'summaryExpand',
          TeamViewerAllowExpand: true,
        },
        teamMembers: [
          member('alice', { SortOrder: 2 }),
          member('bob', { SortOrder: 1 }),
          member('carol', { SortOrder: 3 }),
        ],
      }),
      PROJECT_SPOTLIGHT_V1_SHELL,
    );
    const team = page.controls.find((c) => c.slot === 'team');
    expect(team?.visible).toBe(true);
    if (!team?.visible) return;
    const tvp = team as TeamViewerControlPayload;
    expect(tvp.properties.heading).toBe('Project Team');
    expect(tvp.properties.layout).toBe('strip');
    expect(tvp.properties.density).toBe('expanded');
    expect(tvp.properties.flags.profileDetailDrawer).toBe(true);
    expect(tvp.properties.articleId).toBe('art-001');
  });

  it('does not add a secondary-image control slot (field is persisted but composition is deferred)', () => {
    const page = composeProjectSpotlightPage(
      context({
        article: {
          ShowSecondaryImage: true,
          SecondaryImage: 'https://img.example/secondary.jpg',
          SecondaryImageAltText: 'Secondary',
          SecondaryImageCaption: 'caption',
        },
      }),
      PROJECT_SPOTLIGHT_V1_SHELL,
    );
    expect(page.controls.map((c) => c.slot)).not.toContain('secondary');
    expect(page.controls).toHaveLength(5);
  });

  it('hides the team block when the template disables it', () => {
    const page = composeProjectSpotlightPage(
      context({
        template: { ShowTeamViewer: false, TeamViewerProfileKey: 'none' },
        teamMembers: [member('alice')],
      }),
      PROJECT_SPOTLIGHT_V1_SHELL,
    );
    const team = page.controls.find((c) => c.slot === 'team');
    expect(team?.visible).toBe(false);
  });

  it('hides the gallery when there are no gallery-role media rows', () => {
    const page = composeProjectSpotlightPage(
      context({ media: [mediaRow('img-1', { MediaRole: 'supporting' })] }),
      PROJECT_SPOTLIGHT_V1_SHELL,
    );
    const gallery = page.controls.find((c) => c.slot === 'gallery');
    expect(gallery?.visible).toBe(false);
  });

  it('hides gallery when template ShowGallery=false independent of media rows', () => {
    const page = composeProjectSpotlightPage(
      context({
        template: { ShowGallery: false, GalleryProfileKey: 'none' },
        media: [mediaRow('img-1')],
      }),
      PROJECT_SPOTLIGHT_V1_SHELL,
    );
    const gallery = page.controls.find((c) => c.slot === 'gallery');
    expect(gallery?.visible).toBe(false);
  });

  it('orders gallery images by SortOrder ascending', () => {
    const page = composeProjectSpotlightPage(
      context({
        media: [
          mediaRow('a', { SortOrder: 3 }),
          mediaRow('b', { SortOrder: 1 }),
          mediaRow('c', { SortOrder: 2 }),
        ],
      }),
      PROJECT_SPOTLIGHT_V1_SHELL,
    );
    const gallery = page.controls.find((c) => c.slot === 'gallery') as ImageGalleryControlPayload;
    expect(gallery.visible).toBe(true);
    expect(gallery.images.map((i) => i.imageUrl)).toEqual([
      'https://img.example/b.jpg',
      'https://img.example/c.jpg',
      'https://img.example/a.jpg',
    ]);
  });

  it('stamps shell + template identity onto the composed page', () => {
    const page = composeProjectSpotlightPage(
      context({
        teamMembers: [member('alice')],
        media: [mediaRow('img-1')],
      }),
      PROJECT_SPOTLIGHT_V1_SHELL,
    );
    expect(page.identity.shellKey).toBe(PROJECT_SPOTLIGHT_V1_SHELL.shellKey);
    expect(page.identity.shellVersion).toBe(PROJECT_SPOTLIGHT_V1_SHELL.shellVersion);
    expect(page.identity.templateKey).toBe('ps-inprogress-monthly-v1');
    expect(page.identity.templateVersion).toBe('1.0.0');
    expect(page.identity.pageName).toBe('acme-tower-april.aspx');
  });

  it('prefers PageName when it is set', () => {
    const page = composeProjectSpotlightPage(
      context({ article: { PageName: 'custom-page.aspx' } }),
      PROJECT_SPOTLIGHT_V1_SHELL,
    );
    expect(page.identity.pageName).toBe('custom-page.aspx');
  });
});

describe('validateComposedPageStructure', () => {
  it('returns empty list when the five slots are all present once', () => {
    const page = composeProjectSpotlightPage(
      context({
        teamMembers: [member('alice')],
        media: [mediaRow('img-1')],
      }),
      PROJECT_SPOTLIGHT_V1_SHELL,
    );
    expect(validateComposedPageStructure(page)).toEqual([]);
  });
});
