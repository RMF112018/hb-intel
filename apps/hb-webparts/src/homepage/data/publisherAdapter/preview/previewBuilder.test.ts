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

function post(over: Partial<PublisherArticleRow> = {}): PublisherArticleRow {
  return {
    ArticleId: 'post-001',
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
    TemplateDisplayName: 'PS Monthly',
    TemplateStatus: 'active',
    TemplateVersion: '1.0.0',
    PageShellVersion: '1.0.0',
    ShellSourceSiteUrl: 'https://example.com',
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
  } as PublisherTemplateRegistryRow;
}

function member(id: string): PublisherTeamMemberRow {
  return {
    PostId: 'post-001',
    TeamMemberId: id,
    PersonPrincipal: `${id}@example.com`,
    DisplayName: id,
  };
}

function mediaRow(id: string): PublisherMediaRow {
  return {
    PostId: 'post-001',
    MediaId: id,
    MediaRole: 'gallery',
    ImageAssetUrl: `https://img.example/${id}.jpg`,
    AltText: `${id} alt`,
  };
}

function repos(over: {
  post?: Partial<PublisherArticleRow>;
  template?: Partial<PublisherTemplateRegistryRow>;
  teamMembers?: readonly PublisherTeamMemberRow[];
  media?: readonly PublisherMediaRow[];
  existingBinding?: PublisherPageBindingRow;
} = {}): PublisherRepositories {
  const p = post(over.post);
  const t = tpl(over.template);
  return {
    posts: {
      getByPostId: vi.fn(async () => p),
      listByWorkflowState: vi.fn(async () => []),
      upsert: vi.fn(),
    },
    teamMembers: {
      listByPost: vi.fn(async () => over.teamMembers ?? [member('alice')]),
      replaceAllForPost: vi.fn(),
    },
    media: {
      listByPost: vi.fn(async () => over.media ?? [mediaRow('m-1')]),
      replaceAllForPost: vi.fn(),
    },
    templateRegistry: {
      listActive: vi.fn(async () => [t]),
      getByKey: vi.fn(async () => t),
    },
    pageBindings: {
      getByPostId: vi.fn(async () => over.existingBinding),
      upsert: vi.fn(),
    },
    workflowHistory: {
      listByPost: vi.fn(async () => []),
      append: vi.fn(),
    },
    publishingErrors: {
      listByPost: vi.fn(async () => []),
      append: vi.fn(),
    },
  } as unknown as PublisherRepositories;
}

describe('buildPublisherPreview', () => {
  it('produces a valid preview for a well-formed post', async () => {
    const result = await buildPublisherPreview(repos(), 'post-001');
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
    expect(result.drift.shellKeyDrift).toBe(false);
    expect(result.drift.shellVersionDrift).toBe(false);
  });

  it('shares compositor output with the publish pipeline', async () => {
    const r = repos();
    const preview = await buildPublisherPreview(r, 'post-001');
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
      repos({ post: { Title: '' } }),
      'post-001',
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.validation.ok).toBe(false);
    expect(result.validation.errors.some((e) => e.field === 'Title')).toBe(true);
  });

  it('sets drift flags when the existing binding has drifted', async () => {
    const binding: PublisherPageBindingRow = {
      BindingId: 'b-1',
      PostId: 'post-001',
      TargetSiteUrl:
        'https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight',
      TargetSiteKey: 'projectSpotlight',
      PageShellKey: 'ps-shell-v1',
      PageName: 'preview-post.aspx',
      SourceTemplatePath: 'SitePages/Templates/Project-Spotlight---In-Progress.aspx',
      PageShellVersion: '0.9.0',
      TemplateKey: 'ps-inprogress-monthly-v0',
      TemplateVersion: '0.9.0',
      BindingStatus: 'published',
    };
    const result = await buildPublisherPreview(
      repos({ existingBinding: binding }),
      'post-001',
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.drift.shellKeyDrift).toBe(true);
    expect(result.drift.templateKeyDrift).toBe(true);
    expect(result.drift.shellVersionDrift).toBe(true);
    expect(result.drift.templateVersionDrift).toBe(true);
  });

  it('returns a typed failure when the post is not found', async () => {
    const r = repos();
    (r.articles.getByArticleId as ReturnType<typeof vi.fn>).mockResolvedValueOnce(undefined);
    const result = await buildPublisherPreview(r, 'post-missing');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('postNotFound');
  });
});
