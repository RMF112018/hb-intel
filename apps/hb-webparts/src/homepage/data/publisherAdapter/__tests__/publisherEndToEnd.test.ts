/**
 * Publisher end-to-end integration test.
 *
 * Exercises the full publish pipeline — resolution, composition,
 * validation, Pages REST call, binding write — using mocked
 * repositories, a mocked `PageCreationService`, and a mocked
 * `PageBindingWriter`. Proves the wires on the critical publish path
 * are correct before hosted verification.
 *
 * Covers (arch doc 08 §"Validation error categories" + prompt-09):
 *   - happy path → page id + binding id
 *   - republish preserves BindingId
 *   - validation failure blocks writes (no page-creation, no binding)
 *   - missing alt text on gallery row blocks publish
 *   - archived binding blocks republish (no writes)
 *   - preview is structurally complete and validation-annotated, never writes
 */

import { describe, expect, it, vi } from 'vitest';
import type {
  PublisherMediaRow,
  PublisherPageBindingRow,
  PublisherPostRow,
  PublisherTeamMemberRow,
  PublisherTemplateRegistryRow,
} from '../publisherContracts';
import type { PublisherRepositories } from '../publisherRepositories';
import type { PageBindingWriter } from '../pageBindingWriter';
import type { PageCreationService } from '../pageGeneration/pageCreationService';
import { createPageShellService } from '../pageGeneration/pageShellService';
import { createPublishOrchestrator } from '../publishOrchestrator';

function post(over: Partial<PublisherPostRow> = {}): PublisherPostRow {
  return {
    PostId: 'post-e2e',
    Title: 'E2E Post',
    Subhead: 'End-to-end subhead',
    SummaryExcerpt: 'Short summary.',
    BodyRichText: '<p>Full body.</p>',
    PostFamily: 'monthlySpotlight',
    SpotlightType: 'inProgress',
    ProjectStage: 'inProgress',
    TemplateKey: 'ps-inprogress-monthly-v1',
    PageShellKey: 'ps-shell-inprogress-oob-banner-team-gallery-v1',
    Slug: 'e2e-post',
    WorkflowState: 'approved',
    CreatedDateUtc: '2026-04-13T00:00:00Z',
    UpdatedDateUtc: '2026-04-13T00:00:00Z',
    ProjectId: 'PRJ-42',
    ProjectName: 'Project Forty-Two',
    BannerImageUrl: 'https://img.example/banner.jpg',
    BannerImageAltText: 'Aerial shot',
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
    ShellSourceSiteUrl:
      'https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight',
    ShellSourcePagePath:
      'SitePages/Templates/Project-Spotlight---In-Progress.aspx',
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

function member(id: string, over: Partial<PublisherTeamMemberRow> = {}): PublisherTeamMemberRow {
  return {
    PostId: 'post-e2e',
    TeamMemberId: id,
    PersonPrincipal: `${id}@example.com`,
    DisplayName: id,
    ...over,
  };
}

function gallery(id: string, over: Partial<PublisherMediaRow> = {}): PublisherMediaRow {
  return {
    PostId: 'post-e2e',
    MediaId: id,
    MediaRole: 'gallery',
    ImageAssetUrl: `https://img.example/${id}.jpg`,
    AltText: `${id} alt text`,
    ...over,
  };
}

interface Fx {
  repositories: PublisherRepositories;
  pageCreation: PageCreationService;
  pageBindingWriter: PageBindingWriter;
  createOrUpdate: ReturnType<typeof vi.fn>;
  upsert: ReturnType<typeof vi.fn>;
}

function fixture(over: {
  post?: Partial<PublisherPostRow>;
  template?: Partial<PublisherTemplateRegistryRow>;
  teamMembers?: readonly PublisherTeamMemberRow[];
  media?: readonly PublisherMediaRow[];
  existingBinding?: PublisherPageBindingRow;
} = {}): Fx {
  const p = post(over.post);
  const t = tpl(over.template);
  const team = over.teamMembers ?? [member('alice')];
  const media = over.media ?? [gallery('g1')];
  const createOrUpdate = vi.fn(async () => ({
    ok: true as const,
    pageId: 'page-1001',
    pageUrl: `${p.TargetSiteUrl}/SitePages/${p.Slug}.aspx`,
    pageName: `${p.Slug}.aspx`,
    wasCreated: true,
  }));
  const upsert = vi.fn(async () => ({
    ok: true as const,
    bindingId: 'bnd-new',
    wasCreated: true,
    itemId: 77,
  }));
  const repositories: PublisherRepositories = {
    posts: {
      getByPostId: vi.fn(async () => p),
      listByWorkflowState: vi.fn(async () => [p]),
      upsert: vi.fn(async () => ({ wasCreated: false, itemId: 42 })),
    },
    teamMembers: {
      listByPost: vi.fn(async () => team),
      replaceAllForPost: vi.fn(async () => ({ deleted: 0, written: team.length })),
    },
    media: {
      listByPost: vi.fn(async () => media),
      replaceAllForPost: vi.fn(async () => ({ deleted: 0, written: media.length })),
    },
    templateRegistry: {
      listActive: vi.fn(async () => [t]),
      getByKey: vi.fn(async () => t),
    },
    pageBindings: {
      getByPostId: vi.fn(async () => over.existingBinding),
      upsert: vi.fn(async () => ({
        bindingId: 'bnd-new',
        wasCreated: true,
        itemId: 77,
      })),
    },
    workflowHistory: {
      listByPost: vi.fn(async () => []),
      append: vi.fn(async () => ({ itemId: 1 })),
    },
    publishingErrors: {
      listByPost: vi.fn(async () => []),
      append: vi.fn(),
    },
  } as unknown as PublisherRepositories;
  return {
    repositories,
    pageCreation: { createOrUpdate },
    pageBindingWriter: { upsert },
    createOrUpdate,
    upsert,
  };
}

function orch(f: Fx) {
  return createPublishOrchestrator({
    repositories: f.repositories,
    pageBindingWriter: f.pageBindingWriter,
    pageShellService: createPageShellService({ pageCreation: f.pageCreation }),
  });
}

describe('publisher end-to-end', () => {
  it('publishes a valid post and writes a binding row with the composed identity', async () => {
    const f = fixture();
    const result = await orch(f).run({
      postId: 'post-e2e',
      mode: 'create',
      now: () => '2026-04-13T12:00:00.000Z',
      generateBindingId: () => 'bnd-e2e-0001',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.pageId).toBe('page-1001');
    expect(result.bindingId).toBe('bnd-e2e-0001');
    expect(result.validation?.ok).toBe(true);

    // Page-creation called with the exact composed identity.
    expect(f.createOrUpdate).toHaveBeenCalledTimes(1);
    const pageArg = f.createOrUpdate.mock.calls[0]![0] as {
      page: { identity: { shellKey: string; templateKey: string; pageName: string } };
    };
    expect(pageArg.page.identity.shellKey).toBe(
      'ps-shell-inprogress-oob-banner-team-gallery-v1',
    );
    expect(pageArg.page.identity.templateKey).toBe('ps-inprogress-monthly-v1');
    expect(pageArg.page.identity.pageName).toBe('e2e-post.aspx');

    // Binding-writer called with matching shell/template stamps + 'publish' op.
    expect(f.upsert).toHaveBeenCalledTimes(1);
    const bindingArg = f.upsert.mock.calls[0]![0] as {
      row: PublisherPageBindingRow;
    };
    expect(bindingArg.row.BindingId).toBe('bnd-e2e-0001');
    expect(bindingArg.row.PageId).toBe('page-1001');
    expect(bindingArg.row.BindingStatus).toBe('published');
    expect(bindingArg.row.LastOperation).toBe('publish');
    expect(bindingArg.row.PageShellKey).toBe(
      'ps-shell-inprogress-oob-banner-team-gallery-v1',
    );
  });

  it('republish preserves the existing BindingId and stamps LastOperation=republish', async () => {
    const existing: PublisherPageBindingRow = {
      BindingId: 'bnd-existing',
      PostId: 'post-e2e',
      TargetSiteUrl:
        'https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight',
      TargetSiteKey: 'projectSpotlight',
      PageId: 'page-1001',
      PageName: 'e2e-post.aspx',
      PageUrl:
        'https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight/SitePages/e2e-post.aspx',
      SourceTemplatePath:
        'SitePages/Templates/Project-Spotlight---In-Progress.aspx',
      PageShellKey: 'ps-shell-inprogress-oob-banner-team-gallery-v1',
      PageShellVersion: '1.0.0',
      TemplateKey: 'ps-inprogress-monthly-v1',
      TemplateVersion: '1.0.0',
      BindingStatus: 'published',
    };
    const f = fixture({ existingBinding: existing });
    const result = await orch(f).run({
      postId: 'post-e2e',
      mode: 'republish',
      now: () => '2026-04-13T12:05:00.000Z',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const bindingArg = f.upsert.mock.calls[0]![0] as {
      row: PublisherPageBindingRow;
    };
    expect(bindingArg.row.BindingId).toBe('bnd-existing');
    expect(bindingArg.row.LastOperation).toBe('republish');
  });

  it('blocks publish when content validation fails (missing Title) and writes nothing', async () => {
    const f = fixture({ post: { Title: '' } });
    const result = await orch(f).run({ postId: 'post-e2e', mode: 'create' });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.stage).toBe('validation');
    expect(result.validation?.errors.some((e) => e.field === 'Title')).toBe(true);
    expect(f.createOrUpdate).not.toHaveBeenCalled();
    expect(f.upsert).not.toHaveBeenCalled();
  });

  it('blocks publish when a gallery image is missing alt text', async () => {
    const f = fixture({
      media: [gallery('g1', { AltText: '' })],
    });
    const result = await orch(f).run({ postId: 'post-e2e', mode: 'create' });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.stage).toBe('validation');
    expect(
      result.validation?.errors.some(
        (e) =>
          e.category === 'invalid-image-accessibility' &&
          e.field === 'media[0].AltText',
      ),
    ).toBe(true);
    expect(f.createOrUpdate).not.toHaveBeenCalled();
    expect(f.upsert).not.toHaveBeenCalled();
  });

  it('blocks republish on an archived binding (no writes)', async () => {
    const existing: PublisherPageBindingRow = {
      BindingId: 'bnd-archived',
      PostId: 'post-e2e',
      TargetSiteUrl:
        'https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight',
      TargetSiteKey: 'projectSpotlight',
      PageName: 'e2e-post.aspx',
      SourceTemplatePath:
        'SitePages/Templates/Project-Spotlight---In-Progress.aspx',
      PageShellKey: 'ps-shell-inprogress-oob-banner-team-gallery-v1',
      PageShellVersion: '1.0.0',
      TemplateKey: 'ps-inprogress-monthly-v1',
      TemplateVersion: '1.0.0',
      BindingStatus: 'archived',
    };
    const f = fixture({ existingBinding: existing });
    const result = await orch(f).run({ postId: 'post-e2e', mode: 'republish' });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.stage).toBe('policy');
    expect(result.decision?.action).toBe('blocked');
    expect(f.createOrUpdate).not.toHaveBeenCalled();
    expect(f.upsert).not.toHaveBeenCalled();
  });

  it('preview returns a structurally complete composition with validation attached, no writes', async () => {
    const f = fixture();
    const result = await orch(f).run({ postId: 'post-e2e', mode: 'preview' });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.page.controls.map((c) => c.slot)).toEqual([
      'banner',
      'subhead',
      'body',
      'team',
      'gallery',
    ]);
    expect(result.validation?.ok).toBe(true);
    expect(f.createOrUpdate).not.toHaveBeenCalled();
    expect(f.upsert).not.toHaveBeenCalled();
  });
});
