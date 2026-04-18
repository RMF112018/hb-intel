import React from 'react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type {
  IAvailableYearsResult,
  IProjectSitesResult,
  IProjectSiteEntry,
  ProjectSitesScope,
} from './types.js';
import { scopeFromYear } from './types.js';
import type { ProjectSitesContainerState } from './projectSitesLayoutMode.js';
import type * as LayoutModeModule from './projectSitesLayoutMode.js';

const mockUseAvailableYears = vi.fn<() => IAvailableYearsResult>();
const mockUseProjectSites = vi.fn<(scope: ProjectSitesScope | null) => IProjectSitesResult | null>();
const mockUseProjectSitesContainerState = vi.fn<() => ProjectSitesContainerState>();
const mockUseProjectSitesPeopleDisplayLabels = vi.fn<() => Record<string, string>>();
const mockProjectSiteCardRender = vi.fn((props: { entry: IProjectSiteEntry }) => (
  <div data-testid={`card-${props.entry.id}`}>{props.entry.projectName}</div>
));

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

vi.mock('./components/ProjectSiteCard.js', () => ({
  ProjectSiteCard: (props: { entry: IProjectSiteEntry }) => mockProjectSiteCardRender(props),
}));

import { ProjectSitesRoot } from './ProjectSitesRoot.js';

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
    ...overrides,
  };
}

describe('ProjectSitesRoot rerender churn', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockUseAvailableYears.mockReset();
    mockUseProjectSites.mockReset();
    mockUseProjectSitesContainerState.mockReset();
    mockUseProjectSitesPeopleDisplayLabels.mockReset();
    mockProjectSiteCardRender.mockClear();

    mockUseProjectSitesContainerState.mockReturnValue({
      width: 1280,
      height: 900,
      mode: 'wide',
      displayClass: 'desktop',
      heightClass: 'standard',
      isShortHeight: false,
    });
    mockUseProjectSitesPeopleDisplayLabels.mockReturnValue({});

    mockUseAvailableYears.mockReturnValue({ status: 'success', years: [2025], errorMessage: null });
    mockUseProjectSites.mockReturnValue({
      status: 'success',
      scope: scopeFromYear(2025),
      entries: [
        createEntry({ id: 1, projectName: 'Alpha Project', projectNumber: '25-001-01' }),
        createEntry({ id: 2, projectName: 'Beta Project', projectNumber: '25-002-01' }),
      ],
      errorMessage: null,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not trigger avoidable full-card rerender before search debounce commits', () => {
    render(<ProjectSitesRoot />);

    expect(screen.getByTestId('card-1')).toBeInTheDocument();
    expect(screen.getByTestId('card-2')).toBeInTheDocument();

    const baselineCalls = mockProjectSiteCardRender.mock.calls.length;
    expect(baselineCalls).toBe(2);

    const searchInput = screen.getByPlaceholderText(/search by name/i);
    fireEvent.change(searchInput, { target: { value: 'a' } });
    fireEvent.change(searchInput, { target: { value: 'al' } });

    // Pre-debounce UI state should not force card rerenders.
    expect(mockProjectSiteCardRender.mock.calls.length).toBe(baselineCalls);
  });

  it('does not trigger avoidable full-card rerender when filter panel opens/closes', () => {
    render(<ProjectSitesRoot />);

    const baselineCalls = mockProjectSiteCardRender.mock.calls.length;
    expect(baselineCalls).toBe(2);

    const filtersButton = screen.getByRole('button', { name: /filters/i });
    fireEvent.click(filtersButton);
    fireEvent.click(filtersButton);

    expect(mockProjectSiteCardRender.mock.calls.length).toBe(baselineCalls);
  });
});
