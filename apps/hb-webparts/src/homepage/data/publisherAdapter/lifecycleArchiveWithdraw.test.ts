/**
 * Archive / withdraw operational lifecycle proof.
 *
 * Pins the contract that `orchestrator.archive` and
 * `orchestrator.withdraw` perform a coordinated multi-row
 * mutation across:
 *   - master `HB Articles` (WorkflowState, ArchiveDateUtc,
 *     IncludeInDestinationLanding, IncludeInHomepageFeed,
 *     SuppressFromRollups, IncludeInArchive, UpdatedDateUtc)
 *   - `HB Article Destination Pages` (PublishStatus='draft',
 *     SyncStatus='pending', LastSyncDateUtc, LastSyncMessage)
 *   - `HB Article Workflow History` (PreviousState → NewState row
 *     with the operator's ActorEmail / ActionNote)
 *
 * Failure isolation is also pinned: a refused state transition
 * never mutates any list; an article-update failure never reaches
 * the binding/history seams; a binding-update failure never reaches
 * the history seam.
 */
import { describe, expect, it, vi } from 'vitest';
import { createPublishOrchestrator } from './publishOrchestrator';
import { createPageShellService } from './pageGeneration/pageShellService';
import type { PageBindingWriter } from './pageBindingWriter';
import type { PageCreationService } from './pageGeneration/pageCreationService';
import type {
  PublisherArticleRow,
  PublisherPageBindingRow,
  PublisherWorkflowHistoryRow,
} from './publisherContracts';
import type { PublisherRepositories } from './publisherRepositories';

const NOW = '2026-04-13T10:00:00.000Z';

function article(over: Partial<PublisherArticleRow> = {}): PublisherArticleRow {
  return {
    ArticleId: 'art-001',
    Title: 'Article one',
    ArticleContentType: 'monthlySpotlight',
    Destination: 'projectSpotlight',
    Slug: 'article-one',
    TemplateKey: 'tmpl-v1',
    WorkflowState: 'published',
    Subhead: 'sub',
    SummaryExcerpt: 'sum',
    BodyRichText: '<p>body</p>',
    HeroPrimaryImage: 'https://img.example/h.jpg',
    HeroPrimaryImageAltText: 'alt',
    CreatedDateUtc: '2026-04-01T00:00:00Z',
    UpdatedDateUtc: '2026-04-10T00:00:00Z',
    PublishedDateUtc: '2026-04-10T00:00:00Z',
    AuthorEmail: 'editor@example.com',
    TargetSiteUrl:
      'https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight',
    IncludeInDestinationLanding: true,
    IncludeInHomepageFeed: true,
    SuppressFromRollups: false,
    ...over,
  };
}

function existingBinding(): PublisherPageBindingRow {
  return {
    BindingId: 'bnd-existing',
    ArticleId: 'art-001',
    Title: 'Article one',
    TargetSiteUrl:
      'https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight',
    PageTemplateKey: 'tmpl-v1',
    PublishStatus: 'published',
    PageId: '123',
    PageName: 'article-one.aspx',
    PageShellVersion: 'v1',
    RenderVersion: '1.0.0',
    SyncStatus: 'in-sync',
    LastSyncDateUtc: '2026-04-10T00:00:00Z',
  };
}

interface Fixture {
  repositories: PublisherRepositories;
  articleUpsert: ReturnType<typeof vi.fn>;
  bindingUpsert: ReturnType<typeof vi.fn>;
  historyAppend: ReturnType<typeof vi.fn>;
  errorAppend: ReturnType<typeof vi.fn>;
}

function buildFixture(input: {
  art?: PublisherArticleRow;
  binding?: PublisherPageBindingRow | null;
  articleUpsertImpl?: () => Promise<{ wasCreated: boolean; itemId: number }>;
  bindingUpsertImpl?: (row: PublisherPageBindingRow) => Promise<{
    bindingId: string;
    wasCreated: boolean;
    itemId: number;
  }>;
  historyAppendImpl?: () => Promise<{ itemId: number }>;
} = {}): Fixture {
  const art = input.art ?? article();
  const binding =
    input.binding === null
      ? undefined
      : input.binding ?? existingBinding();
  const articleUpsert = vi.fn(
    input.articleUpsertImpl ?? (async () => ({ wasCreated: false, itemId: 1 })),
  );
  const bindingUpsert = vi.fn(
    input.bindingUpsertImpl ??
      (async (row) => ({
        bindingId: row.BindingId,
        wasCreated: false,
        itemId: 1,
      })),
  );
  const historyAppend = vi.fn(input.historyAppendImpl ?? (async () => ({ itemId: 1 })));
  const errorAppend = vi.fn(async () => ({ itemId: 99 }));
  const repositories: PublisherRepositories = {
    articles: {
      getByArticleId: vi.fn(async () => art),
      listByWorkflowState: vi.fn(async () => []),
      upsert: articleUpsert,
    },
    teamMembers: {
      listByArticle: vi.fn(async () => []),
      replaceAllForArticle: vi.fn(async () => ({ deleted: 0, written: 0 })),
    },
    media: {
      listByArticle: vi.fn(async () => []),
      replaceAllForArticle: vi.fn(async () => ({ deleted: 0, written: 0 })),
    },
    templateRegistry: {
      listActive: vi.fn(async () => []),
      getByKey: vi.fn(async () => undefined),
    },
    pageBindings: {
      getByArticleId: vi.fn(async () => binding),
      upsert: bindingUpsert,
    },
    workflowHistory: {
      listByArticle: vi.fn(async () => []),
      append: historyAppend,
    },
    publishingErrors: {
      listByArticle: vi.fn(async () => []),
      append: errorAppend,
    },
    promotionRules: {
      listActive: vi.fn(async () => []),
    },
  };
  return { repositories, articleUpsert, bindingUpsert, historyAppend, errorAppend };
}

const noopPageShell = createPageShellService({
  pageCreation: {
    createOrUpdate: vi.fn(async () => ({
      ok: true as const,
      pageId: 'unused',
      pageUrl: 'unused',
      pageName: 'unused',
      wasCreated: false,
    })),
    publishLive: vi.fn(async ({ pageId }) => ({
      ok: true as const,
      pageId,
    })),
    unpublishLive: vi.fn(async ({ pageId }) => ({
      ok: true as const,
      pageId,
    })),
  } satisfies PageCreationService,
});
const noopBindingWriter: PageBindingWriter = {
  upsert: vi.fn(async () => ({
    ok: true as const,
    bindingId: 'unused',
    wasCreated: false,
    itemId: 1,
  })),
};

function makeOrch(repositories: PublisherRepositories) {
  return createPublishOrchestrator({
    repositories,
    pageBindingWriter: noopBindingWriter,
    pageShellService: noopPageShell,
  });
}

function makeOrchWithUnpublish(
  repositories: PublisherRepositories,
  unpublishImpl: PageCreationService['unpublishLive'],
) {
  const unpublishLive = vi.fn(unpublishImpl);
  const pageShell = createPageShellService({
    pageCreation: {
      createOrUpdate: vi.fn(async () => ({
        ok: true as const,
        pageId: 'unused',
        pageUrl: 'unused',
        pageName: 'unused',
        wasCreated: false,
      })),
      publishLive: vi.fn(async ({ pageId }) => ({
        ok: true as const,
        pageId,
      })),
      unpublishLive,
    } satisfies PageCreationService,
  });
  const orch = createPublishOrchestrator({
    repositories,
    pageBindingWriter: noopBindingWriter,
    pageShellService: pageShell,
  });
  return { orch, unpublishLive };
}

describe('orchestrator.archive', () => {
  it('atomically updates the master article, binding, and history with tenant-correct fields', async () => {
    const f = buildFixture();
    const orch = makeOrch(f.repositories);
    const result = await orch.archive({
      articleId: 'art-001',
      actorEmail: 'editor@example.com',
      note: 'Retiring the article.',
      now: () => NOW,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.previousState).toBe('published');
    expect(result.newState).toBe('archived');
    expect(result.bindingUpdated).toBe(true);

    const persistedArticle = f.articleUpsert.mock.calls[0]![0] as PublisherArticleRow;
    expect(persistedArticle.WorkflowState).toBe('archived');
    expect(persistedArticle.ArchiveDateUtc).toBe(NOW);
    expect(persistedArticle.UpdatedDateUtc).toBe(NOW);
    expect(persistedArticle.IncludeInDestinationLanding).toBe(false);
    expect(persistedArticle.IncludeInHomepageFeed).toBe(false);
    expect(persistedArticle.SuppressFromRollups).toBe(true);
    expect(persistedArticle.IncludeInArchive).toBe(true);

    const persistedBinding = f.bindingUpsert.mock.calls[0]![0] as PublisherPageBindingRow;
    expect(persistedBinding.PublishStatus).toBe('draft');
    expect(persistedBinding.SyncStatus).toBe('pending');
    expect(persistedBinding.LastSyncDateUtc).toBe(NOW);
    expect(persistedBinding.LastSyncMessage).toContain('archived');

    // Master page-sync metadata mirrors the demoted binding
    // (Phase-05 Prompt-03): PageSyncStatus flips to 'pending' and
    // LastPageSyncDateUtc uses the same `now` the binding write
    // records, so the two rows tell the same lifecycle story.
    expect(persistedArticle.PageSyncStatus).toBe('pending');
    expect(persistedArticle.LastPageSyncDateUtc).toBe(NOW);
    expect(persistedArticle.PageSyncStatus).toBe(persistedBinding.SyncStatus);
    expect(persistedArticle.LastPageSyncDateUtc).toBe(persistedBinding.LastSyncDateUtc);

    const persistedHistory = f.historyAppend.mock.calls[0]![0] as PublisherWorkflowHistoryRow;
    expect(persistedHistory.NewState).toBe('archived');
    expect(persistedHistory.PreviousState).toBe('published');
    expect(persistedHistory.ActorEmail).toBe('editor@example.com');
    expect(persistedHistory.ActionNote).toBe('Retiring the article.');
  });

  it('refuses an illegal transition (published → published) without mutating any list', async () => {
    const f = buildFixture({
      art: article({ WorkflowState: 'archived' }), // already archived; archived → archived not allowed
    });
    const orch = makeOrch(f.repositories);
    const result = await orch.archive({ articleId: 'art-001', now: () => NOW });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.stage).toBe('transition');
    expect(f.articleUpsert).not.toHaveBeenCalled();
    expect(f.bindingUpsert).not.toHaveBeenCalled();
    expect(f.historyAppend).not.toHaveBeenCalled();
  });

  it('skips binding mutation cleanly when no existing binding row exists', async () => {
    const f = buildFixture({ binding: null });
    const orch = makeOrch(f.repositories);
    const result = await orch.archive({
      articleId: 'art-001',
      now: () => NOW,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.bindingUpdated).toBe(false);
    expect(f.bindingUpsert).not.toHaveBeenCalled();
    // History still appended.
    expect(f.historyAppend).toHaveBeenCalledTimes(1);
  });

  it('returns articleUpdate failure and writes a publishing-error row when articles.upsert throws', async () => {
    const f = buildFixture({
      articleUpsertImpl: async () => {
        throw new Error('SP MERGE failed');
      },
    });
    const orch = makeOrch(f.repositories);
    const result = await orch.archive({ articleId: 'art-001', now: () => NOW });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.stage).toBe('articleUpdate');
    expect(f.bindingUpsert).not.toHaveBeenCalled();
    expect(f.historyAppend).not.toHaveBeenCalled();
    expect(f.errorAppend).toHaveBeenCalledTimes(1);
  });

  it('reverts the live destination page to draft via SavePageAsDraft and reports pageUnpublished=true', async () => {
    const f = buildFixture();
    const { orch, unpublishLive } = makeOrchWithUnpublish(
      f.repositories,
      async ({ pageId }) => ({ ok: true as const, pageId }),
    );
    const result = await orch.archive({ articleId: 'art-001', now: () => NOW });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.pageUnpublished).toBe(true);
    expect(unpublishLive).toHaveBeenCalledTimes(1);
    expect(unpublishLive).toHaveBeenCalledWith({
      pageId: '123',
      siteUrl:
        'https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight',
    });
    // Binding + history both proceed after a successful unpublish.
    expect(f.bindingUpsert).toHaveBeenCalledTimes(1);
    expect(f.historyAppend).toHaveBeenCalledTimes(1);
    const persistedBinding = f.bindingUpsert.mock.calls[0]![0] as PublisherPageBindingRow;
    expect(persistedBinding.LastSyncMessage).toContain('SavePageAsDraft');
  });

  it('skips page-unpublish and reports pageUnpublished=false when the article has no binding', async () => {
    const f = buildFixture({ binding: null });
    const { orch, unpublishLive } = makeOrchWithUnpublish(
      f.repositories,
      async ({ pageId }) => ({ ok: true as const, pageId }),
    );
    const result = await orch.archive({ articleId: 'art-001', now: () => NOW });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.pageUnpublished).toBe(false);
    expect(unpublishLive).not.toHaveBeenCalled();
  });

  it('fails at pageUnpublish stage when SavePageAsDraft fails; binding and history are not touched', async () => {
    const f = buildFixture();
    const { orch, unpublishLive } = makeOrchWithUnpublish(
      f.repositories,
      async () => ({
        ok: false as const,
        reason: 'unpublishLifecycleFailed' as const,
        message: 'Page SavePageAsDraft lifecycle failed (status 500).',
        status: 500,
      }),
    );
    const result = await orch.archive({ articleId: 'art-001', now: () => NOW });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.stage).toBe('pageUnpublish');
    expect(result.articleUpdated).toBe(true);
    expect(unpublishLive).toHaveBeenCalledTimes(1);
    expect(f.bindingUpsert).not.toHaveBeenCalled();
    expect(f.historyAppend).not.toHaveBeenCalled();
    expect(f.errorAppend).toHaveBeenCalledTimes(1);
  });

  it('returns bindingUpdate failure (article already updated, history not yet appended) when binding upsert throws', async () => {
    const f = buildFixture({
      bindingUpsertImpl: async () => {
        throw new Error('binding write failed');
      },
    });
    const orch = makeOrch(f.repositories);
    const result = await orch.archive({ articleId: 'art-001', now: () => NOW });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.stage).toBe('bindingUpdate');
    expect(result.articleUpdated).toBe(true);
    expect(f.articleUpsert).toHaveBeenCalledTimes(1);
    expect(f.historyAppend).not.toHaveBeenCalled();
    expect(f.errorAppend).toHaveBeenCalledTimes(1);
  });
});

describe('orchestrator.withdraw', () => {
  it('atomically updates the master article, binding, and history with the withdrawn state', async () => {
    const f = buildFixture();
    const orch = makeOrch(f.repositories);
    const result = await orch.withdraw({
      articleId: 'art-001',
      actorEmail: 'editor@example.com',
      now: () => NOW,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.newState).toBe('withdrawn');
    expect(result.bindingUpdated).toBe(true);

    const persistedArticle = f.articleUpsert.mock.calls[0]![0] as PublisherArticleRow;
    expect(persistedArticle.WorkflowState).toBe('withdrawn');
    expect(persistedArticle.IncludeInDestinationLanding).toBe(false);
    expect(persistedArticle.IncludeInHomepageFeed).toBe(false);
    expect(persistedArticle.SuppressFromRollups).toBe(true);
    // Withdraw does NOT stamp ArchiveDateUtc.
    expect(persistedArticle.ArchiveDateUtc).toBeUndefined();

    const persistedBinding = f.bindingUpsert.mock.calls[0]![0] as PublisherPageBindingRow;
    expect(persistedBinding.PublishStatus).toBe('draft');
    expect(persistedBinding.LastSyncMessage).toContain('withdrawn');

    // Master page-sync metadata mirrors the demoted binding
    // (Phase-05 Prompt-03) for withdraw as well as archive.
    expect(persistedArticle.PageSyncStatus).toBe('pending');
    expect(persistedArticle.LastPageSyncDateUtc).toBe(NOW);
    expect(persistedArticle.PageSyncStatus).toBe(persistedBinding.SyncStatus);
    expect(persistedArticle.LastPageSyncDateUtc).toBe(persistedBinding.LastSyncDateUtc);

    const persistedHistory = f.historyAppend.mock.calls[0]![0] as PublisherWorkflowHistoryRow;
    expect(persistedHistory.NewState).toBe('withdrawn');
    expect(persistedHistory.PreviousState).toBe('published');
  });

  it('returns historyAppend failure (article + binding already updated) when history append throws', async () => {
    const f = buildFixture({
      historyAppendImpl: async () => {
        throw new Error('history list down');
      },
    });
    const orch = makeOrch(f.repositories);
    const result = await orch.withdraw({ articleId: 'art-001', now: () => NOW });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.stage).toBe('historyAppend');
    expect(result.articleUpdated).toBe(true);
    expect(result.bindingUpdated).toBe(true);
    expect(f.errorAppend).toHaveBeenCalledTimes(1);
  });
});

describe('lifecycle error classification — persisted error rows tag the lifecycle action and stage', () => {
  it('archive failure at articleUpdate is tagged "archive.articleUpdate" with Operation=sync', async () => {
    const f = buildFixture({
      articleUpsertImpl: async () => {
        throw new Error('SP MERGE failed');
      },
    });
    const orch = makeOrch(f.repositories);
    await orch.archive({
      articleId: 'art-001',
      actorEmail: 'editor@example.com',
      now: () => NOW,
    });
    expect(f.errorAppend).toHaveBeenCalledTimes(1);
    const errorRow = f.errorAppend.mock.calls[0]![0] as {
      Title: string;
      Operation: string;
      ErrorSummary: string;
    };
    expect(errorRow.Title).toMatch(/^archive\.articleUpdate:/);
    expect(errorRow.Operation).toBe('sync');
    expect(errorRow.ErrorSummary).toContain('archived update failed');
  });

  it('archive failure at pageUnpublish is tagged "archive.pageUnpublish" with Operation=publish', async () => {
    const f = buildFixture();
    const { orch } = makeOrchWithUnpublish(
      f.repositories,
      async () => ({
        ok: false as const,
        reason: 'unpublishLifecycleFailed' as const,
        message: 'Page SavePageAsDraft lifecycle failed (status 500).',
        status: 500,
      }),
    );
    await orch.archive({ articleId: 'art-001', now: () => NOW });
    expect(f.errorAppend).toHaveBeenCalledTimes(1);
    const errorRow = f.errorAppend.mock.calls[0]![0] as {
      Title: string;
      Operation: string;
      ErrorSummary: string;
      BindingId?: string;
    };
    expect(errorRow.Title).toMatch(/^archive\.pageUnpublish:/);
    expect(errorRow.Operation).toBe('publish');
    expect(errorRow.ErrorSummary).toContain('SavePageAsDraft failed during archived');
    expect(errorRow.BindingId).toBe('bnd-existing');
  });

  it('withdraw failure at bindingUpdate is tagged "withdraw.bindingUpdate" with Operation=sync', async () => {
    const f = buildFixture({
      bindingUpsertImpl: async () => {
        throw new Error('binding write failed');
      },
    });
    const orch = makeOrch(f.repositories);
    await orch.withdraw({ articleId: 'art-001', now: () => NOW });
    expect(f.errorAppend).toHaveBeenCalledTimes(1);
    const errorRow = f.errorAppend.mock.calls[0]![0] as {
      Title: string;
      Operation: string;
    };
    expect(errorRow.Title).toMatch(/^withdraw\.bindingUpdate:/);
    expect(errorRow.Operation).toBe('sync');
  });

  it('withdraw failure at historyAppend is tagged "withdraw.historyAppend" with Operation=sync', async () => {
    const f = buildFixture({
      historyAppendImpl: async () => {
        throw new Error('history list down');
      },
    });
    const orch = makeOrch(f.repositories);
    await orch.withdraw({ articleId: 'art-001', now: () => NOW });
    expect(f.errorAppend).toHaveBeenCalledTimes(1);
    const errorRow = f.errorAppend.mock.calls[0]![0] as {
      Title: string;
      Operation: string;
    };
    expect(errorRow.Title).toMatch(/^withdraw\.historyAppend:/);
    expect(errorRow.Operation).toBe('sync');
  });
});
