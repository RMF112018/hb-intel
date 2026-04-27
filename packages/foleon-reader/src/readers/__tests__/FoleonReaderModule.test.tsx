import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
    onViewerOpen: vi.fn(),
    onViewerClose: vi.fn(),
    onViewerIframeLoaded: vi.fn(),
    onViewerIframeError: vi.fn(),
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

  it('renders Project Spotlight preview through the lane-owned feature layout, not the legacy compatibility shell', async () => {
    resolveMock.mockResolvedValue({
      kind: 'preview',
      config: FOLEON_READER_CONFIGS.projectSpotlight,
      reason: 'no-active-record',
      warnings: [],
    });
    const { callbacks, container } = renderModule();

    // Phase-04 Wave-01 Prompt-03: Project Spotlight identity is layout-key
    // driven via `data-foleon-reader-layout` and `data-foleon-layout`.
    // Tone-based markers (`data-preview-tone`) are intentionally not
    // emitted by this lane's new feature layout.
    await waitFor(() => {
      expect(
        document.querySelector('[data-foleon-reader-layout="project-spotlight"]'),
      ).not.toBeNull();
    });
    const wrapper = document.querySelector('[data-foleon-reader-layout="project-spotlight"]');
    expect(wrapper).toBeTruthy();
    expect(container.querySelector('[data-foleon-reader-layout="project-spotlight"]')).not.toBeNull();
    expect(container.querySelector('[data-foleon-layout="project-spotlight-feature"]')).not.toBeNull();
    expect(container.querySelector('[data-foleon-reader-state="preview"]')).not.toBeNull();
    expect(container.querySelector('[data-preview-tone]')).toBeNull();

    // Honest preview labeling preserved (PS-02 employee-facing copy).
    expect(screen.getByText('Preview')).toBeTruthy();

    // The new layout no longer renders the legacy three-card support skeleton.
    expect(screen.queryByLabelText('Project Spotlight supporting preview placeholders')).toBeNull();
    expect(screen.queryByLabelText('Preview metadata zones')).toBeNull();
    expect(screen.queryByLabelText('Preview status')).toBeNull();

    // No live reader telemetry, no iframe, no production callbacks fired.
    expect(document.querySelectorAll('iframe')).toHaveLength(0);
    expect(container.querySelectorAll('a')).toHaveLength(0);
    expect(container.textContent).not.toContain('viewer.us.foleon.com');
    expect(callbacks.onReaderOpen).not.toHaveBeenCalled();
    expect(callbacks.onReaderClose).not.toHaveBeenCalled();
    expect(callbacks.onEmbedError).not.toHaveBeenCalled();
    expect(callbacks.onGateBlocked).not.toHaveBeenCalled();
    expect(callbacks.onOpenArchive).not.toHaveBeenCalled();
  });

  it('renders Company Pulse preview through the lane-owned briefing layout, not the legacy compatibility shell', async () => {
    resolveMock.mockResolvedValue({
      kind: 'preview',
      config: FOLEON_READER_CONFIGS.companyPulse,
      reason: 'no-active-record',
      warnings: [],
    });
    const { callbacks, container } = renderModule({ config: FOLEON_READER_CONFIGS.companyPulse });

    // Phase-04 Wave-01 Prompt-04: Company Pulse identity is layout-key
    // driven. Tone-based markers are intentionally not emitted by this
    // lane's new briefing layout.
    await screen.findByLabelText('Company Pulse coverage');
    expect(container.querySelector('[data-foleon-reader-layout="company-pulse"]')).not.toBeNull();
    expect(container.querySelector('[data-foleon-layout="company-pulse-edition-launcher"]')).not.toBeNull();
    expect(container.querySelector('[data-foleon-reader-state="preview"]')).not.toBeNull();
    expect(container.querySelector('[data-preview-tone]')).toBeNull();
    expect(container.querySelector('[data-foleon-preview-route]')).toBeNull();

    // Honest preview labeling preserved.
    expect(screen.getByText('Preview')).toBeTruthy();

    // The new briefing layout no longer renders the legacy three-card support skeleton.
    expect(screen.queryByLabelText('Company Pulse supporting preview placeholders')).toBeNull();
    expect(screen.queryByLabelText('Preview metadata zones')).toBeNull();
    expect(screen.queryByLabelText('Preview status')).toBeNull();

    // No live reader telemetry, no iframe, no production callbacks fired.
    expect(document.querySelectorAll('iframe')).toHaveLength(0);
    expect(container.querySelectorAll('a')).toHaveLength(0);
    expect(container.textContent).not.toContain('viewer.us.foleon.com');
    expect(callbacks.onReaderOpen).not.toHaveBeenCalled();
    expect(callbacks.onReaderClose).not.toHaveBeenCalled();
    expect(callbacks.onEmbedError).not.toHaveBeenCalled();
    expect(callbacks.onGateBlocked).not.toHaveBeenCalled();
    expect(callbacks.onOpenArchive).not.toHaveBeenCalled();
  });

  it('renders Leadership Message preview through the lane-owned executive layout, not the legacy compatibility shell', async () => {
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

    // Phase-04 Wave-01 Prompt-05: Leadership identity is layout-key driven.
    // Tone-based markers are intentionally not emitted by this lane's new
    // executive layout.
    await screen.findByText('Preview layout');
    expect(container.querySelector('[data-foleon-reader-layout="leadership-message"]')).not.toBeNull();
    expect(container.querySelector('[data-foleon-layout="leadership-message"]')).not.toBeNull();
    expect(container.querySelector('[data-foleon-reader-state="preview"]')).not.toBeNull();
    expect(container.querySelector('[data-preview-tone]')).toBeNull();
    expect(container.querySelector('[data-foleon-preview-route]')).toBeNull();

    // The new executive layout no longer renders the legacy three-card support skeleton.
    expect(screen.queryByLabelText('Leadership Message supporting preview placeholders')).toBeNull();
    expect(screen.queryByLabelText('Preview metadata zones')).toBeNull();
    expect(screen.queryByLabelText('Preview status')).toBeNull();

    // No live reader telemetry, no iframe, no production callbacks fired.
    expect(document.querySelectorAll('iframe')).toHaveLength(0);
    expect(container.querySelectorAll('a')).toHaveLength(0);
    expect(container.textContent).not.toContain('viewer.us.foleon.com');
    expect(callbacks.onReaderOpen).not.toHaveBeenCalled();
    expect(callbacks.onReaderClose).not.toHaveBeenCalled();
    expect(callbacks.onEmbedError).not.toHaveBeenCalled();
    expect(callbacks.onGateBlocked).not.toHaveBeenCalled();
    expect(callbacks.onOpenArchive).not.toHaveBeenCalled();
  });

  it('Project Spotlight ready opens the full-window viewer when the article card is clicked, and emits viewer telemetry', async () => {
    const record = makeRecord();
    resolveMock.mockResolvedValue({
      kind: 'ready',
      config: FOLEON_READER_CONFIGS.projectSpotlight,
      record,
      embedUrl: record.embedUrl!,
      warnings: [],
    });
    const { callbacks, container } = renderModule();

    // Wait for the lane-owned layout to render.
    await waitFor(() => {
      expect(
        document.querySelector('[data-foleon-reader-layout="project-spotlight"]'),
      ).not.toBeNull();
    });

    // Phase-04 Wave-01 Prompt-04B: inline iframe is removed for this lane.
    expect(container.querySelectorAll('iframe')).toHaveLength(0);

    // The article card is the launch surface — clicking the title button
    // (or anywhere on the card via the stretched ::after pseudo-element)
    // opens the shared full-window viewer.
    const launch = within(
      container.querySelector('[data-foleon-article-card]') as HTMLElement,
    ).getByRole('button', { name: record.title });
    fireEvent.click(launch);

    // Viewer telemetry fires (distinct from inline iframe lifecycle).
    expect(callbacks.onViewerOpen).toHaveBeenCalledTimes(1);
    expect(callbacks.onReaderOpen).not.toHaveBeenCalled();

    // Viewer iframe mounts and emits onViewerIframeLoaded on load.
    const iframe = await screen.findByTitle(`${record.title} — Foleon viewer`);
    fireEvent.load(iframe);
    expect(callbacks.onViewerIframeLoaded).toHaveBeenCalledTimes(1);
  });

  it('Company Pulse ready opens the full-window viewer when the lead-update card is clicked, and emits viewer telemetry', async () => {
    const record = makeRecord({
      title: 'Companywide April Brief',
      contentTypeKey: 'Company Pulse',
      readerKey: 'company-pulse',
      embedUrl: 'https://viewer.us.foleon.com/embed/pulse',
      publishedUrl: 'https://viewer.us.foleon.com/published/pulse',
      lastEditorialUpdate: '2026-04-14T00:00:00.000Z',
    });
    resolveMock.mockResolvedValue({
      kind: 'ready',
      config: FOLEON_READER_CONFIGS.companyPulse,
      record,
      embedUrl: record.embedUrl!,
      warnings: [],
    });
    const { callbacks, container } = renderModule({ config: FOLEON_READER_CONFIGS.companyPulse });

    // Wait for the lane-owned briefing layout.
    await screen.findByLabelText('Company Pulse coverage');
    expect(container.querySelectorAll('iframe')).toHaveLength(0);

    const launch = within(
      container.querySelector('[data-foleon-article-card]') as HTMLElement,
    ).getByRole('button', { name: record.title });
    fireEvent.click(launch);

    // Viewer telemetry fires (distinct from inline iframe lifecycle).
    expect(callbacks.onViewerOpen).toHaveBeenCalledTimes(1);
    expect(callbacks.onReaderOpen).not.toHaveBeenCalled();

    // Viewer iframe mounts and emits onViewerIframeLoaded on load.
    const iframe = await screen.findByTitle(`${record.title} — Foleon viewer`);
    fireEvent.load(iframe);
    expect(callbacks.onViewerIframeLoaded).toHaveBeenCalledTimes(1);
  });

  it('Leadership Message preview now renders the lane-owned executive layout (Prompt 05 migration complete)', async () => {
    resolveMock.mockResolvedValue({
      kind: 'preview',
      config: FOLEON_READER_CONFIGS.leadershipMessage,
      reason: 'no-active-record',
      warnings: [],
    });
    const { container } = renderModule({ config: FOLEON_READER_CONFIGS.leadershipMessage });

    await screen.findByText('Preview layout');
    // Lane-owned layout markers present.
    expect(container.querySelector('[data-foleon-reader-layout="leadership-message"]')).not.toBeNull();
    expect(container.querySelector('[data-foleon-layout="leadership-message"]')).not.toBeNull();
    expect(container.querySelector('[data-foleon-article-card]')).not.toBeNull();
    // Legacy compatibility-shell markers gone.
    expect(container.querySelector('[data-preview-tone]')).toBeNull();
    expect(container.querySelector('[data-foleon-preview-route]')).toBeNull();
  });

  it('Leadership Message ready opens the full-window viewer when the executive card is clicked, and emits viewer telemetry', async () => {
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
    const { callbacks, container } = renderModule({ config: FOLEON_READER_CONFIGS.leadershipMessage });

    expect(resolveMock).toHaveBeenCalledWith(
      expect.objectContaining({
        config: expect.objectContaining({
          readerKey: 'leadership-message',
          contentTypeKey: 'Leadership',
          placementKey: 'Leadership Message Active',
        }),
      }),
    );

    // Phase-04 Wave-01 Prompt-05: Leadership now uses the lane-owned
    // executive layout + shared full-window viewer. No inline iframe.
    await screen.findByText('Quarterly Leadership Note');
    expect(container.querySelectorAll('iframe')).toHaveLength(0);

    const launch = within(
      container.querySelector('[data-foleon-article-card]') as HTMLElement,
    ).getByRole('button', { name: record.title });
    fireEvent.click(launch);

    // Viewer telemetry fires (distinct from inline iframe lifecycle).
    expect(callbacks.onViewerOpen).toHaveBeenCalledTimes(1);
    expect(callbacks.onReaderOpen).not.toHaveBeenCalled();

    // Viewer iframe mounts and emits onViewerIframeLoaded on load.
    const iframe = await screen.findByTitle(`${record.title} — Foleon viewer`);
    fireEvent.load(iframe);
    expect(callbacks.onViewerIframeLoaded).toHaveBeenCalledTimes(1);
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

    await screen.findByText("This Month's Project Spotlight");
    expect(onStatusChange).toHaveBeenCalledWith({ kind: 'loading' });
    expect(onStatusChange).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'preview' }),
    );
    expect(callbacks.onReaderOpen).not.toHaveBeenCalled();
    expect(callbacks.onReaderClose).not.toHaveBeenCalled();
    expect(callbacks.onEmbedError).not.toHaveBeenCalled();
    expect(callbacks.onGateBlocked).not.toHaveBeenCalled();
  });

  it('Project Spotlight ready on mobile mounts no inline iframe and opens the viewer when the article card is clicked', async () => {
    const record = makeRecord();
    resolveMock.mockResolvedValue({
      kind: 'ready',
      config: FOLEON_READER_CONFIGS.projectSpotlight,
      record,
      embedUrl: record.embedUrl!,
      warnings: [],
    });
    const { callbacks, container } = renderModule({ mobile: true });

    // Wait for the lane-owned layout (mobile breakpoint renders the same
    // article card; the legacy "Reader ready" inline-iframe gate is gone).
    await waitFor(() => {
      expect(
        document.querySelector('[data-foleon-reader-layout="project-spotlight"]'),
      ).not.toBeNull();
    });
    expect(document.querySelectorAll('iframe')).toHaveLength(0);
    expect(screen.queryByText('Reader ready')).toBeNull();

    const launch = within(
      container.querySelector('[data-foleon-article-card]') as HTMLElement,
    ).getByRole('button', { name: record.title });
    fireEvent.click(launch);

    expect(callbacks.onViewerOpen).toHaveBeenCalledTimes(1);
    const iframe = await screen.findByTitle(`${record.title} — Foleon viewer`);
    fireEvent.load(iframe);
    expect(callbacks.onViewerIframeLoaded).toHaveBeenCalledTimes(1);
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

    await waitFor(() => {
      expect(
        document.querySelector('[data-foleon-reader-layout="project-spotlight"]'),
      ).not.toBeNull();
    });
    await screen.findByLabelText('Company Pulse coverage');
    expect(await screen.findByText('Leadership Message reader')).toBeTruthy();
    expect(resolveMock).toHaveBeenCalledTimes(3);

    // Per-lane scoped assertions. Each lane wrapper is queried and tested
    // independently — no exact global counts, so future prompts can
    // migrate Leadership without churning this test.
    const spotlight = document.querySelector('[data-foleon-reader-layout="project-spotlight"]');
    const pulse = document.querySelector('[data-foleon-reader-layout="company-pulse"]');
    const leadership = document.querySelector('[data-foleon-reader-layout="leadership-message"]');
    expect(spotlight).not.toBeNull();
    expect(pulse).not.toBeNull();
    expect(leadership).not.toBeNull();

    // Project Spotlight: lane-owned feature layout, no legacy markers.
    // Wrapper carries both data-foleon-reader-layout and data-foleon-layout
    // on the same element, so check via getAttribute, not descendant query.
    expect(spotlight?.getAttribute('data-foleon-layout')).toBe('project-spotlight-feature');
    expect(spotlight?.querySelector('[data-preview-tone]')).toBeNull();
    expect(spotlight?.querySelector('[data-foleon-preview-route]')).toBeNull();

    // Company Pulse: lane-owned briefing layout, no legacy markers.
    expect(pulse?.getAttribute('data-foleon-layout')).toBe('company-pulse-edition-launcher');
    expect(pulse?.querySelector('[data-preview-tone]')).toBeNull();
    expect(pulse?.querySelector('[data-foleon-preview-route]')).toBeNull();

    // Leadership Message (Prompt-05): lane-owned executive layout, no legacy markers.
    expect(leadership?.getAttribute('data-foleon-layout')).toBe('leadership-message');
    expect(leadership?.querySelector('[data-preview-tone]')).toBeNull();
    expect(leadership?.querySelector('[data-foleon-preview-route]')).toBeNull();

    // Global preview-state invariant.
    expect(document.querySelectorAll('iframe')).toHaveLength(0);
    expect((window as typeof window & { __hbIntel_foleon?: unknown }).__hbIntel_foleon).toBeUndefined();
  });

  it('Phase-04 Wave-01 Prompt-06: all three lanes ready in one tree — each card opens its own lane-scoped viewer in sequence', async () => {
    const recordsByConfig = new Map<string, FoleonContentRecord>([
      [
        FOLEON_READER_CONFIGS.projectSpotlight.readerKey,
        makeRecord({
          id: 101,
          title: 'The Seaglass Residence',
          contentTypeKey: 'Project Spotlight',
          readerKey: 'project-spotlight',
          embedUrl: 'https://viewer.us.foleon.com/embed/spotlight',
          publishedUrl: 'https://viewer.us.foleon.com/published/spotlight',
        }),
      ],
      [
        FOLEON_READER_CONFIGS.companyPulse.readerKey,
        makeRecord({
          id: 102,
          title: 'Companywide April Brief',
          contentTypeKey: 'Company Pulse',
          readerKey: 'company-pulse',
          embedUrl: 'https://viewer.us.foleon.com/embed/pulse',
          publishedUrl: 'https://viewer.us.foleon.com/published/pulse',
          lastEditorialUpdate: '2026-04-14T00:00:00.000Z',
        }),
      ],
      [
        FOLEON_READER_CONFIGS.leadershipMessage.readerKey,
        makeRecord({
          id: 103,
          title: 'A Quarterly Leadership Note',
          contentTypeKey: 'Leadership',
          readerKey: 'leadership-message',
          embedUrl: 'https://viewer.us.foleon.com/embed/leadership',
          publishedUrl: 'https://viewer.us.foleon.com/published/leadership',
          summary: 'A focused executive note.',
        }),
      ],
    ]);
    resolveMock.mockImplementation(async (params) => {
      const record = recordsByConfig.get(params.config.readerKey)!;
      return {
        kind: 'ready',
        config: params.config,
        record,
        embedUrl: record.embedUrl!,
        warnings: [],
      };
    });
    installMatchMedia(false);
    const callbacks = {
      onOpenArchive: vi.fn(),
      onReaderOpen: vi.fn(),
      onReaderClose: vi.fn(),
      onEmbedError: vi.fn(),
      onGateBlocked: vi.fn(),
      onViewerOpen: vi.fn(),
      onViewerClose: vi.fn(),
      onViewerIframeLoaded: vi.fn(),
      onViewerIframeError: vi.fn(),
    };

    const { container } = render(
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

    // Wait for all three lanes to render the lane-owned layouts.
    await waitFor(() => {
      expect(
        document.querySelector('[data-foleon-reader-layout="project-spotlight"]'),
      ).not.toBeNull();
    });
    await screen.findByLabelText('Company Pulse coverage');
    await screen.findByText('A Quarterly Leadership Note');

    // Per-lane wrappers — used to scope card-button queries.
    const spotlightWrapper = container.querySelector('[data-foleon-reader-layout="project-spotlight"]') as HTMLElement;
    const pulseWrapper = container.querySelector('[data-foleon-reader-layout="company-pulse"]') as HTMLElement;
    const leadershipWrapper = container.querySelector('[data-foleon-reader-layout="leadership-message"]') as HTMLElement;

    // ----- Spotlight viewer launch -----
    const spotlightCard = within(
      spotlightWrapper.querySelector('[data-foleon-article-card]') as HTMLElement,
    ).getByRole('button', { name: 'The Seaglass Residence' });
    fireEvent.click(spotlightCard);
    let dialog = await screen.findByRole('dialog');
    expect(dialog.getAttribute('data-foleon-viewer-lane')).toBe('projectSpotlight');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close Foleon viewer' }));
    expect(screen.queryByRole('dialog')).toBeNull();

    // ----- Pulse viewer launch -----
    const pulseCard = within(
      pulseWrapper.querySelector('[data-foleon-article-card]') as HTMLElement,
    ).getByRole('button', { name: 'Companywide April Brief' });
    fireEvent.click(pulseCard);
    dialog = await screen.findByRole('dialog');
    expect(dialog.getAttribute('data-foleon-viewer-lane')).toBe('companyPulse');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close Foleon viewer' }));
    expect(screen.queryByRole('dialog')).toBeNull();

    // ----- Leadership viewer launch -----
    const leadershipCard = within(
      leadershipWrapper.querySelector('[data-foleon-article-card]') as HTMLElement,
    ).getByRole('button', { name: 'A Quarterly Leadership Note' });
    fireEvent.click(leadershipCard);
    dialog = await screen.findByRole('dialog');
    expect(dialog.getAttribute('data-foleon-viewer-lane')).toBe('leadershipMessage');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close Foleon viewer' }));
    expect(screen.queryByRole('dialog')).toBeNull();

    // No inline iframes ever mounted for any of the three lanes.
    expect(container.querySelectorAll('iframe')).toHaveLength(0);
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
