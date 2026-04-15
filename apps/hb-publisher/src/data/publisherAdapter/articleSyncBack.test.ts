/**
 * Master `HB Articles` post-publish back-sync drift guard.
 *
 * Pins:
 *   - Successful create stamps PageId/PageName/PageUrl/
 *     PageTemplateKey/PageShellVersion/RenderVersion/PageSyncStatus/
 *     LastPageSyncDateUtc/PublishedDateUtc/UpdatedDateUtc back onto
 *     the master article.
 *   - Successful republish (inPlaceUpdate) preserves the original
 *     PublishedDateUtc.
 *   - Failed binding write does NOT call articles.upsert.
 *   - articles.upsert failure surfaces as `stage: 'articleSync'`
 *     and writes a tenant publishing-error row with
 *     `Operation: 'sync'`.
 */
import { describe, expect, it, vi } from 'vitest';
import { createPublishOrchestrator } from './publishOrchestrator';
import { createPageShellService } from './pageGeneration/pageShellService';
import type { PageBindingWriter } from './pageBindingWriter';
import type { PageCreationService } from './pageGeneration/pageCreationService';
import type {
  PublisherArticleRow,
  PublisherPageBindingRow,
  PublisherPublishingErrorRow,
  PublisherTemplateRegistryRow,
} from './publisherContracts';
import type { PublisherRepositories } from './publisherRepositories';

const NOW = '2026-04-13T10:00:00.000Z';
const PUBLISHED_AT = '2026-04-13T10:00:00.500Z';

function article(over: Partial<PublisherArticleRow> = {}): PublisherArticleRow {
  return {
    ArticleId: 'art-001',
    Title: 'Article one',
    ArticleContentType: 'monthlySpotlight',
    Destination: 'projectSpotlight',
    Slug: 'article-one',
    TemplateKey: 'tmpl-v1',
    WorkflowState: 'approved',
    Subhead: 'sub',
    SummaryExcerpt: 'sum',
    BodyRichText: '<p>body</p>',
    HeroPrimaryImage: 'https://img.example/h.jpg',
    HeroPrimaryImageAltText: 'alt',
    CreatedDateUtc: '2026-04-01T00:00:00Z',
    UpdatedDateUtc: '2026-04-10T00:00:00Z',
    TargetSiteUrl:
      'https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight',
    ...over,
  };
}

function template(): PublisherTemplateRegistryRow {
  return {
    TemplateKey: 'tmpl-v1',
    TemplateName: 'tmpl',
    IsActive: true,
    TemplatePriority: 100,
    VersionLabel: '1.0.0',
    ContentTypes: ['monthlySpotlight'],
    Destination: 'projectSpotlight',
    PageShellTemplateKey: 'ps-shell-v1',
    HeroProfileKey: 'hbSignatureHero',
    BodyProfileKey: 'oobText',
    TeamViewerProfileKey: 'teamViewer',
    GalleryProfileKey: 'oobImageGallery',
    ShowHero: true,
    ShowBody: true,
    ShowTeamViewer: true,
    ShowGallery: true,
    ShowSecondaryImage: false,
    RequiredFieldSetKey: 'req-default',
  };
}

function buildRepositories(
  art: PublisherArticleRow,
  upsertImpl: (row: PublisherArticleRow) => Promise<{ wasCreated: boolean; itemId: number }> = async () => ({
    wasCreated: false,
    itemId: 1,
  }),
): {
  repositories: PublisherRepositories;
  articleUpsert: ReturnType<typeof vi.fn>;
  errorAppend: ReturnType<typeof vi.fn>;
} {
  const articleUpsert = vi.fn(upsertImpl);
  const errorAppend = vi.fn(async () => ({ itemId: 99 }));
  const repositories: PublisherRepositories = {
    articles: {
      getByArticleId: vi.fn(async () => art),
      listByWorkflowState: vi.fn(async () => []),
      upsert: articleUpsert,
    },
    teamMembers: {
      listByArticle: vi.fn(async () => [
        {
          ArticleId: art.ArticleId,
          TeamMemberId: 'tm-1',
          Title: 'A',
          PersonPrincipal: 'a@example.com',
          DisplayName: 'A',
        },
      ]),
      replaceAllForArticle: vi.fn(async () => ({ deleted: 0, written: 0 })),
    },
    media: {
      listByArticle: vi.fn(async () => [
        {
          ArticleId: art.ArticleId,
          MediaId: 'm-1',
          Title: 'g',
          MediaRole: 'gallery' as const,
          ImageAsset: 'https://img.example/g.jpg',
          AltText: 'g',
        },
      ]),
      replaceAllForArticle: vi.fn(async () => ({ deleted: 0, written: 0 })),
    },
    templateRegistry: {
      listActive: vi.fn(async () => [template()]),
      getByKey: vi.fn(async () => template()),
    },
    pageBindings: {
      getByArticleId: vi.fn(async () => undefined),
      upsert: vi.fn(async () => ({
        bindingId: 'bnd-x',
        wasCreated: true,
        itemId: 1,
      })),
    },
    workflowHistory: {
      listByArticle: vi.fn(async () => []),
      append: vi.fn(async () => ({ itemId: 1 })),
    },
    publishingErrors: {
      listByArticle: vi.fn(async () => []),
      append: errorAppend,
    },
    promotionRules: {
      listActive: vi.fn(async () => []),
    },
  };
  return { repositories, articleUpsert, errorAppend };
}

const successfulPageCreation: PageCreationService = {
  createOrUpdate: vi.fn(async () => ({
    ok: true as const,
    pageId: '123',
    pageUrl:
      'https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight/SitePages/article-one.aspx',
    pageName: 'article-one.aspx',
    wasCreated: true,
  })),
  publishLive: vi.fn(async ({ pageId }) => ({
    ok: true as const,
    pageId,
    publishedAtUtc: PUBLISHED_AT,
  })),
  unpublishLive: vi.fn(async ({ pageId }) => ({
    ok: true as const,
    pageId,
  })),
};

const successfulBindingWriter: PageBindingWriter = {
  upsert: vi.fn(async () => ({
    ok: true as const,
    bindingId: 'bnd-x',
    wasCreated: true,
    itemId: 1,
  })),
};

describe('publishOrchestrator — HB Articles back-sync', () => {
  it('on successful create, upserts the master article with destination metadata', async () => {
    const art = article();
    const { repositories, articleUpsert } = buildRepositories(art);
    const orch = createPublishOrchestrator({
      repositories,
      pageBindingWriter: successfulBindingWriter,
      pageShellService: createPageShellService({
        pageCreation: successfulPageCreation,
      }),
    });
    const result = await orch.run({
      articleId: art.ArticleId,
      mode: 'create',
      now: () => NOW,
      validateBeforePublish: false,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(articleUpsert).toHaveBeenCalledTimes(1);
    const persisted = articleUpsert.mock.calls[0]![0] as PublisherArticleRow;
    expect(persisted.ArticleId).toBe(art.ArticleId);
    expect(persisted.PageId).toBe('123');
    expect(persisted.PageName).toBe('article-one.aspx');
    expect(persisted.PageUrl).toContain('article-one.aspx');
    expect(persisted.PageTemplateKey).toBe('tmpl-v1');
    // PageShellVersion mirrors the composed shell manifest's version;
    // RenderVersion mirrors the resolved template's VersionLabel.
    expect(persisted.PageShellVersion).toBeDefined();
    expect(persisted.RenderVersion).toBe('1.0.0');
    expect(persisted.PageSyncStatus).toBe('in-sync');
    expect(persisted.LastPageSyncDateUtc).toBe(NOW);
    expect(persisted.UpdatedDateUtc).toBe(NOW);
    expect(persisted.PublishedDateUtc).toBe(PUBLISHED_AT);
    expect(persisted.WorkflowState).toBe('published');
  });

  it('on inPlaceUpdate (republish), preserves the original PublishedDateUtc', async () => {
    const originalPublishedAt = '2026-04-01T00:00:00Z';
    const art = article({
      WorkflowState: 'published',
      PublishedDateUtc: originalPublishedAt,
    });
    const existingBinding: PublisherPageBindingRow = {
      BindingId: 'bnd-existing',
      ArticleId: art.ArticleId,
      Title: art.Title,
      TargetSiteUrl: art.TargetSiteUrl ?? '',
      PageTemplateKey: 'tmpl-v1',
      PublishStatus: 'published',
      PageId: '123',
      PageName: 'article-one.aspx',
      PageShellVersion: 'ps-shell-v1',
      RenderVersion: '1.0.0',
    };
    const { repositories, articleUpsert } = buildRepositories(art);
    repositories.pageBindings.getByArticleId = vi.fn(async () => existingBinding);
    const orch = createPublishOrchestrator({
      repositories,
      pageBindingWriter: successfulBindingWriter,
      pageShellService: createPageShellService({
        pageCreation: successfulPageCreation,
      }),
    });
    const result = await orch.run({
      articleId: art.ArticleId,
      mode: 'republish',
      now: () => NOW,
      validateBeforePublish: false,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.action).toBe('inPlaceUpdate');
    const persisted = articleUpsert.mock.calls[0]![0] as PublisherArticleRow;
    expect(persisted.PublishedDateUtc).toBe(originalPublishedAt);
    expect(persisted.LastPageSyncDateUtc).toBe(NOW);
    expect(persisted.UpdatedDateUtc).toBe(NOW);
  });

  it('does NOT call articles.upsert when the binding write fails', async () => {
    const art = article();
    const { repositories, articleUpsert } = buildRepositories(art);
    const failingBinding: PageBindingWriter = {
      upsert: vi.fn(async () => ({
        ok: false as const,
        reason: 'writeFailed' as const,
        message: 'binding write failed',
        status: 500,
      })),
    };
    const orch = createPublishOrchestrator({
      repositories,
      pageBindingWriter: failingBinding,
      pageShellService: createPageShellService({
        pageCreation: successfulPageCreation,
      }),
    });
    const result = await orch.run({
      articleId: art.ArticleId,
      mode: 'create',
      now: () => NOW,
      validateBeforePublish: false,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.stage).toBe('bindingWrite');
    expect(result.rollback).toEqual({
      attempted: true,
      succeeded: true,
      message:
        'Compensating SavePageAsDraft succeeded after bindingWrite (pageId=123).',
    });
    expect(successfulPageCreation.unpublishLive).toHaveBeenCalled();
    expect(articleUpsert).not.toHaveBeenCalled();
  });

  it('does NOT call articles.upsert when the page publish lifecycle fails', async () => {
    const art = article();
    const { repositories, articleUpsert } = buildRepositories(art);
    const failingPageCreation: PageCreationService = {
      createOrUpdate: vi.fn(async () => ({
        ok: true as const,
        pageId: '123',
        pageUrl: 'https://example.com/SitePages/article-one.aspx',
        pageName: 'article-one.aspx',
        wasCreated: true,
      })),
      publishLive: vi.fn(async () => ({
        ok: false as const,
        reason: 'publishLifecycleFailed' as const,
        message: 'Publish failed (status 500).',
        status: 500,
      })),
      unpublishLive: vi.fn(async ({ pageId }) => ({
        ok: true as const,
        pageId,
      })),
    };
    const orch = createPublishOrchestrator({
      repositories,
      pageBindingWriter: successfulBindingWriter,
      pageShellService: createPageShellService({
        pageCreation: failingPageCreation,
      }),
    });
    const result = await orch.run({
      articleId: art.ArticleId,
      mode: 'create',
      now: () => NOW,
      validateBeforePublish: false,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.stage).toBe('pagePublish');
    expect(articleUpsert).not.toHaveBeenCalled();
  });

  it('returns articleSync stage and writes a tenant publishing-error row when articles.upsert fails', async () => {
    const art = article();
    const { repositories, articleUpsert, errorAppend } = buildRepositories(
      art,
      async () => {
        throw new Error('SharePoint MERGE failed (status 500)');
      },
    );
    const orch = createPublishOrchestrator({
      repositories,
      pageBindingWriter: successfulBindingWriter,
      pageShellService: createPageShellService({
        pageCreation: successfulPageCreation,
      }),
    });
    const result = await orch.run({
      articleId: art.ArticleId,
      mode: 'create',
      now: () => NOW,
      validateBeforePublish: false,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.stage).toBe('articleSync');
    expect(result.rollback).toEqual({
      attempted: true,
      succeeded: true,
      message:
        'Compensating SavePageAsDraft succeeded after articleSync (pageId=123).',
    });
    expect(articleUpsert).toHaveBeenCalledTimes(1);
    expect(successfulPageCreation.unpublishLive).toHaveBeenCalled();
    expect(errorAppend).toHaveBeenCalledTimes(1);
    const errorRow = errorAppend.mock.calls[0]![0] as PublisherPublishingErrorRow;
    expect(errorRow.Operation).toBe('sync');
    expect(errorRow.ArticleId).toBe(art.ArticleId);
    expect(errorRow.ErrorSummary).toContain('back-sync failed');
  });
});
