import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type {
  PageYearResolution,
  IProjectSitesResult,
  IProjectSiteEntry,
} from './types.js';
import { ProjectSitesRoot } from './ProjectSitesRoot.js';

// ── Mock useProjectSites ──────────────────────────────────────────────────

const mockUseProjectSites = vi.fn<(resolution: PageYearResolution) => IProjectSitesResult>();

vi.mock('./hooks/useProjectSites.js', () => ({
  useProjectSites: (resolution: PageYearResolution) => mockUseProjectSites(resolution),
}));

// ── Factories ─────────────────────────────────────────────────────────────

function createEntry(overrides?: Partial<IProjectSiteEntry>): IProjectSiteEntry {
  return {
    id: 1,
    projectName: 'Test Project',
    projectNumber: '24-001-01',
    siteUrl: 'https://example.com/sites/test',
    year: 2024,
    department: 'commercial',
    projectLocation: 'Austin, TX',
    projectType: 'Healthcare',
    projectStage: 'Active',
    clientName: 'Test Client',
    hasSiteUrl: true,
    ...overrides,
  };
}

const resolvedYear2024: PageYearResolution = { kind: 'resolved', year: 2024, source: 'page-metadata' };
const missingYear: PageYearResolution = { kind: 'missing' };
const invalidYear: PageYearResolution = { kind: 'invalid', rawValue: 99999, source: 'property-pane' };

// ── Tests ─────────────────────────────────────────────────────────────────

describe('ProjectSitesRoot', () => {
  beforeEach(() => {
    mockUseProjectSites.mockReset();
  });

  // ── No year ─────────────────────────────────────────────────────────

  it('renders "Year Not Configured" when no year is resolved', () => {
    mockUseProjectSites.mockReturnValue({
      status: 'no-year',
      resolvedYear: null,
      yearResolution: missingYear,
      entries: [],
      errorMessage: null,
    });

    render(<ProjectSitesRoot yearResolution={missingYear} />);
    expect(screen.getByText('Year Not Configured')).toBeInTheDocument();
    expect(screen.getByText(/Set the Year property/)).toBeInTheDocument();
  });

  // ── Invalid year ────────────────────────────────────────────────────

  it('renders "Invalid Year Value" with raw value detail', () => {
    mockUseProjectSites.mockReturnValue({
      status: 'invalid-year',
      resolvedYear: null,
      yearResolution: invalidYear,
      entries: [],
      errorMessage: null,
    });

    render(<ProjectSitesRoot yearResolution={invalidYear} />);
    expect(screen.getByText('Invalid Year Value')).toBeInTheDocument();
    expect(screen.getByText(/property pane override/)).toBeInTheDocument();
    expect(screen.getByText(/99999/)).toBeInTheDocument();
  });

  // ── Loading ─────────────────────────────────────────────────────────

  it('renders spinner and year badge during loading', () => {
    mockUseProjectSites.mockReturnValue({
      status: 'loading',
      resolvedYear: { kind: 'resolved', year: 2024, source: 'page-metadata' },
      yearResolution: resolvedYear2024,
      entries: [],
      errorMessage: null,
    });

    render(<ProjectSitesRoot yearResolution={resolvedYear2024} />);
    expect(screen.getByText('Project Sites')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
  });

  // ── Error ───────────────────────────────────────────────────────────

  it('renders error state with message', () => {
    mockUseProjectSites.mockReturnValue({
      status: 'error',
      resolvedYear: { kind: 'resolved', year: 2024, source: 'page-metadata' },
      yearResolution: resolvedYear2024,
      entries: [],
      errorMessage: 'Network failure',
    });

    render(<ProjectSitesRoot yearResolution={resolvedYear2024} />);
    expect(screen.getByText('Unable to Load Project Sites')).toBeInTheDocument();
    expect(screen.getByText('Network failure')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
  });

  // ── Empty ───────────────────────────────────────────────────────────

  it('renders empty state with year context', () => {
    mockUseProjectSites.mockReturnValue({
      status: 'empty',
      resolvedYear: { kind: 'resolved', year: 2024, source: 'page-metadata' },
      yearResolution: resolvedYear2024,
      entries: [],
      errorMessage: null,
    });

    render(<ProjectSitesRoot yearResolution={resolvedYear2024} />);
    expect(screen.getByText('No Project Sites')).toBeInTheDocument();
    expect(screen.getByText(/No projects were found for 2024/)).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
  });

  // ── Success ─────────────────────────────────────────────────────────

  it('renders card grid with year badge and count', () => {
    const entries = [
      createEntry({ id: 1, projectName: 'Alpha Project' }),
      createEntry({ id: 2, projectName: 'Beta Project', projectNumber: '24-002-01' }),
    ];

    mockUseProjectSites.mockReturnValue({
      status: 'success',
      resolvedYear: { kind: 'resolved', year: 2024, source: 'page-metadata' },
      yearResolution: resolvedYear2024,
      entries,
      errorMessage: null,
    });

    render(<ProjectSitesRoot yearResolution={resolvedYear2024} />);
    expect(screen.getByText('Project Sites')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('2 projects')).toBeInTheDocument();
    expect(screen.getByText('Alpha Project')).toBeInTheDocument();
    expect(screen.getByText('Beta Project')).toBeInTheDocument();
  });

  it('renders singular count for 1 project', () => {
    mockUseProjectSites.mockReturnValue({
      status: 'success',
      resolvedYear: { kind: 'resolved', year: 2024, source: 'page-metadata' },
      yearResolution: resolvedYear2024,
      entries: [createEntry()],
      errorMessage: null,
    });

    render(<ProjectSitesRoot yearResolution={resolvedYear2024} />);
    expect(screen.getByText('1 project')).toBeInTheDocument();
  });

  it('renders accessible list with aria-label', () => {
    mockUseProjectSites.mockReturnValue({
      status: 'success',
      resolvedYear: { kind: 'resolved', year: 2024, source: 'page-metadata' },
      yearResolution: resolvedYear2024,
      entries: [createEntry(), createEntry({ id: 2 })],
      errorMessage: null,
    });

    render(<ProjectSitesRoot yearResolution={resolvedYear2024} />);
    const list = screen.getByRole('list');
    expect(list).toHaveAttribute('aria-label', '2 project sites for 2024');
  });
});
