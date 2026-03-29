/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Tests for useProjectSites hook status-mapping logic.
 *
 * The PnPjs query itself requires a live SPFx context and cannot be unit-tested.
 * These tests validate the hook's status-mapping by mocking react-query and
 * verifying the correct IProjectSitesResult for each PageYearResolution input.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { PageYearResolution } from '../types.js';

// ── Hoist all mocks before any module resolution ──────────────────────────

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

// ── Import after mocks are hoisted ───────────────────────────────────────

import { useQuery } from '@tanstack/react-query';
import { useProjectSites } from './useProjectSites.js';

const mockUseQuery = vi.mocked(useQuery);

// ── Tests ─────────────────────────────────────────────────────────────────

describe('useProjectSites', () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
  });

  it('returns no-year status for missing year resolution', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    const resolution: PageYearResolution = { kind: 'missing' };
    const result = useProjectSites(resolution);

    expect(result.status).toBe('no-year');
    expect(result.resolvedYear).toBeNull();
    expect(result.entries).toEqual([]);
  });

  it('returns invalid-year status for invalid year resolution', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    const resolution: PageYearResolution = {
      kind: 'invalid',
      rawValue: 'garbage',
      source: 'page-metadata',
    };
    const result = useProjectSites(resolution);

    expect(result.status).toBe('invalid-year');
    expect(result.resolvedYear).toBeNull();
    expect(result.yearResolution).toBe(resolution);
  });

  it('returns loading status when query is in flight', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    const resolution: PageYearResolution = {
      kind: 'resolved',
      year: 2024,
      source: 'page-metadata',
    };
    const result = useProjectSites(resolution);

    expect(result.status).toBe('loading');
    expect(result.resolvedYear?.year).toBe(2024);
  });

  it('returns error status with message on query failure', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Network timeout'),
    } as any);

    const resolution: PageYearResolution = {
      kind: 'resolved',
      year: 2024,
      source: 'page-metadata',
    };
    const result = useProjectSites(resolution);

    expect(result.status).toBe('error');
    expect(result.errorMessage).toBe('Network timeout');
  });

  it('returns empty status when query returns no items', () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    const resolution: PageYearResolution = {
      kind: 'resolved',
      year: 2024,
      source: 'page-metadata',
    };
    const result = useProjectSites(resolution);

    expect(result.status).toBe('empty');
    expect(result.entries).toEqual([]);
  });

  it('returns success status with normalized entries', () => {
    mockUseQuery.mockReturnValue({
      data: [
        {
          Id: 1,
          ProjectName: 'Test Project',
          ProjectNumber: '24-001-01',
          SiteUrl: 'https://example.com',
          Year: 2024,
          Department: 'commercial',
          ProjectLocation: null,
          ProjectType: null,
          ProjectStage: 'Active',
          ClientName: null,
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    const resolution: PageYearResolution = {
      kind: 'resolved',
      year: 2024,
      source: 'page-metadata',
    };
    const result = useProjectSites(resolution);

    expect(result.status).toBe('success');
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].projectName).toBe('Test Project');
    expect(result.entries[0].hasSiteUrl).toBe(true);
  });

  it('passes correct query key with year', () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    const resolution: PageYearResolution = {
      kind: 'resolved',
      year: 2025,
      source: 'property-pane',
    };
    useProjectSites(resolution);

    const queryConfig = mockUseQuery.mock.calls[0][0] as any;
    expect(queryConfig.queryKey).toEqual(['project-sites', 2025]);
    expect(queryConfig.enabled).toBe(true);
  });

  it('disables query when year is null (missing resolution)', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    useProjectSites({ kind: 'missing' });

    const queryConfig = mockUseQuery.mock.calls[0][0] as any;
    expect(queryConfig.enabled).toBe(false);
  });
});
