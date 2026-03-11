/**
 * useRoleDefaultCanvas test suite — D-SF13-T08
 *
 * Covers role-default tile resolution, row wrapping, and undefined definition fallback.
 */
import { renderHook } from '@testing-library/react';
import { useRoleDefaultCanvas } from '../hooks/useRoleDefaultCanvas.js';
import { createMockTileDefinition } from '@hbc/project-canvas/testing';

vi.mock('../registry/index.js', () => ({
  get: vi.fn((key: string) => {
    if (key === 'bic-my-items') return createMockTileDefinition({ tileKey: 'bic-my-items', defaultColSpan: 4, defaultRowSpan: 1 });
    if (key === 'project-health-pulse') return createMockTileDefinition({ tileKey: 'project-health-pulse', defaultColSpan: 6, defaultRowSpan: 1 });
    if (key === 'pending-approvals') return createMockTileDefinition({ tileKey: 'pending-approvals', defaultColSpan: 4, defaultRowSpan: 1 });
    if (key === 'active-constraints') return createMockTileDefinition({ tileKey: 'active-constraints', defaultColSpan: 4, defaultRowSpan: 1 });
    if (key === 'bd-heritage') return createMockTileDefinition({ tileKey: 'bd-heritage', defaultColSpan: 4, defaultRowSpan: 1 });
    if (key === 'workflow-handoff-inbox') return createMockTileDefinition({ tileKey: 'workflow-handoff-inbox', defaultColSpan: 6, defaultRowSpan: 1 });
    return undefined; // unregistered tile
  }),
  getAll: vi.fn().mockReturnValue([]),
}));

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useRoleDefaultCanvas (D-SF13-T08)', () => {
  it('returns empty array for unknown role', () => {
    const { result } = renderHook(() => useRoleDefaultCanvas('Unknown Role'));
    expect(result.current.tiles).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('resolves tile placements from ROLE_DEFAULT_TILES for known role', () => {
    const { result } = renderHook(() => useRoleDefaultCanvas('Project Manager'));
    expect(result.current.tiles.length).toBeGreaterThan(0);
    expect(result.current.tiles[0].tileKey).toBe('bic-my-items');
  });

  it('wraps tiles to next row when exceeding grid columns', () => {
    // Project Manager: bic-my-items(4) + project-health-pulse(6) = 10 cols (row 1)
    // pending-approvals(4) would be col 11, 11+4-1=14 > 12, so wraps to row 2
    const { result } = renderHook(() => useRoleDefaultCanvas('Project Manager'));
    const pendingApprovals = result.current.tiles.find((t) => t.tileKey === 'pending-approvals');
    const bicMyItems = result.current.tiles.find((t) => t.tileKey === 'bic-my-items');

    expect(bicMyItems?.rowStart).toBe(1);
    // pending-approvals should have wrapped to a new row
    if (pendingApprovals) {
      expect(pendingApprovals.colStart).toBe(1);
    }
  });

  it('uses DEFAULT_COL_SPAN for unregistered tile key', async () => {
    // Override get to return undefined for all tiles
    const registryMod = vi.mocked(await import('../registry/index.js'));
    registryMod.get.mockReturnValue(undefined);

    const { result } = renderHook(() => useRoleDefaultCanvas('Project Manager'));

    // Should still produce placements using DEFAULT_COL_SPAN (4) and DEFAULT_ROW_SPAN (1)
    for (const tile of result.current.tiles) {
      expect(tile.colSpan).toBe(4);
      expect(tile.rowSpan).toBe(1);
    }
  });

  it('isLoading is always false (synchronous resolution)', () => {
    const { result } = renderHook(() => useRoleDefaultCanvas('Project Manager'));
    expect(result.current.isLoading).toBe(false);
  });
});
