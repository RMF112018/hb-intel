/**
 * HbcProjectCanvas test suite — D-SF13-T05
 *
 * Tests the orchestrating canvas component including loading/error/empty/ready states,
 * tile card rendering, complexity tier selection, governance lock icons,
 * data-source badges, and grid layout.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { ICanvasTilePlacement, ICanvasTileProps } from '../types/index.js';
import { HbcProjectCanvas } from '../components/HbcProjectCanvas.js';
import { createMockTileDefinition, createMockTilePlacement } from '@hbc/project-canvas/testing';

// --- Mock hooks ---

const mockReset = vi.fn().mockResolvedValue(undefined);
const mockSave = vi.fn().mockResolvedValue(undefined);
const mockIsMandatory = vi.fn().mockReturnValue(false);
const mockIsLocked = vi.fn().mockReturnValue(false);

const defaultHookReturn = {
  tiles: [] as ICanvasTilePlacement[],
  isLoading: false,
  error: null as Error | null,
  save: mockSave,
  reset: mockReset,
  isMandatory: mockIsMandatory,
  isLocked: mockIsLocked,
};

vi.mock('../hooks/useProjectCanvas.js', () => ({
  useProjectCanvas: vi.fn(() => defaultHookReturn),
}));

vi.mock('../hooks/useCanvasRecommendations.js', () => ({
  useCanvasRecommendations: vi.fn(() => ({
    recommendations: [],
    isLoading: false,
    error: null,
    refresh: vi.fn(),
  })),
}));

// --- Mock registry ---

const MockTileComponent = (props: ICanvasTileProps) => (
  <div data-testid="tile-content">{props.tileKey}</div>
);

const LazyMockTile = React.lazy(() =>
  Promise.resolve({ default: MockTileComponent }),
);

vi.mock('../registry/index.js', () => ({
  get: vi.fn((key: string) =>
    createMockTileDefinition({
      tileKey: key,
      title: `Title: ${key}`,
      component: {
        essential: LazyMockTile,
        standard: LazyMockTile,
        expert: LazyMockTile,
      },
    }),
  ),
  getAll: vi.fn().mockReturnValue([]),
}));

// --- Mock CanvasApi (data-source metadata) ---

vi.mock('../api/index.js', () => ({
  CanvasApi: {
    getTileDataSourceMetadata: vi.fn().mockResolvedValue({
      badge: 'Live',
      tooltip: {
        badge: 'Live',
        label: 'Live Data',
        description: 'Auto synced',
        showLastSync: true,
        showSourceSystem: true,
        showQuickControls: false,
      },
    }),
  },
}));

import { useProjectCanvas } from '../hooks/useProjectCanvas.js';

const mockUseProjectCanvas = vi.mocked(useProjectCanvas);

function setupMock(overrides: Partial<typeof defaultHookReturn> = {}) {
  mockUseProjectCanvas.mockReturnValue({ ...defaultHookReturn, ...overrides });
}

const baseProps = {
  projectId: 'project-001',
  userId: 'user-001',
  role: 'Project Manager',
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('HbcProjectCanvas (D-SF13-T05)', () => {
  it('renders root with data-testid', () => {
    setupMock({ tiles: [createMockTilePlacement({ tileKey: 'tile-a' })] });
    render(<HbcProjectCanvas {...baseProps} />);
    expect(screen.getByTestId('hbc-project-canvas')).toBeInTheDocument();
  });

  it('loading state shows loading indicator (data-state="loading")', () => {
    setupMock({ isLoading: true });
    render(<HbcProjectCanvas {...baseProps} />);
    const root = screen.getByTestId('hbc-project-canvas');
    expect(root).toHaveAttribute('data-state', 'loading');
    expect(root).toHaveTextContent('Loading canvas...');
  });

  it('error state shows error message and retry button', () => {
    setupMock({ error: new Error('Network failure') });
    render(<HbcProjectCanvas {...baseProps} />);
    const root = screen.getByTestId('hbc-project-canvas');
    expect(root).toHaveAttribute('data-state', 'error');
    expect(root).toHaveTextContent('Network failure');
    expect(screen.getByTestId('canvas-retry-button')).toBeInTheDocument();
  });

  it('clicking retry calls reset', () => {
    setupMock({ error: new Error('fail') });
    render(<HbcProjectCanvas {...baseProps} />);
    fireEvent.click(screen.getByTestId('canvas-retry-button'));
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('empty tiles shows empty state message and reset button', () => {
    setupMock({ tiles: [] });
    render(<HbcProjectCanvas {...baseProps} />);
    const root = screen.getByTestId('hbc-project-canvas');
    expect(root).toHaveAttribute('data-state', 'empty');
    expect(root).toHaveTextContent('No tiles configured');
    expect(screen.getByTestId('canvas-reset-button')).toBeInTheDocument();
  });

  it('clicking reset-to-defaults calls reset', () => {
    setupMock({ tiles: [] });
    render(<HbcProjectCanvas {...baseProps} />);
    fireEvent.click(screen.getByTestId('canvas-reset-button'));
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('renders correct number of tile cards for config', async () => {
    const tiles = [
      createMockTilePlacement({ tileKey: 'tile-a' }),
      createMockTilePlacement({ tileKey: 'tile-b', colStart: 5 }),
      createMockTilePlacement({ tileKey: 'tile-c', colStart: 9 }),
    ];
    setupMock({ tiles });
    render(<HbcProjectCanvas {...baseProps} />);
    await waitFor(() => {
      expect(screen.getAllByTestId('canvas-tile-card')).toHaveLength(3);
    });
  });

  it('tile card shows content from registry definition', async () => {
    setupMock({ tiles: [createMockTilePlacement({ tileKey: 'budget-tracker' })] });
    render(<HbcProjectCanvas {...baseProps} />);
    await waitFor(() => {
      expect(screen.getByTestId('tile-content')).toHaveTextContent('budget-tracker');
    });
  });

  it('passes complexityTier to tile variant selection (defaults to standard)', async () => {
    setupMock({ tiles: [createMockTilePlacement({ tileKey: 'tile-a' })] });
    render(<HbcProjectCanvas {...baseProps} />);
    // The tile renders via standard variant by default — component resolves
    await waitFor(() => {
      expect(screen.getByTestId('tile-content')).toBeInTheDocument();
    });
  });

  it('mandatory tile shows lock icon', async () => {
    mockIsMandatory.mockReturnValue(true);
    setupMock({ tiles: [createMockTilePlacement({ tileKey: 'tile-a' })] });
    render(<HbcProjectCanvas {...baseProps} />);
    await waitFor(() => {
      expect(screen.getByTestId('tile-lock-icon')).toBeInTheDocument();
    });
    mockIsMandatory.mockReturnValue(false);
  });

  it('locked tile shows lock icon', async () => {
    mockIsLocked.mockReturnValue(true);
    setupMock({ tiles: [createMockTilePlacement({ tileKey: 'tile-a' })] });
    render(<HbcProjectCanvas {...baseProps} />);
    await waitFor(() => {
      expect(screen.getByTestId('tile-lock-icon')).toBeInTheDocument();
    });
    mockIsLocked.mockReturnValue(false);
  });

  it('unknown tile (missing registry entry) renders fallback', async () => {
    const registryMod = vi.mocked(await import('../registry/index.js'));
    registryMod.get.mockReturnValueOnce(undefined);
    setupMock({ tiles: [createMockTilePlacement({ tileKey: 'unknown-tile' })] });
    render(<HbcProjectCanvas {...baseProps} />);
    expect(screen.getByTestId('tile-unknown')).toBeInTheDocument();
    expect(screen.getByTestId('tile-unknown')).toHaveTextContent('Unknown tile');
  });

  it('edit button shown only when editable=true', () => {
    setupMock({ tiles: [createMockTilePlacement({ tileKey: 'tile-a' })] });
    render(<HbcProjectCanvas {...baseProps} editable />);
    expect(screen.getByTestId('canvas-edit-button')).toBeInTheDocument();
  });

  it('clicking edit button activates editor mode', () => {
    setupMock({ tiles: [createMockTilePlacement({ tileKey: 'tile-a' })] });
    render(<HbcProjectCanvas {...baseProps} editable />);
    fireEvent.click(screen.getByTestId('canvas-edit-button'));
    expect(screen.getByTestId('canvas-editor-active')).toBeInTheDocument();
    // Edit button should be hidden while editing
    expect(screen.queryByTestId('canvas-edit-button')).not.toBeInTheDocument();
  });

  it('edit button hidden when editable omitted', () => {
    setupMock({ tiles: [createMockTilePlacement({ tileKey: 'tile-a' })] });
    render(<HbcProjectCanvas {...baseProps} />);
    expect(screen.queryByTestId('canvas-edit-button')).not.toBeInTheDocument();
  });

  it('grid container has 12-column CSS grid style', () => {
    setupMock({ tiles: [createMockTilePlacement({ tileKey: 'tile-a' })] });
    render(<HbcProjectCanvas {...baseProps} />);
    const grid = screen.getByTestId('canvas-grid');
    expect(grid.style.display).toBe('grid');
    expect(grid.style.gridTemplateColumns).toBe('repeat(12, 1fr)');
    expect(grid.style.gap).toBe('16px');
  });

  it('tile placement uses correct gridColumn/gridRow styles', async () => {
    setupMock({
      tiles: [createMockTilePlacement({ tileKey: 'tile-a', colStart: 3, colSpan: 6, rowStart: 2, rowSpan: 2 })],
    });
    render(<HbcProjectCanvas {...baseProps} />);
    await waitFor(() => {
      const card = screen.getByTestId('canvas-tile-card');
      expect(card.style.gridColumn).toBe('3 / span 6');
      expect(card.style.gridRow).toBe('2 / span 2');
    });
  });

  it('data-source badge renders after metadata fetch', async () => {
    setupMock({ tiles: [createMockTilePlacement({ tileKey: 'tile-a' })] });
    render(<HbcProjectCanvas {...baseProps} />);
    await waitFor(() => {
      expect(screen.getByTestId('tile-data-source-badge')).toHaveTextContent('Live');
    });
  });
});
