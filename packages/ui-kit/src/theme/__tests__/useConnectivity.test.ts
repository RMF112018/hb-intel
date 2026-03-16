import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useConnectivity } from '../useConnectivity.js';

describe('useConnectivity', () => {
  it('returns online when navigator is online', () => {
    Object.defineProperty(navigator, 'onLine', { writable: true, configurable: true, value: true });
    const { result } = renderHook(() => useConnectivity());
    expect(result.current).toBe('online');
  });

  it('returns ConnectivityStatus type', () => {
    const { result } = renderHook(() => useConnectivity());
    expect(['online', 'syncing', 'offline']).toContain(result.current);
  });
});
