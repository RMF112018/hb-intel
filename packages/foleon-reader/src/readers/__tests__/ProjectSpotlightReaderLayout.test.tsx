import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { render, cleanup, screen, fireEvent } from '@testing-library/react';

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
    expect(screen.getByText('Preview')).toBeTruthy();
  });

  it('uses the employee-facing eyebrow ("Project Spotlight") and not the legacy reader eyebrow', () => {
    const viewModel = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight);
    const { container } = render(
      <ProjectSpotlightReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );
    expect(screen.getByText('Project Spotlight')).toBeTruthy();
    expect(container.textContent).not.toContain('Project Spotlight Reader');
    expect(container.textContent).not.toContain('Preview layout');
  });

  it('does not surface the developer-facing ribbon labels (Audience, Archive group, Monthly Status, duplicated Cadence) in the primary visual surface', () => {
    const viewModel = buildReadyViewModel({
      region: 'Gulf Coast',
      sector: 'Hospitality',
    });
    const { container } = render(
      <ProjectSpotlightReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );
    const card = container.querySelector('[data-foleon-article-card]');
    expect(card).not.toBeNull();
    expect(card?.textContent).not.toContain('Audience');
    expect(card?.textContent).not.toContain('Archive group');
    expect(card?.textContent).not.toContain('Monthly Status');
    expect(card?.textContent).not.toContain('Monthly status');
    // No duplicated `Cadence` ribbon row — cadence is shown only as the
    // single chip in the eyebrow row.
    const factRow = container.querySelector('[aria-label="Project Spotlight facts"]');
    expect(factRow?.textContent ?? '').not.toContain('Cadence');
  });

  it('renders Location and Market chips independently of each other', () => {
    // Only region present → Location chip alone.
    const onlyRegion = buildReadyViewModel({ region: 'Gulf Coast', sector: undefined });
    const renderRegion = render(
      <ProjectSpotlightReaderLayout viewModel={onlyRegion} iframeSurface={null} />,
    );
    const factsRegion = renderRegion.container.querySelector('[aria-label="Project Spotlight facts"]');
    expect(factsRegion?.textContent).toContain('Gulf Coast');
    expect(factsRegion?.textContent).not.toContain('Market');
    cleanup();

    // Only sector present → Market chip alone.
    const onlySector = buildReadyViewModel({ region: undefined, sector: 'Hospitality' });
    const renderSector = render(
      <ProjectSpotlightReaderLayout viewModel={onlySector} iframeSurface={null} />,
    );
    const factsSector = renderSector.container.querySelector('[aria-label="Project Spotlight facts"]');
    expect(factsSector?.textContent).toContain('Hospitality');
    expect(factsSector?.textContent).not.toContain('Location');
  });

  it('renders the hero image when record.heroImageUrl is present and uses a generated fallback accessibility label (not editorial alt)', () => {
    const viewModel = buildReadyViewModel({
      heroImageUrl: 'https://cdn.example.com/hero.jpg',
      thumbnailUrl: 'https://cdn.example.com/thumb.jpg',
    });
    const { container } = render(
      <ProjectSpotlightReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe('https://cdn.example.com/hero.jpg');
    expect(img?.getAttribute('alt')).toContain('The Seaglass Residence');
  });

  it('falls back to thumbnailUrl when heroImageUrl is absent', () => {
    const viewModel = buildReadyViewModel({
      heroImageUrl: undefined,
      thumbnailUrl: 'https://cdn.example.com/thumb.jpg',
    });
    const { container } = render(
      <ProjectSpotlightReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );
    const img = container.querySelector('img');
    expect(img?.getAttribute('src')).toBe('https://cdn.example.com/thumb.jpg');
  });

  it('renders a polished aria-hidden placeholder when no record media exists', () => {
    const viewModel = buildReadyViewModel({
      heroImageUrl: undefined,
      thumbnailUrl: undefined,
    });
    const { container } = render(
      <ProjectSpotlightReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );
    expect(container.querySelector('img')).toBeNull();
    const stage = container.querySelector('[data-foleon-article-card]');
    const placeholder = stage?.querySelector('[aria-hidden="true"]');
    expect(placeholder).not.toBeNull();
  });

  it('does not render disabled-reason copy for openable preview state', () => {
    const viewModel = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight);
    const { container } = render(
      <ProjectSpotlightReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );
    const launchButton = screen.getByRole('button', { name: viewModel.primaryArticle!.title });
    expect(launchButton.getAttribute('aria-describedby')).toBeNull();
    expect(container.textContent).not.toMatch(/full spotlight will open/i);
  });

  it('renders ready-state visual surface derived only from the FoleonContentRecord and omits absent optional fields rather than inventing data', () => {
    const viewModel = buildReadyViewModel({
      relatedProjectName: 'Seaglass Holdings LLC',
      region: 'Gulf Coast',
      sector: 'Hospitality',
      // team has no record source and is intentionally not surfaced in the
      // visual-first layout.
    });
    const { container } = render(
      <ProjectSpotlightReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );

    const card = container.querySelector('[data-foleon-article-card]');
    expect(card).not.toBeNull();
    // Project label kicker carries the related-project name.
    expect(card?.textContent).toContain('Seaglass Holdings LLC');
    // Location and Market chips carry record-backed values.
    expect(card?.textContent).toContain('Gulf Coast');
    expect(card?.textContent).toContain('Hospitality');
    // No invented data: no "Not listed", no fabricated client/team strings,
    // no "Sample client/location/market/team/milestone" leakage.
    expect(card?.textContent).not.toContain('Not listed');
    expect(card?.textContent).not.toMatch(/Sample (client|location|market|team|milestone)/i);
  });

  it('Phase-04 Wave-01 Prompt-04B: never renders an inline iframe, even when iframeSurface is provided', () => {
    // The viewer is now the only iframe surface for this lane. Even if the
    // orchestrator passes an iframeSurface React element, the lane layout
    // must not render it inline.
    const viewModel = buildReadyViewModel();
    const rendered = render(
      <ProjectSpotlightReaderLayout
        viewModel={viewModel}
        iframeSurface={<iframe title="should-not-render-inline" />}
      />,
    );
    expect(rendered.container.querySelector('iframe')).toBeNull();
  });

  it('renders the article card with stable interaction markers and uses a card-launch button bound to the title', () => {
    const viewModel = buildReadyViewModel();
    const { container } = render(
      <ProjectSpotlightReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );
    const card = container.querySelector('[data-foleon-article-card]');
    expect(card).not.toBeNull();
    expect(card?.getAttribute('data-foleon-article-lane')).toBe('projectSpotlight');
    expect(card?.getAttribute('data-foleon-article-state')).toBe('enabled');
    expect(card?.getAttribute('data-foleon-viewer-target-id')).toMatch(/^project-spotlight-active-/);
    // Card-launch button uses the article title as its accessible name.
    const launchButton = screen.getByRole('button', {
      name: viewModel.primaryArticle!.title,
    });
    expect(launchButton).toBeTruthy();
    expect(launchButton.getAttribute('aria-disabled')).toBeNull();
  });

  it('preview state article card is actionable without disabled semantics', () => {
    const viewModel = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight);
    const { container } = render(
      <ProjectSpotlightReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );
    const card = container.querySelector('[data-foleon-article-card]');
    expect(card?.getAttribute('data-foleon-article-state')).toBe('preview');
    const launchButton = screen.getByRole('button', { name: viewModel.primaryArticle!.title });
    expect(launchButton.getAttribute('aria-disabled')).toBeNull();
    expect(launchButton.getAttribute('aria-describedby')).toBeNull();
  });

  it('clicking a preview card opens the local preview viewer without a refusal marker', () => {
    const viewModel = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight);
    const policy = createFoleonOriginPolicy(['https://viewer.us.foleon.com']);
    const { container } = render(
      <FoleonFullWindowViewerProvider originPolicy={policy}>
        <ProjectSpotlightReaderLayout viewModel={viewModel} iframeSurface={null} />
      </FoleonFullWindowViewerProvider>,
    );
    const card = container.querySelector('[data-foleon-article-card]');
    expect(card?.getAttribute('data-foleon-article-state')).toBe('preview');
    const launchButton = screen.getByRole('button', { name: viewModel.primaryArticle!.title });
    expect(launchButton.getAttribute('aria-disabled')).toBeNull();
    expect(launchButton.getAttribute('aria-describedby')).toBeNull();
    fireEvent.click(launchButton);
    expect(launchButton.getAttribute('data-foleon-article-last-refusal')).toBeNull();
    const dialog = document.querySelector('[data-foleon-full-window-viewer="active"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute('data-foleon-viewer-source')).toBe('preview');
    expect(dialog?.querySelector('iframe')).toBeNull();
  });

  it('keyboard activation on a preview card opens the local preview viewer', () => {
    const viewModel = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight);
    const policy = createFoleonOriginPolicy(['https://viewer.us.foleon.com']);
    const rendered = render(
      <FoleonFullWindowViewerProvider originPolicy={policy}>
        <ProjectSpotlightReaderLayout viewModel={viewModel} iframeSurface={null} />
      </FoleonFullWindowViewerProvider>,
    );
    const launchButton = rendered.getByRole('button', { name: viewModel.primaryArticle!.title });
    fireEvent.keyDown(launchButton, { key: 'Enter' });
    fireEvent.click(launchButton);
    const dialog = document.querySelector('[data-foleon-full-window-viewer="active"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute('data-foleon-viewer-source')).toBe('preview');
    expect(dialog?.querySelector('iframe')).toBeNull();
  });

  it('Phase-04 Wave-01 Prompt-04C: card has exactly one interactive control (single-button card-launch pattern, no nested controls)', () => {
    const viewModel = buildReadyViewModel();
    const { container } = render(
      <ProjectSpotlightReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );
    const card = container.querySelector('[data-foleon-article-card]') as HTMLElement;
    expect(card).not.toBeNull();
    const interactiveInsideCard = card.querySelectorAll(
      'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    expect(interactiveInsideCard.length).toBe(1);
    expect(interactiveInsideCard[0].tagName).toBe('BUTTON');
  });

  it('Phase-04 Wave-01 Prompt-04C: keyboard activation (Enter / Space) on the card-launch button opens the viewer when wrapped in the provider', () => {
    const viewModel = buildReadyViewModel();
    const policy = createFoleonOriginPolicy(['https://viewer.us.foleon.com']);

    const enterRender = render(
      <FoleonFullWindowViewerProvider originPolicy={policy}>
        <ProjectSpotlightReaderLayout viewModel={viewModel} iframeSurface={null} />
      </FoleonFullWindowViewerProvider>,
    );
    const launchEnter = enterRender.getByRole('button', { name: viewModel.primaryArticle!.title });
    // Native button: Enter and Space synthesize a click.
    fireEvent.click(launchEnter);
    expect(screen.queryByRole('dialog')).not.toBeNull();
    cleanup();

    const spaceRender = render(
      <FoleonFullWindowViewerProvider originPolicy={policy}>
        <ProjectSpotlightReaderLayout viewModel={viewModel} iframeSurface={null} />
      </FoleonFullWindowViewerProvider>,
    );
    const launchSpace = spaceRender.getByRole('button', { name: viewModel.primaryArticle!.title });
    // Simulate keyboard activation explicitly.
    fireEvent.keyDown(launchSpace, { key: 'Enter' });
    fireEvent.keyUp(launchSpace, { key: 'Enter' });
    fireEvent.click(launchSpace);
    expect(screen.queryByRole('dialog')).not.toBeNull();
  });

  it('records embed-not-allowed refusal when the underlying record blocks embedding', () => {
    const viewModel = buildReadyViewModel({ allowEmbed: false });
    const { container } = render(
      <ProjectSpotlightReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );
    const card = container.querySelector('[data-foleon-article-card]');
    expect(card?.getAttribute('data-foleon-article-state')).toBe('disabled');
    const launchButton = screen.getByRole('button', { name: viewModel.primaryArticle!.title });
    expect(launchButton.getAttribute('aria-disabled')).toBe('true');
    const reasonEl = container.querySelector(`#${launchButton.getAttribute('aria-describedby')}`);
    expect(reasonEl?.textContent).toMatch(/cannot open in the embedded viewer/i);
    fireEvent.click(launchButton);
    expect(launchButton.getAttribute('data-foleon-article-last-refusal')).toBe('embed-not-allowed');
  });

  it.each([
    ['no-embed-url', { embedUrl: undefined }],
    ['requires-external-open', { requiresExternalOpen: true }],
  ] as const)('records %s refusal for ready disabled records', (reason, overrides) => {
    const viewModel = buildReadyViewModel(overrides);
    const { container } = render(
      <ProjectSpotlightReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );
    const card = container.querySelector('[data-foleon-article-card]');
    expect(card?.getAttribute('data-foleon-article-state')).toBe('disabled');
    const launchButton = screen.getByRole('button', { name: viewModel.primaryArticle!.title });
    expect(launchButton.getAttribute('aria-disabled')).toBe('true');
    const reasonId = launchButton.getAttribute('aria-describedby');
    expect(reasonId).toBeTruthy();
    expect(container.querySelector(`#${reasonId}`)).not.toBeNull();
    fireEvent.click(launchButton);
    expect(launchButton.getAttribute('data-foleon-article-last-refusal')).toBe(reason);
    expect(document.querySelector('[data-foleon-full-window-viewer="active"]')).toBeNull();
  });

  it('does not interfere with sibling lanes — Pulse renders its briefing layout, Leadership stays on the compatibility shell', () => {
    const pulseVm = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.companyPulse);
    const leadershipVm = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.leadershipMessage);
    render(
      <>
        <CompanyPulseReaderLayout viewModel={pulseVm} iframeSurface={null} />
        <LeadershipMessageReaderLayout viewModel={leadershipVm} iframeSurface={null} />
      </>,
    );

    // Per-lane scoped assertions.
    const pulse = document.querySelector('[data-foleon-reader-layout="company-pulse"]');
    const leadership = document.querySelector('[data-foleon-reader-layout="leadership-message"]');
    expect(pulse).not.toBeNull();
    expect(leadership).not.toBeNull();

    // Pulse: lane-owned briefing layout (Prompt-04). No legacy markers.
    expect(pulse?.getAttribute('data-foleon-layout')).toBe('company-pulse-edition-launcher');
    expect(pulse?.querySelector('[data-preview-tone]')).toBeNull();
    expect(pulse?.querySelector('[data-foleon-preview-route]')).toBeNull();

    // Leadership (Prompt-05): lane-owned executive layout. No legacy markers.
    expect(leadership?.getAttribute('data-foleon-layout')).toBe('leadership-message');
    expect(leadership?.querySelector('[data-preview-tone]')).toBeNull();
    expect(leadership?.querySelector('[data-foleon-preview-route]')).toBeNull();

    // The Project Spotlight feature marker is NOT present (no spotlight rendered here).
    expect(document.querySelector('[data-foleon-layout="project-spotlight-feature"]')).toBeNull();
  });
});
