import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import {
  FOLEON_READER_LAYOUTS,
  getFoleonReaderLayout,
} from '../FoleonReaderLayoutRegistry.js';
import {
  createPreviewFoleonReaderViewModel,
  type FoleonReaderLayoutKey,
} from '../FoleonReaderViewModel.js';
import { FOLEON_READER_CONFIGS } from '../readerConfigs.js';

const LAYOUT_KEYS: readonly FoleonReaderLayoutKey[] = [
  'projectSpotlight',
  'companyPulse',
  'leadershipMessage',
];

const EXPECTED_MARKER: Readonly<Record<FoleonReaderLayoutKey, string>> = {
  projectSpotlight: 'project-spotlight',
  companyPulse: 'company-pulse',
  leadershipMessage: 'leadership-message',
};

describe('FoleonReaderLayoutRegistry', () => {
  it('exposes a unique layout component for every governed lane key', () => {
    const componentsSeen = new Set<unknown>();
    for (const key of LAYOUT_KEYS) {
      const component = FOLEON_READER_LAYOUTS[key];
      expect(component).toBeDefined();
      expect(componentsSeen.has(component)).toBe(false);
      componentsSeen.add(component);
    }
  });

  it('getFoleonReaderLayout returns the same reference as the registry map', () => {
    for (const key of LAYOUT_KEYS) {
      expect(getFoleonReaderLayout(key)).toBe(FOLEON_READER_LAYOUTS[key]);
    }
  });
});

describe('FoleonReaderLayoutRegistry — lane wrappers emit unique markers', () => {
  afterEach(() => {
    cleanup();
  });

  it.each([
    ['projectSpotlight', FOLEON_READER_CONFIGS.projectSpotlight] as const,
    ['companyPulse', FOLEON_READER_CONFIGS.companyPulse] as const,
    ['leadershipMessage', FOLEON_READER_CONFIGS.leadershipMessage] as const,
  ])('renders %s layout wrapper with the matching layout marker', (laneKey, config) => {
    const Layout = getFoleonReaderLayout(laneKey);
    const viewModel = createPreviewFoleonReaderViewModel(config);
    const { container } = render(<Layout viewModel={viewModel} iframeSurface={null} />);

    const wrapper = container.querySelector(
      `[data-foleon-reader-layout="${EXPECTED_MARKER[laneKey]}"]`,
    );
    expect(wrapper).not.toBeNull();
    expect(wrapper?.getAttribute('data-foleon-reader-lane')).toBe(laneKey);
    expect(wrapper?.getAttribute('data-foleon-reader-state')).toBe('preview');
    cleanup();
  });

  it('preview and ready states for the same lane share the same data-foleon-reader-layout marker', () => {
    const Layout = getFoleonReaderLayout('projectSpotlight');
    const config = FOLEON_READER_CONFIGS.projectSpotlight;

    const previewVm = createPreviewFoleonReaderViewModel(config);
    const previewRender = render(<Layout viewModel={previewVm} iframeSurface={null} />);
    const previewWrapper = previewRender.container.querySelector(
      '[data-foleon-reader-layout]',
    );
    expect(previewWrapper?.getAttribute('data-foleon-reader-layout')).toBe('project-spotlight');
    expect(previewWrapper?.getAttribute('data-foleon-reader-state')).toBe('preview');
    cleanup();

    // Build a minimal ready view model to render the same lane in ready state.
    // Using the public adapter avoids reproducing freshness/audience logic here.
    const readyVm = {
      ...previewVm,
      state: 'ready' as const,
      iframe: { title: 'Project Spotlight: Hosted edition', visible: true },
      actions: [],
      governanceNotes: [],
      statusNotes: [],
      chips: [],
      supportItems: [],
      facts: [
        { id: 'freshness', label: 'Monthly status', value: 'Apr 1, 2026' },
        { id: 'audience', label: 'Audience', value: 'Companywide' },
        { id: 'archive-group', label: 'Archive group', value: 'Archive coming soon' },
      ],
      title: 'Hosted edition',
      summary: undefined,
      titleElementId: 'project-spotlight-reader-title',
      previewLabel: undefined,
      warnings: [],
    };
    const readyRender = render(<Layout viewModel={readyVm} iframeSurface={null} />);
    const readyWrapper = readyRender.container.querySelector('[data-foleon-reader-layout]');
    expect(readyWrapper?.getAttribute('data-foleon-reader-layout')).toBe('project-spotlight');
    expect(readyWrapper?.getAttribute('data-foleon-reader-state')).toBe('ready');
  });

  it('three lane wrappers in one tree emit three distinct layout markers', () => {
    const tree = render(
      <>
        {LAYOUT_KEYS.map((key) => {
          const Layout = getFoleonReaderLayout(key);
          const config =
            key === 'projectSpotlight'
              ? FOLEON_READER_CONFIGS.projectSpotlight
              : key === 'companyPulse'
                ? FOLEON_READER_CONFIGS.companyPulse
                : FOLEON_READER_CONFIGS.leadershipMessage;
          const viewModel = createPreviewFoleonReaderViewModel(config);
          return (
            <Layout key={key} viewModel={viewModel} iframeSurface={null} />
          );
        })}
      </>,
    );

    const markers = Array.from(
      tree.container.querySelectorAll('[data-foleon-reader-layout]'),
    ).map((el) => el.getAttribute('data-foleon-reader-layout'));
    expect(new Set(markers)).toEqual(
      new Set(['project-spotlight', 'company-pulse', 'leadership-message']),
    );
    expect(markers).toHaveLength(3);
  });
});

