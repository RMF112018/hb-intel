import { describe, expect, it, vi } from 'vitest';
import type {
  PublisherMediaRow,
  PublisherPageBindingRow,
  PublisherArticleRow,
  PublisherTeamMemberRow,
  PublisherTemplateRegistryRow,
} from './publisherContracts';
import type { PublisherRepositories } from './publisherRepositories';
import type { PageBindingWriter } from './pageBindingWriter';
import type { PageCreationService } from './pageGeneration/pageCreationService';
import { createPageShellService } from './pageGeneration/pageShellService';
import { createPublishOrchestrator } from './publishOrchestrator';

function post(over: Partial<PublisherArticleRow> = {}): PublisherArticleRow {
  return {
    ArticleId: 'post-ps-001',
    Title: 'Acme Tower — April',
    Subhead: 'Concrete pour on-schedule',
    SummaryExcerpt: 'Summary.',
    BodyRichText: '<p>Body.</p>',
    ArticleContentType: 'monthlySpotlight',
    SpotlightType: 'monthly',
    TemplateKey: 'ps-inprogress-monthly-v1',
    Slug: 'acme-tower-april',
    WorkflowState: 'approved',
    CreatedDateUtc: '2026-04-10T00:00:00Z',
    UpdatedDateUtc: '2026-04-12T00:00:00Z',
    ProjectId: 'PRJ-1',
    ProjectName: 'Acme Tower',
    HeroPrimaryImage: 'https://img.example/banner.jpg',
    HeroPrimaryImageAltText: 'Banner alt',
    TargetSiteUrl: 'https://example.com/sites/ProjectSpotlight',
    Destination: 'projectSpotlight',
    ...over,
  } as PublisherArticleRow;
}

function tpl(over: Partial<PublisherTemplateRegistryRow> = {}): PublisherTemplateRegistryRow {
  return {
    TemplateKey: 'ps-inprogress-monthly-v1',
    TemplateName: 'PS Monthly',
    IsActive: true,
    TemplatePriority: 100,
    VersionLabel: '1.0.0',
    ContentTypes: ['monthlySpotlight'],
    Destination: 'projectSpotlight',
    PageShellTemplateKey: 'ps-shell-inprogress-oob-banner-team-gallery-v1',
    HeroProfileKey: 'hbSignatureHero',
    BodyProfileKey: 'oobText',
    TeamViewerProfileKey: 'teamViewer',
    GalleryProfileKey: 'oobImageGallery',
    ShowHero: true,
    ShowBody: true,
    ShowTeamViewer: true,
    ShowGallery: true,
    ShowSecondaryImage: false,
    RequiredFieldSetKey: 'req',
    ...over,
  } as PublisherTemplateRegistryRow;
}

function member(id: string): PublisherTeamMemberRow {
  return {
    ArticleId: 'post-ps-001',
    TeamMemberId: id,
    PersonPrincipal: `${id}@example.com`,
    DisplayName: id,
  };
}

function mediaRow(id: string): PublisherMediaRow {
  return {
    ArticleId: 'post-ps-001',
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
  post?: Partial<PublisherArticleRow>;
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
    articles: {
      getByArticleId: vi.fn(async () => p),
      listByWorkflowState: vi.fn(async () => []),
      upsert: vi.fn(async () => ({ wasCreated: false, itemId: 1 })),
    },
    teamMembers: {
      listByArticle: vi.fn(async () => [member('alice')]),
      replaceAllForArticle: vi.fn(async () => {
        throw new Error('unused');
      }) as unknown as PublisherRepositories['teamMembers']['replaceAllForArticle'],
    },
    media: {
      listByArticle: vi.fn(async () => [mediaRow('img-1')]),
      replaceAllForArticle: vi.fn(async () => {
        throw new Error('unused');
      }) as unknown as PublisherRepositories['media']['replaceAllForArticle'],
    },
    templateRegistry: {
      listActive: vi.fn(async () => [t]),
      getByKey: vi.fn(async () => t),
    },
    pageBindings: {
      getByArticleId: vi.fn(async () => over.existingBinding),
      upsert: vi.fn(async () => ({
        bindingId: 'bnd-new',
        wasCreated: true,
        itemId: 42,
      })),
    },
    workflowHistory: {
      listByArticle: vi.fn(async () => []),
      append: vi.fn(async () => {
        throw new Error('unused');
      }) as unknown as PublisherRepositories['workflowHistory']['append'],
    },
    publishingErrors: {
      listByArticle: vi.fn(async () => []),
      append: vi.fn(async () => {
        throw new Error('unused');
      }) as unknown as PublisherRepositories['publishingErrors']['append'],
    },
    promotionRules: {
      listActive: vi.fn(async () => []),
    },
  };

  return {
    repositories,
    pageCreation: { createOrUpdate, publishLive: vi.fn(async (input) => ({ ok: true as const, pageId: input.pageId, publishedAtUtc: '2026-04-13T10:00:00.000Z' })) },
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
      articleId: 'post-ps-001',
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
    expect(bindingRow.PublishStatus).toBe('published');
    expect(bindingRow.SyncStatus).toBe('in-sync');
    expect(bindingRow.PageShellVersion).toBe('1.0.0');
    expect(bindingRow.PageShellVersion).toBe('1.0.0');
  });

  it('republish preserves existing BindingId when shell + template versions match', async () => {
    const existing: PublisherPageBindingRow = {
      BindingId: 'bnd-existing-42',
      ArticleId: 'post-ps-001',
      Title: 'Acme Tower — April',
      PublishStatus: 'published',
      TargetSiteUrl: 'https://example.com/sites/ProjectSpotlight',
      PageId: '999',
      PageName: 'acme-tower-april.aspx',
      PageUrl: 'https://example.com/sites/ProjectSpotlight/SitePages/acme-tower-april.aspx',
      PageShellVersion: '1.0.0',
      PageTemplateKey: 'ps-inprogress-monthly-v1',
      RenderVersion: '1.0.0',
    };
    const f = fixture({ existingBinding: existing });
    const orch = makeOrchestrator(f);
    const result = await orch.run({
      articleId: 'post-ps-001',
      mode: 'republish',
      now: () => '2026-04-13T10:00:00.000Z',
      generateBindingId: () => 'bnd-should-not-be-used',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.action).toBe('inPlaceUpdate');
    const bindingRow = (f.upsertBinding.mock.calls[0]![0] as { row: PublisherPageBindingRow }).row;
    expect(bindingRow.BindingId).toBe('bnd-existing-42');
    expect(bindingRow.SyncStatus).toBe('in-sync');
  });

  it('idempotent republish emits noOp when binding is already in sync', async () => {
    const existing: PublisherPageBindingRow = {
      BindingId: 'bnd-existing-42',
      ArticleId: 'post-ps-001',
      Title: 'Acme Tower — April',
      PublishStatus: 'published',
      TargetSiteUrl: 'https://example.com/sites/ProjectSpotlight',
      PageId: '999',
      PageName: 'acme-tower-april.aspx',
      PageShellVersion: '1.0.0',
      PageTemplateKey: 'ps-inprogress-monthly-v1',
      RenderVersion: '1.0.0',
    };
    const f = fixture({ existingBinding: existing });
    const orch = makeOrchestrator(f);
    const result = await orch.run({
      articleId: 'post-ps-001',
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
      ArticleId: 'post-ps-001',
      Title: 'Acme Tower — April',
      PublishStatus: 'published',
      TargetSiteUrl: 'https://example.com/sites/ProjectSpotlight',
      PageId: '999',
      PageName: 'acme-tower-april.aspx',
      PageShellVersion: '0.9.0',
      PageTemplateKey: 'ps-inprogress-monthly-v1',
      RenderVersion: '1.0.0',
    };
    const f = fixture({ existingBinding: existing });
    const orch = makeOrchestrator(f);
    const result = await orch.run({
      articleId: 'post-ps-001',
      mode: 'republish',
      now: () => '2026-04-13T10:00:00.000Z',
      generateBindingId: () => 'bnd-regen',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.action).toBe('regenerate');
    const bindingRow = (f.upsertBinding.mock.calls[0]![0] as { row: PublisherPageBindingRow }).row;
    expect(bindingRow.BindingId).toBe('bnd-regen');
    expect(bindingRow.SyncStatus).toBe('in-sync');
    expect(bindingRow.PageShellVersion).toBe('1.0.0');
  });

  it('blocks republish on archived binding', async () => {
    const existing: PublisherPageBindingRow = {
      BindingId: 'bnd-archived',
      ArticleId: 'post-ps-001',
      Title: 'Acme Tower — April',
      PublishStatus: 'published',
      TargetSiteUrl: 'https://example.com/sites/ProjectSpotlight',
      PageName: 'acme-tower-april.aspx',
      PageShellVersion: '1.0.0',
      PageTemplateKey: 'ps-inprogress-monthly-v1',
      RenderVersion: '1.0.0',
    };
    const f = fixture({ existingBinding: existing });
    const orch = makeOrchestrator(f);
    const result = await orch.run({ articleId: 'post-ps-001', mode: 'republish' });
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
    const result = await orch.run({ articleId: 'post-ps-001', mode: 'preview' });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.mode).toBe('preview');
    expect(f.createOrUpdate).not.toHaveBeenCalled();
    expect(f.upsertBinding).not.toHaveBeenCalled();
    expect(result.page.controls).toHaveLength(5);
  });

  it('blocks publish when validation fails and does not touch the page-creation service or binding writer', async () => {
    const f = fixture({ post: { Title: '' } });
    const orch = makeOrchestrator(f);
    const result = await orch.run({ articleId: 'post-ps-001', mode: 'create' });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.stage).toBe('validation');
    expect(result.validation?.ok).toBe(false);
    expect(f.createOrUpdate).not.toHaveBeenCalled();
    expect(f.upsertBinding).not.toHaveBeenCalled();
  });

  it('honors validateBeforePublish=false and publishes through a known-invalid context', async () => {
    const f = fixture({ post: { Title: '' } });
    const orch = makeOrchestrator(f);
    const result = await orch.run({
      articleId: 'post-ps-001',
      mode: 'create',
      validateBeforePublish: false,
    });
    expect(result.ok).toBe(true);
    expect(f.createOrUpdate).toHaveBeenCalledTimes(1);
    expect(f.upsertBinding).toHaveBeenCalledTimes(1);
  });

  it('surfaces page-publish failures without writing the binding', async () => {
    const f = fixture();
    f.createOrUpdate.mockResolvedValueOnce({
      ok: false,
      reason: 'ensurePageFailed',
      message: 'tenant returned 500',
    });
    const orch = makeOrchestrator(f);
    const result = await orch.run({ articleId: 'post-ps-001', mode: 'create' });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.stage).toBe('pagePublish');
    expect(f.upsertBinding).not.toHaveBeenCalled();
  });
});
