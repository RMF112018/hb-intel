import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useVersionSnapshot } from '../useVersionSnapshot';
import { VersionApi } from '../../api/VersionApi';

vi.mock('../../api/VersionApi');

describe('useVersionSnapshot', () => {
  beforeEach(() => vi.resetAllMocks());

  it('returns null when snapshotId is null (idle)', () => {
    const { result } = renderHook(() => useVersionSnapshot(null));
    expect(result.current.snapshot).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('fetches snapshot by id', async () => {
    const mockSnap = { snapshotId: 'snap-1', version: 1, snapshot: { score: 42 } };
    vi.mocked(VersionApi.getSnapshotById).mockResolvedValue(mockSnap as never);

    const { result } = renderHook(() => useVersionSnapshot('snap-1'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.snapshot).toEqual(mockSnap);
  });

  it('cancels in-flight request on snapshotId change', async () => {
    vi.mocked(VersionApi.getSnapshotById).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const { result, rerender } = renderHook(
      ({ id }: { id: string | null }) => useVersionSnapshot<{ score: number }>(id),
      { initialProps: { id: 'snap-1' } }
    );

    rerender({ id: null });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.snapshot).toBeNull();
  });
});
