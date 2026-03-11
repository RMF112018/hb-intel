/**
 * CanvasTileCard test suite — D-SF13-T08, D-04, D-05, D-06, D-08
 *
 * Covers rendering, grid normalization, complexity variant selection,
 * data-source badge, lock/mandatory indicators, and unknown tile fallback.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import type { ICanvasTileProps } from '../types/index.js';
import { CanvasTileCard } from '../components/CanvasTileCard.js';
import { createMockTileDefinition, createMockTilePlacement } from '@hbc/project-canvas/testing';
import {
  MIN_COL_SPAN,
  MAX_COL_SPAN,
  MIN_ROW_SPAN,
  MAX_ROW_SPAN,
} from '../constants/index.js';

// --- Mock registry ---

const EssentialComponent = (props: ICanvasTileProps) => (
  <div data-testid="tile-variant" data-tier="essential">{props.tileKey}</div>
);
const StandardComponent = (props: ICanvasTileProps) => (
  <div data-testid="tile-variant" data-tier="standard">{props.tileKey}</div>
);
const ExpertComponent = (props: ICanvasTileProps) => (
  <div data-testid="tile-variant" data-tier="expert">{props.tileKey}</div>
);

const LazyEssential = React.lazy(() => Promise.resolve({ default: EssentialComponent }));
const LazyStandard = React.lazy(() => Promise.resolve({ default: StandardComponent }));
const LazyExpert = React.lazy(() => Promise.resolve({ default: ExpertComponent }));

const mockDefinition = createMockTileDefinition({
  tileKey: 'test-tile',
  component: {
    essential: LazyEssential,
    standard: LazyStandard,
    expert: LazyExpert,
  },
});

vi.mock('../registry/index.js', () => ({
  get: vi.fn((key: string) => {
    if (key === 'unknown-tile') return undefined;
    return { ...mockDefinition, tileKey: key };
  }),
  getAll: vi.fn().mockReturnValue([]),
}));

// --- Mock CanvasApi ---

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

import { CanvasApi } from '../api/index.js';

afterEach(() => {
  vi.clearAllMocks();
});

const defaultProps = {
  projectId: 'project-001',
  complexityTier: 'standard' as const,
  isMandatory: false,
  isLocked: false,
};

describe('CanvasTileCard (D-SF13-T08, D-04, D-05, D-06, D-08)', () => {
  describe('Rendering', () => {
    it('renders with data-testid="canvas-tile-card"', async () => {
      render(
        <CanvasTileCard
          placement={createMockTilePlacement({ tileKey: 'test-tile' })}
          {...defaultProps}
        />,
      );
      await waitFor(() => {
        expect(screen.getByTestId('canvas-tile-card')).toBeInTheDocument();
      });
    });

    it('applies gridColumn/gridRow from placement', async () => {
      render(
        <CanvasTileCard
          placement={createMockTilePlacement({ tileKey: 'test-tile', colStart: 3, colSpan: 6, rowStart: 2, rowSpan: 2 })}
          {...defaultProps}
        />,
      );
      await waitFor(() => {
        const card = screen.getByTestId('canvas-tile-card');
        expect(card.style.gridColumn).toBe('3 / span 6');
        expect(card.style.gridRow).toBe('2 / span 2');
      });
    });

    it('renders Suspense fallback while lazy component loads', async () => {
      // Use a component that never resolves to keep Suspense in fallback state
      const NeverResolve = React.lazy(() => new Promise<{ default: React.ComponentType<ICanvasTileProps> }>(() => {}));
      const registryMod = vi.mocked(await import('../registry/index.js'));
      registryMod.get.mockReturnValueOnce(
        createMockTileDefinition({
          tileKey: 'slow-tile',
          component: { essential: NeverResolve, standard: NeverResolve, expert: NeverResolve },
        }),
      );
      render(
        <CanvasTileCard
          placement={createMockTilePlacement({ tileKey: 'slow-tile' })}
          {...defaultProps}
        />,
      );
      expect(screen.getByTestId('tile-loading')).toHaveTextContent('Loading tile...');
    });
  });

  describe('Grid normalization (D-04)', () => {
    it('clamps colSpan below MIN_COL_SPAN to MIN_COL_SPAN', async () => {
      render(
        <CanvasTileCard
          placement={createMockTilePlacement({ tileKey: 'test-tile', colSpan: 1, colStart: 1 })}
          {...defaultProps}
        />,
      );
      await waitFor(() => {
        const card = screen.getByTestId('canvas-tile-card');
        expect(card.style.gridColumn).toBe(`1 / span ${MIN_COL_SPAN}`);
      });
    });

    it('clamps colSpan above MAX_COL_SPAN to MAX_COL_SPAN', async () => {
      render(
        <CanvasTileCard
          placement={createMockTilePlacement({ tileKey: 'test-tile', colSpan: 20, colStart: 1 })}
          {...defaultProps}
        />,
      );
      await waitFor(() => {
        const card = screen.getByTestId('canvas-tile-card');
        expect(card.style.gridColumn).toBe(`1 / span ${MAX_COL_SPAN}`);
      });
    });

    it('clamps rowSpan below MIN_ROW_SPAN to MIN_ROW_SPAN', async () => {
      render(
        <CanvasTileCard
          placement={createMockTilePlacement({ tileKey: 'test-tile', rowSpan: 0 })}
          {...defaultProps}
        />,
      );
      await waitFor(() => {
        const card = screen.getByTestId('canvas-tile-card');
        expect(card.style.gridRow).toContain(`span ${MIN_ROW_SPAN}`);
      });
    });

    it('clamps rowSpan above MAX_ROW_SPAN to MAX_ROW_SPAN', async () => {
      render(
        <CanvasTileCard
          placement={createMockTilePlacement({ tileKey: 'test-tile', rowSpan: 10 })}
          {...defaultProps}
        />,
      );
      await waitFor(() => {
        const card = screen.getByTestId('canvas-tile-card');
        expect(card.style.gridRow).toContain(`span ${MAX_ROW_SPAN}`);
      });
    });

    it('resets colStart to 1 when placement overflows grid', async () => {
      render(
        <CanvasTileCard
          placement={createMockTilePlacement({ tileKey: 'test-tile', colStart: 11, colSpan: 4 })}
          {...defaultProps}
        />,
      );
      await waitFor(() => {
        const card = screen.getByTestId('canvas-tile-card');
        // colStart 11 + colSpan 4 - 1 = 14 > 12, so colStart resets to 1
        expect(card.style.gridColumn).toBe('1 / span 4');
      });
    });
  });

  describe('Complexity variant selection (D-06)', () => {
    it('selects essential variant when complexityTier="essential"', async () => {
      render(
        <CanvasTileCard
          placement={createMockTilePlacement({ tileKey: 'test-tile' })}
          {...defaultProps}
          complexityTier="essential"
        />,
      );
      await waitFor(() => {
        const variant = screen.getByTestId('tile-variant');
        expect(variant).toHaveAttribute('data-tier', 'essential');
      });
    });

    it('selects standard variant when complexityTier="standard"', async () => {
      render(
        <CanvasTileCard
          placement={createMockTilePlacement({ tileKey: 'test-tile' })}
          {...defaultProps}
          complexityTier="standard"
        />,
      );
      await waitFor(() => {
        const variant = screen.getByTestId('tile-variant');
        expect(variant).toHaveAttribute('data-tier', 'standard');
      });
    });

    it('selects expert variant when complexityTier="expert"', async () => {
      render(
        <CanvasTileCard
          placement={createMockTilePlacement({ tileKey: 'test-tile' })}
          {...defaultProps}
          complexityTier="expert"
        />,
      );
      await waitFor(() => {
        const variant = screen.getByTestId('tile-variant');
        expect(variant).toHaveAttribute('data-tier', 'expert');
      });
    });
  });

  describe('Data-source badge (D-08)', () => {
    it('renders badge after metadata fetch resolves', async () => {
      render(
        <CanvasTileCard
          placement={createMockTilePlacement({ tileKey: 'test-tile' })}
          {...defaultProps}
        />,
      );
      await waitFor(() => {
        expect(screen.getByTestId('tile-data-source-badge')).toHaveTextContent('Live');
      });
    });

    it('does not render badge when API rejects (graceful degradation)', async () => {
      vi.mocked(CanvasApi.getTileDataSourceMetadata).mockRejectedValueOnce(new Error('API down'));
      render(
        <CanvasTileCard
          placement={createMockTilePlacement({ tileKey: 'test-tile' })}
          {...defaultProps}
        />,
      );
      await waitFor(() => {
        expect(screen.getByTestId('tile-variant')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('tile-data-source-badge')).not.toBeInTheDocument();
    });
  });

  describe('Lock/mandatory (D-05)', () => {
    it('renders lock icon when isMandatory=true', async () => {
      render(
        <CanvasTileCard
          placement={createMockTilePlacement({ tileKey: 'test-tile' })}
          {...defaultProps}
          isMandatory={true}
        />,
      );
      await waitFor(() => {
        expect(screen.getByTestId('tile-lock-icon')).toBeInTheDocument();
      });
    });

    it('renders lock icon when isLocked=true', async () => {
      render(
        <CanvasTileCard
          placement={createMockTilePlacement({ tileKey: 'test-tile' })}
          {...defaultProps}
          isLocked={true}
        />,
      );
      await waitFor(() => {
        expect(screen.getByTestId('tile-lock-icon')).toBeInTheDocument();
      });
    });

    it('no lock icon when both false', async () => {
      render(
        <CanvasTileCard
          placement={createMockTilePlacement({ tileKey: 'test-tile' })}
          {...defaultProps}
        />,
      );
      await waitFor(() => {
        expect(screen.getByTestId('tile-variant')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('tile-lock-icon')).not.toBeInTheDocument();
    });
  });

  describe('Unknown tile', () => {
    it('renders fallback for unregistered tileKey', () => {
      render(
        <CanvasTileCard
          placement={createMockTilePlacement({ tileKey: 'unknown-tile' })}
          {...defaultProps}
        />,
      );
      expect(screen.getByTestId('tile-unknown')).toBeInTheDocument();
      expect(screen.getByTestId('tile-unknown')).toHaveTextContent('Unknown tile: unknown-tile');
    });
  });
});
