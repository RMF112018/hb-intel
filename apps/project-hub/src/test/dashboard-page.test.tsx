import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { HbcThemeProvider } from '@hbc/ui-kit';

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('@hbc/shell', () => ({
  useProjectStore: (selector: (state: {
    activeProject: {
      id: string;
      name: string;
      number: string;
      status: string;
      startDate: string;
      endDate: string;
    };
    availableProjects: [];
  }) => unknown) =>
    selector({
      activeProject: {
        id: 'PRJ-001',
        name: 'Harbor View Medical Center',
        number: 'HV-2025-001',
        status: 'Active',
        startDate: '2025-01-15',
        endDate: '2027-06-30',
      },
      availableProjects: [],
    }),
  useNavStore: (selector: (state: { activeWorkspace: null }) => unknown) =>
    selector({ activeWorkspace: null }),
}));

vi.mock('@hbc/auth', () => ({
  useCurrentUser: () => ({
    id: 'user-001',
    type: 'internal',
    roles: [{ id: 'project-manager', name: 'Project Manager' }],
  }),
  usePermissionStore: (selector: (state: { permissions: string[] }) => unknown) =>
    selector({ permissions: ['project:read', 'project:write', 'accounting:read'] }),
}));

vi.mock('@hbc/complexity', () => ({
  useComplexity: () => ({ tier: 'standard' }),
}));

vi.mock('@hbc/project-canvas', () => ({
  createSpfxCanvasStorageAdapter: () => ({
    getConfig: async () => null,
    saveConfig: async () => undefined,
    resetConfig: async () => undefined,
  }),
  HbcProjectCanvas: () => <div data-testid="project-home-canvas">Project canvas</div>,
  registerReferenceTiles: () => undefined,
  ROLE_DEFAULT_TILES: {
    'Project Manager': [],
  },
}));

vi.mock('../spfx/createProjectHubSpfxCanvasPersistence.js', () => ({
  createProjectHubSpfxCanvasPersistence: () => ({
    getConfig: async () => null,
    saveConfig: async () => undefined,
    resetConfig: async () => undefined,
  }),
}));

vi.mock('../spfx/ProjectHubRuntimeContext.js', () => ({
  useProjectHubRuntimeContext: () => ({
    spfxContext: {
      pageContext: {
        user: { loginName: 'project.manager@hb.com' },
        web: { absoluteUrl: 'https://tenant.sharepoint.com/sites/project-hub' },
      },
    },
    initState: {
      status: 'resolved',
      siteUrl: 'https://tenant.sharepoint.com/sites/project-hub',
      projectId: 'PRJ-001',
    },
  }),
}));

import { DashboardPage } from '../pages/DashboardPage.js';

describe('DashboardPage', () => {
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
  });

  it('renders the governed dashboard KPI strip and card/list companion surfaces', () => {
    const html = renderToString(
      <HbcThemeProvider>
        <DashboardPage />
      </HbcThemeProvider>,
    );

    expect(html).toContain('data-layout="dashboard"');
    expect(html).toContain('data-hbc-layout="dashboard"');
    expect(html).toContain('data-hbc-ui="kpi-card"');
    expect(html).toContain('data-hbc-density="standard"');
    expect(html).toContain('data-density-tier="comfortable"');
    expect(html).toContain('Active Project');
    expect(html).toContain('Canvas Persistence');
    expect(html).toContain('data-testid="project-hub-dashboard-escalation-hub"');
    expect(html).toContain('data-surface-type="card-list-view"');
  });
});
