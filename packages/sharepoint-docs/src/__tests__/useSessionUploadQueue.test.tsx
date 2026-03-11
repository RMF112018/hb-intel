import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { SessionStateContext } from '@hbc/session-state';
import { createMockSessionContext } from '@hbc/session-state/testing';
import { useSessionUploadQueue } from '../hooks/useSessionUploadQueue';

function createWrapper(overrides: Parameters<typeof createMockSessionContext>[0] = {}) {
  const ctx = createMockSessionContext(overrides);
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <SessionStateContext.Provider value={ctx}>{children}</SessionStateContext.Provider>
  );
  return { Wrapper, ctx };
}

describe('useSessionUploadQueue', () => {
  it('calls queueOperation with upload type and correct payload', () => {
    const queueOperation = vi.fn();
    const { Wrapper } = createWrapper({ queueOperation });

    const { result } = renderHook(() => useSessionUploadQueue(), { wrapper: Wrapper });

    const params = { documentId: 'doc-1', listId: 'list-1', contentBase64: 'abc123' };
    act(() => {
      result.current.enqueueUpload(params);
    });

    expect(queueOperation).toHaveBeenCalledWith({
      type: 'upload',
      target: '/api/documents/upload',
      payload: params,
      maxRetries: 5,
    });
  });

  it('returns connectivity and pendingCount from context', () => {
    const { Wrapper } = createWrapper({ connectivity: 'offline', pendingCount: 3 });

    const { result } = renderHook(() => useSessionUploadQueue(), { wrapper: Wrapper });

    expect(result.current.connectivity).toBe('offline');
    expect(result.current.pendingCount).toBe(3);
  });

  it('enqueueUpload is stable across re-renders', () => {
    const { Wrapper } = createWrapper();
    const { result, rerender } = renderHook(() => useSessionUploadQueue(), { wrapper: Wrapper });

    const first = result.current.enqueueUpload;
    rerender();
    expect(result.current.enqueueUpload).toBe(first);
  });
});
