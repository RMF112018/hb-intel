import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ContentHubPage } from '../ContentHubPage.js';
import { fetchFoleonContent } from '../../services/FoleonContentService.js';
import { createFoleonOriginPolicy } from '../../services/FoleonOriginPolicy.js';
import type { IFoleonRuntimeContract } from '../../runtime/foleonRuntimeContract.js';
import type { FoleonContentRecord } from '../../types/foleon-content.types.js';
import { FOLEON_PACKAGE_VERSION, FOLEON_WEBPART_ID } from '../../webparts/foleon/runtimeContract.js';

vi.mock('../../services/FoleonContentService.js', () => ({ fetchFoleonContent: vi.fn() }));

const TEST_SITE = 'https://tenant.sharepoint.com/sites/HBCentral';
const TEST_CONTENT_LIST = '11111111-1111-1111-1111-111111111111';

const fetchContentMock = vi.mocked(fetchFoleonContent);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe('ContentHubPage preview fallback', () => {
  it('renders Hub preview fallback for configured successful empty registry reads', async () => {
    fetchContentMock.mockResolvedValue([]);
    const handlers = renderHub();

    expect(await screen.findByText(/Preview: All publications/i)).toBeTruthy();
    expect(screen.getByText(/Preview archive layout/i)).toBeTruthy();
    expect(screen.getByLabelText('Preview archive search and filter cues')).toBeTruthy();
    expect(screen.queryByText('No publications match your filters.')).toBeNull();
    expect(handlers.onOpenReader).not.toHaveBeenCalled();
    expect(handlers.onOpenExternal).not.toHaveBeenCalled();
    expect(handlers.onSearch).not.toHaveBeenCalled();
  });

  it('does not emit live search telemetry for empty registry preview input', async () => {
    fetchContentMock.mockResolvedValue([]);
    const handlers = renderHub();

    expect(await screen.findByText(/Preview: All publications/i)).toBeTruthy();
    vi.useFakeTimers();
    const input = screen.getByLabelText('Search title, summary, project') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'pipeline' } });
    act(() => vi.advanceTimersByTime(250));

    expect(input.value).toBe('pipeline');
    expect(handlers.onSearch).not.toHaveBeenCalled();
  });

  it('renders live archive cards instead of preview when records exist', async () => {
    const liveRecord = makeContentRecord({ title: 'Live archive publication' });
    fetchContentMock.mockResolvedValue([liveRecord]);
    const handlers = renderHub();

    expect(await screen.findByText('Live archive publication')).toBeTruthy();
    expect(screen.queryByText(/Preview: All publications/i)).toBeNull();
    expect(screen.getByRole('button', { name: /^Read$/i })).toBeTruthy();
    expect(handlers.onSearch).not.toHaveBeenCalled();
  });

  it('continues to emit search telemetry for live registry records', async () => {
    fetchContentMock.mockResolvedValue([makeContentRecord({ title: 'Quarterly market outlook' })]);
    const handlers = renderHub();

    expect(await screen.findByText('Quarterly market outlook')).toBeTruthy();
    vi.useFakeTimers();
    fireEvent.change(screen.getByLabelText('Search title, summary, project'), {
      target: { value: 'market' },
    });
    act(() => vi.advanceTimersByTime(250));

    expect(handlers.onSearch).toHaveBeenCalledWith('market');
  });

  it('keeps filter-specific empty state for live records with a search miss', async () => {
    fetchContentMock.mockResolvedValue([makeContentRecord({ title: 'Quarterly market outlook' })]);
    renderHub();

    expect(await screen.findByText('Quarterly market outlook')).toBeTruthy();
    vi.useFakeTimers();
    fireEvent.change(screen.getByLabelText('Search title, summary, project'), {
      target: { value: 'does-not-match' },
    });
    act(() => vi.advanceTimersByTime(250));

    expect(screen.getByText('No publications match your filters.')).toBeTruthy();
    expect(screen.queryByText(/Preview: All publications/i)).toBeNull();
  });

  it('keeps filter-specific empty state for live records with a type miss', async () => {
    fetchContentMock.mockResolvedValue([
      makeContentRecord({ title: 'Newsletter archive item', contentTypeKey: 'Newsletter' }),
    ]);
    renderHub();

    expect(await screen.findByText('Newsletter archive item')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Leadership' }));

    expect(screen.getByText('No publications match your filters.')).toBeTruthy();
    expect(screen.queryByText(/Preview: All publications/i)).toBeNull();
  });

  it('renders fetch errors instead of preview fallback', async () => {
    fetchContentMock.mockRejectedValue(new Error('archive fetch failed'));
    renderHub();

    expect((await screen.findByRole('alert')).textContent).toContain('archive fetch failed');
    expect(screen.queryByText(/Preview: All publications/i)).toBeNull();
  });

  it('renders configuration errors instead of preview fallback', async () => {
    renderHub({ contract: makeContract({ listIds: { contentRegistry: null, placements: null, events: null } }) });

    expect((await screen.findByRole('alert')).textContent).toContain('Foleon content hub configuration is incomplete.');
    expect(screen.queryByText(/Preview: All publications/i)).toBeNull();
    expect(fetchContentMock).not.toHaveBeenCalled();
  });

  it('keeps live card open behavior on the live record path', async () => {
    const liveRecord = makeContentRecord({
      title: 'Openable archive publication',
      publishedUrl: 'https://viewer.us.foleon.com/published/live/',
    });
    fetchContentMock.mockResolvedValue([liveRecord]);
    const handlers = renderHub();

    expect(await screen.findByText('Openable archive publication')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /^Read$/i }));
    fireEvent.click(screen.getByRole('button', { name: /Open externally/i }));

    expect(handlers.onOpenReader).toHaveBeenCalledWith(liveRecord);
    expect(handlers.onOpenExternal).toHaveBeenCalledWith(liveRecord);
  });
});

function renderHub(args: {
  readonly contract?: IFoleonRuntimeContract;
} = {}): {
  readonly onOpenReader: ReturnType<typeof vi.fn>;
  readonly onOpenExternal: ReturnType<typeof vi.fn>;
  readonly onSearch: ReturnType<typeof vi.fn>;
} {
  const handlers = {
    onOpenReader: vi.fn(),
    onOpenExternal: vi.fn(),
    onSearch: vi.fn(),
  };
  render(
    <ContentHubPage
      contract={args.contract ?? makeContract()}
      onOpenReader={handlers.onOpenReader}
      onOpenExternal={handlers.onOpenExternal}
      onSearch={handlers.onSearch}
      onBack={vi.fn()}
    />,
  );
  return handlers;
}

function makeContract(overrides: Partial<IFoleonRuntimeContract> = {}): IFoleonRuntimeContract {
  return {
    hostMode: 'sharepoint',
    route: 'hub',
    docId: null,
    siteUrl: TEST_SITE,
    listIds: { contentRegistry: TEST_CONTENT_LIST, placements: null, events: null },
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
    title: 'Live archive item',
    foleonDocId: 12345,
    contentTypeKey: 'Project Highlight',
    publishStatus: 'Published',
    isVisible: true,
    isFeatured: false,
    isHomepageEligible: true,
    summary: 'Live Foleon archive summary.',
    publishedOn: '2026-04-25T12:00:00.000Z',
    relatedProjectName: 'Live project',
    openMode: 'Inline Reader',
    allowEmbed: true,
    requiresExternalOpen: false,
    syncSource: 'Manual',
    ...overrides,
  };
}
