/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Tests for useAvailableYears hook.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

vi.mock('@pnp/sp', () => ({
  spfi: () => ({ using: () => ({}) }),
  SPFx: () => ({}),
}));
vi.mock('@pnp/sp/webs', () => ({}));
vi.mock('@pnp/sp/lists', () => ({}));
vi.mock('@pnp/sp/items', () => ({}));

vi.mock('@hbc/auth/spfx', () => ({
  getSpfxContext: () => ({}),
}));

import { useQuery } from '@tanstack/react-query';
import { useAvailableYears } from './useAvailableYears.js';

const mockUseQuery = vi.mocked(useQuery);

describe('useAvailableYears', () => {
  beforeEach(() => { mockUseQuery.mockReset(); });

  it('returns loading status when query is in flight', () => {
    mockUseQuery.mockReturnValue({
      data: undefined, isLoading: true, isError: false, error: null,
    } as any);

    const result = useAvailableYears();
    expect(result.status).toBe('loading');
    expect(result.years).toEqual([]);
  });

  it('returns error status with message on failure', () => {
    mockUseQuery.mockReturnValue({
      data: undefined, isLoading: false, isError: true,
      error: new Error('Permission denied'),
    } as any);

    const result = useAvailableYears();
    expect(result.status).toBe('error');
    expect(result.errorMessage).toBe('Permission denied');
  });

  it('returns empty status when no years found', () => {
    mockUseQuery.mockReturnValue({
      data: [], isLoading: false, isError: false, error: null,
    } as any);

    const result = useAvailableYears();
    expect(result.status).toBe('empty');
    expect(result.years).toEqual([]);
  });

  it('returns success status with years', () => {
    mockUseQuery.mockReturnValue({
      data: [2026, 2025, 2024], isLoading: false, isError: false, error: null,
    } as any);

    const result = useAvailableYears();
    expect(result.status).toBe('success');
    expect(result.years).toEqual([2026, 2025, 2024]);
  });

  it('uses correct query key', () => {
    mockUseQuery.mockReturnValue({
      data: [], isLoading: false, isError: false, error: null,
    } as any);

    useAvailableYears();
    const config = mockUseQuery.mock.calls[0][0] as any;
    expect(config.queryKey).toEqual(['project-sites-available-years']);
  });
});
