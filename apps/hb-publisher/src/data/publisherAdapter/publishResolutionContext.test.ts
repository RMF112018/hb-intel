import { describe, expect, it, vi } from 'vitest';
import { buildPublishResolutionContext } from './publishResolutionContext';
import type {
  PublisherArticleRow,
  PublisherTemplateRegistryRow,
} from './publisherContracts';
import type { PublisherRepositories } from './publisherRepositories';

function article(over: Partial<PublisherArticleRow> = {}): PublisherArticleRow {
  return {
    ArticleId: 'art-1',
    Title: 'Title',
    ArticleContentType: 'monthlySpotlight',
    Destination: 'projectSpotlight',
    Slug: 'title',
    TemplateKey: 'stale-template-key',
    WorkflowState: 'approved',
    Subhead: 'sub',
    SummaryExcerpt: 'summary',
    BodyRichText: '<p>body</p>',
    HeroPrimaryImage: 'https://img.example/hero.jpg',
    HeroPrimaryImageAltText: 'alt',
    CreatedDateUtc: '2026-04-01T00:00:00Z',
    UpdatedDateUtc: '2026-04-01T00:00:00Z',
    ...over,
  };
}

function template(over: Partial<PublisherTemplateRegistryRow> & { TemplateKey: string }): PublisherTemplateRegistryRow {
  return {
    TemplateKey: over.TemplateKey,
    TemplateName: over.TemplateKey,
    IsActive: over.IsActive ?? true,
    TemplatePriority: over.TemplatePriority ?? 100,
    VersionLabel: over.VersionLabel ?? '1.0.0',
    ContentTypes: over.ContentTypes ?? ['monthlySpotlight'],
    Destination: over.Destination ?? 'projectSpotlight',
    PageShellTemplateKey: over.PageShellTemplateKey ?? 'ps-shell-v1',
    HeroProfileKey: over.HeroProfileKey ?? 'hbSignatureHero',
    BodyProfileKey: over.BodyProfileKey ?? 'oobText',
    TeamViewerProfileKey: over.TeamViewerProfileKey ?? 'teamViewer',
    GalleryProfileKey: over.GalleryProfileKey ?? 'oobImageGallery',
    ShowHero: over.ShowHero ?? true,
    ShowBody: over.ShowBody ?? true,
    ShowTeamViewer: over.ShowTeamViewer ?? true,
    ShowGallery: over.ShowGallery ?? true,
    ShowSecondaryImage: over.ShowSecondaryImage ?? false,
    RequiredFieldSetKey: over.RequiredFieldSetKey ?? 'req-default',
  };
}

function repos(input: {
  article?: PublisherArticleRow;
  templates?: readonly PublisherTemplateRegistryRow[];
} = {}): PublisherRepositories {
  return {
    articles: {
      getByArticleId: vi.fn(async () => input.article ?? article()),
      listByWorkflowState: vi.fn(async () => []),
      upsert: vi.fn(async () => ({ wasCreated: false, itemId: 1 })),
    },
    teamMembers: {
      listByArticle: vi.fn(async () => []),
      replaceAllForArticle: vi.fn(async () => ({ created: 0, updated: 0, deleted: 0, written: 0 })),
    },
    media: {
      listByArticle: vi.fn(async () => []),
      replaceAllForArticle: vi.fn(async () => ({ created: 0, updated: 0, deleted: 0, written: 0 })),
    },
    templateRegistry: {
      listActive: vi.fn(async () =>
        input.templates ??
        [
          template({ TemplateKey: 'monthly-template', ContentTypes: ['monthlySpotlight'] }),
          template({ TemplateKey: 'stale-template-key', ContentTypes: ['newsUpdate'] }),
        ],
      ),
      getByKey: vi.fn(async () => undefined),
    },
    pageBindings: {
      getByArticleId: vi.fn(async () => undefined),
      upsert: vi.fn(async () => ({ bindingId: 'bnd-1', wasCreated: true, itemId: 1 })),
    },
    workflowHistory: {
      listByArticle: vi.fn(async () => []),
      append: vi.fn(async () => ({ itemId: 1 })),
    },
    publishingErrors: {
      listByArticle: vi.fn(async () => []),
      append: vi.fn(async () => ({ itemId: 1 })),
    },
    promotionRules: {
      listActive: vi.fn(async () => []),
    },
  };
}

describe('buildPublishResolutionContext', () => {
  it('ignores stale article TemplateKey and resolves from current discriminators', async () => {
    const result = await buildPublishResolutionContext(repos(), 'art-1');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.context.template.TemplateKey).toBe('monthly-template');
    expect(result.context.decisionTrace.selectionRule).not.toBe('adminOverride');
  });

  it('returns repositoryReadFailed when the articles seam throws', async () => {
    const r = repos();
    r.articles.getByArticleId = vi.fn(async () => {
      throw new Error('sp 500');
    });
    const result = await buildPublishResolutionContext(r, 'art-1');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('repositoryReadFailed');
    if (result.reason !== 'repositoryReadFailed') return;
    expect(result.failedRead).toBe('articles');
    expect(result.message).toContain('articles');
    expect(result.message).toContain('sp 500');
  });

  it('returns repositoryReadFailed when the templateRegistry seam throws', async () => {
    const r = repos();
    r.templateRegistry.listActive = vi.fn(async () => {
      throw new Error('reg down');
    });
    const result = await buildPublishResolutionContext(r, 'art-1');
    expect(result.ok).toBe(false);
    if (result.ok || result.reason !== 'repositoryReadFailed') return;
    expect(result.failedRead).toBe('templateRegistry');
  });

  it('returns repositoryReadFailed when the teamMembers seam throws', async () => {
    const r = repos();
    r.teamMembers.listByArticle = vi.fn(async () => {
      throw new Error('team down');
    });
    const result = await buildPublishResolutionContext(r, 'art-1');
    expect(result.ok).toBe(false);
    if (result.ok || result.reason !== 'repositoryReadFailed') return;
    expect(result.failedRead).toBe('teamMembers');
  });

  it('returns repositoryReadFailed when the media seam throws', async () => {
    const r = repos();
    r.media.listByArticle = vi.fn(async () => {
      throw new Error('media down');
    });
    const result = await buildPublishResolutionContext(r, 'art-1');
    expect(result.ok).toBe(false);
    if (result.ok || result.reason !== 'repositoryReadFailed') return;
    expect(result.failedRead).toBe('media');
  });

  it('returns repositoryReadFailed when the pageBindings seam throws', async () => {
    const r = repos();
    r.pageBindings.getByArticleId = vi.fn(async () => {
      throw new Error('bindings down');
    });
    const result = await buildPublishResolutionContext(r, 'art-1');
    expect(result.ok).toBe(false);
    if (result.ok || result.reason !== 'repositoryReadFailed') return;
    expect(result.failedRead).toBe('pageBindings');
  });

  it('returns templateResolutionFailed when no active template matches discriminators', async () => {
    const result = await buildPublishResolutionContext(
      repos({
        templates: [
          template({ TemplateKey: 'news-only', ContentTypes: ['newsUpdate'] }),
        ],
      }),
      'art-1',
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('templateResolutionFailed');
  });
});
