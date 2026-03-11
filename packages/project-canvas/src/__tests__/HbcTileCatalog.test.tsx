/**
 * HbcTileCatalog test suite — D-SF13-T06
 *
 * Tests the tile catalog browser including available tile rendering,
 * already-placed filtering, mandatory badge, add action, and empty state.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { HbcTileCatalog } from '../components/HbcTileCatalog.js';
import { createMockTileDefinition } from '@hbc/project-canvas/testing';

// --- Mock registry ---

const mockGetAll = vi.fn().mockReturnValue([]);

vi.mock('../registry/index.js', () => ({
  getAll: (...args: unknown[]) => mockGetAll(...args),
}));

// --- Helpers ---

const mockOnAddTile = vi.fn();
const mockOnClose = vi.fn();

const baseProps = {
  currentTiles: [] as string[],
  onAddTile: mockOnAddTile,
  onClose: mockOnClose,
};

function setup(overrides: Partial<typeof baseProps> = {}) {
  return render(<HbcTileCatalog {...baseProps} {...overrides} />);
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('HbcTileCatalog (D-SF13-T06)', () => {
  it('renders root with data-testid="hbc-tile-catalog"', () => {
    setup();
    expect(screen.getByTestId('hbc-tile-catalog')).toBeInTheDocument();
  });

  it('renders available tiles (excludes already-placed)', () => {
    mockGetAll.mockReturnValue([
      createMockTileDefinition({ tileKey: 'tile-a', title: 'Tile A' }),
      createMockTileDefinition({ tileKey: 'tile-b', title: 'Tile B' }),
      createMockTileDefinition({ tileKey: 'tile-c', title: 'Tile C' }),
    ]);
    setup({ currentTiles: ['tile-b'] });
    expect(screen.getByTestId('catalog-tile-tile-a')).toBeInTheDocument();
    expect(screen.queryByTestId('catalog-tile-tile-b')).not.toBeInTheDocument();
    expect(screen.getByTestId('catalog-tile-tile-c')).toBeInTheDocument();
  });

  it('shows tile title and description', () => {
    mockGetAll.mockReturnValue([
      createMockTileDefinition({ tileKey: 'tile-a', title: 'Budget Tracker', description: 'Track project budget' }),
    ]);
    setup();
    expect(screen.getByTestId('catalog-tile-title-tile-a')).toHaveTextContent('Budget Tracker');
    expect(screen.getByTestId('catalog-tile-description-tile-a')).toHaveTextContent('Track project budget');
  });

  it('clicking add calls onAddTile and onClose', () => {
    mockGetAll.mockReturnValue([
      createMockTileDefinition({ tileKey: 'tile-a', title: 'Tile A' }),
    ]);
    setup();
    fireEvent.click(screen.getByTestId('catalog-add-tile-a'));
    expect(mockOnAddTile).toHaveBeenCalledWith('tile-a');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('close button calls onClose', () => {
    setup();
    fireEvent.click(screen.getByTestId('catalog-close-button'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('empty state when all tiles already placed', () => {
    mockGetAll.mockReturnValue([
      createMockTileDefinition({ tileKey: 'tile-a', title: 'Tile A' }),
    ]);
    setup({ currentTiles: ['tile-a'] });
    expect(screen.getByTestId('catalog-empty')).toBeInTheDocument();
    expect(screen.getByTestId('catalog-empty')).toHaveTextContent('No additional tiles available');
  });

  it('mandatory tile shows mandatory badge', () => {
    mockGetAll.mockReturnValue([
      createMockTileDefinition({ tileKey: 'tile-m', title: 'Mandatory Tile', mandatory: true }),
    ]);
    setup();
    expect(screen.getByTestId('catalog-tile-mandatory-tile-m')).toHaveTextContent('Mandatory');
  });

  it('filters out tiles in currentTiles array', () => {
    mockGetAll.mockReturnValue([
      createMockTileDefinition({ tileKey: 'placed-1', title: 'Placed One' }),
      createMockTileDefinition({ tileKey: 'placed-2', title: 'Placed Two' }),
      createMockTileDefinition({ tileKey: 'available-1', title: 'Available One' }),
    ]);
    setup({ currentTiles: ['placed-1', 'placed-2'] });
    expect(screen.queryByTestId('catalog-tile-placed-1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('catalog-tile-placed-2')).not.toBeInTheDocument();
    expect(screen.getByTestId('catalog-tile-available-1')).toBeInTheDocument();
  });
});
