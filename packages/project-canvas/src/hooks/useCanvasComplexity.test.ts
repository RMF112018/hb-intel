import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCanvasComplexity } from './useCanvasComplexity.js';

describe('useCanvasComplexity', () => {
  it('returns standard tier by default (no arg)', () => {
    const { result } = renderHook(() => useCanvasComplexity());

    expect(result.current.tier).toBe('standard');
    expect(result.current.isEssential).toBe(false);
    expect(result.current.isExpert).toBe(false);
  });

  it('returns essential tier with isEssential=true', () => {
    const { result } = renderHook(() => useCanvasComplexity('essential'));

    expect(result.current.tier).toBe('essential');
    expect(result.current.isEssential).toBe(true);
    expect(result.current.isExpert).toBe(false);
  });

  it('returns expert tier with isExpert=true', () => {
    const { result } = renderHook(() => useCanvasComplexity('expert'));

    expect(result.current.tier).toBe('expert');
    expect(result.current.isEssential).toBe(false);
    expect(result.current.isExpert).toBe(true);
  });

  it('falls back to standard for unknown tier', () => {
    const { result } = renderHook(() => useCanvasComplexity('unknown-tier'));

    expect(result.current.tier).toBe('standard');
  });

  it('returns standard for undefined', () => {
    const { result } = renderHook(() => useCanvasComplexity(undefined));

    expect(result.current.tier).toBe('standard');
  });
});
