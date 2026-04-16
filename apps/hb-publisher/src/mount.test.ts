/**
 * Mount-level wiring proof for the governed asset-library provider.
 *
 * Wave-01 Prompt-02 requires that the hosted SPFx runtime actually
 * threads a concrete `searchAssets` provider into `ArticlePublisher`
 * and that dev-preview / hostless paths remain truthfully unwired
 * so the UI falls back to URL-first entry rather than pretending to
 * have production governance it does not have.
 *
 * `buildHostedSearchAssets` is the single wiring seam between
 * `mount.tsx` and the concrete provider built in
 * `assetLibrarySource.ts`; this spec locks its contract.
 */
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./data/publisherAdapter/assetLibrarySource.js', () => ({
  createAssetLibrarySearch: vi.fn(() => vi.fn(async () => [])),
}));

import { buildHostedSearchAssets } from './mount.js';
import { createAssetLibrarySearch } from './data/publisherAdapter/assetLibrarySource.js';
import { PUBLISHER_LIST_HOST_SITE_URL } from './data/publisherAdapter/publisherListDescriptors.js';

const createAssetLibrarySearchMock =
  createAssetLibrarySearch as unknown as ReturnType<typeof vi.fn>;

describe('buildHostedSearchAssets', () => {
  it('returns undefined when no SPFx context is present so dev preview stays honestly URL-first', () => {
    createAssetLibrarySearchMock.mockClear();
    expect(buildHostedSearchAssets(undefined)).toBeUndefined();
    expect(createAssetLibrarySearchMock).not.toHaveBeenCalled();
  });

  it('returns a provider bound to PUBLISHER_LIST_HOST_SITE_URL when hosted in SPFx', () => {
    createAssetLibrarySearchMock.mockClear();
    const provider = buildHostedSearchAssets({} as WebPartContext);
    expect(typeof provider).toBe('function');
    expect(createAssetLibrarySearchMock).toHaveBeenCalledTimes(1);
    expect(createAssetLibrarySearchMock).toHaveBeenCalledWith({
      hostSiteUrl: PUBLISHER_LIST_HOST_SITE_URL,
    });
  });
});
