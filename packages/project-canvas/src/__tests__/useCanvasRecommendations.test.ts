import { renderHook, act, waitFor } from '@testing-library/react';
import { CanvasApi } from '../api/index.js';
import { useCanvasRecommendations } from '../hooks/useCanvasRecommendations.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useCanvasRecommendations (D-SF13-T04, D-02)', () => {
  it('fetches recommendations on mount', async () => {
    const mockRecs = [
      { tileKey: 'tile-a', signal: 'health' as const, reason: 'Low score' },
    ];
    vi.spyOn(CanvasApi, 'getCanvasRecommendations').mockResolvedValue(mockRecs);

    const { result } = renderHook(() => useCanvasRecommendations('user-001', 'project-001'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.recommendations).toEqual(mockRecs);
    expect(result.current.error).toBeNull();
  });

  it('returns empty array on error (graceful degradation)', async () => {
    vi.spyOn(CanvasApi, 'getCanvasRecommendations').mockRejectedValue(new Error('API down'));

    const { result } = renderHook(() => useCanvasRecommendations('user-001', 'project-001'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.recommendations).toEqual([]);
    expect(result.current.error?.message).toBe('API down');
  });

  it('sets loading state during fetch', async () => {
    vi.spyOn(CanvasApi, 'getCanvasRecommendations').mockResolvedValue([]);

    const { result } = renderHook(() => useCanvasRecommendations('user-001', 'project-001'));

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('refresh re-fetches recommendations', async () => {
    const recs1 = [{ tileKey: 'a', signal: 'health' as const, reason: 'r1' }];
    const recs2 = [{ tileKey: 'b', signal: 'phase' as const, reason: 'r2' }];

    vi.spyOn(CanvasApi, 'getCanvasRecommendations')
      .mockResolvedValueOnce(recs1)
      .mockResolvedValueOnce(recs2);

    const { result } = renderHook(() => useCanvasRecommendations('user-001', 'project-001'));

    await waitFor(() => expect(result.current.recommendations).toEqual(recs1));

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.recommendations).toEqual(recs2);
  });

  it('sorts by signal priority order', async () => {
    const unsorted = [
      { tileKey: 'c', signal: 'usage-history' as const, reason: 'r3' },
      { tileKey: 'a', signal: 'health' as const, reason: 'r1' },
      { tileKey: 'b', signal: 'phase' as const, reason: 'r2' },
    ];
    vi.spyOn(CanvasApi, 'getCanvasRecommendations').mockResolvedValue(unsorted);

    const { result } = renderHook(() => useCanvasRecommendations('user-001', 'project-001'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.recommendations.map((r) => r.signal)).toEqual([
      'health',
      'phase',
      'usage-history',
    ]);
  });
});
