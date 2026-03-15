import { renderHook, waitFor } from '@testing-library/react';
import { useMyWorkCounts } from '../hooks/useMyWorkCounts.js';
import { createTestWrapper } from './hookTestUtils.js';
import { createMockMyWorkFeedResult, createMockMyWorkItem } from '@hbc/my-work-feed/testing';

vi.mock('../api/aggregateFeed.js');

import { aggregateFeed } from '../api/aggregateFeed.js';

const mockAggregateFeed = vi.mocked(aggregateFeed);

describe('useMyWorkCounts', () => {
  beforeEach(() => {
    mockAggregateFeed.mockReset();
  });

  it('returns loading state initially', () => {
    mockAggregateFeed.mockResolvedValue(createMockMyWorkFeedResult());
    const { result } = renderHook(() => useMyWorkCounts(), { wrapper: createTestWrapper() });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.counts).toBeUndefined();
  });

  it('computes counts from feed items', async () => {
    const items = [
      createMockMyWorkItem({ workItemId: '1', isUnread: true, priority: 'now', isBlocked: false, state: 'active' }),
      createMockMyWorkItem({ workItemId: '2', isUnread: false, priority: 'soon', isBlocked: true, state: 'blocked' }),
      createMockMyWorkItem({ workItemId: '3', isUnread: true, priority: 'now', isBlocked: false, state: 'waiting' }),
    ];
    mockAggregateFeed.mockResolvedValue(createMockMyWorkFeedResult({ items }));

    const { result } = renderHook(() => useMyWorkCounts(), { wrapper: createTestWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.counts).toEqual({
      totalCount: 3,
      unreadCount: 2,
      nowCount: 2,
      blockedCount: 1, // item 2 is both isBlocked and state=blocked — single item
      waitingCount: 1,
      deferredCount: 0,
      teamCount: 0,
    });
  });

  it('returns error state on failure', async () => {
    mockAggregateFeed.mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useMyWorkCounts(), { wrapper: createTestWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.counts).toBeUndefined();
  });

  it('passes query to aggregateFeed', async () => {
    mockAggregateFeed.mockResolvedValue(createMockMyWorkFeedResult({ items: [] }));
    const query = { projectId: 'proj-001' };
    renderHook(() => useMyWorkCounts(query), { wrapper: createTestWrapper() });
    await waitFor(() => expect(mockAggregateFeed).toHaveBeenCalled());
    expect(mockAggregateFeed.mock.calls[0][0].query).toEqual(query);
  });
});
