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
import type { FoleonViewerTarget } from '../FoleonViewerTypes.js';
import layoutStyles from '../layouts/FoleonReaderLayouts.module.css';

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

function buildPreviewWithFirstSupportingDisabled(): FoleonReaderViewModel {
  const vm = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.companyPulse);
  const board = vm.pulseBoard!;
  const first = board.supportingStories[0];
  const disabledTarget: FoleonViewerTarget = {
    id: `${first.id}-disabled-test`,
    lane: 'companyPulse',
    source: 'active-record',
    renderMode: 'iframe',
    title: first.title,
    viewerUrl: undefined,
    canOpen: false,
    disabledReason: 'embed-not-allowed',
  };
  return {
    ...vm,
    pulseBoard: {
      ...board,
      supportingStories: [{ ...first, target: disabledTarget }, ...board.supportingStories.slice(1)],
    },
  };
}

describe('CompanyPulseReaderLayout — editorial board composition', () => {
  it('emits editorial-board marker with stable lane markers', () => {
    const viewModel = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.companyPulse);
    const { container } = render(<CompanyPulseReaderLayout viewModel={viewModel} iframeSurface={null} />);
    const wrapper = container.querySelector('[data-foleon-layout="company-pulse-editorial-board"]');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.getAttribute('data-foleon-reader-layout')).toBe('company-pulse');
    expect(wrapper?.getAttribute('data-foleon-reader-lane')).toBe('companyPulse');
    expect(wrapper?.getAttribute('data-foleon-reader-state')).toBe('preview');
  });

  it('preview demonstrates featured + four sample supporting cards', () => {
    const vm = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.companyPulse);
    const { container } = render(<CompanyPulseReaderLayout viewModel={vm} iframeSurface={null} />);
    expect(screen.getByText(/Latest from Company Pulse \(Preview\)/)).toBeTruthy();
    expect(screen.getByText(/Sample layout showing a featured story and supporting Company Pulse story board/i)).toBeTruthy();
    expect(container.querySelectorAll('[data-foleon-pulse-story-state="preview-sample"]').length).toBe(4);
    expect(container.querySelectorAll('[data-foleon-article-card]').length).toBe(5);
    expect(container.querySelector(`.${layoutStyles.pulseFeaturedStack}`)).not.toBeNull();
  });

  it('preview supporting article cards expose viewer target markers', () => {
    const vm = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.companyPulse);
    const { container } = render(<CompanyPulseReaderLayout viewModel={vm} iframeSurface={null} />);
    const supporting = container.querySelectorAll('[data-foleon-pulse-story-state="preview-sample"]');
    expect(supporting.length).toBe(4);
    supporting.forEach((node) => {
      expect(node.getAttribute('data-foleon-article-lane')).toBe('companyPulse');
      expect(node.getAttribute('data-foleon-viewer-target-id')).toBeTruthy();
      expect(node.getAttribute('data-foleon-article-state')).toBe('preview');
    });
  });

  it('preview supporting card opens local preview viewer', () => {
    const vm = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.companyPulse);
    const policy = createFoleonOriginPolicy(['https://viewer.us.foleon.com']);
    render(
      <FoleonFullWindowViewerProvider originPolicy={policy}>
        <CompanyPulseReaderLayout viewModel={vm} iframeSurface={null} />
      </FoleonFullWindowViewerProvider>,
    );
    const supportingTitle = vm.pulseBoard!.supportingStories[0].title;
    const launch = screen.getByRole('button', { name: supportingTitle });
    fireEvent.click(launch);
    const dialog = document.querySelector('[data-foleon-full-window-viewer="active"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute('data-foleon-viewer-source')).toBe('preview');
    expect(dialog?.querySelector('iframe')).toBeNull();
  });

  it('each preview supporting card has exactly one native button', () => {
    const vm = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.companyPulse);
    const { container } = render(<CompanyPulseReaderLayout viewModel={vm} iframeSurface={null} />);
    const board = container.querySelector('[aria-label="Supporting Company Pulse stories"]');
    expect(board).not.toBeNull();
    const articles = board!.querySelectorAll('[data-foleon-pulse-story-state="preview-sample"]');
    expect(articles.length).toBe(4);
    articles.forEach((article) => {
      const buttons = article.querySelectorAll('button');
      expect(buttons.length).toBe(1);
    });
  });

  it('disabled supporting card records refusal and shows visible reason', () => {
    const vm = buildPreviewWithFirstSupportingDisabled();
    const { container } = render(<CompanyPulseReaderLayout viewModel={vm} iframeSurface={null} />);
    const supportingTitle = vm.pulseBoard!.supportingStories[0].title;
    const launch = screen.getByRole('button', { name: supportingTitle });
    expect(launch.getAttribute('aria-disabled')).toBe('true');
    const reasonId = launch.getAttribute('aria-describedby');
    expect(reasonId).toBeTruthy();
    expect(container.querySelector(`#${reasonId}`)).not.toBeNull();
    fireEvent.click(launch);
    expect(launch.getAttribute('data-foleon-article-last-refusal')).toBe('embed-not-allowed');
  });

  it('preview supporting cards are clearly sample stories', () => {
    const vm = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.companyPulse);
    render(<CompanyPulseReaderLayout viewModel={vm} iframeSurface={null} />);
    expect(screen.getAllByText(/Sample story/i).length).toBeGreaterThan(1);
  });

  it('ready renders one real featured card and honest supporting-board empty state', () => {
    const vm = buildReadyViewModel();
    const { container } = render(<CompanyPulseReaderLayout viewModel={vm} iframeSurface={null} />);
    const featured = container.querySelector('[data-foleon-article-card]');
    expect(featured).not.toBeNull();
    expect(featured?.textContent ?? '').toContain('Companywide April Brief');
    const emptyBoard = container.querySelector('[data-foleon-pulse-board-state="empty"]');
    expect(emptyBoard).not.toBeNull();
    expect(emptyBoard?.textContent ?? '').toMatch(/Additional Company Pulse stories/i);
    expect(container.querySelectorAll('[data-foleon-pulse-story-state="live"]').length).toBe(0);
  });

  it('does not render digest/timeline DOM in active layout', () => {
    const vm = buildReadyViewModel();
    const { container } = render(<CompanyPulseReaderLayout viewModel={vm} iframeSurface={null} />);
    expect(container.querySelector('[data-foleon-pulse-digest-state="populated"]')).toBeNull();
    expect(container.querySelector('[data-foleon-pulse-digest-state="empty"]')).toBeNull();
    expect(container.querySelector('[aria-label="Pulse timeline"]')).toBeNull();
  });

  it('keeps no inline iframe posture even when iframeSurface is passed', () => {
    const vm = buildReadyViewModel();
    const rendered = render(
      <CompanyPulseReaderLayout
        viewModel={vm}
        iframeSurface={<iframe title="should-not-render-inline" />}
      />,
    );
    expect(rendered.container.querySelector('iframe')).toBeNull();
  });

  it('featured card preserves stable interaction markers', () => {
    const vm = buildReadyViewModel();
    const { container } = render(<CompanyPulseReaderLayout viewModel={vm} iframeSurface={null} />);
    const card = container.querySelector('[data-foleon-article-card]');
    expect(card).not.toBeNull();
    expect(card?.getAttribute('data-foleon-article-lane')).toBe('companyPulse');
    expect(card?.getAttribute('data-foleon-article-state')).toBe('enabled');
    expect(card?.getAttribute('data-foleon-viewer-target-id')).toMatch(/^company-pulse-active-/);
    expect(card?.textContent ?? '').toContain('Open story');
  });

  it('featured preview card opens local preview viewer', () => {
    const vm = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.companyPulse);
    const policy = createFoleonOriginPolicy(['https://viewer.us.foleon.com']);
    render(
      <FoleonFullWindowViewerProvider originPolicy={policy}>
        <CompanyPulseReaderLayout viewModel={vm} iframeSurface={null} />
      </FoleonFullWindowViewerProvider>,
    );
    const launch = screen.getByRole('button', { name: vm.pulseBoard!.featuredStory.title });
    fireEvent.click(launch);
    const dialog = document.querySelector('[data-foleon-full-window-viewer="active"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute('data-foleon-viewer-source')).toBe('preview');
    expect(dialog?.querySelector('iframe')).toBeNull();
  });

  it('featured ready card opens viewer when wrapped in provider', () => {
    const vm = buildReadyViewModel();
    const policy = createFoleonOriginPolicy(['https://viewer.us.foleon.com']);
    render(
      <FoleonFullWindowViewerProvider originPolicy={policy}>
        <CompanyPulseReaderLayout viewModel={vm} iframeSurface={null} />
      </FoleonFullWindowViewerProvider>,
    );
    const launch = screen.getByRole('button', { name: vm.pulseBoard!.featuredStory.title });
    fireEvent.click(launch);
    expect(screen.queryByRole('dialog')).not.toBeNull();
  });

  it.each([
    ['embed-not-allowed', { allowEmbed: false }],
    ['no-embed-url', { embedUrl: undefined }],
    ['requires-external-open', { requiresExternalOpen: true }],
  ] as const)('disabled featured card records %s refusal and does not open viewer', (reason, overrides) => {
    const vm = buildReadyViewModel(overrides);
    const { container } = render(<CompanyPulseReaderLayout viewModel={vm} iframeSurface={null} />);
    const launch = screen.getByRole('button', { name: vm.pulseBoard!.featuredStory.title });
    expect(launch.getAttribute('aria-disabled')).toBe('true');
    const reasonId = launch.getAttribute('aria-describedby');
    expect(reasonId).toBeTruthy();
    expect(container.querySelector(`#${reasonId}`)).not.toBeNull();
    fireEvent.click(launch);
    expect(launch.getAttribute('data-foleon-article-last-refusal')).toBe(reason);
    expect(document.querySelector('[data-foleon-full-window-viewer="active"]')).toBeNull();
  });

  it('featured card has exactly one interactive control', () => {
    const vm = buildReadyViewModel();
    const { container } = render(<CompanyPulseReaderLayout viewModel={vm} iframeSurface={null} />);
    const card = container.querySelector('[data-foleon-article-card]') as HTMLElement;
    const interactiveInsideCard = card.querySelectorAll(
      'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    expect(interactiveInsideCard.length).toBe(1);
    expect(interactiveInsideCard[0].tagName).toBe('BUTTON');
  });

  it('outer wrapper remains edge-bleed-ready', () => {
    const vm = createPreviewFoleonReaderViewModel(FOLEON_READER_CONFIGS.companyPulse);
    const { container } = render(<CompanyPulseReaderLayout viewModel={vm} iframeSurface={null} />);
    const wrapper = container.querySelector('[data-foleon-layout="company-pulse-editorial-board"]') as HTMLElement | null;
    expect(wrapper).not.toBeNull();
    expect(wrapper?.style.marginInline).toBe('');
    expect(wrapper?.style.marginLeft).toBe('');
    expect(wrapper?.style.marginRight).toBe('');
  });

  it('does not interfere with sibling lane markers', () => {
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

    const spotlight = container.querySelector('[data-foleon-reader-layout="project-spotlight"]');
    const pulse = container.querySelector('[data-foleon-reader-layout="company-pulse"]');
    const leadership = container.querySelector('[data-foleon-reader-layout="leadership-message"]');
    expect(spotlight?.getAttribute('data-foleon-layout')).toBe('project-spotlight-feature');
    expect(pulse?.getAttribute('data-foleon-layout')).toBe('company-pulse-editorial-board');
    expect(leadership?.getAttribute('data-foleon-layout')).toBe('leadership-message');
  });
});
