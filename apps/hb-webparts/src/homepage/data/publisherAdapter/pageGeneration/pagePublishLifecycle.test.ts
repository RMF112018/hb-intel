/**
 * Final modern-page publish lifecycle proof.
 *
 * Pins the contract that `pageShellService.publishPage`:
 *   - calls `pageCreation.createOrUpdate` first, then
 *     `pageCreation.publishLive` to make the page live;
 *   - never reports `ok: true` while skipping the explicit
 *     `_api/sitepages/pages({pageId})/Publish` step;
 *   - short-circuits without calling `publishLive` when
 *     `createOrUpdate` fails;
 *   - returns a typed `pagePublishLifecycleFailed` failure when
 *     `publishLive` itself fails.
 *
 * Also covers the live SharePoint REST integration in
 * `createSharePointPageCreationService.publishLive` — proving the
 * exact request URL, method, and digest header an HBCentral admin
 * can verify on the wire.
 */
import { describe, expect, it, vi } from 'vitest';
import { createPageShellService } from './pageShellService';
import {
  createSharePointPageCreationService,
  type PageCreationService,
} from './pageCreationService';
import type { PublishResolutionContext } from '../publishResolutionContext';
import type {
  PublisherArticleRow,
  PublisherTemplateRegistryRow,
} from '../publisherContracts';

function article(): PublisherArticleRow {
  return {
    ArticleId: 'art-life-001',
    Title: 'Lifecycle article',
    ArticleContentType: 'monthlySpotlight',
    Destination: 'projectSpotlight',
    Slug: 'lifecycle-article',
    TemplateKey: 'tmpl',
    WorkflowState: 'approved',
    Subhead: 'sub',
    SummaryExcerpt: 'sum',
    BodyRichText: '<p>body</p>',
    HeroPrimaryImage: 'https://img.example/h.jpg',
    HeroPrimaryImageAltText: 'alt',
    CreatedDateUtc: '2026-04-10T00:00:00Z',
    UpdatedDateUtc: '2026-04-10T00:00:00Z',
    TargetSiteUrl:
      'https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight',
  };
}

function template(): PublisherTemplateRegistryRow {
  return {
    TemplateKey: 'tmpl',
    TemplateName: 'tmpl',
    IsActive: true,
    TemplatePriority: 100,
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

function context(): PublishResolutionContext {
  return {
    article: article(),
    template: template(),
    teamMembers: [
      {
        ArticleId: 'art-life-001',
        TeamMemberId: 'tm-1',
        Title: 'A',
        PersonPrincipal: 'a@example.com',
        DisplayName: 'A',
      },
    ],
    media: [
      {
        ArticleId: 'art-life-001',
        MediaId: 'm-1',
        Title: 'g',
        MediaRole: 'gallery',
        ImageAsset: 'https://img.example/g.jpg',
        AltText: 'g',
      },
    ],
    existingBinding: undefined,
    decisionTrace: { input: {} as never, steps: [] },
  };
}

describe('pageShellService.publishPage — final modern-page publish lifecycle', () => {
  it('invokes createOrUpdate followed by publishLive and reports the publish outcome', async () => {
    const createOrUpdate = vi.fn(async () => ({
      ok: true as const,
      pageId: '777',
      pageUrl: 'https://example.com/sites/ProjectSpotlight/SitePages/lifecycle-article.aspx',
      pageName: 'lifecycle-article.aspx',
      wasCreated: true,
    }));
    const publishLive = vi.fn(async ({ pageId }) => ({
      ok: true as const,
      pageId,
      publishedAtUtc: '2026-04-13T10:00:00.000Z',
    }));
    const pageCreation: PageCreationService = { createOrUpdate, publishLive };
    const svc = createPageShellService({ pageCreation });

    const outcome = await svc.publishPage(context());
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(createOrUpdate).toHaveBeenCalledTimes(1);
    expect(publishLive).toHaveBeenCalledTimes(1);
    expect(publishLive).toHaveBeenCalledWith({
      pageId: '777',
      siteUrl:
        'https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight',
    });
    expect(outcome.publish.pageId).toBe('777');
    expect(outcome.publish.publishedAtUtc).toBe('2026-04-13T10:00:00.000Z');
  });

  it('does NOT call publishLive when createOrUpdate fails', async () => {
    const createOrUpdate = vi.fn(async () => ({
      ok: false as const,
      reason: 'patchCanvasFailed' as const,
      message: 'patch failed',
    }));
    const publishLive = vi.fn();
    const pageCreation: PageCreationService = {
      createOrUpdate,
      publishLive: publishLive as unknown as PageCreationService['publishLive'],
    };
    const svc = createPageShellService({ pageCreation });
    const outcome = await svc.publishPage(context());
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.reason).toBe('pageCreationFailed');
    expect(publishLive).not.toHaveBeenCalled();
  });

  it('returns pagePublishLifecycleFailed when publishLive itself fails', async () => {
    const createOrUpdate = vi.fn(async () => ({
      ok: true as const,
      pageId: '777',
      pageUrl: 'https://example.com/sites/ProjectSpotlight/SitePages/lifecycle-article.aspx',
      pageName: 'lifecycle-article.aspx',
      wasCreated: true,
    }));
    const publishLive = vi.fn(async () => ({
      ok: false as const,
      reason: 'publishLifecycleFailed' as const,
      message: 'Page Publish lifecycle failed (status 500).',
      status: 500,
    }));
    const pageCreation: PageCreationService = { createOrUpdate, publishLive };
    const svc = createPageShellService({ pageCreation });
    const outcome = await svc.publishPage(context());
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.reason).toBe('pagePublishLifecycleFailed');
    expect(outcome.publishFailure?.message).toContain('Page Publish lifecycle failed');
    expect(outcome.creation?.pageId).toBe('777');
  });
});

describe('createSharePointPageCreationService.publishLive — REST contract', () => {
  it('POSTs to _api/sitepages/pages({pageId})/Publish with a fresh request digest', async () => {
    const fetchRequestDigest = vi.fn(async () => 'digest-token-123');
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ Modified: '2026-04-13T10:00:00.000Z' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const svc = createSharePointPageCreationService({
      fetchRequestDigest,
      fetchImpl,
    });
    const outcome = await svc.publishLive({
      pageId: '777',
      siteUrl:
        'https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight/',
    });
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(fetchRequestDigest).toHaveBeenCalledWith(
      'https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight',
    );
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(
      'https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight/_api/sitepages/pages(777)/Publish',
    );
    expect(init?.method).toBe('POST');
    const headers = init?.headers as Record<string, string> | undefined;
    expect(headers?.['X-RequestDigest']).toBe('digest-token-123');
    expect(outcome.publishedAtUtc).toBe('2026-04-13T10:00:00.000Z');
  });

  it('returns publishLifecycleFailed on a non-2xx response', async () => {
    const fetchRequestDigest = vi.fn(async () => 'digest-token-123');
    const fetchImpl = vi.fn(async () =>
      new Response('Internal Server Error', { status: 500 }),
    );
    const svc = createSharePointPageCreationService({
      fetchRequestDigest,
      fetchImpl,
    });
    const outcome = await svc.publishLive({
      pageId: '777',
      siteUrl: 'https://example.com/sites/ProjectSpotlight',
    });
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.reason).toBe('publishLifecycleFailed');
    expect(outcome.status).toBe(500);
  });
});
