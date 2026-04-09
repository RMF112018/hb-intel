/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Tests for useProjectSites hook. W01r-P12: updated for the scope
 * discriminated union (`{ kind: 'year' | 'all' }`) and the renamed
 * `scope` field on `IProjectSitesResult`.
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
import { useProjectSites } from './useProjectSites.js';
import { scopeFromYear, SCOPE_ALL } from '../types.js';

const mockUseQuery = vi.mocked(useQuery);

describe('useProjectSites', () => {
  beforeEach(() => { mockUseQuery.mockReset(); });

  it('returns null when scope is null', () => {
    mockUseQuery.mockReturnValue({
      data: undefined, isLoading: false, isError: false, error: null,
    } as any);

    expect(useProjectSites(null)).toBeNull();
  });

  it('returns loading status when query is in flight', () => {
    mockUseQuery.mockReturnValue({
      data: undefined, isLoading: true, isError: false, error: null,
    } as any);

    const result = useProjectSites(scopeFromYear(2024));
    expect(result?.status).toBe('loading');
    expect(result?.scope).toEqual({ kind: 'year', year: 2024 });
  });

  it('returns error status with message on query failure', () => {
    mockUseQuery.mockReturnValue({
      data: undefined, isLoading: false, isError: true,
      error: new Error('Network timeout'),
    } as any);

    const result = useProjectSites(scopeFromYear(2024));
    expect(result?.status).toBe('error');
    expect(result?.errorMessage).toBe('Network timeout');
  });

  it('returns empty status when query returns no items', () => {
    mockUseQuery.mockReturnValue({
      data: [], isLoading: false, isError: false, error: null,
    } as any);

    const result = useProjectSites(scopeFromYear(2024));
    expect(result?.status).toBe('empty');
  });

  it('returns success status with normalized entries for a year scope', () => {
    mockUseQuery.mockReturnValue({
      data: [{
        Id: 1, ProjectName: 'Test', ProjectNumber: '24-001-01',
        SiteUrl: 'https://example.com', Year: 2024, Department: 'commercial',
        ProjectLocation: null, ProjectType: null, ProjectStage: 'Active', ClientName: null,
      }],
      isLoading: false, isError: false, error: null,
    } as any);

    const result = useProjectSites(scopeFromYear(2024));
    expect(result?.status).toBe('success');
    expect(result?.entries).toHaveLength(1);
    expect(result?.scope).toEqual({ kind: 'year', year: 2024 });
  });

  it('returns success for All Projects scope (no year filter)', () => {
    mockUseQuery.mockReturnValue({
      data: [
        { Id: 1, ProjectName: 'Alpha', ProjectNumber: '24-001-01', SiteUrl: 'https://a.com', Year: 2024, ProjectStage: 'Active' },
        { Id: 2, ProjectName: 'Beta', ProjectNumber: '25-002-01', SiteUrl: 'https://b.com', Year: 2025, ProjectStage: 'Active' },
      ],
      isLoading: false, isError: false, error: null,
    } as any);

    const result = useProjectSites(SCOPE_ALL);
    expect(result?.status).toBe('success');
    expect(result?.entries).toHaveLength(2);
    expect(result?.scope).toEqual({ kind: 'all' });
  });

  it('passes correct cache key for a year scope', () => {
    mockUseQuery.mockReturnValue({
      data: [], isLoading: false, isError: false, error: null,
    } as any);

    useProjectSites(scopeFromYear(2025));
    const config = mockUseQuery.mock.calls[0][0] as any;
    expect(config.queryKey).toEqual(['project-sites', 'year:2025']);
    expect(config.enabled).toBe(true);
  });

  it('passes correct cache key for All Projects scope', () => {
    mockUseQuery.mockReturnValue({
      data: [], isLoading: false, isError: false, error: null,
    } as any);

    useProjectSites(SCOPE_ALL);
    const config = mockUseQuery.mock.calls[0][0] as any;
    expect(config.queryKey).toEqual(['project-sites', 'all']);
    expect(config.enabled).toBe(true);
  });

  it('disables query when scope is null', () => {
    mockUseQuery.mockReturnValue({
      data: undefined, isLoading: false, isError: false, error: null,
    } as any);

    useProjectSites(null);
    const config = mockUseQuery.mock.calls[0][0] as any;
    expect(config.enabled).toBe(false);
  });
});
