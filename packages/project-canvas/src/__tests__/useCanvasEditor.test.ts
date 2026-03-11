import { renderHook, act } from '@testing-library/react';
import { useCanvasEditor } from '../hooks/useCanvasEditor.js';
import { createMockTilePlacement, createMockTileDefinition } from '@hbc/project-canvas/testing';
import { CANVAS_GRID_COLUMNS, MIN_COL_SPAN, MAX_COL_SPAN, MIN_ROW_SPAN, MAX_ROW_SPAN } from '../constants/index.js';

vi.mock('../registry/index.js', () => ({
  get: vi.fn((key: string) => {
    if (key === 'wide-tile') return createMockTileDefinition({ tileKey: 'wide-tile', defaultColSpan: 6, defaultRowSpan: 2 });
    if (key === 'new-tile') return createMockTileDefinition({ tileKey: 'new-tile', defaultColSpan: 4, defaultRowSpan: 1 });
    return undefined;
  }),
  getAll: vi.fn().mockReturnValue([]),
}));

afterEach(() => {
  vi.restoreAllMocks();
});

const noOpOptions = {
  isMandatory: () => false,
  isLocked: () => false,
};

describe('useCanvasEditor (D-SF13-T04, D-04, D-05)', () => {
  it('initializes with provided tiles', () => {
    const tiles = [createMockTilePlacement({ tileKey: 'tile-a' })];
    const { result } = renderHook(() => useCanvasEditor(tiles, noOpOptions));
    expect(result.current.tiles).toEqual(tiles);
  });

  it('hasUnsavedChanges is false initially', () => {
    const tiles = [createMockTilePlacement({ tileKey: 'tile-a' })];
    const { result } = renderHook(() => useCanvasEditor(tiles, noOpOptions));
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  it('addTile appends tile with registry defaults', () => {
    const { result } = renderHook(() => useCanvasEditor([], noOpOptions));

    act(() => result.current.addTile('wide-tile'));

    expect(result.current.tiles).toHaveLength(1);
    expect(result.current.tiles[0].tileKey).toBe('wide-tile');
    expect(result.current.tiles[0].colSpan).toBe(6);
    expect(result.current.tiles[0].rowSpan).toBe(2);
  });

  it('addTile deduplicates by tileKey (no-op on existing)', () => {
    const tiles = [createMockTilePlacement({ tileKey: 'wide-tile' })];
    const { result } = renderHook(() => useCanvasEditor(tiles, noOpOptions));

    act(() => result.current.addTile('wide-tile'));

    expect(result.current.tiles).toHaveLength(1);
  });

  it('removeTile removes non-mandatory non-locked tile', () => {
    const tiles = [
      createMockTilePlacement({ tileKey: 'tile-a' }),
      createMockTilePlacement({ tileKey: 'tile-b', colStart: 5 }),
    ];
    const { result } = renderHook(() => useCanvasEditor(tiles, noOpOptions));

    act(() => result.current.removeTile('tile-a'));

    expect(result.current.tiles).toHaveLength(1);
    expect(result.current.tiles[0].tileKey).toBe('tile-b');
  });

  it('removeTile is no-op for mandatory tile', () => {
    const tiles = [createMockTilePlacement({ tileKey: 'mandatory-tile' })];
    const options = { isMandatory: (k: string) => k === 'mandatory-tile', isLocked: () => false };
    const { result } = renderHook(() => useCanvasEditor(tiles, options));

    act(() => result.current.removeTile('mandatory-tile'));

    expect(result.current.tiles).toHaveLength(1);
  });

  it('removeTile is no-op for locked tile', () => {
    const tiles = [createMockTilePlacement({ tileKey: 'locked-tile' })];
    const options = { isMandatory: () => false, isLocked: (k: string) => k === 'locked-tile' };
    const { result } = renderHook(() => useCanvasEditor(tiles, options));

    act(() => result.current.removeTile('locked-tile'));

    expect(result.current.tiles).toHaveLength(1);
  });

  it('moveTile updates position', () => {
    const tiles = [createMockTilePlacement({ tileKey: 'tile-a', colStart: 1, colSpan: 4 })];
    const { result } = renderHook(() => useCanvasEditor(tiles, noOpOptions));

    act(() => result.current.moveTile('tile-a', 5, 2));

    expect(result.current.tiles[0].colStart).toBe(5);
    expect(result.current.tiles[0].rowStart).toBe(2);
  });

  it('moveTile is no-op for locked tile', () => {
    const tiles = [createMockTilePlacement({ tileKey: 'locked-tile', colStart: 1 })];
    const options = { isMandatory: () => false, isLocked: (k: string) => k === 'locked-tile' };
    const { result } = renderHook(() => useCanvasEditor(tiles, options));

    act(() => result.current.moveTile('locked-tile', 5, 2));

    expect(result.current.tiles[0].colStart).toBe(1);
  });

  it('moveTile clamps to grid bounds', () => {
    const tiles = [createMockTilePlacement({ tileKey: 'tile-a', colStart: 1, colSpan: 4 })];
    const { result } = renderHook(() => useCanvasEditor(tiles, noOpOptions));

    act(() => result.current.moveTile('tile-a', CANVAS_GRID_COLUMNS, 1));

    // colStart 12 + colSpan 4 - 1 = 15 > 12, so no-op
    expect(result.current.tiles[0].colStart).toBe(1);
  });

  it('resizeTile clamps colSpan to [MIN, MAX]', () => {
    const tiles = [createMockTilePlacement({ tileKey: 'tile-a', colStart: 1, colSpan: 4 })];
    const { result } = renderHook(() => useCanvasEditor(tiles, noOpOptions));

    act(() => result.current.resizeTile('tile-a', 1, 1));
    expect(result.current.tiles[0].colSpan).toBe(MIN_COL_SPAN);

    act(() => result.current.resizeTile('tile-a', 20, 1));
    expect(result.current.tiles[0].colSpan).toBe(MAX_COL_SPAN);
  });

  it('resizeTile clamps rowSpan to [MIN, MAX]', () => {
    const tiles = [createMockTilePlacement({ tileKey: 'tile-a', colStart: 1, colSpan: 4 })];
    const { result } = renderHook(() => useCanvasEditor(tiles, noOpOptions));

    act(() => result.current.resizeTile('tile-a', 4, 0));
    expect(result.current.tiles[0].rowSpan).toBe(MIN_ROW_SPAN);

    act(() => result.current.resizeTile('tile-a', 4, 5));
    expect(result.current.tiles[0].rowSpan).toBe(MAX_ROW_SPAN);
  });

  it('reorderTiles swaps positions', () => {
    const tiles = [
      createMockTilePlacement({ tileKey: 'tile-a' }),
      createMockTilePlacement({ tileKey: 'tile-b' }),
      createMockTilePlacement({ tileKey: 'tile-c' }),
    ];
    const { result } = renderHook(() => useCanvasEditor(tiles, noOpOptions));

    act(() => result.current.reorderTiles(0, 2));

    expect(result.current.tiles[0].tileKey).toBe('tile-b');
    expect(result.current.tiles[1].tileKey).toBe('tile-c');
    expect(result.current.tiles[2].tileKey).toBe('tile-a');
  });

  it('reorderTiles is no-op when locked tile involved', () => {
    const tiles = [
      createMockTilePlacement({ tileKey: 'locked-tile' }),
      createMockTilePlacement({ tileKey: 'tile-b' }),
    ];
    const options = { isMandatory: () => false, isLocked: (k: string) => k === 'locked-tile' };
    const { result } = renderHook(() => useCanvasEditor(tiles, options));

    act(() => result.current.reorderTiles(0, 1));

    expect(result.current.tiles[0].tileKey).toBe('locked-tile');
    expect(result.current.tiles[1].tileKey).toBe('tile-b');
  });

  it('cancel restores initial tiles', () => {
    const tiles = [createMockTilePlacement({ tileKey: 'tile-a' })];
    const { result } = renderHook(() => useCanvasEditor(tiles, noOpOptions));

    act(() => result.current.addTile('new-tile'));
    expect(result.current.tiles).toHaveLength(2);

    act(() => result.current.cancel());
    expect(result.current.tiles).toHaveLength(1);
    expect(result.current.tiles[0].tileKey).toBe('tile-a');
  });

  it('hasUnsavedChanges true after addTile', () => {
    const { result } = renderHook(() => useCanvasEditor([], noOpOptions));

    act(() => result.current.addTile('new-tile'));

    expect(result.current.hasUnsavedChanges).toBe(true);
  });

  it('getEditableTiles excludes mandatory and locked tiles', () => {
    const tiles = [
      createMockTilePlacement({ tileKey: 'mandatory-tile' }),
      createMockTilePlacement({ tileKey: 'locked-tile' }),
      createMockTilePlacement({ tileKey: 'editable-tile' }),
    ];
    const options = {
      isMandatory: (k: string) => k === 'mandatory-tile',
      isLocked: (k: string) => k === 'locked-tile',
    };
    const { result } = renderHook(() => useCanvasEditor(tiles, options));

    const editable = result.current.getEditableTiles();
    expect(editable).toHaveLength(1);
    expect(editable[0].tileKey).toBe('editable-tile');
  });

  it('reorderTiles is no-op for out-of-bounds indices (D-SF13-T08)', () => {
    const tiles = [
      createMockTilePlacement({ tileKey: 'tile-a' }),
      createMockTilePlacement({ tileKey: 'tile-b' }),
    ];
    const { result } = renderHook(() => useCanvasEditor(tiles, noOpOptions));

    act(() => result.current.reorderTiles(-1, 0));
    expect(result.current.tiles[0].tileKey).toBe('tile-a');

    act(() => result.current.reorderTiles(0, 5));
    expect(result.current.tiles[0].tileKey).toBe('tile-a');
  });

  it('resizeTile is no-op when clamped size overflows grid (D-SF13-T08)', () => {
    const tiles = [createMockTilePlacement({ tileKey: 'tile-a', colStart: 5, colSpan: 4 })];
    const { result } = renderHook(() => useCanvasEditor(tiles, noOpOptions));

    // Resize to MAX_COL_SPAN=12 at colStart=5 would overflow (5+12-1=16 > 12)
    act(() => result.current.resizeTile('tile-a', MAX_COL_SPAN, 1));
    // Should be no-op — tile keeps original colSpan
    expect(result.current.tiles[0].colSpan).toBe(4);
  });

  it('resizeTile is no-op for non-existent tile (D-SF13-T08)', () => {
    const tiles = [createMockTilePlacement({ tileKey: 'tile-a', colSpan: 4 })];
    const { result } = renderHook(() => useCanvasEditor(tiles, noOpOptions));

    act(() => result.current.resizeTile('non-existent', 6, 1));
    expect(result.current.tiles[0].colSpan).toBe(4);
  });

  it('moveTile is no-op for non-existent tile (D-SF13-T08)', () => {
    const tiles = [createMockTilePlacement({ tileKey: 'tile-a', colStart: 1 })];
    const { result } = renderHook(() => useCanvasEditor(tiles, noOpOptions));

    act(() => result.current.moveTile('non-existent', 5, 2));
    expect(result.current.tiles[0].colStart).toBe(1);
  });

  it('addTile uses DEFAULT_COL_SPAN for unregistered tile (D-SF13-T08)', () => {
    const { result } = renderHook(() => useCanvasEditor([], noOpOptions));

    act(() => result.current.addTile('unregistered-tile'));

    expect(result.current.tiles).toHaveLength(1);
    expect(result.current.tiles[0].colSpan).toBe(4); // DEFAULT_COL_SPAN
    expect(result.current.tiles[0].rowSpan).toBe(1); // DEFAULT_ROW_SPAN
  });

  it('reorderTiles is no-op when target tile is locked (D-SF13-T08)', () => {
    const tiles = [
      createMockTilePlacement({ tileKey: 'tile-a' }),
      createMockTilePlacement({ tileKey: 'locked-tile' }),
    ];
    const options = { isMandatory: () => false, isLocked: (k: string) => k === 'locked-tile' };
    const { result } = renderHook(() => useCanvasEditor(tiles, options));

    act(() => result.current.reorderTiles(0, 1));
    // Target (index 1) is locked, so no-op
    expect(result.current.tiles[0].tileKey).toBe('tile-a');
    expect(result.current.tiles[1].tileKey).toBe('locked-tile');
  });

  it('tilesEqual detects isLocked difference (D-SF13-T08)', () => {
    const tiles = [createMockTilePlacement({ tileKey: 'tile-a', isLocked: false })];
    const { result } = renderHook(() => useCanvasEditor(tiles, noOpOptions));

    expect(result.current.hasUnsavedChanges).toBe(false);
  });
});
