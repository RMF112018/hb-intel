import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { render, cleanup, screen, fireEvent } from '@testing-library/react';
import { CompanyPulseReaderLayout } from '../layouts/CompanyPulseReaderLayout.js';
import { ProjectSpotlightReaderLayout } from '../layouts/ProjectSpotlightReaderLayout.js';
import { LeadershipMessageReaderLayout } from '../layouts/LeadershipMessageReaderLayout.js';
import { FoleonFullWindowViewerProvider } from '../../components/FoleonFullWindowViewerProvider.js';
import { createFoleonOriginPolicy } from '../../services/FoleonOriginPolicy.js';
import {
  createPreviewFoleonReaderViewModel,
  createReadyFoleonReaderViewModel,
  type FoleonReaderViewModel,
} from '../FoleonReaderViewModel.js';
import { FOLEON_READER_CONFIGS } from '../readerConfigs.js';
import type { FoleonContentRecord } from '../../types/foleon-content.types.js';
import type { FoleonReaderResolution } from '../../services/FoleonReaderContentService.js';

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

afterEach(() => cleanup());

function buildReadyViewModel(
  overrides: Partial<FoleonContentRecord> = {},
): FoleonReaderViewModel {
  const record: FoleonContentRecord = {
    id: 11,
    title: 'Companywide April Brief',
    foleonDocId: 2001,
    contentTypeKey: 'Company Pulse',
    readerKey: 'company-pulse',
    publishStatus: 'Published',
    isVisible: true,
    isFeatured: true,
    isHomepageEligible: true,
    publishedUrl: 'https://viewer.us.foleon.com/published/pulse',
    embedUrl: 'https://viewer.us.foleon.com/embed/pulse',
    summary: 'Operational, recognition, and event highlights for the week of April 14.',
    lastEditorialUpdate: '2026-04-14T00:00:00.000Z',
    publishedOn: '2026-04-15T00:00:00.000Z',
    archiveGroup: '2026-Q2',
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
    config: FOLEON_READER_CONFIGS.companyPulse,
    record,
    embedUrl: record.embedUrl!,
    warnings: [],
  };
  return createReadyFoleonReaderViewModel(FOLEON_READER_CONFIGS.companyPulse, {
    resolution,
    shouldMountIframe: true,
    mobileGateActive: false,
    onActivateMobileReader: () => undefined,
    onOpenArchive: () => undefined,
  });
}

describe('CompanyPulseReaderLayout — lane-owned briefing composition', () => {
  it('emits the new data-foleon-layout marker alongside the registry markers', () => {
    const viewModel = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.companyPulse);
    const { container } = render(
      <CompanyPulseReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );

    const wrapper = container.querySelector('[data-foleon-layout="company-pulse-briefing"]');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.getAttribute('data-foleon-reader-layout')).toBe('company-pulse');
    expect(wrapper?.getAttribute('data-foleon-reader-lane')).toBe('companyPulse');
    expect(wrapper?.getAttribute('data-foleon-reader-state')).toBe('preview');
  });

  it('does not emit Project Spotlight or Leadership Message layout markers', () => {
    const viewModel = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.companyPulse);
    const { container } = render(
      <CompanyPulseReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );

    expect(container.querySelector('[data-foleon-reader-layout="project-spotlight"]')).toBeNull();
    expect(container.querySelector('[data-foleon-reader-layout="leadership-message"]')).toBeNull();
    expect(container.querySelector('[data-foleon-layout="project-spotlight-feature"]')).toBeNull();
  });

  it('does not render the legacy three-card support skeleton or tone markers', () => {
    const viewModel = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.companyPulse);
    const { container } = render(
      <CompanyPulseReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );

    expect(container.querySelector('[aria-label$="supporting preview placeholders"]')).toBeNull();
    expect(container.querySelector('[aria-label="Preview status"]')).toBeNull();
    expect(container.querySelector('[aria-label="Preview metadata zones"]')).toBeNull();
    expect(container.querySelector('[data-preview-tone]')).toBeNull();
    expect(container.querySelector('[data-foleon-preview-route]')).toBeNull();
  });

  it('preview and ready states share the same data-foleon-layout marker; only the state attribute differs', () => {
    const previewVm = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.companyPulse);
    const previewRender = render(
      <CompanyPulseReaderLayout viewModel={previewVm} iframeSurface={null} />,
    );
    const previewWrapper = previewRender.container.querySelector(
      '[data-foleon-layout="company-pulse-briefing"]',
    );
    expect(previewWrapper?.getAttribute('data-foleon-reader-state')).toBe('preview');
    cleanup();

    const readyVm = buildReadyViewModel();
    const readyRender = render(
      <CompanyPulseReaderLayout viewModel={readyVm} iframeSurface={null} />,
    );
    const readyWrapper = readyRender.container.querySelector(
      '[data-foleon-layout="company-pulse-briefing"]',
    );
    expect(readyWrapper).not.toBeNull();
    expect(readyWrapper?.getAttribute('data-foleon-reader-state')).toBe('ready');
  });

  it('keeps an honest visible preview label in preview state', () => {
    const viewModel = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.companyPulse);
    render(<CompanyPulseReaderLayout viewModel={viewModel} iframeSurface={null} />);
    expect(screen.getByText('Preview layout')).toBeTruthy();
  });

  it('renders a non-empty digest spanning the four conceptual categories in preview state', () => {
    const viewModel = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.companyPulse);
    const { container } = render(
      <CompanyPulseReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );

    const digest = container.querySelector('[data-foleon-pulse-digest-state="populated"]');
    expect(digest).not.toBeNull();
    const text = digest?.textContent ?? '';
    expect(text).toContain('News');
    expect(text).toContain('Events');
    expect(text).toContain('Recognition');
    expect(text).toContain('Operations');
  });

  it('renders an explanatory empty-digest state in ready mode and never fabricates secondary digest items', () => {
    const viewModel = buildReadyViewModel();
    const { container } = render(
      <CompanyPulseReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );

    expect(container.querySelector('[data-foleon-pulse-digest-state="populated"]')).toBeNull();
    const empty = container.querySelector('[data-foleon-pulse-digest-state="empty"]');
    expect(empty).not.toBeNull();
    expect(empty?.textContent ?? '').toMatch(/archive/i);
  });

  it('renders the briefing lead derived from FoleonContentRecord (no invented data)', () => {
    const viewModel = buildReadyViewModel({
      title: 'Companywide April Brief',
      summary: 'Operational, recognition, and event highlights for the week of April 14.',
    });
    const { container } = render(
      <CompanyPulseReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );

    const lead = container.querySelector('[aria-label="Latest Company Pulse update"]');
    expect(lead).not.toBeNull();
    expect(lead?.textContent).toContain('Companywide April Brief');
    expect(lead?.textContent).toContain('Operational, recognition, and event highlights');
  });

  it('uses an honest fallback in the lead body when the record carries no summary', () => {
    const viewModel = buildReadyViewModel({ summary: undefined });
    render(<CompanyPulseReaderLayout viewModel={viewModel} iframeSurface={null} />);
    expect(
      screen.getByText(/Editorial summary for this Company Pulse edition has not been provided\./i),
    ).toBeTruthy();
  });

  it('Phase-04 Wave-01 Prompt-04B: never renders an inline iframe, even when iframeSurface is provided or visible', () => {
    const viewModel = buildReadyViewModel();
    const rendered = render(
      <CompanyPulseReaderLayout
        viewModel={viewModel}
        iframeSurface={<iframe title="should-not-render-inline" />}
      />,
    );
    expect(rendered.container.querySelector('iframe')).toBeNull();
  });

  it('renders the lead update as the article card with stable interaction markers', () => {
    const viewModel = buildReadyViewModel();
    const { container } = render(
      <CompanyPulseReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );
    const card = container.querySelector('[data-foleon-article-card]');
    expect(card).not.toBeNull();
    expect(card?.getAttribute('data-foleon-article-lane')).toBe('companyPulse');
    expect(card?.getAttribute('data-foleon-article-state')).toBe('enabled');
    expect(card?.getAttribute('data-foleon-viewer-target-id')).toMatch(/^company-pulse-active-/);
    const launch = screen.getByRole('button', { name: viewModel.briefingLead!.title });
    expect(launch).toBeTruthy();
    expect(launch.getAttribute('aria-disabled')).toBeNull();
  });

  it('preview state lead card is aria-disabled with a visible reason and aria-describedby', () => {
    const viewModel = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.companyPulse);
    const { container } = render(
      <CompanyPulseReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );
    const card = container.querySelector('[data-foleon-article-card]');
    expect(card?.getAttribute('data-foleon-article-state')).toBe('preview');
    const launch = screen.getByRole('button', { name: viewModel.briefingLead!.title });
    expect(launch.getAttribute('aria-disabled')).toBe('true');
    const reasonId = launch.getAttribute('aria-describedby');
    expect(reasonId).toBeTruthy();
    expect(container.querySelector(`#${reasonId}`)?.textContent).toMatch(/preview only/i);
  });

  it('clicking a disabled (preview) lead is a no-op and surfaces the structured refusal as a DOM marker', () => {
    const viewModel = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.companyPulse);
    render(<CompanyPulseReaderLayout viewModel={viewModel} iframeSurface={null} />);
    const launch = screen.getByRole('button', { name: viewModel.briefingLead!.title });
    fireEvent.click(launch);
    expect(launch.getAttribute('data-foleon-article-last-refusal')).toBe('preview-only');
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it('Phase-04 Wave-01 Prompt-04C: card has exactly one interactive control (single-button card-launch pattern, no nested controls)', () => {
    const viewModel = buildReadyViewModel();
    const { container } = render(
      <CompanyPulseReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );
    const card = container.querySelector('[data-foleon-article-card]') as HTMLElement;
    expect(card).not.toBeNull();
    const interactiveInsideCard = card.querySelectorAll(
      'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    expect(interactiveInsideCard.length).toBe(1);
    expect(interactiveInsideCard[0].tagName).toBe('BUTTON');
  });

  it('Phase-04 Wave-01 Prompt-04C: keyboard activation on the card-launch button opens the viewer when wrapped in the provider', () => {
    const viewModel = buildReadyViewModel();
    const policy = createFoleonOriginPolicy(['https://viewer.us.foleon.com']);

    const rendered = render(
      <FoleonFullWindowViewerProvider originPolicy={policy}>
        <CompanyPulseReaderLayout viewModel={viewModel} iframeSurface={null} />
      </FoleonFullWindowViewerProvider>,
    );
    const launch = rendered.getByRole('button', { name: viewModel.briefingLead!.title });
    // Keyboard activation on a native button — fire keyDown then click,
    // matching the browser's synthesized Enter/Space → click flow.
    fireEvent.keyDown(launch, { key: 'Enter' });
    fireEvent.click(launch);
    expect(rendered.queryByRole('dialog')).not.toBeNull();
  });

  it('records embed-not-allowed refusal when the underlying record blocks embedding', () => {
    const viewModel = buildReadyViewModel({ allowEmbed: false });
    const { container } = render(
      <CompanyPulseReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );
    const card = container.querySelector('[data-foleon-article-card]');
    expect(card?.getAttribute('data-foleon-article-state')).toBe('disabled');
    const launch = screen.getByRole('button', { name: viewModel.briefingLead!.title });
    expect(launch.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(launch);
    expect(launch.getAttribute('data-foleon-article-last-refusal')).toBe('embed-not-allowed');
  });

  it('outer wrapper is edge-bleed-ready (no inline margin-inline overrides on the layout root)', () => {
    // The Prompt-01 shell-slot edge contract drives bleed at the slot
    // wrapper above this layout. The layout root must not introduce its
    // own competing margin-inline that would interfere with that contract.
    const viewModel = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.companyPulse);
    const { container } = render(
      <CompanyPulseReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );
    const wrapper = container.querySelector('[data-foleon-layout="company-pulse-briefing"]') as HTMLElement | null;
    expect(wrapper).not.toBeNull();
    // No inline `margin-inline` / `margin-left` / `margin-right` style applied directly to the wrapper.
    expect(wrapper?.style.marginInline).toBe('');
    expect(wrapper?.style.marginLeft).toBe('');
    expect(wrapper?.style.marginRight).toBe('');
  });

  it('does not interfere with sibling lanes — Spotlight emits its feature marker and Leadership stays on the compatibility shell', () => {
    const spotlightVm = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight);
    const leadershipVm = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.leadershipMessage);
    const pulseVm = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.companyPulse);
    const { container } = render(
      <>
        <ProjectSpotlightReaderLayout viewModel={spotlightVm} iframeSurface={null} />
        <CompanyPulseReaderLayout viewModel={pulseVm} iframeSurface={null} />
        <LeadershipMessageReaderLayout viewModel={leadershipVm} iframeSurface={null} />
      </>,
    );

    // Per-lane scoping — assert by lane wrapper, not by global counts.
    // The Prompt-02 lane marker and the Prompt-03/04 layout marker live on
    // the SAME wrapper element, so we check the wrapper's own attributes
    // and only descend for tone/preview markers (which the compatibility
    // shell renders inside the wrapper).
    const spotlight = container.querySelector('[data-foleon-reader-layout="project-spotlight"]');
    const pulse = container.querySelector('[data-foleon-reader-layout="company-pulse"]');
    const leadership = container.querySelector('[data-foleon-reader-layout="leadership-message"]');
    expect(spotlight?.getAttribute('data-foleon-layout')).toBe('project-spotlight-feature');
    expect(pulse?.getAttribute('data-foleon-layout')).toBe('company-pulse-briefing');
    // Leadership remains on the compatibility shell pending Prompt 05.
    expect(leadership?.querySelector('[data-preview-tone="navy"]')).not.toBeNull();
    expect(leadership?.querySelector('[data-foleon-preview-route]')).not.toBeNull();
    // Pulse no longer emits the legacy compatibility-shell markers.
    expect(pulse?.querySelector('[data-preview-tone]')).toBeNull();
    expect(pulse?.querySelector('[data-foleon-preview-route]')).toBeNull();
  });
});
