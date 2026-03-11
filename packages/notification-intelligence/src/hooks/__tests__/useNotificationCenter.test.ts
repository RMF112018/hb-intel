import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationApi } from '../../api/NotificationApi';
import { useNotificationCenter } from '../useNotificationCenter';
import { createMockNotification } from '../../../testing/createMockNotification';

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('../../api/NotificationApi', () => ({
  NotificationApi: {
    getCenter: vi.fn(),
    markRead: vi.fn(),
    dismiss: vi.fn(),
    markAllRead: vi.fn(),
  },
}));

const mockGetCenter = vi.mocked(NotificationApi.getCenter);
const mockMarkRead = vi.mocked(NotificationApi.markRead);
const mockDismiss = vi.mocked(NotificationApi.dismiss);
const mockMarkAllRead = vi.mocked(NotificationApi.markAllRead);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('useNotificationCenter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCenter.mockResolvedValue({
      items: [],
      totalCount: 0,
      immediateUnreadCount: 0,
      hasMore: false,
      nextCursor: null,
    });
    mockMarkRead.mockResolvedValue(undefined);
    mockDismiss.mockResolvedValue(undefined);
    mockMarkAllRead.mockResolvedValue(undefined);
  });

  it('returns empty items array initially', async () => {
    const { result } = renderHook(() => useNotificationCenter(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.totalCount).toBe(0);
  });

  it('returns items from paginated API response', async () => {
    const item = createMockNotification({ id: 'n-1', title: 'Test Item' });
    mockGetCenter.mockResolvedValue({
      items: [item],
      totalCount: 1,
      immediateUnreadCount: 0,
      hasMore: false,
      nextCursor: null,
    });

    const { result } = renderHook(() => useNotificationCenter(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.items).toHaveLength(1);
    });

    expect(result.current.items[0]!.title).toBe('Test Item');
    expect(result.current.totalCount).toBe(1);
  });

  it('markRead mutation calls NotificationApi.markRead', async () => {
    const { result } = renderHook(() => useNotificationCenter(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.markRead('n-1');
    });

    await waitFor(() => {
      expect(mockMarkRead).toHaveBeenCalledWith('n-1', expect.anything());
    });
  });

  it('dismiss mutation calls NotificationApi.dismiss', async () => {
    const { result } = renderHook(() => useNotificationCenter(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.dismiss('n-2');
    });

    await waitFor(() => {
      expect(mockDismiss).toHaveBeenCalledWith('n-2', expect.anything());
    });
  });

  it('markAllRead mutation calls NotificationApi.markAllRead', async () => {
    const { result } = renderHook(() => useNotificationCenter(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.markAllRead('all');
    });

    await waitFor(() => {
      expect(mockMarkAllRead).toHaveBeenCalled();
    });
  });
});
