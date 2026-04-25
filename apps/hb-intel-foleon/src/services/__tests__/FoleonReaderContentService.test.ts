import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FoleonContentRecord } from '../../types/foleon-content.types.js';
import type { FoleonPlacementRecord } from '../../types/foleon-placement.types.js';
import { createFoleonOriginPolicy } from '../FoleonOriginPolicy.js';
import { fetchFoleonContent } from '../FoleonContentService.js';
import { fetchFoleonPlacements } from '../FoleonPlacementService.js';
import { resolveFoleonReaderContent } from '../FoleonReaderContentService.js';
import {
  FOLEON_READER_CONFIGS,
  type FoleonReaderModuleConfig,
} from '../../readers/readerConfigs.js';

vi.mock('../FoleonContentService.js', () => ({ fetchFoleonContent: vi.fn() }));
vi.mock('../FoleonPlacementService.js', () => ({ fetchFoleonPlacements: vi.fn() }));

const fetchContentMock = vi.mocked(fetchFoleonContent);
const fetchPlacementsMock = vi.mocked(fetchFoleonPlacements);
const policy = createFoleonOriginPolicy(['https://viewer.us.foleon.com']);

function makeContent(overrides: Partial<FoleonContentRecord> = {}): FoleonContentRecord {
  return {
    id: 1,
    title: 'Project Spotlight',
    foleonDocId: 1001,
    contentTypeKey: 'Project Spotlight',
    readerKey: 'project-spotlight',
    publishStatus: 'Published',
    isVisible: true,
    isFeatured: false,
    isHomepageEligible: true,
    publishedUrl: 'https://viewer.us.foleon.com/published/project-spotlight',
    issueDate: '2026-04-01T00:00:00.000Z',
    publishedOn: '2026-04-15T00:00:00.000Z',
    activeEdition: true,
    lastEditorialUpdate: '2026-04-25T00:00:00.000Z',
    openMode: 'Inline Reader',
    allowEmbed: true,
    requiresExternalOpen: false,
    syncSource: 'Manual',
    ...overrides,
  };
}

function makePlacement(overrides: Partial<FoleonPlacementRecord> = {}): FoleonPlacementRecord {
  return {
    id: 1,
    title: 'Project Spotlight Active',
    placementKey: 'Project Spotlight Active',
    contentIdCache: 1001,
    contentLookupId: 1,
    isActive: true,
    sortRank: 1,
    ...overrides,
  };
}

function baseParams(config: FoleonReaderModuleConfig = FOLEON_READER_CONFIGS.projectSpotlight) {
  return {
    siteUrl: 'https://tenant.sharepoint.com/sites/HBCentral',
    contentRegistryListId: '11111111-1111-1111-1111-111111111111',
    placementsListId: '22222222-2222-2222-2222-222222222222',
    config,
    originPolicy: policy,
    now: new Date('2026-04-25T12:00:00.000Z'),
  };
}

describe('resolveFoleonReaderContent', () => {
  beforeEach(() => {
    fetchContentMock.mockReset();
    fetchPlacementsMock.mockReset();
    fetchPlacementsMock.mockResolvedValue([]);
  });

  it('resolves the Project Spotlight active record from a matching placement', async () => {
    const record = makeContent();
    fetchContentMock.mockResolvedValue([record]);
    fetchPlacementsMock.mockResolvedValue([makePlacement()]);

    await expect(resolveFoleonReaderContent(baseParams())).resolves.toMatchObject({
      kind: 'ready',
      record,
      embedUrl: record.publishedUrl,
      warnings: [],
    });
  });

  it('resolves the Company Pulse active record', async () => {
    const record = makeContent({
      id: 2,
      title: 'Company Pulse',
      foleonDocId: 2002,
      contentTypeKey: 'Company Pulse',
      readerKey: 'company-pulse',
      publishedUrl: 'https://viewer.us.foleon.com/published/company-pulse',
    });
    fetchContentMock.mockResolvedValue([record]);
    fetchPlacementsMock.mockResolvedValue([
      makePlacement({
        placementKey: 'Company Pulse Active',
        contentIdCache: 2002,
        contentLookupId: 2,
      }),
    ]);

    await expect(resolveFoleonReaderContent(baseParams(FOLEON_READER_CONFIGS.companyPulse))).resolves.toMatchObject({
      kind: 'ready',
      record,
      warnings: [],
    });
  });

  it('accepts Leadership Message lane records from content contracts', async () => {
    const record = makeContent({
      id: 3,
      title: 'Leadership Message',
      foleonDocId: 3003,
      contentTypeKey: 'Leadership',
      readerKey: 'leadership-message',
      homepageSlot: 'Leadership Message Reader',
      publishedUrl: 'https://viewer.us.foleon.com/published/leadership-message',
    });

    expect(record.readerKey).toBe('leadership-message');
    expect(record.homepageSlot).toBe('Leadership Message Reader');
    expect(record.contentTypeKey).toBe('Leadership');
  });

  it('warns and falls back to active edition when placement is stale', async () => {
    const record = makeContent();
    fetchContentMock.mockResolvedValue([record]);
    fetchPlacementsMock.mockResolvedValue([makePlacement({ contentIdCache: 9999, contentLookupId: 999 })]);

    await expect(resolveFoleonReaderContent(baseParams())).resolves.toMatchObject({
      kind: 'ready',
      record,
      warnings: expect.arrayContaining(['placement-stale']),
    });
  });

  it('warns and falls back when placement points to mismatched content', async () => {
    const record = makeContent({ id: 1, foleonDocId: 1001 });
    const wrongLaneRecord = makeContent({
      id: 2,
      foleonDocId: 2002,
      contentTypeKey: 'Newsletter',
    });
    fetchContentMock.mockResolvedValue([record, wrongLaneRecord]);
    fetchPlacementsMock.mockResolvedValue([makePlacement({ contentIdCache: 2002, contentLookupId: 2 })]);

    const result = await resolveFoleonReaderContent(baseParams());
    expect(result).toMatchObject({
      kind: 'ready',
      record,
      warnings: expect.arrayContaining(['placement-content-mismatch', 'content-type-mismatch']),
    });
  });

  it('chooses a deterministic active edition when multiple records are active', async () => {
    const older = makeContent({ id: 2, foleonDocId: 1002, lastEditorialUpdate: '2026-04-01T00:00:00.000Z' });
    const newer = makeContent({ id: 3, foleonDocId: 1003, lastEditorialUpdate: '2026-04-20T00:00:00.000Z' });
    fetchContentMock.mockResolvedValue([older, newer]);

    await expect(resolveFoleonReaderContent({ ...baseParams(), placementsListId: undefined })).resolves.toMatchObject({
      kind: 'ready',
      record: newer,
      warnings: ['multiple-active-editions'],
    });
  });

  it('returns preview when no active record resolves', async () => {
    fetchContentMock.mockResolvedValue([]);

    await expect(resolveFoleonReaderContent({ ...baseParams(), placementsListId: undefined })).resolves.toMatchObject({
      kind: 'preview',
      reason: 'no-active-record',
      warnings: [],
    });
  });

  it('returns blocked, not preview, when a real selected record fails the reader gate', async () => {
    fetchContentMock.mockResolvedValue([makeContent({ allowEmbed: false })]);

    await expect(resolveFoleonReaderContent({ ...baseParams(), placementsListId: undefined })).resolves.toMatchObject({
      kind: 'blocked',
      reason: 'embed-disallowed',
    });
  });

  it('returns error, not preview, when the content query fails', async () => {
    fetchContentMock.mockRejectedValue(new Error('SharePoint 400'));

    await expect(resolveFoleonReaderContent(baseParams())).resolves.toMatchObject({
      kind: 'error',
      reason: 'SharePoint 400',
    });
  });

  it('ignores mismatched fetched candidates and reports config warnings', async () => {
    fetchContentMock.mockResolvedValue([
      makeContent({ contentTypeKey: 'Newsletter' }),
    ]);

    await expect(resolveFoleonReaderContent({ ...baseParams(), placementsListId: undefined })).resolves.toMatchObject({
      kind: 'preview',
      reason: 'no-active-record',
      warnings: ['content-type-mismatch'],
    });
  });

  it('uses only approved scalar-safe public filters', async () => {
    fetchContentMock.mockResolvedValue([]);
    await resolveFoleonReaderContent(baseParams());

    expect(fetchContentMock).toHaveBeenCalledWith(expect.objectContaining({
      readerKey: 'project-spotlight',
      activeEditionOnly: true,
      publishedOnly: true,
      homepageEligibleOnly: true,
    }));
    expect(fetchContentMock).not.toHaveBeenCalledWith(expect.objectContaining({
      contentTypeKey: expect.any(String),
      homepageSlot: expect.any(String),
    }));
  });
});
