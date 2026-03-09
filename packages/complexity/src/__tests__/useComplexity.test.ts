import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useComplexity } from '../hooks/useComplexity';
import { createComplexityWrapper, allTiers } from '../../testing';

describe('useComplexity — atLeast helper', () => {
  it.each([
    ['essential', 'essential', true],
    ['essential', 'standard', false],
    ['essential', 'expert', false],
    ['standard', 'essential', true],
    ['standard', 'standard', true],
    ['standard', 'expert', false],
    ['expert', 'essential', true],
    ['expert', 'standard', true],
    ['expert', 'expert', true],
  ] as const)('at %s, atLeast(%s) = %s', (tier, threshold, expected) => {
    const { result } = renderHook(() => useComplexity(), {
      wrapper: createComplexityWrapper(tier),
    });
    expect(result.current.atLeast(threshold)).toBe(expected);
  });
});

describe('useComplexity — is helper', () => {
  it.each(allTiers)('is(%s) true only when current tier is %s', (tier) => {
    const { result } = renderHook(() => useComplexity(), {
      wrapper: createComplexityWrapper(tier),
    });
    for (const t of allTiers) {
      expect(result.current.is(t)).toBe(t === tier);
    }
  });
});

describe('useComplexity — showCoaching default (D-07)', () => {
  it('defaults showCoaching to true at essential', () => {
    const { result } = renderHook(() => useComplexity(), {
      wrapper: createComplexityWrapper('essential'),
    });
    expect(result.current.showCoaching).toBe(true);
  });

  it('defaults showCoaching to false at standard', () => {
    const { result } = renderHook(() => useComplexity(), {
      wrapper: createComplexityWrapper('standard'),
    });
    expect(result.current.showCoaching).toBe(false);
  });

  it('defaults showCoaching to false at expert', () => {
    const { result } = renderHook(() => useComplexity(), {
      wrapper: createComplexityWrapper('expert'),
    });
    expect(result.current.showCoaching).toBe(false);
  });
});
