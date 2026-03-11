import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationApi } from '../../api/NotificationApi';
import { useNotificationBadge } from '../useNotificationBadge';

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('../../api/NotificationApi', () => ({
  NotificationApi: {
    getCenter: vi.fn(),
  },
}));

const mockGetCenter = vi.mocked(NotificationApi.getCenter);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('useNotificationBadge', () => {
  beforeEach(() => {
    mockGetCenter.mockResolvedValue({
      items: [],
      totalCount: 0,
      immediateUnreadCount: 0,
      hasMore: false,
      nextCursor: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 0 immediateUnreadCount when no notifications', async () => {
    const { result } = renderHook(() => useNotificationBadge(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.immediateUnreadCount).toBe(0);
  });

  it('returns the immediateUnreadCount from API response', async () => {
    mockGetCenter.mockResolvedValue({
      items: [],
      totalCount: 5,
      immediateUnreadCount: 3,
      hasMore: false,
      nextCursor: null,
    });

    const { result } = renderHook(() => useNotificationBadge(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.immediateUnreadCount).toBe(3);
    });
  });

  it('sets hasImmediateUnread true when count > 0', async () => {
    mockGetCenter.mockResolvedValue({
      items: [],
      totalCount: 2,
      immediateUnreadCount: 2,
      hasMore: false,
      nextCursor: null,
    });

    const { result } = renderHook(() => useNotificationBadge(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.hasImmediateUnread).toBe(true);
    });
  });

  it('sets hasImmediateUnread false when count === 0', async () => {
    const { result } = renderHook(() => useNotificationBadge(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasImmediateUnread).toBe(false);
  });

  it('calls getCenter with immediate tier filter and pageSize 1', async () => {
    const { result } = renderHook(() => useNotificationBadge(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetCenter).toHaveBeenCalledWith({
      tier: 'immediate',
      unreadOnly: true,
      pageSize: 1,
    });
  });
});
