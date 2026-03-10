import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useVersionHistory } from '../useVersionHistory';
import { VersionApi } from '../../api/VersionApi';
import type { IVersionMetadata } from '../../types';

vi.mock('../../api/VersionApi');

const makeMetadata = (version: number, tag: IVersionMetadata['tag']): IVersionMetadata => ({
  snapshotId: `snap-${version}`,
  version,
  createdAt: '2026-01-01T00:00:00Z',
  createdBy: { userId: 'u1', displayName: 'Alice', role: 'PM' },
  changeSummary: `v${version}`,
  tag,
});

const mockConfig = {
  recordType: 'bd-scorecard',
  triggers: ['on-submit'] as const,
  getStakeholders: () => [],
};

describe('useVersionHistory', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('loads metadata list and sorts newest first', async () => {
    vi.mocked(VersionApi.getMetadataList).mockResolvedValue([
      makeMetadata(1, 'submitted'),
      makeMetadata(3, 'approved'),
      makeMetadata(2, 'rejected'),
    ]);

    const { result } = renderHook(() =>
      useVersionHistory('bd-scorecard', 'rec-1', mockConfig)
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.metadata[0]?.version).toBe(3);
    expect(result.current.metadata[2]?.version).toBe(1);
  });

  it('hides superseded versions by default', async () => {
    vi.mocked(VersionApi.getMetadataList).mockResolvedValue([
      makeMetadata(1, 'approved'),
      makeMetadata(2, 'superseded'),
      makeMetadata(3, 'submitted'),
    ]);

    const { result } = renderHook(() =>
      useVersionHistory('bd-scorecard', 'rec-1', mockConfig)
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.metadata).toHaveLength(2);
  });

  it('shows superseded versions when showSuperseded is toggled', async () => {
    vi.mocked(VersionApi.getMetadataList).mockResolvedValue([
      makeMetadata(1, 'approved'),
      makeMetadata(2, 'superseded'),
    ]);

    const { result } = renderHook(() =>
      useVersionHistory('bd-scorecard', 'rec-1', mockConfig)
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setShowSuperseded(true));
    expect(result.current.metadata).toHaveLength(2);
  });

  it('sets error on API failure', async () => {
    vi.mocked(VersionApi.getMetadataList).mockRejectedValue(new Error('SP error'));

    const { result } = renderHook(() =>
      useVersionHistory('bd-scorecard', 'rec-1', mockConfig)
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error?.message).toBe('SP error');
  });

  it('refresh() re-fetches the list', async () => {
    vi.mocked(VersionApi.getMetadataList).mockResolvedValue([makeMetadata(1, 'draft')]);

    const { result } = renderHook(() =>
      useVersionHistory('bd-scorecard', 'rec-1', mockConfig)
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    vi.mocked(VersionApi.getMetadataList).mockResolvedValue([
      makeMetadata(1, 'draft'),
      makeMetadata(2, 'submitted'),
    ]);

    await act(async () => result.current.refresh());
    await waitFor(() => expect(result.current.metadata).toHaveLength(2));
  });
});
