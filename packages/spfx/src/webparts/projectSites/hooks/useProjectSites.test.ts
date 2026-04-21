/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Tests for the useProjectSites hook.
 *
 * Post-cap retrieval contract:
 *   - The hook drives a `select` callback that runs the resolver and
 *     attaches the bounded/fetchedCount retrieval signals. Because
 *     `useQuery` is mocked here, tests stub `data` with the **post-
 *     select** shape `{ entries, bounded, fetchedCount }` — the same
 *     shape the real hook reads at runtime.
 *   - One test (`select is wired to the resolver`) exercises the select
 *     callback directly to prove the merge path is intact end-to-end.
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

vi.mock('@microsoft/sp-http', () => ({
  SPHttpClient: { configurations: { v1: {} } },
}));

import { useQuery } from '@tanstack/react-query';
import { useProjectSites } from './useProjectSites.js';
import { scopeFromYear, SCOPE_ALL, type IProjectSiteEntry } from '../types.js';

const mockUseQuery = vi.mocked(useQuery);

function emptySelectedData() {
  return { entries: [] as IProjectSiteEntry[], bounded: false, fetchedCount: 0 };
}

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
    expect(result?.bounded).toBe(false);
    expect(result?.fetchedCount).toBe(0);
  });

  it('returns error status with message on query failure', () => {
    mockUseQuery.mockReturnValue({
      data: undefined, isLoading: false, isError: true,
      error: new Error('Network timeout'),
    } as any);

    const result = useProjectSites(scopeFromYear(2024));
    expect(result?.status).toBe('error');
    expect(result?.errorMessage).toBe('Network timeout');
    expect(result?.bounded).toBe(false);
  });

  it('returns empty status when query returns no items', () => {
    mockUseQuery.mockReturnValue({
      data: emptySelectedData(), isLoading: false, isError: false, error: null,
    } as any);

    const result = useProjectSites(scopeFromYear(2024));
    expect(result?.status).toBe('empty');
    expect(result?.fetchedCount).toBe(0);
  });

  it('returns success with entries and propagates fetched count', () => {
    mockUseQuery.mockReturnValue({
      data: {
        entries: [{ recordKey: 'project:1', projectName: 'Alpha' } as any],
        bounded: false,
        fetchedCount: 1,
      },
      isLoading: false, isError: false, error: null,
    } as any);

    const result = useProjectSites(scopeFromYear(2025));
    expect(result?.status).toBe('success');
    expect(result?.entries).toHaveLength(1);
    expect(result?.entries[0].projectName).toBe('Alpha');
    expect(result?.scope).toEqual({ kind: 'year', year: 2025 });
    expect(result?.bounded).toBe(false);
    expect(result?.fetchedCount).toBe(1);
  });

  it('propagates bounded=true when the repository hit the safety ceiling', () => {
    // The ceiling-hit signal is the load-bearing UX honesty — confirms
    // the bounded flag travels from repository through select to the
    // hook return value, so the UI can render an honest overflow notice.
    mockUseQuery.mockReturnValue({
      data: {
        entries: [
          { recordKey: 'project:1' } as any,
          { recordKey: 'project:2' } as any,
        ],
        bounded: true,
        fetchedCount: 25000,
      },
      isLoading: false, isError: false, error: null,
    } as any);

    const result = useProjectSites(SCOPE_ALL);
    expect(result?.status).toBe('success');
    expect(result?.entries).toHaveLength(2);
    expect(result?.scope).toEqual({ kind: 'all' });
    expect(result?.bounded).toBe(true);
    expect(result?.fetchedCount).toBe(25000);
  });

  it('passes correct cache key for a year scope', () => {
    mockUseQuery.mockReturnValue({
      data: emptySelectedData(), isLoading: false, isError: false, error: null,
    } as any);

    useProjectSites(scopeFromYear(2025));
    const config = mockUseQuery.mock.calls[0][0] as any;
    expect(config.queryKey).toEqual(['project-sites', 'year:2025']);
    expect(config.enabled).toBe(true);
    expect(typeof config.select).toBe('function');
  });

  it('passes correct cache key for All Projects scope', () => {
    mockUseQuery.mockReturnValue({
      data: emptySelectedData(), isLoading: false, isError: false, error: null,
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

  it('select wires the repository result through the resolver and attaches retrieval signals', () => {
    // Exercises the select callback directly with the raw query-result
    // shape the repository emits, proving the resolver path remains
    // intact end-to-end and that bounded/fetchedCount travel with it.
    mockUseQuery.mockReturnValue({
      data: emptySelectedData(), isLoading: false, isError: false, error: null,
    } as any);

    useProjectSites(scopeFromYear(2025));
    const config = mockUseQuery.mock.calls[0][0] as any;
    const selected = config.select({
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
      bounded: true,
      fetchedCount: 25000,
    });

    expect(selected.entries).toHaveLength(1);
    expect(selected.entries[0].recordKey).toBe('project:1');
    expect(selected.entries[0].sourceClassification).toBe('project-only');
    expect(selected.bounded).toBe(true);
    expect(selected.fetchedCount).toBe(25000);
  });

  it('select resolves fallback-only input into a synthetic legacy-only entry', () => {
    mockUseQuery.mockReturnValue({
      data: emptySelectedData(), isLoading: false, isError: false, error: null,
    } as any);
    useProjectSites(scopeFromYear(2022));
    const config = mockUseQuery.mock.calls[0][0] as any;
    const selected = config.select({
      projectRows: [],
      fallbackCandidates: [{
        id: 9001,
        projectNumber: '22-100-01',
        projectNameRaw: 'Orphan Legacy',
        legacyYear: 2022,
        folderWebUrl: 'https://tenant/orphan',
        matchStatus: 'matched',
        matchedProjectListItemId: null,
        matchedProjectTitle: '',
        matchConfidence: null,
        matchMethod: null,
        lastValidatedUtc: '',
        lastSeenUtc: '',
      }],
      bounded: false,
      fetchedCount: 0,
    });

    expect(selected.entries).toHaveLength(1);
    expect(selected.entries[0].sourceClassification).toBe('legacy-only');
    expect(selected.entries[0].recordKey).toBe('legacy:22-100-01:2022');
    expect(selected.entries[0].launchTargetKind).toBe('legacy-fallback');
    expect(selected.entries[0].siteUrl).toBe('https://tenant/orphan');
  });
});
