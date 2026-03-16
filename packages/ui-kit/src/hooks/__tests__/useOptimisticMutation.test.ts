import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOptimisticMutation } from '../useOptimisticMutation.js';

describe('useOptimisticMutation', () => {
  it('calls onOptimisticUpdate immediately on mutate', () => {
    const onOptimisticUpdate = vi.fn();
    const { result } = renderHook(() =>
      useOptimisticMutation({
        mutationFn: () => Promise.resolve('ok'),
        onOptimisticUpdate,
        onRevert: vi.fn(),
      }),
    );
    act(() => { result.current.mutate('test'); });
    expect(onOptimisticUpdate).toHaveBeenCalledWith('test');
  });

  it('sets isPending during mutation', async () => {
    let resolve: (v: string) => void;
    const promise = new Promise<string>((r) => { resolve = r; });
    const { result } = renderHook(() =>
      useOptimisticMutation({
        mutationFn: () => promise,
        onOptimisticUpdate: vi.fn(),
        onRevert: vi.fn(),
      }),
    );
    act(() => { result.current.mutate('test'); });
    expect(result.current.isPending).toBe(true);

    await act(async () => { resolve!('done'); });
    expect(result.current.isPending).toBe(false);
  });

  it('calls onSuccess on resolve', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() =>
      useOptimisticMutation({
        mutationFn: () => Promise.resolve('data'),
        onOptimisticUpdate: vi.fn(),
        onRevert: vi.fn(),
        onSuccess,
      }),
    );
    await act(async () => { result.current.mutate('vars'); });
    expect(onSuccess).toHaveBeenCalledWith('data', 'vars');
  });

  it('calls onRevert and onError on reject', async () => {
    const onRevert = vi.fn();
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useOptimisticMutation({
        mutationFn: () => Promise.reject(new Error('fail')),
        onOptimisticUpdate: vi.fn(),
        onRevert,
        onError,
      }),
    );
    await act(async () => { result.current.mutate('vars'); });
    expect(onRevert).toHaveBeenCalledWith('vars');
    expect(onError).toHaveBeenCalledWith(expect.any(Error), 'vars');
  });

  it('calls onShowError with error message', async () => {
    const onShowError = vi.fn();
    const { result } = renderHook(() =>
      useOptimisticMutation({
        mutationFn: () => Promise.reject(new Error('bad')),
        onOptimisticUpdate: vi.fn(),
        onRevert: vi.fn(),
        onShowError,
      }),
    );
    await act(async () => { result.current.mutate('vars'); });
    expect(onShowError).toHaveBeenCalledWith('bad');
  });
});
