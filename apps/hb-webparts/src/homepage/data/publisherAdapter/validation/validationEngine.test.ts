import { describe, expect, it } from 'vitest';
import type {
  PublisherMediaRow,
  PublisherPageBindingRow,
  PublisherArticleRow,
  PublisherTeamMemberRow,
  PublisherTemplateRegistryRow,
} from '../publisherContracts';
import type { PublishResolutionContext } from '../publishResolutionContext';
import { PROJECT_SPOTLIGHT_V1_SHELL } from '../pageGeneration/xmlShellManifest';
import { validatePublishContext } from './validationEngine';

function article(over: Partial<PublisherArticleRow> = {}): PublisherArticleRow {
  return {
    ArticleId: 'art-001',
    Title: 'A Well-Formed Title',
    ArticleContentType: 'monthlySpotlight',
    Subhead: 'A subhead',
    SummaryExcerpt: 'A summary.',
    BodyRichText: '<p>Body content.</p>',
    SpotlightType: 'monthly',
    ProjectStage: 'active',
    TemplateKey: 'ps-inprogress-monthly-v1',
    Slug: 'a-well-formed-slug',
    WorkflowState: 'approved',
    CreatedDateUtc: '2026-04-10T00:00:00Z',
    UpdatedDateUtc: '2026-04-12T00:00:00Z',
    ProjectId: 'PRJ-1',
    ProjectName: 'Project One',
    HeroPrimaryImage: 'https://img.example/banner.jpg',
    HeroPrimaryImageAltText: 'Banner alt',
    TargetSiteUrl:
      'https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight',
    Destination: 'projectSpotlight',
    ...over,
  } as PublisherArticleRow;
}

function tpl(
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
    RequiredFieldSetKey: "req-default",
    ...over,
  } as PublisherTemplateRegistryRow;
}

function context(over: {
  article?: Partial<PublisherArticleRow>;
  template?: Partial<PublisherTemplateRegistryRow>;
  teamMembers?: readonly PublisherTeamMemberRow[];
  media?: readonly PublisherMediaRow[];
  existingBinding?: PublisherPageBindingRow;
} = {}): PublishResolutionContext {
  return {
    article: article(over.article),
    template: tpl(over.template),
    teamMembers: over.teamMembers ?? [
      {
        ArticleId: 'art-001',
        TeamMemberId: 'tm-1',
        PersonPrincipal: 'alice@example.com',
        DisplayName: 'Alice',
      },
    ],
    media: over.media ?? [
      {
        ArticleId: 'art-001',
        MediaId: 'm-1',
        MediaRole: 'gallery',
        ImageAssetUrl: 'https://img.example/g1.jpg',
        AltText: 'gallery 1',
      },
    ],
    existingBinding: over.existingBinding,
    decisionTrace: {
      input: { ArticleContentType: 'monthlySpotlight', Destination: 'projectSpotlight' },
      steps: [],
      selectedKey: 'ps-inprogress-monthly-v1',
      selectionRule: 'applicability',
    },
  };
}

describe('validatePublishContext', () => {
  it('returns ok=true for a well-formed monthly spotlight', () => {
    const result = validatePublishContext(context());
    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
    // Slug presence is enforced as an error; uniqueness is enforced
    // at hosted publish time, not in-session.
    expect(
      result.warnings.some((w) => w.category === 'invalid-slug'),
    ).toBe(false);
  });

  it('flags missing Title as missing-required-field error', () => {
    const result = validatePublishContext(context({ article: { Title: '' } }));
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.field === 'Title')).toBe(true);
  });

  it('flags ShowTeamViewer=true with no included team members', () => {
    const result = validatePublishContext(
      context({
        article: { ShowTeamViewer: true },
        teamMembers: [
          {
            ArticleId: 'art-001',
            TeamMemberId: 'tm-1',
            PersonPrincipal: 'x',
            DisplayName: 'X',
            IncludeInViewer: false,
          },
        ],
      }),
    );
    expect(result.errors.some((e) => e.category === 'invalid-team-configuration')).toBe(true);
  });

  it('flags ShowGallery with no gallery-role media', () => {
    const result = validatePublishContext(
      context({ media: [] }),
    );
    expect(result.errors.some((e) => e.category === 'invalid-gallery-configuration')).toBe(true);
  });

  it('flags gallery images missing alt text with a field path', () => {
    const result = validatePublishContext(
      context({
        media: [
          {
            ArticleId: 'art-001',
            MediaId: 'm-1',
            MediaRole: 'gallery',
            ImageAssetUrl: 'https://img.example/g1.jpg',
            AltText: '',
          },
        ],
      }),
    );
    const finding = result.errors.find(
      (e) => e.category === 'invalid-image-accessibility',
    );
    expect(finding).toBeDefined();
    expect(finding?.field).toBe('media[0].AltText');
  });

  it('enforces milestone required fields when the template requires them', () => {
    const result = validatePublishContext(
      context({
        template: { RequiredFieldSetKey: 'req-ps-inprogress-milestone-v1' },
      }),
    );
    const keys = result.errors.map((e) => e.field);
    expect(keys).toContain('MilestoneLabel');
    expect(keys).toContain('MilestoneDateUtc');
  });

  it('warns when template expects hbSignatureHero on the current OOB shell', () => {
    const result = validatePublishContext(
      context({ template: { } }),
    );
    const match = result.warnings.find(
      (w) => w.category === 'invalid-shell-compatibility',
    );
    expect(match).toBeDefined();
  });

  it('warns on shell version drift when the template forces regeneration', () => {
    const result = validatePublishContext(
      context({
        template: { },
        existingBinding: {
          BindingId: 'b-1',
          ArticleId: 'art-001',
          Title: 'Acme Tower — April',
          PublishStatus: 'published',
          TargetSiteUrl:
            'https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight',
          PageName: 'p.aspx',
          PageShellVersion: '0.9.0',
          PageTemplateKey: 'ps-inprogress-monthly-v1',
          RenderVersion: '1.0.0',
        },
      }),
    );
    expect(
      result.warnings.some(
        (w) =>
          w.category === 'page-generation-blocker' &&
          w.field === 'existingBinding.PageShellVersion',
      ),
    ).toBe(true);
  });

  it('tolerates an unknown RequiredFieldSetKey with an invalid-template-match warning', () => {
    const result = validatePublishContext(
      context({ template: { RequiredFieldSetKey: 'req-unknown' } }),
    );
    expect(
      result.warnings.some(
        (w) =>
          w.category === 'invalid-template-match' &&
          w.field === 'template.RequiredFieldSetKey',
      ),
    ).toBe(true);
    // Still ok because global rules pass on a well-formed post.
    expect(result.ok).toBe(true);
  });

  it('flags an invalid Destination (companyPulse not yet implemented)', () => {
    const result = validatePublishContext(
      context({
        article: { Destination: 'companyPulse' },
      }),
    );
    expect(result.ok).toBe(false);
    expect(
      result.errors.some(
        (e) => e.category === 'invalid-template-match' && e.field === 'Destination',
      ),
    ).toBe(true);
  });
});
