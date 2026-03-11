import { renderHook, act, waitFor } from '@testing-library/react';
import { CanvasApi } from '../api/index.js';
import { useCanvasConfig } from '../hooks/useCanvasConfig.js';
import { createMockCanvasConfig } from '@hbc/project-canvas/testing';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useCanvasConfig (D-SF13-T04, D-03)', () => {
  it('loads config on mount', async () => {
    const mockConfig = createMockCanvasConfig({ tiles: [] });
    vi.spyOn(CanvasApi, 'getConfig').mockResolvedValue(mockConfig);

    const { result } = renderHook(() => useCanvasConfig('user-001', 'project-001'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.config).toEqual(mockConfig);
    expect(result.current.error).toBeNull();
  });

  it('sets isLoading true during fetch, false after', async () => {
    vi.spyOn(CanvasApi, 'getConfig').mockResolvedValue(null);

    const { result } = renderHook(() => useCanvasConfig('user-001', 'project-001'));

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('sets error on API failure', async () => {
    vi.spyOn(CanvasApi, 'getConfig').mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useCanvasConfig('user-001', 'project-001'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error?.message).toBe('Network error');
    expect(result.current.config).toBeNull();
  });

  it('save calls CanvasApi.saveConfig and refreshes', async () => {
    const mockConfig = createMockCanvasConfig({ tiles: [] });
    const updatedConfig = createMockCanvasConfig({ tiles: [{ tileKey: 'a', colStart: 1, colSpan: 4, rowStart: 1, rowSpan: 1 }] });

    vi.spyOn(CanvasApi, 'getConfig')
      .mockResolvedValueOnce(mockConfig)
      .mockResolvedValueOnce(updatedConfig);
    vi.spyOn(CanvasApi, 'saveConfig').mockResolvedValue(undefined);

    const { result } = renderHook(() => useCanvasConfig('user-001', 'project-001'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.save(updatedConfig);
    });

    expect(CanvasApi.saveConfig).toHaveBeenCalledWith(updatedConfig);
    expect(result.current.config).toEqual(updatedConfig);
  });

  it('reset calls CanvasApi.resetToRoleDefault and updates config', async () => {
    const mockConfig = createMockCanvasConfig();
    const resetConfig = createMockCanvasConfig({ tiles: [{ tileKey: 'b', colStart: 1, colSpan: 6, rowStart: 1, rowSpan: 1 }] });

    vi.spyOn(CanvasApi, 'getConfig').mockResolvedValue(mockConfig);
    vi.spyOn(CanvasApi, 'resetToRoleDefault').mockResolvedValue(resetConfig);

    const { result } = renderHook(() => useCanvasConfig('user-001', 'project-001'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.reset('Project Manager');
    });

    expect(CanvasApi.resetToRoleDefault).toHaveBeenCalledWith('user-001', 'project-001', 'Project Manager');
    expect(result.current.config).toEqual(resetConfig);
  });

  it('refresh re-fetches config', async () => {
    const config1 = createMockCanvasConfig({ tiles: [] });
    const config2 = createMockCanvasConfig({ tiles: [{ tileKey: 'c', colStart: 1, colSpan: 4, rowStart: 1, rowSpan: 1 }] });

    vi.spyOn(CanvasApi, 'getConfig')
      .mockResolvedValueOnce(config1)
      .mockResolvedValueOnce(config2);

    const { result } = renderHook(() => useCanvasConfig('user-001', 'project-001'));

    await waitFor(() => expect(result.current.config).toEqual(config1));

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.config).toEqual(config2);
  });

  it('returns null config when none exists', async () => {
    vi.spyOn(CanvasApi, 'getConfig').mockResolvedValue(null);

    const { result } = renderHook(() => useCanvasConfig('user-001', 'project-001'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.config).toBeNull();
  });

  it('save sets error when saveConfig rejects (D-SF13-T08)', async () => {
    vi.spyOn(CanvasApi, 'getConfig').mockResolvedValue(createMockCanvasConfig({ tiles: [] }));
    vi.spyOn(CanvasApi, 'saveConfig').mockRejectedValue(new Error('Save failed'));

    const { result } = renderHook(() => useCanvasConfig('user-001', 'project-001'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.save(createMockCanvasConfig({ tiles: [] }));
    });

    expect(result.current.error?.message).toBe('Save failed');
  });

  it('save wraps non-Error thrown value (D-SF13-T08)', async () => {
    vi.spyOn(CanvasApi, 'getConfig').mockResolvedValue(createMockCanvasConfig({ tiles: [] }));
    vi.spyOn(CanvasApi, 'saveConfig').mockRejectedValue('string error');

    const { result } = renderHook(() => useCanvasConfig('user-001', 'project-001'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.save(createMockCanvasConfig({ tiles: [] }));
    });

    expect(result.current.error?.message).toBe('string error');
  });

  it('reset sets error when resetToRoleDefault rejects (D-SF13-T08)', async () => {
    vi.spyOn(CanvasApi, 'getConfig').mockResolvedValue(createMockCanvasConfig({ tiles: [] }));
    vi.spyOn(CanvasApi, 'resetToRoleDefault').mockRejectedValue(new Error('Reset failed'));

    const { result } = renderHook(() => useCanvasConfig('user-001', 'project-001'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.reset('Project Manager');
    });

    expect(result.current.error?.message).toBe('Reset failed');
  });

  it('reset wraps non-Error thrown value (D-SF13-T08)', async () => {
    vi.spyOn(CanvasApi, 'getConfig').mockResolvedValue(createMockCanvasConfig({ tiles: [] }));
    vi.spyOn(CanvasApi, 'resetToRoleDefault').mockRejectedValue('reset string');

    const { result } = renderHook(() => useCanvasConfig('user-001', 'project-001'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.reset('Project Manager');
    });

    expect(result.current.error?.message).toBe('reset string');
  });

  it('fetch wraps non-Error thrown value (D-SF13-T08)', async () => {
    vi.spyOn(CanvasApi, 'getConfig').mockRejectedValue(42);

    const { result } = renderHook(() => useCanvasConfig('user-001', 'project-001'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error?.message).toBe('42');
  });
});
