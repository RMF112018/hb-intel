import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useVersionDiff } from '../useVersionDiff';
import { VersionApi } from '../../api/VersionApi';

vi.mock('../../api/VersionApi');

const mockConfig = {
  recordType: 'bd-scorecard',
  triggers: ['on-submit'] as const,
  getStakeholders: () => [],
};

describe('useVersionDiff', () => {
  beforeEach(() => vi.resetAllMocks());

  it('computes diff between two snapshots', async () => {
    const snapA = { snapshotId: 'a', version: 1, snapshot: { score: 42, name: 'Alpha' } };
    const snapB = { snapshotId: 'b', version: 2, snapshot: { score: 67, name: 'Alpha' } };

    vi.mocked(VersionApi.getSnapshot).mockImplementation(async (_rt, _id, ver) =>
      ver === 1 ? (snapA as never) : (snapB as never)
    );
    vi.mocked(VersionApi.getMetadataList).mockResolvedValue([]);

    const { result } = renderHook(() =>
      useVersionDiff('bd-scorecard', 'rec-1', 1, 2, mockConfig)
    );

    await waitFor(() => expect(result.current.isComputing).toBe(false));

    expect(result.current.diffs).toHaveLength(1);
    expect(result.current.diffs[0]?.fieldName).toBe('score');
    expect(result.current.diffs[0]?.numericDelta).toBe('+25');
  });

  it('returns empty diffs when versionA === versionB', async () => {
    const { result } = renderHook(() =>
      useVersionDiff('bd-scorecard', 'rec-1', 2, 2, mockConfig)
    );
    await waitFor(() => expect(result.current.isComputing).toBe(false));
    expect(result.current.diffs).toHaveLength(0);
  });

  it('sets error when fetch fails', async () => {
    vi.mocked(VersionApi.getSnapshot).mockRejectedValue(new Error('Fetch failed'));
    vi.mocked(VersionApi.getMetadataList).mockResolvedValue([]);

    const { result } = renderHook(() =>
      useVersionDiff('bd-scorecard', 'rec-1', 1, 2, mockConfig)
    );

    await waitFor(() => expect(result.current.isComputing).toBe(false));
    expect(result.current.error?.message).toBe('Fetch failed');
  });
});
