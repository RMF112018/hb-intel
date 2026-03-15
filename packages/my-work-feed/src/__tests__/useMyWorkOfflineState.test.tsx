import { renderHook } from '@testing-library/react';
import { useMyWorkOfflineState } from '../hooks/useMyWorkOfflineState.js';
import { createTestWrapper, createTestQueryClient } from './hookTestUtils.js';
import { myWorkKeys } from '../hooks/queryKeys.js';
import { createMockMyWorkFeedResult } from '@hbc/my-work-feed/testing';

const mockTriggerSync = vi.fn().mockResolvedValue(undefined);

vi.mock('@hbc/session-state', () => ({
  useConnectivity: vi.fn(() => 'online'),
  useSessionState: vi.fn(() => ({
    connectivity: 'online',
    queuedOperations: [],
    pendingCount: 0,
    triggerSync: mockTriggerSync,
    saveDraft: vi.fn(),
    loadDraft: vi.fn(() => null),
    clearDraft: vi.fn(),
    queueOperation: vi.fn(),
  })),
}));

import { useConnectivity, useSessionState } from '@hbc/session-state';

const mockUseConnectivity = vi.mocked(useConnectivity);
const mockUseSessionState = vi.mocked(useSessionState);

describe('useMyWorkOfflineState', () => {
  beforeEach(() => {
    mockUseConnectivity.mockReturnValue('online');
    mockUseSessionState.mockReturnValue({
      connectivity: 'online',
      queuedOperations: [],
      pendingCount: 0,
      triggerSync: mockTriggerSync,
      saveDraft: vi.fn(),
      loadDraft: vi.fn(() => null),
      clearDraft: vi.fn(),
      queueOperation: vi.fn(),
    });
  });

  it('returns online state when connected', () => {
    const { result } = renderHook(() => useMyWorkOfflineState(), {
      wrapper: createTestWrapper(),
    });
    expect(result.current.offlineState.isOnline).toBe(true);
  });

  it('returns offline state when disconnected', () => {
    mockUseConnectivity.mockReturnValue('offline');
    const { result } = renderHook(() => useMyWorkOfflineState(), {
      wrapper: createTestWrapper(),
    });
    expect(result.current.offlineState.isOnline).toBe(false);
  });

  it('filters queued operations to my-work/ targets', () => {
    mockUseSessionState.mockReturnValue({
      connectivity: 'online',
      queuedOperations: [
        {
          operationId: 'op-1',
          type: 'api-mutation',
          target: 'my-work/defer/work-001',
          payload: null,
          retryCount: 0,
          maxRetries: 3,
          createdAt: '2026-01-15T10:00:00.000Z',
          lastAttemptAt: null,
          lastError: null,
        },
        {
          operationId: 'op-2',
          type: 'upload',
          target: 'documents/upload/doc-001',
          payload: null,
          retryCount: 0,
          maxRetries: 3,
          createdAt: '2026-01-15T10:01:00.000Z',
          lastAttemptAt: null,
          lastError: null,
        },
      ],
      pendingCount: 2,
      triggerSync: mockTriggerSync,
      saveDraft: vi.fn(),
      loadDraft: vi.fn(() => null),
      clearDraft: vi.fn(),
      queueOperation: vi.fn(),
    });

    const { result } = renderHook(() => useMyWorkOfflineState(), {
      wrapper: createTestWrapper(),
    });

    expect(result.current.offlineState.queuedActionCount).toBe(1);
    expect(result.current.offlineState.queuedActions).toEqual([
      {
        actionKey: 'defer',
        workItemId: 'work-001',
        payload: null,
        queuedAtIso: '2026-01-15T10:00:00.000Z',
      },
    ]);
  });

  it('reads cached item count from query client', () => {
    const queryClient = createTestQueryClient();
    const feedResult = createMockMyWorkFeedResult({ items: [
      { workItemId: 'a' } as any,
      { workItemId: 'b' } as any,
    ] });
    queryClient.setQueryData(myWorkKeys.feed('user-001', {}), feedResult);

    const { result } = renderHook(() => useMyWorkOfflineState(), {
      wrapper: createTestWrapper({ queryClient }),
    });
    expect(result.current.offlineState.cachedItemCount).toBe(2);
  });

  it('exposes triggerSync from session state', async () => {
    const { result } = renderHook(() => useMyWorkOfflineState(), {
      wrapper: createTestWrapper(),
    });
    await result.current.triggerSync();
    expect(mockTriggerSync).toHaveBeenCalled();
  });
});
