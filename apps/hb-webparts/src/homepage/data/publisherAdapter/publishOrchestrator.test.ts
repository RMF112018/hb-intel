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

function article(over: Partial<PublisherArticleRow> = {}): PublisherArticleRow {
  return {
    ArticleId: 'art-ps-001',
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
    ArticleId: 'art-ps-001',
    TeamMemberId: id,
    Title: id,
    PersonPrincipal: `${id}@example.com`,
    DisplayName: id,
  };
}

function mediaRow(id: string): PublisherMediaRow {
  return {
    ArticleId: 'art-ps-001',
    MediaId: id,
    Title: id,
    MediaRole: 'gallery',
    ImageAsset: `https://img.example/${id}.jpg`,
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
  article?: Partial<PublisherArticleRow>;
  template?: Partial<PublisherTemplateRegistryRow>;
  existingBinding?: PublisherPageBindingRow;
} = {}): Fixture {
  const a = article(over.article);
  const t = tpl(over.template);

  const createOrUpdate = vi.fn(async () => ({
    ok: true as const,
    pageId: '123',
    pageUrl: `${a.TargetSiteUrl}/SitePages/${a.Slug}.aspx`,
    pageName: `${a.Slug}.aspx`,
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
      getByArticleId: vi.fn(async () => a),
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
    pageCreation: { createOrUpdate, publishLive: vi.fn(async (input) => ({ ok: true as const, pageId: input.pageId, publishedAtUtc: '2026-04-13T10:00:00.000Z' })), unpublishLive: vi.fn(async (input) => ({ ok: true as const, pageId: input.pageId })) },
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
    const historyAppend = vi.fn<
      PublisherRepositories['workflowHistory']['append']
    >(async () => ({ itemId: 77 }));
    f.repositories.workflowHistory.append = historyAppend;
    const articlesUpsert = vi.fn<
      PublisherRepositories['articles']['upsert']
    >(async () => ({ wasCreated: false, itemId: 1 }));
    f.repositories.articles.upsert = articlesUpsert;
    const orch = makeOrchestrator(f);
    const result = await orch.run({
      articleId: 'art-ps-001',
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

    // Orchestrator is the sole producer of WorkflowState='published':
    // the master HB Articles row is stamped here, and a
    // `previous → published` history row is appended.
    expect(articlesUpsert).toHaveBeenCalledTimes(1);
    const upsertedArticle = articlesUpsert.mock.calls[0]![0];
    expect(upsertedArticle.WorkflowState).toBe('published');
    expect(historyAppend).toHaveBeenCalledTimes(1);
    const historyRow = historyAppend.mock.calls[0]![0];
    expect(historyRow.NewState).toBe('published');
    expect(historyRow.PreviousState).toBe('approved');
  });

  it('inPlaceUpdate targets the bound PageId — not a filename — and preserves PageId/PageUrl on the binding row', async () => {
    const existing: PublisherPageBindingRow = {
      BindingId: 'bnd-existing-42',
      ArticleId: 'art-ps-001',
      Title: 'Acme Tower — April',
      PublishStatus: 'published',
      TargetSiteUrl: 'https://example.com/sites/ProjectSpotlight',
      PageId: '999',
      PageName: 'acme-tower-april.aspx',
      PageUrl:
        'https://example.com/sites/ProjectSpotlight/SitePages/acme-tower-april.aspx',
      PageShellVersion: '1.0.0',
      PageTemplateKey: 'ps-inprogress-monthly-v1',
      RenderVersion: '1.0.0',
    };
    const f = fixture({ existingBinding: existing });
    // Simulate the pages REST contract for targeted PATCH: the
    // creation service echoes the bound PageId / URL back so the
    // binding row stays anchored to the same page.
    f.createOrUpdate.mockImplementation(async (input) => ({
      ok: true as const,
      pageId: input.targetPageId ?? '123',
      pageUrl: existing.PageUrl!,
      pageName: existing.PageName!,
      wasCreated: false,
    }));
    const orch = makeOrchestrator(f);
    const result = await orch.run({
      articleId: 'art-ps-001',
      mode: 'republish',
      now: () => '2026-04-13T10:00:00.000Z',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.action).toBe('inPlaceUpdate');

    // createOrUpdate was invoked with the bound PageId — this is
    // what closes the P0-2 filename-rebinding seam.
    expect(f.createOrUpdate).toHaveBeenCalledTimes(1);
    const call = f.createOrUpdate.mock.calls[0]![0] as {
      page: unknown;
      targetPageId?: string;
    };
    expect(call.targetPageId).toBe('999');

    // Binding row preserves PageId + PageUrl exactly.
    const bindingRow = (f.upsertBinding.mock.calls[0]![0] as {
      row: PublisherPageBindingRow;
    }).row;
    expect(bindingRow.PageId).toBe('999');
    expect(bindingRow.PageUrl).toBe(existing.PageUrl);
  });

  it('does NOT pass targetPageId when creating a new page (no existing binding)', async () => {
    const f = fixture();
    const orch = makeOrchestrator(f);
    const result = await orch.run({
      articleId: 'art-ps-001',
      mode: 'create',
      now: () => '2026-04-13T10:00:00.000Z',
      generateBindingId: () => 'bnd-generated',
    });
    expect(result.ok).toBe(true);
    const call = f.createOrUpdate.mock.calls[0]![0] as {
      targetPageId?: string;
    };
    expect(call.targetPageId).toBeUndefined();
  });

  it('page-name drift triggers regenerate — the filename-based path cannot silently bind an unrelated page', async () => {
    const existing: PublisherPageBindingRow = {
      BindingId: 'bnd-existing-42',
      ArticleId: 'art-ps-001',
      Title: 'Acme Tower — April',
      PublishStatus: 'published',
      TargetSiteUrl: 'https://example.com/sites/ProjectSpotlight',
      PageId: '999',
      // Bound page's filename differs from the article's current
      // slug-derived page name ('acme-tower-april.aspx').
      PageName: 'acme-tower-march.aspx',
      PageShellVersion: '1.0.0',
      PageTemplateKey: 'ps-inprogress-monthly-v1',
      RenderVersion: '1.0.0',
    };
    const f = fixture({ existingBinding: existing });
    const orch = makeOrchestrator(f);
    const result = await orch.run({
      articleId: 'art-ps-001',
      mode: 'republish',
      now: () => '2026-04-13T10:00:00.000Z',
      generateBindingId: () => 'bnd-new',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.action).toBe('regenerate');
    // New page, not an in-place write.
    const call = f.createOrUpdate.mock.calls[0]![0] as {
      targetPageId?: string;
    };
    expect(call.targetPageId).toBeUndefined();
  });

  it('republish preserves existing BindingId when shell + template versions match', async () => {
    const existing: PublisherPageBindingRow = {
      BindingId: 'bnd-existing-42',
      ArticleId: 'art-ps-001',
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
      articleId: 'art-ps-001',
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

  it('republish from already-published state appends a republish history row', async () => {
    const existing: PublisherPageBindingRow = {
      BindingId: 'bnd-existing-42',
      ArticleId: 'art-ps-001',
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
    const f = fixture({
      article: { WorkflowState: 'published' },
      existingBinding: existing,
    });
    const historyAppend = vi.fn<
      PublisherRepositories['workflowHistory']['append']
    >(async () => ({ itemId: 88 }));
    f.repositories.workflowHistory.append = historyAppend;
    const articlesUpsert = vi.fn<
      PublisherRepositories['articles']['upsert']
    >(async () => ({ wasCreated: false, itemId: 1 }));
    f.repositories.articles.upsert = articlesUpsert;
    const orch = makeOrchestrator(f);
    const result = await orch.run({
      articleId: 'art-ps-001',
      mode: 'republish',
      now: () => '2026-04-13T10:00:00.000Z',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.action).toBe('inPlaceUpdate');

    // Article stays in `published` and a republish history row
    // captures the event with terminology that reflects the action.
    const upsertedArticle = articlesUpsert.mock.calls[0]![0];
    expect(upsertedArticle.WorkflowState).toBe('published');
    expect(historyAppend).toHaveBeenCalledTimes(1);
    const historyRow = historyAppend.mock.calls[0]![0];
    expect(historyRow.NewState).toBe('published');
    expect(historyRow.PreviousState).toBe('published');
    expect(historyRow.Title).toBe('republish (inPlaceUpdate)');
    expect(historyRow.ActionNote).toContain('republished');
  });

  it('idempotent republish emits noOp when binding is already in sync', async () => {
    const existing: PublisherPageBindingRow = {
      BindingId: 'bnd-existing-42',
      ArticleId: 'art-ps-001',
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
      articleId: 'art-ps-001',
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
      ArticleId: 'art-ps-001',
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
      articleId: 'art-ps-001',
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

  it('regenerate supersedes the single-row binding in place and stamps prior identity into the workflow-history ActionNote', async () => {
    const existing: PublisherPageBindingRow = {
      BindingId: 'bnd-prior-42',
      ArticleId: 'art-ps-001',
      Title: 'Acme Tower — April',
      PublishStatus: 'published',
      TargetSiteUrl: 'https://example.com/sites/ProjectSpotlight',
      PageId: '999',
      PageName: 'acme-tower-april.aspx',
      PageUrl:
        'https://example.com/sites/ProjectSpotlight/SitePages/acme-tower-april.aspx',
      // Force regeneration via templateKey drift — isolates the
      // supersession behavior from pageName / shell drift paths.
      PageShellVersion: '1.0.0',
      PageTemplateKey: 'ps-old-template-v1',
      RenderVersion: '1.0.0',
    };
    const f = fixture({ existingBinding: existing });
    f.createOrUpdate.mockResolvedValue({
      ok: true as const,
      pageId: '1001',
      pageUrl:
        'https://example.com/sites/ProjectSpotlight/SitePages/acme-tower-april.aspx',
      pageName: 'acme-tower-april.aspx',
      wasCreated: true,
    });
    const historyAppend = vi.fn<
      PublisherRepositories['workflowHistory']['append']
    >(async () => ({ itemId: 1 }));
    f.repositories.workflowHistory.append = historyAppend;
    const orch = makeOrchestrator(f);
    const result = await orch.run({
      articleId: 'art-ps-001',
      mode: 'republish',
      now: () => '2026-04-13T10:00:00.000Z',
      generateBindingId: () => 'bnd-new-99',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.action).toBe('regenerate');

    // New BindingId + new PageId overwrite the prior row — one-row
    // authoritative binding model.
    const bindingRow = (f.upsertBinding.mock.calls[0]![0] as {
      row: PublisherPageBindingRow;
    }).row;
    expect(bindingRow.BindingId).toBe('bnd-new-99');
    expect(bindingRow.PageId).toBe('1001');

    // Prior identity surfaced on the success outcome.
    expect(result.supersededBinding).toEqual({
      bindingId: 'bnd-prior-42',
      pageId: '999',
      pageName: 'acme-tower-april.aspx',
      pageUrl:
        'https://example.com/sites/ProjectSpotlight/SitePages/acme-tower-april.aspx',
    });

    // Prior identity durably persisted on the workflow-history row.
    expect(historyAppend).toHaveBeenCalledTimes(1);
    const historyRow = historyAppend.mock.calls[0]![0];
    expect(historyRow.ActionNote).toContain('supersededBinding=');
    expect(historyRow.ActionNote).toContain('"bindingId":"bnd-prior-42"');
    expect(historyRow.ActionNote).toContain('"pageId":"999"');
    expect(historyRow.ActionNote).toContain('newBinding=');
    expect(historyRow.ActionNote).toContain('"bindingId":"bnd-new-99"');
    expect(historyRow.ActionNote).toContain('"pageId":"1001"');
  });

  it('inPlaceUpdate does NOT emit a supersededBinding — same row is MERGEd without identity change', async () => {
    const existing: PublisherPageBindingRow = {
      BindingId: 'bnd-existing-42',
      ArticleId: 'art-ps-001',
      Title: 'Acme Tower — April',
      PublishStatus: 'published',
      TargetSiteUrl: 'https://example.com/sites/ProjectSpotlight',
      PageId: '999',
      PageName: 'acme-tower-april.aspx',
      PageUrl:
        'https://example.com/sites/ProjectSpotlight/SitePages/acme-tower-april.aspx',
      PageShellVersion: '1.0.0',
      PageTemplateKey: 'ps-inprogress-monthly-v1',
      RenderVersion: '1.0.0',
    };
    const f = fixture({ existingBinding: existing });
    f.createOrUpdate.mockImplementation(async (input) => ({
      ok: true as const,
      pageId: input.targetPageId ?? '123',
      pageUrl: existing.PageUrl!,
      pageName: existing.PageName!,
      wasCreated: false,
    }));
    const orch = makeOrchestrator(f);
    const result = await orch.run({
      articleId: 'art-ps-001',
      mode: 'republish',
      now: () => '2026-04-13T10:00:00.000Z',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.action).toBe('inPlaceUpdate');
    expect(result.supersededBinding).toBeUndefined();
  });

  it('blocks republish on archived binding', async () => {
    const existing: PublisherPageBindingRow = {
      BindingId: 'bnd-archived',
      ArticleId: 'art-ps-001',
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
    const result = await orch.run({ articleId: 'art-ps-001', mode: 'republish' });
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
    const result = await orch.run({ articleId: 'art-ps-001', mode: 'preview' });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.mode).toBe('preview');
    expect(f.createOrUpdate).not.toHaveBeenCalled();
    expect(f.upsertBinding).not.toHaveBeenCalled();
    expect(result.page.controls).toHaveLength(5);
  });

  it('blocks publish when validation fails and does not touch the page-creation service or binding writer', async () => {
    const f = fixture({ article: { Title: '' } });
    const orch = makeOrchestrator(f);
    const result = await orch.run({ articleId: 'art-ps-001', mode: 'create' });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.stage).toBe('validation');
    expect(result.validation?.ok).toBe(false);
    expect(f.createOrUpdate).not.toHaveBeenCalled();
    expect(f.upsertBinding).not.toHaveBeenCalled();
  });

  it('honors validateBeforePublish=false and publishes through a known-invalid context', async () => {
    const f = fixture({ article: { Title: '' } });
    const orch = makeOrchestrator(f);
    const result = await orch.run({
      articleId: 'art-ps-001',
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
    const result = await orch.run({ articleId: 'art-ps-001', mode: 'create' });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.stage).toBe('pagePublish');
    expect(f.upsertBinding).not.toHaveBeenCalled();
  });
});
