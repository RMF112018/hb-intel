import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useAdobeSignCallbackResult } from './useAdobeSignCallbackResult.js';

describe('useAdobeSignCallbackResult', () => {
  it('returns null when the readSearch seam returns an empty string', () => {
    const readSearch = vi.fn(() => '');
    const cleanUrl = vi.fn();
    const { result } = renderHook(() => useAdobeSignCallbackResult({ readSearch, cleanUrl }));
    expect(result.current).toBeNull();
    expect(cleanUrl).not.toHaveBeenCalled();
  });

  it('returns null when the marker is absent', () => {
    const readSearch = vi.fn(() => '?foo=bar');
    const cleanUrl = vi.fn();
    const { result } = renderHook(() => useAdobeSignCallbackResult({ readSearch, cleanUrl }));
    expect(result.current).toBeNull();
    expect(cleanUrl).not.toHaveBeenCalled();
  });

  it('returns the parsed result when the marker is present', () => {
    const readSearch = vi.fn(() => '?adobeSignAuthorization=success');
    const cleanUrl = vi.fn();
    const { result } = renderHook(() => useAdobeSignCallbackResult({ readSearch, cleanUrl }));
    expect(result.current).not.toBeNull();
    expect(result.current?.kind).toBe('success');
    expect(result.current?.backendStatus).toBe('success');
  });

  it('cleans the URL exactly once by removing only the adobeSignAuthorization parameter', () => {
    const readSearch = vi.fn(() => '?foo=bar&adobeSignAuthorization=success&baz=qux');
    const cleanUrl = vi.fn();
    renderHook(() => useAdobeSignCallbackResult({ readSearch, cleanUrl }));
    expect(cleanUrl).toHaveBeenCalledTimes(1);
    expect(cleanUrl).toHaveBeenCalledWith('?foo=bar&baz=qux');
  });

  it('passes an empty cleaned search when the marker was the only query parameter', () => {
    const readSearch = vi.fn(() => '?adobeSignAuthorization=invalid-state');
    const cleanUrl = vi.fn();
    renderHook(() => useAdobeSignCallbackResult({ readSearch, cleanUrl }));
    expect(cleanUrl).toHaveBeenCalledWith('');
  });

  it('is idempotent across re-renders — cleanUrl is called once even when re-rendered', () => {
    const readSearch = vi.fn(() => '?adobeSignAuthorization=success');
    const cleanUrl = vi.fn();
    const { rerender } = renderHook(() => useAdobeSignCallbackResult({ readSearch, cleanUrl }));
    rerender();
    rerender();
    expect(cleanUrl).toHaveBeenCalledTimes(1);
  });

  it('surfaces an unknown-kind result for an unrecognized status', () => {
    const readSearch = vi.fn(() => '?adobeSignAuthorization=mystery-status');
    const cleanUrl = vi.fn();
    const { result } = renderHook(() => useAdobeSignCallbackResult({ readSearch, cleanUrl }));
    expect(result.current?.kind).toBe('unknown');
    expect(result.current?.backendStatus).toBe('mystery-status');
  });
});
