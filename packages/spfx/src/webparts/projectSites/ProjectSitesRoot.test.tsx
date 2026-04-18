import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import type {
  IAvailableYearsResult,
  IProjectSitesResult,
  IProjectSiteEntry,
  ProjectSitesScope,
} from './types.js';
import { normalizeProjectSitesRuntimeConfig, scopeFromYear, SCOPE_ALL } from './types.js';
import type { ProjectSitesContainerState } from './projectSitesLayoutMode.js';
import type * as LayoutModeModule from './projectSitesLayoutMode.js';

// ── Mock hooks ────────────────────────────────────────────────────────────

const mockUseAvailableYears = vi.fn<() => IAvailableYearsResult>();
const mockUseProjectSites = vi.fn<(scope: ProjectSitesScope | null) => IProjectSitesResult | null>();
const mockUseProjectSitesContainerState = vi.fn<() => ProjectSitesContainerState>();
const mockUseProjectSitesPeopleDisplayLabels = vi.fn<() => Record<string, string>>();

vi.mock('./hooks/useAvailableYears.js', () => ({
  useAvailableYears: () => mockUseAvailableYears(),
}));

vi.mock('./hooks/useProjectSites.js', () => ({
  useProjectSites: (scope: ProjectSitesScope | null) => mockUseProjectSites(scope),
}));

vi.mock('./projectSitesLayoutMode.js', async () => {
  const actual = await vi.importActual<typeof LayoutModeModule>(
    './projectSitesLayoutMode.js',
  );
  return {
    ...actual,
    useProjectSitesContainerState: () => mockUseProjectSitesContainerState(),
  };
});

vi.mock('./hooks/useProjectSitesPeopleDisplayLabels.js', () => ({
  useProjectSitesPeopleDisplayLabels: () => mockUseProjectSitesPeopleDisplayLabels(),
}));

import { ProjectSitesRoot } from './ProjectSitesRoot.js';

// ── Test entry factory ────────────────────────────────────────────────────

function createEntry(overrides?: Partial<IProjectSiteEntry>): IProjectSiteEntry {
  return {
    id: 1,
    projectName: 'Test Project',
    projectNumber: '25-001-01',
    siteUrl: 'https://example.com',
    year: 2025,
    department: '',
    officeDivision: '',
    projectLocation: '',
    projectType: '',
    projectStage: '',
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
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe('ProjectSitesRoot', () => {
  beforeEach(() => {
    mockUseAvailableYears.mockReset();
    mockUseProjectSites.mockReset();
    mockUseProjectSitesContainerState.mockReset();
    mockUseProjectSitesPeopleDisplayLabels.mockReset();
    mockUseProjectSitesContainerState.mockReturnValue({
      width: 1280,
      height: 900,
      mode: 'wide',
      displayClass: 'desktop',
      heightClass: 'standard',
      isShortHeight: false,
    });
    mockUseProjectSitesPeopleDisplayLabels.mockReturnValue({});
  });

  it('renders shimmer loading state when years are loading', () => {
    mockUseAvailableYears.mockReturnValue({ status: 'loading', years: [], errorMessage: null });
    mockUseProjectSites.mockReturnValue(null);

    render(<ProjectSitesRoot />);
    expect(screen.getByText('Project Sites')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: /loading project sites/i })).toBeInTheDocument();
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

  it('renders scope segmented control with All Projects + year options in wide mode', () => {
    mockUseAvailableYears.mockReturnValue({ status: 'success', years: [2026, 2025], errorMessage: null });
    mockUseProjectSites.mockReturnValue({
      status: 'success',
      scope: scopeFromYear(2026),
      entries: [createEntry({ id: 1, projectName: 'Test', projectNumber: '', year: 2026 })],
      errorMessage: null,
    });

    render(<ProjectSitesRoot />);
    const scopeGroup = screen.getByRole('radiogroup', { name: 'Scope' });
    expect(scopeGroup).toBeInTheDocument();
    expect(within(scopeGroup).getByText('All Projects')).toBeInTheDocument();
    expect(within(scopeGroup).getByText('2026')).toBeInTheDocument();
    expect(within(scopeGroup).getByText('2025')).toBeInTheDocument();
  });

  it('composes medium mode as a two-lane control band with scope, sort, and actions grouped in the secondary lane', () => {
    mockUseProjectSitesContainerState.mockReturnValue({
      width: 1000,
      height: 900,
      mode: 'medium',
      displayClass: 'tablet',
      heightClass: 'standard',
      isShortHeight: false,
    });
    mockUseAvailableYears.mockReturnValue({ status: 'success', years: [2026, 2025], errorMessage: null });
    mockUseProjectSites.mockReturnValue({
      status: 'success',
      scope: scopeFromYear(2026),
      entries: [createEntry({ id: 1, projectName: 'Medium Test', projectNumber: '', year: 2026 })],
      errorMessage: null,
    });

    const { container } = render(<ProjectSitesRoot />);

    // Medium mode keeps the segmented scope control (not the compact <select>).
    expect(screen.queryByLabelText('Scope (compact)')).not.toBeInTheDocument();
    const scopeGroup = screen.getByRole('radiogroup', { name: 'Scope' });
    expect(scopeGroup).toBeInTheDocument();

    // Secondary lane exists, carries the medium marker, and groups the
    // scope / sort / filter clusters into one deliberate row.
    const secondaryLane = container.querySelector(
      '[data-project-sites-secondary-lane="medium"]',
    );
    expect(secondaryLane).not.toBeNull();
    expect(secondaryLane).toContainElement(scopeGroup);
    expect(secondaryLane).toContainElement(screen.getByLabelText('Sort project sites'));
    expect(secondaryLane).toContainElement(
      screen.getByRole('button', { name: /filters/i }),
    );

    // Control-layout diagnostic reflects medium.
    expect(screen.getByRole('search')).toHaveAttribute(
      'data-project-sites-control-layout',
      'medium',
    );
  });

  it('applies the featured sparse grid variant for a single wide-mode result', () => {
    mockUseAvailableYears.mockReturnValue({ status: 'success', years: [2026], errorMessage: null });
    mockUseProjectSites.mockReturnValue({
      status: 'success',
      scope: scopeFromYear(2026),
      entries: [createEntry({ id: 1, projectName: 'Sole Project', projectNumber: '', year: 2026 })],
      errorMessage: null,
    });

    render(<ProjectSitesRoot />);
    const grid = screen.getByRole('list');
    expect(grid).toHaveAttribute('data-project-sites-grid-sparse', 'featured');
  });

  it('applies the cluster sparse grid variant for two wide-mode results', () => {
    mockUseAvailableYears.mockReturnValue({ status: 'success', years: [2026], errorMessage: null });
    mockUseProjectSites.mockReturnValue({
      status: 'success',
      scope: scopeFromYear(2026),
      entries: [
        createEntry({ id: 1, projectName: 'Alpha', projectNumber: '', year: 2026 }),
        createEntry({ id: 2, projectName: 'Beta', projectNumber: '', year: 2026 }),
      ],
      errorMessage: null,
    });

    render(<ProjectSitesRoot />);
    const grid = screen.getByRole('list');
    expect(grid).toHaveAttribute('data-project-sites-grid-sparse', 'cluster');
  });

  it('uses the dense grid variant when three or more results are visible', () => {
    mockUseAvailableYears.mockReturnValue({ status: 'success', years: [2026], errorMessage: null });
    mockUseProjectSites.mockReturnValue({
      status: 'success',
      scope: scopeFromYear(2026),
      entries: [
        createEntry({ id: 1, projectName: 'One', projectNumber: '', year: 2026 }),
        createEntry({ id: 2, projectName: 'Two', projectNumber: '', year: 2026 }),
        createEntry({ id: 3, projectName: 'Three', projectNumber: '', year: 2026 }),
      ],
      errorMessage: null,
    });

    render(<ProjectSitesRoot />);
    const grid = screen.getByRole('list');
    expect(grid).toHaveAttribute('data-project-sites-grid-sparse', 'dense');
  });

  it('uses the bounded sparse grid variant in compact mode so single-column stacking is preserved', () => {
    mockUseProjectSitesContainerState.mockReturnValue({
      width: 700,
      height: 900,
      mode: 'compact',
      displayClass: 'phone',
      heightClass: 'standard',
      isShortHeight: false,
    });
    mockUseAvailableYears.mockReturnValue({ status: 'success', years: [2026], errorMessage: null });
    mockUseProjectSites.mockReturnValue({
      status: 'success',
      scope: scopeFromYear(2026),
      entries: [createEntry({ id: 1, projectName: 'Sole Compact', projectNumber: '', year: 2026 })],
      errorMessage: null,
    });

    render(<ProjectSitesRoot />);
    const grid = screen.getByRole('list');
    expect(grid).toHaveAttribute('data-project-sites-grid-sparse', 'bounded');
  });

  it('keeps wide mode control band inline without a medium secondary lane', () => {
    mockUseAvailableYears.mockReturnValue({ status: 'success', years: [2026], errorMessage: null });
    mockUseProjectSites.mockReturnValue({
      status: 'success',
      scope: scopeFromYear(2026),
      entries: [createEntry({ id: 1, projectName: 'Wide Test', projectNumber: '', year: 2026 })],
      errorMessage: null,
    });

    const { container } = render(<ProjectSitesRoot />);

    expect(
      container.querySelector('[data-project-sites-secondary-lane]'),
    ).toBeNull();
    expect(screen.getByRole('search')).toHaveAttribute(
      'data-project-sites-control-layout',
      'wide',
    );
  });

  it('renders compact scope selector instead of segmented control in compact mode', () => {
    mockUseProjectSitesContainerState.mockReturnValue({
      width: 700,
      height: 900,
      mode: 'compact',
      displayClass: 'phone',
      heightClass: 'standard',
      isShortHeight: false,
    });
    mockUseAvailableYears.mockReturnValue({ status: 'success', years: [2026, 2025], errorMessage: null });
    mockUseProjectSites.mockReturnValue({
      status: 'success',
      scope: scopeFromYear(2026),
      entries: [createEntry({ id: 1, projectName: 'Test', projectNumber: '', year: 2026 })],
      errorMessage: null,
    });

    render(<ProjectSitesRoot />);

    expect(screen.queryByRole('radiogroup', { name: 'Scope' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Scope (compact)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search by name/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Sort project sites')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
  });

  it('suppresses the eyebrow and scope-source pill in compact mode to reduce first-screen overhead', () => {
    mockUseProjectSitesContainerState.mockReturnValue({
      width: 700,
      height: 900,
      mode: 'compact',
      displayClass: 'phone',
      heightClass: 'standard',
      isShortHeight: false,
    });
    mockUseAvailableYears.mockReturnValue({ status: 'success', years: [2026], errorMessage: null });
    mockUseProjectSites.mockReturnValue({
      status: 'success',
      scope: scopeFromYear(2026),
      entries: [createEntry({ id: 1, projectName: 'Compact', projectNumber: '', year: 2026 })],
      errorMessage: null,
    });

    render(<ProjectSitesRoot />);

    // Title still present.
    expect(screen.getByText('Project Sites')).toBeInTheDocument();
    // Eyebrow suppressed in compact.
    expect(screen.queryByText('HB Central · Projects')).not.toBeInTheDocument();
    // Scope-source pill is suppressed on compact (the scope select
    // already communicates the scope).
    expect(screen.queryByText(/scope source:/i)).not.toBeInTheDocument();
  });

  it('keeps the scope-source pill visible on wide mode', () => {
    mockUseAvailableYears.mockReturnValue({ status: 'success', years: [2026], errorMessage: null });
    mockUseProjectSites.mockReturnValue({
      status: 'success',
      scope: scopeFromYear(2026),
      entries: [createEntry({ id: 1, projectName: 'Wide', projectNumber: '', year: 2026 })],
      errorMessage: null,
    });

    render(<ProjectSitesRoot />);

    // Eyebrow + scope-source pill still present in wide mode.
    expect(screen.getByText('HB Central · Projects')).toBeInTheDocument();
    expect(screen.getByText(/scope source:/i)).toBeInTheDocument();
  });

  it('renders a progressive-disclosure filter summary (not inline chips) in compact mode', () => {
    mockUseProjectSitesContainerState.mockReturnValue({
      width: 700,
      height: 900,
      mode: 'compact',
      displayClass: 'phone',
      heightClass: 'standard',
      isShortHeight: false,
    });
    mockUseAvailableYears.mockReturnValue({ status: 'success', years: [2025], errorMessage: null });
    mockUseProjectSites.mockReturnValue({
      status: 'success',
      scope: scopeFromYear(2025),
      entries: [
        createEntry({ id: 1, projectName: 'Active Project', projectStage: 'Active' }),
        createEntry({ id: 2, projectName: 'Pursuit Project', projectStage: 'Pursuit' }),
      ],
      errorMessage: null,
    });

    render(<ProjectSitesRoot />);

    // Activate a stage filter
    fireEvent.click(screen.getByRole('button', { name: /filters/i }));
    const activeCheckboxes = screen.getAllByLabelText('Active');
    const checkbox = activeCheckboxes.find(
      (el) => (el as HTMLInputElement).type === 'checkbox',
    ) as HTMLInputElement;
    fireEvent.click(checkbox);

    // Compact summary replaces the inline chip row in the initial entry
    // state. The chip itself is not rendered until the user expands.
    expect(
      screen.getByText(/1 filter active/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /remove stage filter active/i }),
    ).not.toBeInTheDocument();

    // Expand the summary and the remove-chip affordance becomes reachable.
    const toggle = screen.getByRole('button', { name: /^show$/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('button', { name: /remove stage filter active/i }),
    ).toBeInTheDocument();
  });

  it('marks short-height state and uses compact controls under width pressure override', () => {
    mockUseProjectSitesContainerState.mockReturnValue({
      width: 1320,
      height: 540,
      mode: 'compact',
      displayClass: 'desktop',
      heightClass: 'short',
      isShortHeight: true,
    });
    mockUseAvailableYears.mockReturnValue({ status: 'success', years: [2026], errorMessage: null });
    mockUseProjectSites.mockReturnValue({
      status: 'success',
      scope: scopeFromYear(2026),
      entries: [createEntry({ id: 1, projectName: 'Short Height', projectNumber: '', year: 2026 })],
      errorMessage: null,
    });

    render(<ProjectSitesRoot />);
    expect(screen.getByLabelText('Scope (compact)')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Project Sites' })).toHaveAttribute(
      'data-project-sites-short-height',
      'true',
    );
  });

  it('initializes scope from valid yearOverride and shows source-of-truth messaging', async () => {
    mockUseAvailableYears.mockReturnValue({ status: 'success', years: [2025, 2024], errorMessage: null });
    mockUseProjectSites.mockImplementation((scope) => {
      if (!scope) return null;
      return {
        status: 'success',
        scope,
        entries: [createEntry({ id: 1, year: scope.kind === 'year' ? scope.year : 2025 })],
        errorMessage: null,
      };
    });

    render(
      <ProjectSitesRoot
        runtimeContext={normalizeProjectSitesRuntimeConfig({
          webPartProperties: { yearOverride: 2026 },
          hostPageYear: 2025,
        })}
      />,
    );

    await waitFor(() => {
      expect(mockUseProjectSites).toHaveBeenLastCalledWith(scopeFromYear(2026));
    });
    expect(screen.getByText(/scope source: author override/i)).toBeInTheDocument();
  });

  it('falls back to host page year when override is invalid', async () => {
    mockUseAvailableYears.mockReturnValue({ status: 'success', years: [2025, 2024], errorMessage: null });
    mockUseProjectSites.mockImplementation((scope) => {
      if (!scope) return null;
      return {
        status: 'success',
        scope,
        entries: [createEntry({ id: 1, year: scope.kind === 'year' ? scope.year : 2025 })],
        errorMessage: null,
      };
    });

    render(
      <ProjectSitesRoot
        runtimeContext={normalizeProjectSitesRuntimeConfig({
          webPartProperties: { yearOverride: 'invalid' },
          hostPageYear: 2024,
        })}
      />,
    );

    await waitFor(() => {
      expect(mockUseProjectSites).toHaveBeenLastCalledWith(scopeFromYear(2024));
    });
    expect(screen.getByText(/scope source: host page year context/i)).toBeInTheDocument();
  });

  it('uses default-year fallback and switches source to user-selected after scope change', () => {
    mockUseAvailableYears.mockReturnValue({ status: 'success', years: [2025, 2024], errorMessage: null });
    mockUseProjectSites.mockImplementation((scope) => {
      if (!scope) return null;
      return {
        status: 'success',
        scope,
        entries: [createEntry({ id: 1, year: scope.kind === 'year' ? scope.year : 2025 })],
        errorMessage: null,
      };
    });

    render(
      <ProjectSitesRoot
        runtimeContext={normalizeProjectSitesRuntimeConfig({})}
      />,
    );

    expect(screen.getByText(/scope source: default year fallback/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText('All Projects'));
    expect(screen.getByText(/scope source: user-selected/i)).toBeInTheDocument();
  });

  it('renders project cards on success', () => {
    mockUseAvailableYears.mockReturnValue({ status: 'success', years: [2025], errorMessage: null });
    mockUseProjectSites.mockReturnValue({
      status: 'success',
      scope: scopeFromYear(2025),
      entries: [
        createEntry({ id: 1, projectName: 'Alpha Project', projectNumber: '25-001-01', year: 2025, projectStage: 'Active' }),
        createEntry({ id: 2, projectName: 'Beta Project', projectNumber: '25-002-01', year: 2025 }),
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
      status: 'empty',
      scope: scopeFromYear(2025),
      entries: [],
      errorMessage: null,
    });

    render(<ProjectSitesRoot />);
    expect(screen.getByText('No Project Sites')).toBeInTheDocument();
    expect(screen.getByText(/No projects matched the current scope/i)).toBeInTheDocument();
  });

  it('renders error with role="alert" when project query fails', () => {
    mockUseAvailableYears.mockReturnValue({ status: 'success', years: [2025], errorMessage: null });
    mockUseProjectSites.mockReturnValue({
      status: 'error',
      scope: scopeFromYear(2025),
      entries: [],
      errorMessage: 'SP error',
    });

    render(<ProjectSitesRoot />);
    expect(screen.getByText('Unable to Load Project Sites')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders section landmark with accessible label', () => {
    mockUseAvailableYears.mockReturnValue({ status: 'success', years: [2025], errorMessage: null });
    mockUseProjectSites.mockReturnValue({
      status: 'success',
      scope: scopeFromYear(2025),
      entries: [createEntry({ id: 1, projectName: 'Test', projectNumber: '', year: 2025 })],
      errorMessage: null,
    });

    render(<ProjectSitesRoot />);
    expect(screen.getByRole('region', { name: 'Project Sites' })).toBeInTheDocument();
  });

  it('shows truthful context summary and partial-data messaging', () => {
    mockUseAvailableYears.mockReturnValue({ status: 'success', years: [2025], errorMessage: null });
    mockUseProjectSites.mockReturnValue({
      status: 'success',
      scope: scopeFromYear(2025),
      entries: [
        createEntry({
          id: 1,
          launchStatus: {
            state: 'attention-needed',
            reasonCode: 'critical-data-issue',
            isLaunchable: false,
            userMessage: 'Record needs data correction before launch confidence can be established.',
          },
        }),
        createEntry({
          id: 2,
          launchStatus: {
            state: 'provisioning',
            reasonCode: 'site-not-provisioned',
            isLaunchable: false,
            userMessage: 'Site has not been provisioned yet.',
          },
          hasSiteUrl: false,
          siteUrl: '',
        }),
      ],
      errorMessage: null,
    });

    render(
      <ProjectSitesRoot
        runtimeContext={normalizeProjectSitesRuntimeConfig({})}
      />,
    );

    expect(screen.getByText(/No authoritative year context was provided/i)).toBeInTheDocument();
    expect(screen.getByText(/1 record needs data correction/i)).toBeInTheDocument();
    expect(screen.getByText(/1 record is not yet launchable because sites are still provisioning/i)).toBeInTheDocument();
  });

  // ── W01r-P12: search / filter / sort ─────────────────────────────────

  it('filters entries by search term (debounced)', async () => {
    mockUseAvailableYears.mockReturnValue({ status: 'success', years: [2025], errorMessage: null });
    mockUseProjectSites.mockReturnValue({
      status: 'success',
      scope: scopeFromYear(2025),
      entries: [
        createEntry({ id: 1, projectName: 'Alpha Healthcare', projectNumber: '25-001-01', clientName: 'HCA' }),
        createEntry({ id: 2, projectName: 'Beta Commercial', projectNumber: '25-002-01', clientName: 'Regions' }),
      ],
      errorMessage: null,
    });

    render(<ProjectSitesRoot />);
    expect(screen.getByText('Alpha Healthcare')).toBeInTheDocument();
    expect(screen.getByText('Beta Commercial')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/search by name/i);
    fireEvent.change(searchInput, { target: { value: 'healthcare' } });

    await waitFor(
      () => {
        expect(screen.queryByText('Beta Commercial')).not.toBeInTheDocument();
      },
      { timeout: 1000 },
    );
    expect(screen.getByText('Alpha Healthcare')).toBeInTheDocument();
    expect(screen.getByText(/1 of 2 shown/i)).toBeInTheDocument();
  });

  it('shows a no-results empty state when search matches nothing', async () => {
    mockUseAvailableYears.mockReturnValue({ status: 'success', years: [2025], errorMessage: null });
    mockUseProjectSites.mockReturnValue({
      status: 'success',
      scope: scopeFromYear(2025),
      entries: [
        createEntry({ id: 1, projectName: 'Alpha', projectNumber: '25-001-01' }),
      ],
      errorMessage: null,
    });

    render(<ProjectSitesRoot />);
    const searchInput = screen.getByPlaceholderText(/search by name/i);
    fireEvent.change(searchInput, { target: { value: 'zzz-nomatch' } });

    await waitFor(
      () => {
        expect(screen.getByText('No matching projects')).toBeInTheDocument();
      },
      { timeout: 1000 },
    );
  });

  it('sorts entries by the selected sort key', () => {
    mockUseAvailableYears.mockReturnValue({ status: 'success', years: [2025], errorMessage: null });
    mockUseProjectSites.mockReturnValue({
      status: 'success',
      scope: scopeFromYear(2025),
      entries: [
        createEntry({ id: 1, projectName: 'Zulu', projectNumber: '25-999-01' }),
        createEntry({ id: 2, projectName: 'Alpha', projectNumber: '25-001-01' }),
      ],
      errorMessage: null,
    });

    render(<ProjectSitesRoot />);
    // Default sort is number-asc: 25-001-01 comes before 25-999-01
    const linksBefore = screen.getAllByRole('link');
    expect(linksBefore[0]).toHaveAttribute('aria-label', expect.stringContaining('Alpha'));

    const sortSelect = screen.getByLabelText('Sort project sites');
    fireEvent.change(sortSelect, { target: { value: 'name-desc' } });

    const linksAfter = screen.getAllByRole('link');
    expect(linksAfter[0]).toHaveAttribute('aria-label', expect.stringContaining('Zulu'));
  });

  it('keeps the grid subtree mounted when sort changes', () => {
    mockUseAvailableYears.mockReturnValue({ status: 'success', years: [2025], errorMessage: null });
    mockUseProjectSites.mockReturnValue({
      status: 'success',
      scope: scopeFromYear(2025),
      entries: [
        createEntry({ id: 1, projectName: 'Zulu', projectNumber: '25-999-01' }),
        createEntry({ id: 2, projectName: 'Alpha', projectNumber: '25-001-01' }),
      ],
      errorMessage: null,
    });

    render(<ProjectSitesRoot />);
    const gridBefore = screen.getByRole('list', { name: /project site/i });

    fireEvent.change(screen.getByLabelText('Sort project sites'), {
      target: { value: 'name-desc' },
    });

    const gridAfter = screen.getByRole('list', { name: /project site/i });
    expect(gridAfter).toBe(gridBefore);
  });

  it('opens the filter panel and filters by project stage', () => {
    mockUseAvailableYears.mockReturnValue({ status: 'success', years: [2025], errorMessage: null });
    mockUseProjectSites.mockReturnValue({
      status: 'success',
      scope: scopeFromYear(2025),
      entries: [
        createEntry({ id: 1, projectName: 'Active Project', projectStage: 'Active' }),
        createEntry({ id: 2, projectName: 'Pursuit Project', projectStage: 'Pursuit' }),
      ],
      errorMessage: null,
    });

    render(<ProjectSitesRoot />);

    const filtersButton = screen.getByRole('button', { name: /filters/i });
    fireEvent.click(filtersButton);

    // Find the Active stage checkbox and check it
    const activeCheckboxes = screen.getAllByLabelText('Active');
    const checkbox = activeCheckboxes.find(
      (el) => (el as HTMLInputElement).type === 'checkbox',
    ) as HTMLInputElement;
    fireEvent.click(checkbox);

    // Now only Active Project should be in the grid
    expect(screen.getByText('Active Project')).toBeInTheDocument();
    expect(screen.queryByText('Pursuit Project')).not.toBeInTheDocument();

    // Active filter chip should be present
    expect(screen.getByText(/stage:/i)).toBeInTheDocument();
  });

  it('removes a filter via the chip ✕ button', () => {
    mockUseAvailableYears.mockReturnValue({ status: 'success', years: [2025], errorMessage: null });
    mockUseProjectSites.mockReturnValue({
      status: 'success',
      scope: scopeFromYear(2025),
      entries: [
        createEntry({ id: 1, projectName: 'Active Project', projectStage: 'Active' }),
        createEntry({ id: 2, projectName: 'Pursuit Project', projectStage: 'Pursuit' }),
      ],
      errorMessage: null,
    });

    render(<ProjectSitesRoot />);
    fireEvent.click(screen.getByRole('button', { name: /filters/i }));
    const activeCheckboxes = screen.getAllByLabelText('Active');
    const checkbox = activeCheckboxes.find(
      (el) => (el as HTMLInputElement).type === 'checkbox',
    ) as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(screen.queryByText('Pursuit Project')).not.toBeInTheDocument();

    // Click the remove chip button
    const removeChipBtn = screen.getByRole('button', { name: /remove stage filter active/i });
    fireEvent.click(removeChipBtn);

    // Both projects should be visible again
    expect(screen.getByText('Active Project')).toBeInTheDocument();
    expect(screen.getByText('Pursuit Project')).toBeInTheDocument();
  });

  it('uses authoritative people labels for facets and chips when resolved', () => {
    mockUseProjectSitesPeopleDisplayLabels.mockReturnValue({
      'jane.doe@contoso.com': 'Jane Doe',
    });
    mockUseAvailableYears.mockReturnValue({ status: 'success', years: [2025], errorMessage: null });
    mockUseProjectSites.mockReturnValue({
      status: 'success',
      scope: scopeFromYear(2025),
      entries: [
        createEntry({
          id: 1,
          projectName: 'People Project',
          projectManagerUpn: 'jane.doe@contoso.com',
        }),
      ],
      errorMessage: null,
    });

    render(<ProjectSitesRoot />);
    fireEvent.click(screen.getByRole('button', { name: /filters/i }));
    const peopleOptions = screen.getAllByLabelText('Jane Doe');
    const checkbox = peopleOptions.find((el) => (el as HTMLInputElement).type === 'checkbox') as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(screen.getAllByText('Jane Doe').length).toBeGreaterThan(0);
  });

  it('falls back to heuristic people labels when authoritative mapping is unavailable', () => {
    mockUseProjectSitesPeopleDisplayLabels.mockReturnValue({});
    mockUseAvailableYears.mockReturnValue({ status: 'success', years: [2025], errorMessage: null });
    mockUseProjectSites.mockReturnValue({
      status: 'success',
      scope: scopeFromYear(2025),
      entries: [
        createEntry({
          id: 1,
          projectName: 'Fallback Project',
          projectManagerUpn: 'john_smith@contoso.com',
        }),
      ],
      errorMessage: null,
    });

    render(<ProjectSitesRoot />);
    fireEvent.click(screen.getByRole('button', { name: /filters/i }));
    expect(screen.getByLabelText('John Smith')).toBeInTheDocument();
  });

  it('clears search, sort, and filters when Reset is clicked', async () => {
    mockUseAvailableYears.mockReturnValue({ status: 'success', years: [2025], errorMessage: null });
    mockUseProjectSites.mockReturnValue({
      status: 'success',
      scope: scopeFromYear(2025),
      entries: [
        createEntry({ id: 1, projectName: 'Alpha', projectNumber: '25-001-01' }),
        createEntry({ id: 2, projectName: 'Bravo', projectNumber: '25-002-01' }),
      ],
      errorMessage: null,
    });

    render(<ProjectSitesRoot />);
    fireEvent.change(screen.getByPlaceholderText(/search by name/i), {
      target: { value: 'alpha' },
    });

    await waitFor(() => {
      expect(screen.queryByText('Bravo')).not.toBeInTheDocument();
    }, { timeout: 1000 });

    fireEvent.click(screen.getByRole('button', { name: /reset/i }));

    // The debounced search value takes ~200ms to clear after Reset; wait for it.
    await waitFor(() => {
      expect(screen.getByText('Bravo')).toBeInTheDocument();
    }, { timeout: 1000 });
    expect(screen.getByText('Alpha')).toBeInTheDocument();
  });

  it('renders All Projects across multiple years when the All scope is selected', () => {
    mockUseAvailableYears.mockReturnValue({ status: 'success', years: [2026, 2025], errorMessage: null });
    mockUseProjectSites.mockReturnValue({
      status: 'success',
      scope: SCOPE_ALL,
      entries: [
        createEntry({ id: 1, projectName: 'Project 2026', year: 2026, projectNumber: '26-001-01' }),
        createEntry({ id: 2, projectName: 'Project 2025', year: 2025, projectNumber: '25-001-01' }),
      ],
      errorMessage: null,
    });

    render(<ProjectSitesRoot />);
    expect(screen.getByText('Project 2026')).toBeInTheDocument();
    expect(screen.getByText('Project 2025')).toBeInTheDocument();
    expect(screen.getByText('2 projects')).toBeInTheDocument();
  });

  it('keeps the grid subtree mounted when scope changes', async () => {
    mockUseAvailableYears.mockReturnValue({ status: 'success', years: [2026, 2025], errorMessage: null });
    mockUseProjectSites.mockImplementation((scope) => {
      if (!scope) return null;
      if (scope.kind === 'all') {
        return {
          status: 'success',
          scope,
          entries: [
            createEntry({ id: 1, projectName: 'Project 2026', year: 2026, projectNumber: '26-001-01' }),
            createEntry({ id: 2, projectName: 'Project 2025', year: 2025, projectNumber: '25-001-01' }),
          ],
          errorMessage: null,
        };
      }
      return {
        status: 'success',
        scope,
        entries: [createEntry({ id: 1, projectName: 'Project 2026', year: 2026, projectNumber: '26-001-01' })],
        errorMessage: null,
      };
    });

    render(
      <ProjectSitesRoot
        runtimeContext={normalizeProjectSitesRuntimeConfig({
          webPartProperties: { yearOverride: 2026 },
        })}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Project 2026')).toBeInTheDocument();
    });
    const gridBefore = screen.getByRole('list', { name: /project site/i });

    fireEvent.click(screen.getByText('All Projects'));

    await waitFor(() => {
      expect(screen.getByText('Project 2025')).toBeInTheDocument();
    });
    const gridAfter = screen.getByRole('list', { name: /project site/i });
    expect(gridAfter).toBe(gridBefore);
  });
});
