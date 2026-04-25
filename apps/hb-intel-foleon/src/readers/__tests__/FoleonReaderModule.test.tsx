import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { IFoleonRuntimeContract } from '../../runtime/foleonRuntimeContract.js';
import type { FoleonContentRecord } from '../../types/foleon-content.types.js';
import { createFoleonOriginPolicy } from '../../services/FoleonOriginPolicy.js';
import { resolveFoleonReaderContent } from '../../services/FoleonReaderContentService.js';
import { FOLEON_PACKAGE_VERSION, FOLEON_WEBPART_ID } from '../../webparts/foleon/runtimeContract.js';
import {
  FOLEON_READER_CONFIGS,
  type FoleonReaderModuleConfig,
} from '../readerConfigs.js';
import { FoleonReaderModule } from '../FoleonReaderModule.js';

vi.mock('../../services/FoleonReaderContentService.js', () => ({
  resolveFoleonReaderContent: vi.fn(),
}));

const resolveMock = vi.mocked(resolveFoleonReaderContent);

function makeRecord(overrides: Partial<FoleonContentRecord> = {}): FoleonContentRecord {
  return {
    id: 1,
    title: 'The Seaglass Residence',
    foleonDocId: 1001,
    contentTypeKey: 'Project Spotlight',
    readerKey: 'project-spotlight',
    publishStatus: 'Published',
    isVisible: true,
    isFeatured: true,
    isHomepageEligible: true,
    publishedUrl: 'https://viewer.us.foleon.com/published/project',
    embedUrl: 'https://viewer.us.foleon.com/embed/project',
    summary: 'A coastal project profile for HB Central readers.',
    issueDate: '2026-04-01T00:00:00.000Z',
    publishedOn: '2026-04-20T00:00:00.000Z',
    archiveGroup: '2026-04',
    activeEdition: true,
    primaryAudience: 'Companywide',
    openMode: 'Inline Reader',
    allowEmbed: true,
    requiresExternalOpen: false,
    syncSource: 'Manual',
    ...overrides,
  };
}

function makeContract(): IFoleonRuntimeContract {
  return {
    hostMode: 'sharepoint',
    route: 'projectSpotlight',
    docId: null,
    siteUrl: 'https://tenant.sharepoint.com/sites/HBCentral',
    listIds: {
      contentRegistry: '11111111-1111-1111-1111-111111111111',
      placements: '22222222-2222-2222-2222-222222222222',
      events: null,
    },
    originPolicy: createFoleonOriginPolicy(['https://viewer.us.foleon.com']),
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
  };
}

function renderModule(overrides: {
  readonly mobile?: boolean;
  readonly config?: FoleonReaderModuleConfig;
} = {}) {
  installMatchMedia(overrides.mobile === true);
  const callbacks = {
    onOpenArchive: vi.fn(),
    onReaderOpen: vi.fn(),
    onReaderClose: vi.fn(),
    onEmbedError: vi.fn(),
    onGateBlocked: vi.fn(),
  };
  const config = overrides.config ?? FOLEON_READER_CONFIGS.projectSpotlight;
  const view = render(
    <FoleonReaderModule
      contract={makeContract()}
      config={config}
      tone={config.readerKey === 'project-spotlight' ? 'spotlight' : 'pulse'}
      pageContext={config.readerKey === 'project-spotlight' ? 'Project Spotlight' : 'Company Pulse'}
      {...callbacks}
    />,
  );
  return { ...view, callbacks };
}

function installMatchMedia(matches: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}

describe('FoleonReaderModule', () => {
  beforeEach(() => {
    resolveMock.mockReset();
    installMatchMedia(false);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders Project Spotlight preview without iframe or production content telemetry', async () => {
    resolveMock.mockResolvedValue({
      kind: 'preview',
      config: FOLEON_READER_CONFIGS.projectSpotlight,
      reason: 'no-active-record',
      warnings: [],
    });
    const { callbacks } = renderModule();

    expect(await screen.findByText('Project Spotlight reader')).toBeTruthy();
    expect(document.querySelectorAll('iframe')).toHaveLength(0);
    expect(callbacks.onReaderOpen).not.toHaveBeenCalled();
    expect(callbacks.onGateBlocked).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Open full archive' }));
    expect(callbacks.onOpenArchive).toHaveBeenCalledTimes(1);
  });

  it('renders Company Pulse preview shape', async () => {
    resolveMock.mockResolvedValue({
      kind: 'preview',
      config: FOLEON_READER_CONFIGS.companyPulse,
      reason: 'no-active-record',
      warnings: [],
    });
    renderModule({ config: FOLEON_READER_CONFIGS.companyPulse });

    expect(await screen.findByText('Company Pulse reader')).toBeTruthy();
    expect(document.querySelectorAll('iframe')).toHaveLength(0);
  });

  it('mounts the iframe for a ready desktop record and emits open on load', async () => {
    const record = makeRecord();
    resolveMock.mockResolvedValue({
      kind: 'ready',
      config: FOLEON_READER_CONFIGS.projectSpotlight,
      record,
      embedUrl: record.embedUrl!,
      warnings: [],
    });
    const { callbacks, unmount } = renderModule();

    const iframe = await screen.findByTitle('Project Spotlight: The Seaglass Residence');
    fireEvent.load(iframe);
    fireEvent.load(iframe);
    expect(callbacks.onReaderOpen).toHaveBeenCalledTimes(1);
    expect(callbacks.onReaderOpen).toHaveBeenCalledWith(record, 'ok', 'Project Spotlight');

    unmount();
    expect(callbacks.onReaderClose).toHaveBeenCalledTimes(1);
  });

  it('renders blocked real records without an iframe', async () => {
    const record = makeRecord({ allowEmbed: false });
    resolveMock.mockResolvedValue({
      kind: 'blocked',
      config: FOLEON_READER_CONFIGS.projectSpotlight,
      record,
      reason: 'embed-disallowed',
      warnings: [],
    });
    const { callbacks } = renderModule();

    expect((await screen.findByRole('alert')).textContent).toContain('blocked by embed-disallowed');
    expect(document.querySelectorAll('iframe')).toHaveLength(0);
    await waitFor(() => expect(callbacks.onGateBlocked).toHaveBeenCalledWith('embed-disallowed', 'Project Spotlight'));
  });

  it('keeps mobile readers collapsed until user activation', async () => {
    const record = makeRecord();
    resolveMock.mockResolvedValue({
      kind: 'ready',
      config: FOLEON_READER_CONFIGS.projectSpotlight,
      record,
      embedUrl: record.embedUrl!,
      warnings: [],
    });
    const { callbacks } = renderModule({ mobile: true });

    expect(await screen.findByText('Reader ready')).toBeTruthy();
    expect(document.querySelectorAll('iframe')).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: 'Open reader' }));
    const iframe = await screen.findByTitle('Project Spotlight: The Seaglass Residence');
    fireEvent.load(iframe);
    expect(callbacks.onReaderOpen).toHaveBeenCalledTimes(1);
  });
});
