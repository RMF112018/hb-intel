import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { render, cleanup, screen, fireEvent } from '@testing-library/react';
import { LeadershipMessageReaderLayout } from '../layouts/LeadershipMessageReaderLayout.js';
import { ProjectSpotlightReaderLayout } from '../layouts/ProjectSpotlightReaderLayout.js';
import { CompanyPulseReaderLayout } from '../layouts/CompanyPulseReaderLayout.js';
import {
  createPreviewFoleonReaderViewModel,
  createReadyFoleonReaderViewModel,
  type FoleonReaderViewModel,
} from '../FoleonReaderViewModel.js';
import { FOLEON_READER_CONFIGS } from '../readerConfigs.js';
import { FoleonFullWindowViewerProvider } from '../../components/FoleonFullWindowViewerProvider.js';
import { createFoleonOriginPolicy } from '../../services/FoleonOriginPolicy.js';
import type { FoleonContentRecord } from '../../types/foleon-content.types.js';
import type { FoleonReaderResolution } from '../../services/FoleonReaderContentService.js';

beforeAll(() => {
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
    id: 12,
    title: 'A Quarterly Note from Leadership',
    foleonDocId: 3001,
    contentTypeKey: 'Leadership',
    readerKey: 'leadership-message',
    publishStatus: 'Published',
    isVisible: true,
    isFeatured: true,
    isHomepageEligible: true,
    publishedUrl: 'https://viewer.us.foleon.com/published/leadership',
    embedUrl: 'https://viewer.us.foleon.com/embed/leadership',
    summary:
      'A focused message on the year ahead. We are committing to clearer communication and faster decisions.',
    lastEditorialUpdate: '2026-04-10T00:00:00.000Z',
    publishedOn: '2026-04-12T00:00:00.000Z',
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
    config: FOLEON_READER_CONFIGS.leadershipMessage,
    record,
    embedUrl: record.embedUrl!,
    warnings: [],
  };
  return createReadyFoleonReaderViewModel(FOLEON_READER_CONFIGS.leadershipMessage, {
    resolution,
    shouldMountIframe: true,
    mobileGateActive: false,
    onActivateMobileReader: () => undefined,
    onOpenArchive: () => undefined,
  });
}

const TEST_POLICY = createFoleonOriginPolicy(['https://viewer.us.foleon.com']);

describe('LeadershipMessageReaderLayout — lane-owned executive composition', () => {
  it('emits the new data-foleon-layout marker alongside the registry markers', () => {
    const viewModel = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.leadershipMessage);
    const { container } = render(
      <LeadershipMessageReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );
    const wrapper = container.querySelector('[data-foleon-layout="leadership-message"]');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.getAttribute('data-foleon-reader-layout')).toBe('leadership-message');
    expect(wrapper?.getAttribute('data-foleon-reader-lane')).toBe('leadershipMessage');
    expect(wrapper?.getAttribute('data-foleon-reader-state')).toBe('preview');
  });

  it('does not emit Project Spotlight or Company Pulse layout markers', () => {
    const viewModel = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.leadershipMessage);
    const { container } = render(
      <LeadershipMessageReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );
    expect(container.querySelector('[data-foleon-reader-layout="project-spotlight"]')).toBeNull();
    expect(container.querySelector('[data-foleon-reader-layout="company-pulse"]')).toBeNull();
    expect(container.querySelector('[data-foleon-layout="project-spotlight-feature"]')).toBeNull();
    expect(container.querySelector('[data-foleon-layout="company-pulse-briefing"]')).toBeNull();
  });

  it('does not render the legacy three-card support skeleton or tone markers', () => {
    const viewModel = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.leadershipMessage);
    const { container } = render(
      <LeadershipMessageReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );
    expect(container.querySelector('[aria-label$="supporting preview placeholders"]')).toBeNull();
    expect(container.querySelector('[aria-label="Preview status"]')).toBeNull();
    expect(container.querySelector('[aria-label="Preview metadata zones"]')).toBeNull();
    expect(container.querySelector('[data-preview-tone]')).toBeNull();
    expect(container.querySelector('[data-foleon-preview-route]')).toBeNull();
  });

  it('preview and ready states share the same data-foleon-layout marker; only the state attribute differs', () => {
    const previewVm = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.leadershipMessage);
    const previewRender = render(
      <LeadershipMessageReaderLayout viewModel={previewVm} iframeSurface={null} />,
    );
    const previewWrapper = previewRender.container.querySelector(
      '[data-foleon-layout="leadership-message"]',
    );
    expect(previewWrapper?.getAttribute('data-foleon-reader-state')).toBe('preview');
    cleanup();

    const readyVm = buildReadyViewModel();
    const readyRender = render(
      <LeadershipMessageReaderLayout viewModel={readyVm} iframeSurface={null} />,
    );
    const readyWrapper = readyRender.container.querySelector(
      '[data-foleon-layout="leadership-message"]',
    );
    expect(readyWrapper).not.toBeNull();
    expect(readyWrapper?.getAttribute('data-foleon-reader-state')).toBe('ready');
  });

  it('keeps an honest visible preview label in preview state', () => {
    const viewModel = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.leadershipMessage);
    render(<LeadershipMessageReaderLayout viewModel={viewModel} iframeSurface={null} />);
    expect(screen.getByText('Preview layout')).toBeTruthy();
  });

  it('renders an honest fallback when the FoleonContentRecord schema does not carry byline/role', () => {
    const viewModel = buildReadyViewModel();
    render(<LeadershipMessageReaderLayout viewModel={viewModel} iframeSurface={null} />);
    // Schema does not carry byline/role today — layout renders the honest
    // fallback rather than fabricating executive identity.
    expect(screen.getByText('Executive byline not provided.')).toBeTruthy();
  });

  it('renders the message body and pull quote derived from FoleonContentRecord (no invented data)', () => {
    const viewModel = buildReadyViewModel();
    const { container } = render(
      <LeadershipMessageReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );
    // Pull quote = first sentence of record.summary, rendered in a <blockquote>.
    const blockquote = container.querySelector('blockquote');
    expect(blockquote?.textContent).toBe('A focused message on the year ahead.');
    // Message body = full record.summary, rendered in a paragraph that
    // mentions the back-half text only the body carries.
    expect(container.textContent).toContain('We are committing to clearer communication');
  });

  it('uses an honest fallback for the message body when the record carries no summary', () => {
    const viewModel = buildReadyViewModel({ summary: undefined });
    render(<LeadershipMessageReaderLayout viewModel={viewModel} iframeSurface={null} />);
    expect(
      screen.getByText(/Editorial summary for this Leadership Message has not been provided\./i),
    ).toBeTruthy();
  });

  it('Phase-04 Wave-01 Prompt-05: never renders an inline iframe, even when iframeSurface is provided', () => {
    const viewModel = buildReadyViewModel();
    const rendered = render(
      <LeadershipMessageReaderLayout
        viewModel={viewModel}
        iframeSurface={<iframe title="should-not-render-inline" />}
      />,
    );
    expect(rendered.container.querySelector('iframe')).toBeNull();
  });

  it('renders the executive card with stable interaction markers and uses a card-launch button bound to the title', () => {
    const viewModel = buildReadyViewModel();
    const { container } = render(
      <LeadershipMessageReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );
    const card = container.querySelector('[data-foleon-article-card]');
    expect(card).not.toBeNull();
    expect(card?.getAttribute('data-foleon-article-lane')).toBe('leadershipMessage');
    expect(card?.getAttribute('data-foleon-article-state')).toBe('enabled');
    expect(card?.getAttribute('data-foleon-viewer-target-id')).toMatch(/^leadership-message-active-/);
    const launch = screen.getByRole('button', { name: viewModel.title });
    expect(launch).toBeTruthy();
    expect(launch.getAttribute('aria-disabled')).toBeNull();
  });

  it('preview state card is actionable without disabled semantics', () => {
    const viewModel = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.leadershipMessage);
    const { container } = render(
      <LeadershipMessageReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );
    const card = container.querySelector('[data-foleon-article-card]');
    expect(card?.getAttribute('data-foleon-article-state')).toBe('preview');
    const launch = screen.getByRole('button', { name: viewModel.title });
    expect(launch.getAttribute('aria-disabled')).toBeNull();
    expect(launch.getAttribute('aria-describedby')).toBeNull();
  });

  it('clicking a preview card opens the local preview viewer without a refusal marker', () => {
    const viewModel = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.leadershipMessage);
    const { container } = render(
      <FoleonFullWindowViewerProvider originPolicy={TEST_POLICY}>
        <LeadershipMessageReaderLayout viewModel={viewModel} iframeSurface={null} />
      </FoleonFullWindowViewerProvider>,
    );
    const card = container.querySelector('[data-foleon-article-card]');
    expect(card?.getAttribute('data-foleon-article-state')).toBe('preview');
    const launch = screen.getByRole('button', { name: viewModel.title });
    expect(launch.getAttribute('aria-disabled')).toBeNull();
    expect(launch.getAttribute('aria-describedby')).toBeNull();
    fireEvent.click(launch);
    expect(launch.getAttribute('data-foleon-article-last-refusal')).toBeNull();
    const dialog = document.querySelector('[data-foleon-full-window-viewer="active"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute('data-foleon-viewer-source')).toBe('preview');
    expect(dialog?.querySelector('iframe')).toBeNull();
  });

  it('keyboard activation on a preview card opens the local preview viewer', () => {
    const viewModel = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.leadershipMessage);
    const rendered = render(
      <FoleonFullWindowViewerProvider originPolicy={TEST_POLICY}>
        <LeadershipMessageReaderLayout viewModel={viewModel} iframeSurface={null} />
      </FoleonFullWindowViewerProvider>,
    );
    const launch = rendered.getByRole('button', { name: viewModel.title });
    fireEvent.keyDown(launch, { key: 'Enter' });
    fireEvent.click(launch);
    const dialog = document.querySelector('[data-foleon-full-window-viewer="active"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute('data-foleon-viewer-source')).toBe('preview');
    expect(dialog?.querySelector('iframe')).toBeNull();
  });

  it('records embed-not-allowed refusal when the underlying record blocks embedding', () => {
    const viewModel = buildReadyViewModel({ allowEmbed: false });
    const { container } = render(
      <LeadershipMessageReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );
    const card = container.querySelector('[data-foleon-article-card]');
    expect(card?.getAttribute('data-foleon-article-state')).toBe('disabled');
    const launch = screen.getByRole('button', { name: viewModel.title });
    expect(launch.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(launch);
    expect(launch.getAttribute('data-foleon-article-last-refusal')).toBe('embed-not-allowed');
  });

  it.each([
    ['no-embed-url', { embedUrl: undefined }],
    ['requires-external-open', { requiresExternalOpen: true }],
  ] as const)('records %s refusal for ready disabled records', (reason, overrides) => {
    const viewModel = buildReadyViewModel(overrides);
    const { container } = render(
      <LeadershipMessageReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );
    const card = container.querySelector('[data-foleon-article-card]');
    expect(card?.getAttribute('data-foleon-article-state')).toBe('disabled');
    const launch = screen.getByRole('button', { name: viewModel.title });
    expect(launch.getAttribute('aria-disabled')).toBe('true');
    const reasonId = launch.getAttribute('aria-describedby');
    expect(reasonId).toBeTruthy();
    expect(container.querySelector(`#${reasonId}`)).not.toBeNull();
    fireEvent.click(launch);
    expect(launch.getAttribute('data-foleon-article-last-refusal')).toBe(reason);
    expect(document.querySelector('[data-foleon-full-window-viewer="active"]')).toBeNull();
  });

  it('card has exactly one interactive control (single-button card-launch pattern, no nested controls)', () => {
    const viewModel = buildReadyViewModel();
    const { container } = render(
      <LeadershipMessageReaderLayout viewModel={viewModel} iframeSurface={null} />,
    );
    const card = container.querySelector('[data-foleon-article-card]') as HTMLElement;
    expect(card).not.toBeNull();
    const interactiveInsideCard = card.querySelectorAll(
      'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    expect(interactiveInsideCard.length).toBe(1);
    expect(interactiveInsideCard[0].tagName).toBe('BUTTON');
  });

  it('clicking the card-launch button opens the full-window viewer when wrapped in the provider', () => {
    const viewModel = buildReadyViewModel();
    const rendered = render(
      <FoleonFullWindowViewerProvider originPolicy={TEST_POLICY}>
        <LeadershipMessageReaderLayout viewModel={viewModel} iframeSurface={null} />
      </FoleonFullWindowViewerProvider>,
    );
    const launch = rendered.getByRole('button', { name: viewModel.title });
    fireEvent.click(launch);
    expect(screen.queryByRole('dialog')).not.toBeNull();
  });

  it('keyboard activation (Enter) on the card-launch button opens the viewer when wrapped in the provider', () => {
    const viewModel = buildReadyViewModel();
    const rendered = render(
      <FoleonFullWindowViewerProvider originPolicy={TEST_POLICY}>
        <LeadershipMessageReaderLayout viewModel={viewModel} iframeSurface={null} />
      </FoleonFullWindowViewerProvider>,
    );
    const launch = rendered.getByRole('button', { name: viewModel.title });
    fireEvent.keyDown(launch, { key: 'Enter' });
    fireEvent.click(launch);
    expect(screen.queryByRole('dialog')).not.toBeNull();
  });

  it('does not interfere with sibling lanes — Spotlight and Pulse render their own markers', () => {
    const spotlightVm = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.projectSpotlight);
    const pulseVm = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.companyPulse);
    const leadershipVm = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.leadershipMessage);
    const { container } = render(
      <>
        <ProjectSpotlightReaderLayout viewModel={spotlightVm} iframeSurface={null} />
        <CompanyPulseReaderLayout viewModel={pulseVm} iframeSurface={null} />
        <LeadershipMessageReaderLayout viewModel={leadershipVm} iframeSurface={null} />
      </>,
    );

    const spotlight = container.querySelector('[data-foleon-reader-layout="project-spotlight"]');
    const pulse = container.querySelector('[data-foleon-reader-layout="company-pulse"]');
    const leadership = container.querySelector('[data-foleon-reader-layout="leadership-message"]');
    expect(spotlight?.getAttribute('data-foleon-layout')).toBe('project-spotlight-feature');
    expect(pulse?.getAttribute('data-foleon-layout')).toBe('company-pulse-edition-launcher');
    expect(leadership?.getAttribute('data-foleon-layout')).toBe('leadership-message');
    // None of the three lanes emit legacy compatibility-shell markers anymore.
    expect(spotlight?.querySelector('[data-preview-tone]')).toBeNull();
    expect(pulse?.querySelector('[data-preview-tone]')).toBeNull();
    expect(leadership?.querySelector('[data-preview-tone]')).toBeNull();
    expect(spotlight?.querySelector('[data-foleon-preview-route]')).toBeNull();
    expect(pulse?.querySelector('[data-foleon-preview-route]')).toBeNull();
    expect(leadership?.querySelector('[data-foleon-preview-route]')).toBeNull();
  });
});
