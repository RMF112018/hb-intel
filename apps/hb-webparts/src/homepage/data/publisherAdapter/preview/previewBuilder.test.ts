import { describe, expect, it, vi } from 'vitest';
import type {
  PublisherMediaRow,
  PublisherPageBindingRow,
  PublisherArticleRow,
  PublisherTeamMemberRow,
  PublisherTemplateRegistryRow,
} from '../publisherContracts';
import type { PublisherRepositories } from '../publisherRepositories';
import { composeProjectSpotlightPage } from '../pageGeneration/pageCompositor';
import { PROJECT_SPOTLIGHT_V1_SHELL } from '../pageGeneration/xmlShellManifest';
import { buildPublisherPreview } from './previewBuilder';

function article(over: Partial<PublisherArticleRow> = {}): PublisherArticleRow {
  return {
    ArticleId: 'art-001',
    Title: 'Preview Post',
    Subhead: 'Subhead',
    SummaryExcerpt: 'Summary.',
    BodyRichText: '<p>Body.</p>',
    ArticleContentType: 'monthlySpotlight',
    SpotlightType: 'monthly',
    ProjectStage: 'active',
    TemplateKey: 'ps-inprogress-monthly-v1',
    Slug: 'preview-post',
    WorkflowState: 'draft',
    CreatedDateUtc: '2026-04-10T00:00:00Z',
    UpdatedDateUtc: '2026-04-12T00:00:00Z',
    ProjectId: 'PRJ-1',
    ProjectName: 'Project One',
    HeroPrimaryImage: 'https://img.example/banner.jpg',
    HeroPrimaryImageAltText: 'alt',
    TargetSiteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight',
    Destination: 'projectSpotlight',
    ...over,
  } as PublisherArticleRow;
}

function tpl(over: Partial<PublisherTemplateRegistryRow> = {}): PublisherTemplateRegistryRow {
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

function member(id: string): PublisherTeamMemberRow {
  return {
    ArticleId: 'art-001',
    TeamMemberId: id,
    Title: id,
    PersonPrincipal: `${id}@example.com`,
    DisplayName: id,
  };
}

function mediaRow(id: string): PublisherMediaRow {
  return {
    ArticleId: 'art-001',
    MediaId: id,
    MediaRole: 'gallery',
    ImageAssetUrl: `https://img.example/${id}.jpg`,
    AltText: `${id} alt`,
  };
}

function repos(over: {
  article?: Partial<PublisherArticleRow>;
  template?: Partial<PublisherTemplateRegistryRow>;
  teamMembers?: readonly PublisherTeamMemberRow[];
  media?: readonly PublisherMediaRow[];
  existingBinding?: PublisherPageBindingRow;
} = {}): PublisherRepositories {
  const a = article(over.article);
  const t = tpl(over.template);
  return {
    posts: {
      getByArticleId: vi.fn(async () => a),
      listByWorkflowState: vi.fn(async () => []),
      upsert: vi.fn(),
    },
    teamMembers: {
      listByArticle: vi.fn(async () => over.teamMembers ?? [member('alice')]),
      replaceAllForArticle: vi.fn(),
    },
    media: {
      listByArticle: vi.fn(async () => over.media ?? [mediaRow('m-1')]),
      replaceAllForArticle: vi.fn(),
    },
    templateRegistry: {
      listActive: vi.fn(async () => [t]),
      getByKey: vi.fn(async () => t),
    },
    pageBindings: {
      getByArticleId: vi.fn(async () => over.existingBinding),
      upsert: vi.fn(),
    },
    workflowHistory: {
      listByArticle: vi.fn(async () => []),
      append: vi.fn(),
    },
    publishingErrors: {
      listByArticle: vi.fn(async () => []),
      append: vi.fn(),
    },
    promotionRules: {
      listActive: vi.fn(async () => []),
    },
  } as unknown as PublisherRepositories;
}

describe('buildPublisherPreview', () => {
  it('produces a valid preview for a well-formed post', async () => {
    const result = await buildPublisherPreview(repos(), 'art-001');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.composedPage.controls.map((c) => c.slot)).toEqual([
      'banner',
      'subhead',
      'body',
      'team',
      'gallery',
    ]);
    expect(result.validation.ok).toBe(true);
    expect(result.decision.action).toBe('create');
    expect(result.drift).toBe(false);
    expect(result.drift.shellVersionDrift).toBe(false);
  });

  it('shares compositor output with the publish pipeline', async () => {
    const r = repos();
    const preview = await buildPublisherPreview(r, 'art-001');
    expect(preview.ok).toBe(true);
    if (!preview.ok) return;
    // Compose a page directly from the resolution context and confirm
    // every control matches the preview's composed page. This proves
    // preview and publish share the compositor.
    const direct = composeProjectSpotlightPage(
      preview.resolution,
      PROJECT_SPOTLIGHT_V1_SHELL,
    );
    expect(direct.controls).toEqual(preview.composedPage.controls);
    expect(direct.identity).toEqual(preview.composedPage.identity);
  });

  it('propagates validation failures into the preview without throwing', async () => {
    const result = await buildPublisherPreview(
      repos({ article: { Title: '' } }),
      'art-001',
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.validation.ok).toBe(false);
    expect(result.validation.errors.some((e) => e.field === 'Title')).toBe(true);
  });

  it('sets drift flags when the existing binding has drifted', async () => {
    const binding: PublisherPageBindingRow = {
      BindingId: 'b-1',
      ArticleId: 'art-001',
      Title: 'Acme Tower — April',
      PublishStatus: 'published',
      TargetSiteUrl:
        'https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight',
      PageName: 'preview-post.aspx',
      PageShellVersion: '0.9.0',
      PageTemplateKey: 'ps-inprogress-monthly-v0',
      RenderVersion: '0.9.0',
    };
    const result = await buildPublisherPreview(
      repos({ existingBinding: binding }),
      'art-001',
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.drift).toBe(true);
    expect(result.drift.templateKeyDrift).toBe(true);
    expect(result.drift.shellVersionDrift).toBe(true);
    expect(result.drift.templateVersionDrift).toBe(true);
  });

  it('returns a typed failure when the article is not found', async () => {
    const r = repos();
    (r.articles.getByArticleId as ReturnType<typeof vi.fn>).mockResolvedValueOnce(undefined);
    const result = await buildPublisherPreview(r, 'post-missing');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('postNotFound');
  });
});
