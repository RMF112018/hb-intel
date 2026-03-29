import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { IAvailableYearsResult, IProjectSitesResult } from './types.js';

// ── Mock hooks ────────────────────────────────────────────────────────────

const mockUseAvailableYears = vi.fn<() => IAvailableYearsResult>();
const mockUseProjectSites = vi.fn<(year: number | null) => IProjectSitesResult | null>();

vi.mock('./hooks/useAvailableYears.js', () => ({
  useAvailableYears: () => mockUseAvailableYears(),
}));

vi.mock('./hooks/useProjectSites.js', () => ({
  useProjectSites: (year: number | null) => mockUseProjectSites(year),
}));

import { ProjectSitesRoot } from './ProjectSitesRoot.js';

// ── Tests ─────────────────────────────────────────────────────────────────

describe('ProjectSitesRoot', () => {
  beforeEach(() => {
    mockUseAvailableYears.mockReset();
    mockUseProjectSites.mockReset();
  });

  it('renders spinner when years are loading', () => {
    mockUseAvailableYears.mockReturnValue({ status: 'loading', years: [], errorMessage: null });
    mockUseProjectSites.mockReturnValue(null);

    render(<ProjectSitesRoot />);
    expect(screen.getByText('Project Sites')).toBeInTheDocument();
  });

  it('renders error when years fail to load', () => {
    mockUseAvailableYears.mockReturnValue({ status: 'error', years: [], errorMessage: 'Network error' });
    mockUseProjectSites.mockReturnValue(null);

    render(<ProjectSitesRoot />);
    expect(screen.getByText('Unable to Load Project Sites')).toBeInTheDocument();
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('renders empty state when no years exist', () => {
    mockUseAvailableYears.mockReturnValue({ status: 'empty', years: [], errorMessage: null });
    mockUseProjectSites.mockReturnValue(null);

    render(<ProjectSitesRoot />);
    expect(screen.getByText('No Project Sites')).toBeInTheDocument();
  });

  it('renders year selector buttons when years load', () => {
    mockUseAvailableYears.mockReturnValue({ status: 'success', years: [2026, 2025], errorMessage: null });
    mockUseProjectSites.mockReturnValue({
      status: 'success', selectedYear: 2026,
      entries: [{ id: 1, projectName: 'Test', projectNumber: '', siteUrl: 'https://x.com', year: 2026, department: '', projectLocation: '', projectType: '', projectStage: '', clientName: '', hasSiteUrl: true }],
      errorMessage: null,
    });

    render(<ProjectSitesRoot />);
    expect(screen.getByText('2026')).toBeInTheDocument();
    expect(screen.getByText('2025')).toBeInTheDocument();
  });

  it('renders project cards on success', () => {
    mockUseAvailableYears.mockReturnValue({ status: 'success', years: [2025], errorMessage: null });
    mockUseProjectSites.mockReturnValue({
      status: 'success', selectedYear: 2025,
      entries: [
        { id: 1, projectName: 'Alpha Project', projectNumber: '25-001-01', siteUrl: 'https://x.com', year: 2025, department: 'commercial', projectLocation: '', projectType: '', projectStage: 'Active', clientName: '', hasSiteUrl: true },
        { id: 2, projectName: 'Beta Project', projectNumber: '25-002-01', siteUrl: 'https://y.com', year: 2025, department: '', projectLocation: '', projectType: '', projectStage: '', clientName: '', hasSiteUrl: true },
      ],
      errorMessage: null,
    });

    render(<ProjectSitesRoot />);
    expect(screen.getByText('Alpha Project')).toBeInTheDocument();
    expect(screen.getByText('Beta Project')).toBeInTheDocument();
    expect(screen.getByText('2 projects')).toBeInTheDocument();
  });

  it('renders empty state for a year with no projects', () => {
    mockUseAvailableYears.mockReturnValue({ status: 'success', years: [2025], errorMessage: null });
    mockUseProjectSites.mockReturnValue({
      status: 'empty', selectedYear: 2025, entries: [], errorMessage: null,
    });

    render(<ProjectSitesRoot />);
    expect(screen.getByText('No Project Sites')).toBeInTheDocument();
    expect(screen.getByText(/No projects were found for 2025/)).toBeInTheDocument();
  });

  it('renders error when project query fails', () => {
    mockUseAvailableYears.mockReturnValue({ status: 'success', years: [2025], errorMessage: null });
    mockUseProjectSites.mockReturnValue({
      status: 'error', selectedYear: 2025, entries: [], errorMessage: 'SP error',
    });

    render(<ProjectSitesRoot />);
    expect(screen.getByText('Unable to Load Project Sites')).toBeInTheDocument();
  });
});
