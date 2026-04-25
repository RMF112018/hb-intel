import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { HighlightsPage } from '../HighlightsPage.js';
import { fetchFoleonContent } from '../../services/FoleonContentService.js';
import { fetchFoleonPlacements } from '../../services/FoleonPlacementService.js';
import { createFoleonOriginPolicy } from '../../services/FoleonOriginPolicy.js';
import type { FoleonContentRecord } from '../../types/foleon-content.types.js';
import type { FoleonPlacementRecord } from '../../types/foleon-placement.types.js';
import type { IFoleonRuntimeContract } from '../../runtime/foleonRuntimeContract.js';
import { FOLEON_PACKAGE_VERSION, FOLEON_WEBPART_ID } from '../../webparts/foleon/runtimeContract.js';

vi.mock('../../services/FoleonContentService.js', () => ({ fetchFoleonContent: vi.fn() }));
vi.mock('../../services/FoleonPlacementService.js', () => ({ fetchFoleonPlacements: vi.fn() }));

const TEST_SITE = 'https://tenant.sharepoint.com/sites/HBCentral';
const TEST_CONTENT_LIST = '11111111-1111-1111-1111-111111111111';
const TEST_PLACEMENTS_LIST = '22222222-2222-2222-2222-222222222222';

const fetchContentMock = vi.mocked(fetchFoleonContent);
const fetchPlacementsMock = vi.mocked(fetchFoleonPlacements);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('HighlightsPage preview fallback', () => {
  it('renders preview layout only after configured service calls succeed with no records', async () => {
    arrangeServices({ placements: [], content: [] });
    const handlers = renderHighlights();

    expect(await screen.findByText(/Preview: Marketing highlights/i)).toBeTruthy();
    expect(screen.getByText(/sample content structure/i)).toBeTruthy();
    expect(screen.getByTestId('foleon-preview-feature-card')).toBeTruthy();
    expect(screen.getAllByTestId('foleon-preview-compact-card')).toHaveLength(3);
    expect(handlers.onOpenReader).not.toHaveBeenCalled();
    expect(handlers.onOpenExternal).not.toHaveBeenCalled();
    expect(handlers.onCardImpression).not.toHaveBeenCalled();
  });

  it('renders live content instead of preview when content records exist', async () => {
    const liveRecord = makeContentRecord({ title: 'Live Foleon highlight' });
    arrangeServices({ placements: [], content: [liveRecord] });
    const handlers = renderHighlights();

    expect(await screen.findByText('Live Foleon highlight')).toBeTruthy();
    expect(screen.queryByText(/Preview: Marketing highlights/i)).toBeNull();
    expect(screen.getByRole('button', { name: /^Read$/i })).toBeTruthy();
    expect(handlers.onCardImpression).toHaveBeenCalledWith([liveRecord]);
  });

  it('renders placement-resolved live content instead of preview', async () => {
    const placedRecord = makeContentRecord({ id: 10, foleonDocId: 9900, title: 'Placed live highlight' });
    arrangeServices({
      placements: [makePlacementRecord({ contentIdCache: placedRecord.foleonDocId })],
      content: [placedRecord],
    });
    const handlers = renderHighlights();

    expect(await screen.findByText('Placed live highlight')).toBeTruthy();
    expect(screen.queryByText(/Preview: Marketing highlights/i)).toBeNull();
    expect(handlers.onCardImpression).toHaveBeenCalledWith([placedRecord]);
  });

  it('renders configuration errors instead of preview fallback', async () => {
    renderHighlights({
      contract: makeContract({ listIds: { contentRegistry: TEST_CONTENT_LIST, placements: null, events: null } }),
    });

    expect((await screen.findByRole('alert')).textContent).toContain('Foleon list configuration is incomplete.');
    expect(screen.queryByText(/Preview: Marketing highlights/i)).toBeNull();
    expect(fetchContentMock).not.toHaveBeenCalled();
    expect(fetchPlacementsMock).not.toHaveBeenCalled();
  });

  it('renders fetch errors instead of preview fallback', async () => {
    fetchPlacementsMock.mockResolvedValue([]);
    fetchContentMock.mockRejectedValue(new Error('content fetch failed'));

    renderHighlights();

    expect((await screen.findByRole('alert')).textContent).toContain('content fetch failed');
    expect(screen.queryByText(/Preview: Marketing highlights/i)).toBeNull();
  });

  it('does not expose preview placeholders as live open actions', async () => {
    arrangeServices({ placements: [], content: [] });
    const handlers = renderHighlights();

    expect(await screen.findByText(/Preview: Marketing highlights/i)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /^Read$/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Open externally/i })).toBeNull();
    expect(document.querySelector('a')).toBeNull();
    expect(document.querySelector('iframe')).toBeNull();
    expect(handlers.onOpenReader).not.toHaveBeenCalled();
    expect(handlers.onOpenExternal).not.toHaveBeenCalled();
    expect(handlers.onCardImpression).not.toHaveBeenCalled();
  });
});

function arrangeServices(args: {
  readonly placements: ReadonlyArray<FoleonPlacementRecord>;
  readonly content: ReadonlyArray<FoleonContentRecord>;
}): void {
  fetchPlacementsMock.mockResolvedValue([...args.placements]);
  fetchContentMock.mockResolvedValue([...args.content]);
}

function renderHighlights(args: {
  readonly contract?: IFoleonRuntimeContract;
} = {}): {
  readonly onOpenReader: ReturnType<typeof vi.fn>;
  readonly onOpenExternal: ReturnType<typeof vi.fn>;
  readonly onCardImpression: ReturnType<typeof vi.fn>;
} {
  const handlers = {
    onOpenReader: vi.fn(),
    onOpenExternal: vi.fn(),
    onCardImpression: vi.fn(),
  };
  render(
    <HighlightsPage
      contract={args.contract ?? makeContract()}
      onOpenReader={handlers.onOpenReader}
      onOpenExternal={handlers.onOpenExternal}
      onCardImpression={handlers.onCardImpression}
    />,
  );
  return handlers;
}

function makeContract(overrides: Partial<IFoleonRuntimeContract> = {}): IFoleonRuntimeContract {
  return {
    hostMode: 'sharepoint',
    route: 'highlights',
    docId: null,
    siteUrl: TEST_SITE,
    listIds: { contentRegistry: TEST_CONTENT_LIST, placements: TEST_PLACEMENTS_LIST, events: null },
    originPolicy: createFoleonOriginPolicy(),
    governed: {
      expectedManifestId: FOLEON_WEBPART_ID,
      expectedPackageVersion: FOLEON_PACKAGE_VERSION,
      manifestIdMatchesExpected: true,
      packageVersionMatchesExpected: true,
    },
    readerRoutePath: null,
    apiBaseUrl: null,
    apiResource: null,
    telemetry: { correlationId: 'corr-test', sessionId: 'sess-test' },
    canInitialize: true,
    issues: [],
    blockingReasons: [],
    ...overrides,
  };
}

function makeContentRecord(overrides: Partial<FoleonContentRecord> = {}): FoleonContentRecord {
  return {
    id: 1,
    title: 'Live highlight',
    foleonDocId: 12345,
    contentTypeKey: 'Project Highlight',
    publishStatus: 'Published',
    isVisible: true,
    isFeatured: true,
    isHomepageEligible: true,
    summary: 'Live Foleon publication summary.',
    publishedOn: '2026-04-25T12:00:00.000Z',
    openMode: 'Inline Reader',
    allowEmbed: true,
    requiresExternalOpen: false,
    syncSource: 'Manual',
    ...overrides,
  };
}

function makePlacementRecord(overrides: Partial<FoleonPlacementRecord> = {}): FoleonPlacementRecord {
  return {
    id: 1,
    title: 'Hero placement',
    placementKey: 'Hero',
    isActive: true,
    sortRank: 1,
    ...overrides,
  };
}
