import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FoleonEmbeddedReaderLane } from '../../FoleonEmbeddedReaderLane.js';
import type { IFoleonRuntimeContract } from '../../runtime/embeddedRuntimeContract.js';
import type { FoleonContentRecord } from '../../types/foleon-content.types.js';
import { createFoleonOriginPolicy } from '../../services/FoleonOriginPolicy.js';
import { resolveFoleonReaderContent } from '../../services/FoleonReaderContentService.js';
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
      expectedManifestId: '2160edb3-675e-4451-92bb-8345f9d1c71e',
      expectedPackageVersion: '1.0.20.0',
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
  const tone = config.readerKey === 'project-spotlight'
    ? 'spotlight'
    : config.readerKey === 'company-pulse'
      ? 'pulse'
      : 'leadership';
  const pageContext = config.readerKey === 'project-spotlight'
    ? 'Project Spotlight'
    : config.readerKey === 'company-pulse'
      ? 'Company Pulse'
      : 'Leadership Message';
  const view = render(
    <FoleonReaderModule
      contract={makeContract()}
      config={config}
      tone={tone}
      pageContext={pageContext}
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

  it('renders Project Spotlight preview with original-style structure and no fake live controls', async () => {
    resolveMock.mockResolvedValue({
      kind: 'preview',
      config: FOLEON_READER_CONFIGS.projectSpotlight,
      reason: 'no-active-record',
      warnings: [],
    });
    const { callbacks, container } = renderModule();

    expect(await screen.findByText('Project Spotlight reader')).toBeTruthy();
    expect(screen.getByText('Preview layout')).toBeTruthy();
    expect(screen.getByLabelText('Project Spotlight feature placeholder')).toBeTruthy();
    expect(screen.getByLabelText('Project Spotlight supporting preview placeholders')).toBeTruthy();
    expect(screen.getByLabelText('Preview metadata zones')).toBeTruthy();
    expect(screen.getByLabelText('Preview status')).toBeTruthy();
    expect(screen.getByText('Content coming soon')).toBeTruthy();
    expect(container.querySelector('[data-preview-tone="blue"]')).not.toBeNull();
    expect(document.querySelectorAll('iframe')).toHaveLength(0);
    expect(container.querySelectorAll('a')).toHaveLength(0);
    expect(screen.queryByRole('button', { name: /read|open|archive/i })).toBeNull();
    expect(container.querySelector('[disabled], [aria-disabled="true"]')).toBeNull();
    expect(container.textContent).not.toContain('viewer.us.foleon.com');
    expect(callbacks.onReaderOpen).not.toHaveBeenCalled();
    expect(callbacks.onReaderClose).not.toHaveBeenCalled();
    expect(callbacks.onEmbedError).not.toHaveBeenCalled();
    expect(callbacks.onGateBlocked).not.toHaveBeenCalled();
    expect(callbacks.onOpenArchive).not.toHaveBeenCalled();
  });

  it('renders Company Pulse preview with orange tone and complete placeholder zones', async () => {
    resolveMock.mockResolvedValue({
      kind: 'preview',
      config: FOLEON_READER_CONFIGS.companyPulse,
      reason: 'no-active-record',
      warnings: [],
    });
    const { callbacks, container } = renderModule({ config: FOLEON_READER_CONFIGS.companyPulse });

    expect(await screen.findByText('Company Pulse reader')).toBeTruthy();
    expect(screen.getByText('Preview layout')).toBeTruthy();
    expect(screen.getByLabelText('Company Pulse feature placeholder')).toBeTruthy();
    expect(screen.getByLabelText('Company Pulse supporting preview placeholders')).toBeTruthy();
    expect(screen.getByLabelText('Preview metadata zones')).toBeTruthy();
    expect(screen.getByText('Content coming soon')).toBeTruthy();
    expect(container.querySelector('[data-preview-tone="orange"]')).not.toBeNull();
    expect(document.querySelectorAll('iframe')).toHaveLength(0);
    expect(container.querySelectorAll('a')).toHaveLength(0);
    expect(screen.queryByRole('button', { name: /read|open|archive/i })).toBeNull();
    expect(callbacks.onReaderOpen).not.toHaveBeenCalled();
    expect(callbacks.onOpenArchive).not.toHaveBeenCalled();
  });

  it('renders Leadership Message preview with executive tone and content-coming-soon composition', async () => {
    resolveMock.mockResolvedValue({
      kind: 'preview',
      config: FOLEON_READER_CONFIGS.leadershipMessage,
      reason: 'no-active-record',
      warnings: [],
    });
    const { callbacks, container } = renderModule({ config: FOLEON_READER_CONFIGS.leadershipMessage });

    expect(FOLEON_READER_CONFIGS.leadershipMessage).toMatchObject({
      readerKey: 'leadership-message',
      contentTypeKey: 'Leadership',
      placementKey: 'Leadership Message Active',
    });
    expect(await screen.findByText('Leadership Message reader')).toBeTruthy();
    expect(screen.getByText('Preview layout')).toBeTruthy();
    expect(screen.getByLabelText('Leadership Message feature placeholder')).toBeTruthy();
    expect(screen.getByLabelText('Leadership Message supporting preview placeholders')).toBeTruthy();
    expect(screen.getByLabelText('Preview metadata zones')).toBeTruthy();
    expect(screen.getByText('Content coming soon')).toBeTruthy();
    expect(screen.getByText('Executive message edition placeholder')).toBeTruthy();
    expect(container.querySelector('[data-preview-tone="navy"]')).not.toBeNull();
    expect(document.querySelectorAll('iframe')).toHaveLength(0);
    expect(container.querySelectorAll('a')).toHaveLength(0);
    expect(screen.queryByRole('button', { name: /read|open|archive/i })).toBeNull();
    expect(callbacks.onReaderOpen).not.toHaveBeenCalled();
    expect(callbacks.onOpenArchive).not.toHaveBeenCalled();
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

  it('uses Leadership Message config and page context for ready reader events', async () => {
    const record = makeRecord({
      title: 'Quarterly Leadership Note',
      contentTypeKey: 'Leadership',
      readerKey: 'leadership-message',
      embedUrl: 'https://viewer.us.foleon.com/embed/leadership',
      publishedUrl: 'https://viewer.us.foleon.com/published/leadership',
    });
    resolveMock.mockResolvedValue({
      kind: 'ready',
      config: FOLEON_READER_CONFIGS.leadershipMessage,
      record,
      embedUrl: record.embedUrl!,
      warnings: [],
    });
    const { callbacks } = renderModule({ config: FOLEON_READER_CONFIGS.leadershipMessage });

    expect(resolveMock).toHaveBeenCalledWith(
      expect.objectContaining({
        config: expect.objectContaining({
          readerKey: 'leadership-message',
          contentTypeKey: 'Leadership',
          placementKey: 'Leadership Message Active',
        }),
      }),
    );
    const iframe = await screen.findByTitle('Leadership Message: Quarterly Leadership Note');
    fireEvent.load(iframe);
    expect(callbacks.onReaderOpen).toHaveBeenCalledWith(record, 'ok', 'Leadership Message');
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

  it('reports reader status transitions without emitting preview telemetry', async () => {
    resolveMock.mockResolvedValue({
      kind: 'preview',
      config: FOLEON_READER_CONFIGS.projectSpotlight,
      reason: 'no-active-record',
      warnings: [],
    });
    installMatchMedia(false);
    const onStatusChange = vi.fn();
    const callbacks = {
      onOpenArchive: vi.fn(),
      onReaderOpen: vi.fn(),
      onReaderClose: vi.fn(),
      onEmbedError: vi.fn(),
      onGateBlocked: vi.fn(),
    };

    render(
      <FoleonReaderModule
        contract={makeContract()}
        config={FOLEON_READER_CONFIGS.projectSpotlight}
        tone="spotlight"
        pageContext="Project Spotlight"
        onStatusChange={onStatusChange}
        {...callbacks}
      />,
    );

    await screen.findByText('Project Spotlight reader');
    expect(onStatusChange).toHaveBeenCalledWith({ kind: 'loading' });
    expect(onStatusChange).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'preview' }),
    );
    expect(callbacks.onReaderOpen).not.toHaveBeenCalled();
    expect(callbacks.onReaderClose).not.toHaveBeenCalled();
    expect(callbacks.onEmbedError).not.toHaveBeenCalled();
    expect(callbacks.onGateBlocked).not.toHaveBeenCalled();
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

  it('renders all three embedded reader lanes in one React tree without Foleon globals or shared roots', async () => {
    resolveMock.mockImplementation(async (params) => ({
      kind: 'preview',
      config: params.config,
      reason: 'no-active-record',
      warnings: [],
    }));
    installMatchMedia(false);
    const callbacks = {
      onOpenArchive: vi.fn(),
      onReaderOpen: vi.fn(),
      onReaderClose: vi.fn(),
      onEmbedError: vi.fn(),
      onGateBlocked: vi.fn(),
    };

    render(
      <>
        <FoleonEmbeddedReaderLane
          contract={makeContract()}
          lane="projectSpotlight"
          {...callbacks}
        />
        <FoleonEmbeddedReaderLane
          contract={{ ...makeContract(), route: 'companyPulse' }}
          lane="companyPulse"
          {...callbacks}
        />
        <FoleonEmbeddedReaderLane
          contract={{ ...makeContract(), route: 'leadershipMessage' }}
          lane="leadershipMessage"
          {...callbacks}
        />
      </>,
    );

    expect(await screen.findByText('Project Spotlight reader')).toBeTruthy();
    expect(await screen.findByText('Company Pulse reader')).toBeTruthy();
    expect(await screen.findByText('Leadership Message reader')).toBeTruthy();
    expect(resolveMock).toHaveBeenCalledTimes(3);
    expect(document.querySelector('[data-preview-tone="blue"]')).not.toBeNull();
    expect(document.querySelector('[data-preview-tone="orange"]')).not.toBeNull();
    expect(document.querySelector('[data-preview-tone="navy"]')).not.toBeNull();
    expect(document.querySelectorAll('[data-foleon-preview-route]')).toHaveLength(3);
    expect(document.querySelectorAll('iframe')).toHaveLength(0);
    expect((window as typeof window & { __hbIntel_foleon?: unknown }).__hbIntel_foleon).toBeUndefined();
  });

  it('keeps the shared package independent of standalone app globals and roots', () => {
    const source = readPackageSource(resolve(__dirname, '../..'));

    expect(source).not.toContain('apps/hb-intel-foleon');
    expect(source).not.toContain('__hbIntel_foleon');
    expect(source).not.toContain('createRoot(');
  });
});

function readPackageSource(directory: string): string {
  return readdirSync(directory)
    .flatMap((entry) => {
      const path = join(directory, entry);
      const stats = statSync(path);
      if (stats.isDirectory()) {
        return entry === '__tests__' ? [] : [readPackageSource(path)];
      }
      return /\.(ts|tsx|css)$/.test(entry) ? [readFileSync(path, 'utf8')] : [];
    })
    .join('\n');
}
