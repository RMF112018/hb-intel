import { renderHook, waitFor, act } from '@testing-library/react';
import { useMyWorkActions } from '../hooks/useMyWorkActions.js';
import { createTestWrapper, createTestQueryClient } from './hookTestUtils.js';
import { createMockMyWorkItem } from '@hbc/my-work-feed/testing';

vi.mock('@hbc/session-state', () => ({
  useConnectivity: vi.fn(() => 'online'),
  useSessionState: vi.fn(() => ({
    connectivity: 'online',
    queuedOperations: [],
    pendingCount: 0,
    triggerSync: vi.fn(),
    saveDraft: vi.fn(),
    loadDraft: vi.fn(),
    clearDraft: vi.fn(),
    queueOperation: vi.fn(),
  })),
}));

import { useConnectivity, useSessionState } from '@hbc/session-state';

const mockUseConnectivity = vi.mocked(useConnectivity);
const mockUseSessionState = vi.mocked(useSessionState);

describe('useMyWorkActions', () => {
  let mockQueueOperation: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockQueueOperation = vi.fn();
    mockUseConnectivity.mockReturnValue('online');
    mockUseSessionState.mockReturnValue({
      connectivity: 'online',
      queuedOperations: [],
      pendingCount: 0,
      triggerSync: vi.fn(),
      saveDraft: vi.fn(),
      loadDraft: vi.fn(() => null),
      clearDraft: vi.fn(),
      queueOperation: mockQueueOperation,
    });
  });

  it('executes a replay-safe action online and returns success', async () => {
    const item = createMockMyWorkItem({ state: 'active' });
    const { result } = renderHook(() => useMyWorkActions(), { wrapper: createTestWrapper() });

    act(() => result.current.executeAction({ actionKey: 'defer', item }));
    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(result.current.lastResult?.success).toBe(true);
    expect(result.current.lastResult?.affectedWorkItemIds).toEqual([item.workItemId]);
    expect(mockQueueOperation).not.toHaveBeenCalled();
  });

  it('queues replay-safe action when offline', async () => {
    mockUseConnectivity.mockReturnValue('offline');
    const item = createMockMyWorkItem({ state: 'active' });
    const { result } = renderHook(() => useMyWorkActions(), { wrapper: createTestWrapper() });

    act(() => result.current.executeAction({ actionKey: 'defer', item }));
    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(result.current.lastResult?.success).toBe(true);
    expect(mockQueueOperation).toHaveBeenCalledWith({
      type: 'api-mutation',
      target: `my-work/defer/${item.workItemId}`,
      payload: null,
      maxRetries: 3,
    });
  });

  it('returns failure for invalid state transition', async () => {
    // completed is terminal — cannot transition to deferred
    const item = createMockMyWorkItem({ state: 'completed' });
    const { result } = renderHook(() => useMyWorkActions(), { wrapper: createTestWrapper() });

    act(() => result.current.executeAction({ actionKey: 'defer', item }));
    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(result.current.lastResult?.success).toBe(false);
    expect(result.current.lastResult?.message).toContain('Cannot transition');
  });

  it('executes mark-read action (active→active is valid for new state)', async () => {
    const item = createMockMyWorkItem({ state: 'new' });
    const { result } = renderHook(() => useMyWorkActions(), { wrapper: createTestWrapper() });

    act(() => result.current.executeAction({ actionKey: 'mark-read', item }));
    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(result.current.lastResult?.success).toBe(true);
  });

  it('executes waiting-on action', async () => {
    const item = createMockMyWorkItem({ state: 'active' });
    const { result } = renderHook(() => useMyWorkActions(), { wrapper: createTestWrapper() });

    act(() => result.current.executeAction({ actionKey: 'waiting-on', item }));
    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(result.current.lastResult?.success).toBe(true);
  });

  it('executes undefer action from deferred state', async () => {
    const item = createMockMyWorkItem({ state: 'deferred' });
    const { result } = renderHook(() => useMyWorkActions(), { wrapper: createTestWrapper() });

    act(() => result.current.executeAction({ actionKey: 'undefer', item }));
    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(result.current.lastResult?.success).toBe(true);
  });

  it('returns deep link for non-replayable action online', async () => {
    const item = createMockMyWorkItem({ context: { moduleKey: 'bic', href: '/bic/records/1' } });
    const { result } = renderHook(() => useMyWorkActions(), { wrapper: createTestWrapper() });

    act(() => result.current.executeAction({ actionKey: 'approve', item }));
    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(result.current.lastResult?.success).toBe(true);
    expect(result.current.lastResult?.deepLinkHref).toBe('/bic/records/1');
  });

  it('returns cannotReplayOffline for non-replayable action offline', async () => {
    mockUseConnectivity.mockReturnValue('offline');
    const item = createMockMyWorkItem({ context: { moduleKey: 'bic', href: '/bic/records/1' } });
    const { result } = renderHook(() => useMyWorkActions(), { wrapper: createTestWrapper() });

    act(() => result.current.executeAction({ actionKey: 'approve', item }));
    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(result.current.lastResult?.success).toBe(false);
    expect(result.current.lastResult?.cannotReplayOffline).toBe(true);
    expect(result.current.lastResult?.deepLinkHref).toBe('/bic/records/1');
  });

  it('invalidates queries on success', async () => {
    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const item = createMockMyWorkItem({ state: 'active' });

    const { result } = renderHook(() => useMyWorkActions(), {
      wrapper: createTestWrapper({ queryClient }),
    });

    act(() => result.current.executeAction({ actionKey: 'defer', item }));
    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: expect.arrayContaining(['my-work', 'user-001']),
    });
  });

  it('passes payload through to queueOperation when offline', async () => {
    mockUseConnectivity.mockReturnValue('offline');
    const item = createMockMyWorkItem({ state: 'active' });
    const payload = { note: 'follow up tomorrow' };
    const { result } = renderHook(() => useMyWorkActions(), { wrapper: createTestWrapper() });

    act(() => result.current.executeAction({ actionKey: 'defer', item, payload }));
    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(mockQueueOperation).toHaveBeenCalledWith(
      expect.objectContaining({ payload }),
    );
  });

  it('queues action when offline and calls queueOperation', async () => {
    mockUseConnectivity.mockReturnValue('offline');
    const item = createMockMyWorkItem({ state: 'new' });
    const { result } = renderHook(() => useMyWorkActions(), { wrapper: createTestWrapper() });

    act(() => result.current.executeAction({ actionKey: 'mark-read', item }));
    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(mockQueueOperation).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'api-mutation',
        target: `my-work/mark-read/${item.workItemId}`,
      }),
    );
  });

  it('second identical offline action calls queueOperation again', async () => {
    mockUseConnectivity.mockReturnValue('offline');
    const item = createMockMyWorkItem({ state: 'active' });
    const { result } = renderHook(() => useMyWorkActions(), { wrapper: createTestWrapper() });

    act(() => result.current.executeAction({ actionKey: 'defer', item }));
    await waitFor(() => expect(result.current.isPending).toBe(false));

    act(() => result.current.executeAction({ actionKey: 'defer', item }));
    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(mockQueueOperation).toHaveBeenCalledTimes(2);
  });

  it('queued action result persists across rerender', async () => {
    mockUseConnectivity.mockReturnValue('offline');
    const item = createMockMyWorkItem({ state: 'active' });
    const { result, rerender } = renderHook(() => useMyWorkActions(), { wrapper: createTestWrapper() });

    act(() => result.current.executeAction({ actionKey: 'defer', item }));
    await waitFor(() => expect(result.current.isPending).toBe(false));

    const lastResult = result.current.lastResult;
    expect(lastResult).toBeDefined();
    rerender();
    expect(result.current.lastResult).toEqual(lastResult);
  });

  it('starts with isPending false and no lastResult', () => {
    const { result } = renderHook(() => useMyWorkActions(), { wrapper: createTestWrapper() });
    expect(result.current.isPending).toBe(false);
    expect(result.current.lastResult).toBeUndefined();
  });
});
