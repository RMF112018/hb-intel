import { describe, expect, it, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { useProjectStore } from '@hbc/shell';
import { HbcThemeProvider } from '@hbc/ui-kit';
import {
  PROJECT_HUB_SPFX_MODULE_MAP,
  ProjectHubSpfxLaneSurface,
} from '@hbc/features-project-hub';
import {
  ReportsReviewEscalationSurface,
  ProjectModulePage,
} from '../pages/ProjectModulePage.js';
import { buildProjectModuleLaunchUrl } from '../spfx/buildProjectHubEscalationUrl.js';

interface ProjectHubWindow extends Window {
  _hbIntelPwaBaseUrl?: string;
}

describe('ProjectModulePage', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: () => ({
        matches: false,
        media: '',
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
      }),
    });

    useProjectStore.setState({
      activeProject: {
        id: 'PRJ-001',
        name: 'Harbor View Medical Center',
        number: 'HV-2025-001',
        status: 'Active',
        startDate: '2025-01-15',
        endDate: '2027-06-30',
      },
      availableProjects: [],
    });
  });

  it('renders a governed broad SPFx surface for financial', () => {
    const html = renderToString(
      <HbcThemeProvider>
        <ProjectHubSpfxLaneSurface
          definition={PROJECT_HUB_SPFX_MODULE_MAP.financial}
          projectName="Harbor View Medical Center"
          projectNumber="HV-2025-001"
        />
      </HbcThemeProvider>,
    );

    expect(html).toContain('Operational financial-control surface for confirmed versions, working forecasts, reconciliation, and buyout tracking.');
    expect(html).toContain('Available in this SPFx lane');
    expect(html).toContain('data-surface-type="card-list-view"');
    expect(html).toContain('data-density-tier="comfortable"');
    expect(html).toContain('Open buyout disposition workflow');
  });

  it('wraps governed module routes in the configured WorkspacePageShell layout', () => {
    useProjectStore.setState({
      activeProject: {
        id: 'PRJ-001',
        name: 'Harbor View Medical Center',
        number: 'HV-2025-001',
        status: 'Active',
        startDate: '2025-01-15',
        endDate: '2027-06-30',
      },
      availableProjects: [],
    });

    const html = renderToString(
      <HbcThemeProvider>
        <ProjectModulePage moduleSlug="financial" />
      </HbcThemeProvider>,
    );

    expect(html).toContain('data-layout="dashboard"');
    expect(html).toContain('data-hbc-density="standard"');
    expect(html).toContain('Financial');
    expect(html).not.toContain('data-layout="detail"');
  });

  it('builds schedule PWA escalation links with canonical project context', () => {
    Object.defineProperty(window as ProjectHubWindow, '_hbIntelPwaBaseUrl', {
      configurable: true,
      writable: true,
      value: 'https://hb-intel.example.com',
    });

    const url = buildProjectModuleLaunchUrl(
      'PRJ-001',
      PROJECT_HUB_SPFX_MODULE_MAP.schedule.pwaEscalations[0],
      { returnTo: '/sites/project-hub/schedule' },
    );

    expect(url).toContain('https://hb-intel.example.com/project-hub/PRJ-001/schedule?action=import');
    expect(url).toContain('source=spfx');
    expect(url).toContain('returnTo=');
  });

  it('renders the Stage 10.3 reports and executive-review escalation surface', () => {
    const html = renderToString(
      <HbcThemeProvider>
        <ReportsReviewEscalationSurface projectId="PRJ-001" />
      </HbcThemeProvider>,
    );

    expect(html).toContain('Reports and executive-review depth');
    expect(html).toContain('data-density-tier="comfortable"');
    expect(html).toContain('Resume advanced draft recovery');
    expect(html).toContain('Manage selected review thread');
  });

  it('keeps invalid module or unresolved project states inside WorkspacePageShell', () => {
    useProjectStore.setState({
      activeProject: null,
      availableProjects: [],
    });

    const html = renderToString(
      <HbcThemeProvider>
        <ProjectModulePage moduleSlug="financial" />
      </HbcThemeProvider>,
    );

    expect(html).toContain('data-layout="dashboard"');
    expect(html).toContain('data-hbc-density="standard"');
    expect(html).toContain('Module surface unavailable');
  });
});
