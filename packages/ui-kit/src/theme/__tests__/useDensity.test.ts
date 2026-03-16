import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock useHbcTheme to avoid needing full provider
vi.mock('../useHbcTheme.js', () => ({
  useHbcTheme: vi.fn(() => ({ mode: 'office' })),
}));

// Mock density.ts utilities
vi.mock('../density.js', () => ({
  detectDensityTier: vi.fn(() => 'compact'),
  getDensityOverride: vi.fn(() => null),
  persistDensityOverride: vi.fn(),
  clearDensityOverride: vi.fn(),
}));

const { useDensity } = await import('../useDensity.js');
const { useHbcTheme } = await import('../useHbcTheme.js');
const { detectDensityTier, getDensityOverride, persistDensityOverride, clearDensityOverride } = await import('../density.js');

describe('useDensity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(detectDensityTier).mockReturnValue('compact');
    vi.mocked(getDensityOverride).mockReturnValue(null);
    vi.mocked(useHbcTheme).mockReturnValue({ mode: 'office' } as ReturnType<typeof useHbcTheme>);
  });

  it('auto-detects tier', () => {
    const { result } = renderHook(() => useDensity());
    expect(result.current.tier).toBe('compact');
  });

  it('setOverride persists and updates tier', () => {
    const { result } = renderHook(() => useDensity());
    act(() => { result.current.setOverride('touch'); });
    expect(result.current.tier).toBe('touch');
    expect(persistDensityOverride).toHaveBeenCalledWith('touch');
  });

  it('clearOverride reverts to auto-detected', () => {
    vi.mocked(detectDensityTier).mockReturnValue('comfortable');
    const { result } = renderHook(() => useDensity());
    act(() => { result.current.setOverride('touch'); });
    act(() => { result.current.clearOverride(); });
    expect(result.current.tier).toBe('comfortable');
    expect(clearDensityOverride).toHaveBeenCalled();
  });

  it('field mode defaults to comfortable', () => {
    vi.mocked(useHbcTheme).mockReturnValue({ mode: 'field' } as ReturnType<typeof useHbcTheme>);
    const { result } = renderHook(() => useDensity());
    expect(result.current.tier).toBe('comfortable');
  });
});
