import { describe, expect, it, vi } from 'vitest';
import type {
  PublisherMediaRow,
  PublisherPageBindingRow,
  PublisherPostRow,
  PublisherTeamMemberRow,
  PublisherTemplateRegistryRow,
} from './publisherContracts';
import type { PublisherRepositories } from './publisherRepositories';
import type { PageBindingWriter } from './pageBindingWriter';
import type { PageCreationService } from './pageGeneration/pageCreationService';
import { createPageShellService } from './pageGeneration/pageShellService';
import { createPublishOrchestrator } from './publishOrchestrator';

function post(over: Partial<PublisherPostRow> = {}): PublisherPostRow {
  return {
    PostId: 'post-ps-001',
    Title: 'Acme Tower — April',
    Subhead: 'Concrete pour on-schedule',
    SummaryExcerpt: 'Summary.',
    BodyRichText: '<p>Body.</p>',
    PostFamily: 'monthlySpotlight',
    SpotlightType: 'inProgress',
    TemplateKey: 'ps-inprogress-monthly-v1',
    PageShellKey: 'ps-shell-inprogress-oob-banner-team-gallery-v1',
    Slug: 'acme-tower-april',
    WorkflowState: 'approved',
    CreatedDateUtc: '2026-04-10T00:00:00Z',
    UpdatedDateUtc: '2026-04-12T00:00:00Z',
    ProjectId: 'PRJ-1',
    ProjectName: 'Acme Tower',
    BannerImageUrl: 'https://img.example/banner.jpg',
    BannerImageAltText: 'Banner alt',
    TargetSiteUrl: 'https://example.com/sites/ProjectSpotlight',
    TargetSiteKey: 'projectSpotlight',
    SourceTemplatePath: 'SitePages/Templates/Project-Spotlight---In-Progress.aspx',
    ...over,
  };
}

function tpl(over: Partial<PublisherTemplateRegistryRow> = {}): PublisherTemplateRegistryRow {
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
    RequiredFieldSetKey: 'req',
    ValidationProfileKey: 'val',
    RenderProfileKey: 'render',
    AllowRepublishInPlace: true,
    ForceRegenerationOnShellChange: false,
    ...over,
  };
}

function member(id: string): PublisherTeamMemberRow {
  return {
    PostId: 'post-ps-001',
    TeamMemberId: id,
    PersonPrincipal: `${id}@example.com`,
    DisplayName: id,
  };
}

function mediaRow(id: string): PublisherMediaRow {
  return {
    PostId: 'post-ps-001',
    MediaId: id,
    MediaRole: 'gallery',
    ImageAssetUrl: `https://img.example/${id}.jpg`,
    AltText: `${id} alt`,
  };
}

interface Fixture {
  repositories: PublisherRepositories;
  pageCreation: PageCreationService;
  pageBindingWriter: PageBindingWriter;
  createOrUpdate: ReturnType<typeof vi.fn>;
  upsertBinding: ReturnType<typeof vi.fn>;
  existingBinding?: PublisherPageBindingRow;
}

function fixture(over: {
  post?: Partial<PublisherPostRow>;
  template?: Partial<PublisherTemplateRegistryRow>;
  existingBinding?: PublisherPageBindingRow;
} = {}): Fixture {
  const p = post(over.post);
  const t = tpl(over.template);

  const createOrUpdate = vi.fn(async () => ({
    ok: true as const,
    pageId: '123',
    pageUrl: `${p.TargetSiteUrl}/SitePages/${p.Slug}.aspx`,
    pageName: `${p.Slug}.aspx`,
    wasCreated: true,
  }));
  const upsertBinding = vi.fn(async () => ({
    ok: true as const,
    bindingId: 'bnd-new',
    wasCreated: true,
    itemId: 42,
  }));

  const repositories: PublisherRepositories = {
    posts: {
      getByPostId: vi.fn(async () => p),
      listByWorkflowState: vi.fn(async () => []),
      upsert: vi.fn(async () => {
        throw new Error('unused in this test');
      }) as unknown as PublisherRepositories['posts']['upsert'],
    },
    teamMembers: {
      listByPost: vi.fn(async () => [member('alice')]),
      replaceAllForPost: vi.fn(async () => {
        throw new Error('unused');
      }) as unknown as PublisherRepositories['teamMembers']['replaceAllForPost'],
    },
    media: {
      listByPost: vi.fn(async () => [mediaRow('img-1')]),
      replaceAllForPost: vi.fn(async () => {
        throw new Error('unused');
      }) as unknown as PublisherRepositories['media']['replaceAllForPost'],
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
        itemId: 42,
      })),
    },
    workflowHistory: {
      listByPost: vi.fn(async () => []),
      append: vi.fn(async () => {
        throw new Error('unused');
      }) as unknown as PublisherRepositories['workflowHistory']['append'],
    },
    publishingErrors: {
      listByPost: vi.fn(async () => []),
      append: vi.fn(async () => {
        throw new Error('unused');
      }) as unknown as PublisherRepositories['publishingErrors']['append'],
    },
  };

  return {
    repositories,
    pageCreation: { createOrUpdate },
    pageBindingWriter: { upsert: upsertBinding },
    createOrUpdate,
    upsertBinding,
    existingBinding: over.existingBinding,
  };
}

function makeOrchestrator(f: Fixture) {
  return createPublishOrchestrator({
    repositories: f.repositories,
    pageBindingWriter: f.pageBindingWriter,
    pageShellService: createPageShellService({ pageCreation: f.pageCreation }),
  });
}

describe('publishOrchestrator', () => {
  it('creates page and binding when no existing binding', async () => {
    const f = fixture();
    const orch = makeOrchestrator(f);
    const result = await orch.run({
      postId: 'post-ps-001',
      mode: 'create',
      now: () => '2026-04-13T10:00:00.000Z',
      generateBindingId: () => 'bnd-generated',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.action).toBe('create');
    expect(f.createOrUpdate).toHaveBeenCalledTimes(1);
    expect(f.upsertBinding).toHaveBeenCalledTimes(1);
    const bindingRow = (f.upsertBinding.mock.calls[0]![0] as { row: PublisherPageBindingRow }).row;
    expect(bindingRow.BindingId).toBe('bnd-generated');
    expect(bindingRow.PageId).toBe('123');
    expect(bindingRow.BindingStatus).toBe('published');
    expect(bindingRow.LastOperation).toBe('publish');
    expect(bindingRow.PageShellKey).toBe('ps-shell-inprogress-oob-banner-team-gallery-v1');
    expect(bindingRow.PageShellVersion).toBe('1.0.0');
  });

  it('republish preserves existing BindingId when shell + template versions match', async () => {
    const existing: PublisherPageBindingRow = {
      BindingId: 'bnd-existing-42',
      PostId: 'post-ps-001',
      TargetSiteUrl: 'https://example.com/sites/ProjectSpotlight',
      TargetSiteKey: 'projectSpotlight',
      PageId: '999',
      PageName: 'acme-tower-april.aspx',
      PageUrl: 'https://example.com/sites/ProjectSpotlight/SitePages/acme-tower-april.aspx',
      SourceTemplatePath: 'SitePages/Templates/Project-Spotlight---In-Progress.aspx',
      PageShellKey: 'ps-shell-inprogress-oob-banner-team-gallery-v1',
      PageShellVersion: '1.0.0',
      TemplateKey: 'ps-inprogress-monthly-v1',
      TemplateVersion: '1.0.0',
      BindingStatus: 'published',
    };
    const f = fixture({ existingBinding: existing });
    const orch = makeOrchestrator(f);
    const result = await orch.run({
      postId: 'post-ps-001',
      mode: 'republish',
      now: () => '2026-04-13T10:00:00.000Z',
      generateBindingId: () => 'bnd-should-not-be-used',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.action).toBe('inPlaceUpdate');
    const bindingRow = (f.upsertBinding.mock.calls[0]![0] as { row: PublisherPageBindingRow }).row;
    expect(bindingRow.BindingId).toBe('bnd-existing-42');
    expect(bindingRow.LastOperation).toBe('republish');
  });

  it('idempotent republish emits noOp when binding is already in sync', async () => {
    const existing: PublisherPageBindingRow = {
      BindingId: 'bnd-existing-42',
      PostId: 'post-ps-001',
      TargetSiteUrl: 'https://example.com/sites/ProjectSpotlight',
      TargetSiteKey: 'projectSpotlight',
      PageId: '999',
      PageName: 'acme-tower-april.aspx',
      SourceTemplatePath: 'SitePages/Templates/Project-Spotlight---In-Progress.aspx',
      PageShellKey: 'ps-shell-inprogress-oob-banner-team-gallery-v1',
      PageShellVersion: '1.0.0',
      TemplateKey: 'ps-inprogress-monthly-v1',
      TemplateVersion: '1.0.0',
      BindingStatus: 'published',
    };
    const f = fixture({ existingBinding: existing });
    const orch = makeOrchestrator(f);
    const result = await orch.run({
      postId: 'post-ps-001',
      mode: 'republish',
      idempotent: true,
      now: () => '2026-04-13T10:00:00.000Z',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.action).toBe('noOp');
    expect(f.createOrUpdate).not.toHaveBeenCalled();
    expect(f.upsertBinding).not.toHaveBeenCalled();
  });

  it('regenerates (new page, new binding) on shell key drift', async () => {
    const existing: PublisherPageBindingRow = {
      BindingId: 'bnd-existing-42',
      PostId: 'post-ps-001',
      TargetSiteUrl: 'https://example.com/sites/ProjectSpotlight',
      TargetSiteKey: 'projectSpotlight',
      PageId: '999',
      PageName: 'acme-tower-april.aspx',
      SourceTemplatePath: 'SitePages/Templates/Project-Spotlight---In-Progress.aspx',
      PageShellKey: 'ps-shell-old-v1',
      PageShellVersion: '0.9.0',
      TemplateKey: 'ps-inprogress-monthly-v1',
      TemplateVersion: '1.0.0',
      BindingStatus: 'published',
    };
    const f = fixture({ existingBinding: existing });
    const orch = makeOrchestrator(f);
    const result = await orch.run({
      postId: 'post-ps-001',
      mode: 'republish',
      now: () => '2026-04-13T10:00:00.000Z',
      generateBindingId: () => 'bnd-regen',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.action).toBe('regenerate');
    const bindingRow = (f.upsertBinding.mock.calls[0]![0] as { row: PublisherPageBindingRow }).row;
    expect(bindingRow.BindingId).toBe('bnd-regen');
    expect(bindingRow.LastOperation).toBe('regenerate');
    expect(bindingRow.PageShellKey).toBe('ps-shell-inprogress-oob-banner-team-gallery-v1');
  });

  it('blocks republish on archived binding', async () => {
    const existing: PublisherPageBindingRow = {
      BindingId: 'bnd-archived',
      PostId: 'post-ps-001',
      TargetSiteUrl: 'https://example.com/sites/ProjectSpotlight',
      TargetSiteKey: 'projectSpotlight',
      PageName: 'acme-tower-april.aspx',
      SourceTemplatePath: 'SitePages/Templates/Project-Spotlight---In-Progress.aspx',
      PageShellKey: 'ps-shell-inprogress-oob-banner-team-gallery-v1',
      PageShellVersion: '1.0.0',
      TemplateKey: 'ps-inprogress-monthly-v1',
      TemplateVersion: '1.0.0',
      BindingStatus: 'archived',
    };
    const f = fixture({ existingBinding: existing });
    const orch = makeOrchestrator(f);
    const result = await orch.run({ postId: 'post-ps-001', mode: 'republish' });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.stage).toBe('policy');
    expect(result.decision?.action).toBe('blocked');
    expect(f.createOrUpdate).not.toHaveBeenCalled();
    expect(f.upsertBinding).not.toHaveBeenCalled();
  });

  it('preview mode composes but never writes', async () => {
    const f = fixture();
    const orch = makeOrchestrator(f);
    const result = await orch.run({ postId: 'post-ps-001', mode: 'preview' });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.mode).toBe('preview');
    expect(f.createOrUpdate).not.toHaveBeenCalled();
    expect(f.upsertBinding).not.toHaveBeenCalled();
    expect(result.page.controls).toHaveLength(5);
  });

  it('surfaces page-publish failures without writing the binding', async () => {
    const f = fixture();
    f.createOrUpdate.mockResolvedValueOnce({
      ok: false,
      reason: 'ensurePageFailed',
      message: 'tenant returned 500',
    });
    const orch = makeOrchestrator(f);
    const result = await orch.run({ postId: 'post-ps-001', mode: 'create' });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.stage).toBe('pagePublish');
    expect(f.upsertBinding).not.toHaveBeenCalled();
  });
});
