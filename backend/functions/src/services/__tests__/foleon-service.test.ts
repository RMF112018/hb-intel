import { describe, expect, it, vi } from 'vitest';
import {
  FoleonService,
  MockFoleonService,
  computeFoleonUrlSyncHash,
  normalizeFoleonApiDocument,
  validateContentMutation,
} from '../foleon-service.js';
import type { FoleonBackendConfig } from '../../config/foleon-list-definitions.js';

describe('normalizeFoleonApiDocument', () => {
  it('maps common Foleon doc shapes', () => {
    expect(
      normalizeFoleonApiDocument({
        id: 4242,
        title: 'Quarterly update',
        url: 'https://viewer.us.foleon.com/acme/q1',
      }),
    ).toMatchObject({ foleonDocId: 4242, title: 'Quarterly update', publishedUrl: expect.stringContaining('https://') });
  });

  it('returns null when doc id cannot be resolved', () => {
    expect(normalizeFoleonApiDocument({ title: 'No id' })).toBeNull();
  });

  // PS-03A — cover/thumbnail extraction.
  it('extracts thumbnailUrl from explicit thumbnail_url and thumbnailUrl', () => {
    expect(
      normalizeFoleonApiDocument({
        id: 1,
        title: 'T',
        thumbnail_url: 'https://viewer.us.foleon.com/thumb-snake.jpg',
      })?.thumbnailUrl,
    ).toBe('https://viewer.us.foleon.com/thumb-snake.jpg');

    expect(
      normalizeFoleonApiDocument({
        id: 2,
        title: 'T',
        thumbnailUrl: 'https://viewer.us.foleon.com/thumb-camel.jpg',
      })?.thumbnailUrl,
    ).toBe('https://viewer.us.foleon.com/thumb-camel.jpg');
  });

  it('falls back through nested thumbnail.url, preview_image_url, and cover_url for thumbnailUrl', () => {
    expect(
      normalizeFoleonApiDocument({
        id: 3,
        title: 'T',
        thumbnail: { url: 'https://viewer.us.foleon.com/nested-thumb.jpg' },
      })?.thumbnailUrl,
    ).toBe('https://viewer.us.foleon.com/nested-thumb.jpg');

    expect(
      normalizeFoleonApiDocument({
        id: 4,
        title: 'T',
        preview_image_url: 'https://viewer.us.foleon.com/preview-image.jpg',
      })?.thumbnailUrl,
    ).toBe('https://viewer.us.foleon.com/preview-image.jpg');

    expect(
      normalizeFoleonApiDocument({
        id: 5,
        title: 'T',
        cover_url: 'https://viewer.us.foleon.com/cover.jpg',
      })?.thumbnailUrl,
    ).toBe('https://viewer.us.foleon.com/cover.jpg');
  });

  it('extracts heroImageUrl from explicit hero_image_url and prefers larger cover variants', () => {
    expect(
      normalizeFoleonApiDocument({
        id: 1,
        title: 'T',
        hero_image_url: 'https://viewer.us.foleon.com/hero.jpg',
      })?.heroImageUrl,
    ).toBe('https://viewer.us.foleon.com/hero.jpg');

    expect(
      normalizeFoleonApiDocument({
        id: 2,
        title: 'T',
        cover: { large_url: 'https://viewer.us.foleon.com/cover-large.jpg', url: 'https://viewer.us.foleon.com/cover-small.jpg' },
      })?.heroImageUrl,
    ).toBe('https://viewer.us.foleon.com/cover-large.jpg');
  });

  it('falls back to cover URL when no dedicated hero variant exists', () => {
    const result = normalizeFoleonApiDocument({
      id: 1,
      title: 'T',
      cover_url: 'https://viewer.us.foleon.com/only-cover.jpg',
    });
    expect(result?.heroImageUrl).toBe('https://viewer.us.foleon.com/only-cover.jpg');
    expect(result?.thumbnailUrl).toBe('https://viewer.us.foleon.com/only-cover.jpg');
  });

  it('rejects non-https thumbnail/cover URLs', () => {
    const result = normalizeFoleonApiDocument({
      id: 1,
      title: 'T',
      thumbnail_url: 'http://insecure.example/thumb.jpg',
      cover_url: 'http://insecure.example/cover.jpg',
    });
    expect(result?.thumbnailUrl).toBeUndefined();
    expect(result?.heroImageUrl).toBeUndefined();
  });

  it('leaves thumbnailUrl and heroImageUrl undefined when source carries no cover metadata', () => {
    const result = normalizeFoleonApiDocument({
      id: 1,
      title: 'T',
      url: 'https://viewer.us.foleon.com/doc',
    });
    expect(result?.thumbnailUrl).toBeUndefined();
    expect(result?.heroImageUrl).toBeUndefined();
    expect(result?.publishedUrl).toBe('https://viewer.us.foleon.com/doc');
  });
});

describe('computeFoleonUrlSyncHash', () => {
  it('produces a deterministic SHA-256 hex digest for identical inputs', () => {
    const a = computeFoleonUrlSyncHash({
      heroImageUrl: 'https://viewer.us.foleon.com/hero.jpg',
      thumbnailUrl: 'https://viewer.us.foleon.com/thumb.jpg',
      embedUrl: 'https://viewer.us.foleon.com/embed',
      publishedUrl: 'https://viewer.us.foleon.com/pub',
    });
    const b = computeFoleonUrlSyncHash({
      heroImageUrl: 'https://viewer.us.foleon.com/hero.jpg',
      thumbnailUrl: 'https://viewer.us.foleon.com/thumb.jpg',
      embedUrl: 'https://viewer.us.foleon.com/embed',
      publishedUrl: 'https://viewer.us.foleon.com/pub',
    });
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it('changes when any one of the four URLs drifts', () => {
    const base = {
      heroImageUrl: 'https://viewer.us.foleon.com/hero.jpg',
      thumbnailUrl: 'https://viewer.us.foleon.com/thumb.jpg',
      embedUrl: 'https://viewer.us.foleon.com/embed',
      publishedUrl: 'https://viewer.us.foleon.com/pub',
    };
    const baseHash = computeFoleonUrlSyncHash(base);
    expect(computeFoleonUrlSyncHash({ ...base, heroImageUrl: 'https://viewer.us.foleon.com/hero-2.jpg' })).not.toBe(baseHash);
    expect(computeFoleonUrlSyncHash({ ...base, thumbnailUrl: 'https://viewer.us.foleon.com/thumb-2.jpg' })).not.toBe(baseHash);
    expect(computeFoleonUrlSyncHash({ ...base, embedUrl: 'https://viewer.us.foleon.com/embed-2' })).not.toBe(baseHash);
    expect(computeFoleonUrlSyncHash({ ...base, publishedUrl: 'https://viewer.us.foleon.com/pub-2' })).not.toBe(baseHash);
  });

  it('treats undefined and empty string as the same hash input', () => {
    expect(computeFoleonUrlSyncHash({})).toBe(
      computeFoleonUrlSyncHash({ heroImageUrl: '', thumbnailUrl: '', embedUrl: '', publishedUrl: '' }),
    );
  });
});

describe('FoleonService.upsertRegistryRowsFromNormalized — PS-03A sync hardening', () => {
  function makeConfig(): FoleonBackendConfig {
    return {
      sharePointSiteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
      graphSiteId: 'site-id',
      contentRegistryListId: 'list-content',
      homepagePlacementsListId: 'list-placements',
      syncRunsListId: 'list-sync-runs',
      foleonClientId: 'client',
      foleonClientSecret: 'secret',
      foleonTokenUrl: 'https://api.foleon.com/oauth/token',
      foleonDocsUrl: 'https://api.foleon.com/v2/docs',
      foleonProjectsUrl: 'https://api.foleon.com/v2/projects',
      allowedOrigins: ['https://viewer.us.foleon.com'],
    };
  }

  function makeServiceAndSpies(existing: ReadonlyArray<{
    readonly id: string;
    readonly fields: Record<string, unknown>;
    readonly eTag?: string;
  }>) {
    const service = new FoleonService(makeConfig(), {
      acquireAppToken: async () => 'mock-token',
    } as never);
    const readListSpy = vi
      .spyOn(service as unknown as { readList: (...args: unknown[]) => unknown }, 'readList')
      .mockResolvedValue(existing as unknown as never);
    const createItemSpy = vi
      .spyOn(service as unknown as { createItem: (...args: unknown[]) => unknown }, 'createItem')
      .mockImplementation(async (_listId: unknown, fields: unknown) =>
        ({ id: '999', fields } as unknown as never),
      );
    const updateItemSpy = vi
      .spyOn(service as unknown as { updateItem: (...args: unknown[]) => unknown }, 'updateItem')
      .mockImplementation(async (_listId: unknown, id: unknown, fields: unknown) =>
        ({ id, fields } as unknown as never),
      );
    return { service, readListSpy, createItemSpy, updateItemSpy };
  }

  async function runUpsert(
    service: FoleonService,
    docs: ReadonlyArray<ReturnType<typeof normalizeFoleonApiDocument>>,
  ): Promise<{ created: number; updated: number; failed: number }> {
    const fn = (service as unknown as {
      upsertRegistryRowsFromNormalized: (
        docs: ReadonlyArray<NonNullable<ReturnType<typeof normalizeFoleonApiDocument>>>,
        correlationId: string,
      ) => Promise<{ created: number; updated: number; failed: number }>;
    }).upsertRegistryRowsFromNormalized;
    return fn.call(service, docs.filter((d): d is NonNullable<typeof d> => d !== null), 'corr-test');
  }

  it('on create writes HeroImageUrl, ThumbnailUrl, EmbedUrl, PublishedUrl, and SyncHash', async () => {
    const { service, createItemSpy, updateItemSpy } = makeServiceAndSpies([]);
    const doc = normalizeFoleonApiDocument({
      id: 1001,
      title: 'New Doc',
      url: 'https://viewer.us.foleon.com/pub-1',
      embed_url: 'https://viewer.us.foleon.com/embed-1',
      hero_image_url: 'https://viewer.us.foleon.com/hero-1.jpg',
      thumbnail_url: 'https://viewer.us.foleon.com/thumb-1.jpg',
    });
    const result = await runUpsert(service, [doc]);
    expect(result).toMatchObject({ created: 1, updated: 0, failed: 0 });
    expect(updateItemSpy).not.toHaveBeenCalled();
    expect(createItemSpy).toHaveBeenCalledTimes(1);
    const fields = createItemSpy.mock.calls[0]![1] as Record<string, unknown>;
    expect(fields.HeroImageUrl).toBe('https://viewer.us.foleon.com/hero-1.jpg');
    expect(fields.ThumbnailUrl).toBe('https://viewer.us.foleon.com/thumb-1.jpg');
    expect(fields.EmbedUrl).toBe('https://viewer.us.foleon.com/embed-1');
    expect(fields.PublishedUrl).toBe('https://viewer.us.foleon.com/pub-1');
    expect(fields.SyncHash).toMatch(/^[0-9a-f]{64}$/);
    expect(fields.SyncHash).toBe(
      computeFoleonUrlSyncHash({
        heroImageUrl: 'https://viewer.us.foleon.com/hero-1.jpg',
        thumbnailUrl: 'https://viewer.us.foleon.com/thumb-1.jpg',
        embedUrl: 'https://viewer.us.foleon.com/embed-1',
        publishedUrl: 'https://viewer.us.foleon.com/pub-1',
      }),
    );
    // Negative: no PreviewUrl on create.
    expect(Object.keys(fields)).not.toContain('PreviewUrl');
  });

  it('skips PATCH when stored SyncHash matches the new URL hash', async () => {
    const doc = normalizeFoleonApiDocument({
      id: 2001,
      title: 'Existing Doc',
      url: 'https://viewer.us.foleon.com/pub-2',
      embed_url: 'https://viewer.us.foleon.com/embed-2',
      hero_image_url: 'https://viewer.us.foleon.com/hero-2.jpg',
      thumbnail_url: 'https://viewer.us.foleon.com/thumb-2.jpg',
    });
    const expectedHash = computeFoleonUrlSyncHash({
      heroImageUrl: doc!.heroImageUrl,
      thumbnailUrl: doc!.thumbnailUrl,
      embedUrl: doc!.embedUrl,
      publishedUrl: doc!.publishedUrl,
    });
    const { service, createItemSpy, updateItemSpy } = makeServiceAndSpies([
      {
        id: '7',
        fields: {
          Id: 7,
          FoleonDocId: 2001,
          Title: 'Existing Doc',
          PublishedUrl: 'https://viewer.us.foleon.com/pub-2',
          EmbedUrl: 'https://viewer.us.foleon.com/embed-2',
          HeroImageUrl: 'https://viewer.us.foleon.com/hero-2.jpg',
          ThumbnailUrl: 'https://viewer.us.foleon.com/thumb-2.jpg',
          PublishStatus: 'Draft',
          IsVisible: false,
          IsHomepageEligible: false,
          OpenMode: 'Inline Reader',
          AllowEmbed: true,
          RequiresExternalOpen: false,
          SyncSource: 'Foleon API',
          ContentTypeKey: 'Other',
          SyncHash: expectedHash,
        },
        eTag: '"1"',
      },
    ]);
    const result = await runUpsert(service, [doc]);
    expect(result).toMatchObject({ created: 0, updated: 0, failed: 0 });
    expect(createItemSpy).not.toHaveBeenCalled();
    expect(updateItemSpy).not.toHaveBeenCalled();
  });

  it('PATCHes all four URLs plus SyncHash when any one of them drifts', async () => {
    for (const drift of [
      { heroImageUrl: 'https://viewer.us.foleon.com/hero-NEW.jpg' },
      { thumbnailUrl: 'https://viewer.us.foleon.com/thumb-NEW.jpg' },
      { embedUrl: 'https://viewer.us.foleon.com/embed-NEW' },
      { publishedUrl: 'https://viewer.us.foleon.com/pub-NEW' },
    ] as const) {
      const baseUrls = {
        heroImageUrl: 'https://viewer.us.foleon.com/hero-base.jpg',
        thumbnailUrl: 'https://viewer.us.foleon.com/thumb-base.jpg',
        embedUrl: 'https://viewer.us.foleon.com/embed-base',
        publishedUrl: 'https://viewer.us.foleon.com/pub-base',
      };
      const storedHash = computeFoleonUrlSyncHash(baseUrls);
      const newUrls = { ...baseUrls, ...drift };
      const doc = normalizeFoleonApiDocument({
        id: 3001,
        title: 'Drifting Doc',
        url: newUrls.publishedUrl,
        embed_url: newUrls.embedUrl,
        hero_image_url: newUrls.heroImageUrl,
        thumbnail_url: newUrls.thumbnailUrl,
      });
      const { service, createItemSpy, updateItemSpy } = makeServiceAndSpies([
        {
          id: '11',
          fields: {
            Id: 11,
            FoleonDocId: 3001,
            Title: 'Drifting Doc',
            PublishedUrl: baseUrls.publishedUrl,
            EmbedUrl: baseUrls.embedUrl,
            HeroImageUrl: baseUrls.heroImageUrl,
            ThumbnailUrl: baseUrls.thumbnailUrl,
            PublishStatus: 'Draft',
            IsVisible: false,
            IsHomepageEligible: false,
            OpenMode: 'Inline Reader',
            AllowEmbed: true,
            RequiresExternalOpen: false,
            SyncSource: 'Foleon API',
            ContentTypeKey: 'Other',
            SyncHash: storedHash,
          },
          eTag: '"1"',
        },
      ]);
      const result = await runUpsert(service, [doc]);
      expect(result).toMatchObject({ created: 0, updated: 1, failed: 0 });
      expect(createItemSpy).not.toHaveBeenCalled();
      expect(updateItemSpy).toHaveBeenCalledTimes(1);
      const [, , patch, etag] = updateItemSpy.mock.calls[0]!;
      const patchObj = patch as Record<string, unknown>;
      expect(patchObj.HeroImageUrl).toBe(newUrls.heroImageUrl);
      expect(patchObj.ThumbnailUrl).toBe(newUrls.thumbnailUrl);
      expect(patchObj.EmbedUrl).toBe(newUrls.embedUrl);
      expect(patchObj.PublishedUrl).toBe(newUrls.publishedUrl);
      expect(patchObj.SyncHash).toBe(computeFoleonUrlSyncHash(newUrls));
      expect(patchObj.SyncSource).toBe('Foleon API');
      expect(patchObj.LastSynced).toEqual(expect.any(String));
      // Negative: PreviewUrl is never written on update.
      expect(Object.keys(patchObj)).not.toContain('PreviewUrl');
      // ETag concurrency preserved.
      expect(etag).toBe('"1"');
    }
  });

  it('integrated republish path: when all four URLs change at once, all four refresh together', async () => {
    const baseUrls = {
      heroImageUrl: 'https://viewer.us.foleon.com/hero-v1.jpg',
      thumbnailUrl: 'https://viewer.us.foleon.com/thumb-v1.jpg',
      embedUrl: 'https://viewer.us.foleon.com/embed-v1',
      publishedUrl: 'https://viewer.us.foleon.com/pub-v1',
    };
    const newUrls = {
      heroImageUrl: 'https://viewer.us.foleon.com/hero-v2.jpg',
      thumbnailUrl: 'https://viewer.us.foleon.com/thumb-v2.jpg',
      embedUrl: 'https://viewer.us.foleon.com/embed-v2',
      publishedUrl: 'https://viewer.us.foleon.com/pub-v2',
    };
    const { service, updateItemSpy } = makeServiceAndSpies([
      {
        id: '13',
        fields: {
          Id: 13,
          FoleonDocId: 4001,
          Title: 'Republished Doc',
          PublishedUrl: baseUrls.publishedUrl,
          EmbedUrl: baseUrls.embedUrl,
          HeroImageUrl: baseUrls.heroImageUrl,
          ThumbnailUrl: baseUrls.thumbnailUrl,
          PublishStatus: 'Draft',
          IsVisible: false,
          IsHomepageEligible: false,
          OpenMode: 'Inline Reader',
          AllowEmbed: true,
          RequiresExternalOpen: false,
          SyncSource: 'Foleon API',
          ContentTypeKey: 'Other',
          SyncHash: computeFoleonUrlSyncHash(baseUrls),
        },
        eTag: '"7"',
      },
    ]);
    const doc = normalizeFoleonApiDocument({
      id: 4001,
      title: 'Republished Doc',
      url: newUrls.publishedUrl,
      embed_url: newUrls.embedUrl,
      hero_image_url: newUrls.heroImageUrl,
      thumbnail_url: newUrls.thumbnailUrl,
    });
    const result = await runUpsert(service, [doc]);
    expect(result).toMatchObject({ created: 0, updated: 1, failed: 0 });
    const [, , patch, etag] = updateItemSpy.mock.calls[0]!;
    const patchObj = patch as Record<string, unknown>;
    expect(patchObj).toMatchObject({
      HeroImageUrl: newUrls.heroImageUrl,
      ThumbnailUrl: newUrls.thumbnailUrl,
      EmbedUrl: newUrls.embedUrl,
      PublishedUrl: newUrls.publishedUrl,
      SyncHash: computeFoleonUrlSyncHash(newUrls),
    });
    expect(etag).toBe('"7"');
    expect(Object.keys(patchObj)).not.toContain('PreviewUrl');
  });

  it('propagates Graph conflict errors from updateItem (ETag concurrency preserved)', async () => {
    const { service, updateItemSpy } = makeServiceAndSpies([
      {
        id: '15',
        fields: {
          Id: 15,
          FoleonDocId: 5001,
          Title: 'Conflict Doc',
          PublishedUrl: 'https://viewer.us.foleon.com/pub-old',
          EmbedUrl: 'https://viewer.us.foleon.com/embed-old',
          HeroImageUrl: 'https://viewer.us.foleon.com/hero-old.jpg',
          ThumbnailUrl: 'https://viewer.us.foleon.com/thumb-old.jpg',
          PublishStatus: 'Draft',
          IsVisible: false,
          IsHomepageEligible: false,
          OpenMode: 'Inline Reader',
          AllowEmbed: true,
          RequiresExternalOpen: false,
          SyncSource: 'Foleon API',
          ContentTypeKey: 'Other',
          SyncHash: computeFoleonUrlSyncHash({
            heroImageUrl: 'https://viewer.us.foleon.com/hero-old.jpg',
            thumbnailUrl: 'https://viewer.us.foleon.com/thumb-old.jpg',
            embedUrl: 'https://viewer.us.foleon.com/embed-old',
            publishedUrl: 'https://viewer.us.foleon.com/pub-old',
          }),
        },
        eTag: '"3"',
      },
    ]);
    updateItemSpy.mockRejectedValueOnce(new Error('graph 412 precondition failed'));
    const doc = normalizeFoleonApiDocument({
      id: 5001,
      title: 'Conflict Doc',
      url: 'https://viewer.us.foleon.com/pub-NEW',
      embed_url: 'https://viewer.us.foleon.com/embed-NEW',
      hero_image_url: 'https://viewer.us.foleon.com/hero-NEW.jpg',
      thumbnail_url: 'https://viewer.us.foleon.com/thumb-NEW.jpg',
    });
    const result = await runUpsert(service, [doc]);
    // Per the existing service contract (line ~656), per-doc errors are
    // counted as failures rather than thrown; the loop preserves the
    // ETag conflict as a structured failure entry.
    expect(result).toMatchObject({ created: 0, updated: 0, failed: 1 });
  });

  it('negative scan: PreviewUrl is never written by sync on either branch, even when source carries preview-shaped fields', async () => {
    const docNoPreview = normalizeFoleonApiDocument({
      id: 6001,
      title: 'No Preview',
      url: 'https://viewer.us.foleon.com/pub',
      preview_url: 'https://viewer.us.foleon.com/preview',
      previewUrl: 'https://viewer.us.foleon.com/preview-camel',
    });
    const { service, createItemSpy } = makeServiceAndSpies([]);
    await runUpsert(service, [docNoPreview]);
    const fields = createItemSpy.mock.calls[0]![1] as Record<string, unknown>;
    expect(Object.keys(fields)).not.toContain('PreviewUrl');
  });
});

describe('Foleon service validation', () => {
  it('blocks publish-ready content without a display URL', () => {
    const result = validateContentMutation({
      title: 'No URL',
      foleonDocId: 10,
      contentTypeKey: 'Project Highlight',
      publishStatus: 'Published',
      isVisible: true,
      openMode: 'Inline Reader',
      allowEmbed: true,
    }, 'corr-test');

    expect(result.status).toBe('blocked');
    expect(result.blockingReasons).toContain('Published content requires a Published URL or Embed URL.');
    expect(result.correlationId).toBe('corr-test');
  });

  it('blocks active placements for non-homepage-eligible content', async () => {
    const service = new MockFoleonService();
    const draft = await service.createContent({
      title: 'Draft',
      foleonDocId: 3001,
      contentTypeKey: 'Newsletter',
      publishStatus: 'Draft',
      isVisible: false,
      isHomepageEligible: false,
      openMode: 'New Tab Only',
      allowEmbed: false,
      publishedUrl: 'https://viewer.us.foleon.com/draft',
    }, 'corr-test');

    await expect(service.createPlacement({
      title: 'Hero',
      placementKey: 'Hero',
      contentItemId: Number(draft.id),
      isActive: true,
      sortRank: 1,
      layoutVariant: 'Large Feature',
    }, 'corr-test')).resolves.toMatchObject({
      validationStatus: 'blocked',
      foleonDocId: 3001,
    });
  });

  it('round-trips governed lane content fields through mock backend DTOs', async () => {
    const service = new MockFoleonService();
    const record = await service.createContent({
      title: 'Leadership Message',
      foleonDocId: 4001,
      contentTypeKey: 'Leadership',
      readerKey: 'leadership-message',
      cadence: 'Frequent',
      homepageSlot: 'Leadership Message Reader',
      archiveGroup: '2026-Q2',
      activeEdition: true,
      primaryAudience: 'Companywide',
      lastEditorialUpdate: '2026-04-25T12:00:00.000Z',
      publishStatus: 'Draft',
      isVisible: false,
      isHomepageEligible: false,
      openMode: 'Inline Reader',
      allowEmbed: true,
      publishedUrl: 'https://viewer.us.foleon.com/company/pulse',
    }, 'corr-test');

    await expect(service.getContent(record.id)).resolves.toMatchObject({
      contentTypeKey: 'Leadership',
      readerKey: 'leadership-message',
      cadence: 'Frequent',
      homepageSlot: 'Leadership Message Reader',
      archiveGroup: '2026-Q2',
      activeEdition: true,
      primaryAudience: 'Companywide',
      lastEditorialUpdate: '2026-04-25T12:00:00.000Z',
    });
  });

  it('warns when active reader lane content is not public-ready', () => {
    const result = validateContentMutation({
      title: 'Company Pulse',
      foleonDocId: 5001,
      contentTypeKey: 'Company Pulse',
      readerKey: 'company-pulse',
      activeEdition: true,
      publishStatus: 'Draft',
      isVisible: false,
      isHomepageEligible: true,
      openMode: 'Inline Reader',
      allowEmbed: true,
      publishedUrl: 'https://viewer.us.foleon.com/company/pulse',
    }, 'corr-test');

    expect(result.status).toBe('warning');
    expect(result.warnings).toContain(
      'Active reader editions should be published, visible, homepage eligible, and have a reader URL.',
    );
    expect(result.warnings).toContain(
      'Company Pulse active editions should include Last Editorial Update.',
    );
  });

  it('blocks inline reader publishing without an embed URL', () => {
    const result = validateContentMutation({
      title: 'Inline Project Spotlight',
      foleonDocId: 5101,
      contentTypeKey: 'Project Spotlight',
      readerKey: 'project-spotlight',
      homepageSlot: 'Project Spotlight Reader',
      activeEdition: true,
      publishStatus: 'Published',
      isVisible: true,
      isHomepageEligible: true,
      openMode: 'Inline Reader',
      allowEmbed: true,
      publishedUrl: 'https://viewer.us.foleon.com/project/spotlight',
    }, 'corr-test');

    expect(result.status).toBe('blocked');
    expect(result.blockingReasons).toContain('Inline Reader published content requires an Embed URL.');
  });

  it('blocks production URLs outside the configured origin allowlist', () => {
    const result = validateContentMutation({
      title: 'Wrong Origin',
      foleonDocId: 5102,
      contentTypeKey: 'Project Spotlight',
      readerKey: 'project-spotlight',
      homepageSlot: 'Project Spotlight Reader',
      activeEdition: true,
      publishStatus: 'Published',
      isVisible: true,
      isHomepageEligible: true,
      openMode: 'New Tab Only',
      allowEmbed: false,
      publishedUrl: 'https://example.com/project/spotlight',
    }, 'corr-test', { allowedOrigins: ['https://viewer.us.foleon.com'] });

    expect(result.status).toBe('blocked');
    expect(result.blockingReasons).toContain('Published URL origin is not allowlisted.');
  });

  it('blocks overlapping active editions for the same lane and homepage slot', () => {
    const result = validateContentMutation({
      title: 'New Project Spotlight',
      foleonDocId: 5103,
      contentTypeKey: 'Project Spotlight',
      readerKey: 'project-spotlight',
      homepageSlot: 'Project Spotlight Reader',
      activeEdition: true,
      publishStatus: 'Published',
      isVisible: true,
      isHomepageEligible: true,
      openMode: 'New Tab Only',
      allowEmbed: false,
      publishedUrl: 'https://viewer.us.foleon.com/project/new',
      displayFrom: '2026-05-01T00:00:00.000Z',
      displayThrough: '2026-05-31T00:00:00.000Z',
    }, 'corr-test', {
      existingContent: [{
        sharePointItemId: 20,
        title: 'Existing Project Spotlight',
        readerKey: 'project-spotlight',
        homepageSlot: 'Project Spotlight Reader',
        activeEdition: true,
        publishStatus: 'Published',
        isHomepageEligible: true,
        displayFrom: '2026-05-15T00:00:00.000Z',
        displayThrough: '2026-06-15T00:00:00.000Z',
      }],
    });

    expect(result.status).toBe('blocked');
    expect(result.blockingReasons.join(' ')).toContain('overlapping active edition');
  });

  it('warns for reader placement lane mismatches', async () => {
    const service = new MockFoleonService();
    const content = await service.createContent({
      title: 'Company Pulse',
      foleonDocId: 5002,
      contentTypeKey: 'Company Pulse',
      readerKey: 'company-pulse',
      publishStatus: 'Published',
      isVisible: true,
      isHomepageEligible: true,
      openMode: 'Inline Reader',
      allowEmbed: true,
      publishedUrl: 'https://viewer.us.foleon.com/company/pulse',
    }, 'corr-test');

    const placement = await service.createPlacement({
      title: 'Project Spotlight active reader',
      placementKey: 'Project Spotlight Active',
      contentItemId: Number(content.id),
      isActive: true,
      sortRank: 1,
      layoutVariant: 'Large Feature',
    }, 'corr-test');

    expect(placement.validationStatus).toBe('warning');
    expect(placement.blockingReasons).toEqual([]);
  });

  it('accepts Leadership Message placement alignment through the existing Leadership content type', async () => {
    const service = new MockFoleonService();
    const content = await service.createContent({
      title: 'Leadership Message',
      foleonDocId: 5003,
      contentTypeKey: 'Leadership',
      readerKey: 'leadership-message',
      homepageSlot: 'Leadership Message Reader',
      publishStatus: 'Published',
      isVisible: true,
      isHomepageEligible: true,
      openMode: 'Inline Reader',
      allowEmbed: true,
      publishedUrl: 'https://viewer.us.foleon.com/leadership/message',
    }, 'corr-test');

    const placement = await service.createPlacement({
      title: 'Leadership Message active reader',
      placementKey: 'Leadership Message Active',
      contentItemId: Number(content.id),
      isActive: true,
      sortRank: 1,
      layoutVariant: 'Large Feature',
    }, 'corr-test');

    expect(placement.validationStatus).toBe('valid');
    expect(placement.placementKey).toBe('Leadership Message Active');
  });

  it('writes ContentIdCache from the selected content FoleonDocId', async () => {
    const service = new MockFoleonService();
    const placement = await service.createPlacement({
      title: 'Primary homepage feature',
      placementKey: 'Hero',
      contentItemId: 1,
      isActive: true,
      sortRank: 1,
      layoutVariant: 'Large Feature',
    }, 'corr-test');

    expect(placement.contentItemId).toBe(1);
    expect(placement.foleonDocId).toBe(1001);
    expect(placement.validationStatus).toBe('valid');
  });

  it('accepts governed placement keys in backend contracts', async () => {
    const service = new MockFoleonService();
    const placement = await service.createPlacement({
      title: 'Project Spotlight active reader',
      placementKey: 'Project Spotlight Active',
      contentItemId: 1,
      isActive: true,
      sortRank: 1,
      layoutVariant: 'Large Feature',
    }, 'corr-test');

    expect(placement.placementKey).toBe('Project Spotlight Active');
  });

  it('records mock SyncRuns proof for operator actions', async () => {
    const service = new MockFoleonService();
    const run = await service.syncDocs('corr-test', 'operator@example.com');
    const runs = await service.listSyncRuns();

    expect(run.status).toBe('Succeeded');
    expect(run.correlationId).toBe('corr-test');
    expect(runs[0]).toEqual(run);
  });
});
