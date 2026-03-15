import { renderHook, waitFor, act } from '@testing-library/react';
import { useMyWorkPanel } from '../hooks/useMyWorkPanel.js';
import { useMyWorkPanelStore } from '../store/MyWorkPanelStore.js';
import { createTestWrapper } from './hookTestUtils.js';
import { createMockMyWorkFeedResult, createMockMyWorkItem } from '@hbc/my-work-feed/testing';
import type { IMyWorkSavedGrouping } from '../types/index.js';

vi.mock('../api/aggregateFeed.js');

import { aggregateFeed } from '../api/aggregateFeed.js';

const mockAggregateFeed = vi.mocked(aggregateFeed);

describe('useMyWorkPanel', () => {
  beforeEach(() => {
    mockAggregateFeed.mockReset();
  });

  it('groups items by lane by default', async () => {
    const items = [
      createMockMyWorkItem({ workItemId: '1', lane: 'do-now' }),
      createMockMyWorkItem({ workItemId: '2', lane: 'watch' }),
      createMockMyWorkItem({ workItemId: '3', lane: 'do-now' }),
    ];
    mockAggregateFeed.mockResolvedValue(createMockMyWorkFeedResult({ items }));

    const wrapper = createTestWrapper();
    const { result } = renderHook(() => useMyWorkPanel(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.groups).toHaveLength(2);
    const doNow = result.current.groups.find((g) => g.groupKey === 'do-now');
    expect(doNow?.count).toBe(2);
    const watch = result.current.groups.find((g) => g.groupKey === 'watch');
    expect(watch?.count).toBe(1);
  });

  it('groups items by custom grouping when set', async () => {
    const items = [
      createMockMyWorkItem({ workItemId: '1', priority: 'now' }),
      createMockMyWorkItem({ workItemId: '2', priority: 'soon' }),
      createMockMyWorkItem({ workItemId: '3', priority: 'now' }),
    ];
    mockAggregateFeed.mockResolvedValue(createMockMyWorkFeedResult({ items }));

    const wrapper = createTestWrapper();
    const { result } = renderHook(
      () => ({ panel: useMyWorkPanel(), store: useMyWorkPanelStore() }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.panel.isLoading).toBe(false));

    const grouping: IMyWorkSavedGrouping = {
      key: 'by-priority',
      label: 'Priority',
      groupingFn: (item) => item.priority,
    };
    act(() => result.current.store.setGrouping(grouping));

    await waitFor(() => {
      const now = result.current.panel.groups.find((g) => g.groupKey === 'now');
      expect(now?.count).toBe(2);
    });
  });

  it('computes counts from items', async () => {
    const items = [
      createMockMyWorkItem({ isUnread: true, priority: 'now' }),
      createMockMyWorkItem({ isUnread: false, priority: 'soon' }),
    ];
    mockAggregateFeed.mockResolvedValue(createMockMyWorkFeedResult({ items }));

    const { result } = renderHook(() => useMyWorkPanel(), { wrapper: createTestWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.counts?.totalCount).toBe(2);
    expect(result.current.counts?.unreadCount).toBe(1);
  });

  it('passes through panel open/close actions', async () => {
    mockAggregateFeed.mockResolvedValue(createMockMyWorkFeedResult());
    const { result } = renderHook(() => useMyWorkPanel(), { wrapper: createTestWrapper() });

    expect(result.current.isPanelOpen).toBe(false);
    act(() => result.current.openPanel());
    expect(result.current.isPanelOpen).toBe(true);
    act(() => result.current.closePanel());
    expect(result.current.isPanelOpen).toBe(false);
    act(() => result.current.togglePanel());
    expect(result.current.isPanelOpen).toBe(true);
  });

  it('returns empty groups while loading', () => {
    mockAggregateFeed.mockResolvedValue(createMockMyWorkFeedResult());
    const { result } = renderHook(() => useMyWorkPanel(), { wrapper: createTestWrapper() });
    expect(result.current.groups).toEqual([]);
    expect(result.current.counts).toBeUndefined();
  });

  it('returns error state on failure', async () => {
    mockAggregateFeed.mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useMyWorkPanel(), { wrapper: createTestWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
