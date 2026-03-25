import { renderHook, act, waitFor } from '@testing-library/react';
import { CanvasApi } from '../api/index.js';
import { useProjectCanvas } from '../hooks/useProjectCanvas.js';
import { createMockCanvasConfig, createMockTileDefinition, createMockTilePlacement } from '@hbc/project-canvas/testing';
import type { ICanvasPersistenceAdapter } from '../api/index.js';

vi.mock('../registry/index.js', () => ({
  get: vi.fn((key: string) => {
    return createMockTileDefinition({ tileKey: key, defaultColSpan: 4, defaultRowSpan: 1 });
  }),
  getAll: vi.fn().mockReturnValue([]),
}));

afterEach(() => {
  vi.restoreAllMocks();
});

function setupMocks(overrides: {
  config?: ReturnType<typeof createMockCanvasConfig> | null;
  mandatoryTiles?: ReturnType<typeof createMockTileDefinition>[];
} = {}) {
  vi.spyOn(CanvasApi, 'getConfig').mockResolvedValue(overrides.config ?? null);
  vi.spyOn(CanvasApi, 'getRoleMandatoryTiles').mockResolvedValue(overrides.mandatoryTiles ?? []);
  vi.spyOn(CanvasApi, 'saveConfig').mockResolvedValue(undefined);
  vi.spyOn(CanvasApi, 'resetToRoleDefault').mockResolvedValue(
    createMockCanvasConfig({ tiles: [] }),
  );
}

describe('useProjectCanvas (D-SF13-T04, orchestrator)', () => {
  it('returns config tiles when config exists', async () => {
    const tiles = [createMockTilePlacement({ tileKey: 'tile-a' })];
    setupMocks({ config: createMockCanvasConfig({ tiles }) });

    const { result } = renderHook(() => useProjectCanvas('project-001', 'user-001', 'Project Manager'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.tiles).toEqual(tiles);
  });

  it('falls back to role defaults when no config', async () => {
    setupMocks({ config: null });

    const { result } = renderHook(() => useProjectCanvas('project-001', 'user-001', 'Project Manager'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    // Role defaults are resolved from ROLE_DEFAULT_TILES via the real useRoleDefaultCanvas
    expect(result.current.tiles.length).toBeGreaterThan(0);
    expect(result.current.tiles[0].tileKey).toBe('bic-my-items');
  });

  it('isLoading reflects sub-hook loading states', async () => {
    setupMocks();

    const { result } = renderHook(() => useProjectCanvas('project-001', 'user-001', 'Project Manager'));

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('save persists tiles via API', async () => {
    setupMocks({ config: createMockCanvasConfig({ tiles: [] }) });

    const { result } = renderHook(() => useProjectCanvas('project-001', 'user-001', 'Project Manager'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const newTiles = [createMockTilePlacement({ tileKey: 'new-tile' })];
    await act(async () => {
      await result.current.save(newTiles);
    });

    expect(CanvasApi.saveConfig).toHaveBeenCalledWith({
      userId: 'user-001',
      projectId: 'project-001',
      tiles: newTiles,
    });
  });

  it('reset delegates to config reset', async () => {
    setupMocks({ config: createMockCanvasConfig({ tiles: [] }) });

    const { result } = renderHook(() => useProjectCanvas('project-001', 'user-001', 'Project Manager'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.reset();
    });

    expect(CanvasApi.resetToRoleDefault).toHaveBeenCalledWith('user-001', 'project-001', 'Project Manager');
  });

  it('isMandatory and isLocked delegate to mandatory hook', async () => {
    const mandatoryTile = createMockTileDefinition({
      tileKey: 'mandatory-tile',
      mandatory: true,
      lockable: true,
    });
    setupMocks({ mandatoryTiles: [mandatoryTile] });

    const { result } = renderHook(() => useProjectCanvas('project-001', 'user-001', 'Project Manager'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isMandatory('mandatory-tile')).toBe(true);
    expect(result.current.isLocked('mandatory-tile')).toBe(true);
    expect(result.current.isMandatory('other-tile')).toBe(false);
  });

  it('ensures mandatory tiles present in resolved set', async () => {
    const configTiles = [createMockTilePlacement({ tileKey: 'tile-a' })];
    const mandatoryTile = createMockTileDefinition({
      tileKey: 'mandatory-b',
      mandatory: true,
      lockable: true,
      defaultColSpan: 6,
      defaultRowSpan: 1,
    });
    setupMocks({
      config: createMockCanvasConfig({ tiles: configTiles }),
      mandatoryTiles: [mandatoryTile],
    });

    const { result } = renderHook(() => useProjectCanvas('project-001', 'user-001', 'Project Manager'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const keys = result.current.tiles.map((t) => t.tileKey);
    expect(keys).toContain('tile-a');
    expect(keys).toContain('mandatory-b');

    const mandatory = result.current.tiles.find((t) => t.tileKey === 'mandatory-b');
    expect(mandatory?.colSpan).toBe(6);
    expect(mandatory?.isLocked).toBe(true);
  });

  it('falls back to empty tiles for unknown role not in ROLE_DEFAULT_TILES (D-SF13-T08)', async () => {
    setupMocks({ config: null });

    const { result } = renderHook(() => useProjectCanvas('project-001', 'user-001', 'Unknown Role'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    // Unknown role has no defaults in ROLE_DEFAULT_TILES — falls back to empty
    expect(result.current.tiles).toEqual([]);
  });

  it('does not duplicate mandatory tile already present in config (D-SF13-T08)', async () => {
    const mandatoryTile = createMockTileDefinition({
      tileKey: 'tile-a',
      mandatory: true,
      lockable: true,
    });
    const configTiles = [createMockTilePlacement({ tileKey: 'tile-a' })];
    setupMocks({
      config: createMockCanvasConfig({ tiles: configTiles }),
      mandatoryTiles: [mandatoryTile],
    });

    const { result } = renderHook(() => useProjectCanvas('project-001', 'user-001', 'Project Manager'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const matchingTiles = result.current.tiles.filter((t) => t.tileKey === 'tile-a');
    expect(matchingTiles).toHaveLength(1);
  });

  it('mandatory tile placed after last existing tile row (D-SF13-T08)', async () => {
    const configTiles = [
      createMockTilePlacement({ tileKey: 'tile-a', rowStart: 3 }),
    ];
    const mandatoryTile = createMockTileDefinition({
      tileKey: 'mandatory-c',
      mandatory: true,
      lockable: true,
      defaultColSpan: 4,
      defaultRowSpan: 1,
    });
    setupMocks({
      config: createMockCanvasConfig({ tiles: configTiles }),
      mandatoryTiles: [mandatoryTile],
    });

    const { result } = renderHook(() => useProjectCanvas('project-001', 'user-001', 'Project Manager'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const added = result.current.tiles.find((t) => t.tileKey === 'mandatory-c');
    expect(added).toBeDefined();
    expect(added!.rowStart).toBe(4); // placed after row 3 (max row in config)
  });

  it('save delegates to a supplied persistence adapter', async () => {
    setupMocks({ config: null });
    const adapter: ICanvasPersistenceAdapter = {
      getConfig: vi.fn().mockResolvedValue(createMockCanvasConfig({ tiles: [] })),
      saveConfig: vi.fn().mockResolvedValue(undefined),
      resetConfig: vi.fn().mockResolvedValue(undefined),
    };

    const { result } = renderHook(() =>
      useProjectCanvas('project-001', 'user-001', 'Project Manager', adapter),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const newTiles = [createMockTilePlacement({ tileKey: 'persisted-tile' })];
    await act(async () => {
      await result.current.save(newTiles);
      await result.current.reset();
    });

    expect(adapter.saveConfig).toHaveBeenCalledWith({
      userId: 'user-001',
      projectId: 'project-001',
      tiles: newTiles,
    });
    expect(adapter.resetConfig).toHaveBeenCalledWith('project-001', 'user-001');
  });
});
