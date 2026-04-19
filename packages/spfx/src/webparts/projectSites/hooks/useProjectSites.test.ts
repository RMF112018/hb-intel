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

  it('returns success status with resolved entries for a year scope', () => {
    // React Query's `select` is only called for real queryFn data; when
    // the test stubs `data` directly, it is surfaced as-is. Feed the
    // post-select shape (resolved entries) to match runtime behavior.
    mockUseQuery.mockReturnValue({
      data: [{ id: 1, projectName: 'Test' } as any],
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
        { id: 1, projectName: 'Alpha' } as any,
        { id: 2, projectName: 'Beta' } as any,
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
    expect(typeof config.select).toBe('function');
  });

  it('passes correct cache key for All Projects scope', () => {
    mockUseQuery.mockReturnValue({
      data: [], isLoading: false, isError: false, error: null,
    } as any);

    useProjectSites(SCOPE_ALL);
    const config = mockUseQuery.mock.calls[0][0] as any;
    expect(config.queryKey).toEqual(['project-sites', 'all']);
    expect(config.enabled).toBe(true);
    expect(typeof config.select).toBe('function');
  });

  it('disables query when scope is null', () => {
    mockUseQuery.mockReturnValue({
      data: undefined, isLoading: false, isError: false, error: null,
    } as any);

    useProjectSites(null);
    const config = mockUseQuery.mock.calls[0][0] as any;
    expect(config.enabled).toBe(false);
  });

  it('resolves repository query result through query select', () => {
    mockUseQuery.mockReturnValue({
      data: [], isLoading: false, isError: false, error: null,
    } as any);

    useProjectSites(scopeFromYear(2025));
    const config = mockUseQuery.mock.calls[0][0] as any;
    const queryResult = {
      projectRows: [{
        Id: 1,
        Title: '25-001-01 - Alpha',
        Year: 2025,
        field_2: '25-001-01',
        field_3: 'Alpha',
        field_23: 'https://example.com/sites/alpha',
        field_6: 'Active',
      }],
      fallbackCandidates: [],
    };
    const resolved = config.select(queryResult);

    expect(resolved).toHaveLength(1);
    expect(resolved[0].recordKey).toBe('project:1');
    expect(resolved[0].projectName).toBe('Alpha');
    expect(resolved[0].projectNumber).toBe('25-001-01');
    expect(resolved[0].siteUrl).toBe('https://example.com/sites/alpha');
    expect(resolved[0].sourceClassification).toBe('project-only');
  });

  it('preserves normalized entry identity when query data identity is unchanged', () => {
    const stableEntries = [{
      id: 1,
      projectName: 'Stable',
      projectNumber: '25-001-01',
      siteUrl: 'https://example.com',
      year: 2025,
      department: '',
      officeDivision: '',
      projectLocation: '',
      projectType: '',
      projectStage: 'Active',
      clientName: '',
      projectStreetAddress: '',
      projectCity: '',
      projectCounty: '',
      projectState: '',
      projectZip: '',
      projectExecutiveUpn: '',
      projectManagerUpn: '',
      leadEstimatorUpn: '',
      supportingEstimatorUpns: [],
      procoreProject: '',
      primarySiteUrl: 'https://example.com',
      legacyFallbackFolderUrl: '',
      legacyFallbackSourceYear: null,
      legacyFallbackMatchStatus: '',
      launchTargetKind: 'primary-site',
      hasSiteUrl: true,
      dataQuality: {
        classification: 'complete',
        issues: [],
        hasAnyIssue: false,
        hasLaunchCriticalIssue: false,
      },
      launchStatus: {
        state: 'live',
        reasonCode: 'live-site-ready',
        isLaunchable: true,
        userMessage: 'Live site is available and launch-ready.',
      },
    }];

    mockUseQuery.mockReturnValue({
      data: stableEntries, isLoading: false, isError: false, error: null,
    } as any);

    const first = useProjectSites(scopeFromYear(2025));
    const second = useProjectSites(scopeFromYear(2025));

    expect(first?.status).toBe('success');
    expect(second?.status).toBe('success');
    expect(first?.entries).toBe(stableEntries);
    expect(second?.entries).toBe(stableEntries);
    expect(second?.entries).toBe(first?.entries);
  });
});
