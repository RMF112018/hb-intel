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
 * never mutates any list; page-unpublish/binding/history failures
 * do not silently stamp the final article state.
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
  articleUpsertImpl?: (row: PublisherArticleRow) => Promise<{ wasCreated: boolean; itemId: number }>;
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
    expect(result.pageUnpublished).toBe(true);
    expect(result.historyAppended).toBe(true);

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

  it('returns articleUpdate failure BEFORE history is appended when articles.upsert throws (phase-09 prompt-04 ordering)', async () => {
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
    expect(result.articleUpdated).toBe(false);
    expect(result.bindingUpdated).toBe(true);
    expect(result.pageUnpublished).toBe(true);
    // Phase-09 Prompt-04: master-state closure precedes history append,
    // so a failed articleUpdate cannot leave a false-forward "previous
    // → target" workflow-history row behind.
    expect(result.historyAppended).toBe(false);
    expect(f.bindingUpsert).toHaveBeenCalledTimes(1);
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
    expect(result.articleUpdated).toBe(false);
    expect(result.bindingUpdated).toBe(false);
    expect(result.pageUnpublished).toBe(false);
    expect(result.historyAppended).toBe(false);
    expect(unpublishLive).toHaveBeenCalledTimes(1);
    expect(f.bindingUpsert).not.toHaveBeenCalled();
    expect(f.historyAppend).not.toHaveBeenCalled();
    expect(f.articleUpsert).not.toHaveBeenCalled();
    expect(f.errorAppend).toHaveBeenCalledTimes(1);
  });

  it('returns bindingUpdate failure and still reconciles the master to the lifecycle target so master matches the demoted page (phase-10 prompt-03)', async () => {
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
    // Page was demoted, binding update failed. Master is reconciled to
    // target so master matches the now-draft page; binding remains
    // stale and is surfaced via the bindingUpdate error row.
    expect(result.articleUpdated).toBe(true);
    expect(result.bindingUpdated).toBe(false);
    expect(result.pageUnpublished).toBe(true);
    expect(result.historyAppended).toBe(false);
    expect(f.articleUpsert).toHaveBeenCalledTimes(1);
    const reconciled = f.articleUpsert.mock.calls[0]![0] as PublisherArticleRow;
    expect(reconciled.WorkflowState).toBe('archived');
    expect(reconciled.PageSyncStatus).toBe('error');
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
    expect(result.pageUnpublished).toBe(true);
    expect(result.historyAppended).toBe(true);

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

  it('returns historyAppend failure and leaves the non-live master/binding/page in place — no false-live revert (phase-10 prompt-03)', async () => {
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
    // Fail-truthful non-live: page demoted, binding at draft/pending,
    // master stays at the lifecycle target. We do NOT revert the
    // master to 'published' because that would contradict the
    // now-draft page. History append failure is an audit/logging
    // failure on top of a truthful non-live lifecycle state.
    expect(result.articleUpdated).toBe(true);
    expect(result.bindingUpdated).toBe(true);
    expect(result.pageUnpublished).toBe(true);
    expect(result.historyAppended).toBe(false);
    expect(result.rollback).toBeUndefined();
    // Only the forward master stamp — no revert write.
    expect(f.articleUpsert).toHaveBeenCalledTimes(1);
    const forward = f.articleUpsert.mock.calls[0]![0] as PublisherArticleRow;
    expect(forward.WorkflowState).toBe('withdrawn');
    expect(f.errorAppend).toHaveBeenCalledTimes(1);
    const errRow = f.errorAppend.mock.calls[0]![0];
    expect(errRow.Title).toMatch(/^withdraw\.historyAppend:/);
  });
});

describe('orchestrator.transitionManual', () => {
  it('updates article state and appends workflow history on success', async () => {
    const f = buildFixture({
      art: article({ WorkflowState: 'draft' }),
      binding: null,
    });
    const orch = makeOrch(f.repositories);
    const result = await orch.transitionManual({
      articleId: 'art-001',
      to: 'review',
      actorEmail: 'editor@example.com',
      now: () => NOW,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.previousState).toBe('draft');
    expect(result.newState).toBe('review');
    expect(result.articleUpdated).toBe(true);
    expect(result.historyAppended).toBe(true);

    expect(f.articleUpsert).toHaveBeenCalledTimes(1);
    const persistedArticle = f.articleUpsert.mock.calls[0]![0] as PublisherArticleRow;
    expect(persistedArticle.WorkflowState).toBe('review');
    expect(f.historyAppend).toHaveBeenCalledTimes(1);
    const persistedHistory = f.historyAppend.mock.calls[0]![0] as PublisherWorkflowHistoryRow;
    expect(persistedHistory.PreviousState).toBe('draft');
    expect(persistedHistory.NewState).toBe('review');
    expect(persistedHistory.ActorEmail).toBe('editor@example.com');
  });

  it('rolls article state back when history append fails', async () => {
    const f = buildFixture({
      art: article({ WorkflowState: 'draft' }),
      binding: null,
      historyAppendImpl: async () => {
        throw new Error('history list down');
      },
    });
    const orch = makeOrch(f.repositories);
    const result = await orch.transitionManual({
      articleId: 'art-001',
      to: 'review',
      actorEmail: 'editor@example.com',
      now: () => NOW,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.stage).toBe('historyAppend');
    expect(result.articleUpdated).toBe(false);
    expect(result.historyAppended).toBe(false);
    expect(result.rollback).toEqual({
      attempted: true,
      succeeded: true,
      message: 'Article state rollback succeeded (review -> draft).',
    });

    expect(f.articleUpsert).toHaveBeenCalledTimes(2);
    const first = f.articleUpsert.mock.calls[0]![0] as PublisherArticleRow;
    const rollback = f.articleUpsert.mock.calls[1]![0] as PublisherArticleRow;
    expect(first.WorkflowState).toBe('review');
    expect(rollback.WorkflowState).toBe('draft');
    expect(f.errorAppend).toHaveBeenCalledTimes(1);
  });

  it('surfaces rollback failure when history append fails and state cannot be reverted', async () => {
    let writes = 0;
    const f = buildFixture({
      art: article({ WorkflowState: 'draft' }),
      binding: null,
      articleUpsertImpl: async () => {
        writes += 1;
        if (writes === 1) return { wasCreated: false, itemId: 1 };
        throw new Error('rollback MERGE failed');
      },
      historyAppendImpl: async () => {
        throw new Error('history list down');
      },
    });
    const orch = makeOrch(f.repositories);
    const result = await orch.transitionManual({
      articleId: 'art-001',
      to: 'review',
      actorEmail: 'editor@example.com',
      now: () => NOW,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.stage).toBe('historyAppend');
    expect(result.articleUpdated).toBe(true);
    expect(result.historyAppended).toBe(false);
    expect(result.rollback).toEqual({
      attempted: true,
      succeeded: false,
      message: 'Article rollback after history failure failed: rollback MERGE failed',
    });
    expect(f.errorAppend).toHaveBeenCalledTimes(2);
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

// Phase-09 Prompt-03: archive/withdraw must fail closed when the
// binding lookup throws. The previous `.catch(() => undefined)`
// swallowed a failed read and let the lifecycle proceed as if no
// binding existed, silently skipping page-unpublish.
describe('lifecycle binding-lookup fail-closed (phase-09 prompt-03)', () => {
  it('archive fails with stage=bindingLookup when pageBindings.getByArticleId throws', async () => {
    const f = buildFixture();
    (f.repositories.pageBindings.getByArticleId as ReturnType<typeof vi.fn>).mockImplementation(
      async () => {
        throw new Error('SharePoint 503');
      },
    );
    const unpublishLive = vi.fn(async ({ pageId }: { pageId: string }) => ({
      ok: true as const,
      pageId,
    }));
    const pageShell = createPageShellService({
      pageCreation: {
        createOrUpdate: vi.fn(async () => ({
          ok: true as const,
          pageId: 'unused',
          pageUrl: 'unused',
          pageName: 'unused',
          wasCreated: false,
        })),
        publishLive: vi.fn(async ({ pageId }) => ({ ok: true as const, pageId })),
        unpublishLive,
      } satisfies PageCreationService,
    });
    const orch = createPublishOrchestrator({
      repositories: f.repositories,
      pageBindingWriter: noopBindingWriter,
      pageShellService: pageShell,
    });
    const outcome = await orch.archive({ articleId: 'art-001', now: () => NOW });
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.stage).toBe('bindingLookup');
    expect(outcome.message).toContain('Binding lookup failed during archived');
    expect(outcome.previousState).toBe('published');
    expect(outcome.articleUpdated).toBe(false);
    expect(outcome.bindingUpdated).toBe(false);
    expect(outcome.pageUnpublished).toBe(false);
    expect(outcome.historyAppended).toBe(false);
    // Page demotion must NOT be attempted when the binding lookup failed.
    expect(unpublishLive).not.toHaveBeenCalled();
    // Master article must NOT be stamped to archived.
    expect(f.articleUpsert).not.toHaveBeenCalled();
    expect(f.historyAppend).not.toHaveBeenCalled();
    // A publishing-errors row is recorded with Operation=sync.
    expect(f.errorAppend).toHaveBeenCalledTimes(1);
    const errorRow = f.errorAppend.mock.calls[0]![0] as {
      Title: string;
      Operation: string;
    };
    expect(errorRow.Title).toMatch(/^archive\.bindingLookup:/);
    expect(errorRow.Operation).toBe('sync');
  });

  it('withdraw fails with stage=bindingLookup when pageBindings.getByArticleId throws', async () => {
    const f = buildFixture();
    (f.repositories.pageBindings.getByArticleId as ReturnType<typeof vi.fn>).mockImplementation(
      async () => {
        throw new Error('transient network error');
      },
    );
    const orch = makeOrch(f.repositories);
    const outcome = await orch.withdraw({ articleId: 'art-001', now: () => NOW });
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.stage).toBe('bindingLookup');
    expect(outcome.message).toContain('Binding lookup failed during withdrawn');
    expect(f.articleUpsert).not.toHaveBeenCalled();
    expect(f.historyAppend).not.toHaveBeenCalled();
    expect(f.errorAppend).toHaveBeenCalledTimes(1);
    const errorRow = f.errorAppend.mock.calls[0]![0] as {
      Title: string;
      Operation: string;
    };
    expect(errorRow.Title).toMatch(/^withdraw\.bindingLookup:/);
  });

  it('archive proceeds as "no binding" when getByArticleId returns undefined cleanly (positive absence)', async () => {
    const f = buildFixture({ binding: null });
    const orch = makeOrch(f.repositories);
    const outcome = await orch.archive({ articleId: 'art-001', now: () => NOW });
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.pageUnpublished).toBe(false);
    expect(outcome.bindingUpdated).toBe(false);
    expect(outcome.articleUpdated).toBe(true);
    expect(outcome.historyAppended).toBe(true);
  });
});

describe('lifecycle fail-truthful non-live matrix (phase-10 prompt-03)', () => {
  it('archive + historyAppend failure: no master revert, all four surfaces non-live, history not fabricated', async () => {
    const f = buildFixture({
      historyAppendImpl: async () => {
        throw new Error('history list down');
      },
    });
    const orch = makeOrch(f.repositories);
    const result = await orch.archive({ articleId: 'art-001', now: () => NOW });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.stage).toBe('historyAppend');
    expect(result.pageUnpublished).toBe(true);
    expect(result.bindingUpdated).toBe(true);
    expect(result.articleUpdated).toBe(true);
    expect(result.historyAppended).toBe(false);
    expect(result.rollback).toBeUndefined();
    expect(f.articleUpsert).toHaveBeenCalledTimes(1);
    expect((f.articleUpsert.mock.calls[0]![0] as PublisherArticleRow).WorkflowState).toBe('archived');
    const errRow = f.errorAppend.mock.calls[0]![0];
    expect(errRow.Title).toMatch(/^archive\.historyAppend:/);
    expect(errRow.ErrorSummary).toContain('non-live lifecycle state');
  });

  it('withdraw + pageUnpublish failure: nothing else mutated; page still live error-tagged', async () => {
    const f = buildFixture();
    const { orch, unpublishLive } = makeOrchWithUnpublish(
      f.repositories,
      async () => ({ ok: false as const, reason: 'unpublishLifecycleFailed' as const, message: 'SP 500' }),
    );
    const result = await orch.withdraw({ articleId: 'art-001', now: () => NOW });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.stage).toBe('pageUnpublish');
    expect(result.pageUnpublished).toBe(false);
    expect(result.bindingUpdated).toBe(false);
    expect(result.articleUpdated).toBe(false);
    expect(result.historyAppended).toBe(false);
    expect(unpublishLive).toHaveBeenCalledTimes(1);
    expect(f.bindingUpsert).not.toHaveBeenCalled();
    expect(f.articleUpsert).not.toHaveBeenCalled();
    expect(f.historyAppend).not.toHaveBeenCalled();
    const errRow = f.errorAppend.mock.calls[0]![0];
    expect(errRow.Title).toMatch(/^withdraw\.pageUnpublish:/);
  });

  it('withdraw + bindingUpdate failure: master reconciled to withdrawn with PageSyncStatus=error', async () => {
    const f = buildFixture({
      bindingUpsertImpl: async () => {
        throw new Error('binding write failed');
      },
    });
    const orch = makeOrch(f.repositories);
    const result = await orch.withdraw({ articleId: 'art-001', now: () => NOW });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.stage).toBe('bindingUpdate');
    expect(result.pageUnpublished).toBe(true);
    expect(result.bindingUpdated).toBe(false);
    expect(result.articleUpdated).toBe(true);
    expect(result.historyAppended).toBe(false);
    expect(f.articleUpsert).toHaveBeenCalledTimes(1);
    const reconciled = f.articleUpsert.mock.calls[0]![0] as PublisherArticleRow;
    expect(reconciled.WorkflowState).toBe('withdrawn');
    expect(reconciled.PageSyncStatus).toBe('error');
    expect(f.historyAppend).not.toHaveBeenCalled();
  });

  it('withdraw + articleUpdate failure: page demoted, binding updated, master left at previous state with typed failure surfacing', async () => {
    const f = buildFixture({
      articleUpsertImpl: async () => {
        throw new Error('SP MERGE failed');
      },
    });
    const orch = makeOrch(f.repositories);
    const result = await orch.withdraw({ articleId: 'art-001', now: () => NOW });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.stage).toBe('articleUpdate');
    expect(result.pageUnpublished).toBe(true);
    expect(result.bindingUpdated).toBe(true);
    expect(result.articleUpdated).toBe(false);
    expect(result.historyAppended).toBe(false);
    expect(f.historyAppend).not.toHaveBeenCalled();
    const errRow = f.errorAppend.mock.calls[0]![0];
    expect(errRow.Title).toMatch(/^withdraw\.articleUpdate:/);
  });
});
