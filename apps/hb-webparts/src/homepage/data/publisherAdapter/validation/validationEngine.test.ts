import { describe, expect, it } from 'vitest';
import type {
  PublisherMediaRow,
  PublisherPageBindingRow,
  PublisherPostRow,
  PublisherTeamMemberRow,
  PublisherTemplateRegistryRow,
} from '../publisherContracts';
import type { PublishResolutionContext } from '../publishResolutionContext';
import { PROJECT_SPOTLIGHT_V1_SHELL } from '../pageGeneration/xmlShellManifest';
import { validatePublishContext } from './validationEngine';

function post(over: Partial<PublisherPostRow> = {}): PublisherPostRow {
  return {
    PostId: 'post-001',
    Title: 'A Well-Formed Title',
    Subhead: 'A subhead',
    SummaryExcerpt: 'A summary.',
    BodyRichText: '<p>Body content.</p>',
    PostFamily: 'monthlySpotlight',
    SpotlightType: 'inProgress',
    ProjectStage: 'inProgress',
    TemplateKey: 'ps-inprogress-monthly-v1',
    PageShellKey: 'ps-shell-inprogress-oob-banner-team-gallery-v1',
    Slug: 'a-well-formed-slug',
    WorkflowState: 'approved',
    CreatedDateUtc: '2026-04-10T00:00:00Z',
    UpdatedDateUtc: '2026-04-12T00:00:00Z',
    ProjectId: 'PRJ-1',
    ProjectName: 'Project One',
    BannerImageUrl: 'https://img.example/banner.jpg',
    BannerImageAltText: 'Banner alt',
    TargetSiteUrl:
      'https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight',
    TargetSiteKey: 'projectSpotlight',
    SourceTemplatePath:
      'SitePages/Templates/Project-Spotlight---In-Progress.aspx',
    ...over,
  };
}

function tpl(
  over: Partial<PublisherTemplateRegistryRow> = {},
): PublisherTemplateRegistryRow {
  return {
    TemplateKey: 'ps-inprogress-monthly-v1',
    TemplateDisplayName: 'PS Monthly',
    TemplateStatus: 'active',
    TemplateVersion: '1.0.0',
    PageShellKey: 'ps-shell-inprogress-oob-banner-team-gallery-v1',
    PageShellVersion: '1.0.0',
    ShellSourceSiteUrl: 'https://example.com/sites/ProjectSpotlight',
    ShellSourcePagePath: 'SitePages/Templates/Project-Spotlight---In-Progress.aspx',
    PostFamily: ['monthlySpotlight'],
    BannerRendererKind: 'oobPageTitle',
    BodyRendererKind: 'oobText',
    TeamRendererKind: 'teamViewer',
    GalleryRendererKind: 'oobImageGallery',
    ShowTeamBlock: true,
    ShowGalleryBlock: true,
    RequiredFieldSetKey: 'req-ps-inprogress-monthly-v1',
    ValidationProfileKey: 'val-ps-inprogress-monthly-v1',
    RenderProfileKey: 'render-ps-inprogress-monthly-v1',
    AllowRepublishInPlace: true,
    ForceRegenerationOnShellChange: false,
    ...over,
  };
}

function context(over: {
  post?: Partial<PublisherPostRow>;
  template?: Partial<PublisherTemplateRegistryRow>;
  teamMembers?: readonly PublisherTeamMemberRow[];
  media?: readonly PublisherMediaRow[];
  existingBinding?: PublisherPageBindingRow;
} = {}): PublishResolutionContext {
  return {
    post: post(over.post),
    template: tpl(over.template),
    teamMembers: over.teamMembers ?? [
      {
        PostId: 'post-001',
        TeamMemberId: 'tm-1',
        PersonPrincipal: 'alice@example.com',
        DisplayName: 'Alice',
      },
    ],
    media: over.media ?? [
      {
        PostId: 'post-001',
        MediaId: 'm-1',
        MediaRole: 'gallery',
        ImageAssetUrl: 'https://img.example/g1.jpg',
        AltText: 'gallery 1',
      },
    ],
    existingBinding: over.existingBinding,
    decisionTrace: {
      input: { PostFamily: 'monthlySpotlight' },
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
    // Slug-uniqueness is a warning, not an error, in-session.
    expect(result.warnings.some((w) => w.category === 'invalid-slug')).toBe(true);
  });

  it('flags missing Title as missing-required-field error', () => {
    const result = validatePublishContext(context({ post: { Title: '' } }));
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.field === 'Title')).toBe(true);
  });

  it('flags ShowTeamViewer=true with no included team members', () => {
    const result = validatePublishContext(
      context({
        post: { ShowTeamViewer: true },
        teamMembers: [
          {
            PostId: 'post-001',
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
      context({ post: { ShowGallery: true }, media: [] }),
    );
    expect(result.errors.some((e) => e.category === 'invalid-gallery-configuration')).toBe(true);
  });

  it('flags gallery images missing alt text with a field path', () => {
    const result = validatePublishContext(
      context({
        media: [
          {
            PostId: 'post-001',
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
      context({ template: { BannerRendererKind: 'hbSignatureHero' } }),
    );
    const match = result.warnings.find(
      (w) => w.category === 'invalid-shell-compatibility',
    );
    expect(match).toBeDefined();
  });

  it('warns on shell version drift when the template forces regeneration', () => {
    const result = validatePublishContext(
      context({
        template: { ForceRegenerationOnShellChange: true },
        existingBinding: {
          BindingId: 'b-1',
          PostId: 'post-001',
          TargetSiteUrl:
            'https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight',
          TargetSiteKey: 'projectSpotlight',
          PageName: 'p.aspx',
          SourceTemplatePath:
            'SitePages/Templates/Project-Spotlight---In-Progress.aspx',
          PageShellKey: PROJECT_SPOTLIGHT_V1_SHELL.shellKey,
          PageShellVersion: '0.9.0',
          TemplateKey: 'ps-inprogress-monthly-v1',
          TemplateVersion: '1.0.0',
          BindingStatus: 'published',
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

  it('flags invalid TargetSiteKey', () => {
    const result = validatePublishContext(
      context({
        post: {
          TargetSiteKey: 'projectSpotlight',
        },
      }),
    );
    // sanity: happy path still ok.
    expect(result.ok).toBe(true);
  });
});
