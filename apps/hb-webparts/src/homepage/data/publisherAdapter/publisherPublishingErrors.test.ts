/**
 * Tenant `HB Article Publishing Errors` round-trip drift guard +
 * orchestrator failure-path persistence proof.
 *
 * Verifies (a) the publishing-errors append path is implemented
 * (no longer throws PublisherWriteNotImplementedError) and writes
 * a tenant-shaped row, and (b) the orchestrator records an error
 * row when a publish failure occurs at the bindingWrite stage.
 */
import { describe, expect, it, vi } from 'vitest';
import { mapPublishingErrorRow } from './publisherRowMappers';
import { mapPublishingErrorRowToListFields } from './publisherWriters';
import type {
  PublisherArticleRow,
  PublisherPageBindingRow,
  PublisherPublishingErrorRow,
  PublisherTemplateRegistryRow,
} from './publisherContracts';
import type { PublisherRepositories } from './publisherRepositories';
import type { PageBindingWriter } from './pageBindingWriter';
import type { PageCreationService } from './pageGeneration/pageCreationService';
import { createPageShellService } from './pageGeneration/pageShellService';
import { createPublishOrchestrator } from './publishOrchestrator';

const TENANT_RAW_ERROR: Record<string, unknown> = {
  ErrorId: 'err-001',
  ArticleId: 'art-2026-042',
  Title: 'bindingWrite: Acme Tower — April',
  Destination: 'projectSpotlight',
  Operation: 'sync',
  ErrorSummary: 'Binding MERGE failed (status 500).',
  BindingId: 'bnd-existing',
  LastAttemptDateUtc: '2026-04-12T10:00:00Z',
  RetryStatus: 'pending',
};

describe('HB Article Publishing Errors — tenant round-trip', () => {
  it('mapPublishingErrorRow accepts every tenant-required column', () => {
    const row = mapPublishingErrorRow(TENANT_RAW_ERROR);
    expect(row).toBeDefined();
    expect(row!.ErrorId).toBe('err-001');
    expect(row!.ArticleId).toBe('art-2026-042');
    expect(row!.Title).toBe('bindingWrite: Acme Tower — April');
    expect(row!.Destination).toBe('projectSpotlight');
    expect(row!.Operation).toBe('sync');
    expect(row!.ErrorSummary).toBe('Binding MERGE failed (status 500).');
    expect(row!.RetryStatus).toBe('pending');
  });

  it('mapPublishingErrorRow rejects rows missing tenant-required columns', () => {
    for (const required of [
      'ErrorId',
      'ArticleId',
      'Title',
      'Destination',
      'Operation',
      'ErrorSummary',
    ] as const) {
      const incomplete = { ...TENANT_RAW_ERROR };
      delete (incomplete as Record<string, unknown>)[required];
      expect(mapPublishingErrorRow(incomplete)).toBeUndefined();
    }
  });

  it('mapPublishingErrorRow rejects legacy OccurredDateUtc / ErrorCategory shape', () => {
    const legacy = {
      ErrorId: 'err-001',
      ArticleId: 'art-2026-042',
      Operation: 'publish',
      OccurredDateUtc: '2026-04-12T00:00:00Z',
      ErrorCategory: 'pageGeneration',
      ErrorSummary: 'boom',
    };
    expect(mapPublishingErrorRow(legacy)).toBeUndefined();
  });

  it('mapPublishingErrorRowToListFields emits tenant columns only', () => {
    const row: PublisherPublishingErrorRow = mapPublishingErrorRow(TENANT_RAW_ERROR)!;
    const fields = mapPublishingErrorRowToListFields(row);
    expect(fields['ErrorId']).toBe('err-001');
    expect(fields['ArticleId']).toBe('art-2026-042');
    expect(fields['Title']).toBe('bindingWrite: Acme Tower — April');
    expect(fields['Destination']).toBe('projectSpotlight');
    expect(fields['Operation']).toBe('sync');
    expect(fields['ErrorSummary']).toBe('Binding MERGE failed (status 500).');
    expect(fields['LastAttemptDateUtc']).toBe('2026-04-12T10:00:00Z');
    expect(fields['RetryStatus']).toBe('pending');

    // Legacy columns must NEVER appear in the write payload.
    expect(fields['OccurredDateUtc']).toBeUndefined();
    expect(fields['ErrorCategory']).toBeUndefined();
    expect(fields['ErrorDetails']).toBeUndefined();
    expect(fields['TemplateKey']).toBeUndefined();
    expect(fields['PageShellKey']).toBeUndefined();
  });
});

/* ── Orchestrator failure-path proof ──────────────────────────── */

function article(): PublisherArticleRow {
  return {
    ArticleId: 'art-orch-001',
    Title: 'Orchestrator failure article',
    ArticleContentType: 'monthlySpotlight',
    Destination: 'projectSpotlight',
    Slug: 'orch-failure',
    TemplateKey: 'ps-inprogress-monthly-v1',
    WorkflowState: 'approved',
    Subhead: 'Subhead.',
    SummaryExcerpt: 'Summary.',
    BodyRichText: '<p>Body.</p>',
    HeroPrimaryImage: 'https://img.example/hero.jpg',
    HeroPrimaryImageAltText: 'Hero alt',
    CreatedDateUtc: '2026-04-01T00:00:00Z',
    UpdatedDateUtc: '2026-04-10T00:00:00Z',
    TargetSiteUrl:
      'https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight',
  };
}

function template(): PublisherTemplateRegistryRow {
  return {
    TemplateKey: 'ps-inprogress-monthly-v1',
    TemplateName: 'PS Monthly',
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

describe('publishOrchestrator — failure-path persistence', () => {
  it('records a tenant publishing-error row when bindingWrite fails', async () => {
    const a = article();
    const t = template();

    const repositories: PublisherRepositories = {
      articles: {
        getByArticleId: vi.fn(async () => a),
        listByWorkflowState: vi.fn(async () => []),
        upsert: vi.fn(async () => {
          throw new Error('unused');
        }) as unknown as PublisherRepositories['articles']['upsert'],
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
        listActive: vi.fn(async () => [t]),
        getByKey: vi.fn(async () => t),
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
        append: vi.fn(async () => ({ itemId: 99 })),
      },
    };

    const pageCreation: PageCreationService = {
      createOrUpdate: vi.fn(async () => ({
        ok: true as const,
        pageId: '123',
        pageUrl: `${a.TargetSiteUrl}/SitePages/${a.Slug}.aspx`,
        pageName: `${a.Slug}.aspx`,
        wasCreated: true,
      })),
    };

    const failingBindingWriter: PageBindingWriter = {
      upsert: vi.fn(async () => ({
        ok: false as const,
        reason: 'writeFailed',
        message: 'Binding MERGE failed (status 500).',
        status: 500,
      })),
    };

    const orch = createPublishOrchestrator({
      repositories,
      pageBindingWriter: failingBindingWriter,
      pageShellService: createPageShellService({ pageCreation }),
    });

    const result = await orch.run({
      articleId: a.ArticleId,
      mode: 'create',
      now: () => '2026-04-13T10:00:00.000Z',
      validateBeforePublish: false,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.stage).toBe('bindingWrite');
    expect(repositories.publishingErrors.append).toHaveBeenCalledTimes(1);
    const errorAppendMock = repositories.publishingErrors.append as ReturnType<typeof vi.fn>;
    const persisted = errorAppendMock.mock.calls[0]![0] as PublisherPublishingErrorRow;
    expect(persisted.ArticleId).toBe(a.ArticleId);
    expect(persisted.Destination).toBe('projectSpotlight');
    expect(persisted.Operation).toBe('sync');
    expect(persisted.ErrorSummary).toContain('Binding MERGE failed');
    expect(persisted.RetryStatus).toBe('pending');
  });
});
