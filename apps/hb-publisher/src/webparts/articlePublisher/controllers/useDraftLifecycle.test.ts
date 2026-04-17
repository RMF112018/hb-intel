/**
 * Wave-03 Prompt-01 — defense-in-depth test for `useDraftLifecycle`.
 *
 * The shell already gates Publish / Republish on `isDirty`, but the
 * lifecycle handler must refuse stale-state publish regardless of how
 * it is reached. This test drives `handlePublishAction` after a draft
 * is loaded, flips the ref-backed `getIsDirty` to `true`, and proves
 * the orchestrator is never invoked while a refusal status is set.
 *
 * Preview mode stays unaffected so the existing
 * save-and-refresh-preview handshake remains truthful.
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type {
  PublisherArticleRow,
  PublisherMediaRow,
  PublisherPageBindingRow,
  PublisherPromotionRuleRow,
  PublisherRepositories,
  PublisherTeamMemberRow,
  PublishOutcome,
} from '../../../data/publisherAdapter/index.js';
import { useDraftLifecycle, type PublishOrchestrator } from './useDraftLifecycle.js';

function article(
  over: Partial<PublisherArticleRow> = {},
): PublisherArticleRow {
  return {
    ArticleId: 'art-001',
    Title: 'Draft',
    ArticleContentType: 'monthlySpotlight',
    Destination: 'projectSpotlight',
    Slug: 'draft',
    TemplateKey: 'tmpl-v1',
    WorkflowState: 'approved',
    Subhead: 's',
    SummaryExcerpt: 'e',
    BodyRichText: '<p>b</p>',
    HeroPrimaryImage: 'https://img.example/h.jpg',
    HeroPrimaryImageAltText: 'alt',
    CreatedDateUtc: '2026-04-01T00:00:00Z',
    UpdatedDateUtc: '2026-04-10T00:00:00Z',
    ...over,
  } as PublisherArticleRow;
}

function template() {
  return {
    TemplateKey: 'tmpl-v1',
    IsActive: true,
    TemplatePriority: 100,
    VersionLabel: '1.0.0',
    ContentTypes: ['monthlySpotlight'],
    Destination: 'projectSpotlight',
    PageShellTemplateKey: 'ps-shell-v1',
    HeroProfileKey: 'hero',
    BodyProfileKey: 'body',
    TeamViewerProfileKey: 'team',
    GalleryProfileKey: 'gallery',
    ShowHero: true,
    ShowBody: true,
    ShowTeamViewer: true,
    ShowGallery: true,
    ShowSecondaryImage: false,
    RequiredFieldSetKey: 'req-ps-inprogress-monthly-v1',
  };
}

function makeRepositories(): PublisherRepositories {
  const team: PublisherTeamMemberRow[] = [];
  const media: PublisherMediaRow[] = [];
  const binding: PublisherPageBindingRow | undefined = undefined;
  return {
    articles: {
      getByArticleId: vi.fn(async () => article()),
      listAll: vi.fn(async () => [article()]),
      listDrafts: vi.fn(async () => [article()]),
      upsert: vi.fn(async (row) => row),
    } as unknown as PublisherRepositories['articles'],
    teamMembers: {
      listByArticle: vi.fn(async () => team),
      upsert: vi.fn(async (row) => row),
      deleteById: vi.fn(async () => undefined),
    } as unknown as PublisherRepositories['teamMembers'],
    media: {
      listByArticle: vi.fn(async () => media),
      upsert: vi.fn(async (row) => row),
      deleteById: vi.fn(async () => undefined),
    } as unknown as PublisherRepositories['media'],
    pageBindings: {
      getByArticleId: vi.fn(async () => binding),
      upsert: vi.fn(async (row) => row),
    } as unknown as PublisherRepositories['pageBindings'],
    templateRegistry: {
      listActive: vi.fn(async () => [template()]),
    } as unknown as PublisherRepositories['templateRegistry'],
    workflowHistory: {
      append: vi.fn(async () => undefined),
    } as unknown as PublisherRepositories['workflowHistory'],
    publishingErrors: {
      append: vi.fn(async () => undefined),
    } as unknown as PublisherRepositories['publishingErrors'],
    promotionRules: {
      listAll: vi.fn(async () => []),
    } as unknown as PublisherRepositories['promotionRules'],
  } as unknown as PublisherRepositories;
}

interface Harness {
  readonly repositories: PublisherRepositories;
  readonly orchestratorRun: ReturnType<typeof vi.fn>;
  readonly setStatus: ReturnType<typeof vi.fn>;
  readonly dirtyRef: { current: boolean };
}

function makeHarness(
  outcome: PublishOutcome = {
    ok: true,
    mode: 'create',
    action: 'create',
    pageId: 'pg-1',
    pageUrl: 'https://example.com/page',
  } as PublishOutcome,
): Harness {
  const orchestratorRun = vi.fn(async (_: unknown) => outcome);
  const dirtyRef = { current: false };
  const setStatus = vi.fn();
  return {
    repositories: makeRepositories(),
    orchestratorRun,
    setStatus,
    dirtyRef,
  };
}

function buildDeps(h: Harness, promotionRules: readonly PublisherPromotionRuleRow[] = []) {
  const orchestrator = { run: h.orchestratorRun } as unknown as PublishOrchestrator;
  return {
    repositories: h.repositories,
    orchestrator,
    actorEmail: 'op@example.com',
    promotionRules,
    groups: {} as never,
    reloadGroups: vi.fn(async () => undefined),
    selectedArticleId: 'art-001',
    setSelectedArticleId: vi.fn(),
    setStatus: h.setStatus,
    getIsDirty: () => h.dirtyRef.current,
  };
}

describe('useDraftLifecycle — handlePublishAction dirty-state refusal', () => {
  it('refuses publish (mode="create") when the working copy is dirty and never calls orchestrator.run', async () => {
    const h = makeHarness();
    const deps = buildDeps(h);
    const { result } = renderHook(() => useDraftLifecycle(deps));

    // `selectedArticleId='art-001'` triggers the mount-time reload.
    await waitFor(() => expect(result.current.articleDraft).toBeDefined());

    // Mark the in-memory working copy as dirty and attempt publish.
    h.dirtyRef.current = true;
    await act(async () => {
      await result.current.handlePublishAction('create');
    });

    expect(h.orchestratorRun).not.toHaveBeenCalled();
    expect(h.setStatus).toHaveBeenCalledWith(
      expect.stringMatching(/Save your edits before publishing/i),
      'error',
    );
  });

  it('refuses republish (mode="republish") when dirty and never calls orchestrator.run', async () => {
    const h = makeHarness();
    const deps = buildDeps(h);
    const { result } = renderHook(() => useDraftLifecycle(deps));
    await waitFor(() => expect(result.current.articleDraft).toBeDefined());

    h.dirtyRef.current = true;
    await act(async () => {
      await result.current.handlePublishAction('republish');
    });

    expect(h.orchestratorRun).not.toHaveBeenCalled();
    expect(h.setStatus).toHaveBeenCalledWith(
      expect.stringMatching(/Save your edits before publishing/i),
      'error',
    );
  });

  it('still permits preview when dirty (save-and-refresh-preview remains truthful)', async () => {
    const previewOutcome: PublishOutcome = {
      ok: true,
      mode: 'preview',
      action: 'noOp',
    } as PublishOutcome;
    const h = makeHarness(previewOutcome);
    const deps = buildDeps(h);
    const { result } = renderHook(() => useDraftLifecycle(deps));
    await waitFor(() => expect(result.current.articleDraft).toBeDefined());

    h.dirtyRef.current = true;
    await act(async () => {
      await result.current.handlePublishAction('preview');
    });

    expect(h.orchestratorRun).toHaveBeenCalledTimes(1);
    expect(h.orchestratorRun.mock.calls[0]?.[0]?.mode).toBe('preview');
  });

  it('publishes normally when the working copy is clean (regression guard)', async () => {
    const h = makeHarness();
    const deps = buildDeps(h);
    const { result } = renderHook(() => useDraftLifecycle(deps));
    await waitFor(() => expect(result.current.articleDraft).toBeDefined());

    h.dirtyRef.current = false;
    await act(async () => {
      await result.current.handlePublishAction('create');
    });

    expect(h.orchestratorRun).toHaveBeenCalledTimes(1);
    expect(h.orchestratorRun.mock.calls[0]?.[0]).toMatchObject({
      articleId: 'art-001',
      mode: 'create',
    });
  });
});
