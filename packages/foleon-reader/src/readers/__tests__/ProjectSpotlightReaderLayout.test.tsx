import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/react';

beforeAll(() => {
  // HbcButton inspects pointer-coarseness via window.matchMedia. JSDOM does
  // not provide matchMedia by default; the foleon-reader package does not
  // ship a global test-setup, so stub it here for this suite.
  if (typeof window !== 'undefined' && !window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
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
});
import { ProjectSpotlightReaderLayout } from '../layouts/ProjectSpotlightReaderLayout.js';
import { CompanyPulseReaderLayout } from '../layouts/CompanyPulseReaderLayout.js';
import { LeadershipMessageReaderLayout } from '../layouts/LeadershipMessageReaderLayout.js';
import {
  createPreviewFoleonReaderViewModel,
  createReadyFoleonReaderViewModel,
  type FoleonReaderViewModel,
} from '../FoleonReaderViewModel.js';
import { FOLEON_READER_CONFIGS } from '../readerConfigs.js';
import type { FoleonContentRecord } from '../../types/foleon-content.types.js';
import type { FoleonReaderResolution } from '../../services/FoleonReaderContentService.js';

afterEach(() => cleanup());

function buildReadyViewModel(
  overrides: Partial<FoleonContentRecord> = {},
): FoleonReaderViewModel {
  const record: FoleonContentRecord = {
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
    summary: 'A coastal residence redefining HB craft excellence.',
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
  const resolution: Extract<FoleonReaderResolution, { readonly kind: 'ready' }> = {
    kind: 'ready',
    config: FOLEON_READER_CONFIGS.projectSpotlight,
    record,
    embedUrl: record.embedUrl!,
    warnings: [],
  };
  return createReadyFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight, {
    resolution,
    shouldMountIframe: true,
    mobileGateActive: false,
    onActivateMobileReader: () => undefined,
    onOpenArchive: () => undefined,
  });
}

describe('ProjectSpotlightReaderLayout — lane-owned feature composition', () => {
  it('emits the new data-foleon-layout marker alongside the registry markers', () => {
    const viewModel = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight);
    const { container } = render(
      <ProjectSpotlightReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );

    const wrapper = container.querySelector('[data-foleon-layout="project-spotlight-feature"]');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.getAttribute('data-foleon-reader-layout')).toBe('project-spotlight');
    expect(wrapper?.getAttribute('data-foleon-reader-lane')).toBe('projectSpotlight');
    expect(wrapper?.getAttribute('data-foleon-reader-state')).toBe('preview');
  });

  it('does not emit Company Pulse or Leadership Message layout markers', () => {
    const viewModel = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight);
    const { container } = render(
      <ProjectSpotlightReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );

    expect(container.querySelector('[data-foleon-reader-layout="company-pulse"]')).toBeNull();
    expect(container.querySelector('[data-foleon-reader-layout="leadership-message"]')).toBeNull();
  });

  it('preview and ready states share the same data-foleon-layout marker; only the state attribute differs', () => {
    const previewVm = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight);
    const previewRender = render(
      <ProjectSpotlightReaderLayout viewModel={previewVm} iframeSurface={null} />,
    );
    const previewWrapper = previewRender.container.querySelector(
      '[data-foleon-layout="project-spotlight-feature"]',
    );
    expect(previewWrapper?.getAttribute('data-foleon-reader-state')).toBe('preview');
    cleanup();

    const readyVm = buildReadyViewModel();
    const readyRender = render(
      <ProjectSpotlightReaderLayout viewModel={readyVm} iframeSurface={null} />,
    );
    const readyWrapper = readyRender.container.querySelector(
      '[data-foleon-layout="project-spotlight-feature"]',
    );
    expect(readyWrapper).not.toBeNull();
    expect(readyWrapper?.getAttribute('data-foleon-reader-state')).toBe('ready');
  });

  it('does not render the legacy three-card support skeleton', () => {
    const viewModel = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight);
    const { container } = render(
      <ProjectSpotlightReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );

    expect(container.querySelector('[aria-label$="supporting preview placeholders"]')).toBeNull();
    expect(container.querySelector('[aria-label="Preview status"]')).toBeNull();
    expect(container.querySelector('[aria-label="Preview metadata zones"]')).toBeNull();
    // No legacy tone markers.
    expect(container.querySelector('[data-preview-tone]')).toBeNull();
    expect(container.querySelector('[data-foleon-preview-route]')).toBeNull();
  });

  it('keeps an honest visible preview label in preview state', () => {
    const viewModel = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight);
    render(<ProjectSpotlightReaderLayout viewModel={viewModel} iframeSurface={null} />);
    expect(screen.getByText('Preview layout')).toBeTruthy();
  });

  it('renders ready-state project facts derived only from the FoleonContentRecord, with "Not listed" fallbacks for absent record fields', () => {
    const viewModel = buildReadyViewModel({
      relatedProjectName: 'Seaglass Holdings LLC',
      region: 'Gulf Coast',
      sector: 'Hospitality',
      // team is intentionally not present in FoleonContentRecord
    });
    const { container } = render(
      <ProjectSpotlightReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );

    const facts = container.querySelector('[aria-label="Project facts"]');
    expect(facts).not.toBeNull();
    expect(facts?.textContent).toContain('Seaglass Holdings LLC'); // client from relatedProjectName
    expect(facts?.textContent).toContain('Gulf Coast'); // location from region
    expect(facts?.textContent).toContain('Hospitality'); // market from sector
    // Team has no record source — the layout renders "Not listed" rather than inventing a value.
    expect(facts?.textContent).toContain('Not listed');
  });

  it('renders the iframe inside .iframeFrame only when viewModel.iframe?.visible is true and iframeSurface is non-null', () => {
    const viewModel = buildReadyViewModel();
    // visible true + non-null surface ⇒ rendered
    const withIframe = render(
      <ProjectSpotlightReaderLayout
        viewModel={viewModel}
        iframeSurface={<iframe title="test-iframe" />}
      />,
    );
    expect(withIframe.container.querySelector('iframe')).not.toBeNull();
    cleanup();

    // visible true + null surface ⇒ not rendered
    const withoutSurface = render(
      <ProjectSpotlightReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );
    expect(withoutSurface.container.querySelector('iframe')).toBeNull();
    cleanup();

    // visible false ⇒ not rendered
    const collapsedVm: FoleonReaderViewModel = {
      ...viewModel,
      iframe: viewModel.iframe ? { ...viewModel.iframe, visible: false } : undefined,
    };
    const collapsed = render(
      <ProjectSpotlightReaderLayout
        viewModel={collapsedVm}
        iframeSurface={<iframe title="test-iframe-2" />}
      />,
    );
    expect(collapsed.container.querySelector('iframe')).toBeNull();
  });

  it('does not interfere with sibling lanes — Pulse and Leadership wrappers still render their compatibility-shell markers', () => {
    const pulseVm = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.companyPulse);
    const leadershipVm = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.leadershipMessage);
    render(
      <>
        <CompanyPulseReaderLayout viewModel={pulseVm} iframeSurface={null} />
        <LeadershipMessageReaderLayout viewModel={leadershipVm} iframeSurface={null} />
      </>,
    );
    // Pulse and Leadership are still on the legacy compatibility shell and
    // therefore still emit `data-preview-tone` and `data-foleon-preview-route`.
    expect(document.querySelector('[data-foleon-reader-layout="company-pulse"]')).not.toBeNull();
    expect(document.querySelector('[data-foleon-reader-layout="leadership-message"]')).not.toBeNull();
    expect(document.querySelector('[data-preview-tone="orange"]')).not.toBeNull();
    expect(document.querySelector('[data-preview-tone="navy"]')).not.toBeNull();
    // The Project Spotlight feature marker is NOT present (no spotlight rendered here).
    expect(document.querySelector('[data-foleon-layout="project-spotlight-feature"]')).toBeNull();
  });
});
