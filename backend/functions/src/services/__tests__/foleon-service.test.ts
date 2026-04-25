import { describe, expect, it } from 'vitest';
import { MockFoleonService, normalizeFoleonApiDocument, validateContentMutation } from '../foleon-service.js';

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

  it('round-trips two-lane content fields through mock backend DTOs', async () => {
    const service = new MockFoleonService();
    const record = await service.createContent({
      title: 'Company Pulse',
      foleonDocId: 4001,
      contentTypeKey: 'Company Pulse',
      readerKey: 'company-pulse',
      cadence: 'Frequent',
      homepageSlot: 'Company Pulse Reader',
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
      contentTypeKey: 'Company Pulse',
      readerKey: 'company-pulse',
      cadence: 'Frequent',
      homepageSlot: 'Company Pulse Reader',
      archiveGroup: '2026-Q2',
      activeEdition: true,
      primaryAudience: 'Companywide',
      lastEditorialUpdate: '2026-04-25T12:00:00.000Z',
    });
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

  it('accepts two-lane placement keys in backend contracts', async () => {
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
