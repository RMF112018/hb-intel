import { renderHook, act, waitFor } from '@testing-library/react';
import { CanvasApi } from '../api/index.js';
import { useCanvasMandatoryTiles } from '../hooks/useCanvasMandatoryTiles.js';
import { createMockTileDefinition } from '@hbc/project-canvas/testing';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useCanvasMandatoryTiles (D-SF13-T04, D-05)', () => {
  it('loads mandatory tiles for role', async () => {
    const mockTiles = [
      createMockTileDefinition({ tileKey: 'mandatory-a', mandatory: true, lockable: true }),
    ];
    vi.spyOn(CanvasApi, 'getRoleMandatoryTiles').mockResolvedValue(mockTiles);

    const { result } = renderHook(() => useCanvasMandatoryTiles('Project Manager'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.mandatoryTiles).toEqual(mockTiles);
    expect(result.current.error).toBeNull();
  });

  it('isMandatory returns true for mandatory tile key', async () => {
    const mockTiles = [
      createMockTileDefinition({ tileKey: 'mandatory-a', mandatory: true }),
    ];
    vi.spyOn(CanvasApi, 'getRoleMandatoryTiles').mockResolvedValue(mockTiles);

    const { result } = renderHook(() => useCanvasMandatoryTiles('Project Manager'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isMandatory('mandatory-a')).toBe(true);
  });

  it('isMandatory returns false for non-mandatory tile key', async () => {
    vi.spyOn(CanvasApi, 'getRoleMandatoryTiles').mockResolvedValue([]);

    const { result } = renderHook(() => useCanvasMandatoryTiles('Project Manager'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isMandatory('some-tile')).toBe(false);
  });

  it('isLocked returns true for mandatory lockable tile', async () => {
    const mockTiles = [
      createMockTileDefinition({ tileKey: 'locked-tile', mandatory: true, lockable: true }),
    ];
    vi.spyOn(CanvasApi, 'getRoleMandatoryTiles').mockResolvedValue(mockTiles);

    const { result } = renderHook(() => useCanvasMandatoryTiles('Project Manager'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isLocked('locked-tile')).toBe(true);
  });

  it('isLocked returns false for mandatory non-lockable tile', async () => {
    const mockTiles = [
      createMockTileDefinition({ tileKey: 'not-locked', mandatory: true, lockable: false }),
    ];
    vi.spyOn(CanvasApi, 'getRoleMandatoryTiles').mockResolvedValue(mockTiles);

    const { result } = renderHook(() => useCanvasMandatoryTiles('Project Manager'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isLocked('not-locked')).toBe(false);
  });

  it('applyToAllProjects calls API', async () => {
    vi.spyOn(CanvasApi, 'getRoleMandatoryTiles').mockResolvedValue([]);
    vi.spyOn(CanvasApi, 'applyMandatoryTilesToAllProjects').mockResolvedValue(undefined);

    const { result } = renderHook(() => useCanvasMandatoryTiles('Project Manager'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.applyToAllProjects();
    });

    expect(CanvasApi.applyMandatoryTilesToAllProjects).toHaveBeenCalledWith('Project Manager');
  });

  it('sets error on API failure', async () => {
    vi.spyOn(CanvasApi, 'getRoleMandatoryTiles').mockRejectedValue(new Error('Forbidden'));

    const { result } = renderHook(() => useCanvasMandatoryTiles('Project Manager'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error?.message).toBe('Forbidden');
  });

  it('applyToAllProjects sets error on failure (D-SF13-T08)', async () => {
    vi.spyOn(CanvasApi, 'getRoleMandatoryTiles').mockResolvedValue([]);
    vi.spyOn(CanvasApi, 'applyMandatoryTilesToAllProjects').mockRejectedValue(new Error('Apply failed'));

    const { result } = renderHook(() => useCanvasMandatoryTiles('Project Manager'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.applyToAllProjects();
    });

    expect(result.current.error?.message).toBe('Apply failed');
  });

  it('applyToAllProjects wraps non-Error thrown value (D-SF13-T08)', async () => {
    vi.spyOn(CanvasApi, 'getRoleMandatoryTiles').mockResolvedValue([]);
    vi.spyOn(CanvasApi, 'applyMandatoryTilesToAllProjects').mockRejectedValue('string err');

    const { result } = renderHook(() => useCanvasMandatoryTiles('Project Manager'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.applyToAllProjects();
    });

    expect(result.current.error?.message).toBe('string err');
  });

  it('wraps non-Error thrown value from getRoleMandatoryTiles (D-SF13-T08)', async () => {
    vi.spyOn(CanvasApi, 'getRoleMandatoryTiles').mockRejectedValue(404);

    const { result } = renderHook(() => useCanvasMandatoryTiles('Project Manager'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error?.message).toBe('404');
  });
});
