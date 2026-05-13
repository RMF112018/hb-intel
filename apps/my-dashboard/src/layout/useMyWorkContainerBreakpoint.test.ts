import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRef } from 'react';
import {
  resolveMyWorkResponsiveMode,
  useMyWorkContainerBreakpoint,
  type MyWorkResponsiveMode,
} from './useMyWorkContainerBreakpoint.js';

describe('resolveMyWorkResponsiveMode', () => {
  const cases: ReadonlyArray<readonly [number, MyWorkResponsiveMode]> = [
    [0, 'phone'],
    [479, 'phone'],
    [480, 'tabletPortrait'],
    [768, 'tabletPortrait'],
    [769, 'tabletLandscape'],
    [1024, 'tabletLandscape'],
    [1025, 'smallLaptop'],
    [1180, 'smallLaptop'],
    [1181, 'standardLaptop'],
    [1440, 'standardLaptop'],
    [1441, 'largeLaptop'],
    [1599, 'largeLaptop'],
    [1600, 'desktop'],
    [1919, 'desktop'],
    [1920, 'ultrawide'],
    [9999, 'ultrawide'],
  ];

  for (const [width, expected] of cases) {
    it(`returns ${expected} at width ${width}`, () => {
      expect(resolveMyWorkResponsiveMode(width)).toBe(expected);
    });
  }
});

describe('useMyWorkContainerBreakpoint', () => {
  it('returns forceMode when provided, regardless of the ref', () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      return useMyWorkContainerBreakpoint(ref, 'phone');
    });
    expect(result.current).toBe('phone');
  });

  it('returns the standardLaptop initial mode in jsdom (no ResizeObserver)', () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      return useMyWorkContainerBreakpoint(ref);
    });
    expect(result.current).toBe('standardLaptop');
  });
});
