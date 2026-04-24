import { describe, expect, it } from 'vitest';
import { MockFoleonService, validateContentMutation } from '../foleon-service.js';

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

  it('records mock SyncRuns proof for operator actions', async () => {
    const service = new MockFoleonService();
    const run = await service.syncDocs('corr-test', 'operator@example.com');
    const runs = await service.listSyncRuns();

    expect(run.status).toBe('Succeeded');
    expect(run.correlationId).toBe('corr-test');
    expect(runs[0]).toEqual(run);
  });
});
