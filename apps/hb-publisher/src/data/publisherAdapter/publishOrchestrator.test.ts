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
    ProjectStage: 'active',
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
    RequiredFieldSetKey: 'req-ps-inprogress-monthly-v1',
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
      append: vi.fn(async () => ({ itemId: 1 })),
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
  it('blocks manual transition INTO scheduled and leaves article/history untouched', async () => {
    const f = fixture({
      article: { WorkflowState: 'approved' },
    });
    const articlesUpsert = vi.fn<
      PublisherRepositories['articles']['upsert']
    >(async () => ({ wasCreated: false, itemId: 1 }));
    const historyAppend = vi.fn<
      PublisherRepositories['workflowHistory']['append']
    >(async () => ({ itemId: 1 }));
    f.repositories.articles.upsert = articlesUpsert;
    f.repositories.workflowHistory.append = historyAppend;

    const orch = makeOrchestrator(f);
    const outcome = await orch.transitionManual({
      articleId: 'art-ps-001',
      to: 'scheduled',
      actorEmail: 'operator@example.com',
      note: 'attempt schedule',
      now: () => '2026-04-14T12:00:00.000Z',
    });
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.stage).toBe('transition');
    expect(outcome.previousState).toBe('approved');
    expect(outcome.message).toContain('Cannot transition from approved to scheduled');
    expect(articlesUpsert).not.toHaveBeenCalled();
    expect(historyAppend).not.toHaveBeenCalled();
  });

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

  it('stamps workflow-history ActorEmail with the acting operator, not the article author (Phase-05 Prompt-04)', async () => {
    const f = fixture({
      article: { AuthorEmail: 'alice.author@example.com' },
    });
    const historyAppend = vi.fn<
      PublisherRepositories['workflowHistory']['append']
    >(async () => ({ itemId: 1 }));
    f.repositories.workflowHistory.append = historyAppend;
    f.repositories.articles.upsert = vi.fn<
      PublisherRepositories['articles']['upsert']
    >(async () => ({ wasCreated: false, itemId: 1 }));

    const orch = makeOrchestrator(f);
    const result = await orch.run({
      articleId: 'art-ps-001',
      mode: 'create',
      now: () => '2026-04-13T10:00:00.000Z',
      generateBindingId: () => 'bnd-1',
      actorEmail: 'bob.operator@example.com',
    });
    expect(result.ok).toBe(true);
    const history = historyAppend.mock.calls[0]![0];
    expect(history.ActorEmail).toBe('bob.operator@example.com');
    expect(history.ActorEmail).not.toBe('alice.author@example.com');
  });

  it('falls back to article AuthorEmail when the caller did not thread an operator (back-compat)', async () => {
    const f = fixture({
      article: { AuthorEmail: 'alice.author@example.com' },
    });
    const historyAppend = vi.fn<
      PublisherRepositories['workflowHistory']['append']
    >(async () => ({ itemId: 1 }));
    f.repositories.workflowHistory.append = historyAppend;
    f.repositories.articles.upsert = vi.fn<
      PublisherRepositories['articles']['upsert']
    >(async () => ({ wasCreated: false, itemId: 1 }));

    const orch = makeOrchestrator(f);
    await orch.run({
      articleId: 'art-ps-001',
      mode: 'create',
      now: () => '2026-04-13T10:00:00.000Z',
      generateBindingId: () => 'bnd-1',
    });
    const history = historyAppend.mock.calls[0]![0];
    expect(history.ActorEmail).toBe('alice.author@example.com');
  });

  it('back-syncs the authoritative TargetSiteUrl onto HB Articles after successful publish (Phase-05 Prompt-02)', async () => {
    // Article column is blank (tenant-optional); orchestrator
    // derives the canonical destination URL for the binding row,
    // and the master-row back-sync must carry the same string so
    // `HB Articles.TargetSiteUrl` and
    // `HB Article Destination Pages.TargetSiteUrl` agree.
    const f = fixture({ article: { TargetSiteUrl: undefined } });
    const articlesUpsert = vi.fn<
      PublisherRepositories['articles']['upsert']
    >(async () => ({ wasCreated: false, itemId: 1 }));
    f.repositories.articles.upsert = articlesUpsert;
    f.repositories.workflowHistory.append = vi.fn<
      PublisherRepositories['workflowHistory']['append']
    >(async () => ({ itemId: 1 }));

    const orch = makeOrchestrator(f);
    const result = await orch.run({
      articleId: 'art-ps-001',
      mode: 'create',
      now: () => '2026-04-13T10:00:00.000Z',
      generateBindingId: () => 'bnd-generated',
    });
    expect(result.ok).toBe(true);

    const bindingRow = (f.upsertBinding.mock.calls[0]![0] as {
      row: PublisherPageBindingRow;
    }).row;
    expect(bindingRow.TargetSiteUrl).toBe(
      'https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight',
    );

    const upsertedArticle = articlesUpsert.mock.calls[0]![0];
    expect(upsertedArticle.TargetSiteUrl).toBe(bindingRow.TargetSiteUrl);
  });

  it('classifies a post-publish workflow-history append failure as `historyAppend`, not `articleSync` (P1-4 closure)', async () => {
    const f = fixture();
    // Articles back-sync succeeds; workflow-history append is the
    // step that fails. The recorded publishing-error stage must
    // point at the workflow-history subsystem so operators know
    // which list to inspect — previously this was misclassified
    // as `articleSync` and indistinguishable from a back-sync
    // failure.
    f.repositories.articles.upsert = vi.fn<
      PublisherRepositories['articles']['upsert']
    >(async () => ({ wasCreated: false, itemId: 1 }));
    f.repositories.workflowHistory.append = vi.fn<
      PublisherRepositories['workflowHistory']['append']
    >(async () => {
      throw new Error('workflow-history list is offline');
    });
    const errorAppend = vi.fn<
      PublisherRepositories['publishingErrors']['append']
    >(async () => ({ itemId: 1 }));
    f.repositories.publishingErrors.append = errorAppend;

    const orch = makeOrchestrator(f);
    const result = await orch.run({
      articleId: 'art-ps-001',
      mode: 'create',
      now: () => '2026-04-13T10:00:00.000Z',
      generateBindingId: () => 'bnd-generated',
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.stage).toBe('historyAppend');
    expect(result.rollback).toEqual({
      attempted: true,
      succeeded: true,
      message:
        'Compensating SavePageAsDraft succeeded after historyAppend (pageId=123).',
    });
    expect(
      (
        f.pageCreation.unpublishLive as unknown as ReturnType<typeof vi.fn>
      ).mock.calls[0]?.[0],
    ).toEqual({
      pageId: '123',
      siteUrl: 'https://example.com/sites/ProjectSpotlight',
    });

    expect(errorAppend).toHaveBeenCalledTimes(1);
    const errorRow = errorAppend.mock.calls[0]![0];
    expect(errorRow.Title).toMatch(/^create\.historyAppend:/);
    expect(errorRow.ErrorSummary).toContain(
      'HB Article Workflow History append failed',
    );
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
    const f = fixture({ article: { WorkflowState: 'published' }, existingBinding: existing });
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
    const f = fixture({ article: { WorkflowState: 'published' }, existingBinding: existing });
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
    const f = fixture({ article: { WorkflowState: 'published' }, existingBinding: existing });
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
    const f = fixture({ article: { WorkflowState: 'published' }, existingBinding: existing });
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

  it('regenerates (new page, new binding) on template-key drift', async () => {
    const existing: PublisherPageBindingRow = {
      BindingId: 'bnd-existing-42',
      ArticleId: 'art-ps-001',
      Title: 'Acme Tower — April',
      PublishStatus: 'published',
      TargetSiteUrl: 'https://example.com/sites/ProjectSpotlight',
      PageId: '999',
      PageName: 'acme-tower-april.aspx',
      PageShellVersion: '1.0.0',
      PageTemplateKey: 'ps-old-template-v1',
      RenderVersion: '1.0.0',
    };
    const f = fixture({ article: { WorkflowState: 'published' }, existingBinding: existing });
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
    const f = fixture({ article: { WorkflowState: 'published' }, existingBinding: existing });
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

    // Wave-03 Prompt-05: durable lineage lives in STRUCTURED workflow-history
    // columns, not in freeform JSON-in-ActionNote. ActionNote retains a short
    // human-readable narrative but is no longer the machine-readable record.
    expect(historyAppend).toHaveBeenCalledTimes(1);
    const historyRow = historyAppend.mock.calls[0]![0];
    expect(historyRow.SupersededBindingId).toBe('bnd-prior-42');
    expect(historyRow.SupersededPageId).toBe('999');
    expect(historyRow.SupersededPageName).toBe('acme-tower-april.aspx');
    expect(historyRow.SupersededPageUrl).toBe(
      'https://example.com/sites/ProjectSpotlight/SitePages/acme-tower-april.aspx',
    );
    expect(historyRow.NewBindingId).toBe('bnd-new-99');
    expect(historyRow.NewPageId).toBe('1001');
    // Secondary narrative — short and deterministic, not a JSON blob.
    expect(historyRow.ActionNote).toMatch(/Replaces prior binding 'bnd-prior-42'/);
    expect(historyRow.ActionNote).not.toContain('supersededBinding=');
  });

  it('inPlaceUpdate does not populate supersession lineage columns on the history row (Wave-03 Prompt-05)', async () => {
    const existing: PublisherPageBindingRow = {
      BindingId: 'bnd-inplace-1',
      ArticleId: 'art-ps-001',
      Title: 'Acme Tower — April',
      PublishStatus: 'published',
      TargetSiteUrl: 'https://example.com/sites/ProjectSpotlight',
      PageId: '500',
      PageName: 'acme-tower-april.aspx',
      PageUrl:
        'https://example.com/sites/ProjectSpotlight/SitePages/acme-tower-april.aspx',
      PageShellVersion: '1.0.0',
      PageTemplateKey: 'ps-inprogress-monthly-v1',
      RenderVersion: '1.0.0',
    };
    const f = fixture({
      article: { WorkflowState: 'published' },
      existingBinding: existing,
    });
    f.createOrUpdate.mockImplementation(async (input) => ({
      ok: true as const,
      pageId: input.targetPageId ?? '500',
      pageUrl: existing.PageUrl!,
      pageName: existing.PageName!,
      wasCreated: false,
    }));
    const historyAppend = vi.fn<
      PublisherRepositories['workflowHistory']['append']
    >(async () => ({ itemId: 1 }));
    f.repositories.workflowHistory.append = historyAppend;
    f.repositories.articles.upsert = vi.fn<
      PublisherRepositories['articles']['upsert']
    >(async () => ({ wasCreated: false, itemId: 1 }));

    const orch = makeOrchestrator(f);
    const result = await orch.run({
      articleId: 'art-ps-001',
      mode: 'republish',
      now: () => '2026-04-13T11:00:00.000Z',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.action).toBe('inPlaceUpdate');

    const historyRow = historyAppend.mock.calls[0]?.[0];
    expect(historyRow?.SupersededBindingId).toBeUndefined();
    expect(historyRow?.SupersededPageId).toBeUndefined();
    expect(historyRow?.NewBindingId).toBeUndefined();
    expect(historyRow?.NewPageId).toBeUndefined();
  });

  it('create (no prior binding) does not populate supersession lineage columns on the history row (Wave-03 Prompt-05)', async () => {
    const f = fixture();
    const historyAppend = vi.fn<
      PublisherRepositories['workflowHistory']['append']
    >(async () => ({ itemId: 1 }));
    f.repositories.workflowHistory.append = historyAppend;
    f.repositories.articles.upsert = vi.fn<
      PublisherRepositories['articles']['upsert']
    >(async () => ({ wasCreated: false, itemId: 1 }));
    const orch = makeOrchestrator(f);
    const result = await orch.run({
      articleId: 'art-ps-001',
      mode: 'create',
      now: () => '2026-04-13T12:00:00.000Z',
      generateBindingId: () => 'bnd-first',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.action).toBe('create');

    const historyRow = historyAppend.mock.calls[0]?.[0];
    expect(historyRow?.SupersededBindingId).toBeUndefined();
    expect(historyRow?.NewBindingId).toBeUndefined();
    // ActionNote is narrative-only, no JSON-embedded lineage blob.
    expect(historyRow?.ActionNote).not.toContain('supersededBinding=');
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
    const f = fixture({ article: { WorkflowState: 'published' }, existingBinding: existing });
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

  it('blocks republish when the master article is archived', async () => {
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
    const f = fixture({
      article: { WorkflowState: 'archived' },
      existingBinding: existing,
    });
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

  // Phase-09 Prompt-02: republish approval gate. A bound article in a
  // non-`published` lifecycle state must not be able to re-enter the
  // publish pipeline via Republish. The Publish action remains the
  // single route for `approved` content; Republish is reserved for
  // already-live content.
  describe('republish approval gate (phase-09 prompt-02)', () => {
    const bound: PublisherPageBindingRow = {
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

    it('blocks republish when the master article is in draft (bound but not published)', async () => {
      const f = fixture({
        article: { WorkflowState: 'draft' },
        existingBinding: bound,
      });
      const orch = makeOrchestrator(f);
      const result = await orch.run({ articleId: 'art-ps-001', mode: 'republish' });
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.stage).toBe('policy');
      expect(result.decision?.action).toBe('blocked');
      expect(result.decision?.reason).toBe('articleNotPublished');
      expect(f.createOrUpdate).not.toHaveBeenCalled();
      expect(f.upsertBinding).not.toHaveBeenCalled();
    });

    it('blocks republish when the master article is in review (bound but not published)', async () => {
      const f = fixture({
        article: { WorkflowState: 'review' },
        existingBinding: bound,
      });
      const orch = makeOrchestrator(f);
      const result = await orch.run({ articleId: 'art-ps-001', mode: 'republish' });
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.stage).toBe('policy');
      expect(result.decision?.reason).toBe('articleNotPublished');
      expect(f.createOrUpdate).not.toHaveBeenCalled();
      expect(f.upsertBinding).not.toHaveBeenCalled();
    });

    it('blocks republish when the master article is in approved (must go through Publish, not Republish)', async () => {
      const f = fixture({
        article: { WorkflowState: 'approved' },
        existingBinding: bound,
      });
      const orch = makeOrchestrator(f);
      const result = await orch.run({ articleId: 'art-ps-001', mode: 'republish' });
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.stage).toBe('policy');
      expect(result.decision?.reason).toBe('articleNotPublished');
      expect(f.createOrUpdate).not.toHaveBeenCalled();
      expect(f.upsertBinding).not.toHaveBeenCalled();
    });

    it('allows the ordinary Publish path from approved (control flow preserved)', async () => {
      const f = fixture({ article: { WorkflowState: 'approved' } });
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
    });

    it('allows republish from published (legitimately live content)', async () => {
      const f = fixture({
        article: { WorkflowState: 'published' },
        existingBinding: bound,
      });
      f.createOrUpdate.mockImplementation(async (input) => ({
        ok: true as const,
        pageId: input.targetPageId ?? '999',
        pageUrl: bound.PageUrl!,
        pageName: bound.PageName!,
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
      expect(f.upsertBinding).toHaveBeenCalledTimes(1);
    });
  });

  // Phase-09 Prompt-06: milestone legacy hard-block. `milestoneSpotlight`
  // has no authoring UI, no persistence, and no validation profile, so
  // publish/republish must be rejected before any page or binding
  // writes. Preview remains allowed so operators can see the article.
  describe('milestone legacy hard-block (phase-09 prompt-06)', () => {
    it('blocks create when ArticleContentType is milestoneSpotlight', async () => {
      const f = fixture({ article: { ArticleContentType: 'milestoneSpotlight' } });
      const orch = makeOrchestrator(f);
      const result = await orch.run({ articleId: 'art-ps-001', mode: 'create' });
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.stage).toBe('policy');
      expect(result.decision?.action).toBe('blocked');
      expect(result.decision?.reason).toBe('legacyContentType');
      expect(f.createOrUpdate).not.toHaveBeenCalled();
      expect(f.upsertBinding).not.toHaveBeenCalled();
    });

    it('blocks republish when ArticleContentType is milestoneSpotlight (even from a valid published+bound state)', async () => {
      const existing: PublisherPageBindingRow = {
        BindingId: 'bnd-existing-42',
        ArticleId: 'art-ps-001',
        Title: 'Legacy milestone',
        PublishStatus: 'published',
        TargetSiteUrl: 'https://example.com/sites/ProjectSpotlight',
        PageId: '999',
        PageName: 'legacy-milestone.aspx',
        PageUrl:
          'https://example.com/sites/ProjectSpotlight/SitePages/legacy-milestone.aspx',
        PageShellVersion: '1.0.0',
        PageTemplateKey: 'ps-inprogress-monthly-v1',
        RenderVersion: '1.0.0',
      };
      const f = fixture({
        article: {
          ArticleContentType: 'milestoneSpotlight',
          WorkflowState: 'published',
        },
        existingBinding: existing,
      });
      const orch = makeOrchestrator(f);
      const result = await orch.run({ articleId: 'art-ps-001', mode: 'republish' });
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.stage).toBe('policy');
      expect(result.decision?.reason).toBe('legacyContentType');
      expect(f.createOrUpdate).not.toHaveBeenCalled();
      expect(f.upsertBinding).not.toHaveBeenCalled();
    });

    it('does NOT apply the milestone policy block to preview mode (preview bypasses the gate)', async () => {
      const f = fixture({ article: { ArticleContentType: 'milestoneSpotlight' } });
      const orch = makeOrchestrator(f);
      const result = await orch.run({ articleId: 'art-ps-001', mode: 'preview' });
      // The milestone gate only fires for non-preview modes. Preview
      // may still fail at template resolution (no operational
      // milestone template exists), but it must not be blocked with
      // stage 'policy' / reason 'legacyContentType'.
      if (!result.ok) {
        expect(result.stage).not.toBe('policy');
      }
      // No writes regardless of preview outcome.
      expect(f.createOrUpdate).not.toHaveBeenCalled();
      expect(f.upsertBinding).not.toHaveBeenCalled();
    });

    it('does NOT block operational content types (monthlySpotlight publish still works)', async () => {
      const f = fixture();
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
    });
  });

  describe('resolution-stage repository-read normalization (phase-10 prompt-01)', () => {
    it('non-preview resolution read failure returns stage=resolution and appends HB Article Publishing Errors', async () => {
      const f = fixture();
      f.repositories.templateRegistry.listActive = vi.fn(async () => {
        throw new Error('reg 500');
      });
      const errorAppend = vi.fn<
        PublisherRepositories['publishingErrors']['append']
      >(async () => ({ itemId: 9 }));
      f.repositories.publishingErrors.append = errorAppend;

      const orch = makeOrchestrator(f);
      const result = await orch.run({
        articleId: 'art-ps-001',
        mode: 'create',
        now: () => '2026-04-13T10:00:00.000Z',
      });
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.stage).toBe('resolution');
      expect(result.message).toContain('templateRegistry');
      expect(errorAppend).toHaveBeenCalledTimes(1);
      const row = errorAppend.mock.calls[0]![0];
      expect(row.ArticleId).toBe('art-ps-001');
      expect(row.Title).toContain('resolution');
      expect(row.Title).toContain('Acme Tower — April');
      expect(row.Destination).toBe('projectSpotlight');
      expect(row.ErrorSummary).toContain('templateRegistry');
    });

    it('preview mode does not write the error log when a resolution read fails', async () => {
      const f = fixture();
      f.repositories.media.listByArticle = vi.fn(async () => {
        throw new Error('media down');
      });
      const errorAppend = vi.fn<
        PublisherRepositories['publishingErrors']['append']
      >(async () => ({ itemId: 1 }));
      f.repositories.publishingErrors.append = errorAppend;

      const orch = makeOrchestrator(f);
      const result = await orch.run({
        articleId: 'art-ps-001',
        mode: 'preview',
      });
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.stage).toBe('resolution');
      expect(errorAppend).not.toHaveBeenCalled();
      expect(f.createOrUpdate).not.toHaveBeenCalled();
      expect(f.upsertBinding).not.toHaveBeenCalled();
    });
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

  describe('late-publish fail-truthful reconciliation (phase-10 prompt-02)', () => {
    it('create + articleSync failure: page demoted, binding reconciled to error, master never stamped published', async () => {
      const f = fixture();
      const articlesUpsert = vi.fn<
        PublisherRepositories['articles']['upsert']
      >(async () => {
        throw new Error('HB Articles offline');
      });
      f.repositories.articles.upsert = articlesUpsert;
      const historyAppend = vi.fn<
        PublisherRepositories['workflowHistory']['append']
      >(async () => ({ itemId: 1 }));
      f.repositories.workflowHistory.append = historyAppend;
      const errorAppend = vi.fn<
        PublisherRepositories['publishingErrors']['append']
      >(async () => ({ itemId: 1 }));
      f.repositories.publishingErrors.append = errorAppend;

      const orch = makeOrchestrator(f);
      const result = await orch.run({
        articleId: 'art-ps-001',
        mode: 'create',
        now: () => '2026-04-13T10:00:00.000Z',
        generateBindingId: () => 'bnd-1',
      });
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.stage).toBe('articleSync');
      expect(result.rollback?.succeeded).toBe(true);

      // Binding: first upsert is the initial success write, second is the reconcile.
      expect(f.upsertBinding).toHaveBeenCalledTimes(2);
      const reconciledBinding = (
        f.upsertBinding.mock.calls[1]![0] as { row: PublisherPageBindingRow }
      ).row;
      expect(reconciledBinding.PublishStatus).toBe('error');
      expect(reconciledBinding.SyncStatus).toBe('error');
      expect(reconciledBinding.BindingId).toBe('bnd-1');

      // Master: only the throwing call, no successful reconcile call
      // (articleSync means master was never written).
      expect(articlesUpsert).toHaveBeenCalledTimes(1);
      // No history row on late-failure closure.
      expect(historyAppend).not.toHaveBeenCalled();
      // Error row classification
      const errorRow = errorAppend.mock.calls[0]![0];
      expect(errorRow.Title).toMatch(/^create\.articleSync:/);
      expect(errorRow.ErrorSummary).toContain(
        'Binding reconciled to PublishStatus=error',
      );
    });

    it('create + historyAppend failure: page demoted, binding reconciled to error, master reverted to previous WorkflowState with PageSyncStatus=error', async () => {
      const f = fixture({ article: { WorkflowState: 'approved' } });
      const articlesUpsert = vi.fn<
        PublisherRepositories['articles']['upsert']
      >(async () => ({ wasCreated: false, itemId: 1 }));
      f.repositories.articles.upsert = articlesUpsert;
      f.repositories.workflowHistory.append = vi.fn<
        PublisherRepositories['workflowHistory']['append']
      >(async () => {
        throw new Error('workflow history offline');
      });
      const errorAppend = vi.fn<
        PublisherRepositories['publishingErrors']['append']
      >(async () => ({ itemId: 1 }));
      f.repositories.publishingErrors.append = errorAppend;

      const orch = makeOrchestrator(f);
      const result = await orch.run({
        articleId: 'art-ps-001',
        mode: 'create',
        now: () => '2026-04-13T10:00:00.000Z',
        generateBindingId: () => 'bnd-1',
      });
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.stage).toBe('historyAppend');
      expect(result.rollback?.succeeded).toBe(true);

      // Binding reconciled
      expect(f.upsertBinding).toHaveBeenCalledTimes(2);
      const reconciledBinding = (
        f.upsertBinding.mock.calls[1]![0] as { row: PublisherPageBindingRow }
      ).row;
      expect(reconciledBinding.PublishStatus).toBe('error');
      expect(reconciledBinding.SyncStatus).toBe('error');

      // Master: 1st call was the WorkflowState='published' write,
      // 2nd call is the revert (WorkflowState='approved', PageSyncStatus='error').
      expect(articlesUpsert).toHaveBeenCalledTimes(2);
      const firstWrite = articlesUpsert.mock.calls[0]![0];
      expect(firstWrite.WorkflowState).toBe('published');
      const revert = articlesUpsert.mock.calls[1]![0];
      expect(revert.WorkflowState).toBe('approved');
      expect(revert.PageSyncStatus).toBe('error');

      const errorRow = errorAppend.mock.calls[0]![0];
      expect(errorRow.Title).toMatch(/^create\.historyAppend:/);
      expect(errorRow.ErrorSummary).toContain(
        "Master article reverted to WorkflowState='approved'",
      );
    });

    it('in-place republish + historyAppend failure: page demoted, binding reconciled; master stays at previous published state with PageSyncStatus=error', async () => {
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
      const f = fixture({
        article: { WorkflowState: 'published' },
        existingBinding: existing,
      });
      const articlesUpsert = vi.fn<
        PublisherRepositories['articles']['upsert']
      >(async () => ({ wasCreated: false, itemId: 1 }));
      f.repositories.articles.upsert = articlesUpsert;
      f.repositories.workflowHistory.append = vi.fn<
        PublisherRepositories['workflowHistory']['append']
      >(async () => {
        throw new Error('workflow history offline');
      });
      f.repositories.publishingErrors.append = vi.fn<
        PublisherRepositories['publishingErrors']['append']
      >(async () => ({ itemId: 1 }));

      const orch = makeOrchestrator(f);
      const result = await orch.run({
        articleId: 'art-ps-001',
        mode: 'republish',
        now: () => '2026-04-13T10:00:00.000Z',
      });
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.stage).toBe('historyAppend');

      // Master reconcile: WorkflowState was already 'published' and stays
      // 'published' (that is the previous state), but PageSyncStatus flips
      // to 'error' so the master no longer falsely advertises healthy closure.
      expect(articlesUpsert).toHaveBeenCalledTimes(2);
      const revert = articlesUpsert.mock.calls[1]![0];
      expect(revert.WorkflowState).toBe('published');
      expect(revert.PageSyncStatus).toBe('error');

      // Binding: first call is the in-place success write, second is reconcile.
      const reconciledBinding = (
        f.upsertBinding.mock.calls[1]![0] as { row: PublisherPageBindingRow }
      ).row;
      expect(reconciledBinding.BindingId).toBe('bnd-existing-42');
      expect(reconciledBinding.PublishStatus).toBe('error');
      expect(reconciledBinding.SyncStatus).toBe('error');
    });

    it('regenerate + articleSync failure: page demoted, binding reconciled to error, master never written', async () => {
      const existing: PublisherPageBindingRow = {
        BindingId: 'bnd-old',
        ArticleId: 'art-ps-001',
        Title: 'Acme Tower — April',
        PublishStatus: 'published',
        TargetSiteUrl: 'https://example.com/sites/ProjectSpotlight',
        PageId: '777',
        PageName: 'old-name.aspx',
        PageUrl:
          'https://example.com/sites/ProjectSpotlight/SitePages/old-name.aspx',
        PageShellVersion: '1.0.0',
        PageTemplateKey: 'ps-inprogress-monthly-v1',
        RenderVersion: '0.9.0',
      };
      const f = fixture({
        article: { WorkflowState: 'published' },
        existingBinding: existing,
      });
      f.repositories.articles.upsert = vi.fn<
        PublisherRepositories['articles']['upsert']
      >(async () => {
        throw new Error('HB Articles offline');
      });
      f.repositories.publishingErrors.append = vi.fn<
        PublisherRepositories['publishingErrors']['append']
      >(async () => ({ itemId: 1 }));

      const orch = makeOrchestrator(f);
      const result = await orch.run({
        articleId: 'art-ps-001',
        mode: 'republish',
        now: () => '2026-04-13T10:00:00.000Z',
        generateBindingId: () => 'bnd-new',
      });
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.stage).toBe('articleSync');

      // Second upsert on binding is the reconcile.
      expect(f.upsertBinding).toHaveBeenCalledTimes(2);
      const reconciledBinding = (
        f.upsertBinding.mock.calls[1]![0] as { row: PublisherPageBindingRow }
      ).row;
      expect(reconciledBinding.PublishStatus).toBe('error');
      expect(reconciledBinding.SyncStatus).toBe('error');
    });
  });
});
