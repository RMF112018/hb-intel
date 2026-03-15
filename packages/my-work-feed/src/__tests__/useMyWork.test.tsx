import { renderHook, waitFor } from '@testing-library/react';
import { useMyWork } from '../hooks/useMyWork.js';
import { createTestWrapper } from './hookTestUtils.js';
import { createMockMyWorkFeedResult } from '@hbc/my-work-feed/testing';
import type { IMyWorkFeedResult } from '../types/index.js';

vi.mock('../api/aggregateFeed.js');

import { aggregateFeed } from '../api/aggregateFeed.js';

const mockAggregateFeed = vi.mocked(aggregateFeed);

describe('useMyWork', () => {
  const feedResult: IMyWorkFeedResult = createMockMyWorkFeedResult();

  beforeEach(() => {
    mockAggregateFeed.mockReset();
    mockAggregateFeed.mockResolvedValue(feedResult);
  });

  it('returns loading state initially', () => {
    const { result } = renderHook(() => useMyWork(), { wrapper: createTestWrapper() });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.feed).toBeUndefined();
  });

  it('returns feed data after loading', async () => {
    const { result } = renderHook(() => useMyWork(), { wrapper: createTestWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.feed).toEqual(feedResult);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('returns error state on failure', async () => {
    mockAggregateFeed.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useMyWork(), { wrapper: createTestWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.feed).toBeUndefined();
  });

  it('does not fetch when enabled is false', () => {
    const { result } = renderHook(() => useMyWork({ enabled: false }), {
      wrapper: createTestWrapper(),
    });
    expect(result.current.isLoading).toBe(false);
    expect(mockAggregateFeed).not.toHaveBeenCalled();
  });

  it('merges query with defaultQuery from context', async () => {
    const wrapper = createTestWrapper({ defaultQuery: { projectId: 'proj-001' } });
    renderHook(() => useMyWork({ query: { limit: 10 } }), { wrapper });
    await waitFor(() => expect(mockAggregateFeed).toHaveBeenCalled());
    const callArgs = mockAggregateFeed.mock.calls[0][0];
    expect(callArgs.query).toEqual({ projectId: 'proj-001', limit: 10 });
  });

  it('exposes refetch function', async () => {
    const { result } = renderHook(() => useMyWork(), { wrapper: createTestWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(typeof result.current.refetch).toBe('function');
  });
});
