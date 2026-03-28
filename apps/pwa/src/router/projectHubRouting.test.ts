import { describe, expect, it, vi } from 'vitest';
import type { IActiveProject } from '@hbc/models';
import type { IProjectRepository } from '@hbc/data-access';
import {
  buildProjectHubPath,
  buildFinancialToolPath,
  isSupportedProjectHubSection,
  isSupportedFinancialTool,
  FINANCIAL_TOOL_REGISTRY,
  PROJECT_HUB_SECTION_REGISTRY,
  resolveProjectHubProjectEntry,
  resolveProjectHubRootEntry,
  resolveProjectHubSwitchTarget,
  resolveFinancialToolEntry,
} from './projectHubRouting.js';

const PROJECTS: IActiveProject[] = [
  {
    id: 'proj-uuid-001',
    name: 'City Center Tower',
    number: 'PRJ-001',
    status: 'Active',
    startDate: '2026-01-01',
    endDate: '2028-06-30',
  },
  {
    id: 'proj-uuid-002',
    name: 'Harbor Bridge Renovation',
    number: 'PRJ-002',
    status: 'Active',
    startDate: '2026-03-01',
    endDate: '2027-12-31',
  },
];

function createRepo(projects: IActiveProject[]): IProjectRepository {
  return {
    getProjects: vi.fn(async () => ({ items: projects, total: projects.length, page: 1, pageSize: projects.length })),
    getProjectById: vi.fn(async (id: string) => projects.find((project) => project.id === id) ?? null),
    getProjectByNumber: vi.fn(async (number: string) => projects.find((project) => project.number === number) ?? null),
    createProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
    getPortfolioSummary: vi.fn(),
  } as unknown as IProjectRepository;
}

describe('projectHubRouting', () => {
  it('returns portfolio mode for multi-project root entry', async () => {
    const result = await resolveProjectHubRootEntry(createRepo(PROJECTS));

    expect(result.mode).toBe('portfolio');
  });

  it('redirects single-project root entry to the canonical project route', async () => {
    const result = await resolveProjectHubRootEntry(createRepo([PROJECTS[0]]));

    expect(result).toEqual({
      mode: 'redirect',
      projects: [PROJECTS[0]],
      redirectTo: buildProjectHubPath(PROJECTS[0].id),
    });
  });

  it('resolves explicit deep links by canonical project id', async () => {
    const result = await resolveProjectHubProjectEntry(
      'proj-uuid-001',
      null,
      createRepo(PROJECTS),
    );

    expect(result).toEqual({
      mode: 'project',
      projects: PROJECTS,
      project: PROJECTS[0],
      section: null,
    });
  });

  it('normalizes project-number deep links to the canonical project id route', async () => {
    const result = await resolveProjectHubProjectEntry('PRJ-001', null, createRepo(PROJECTS));

    expect(result).toEqual({
      mode: 'redirect',
      projects: PROJECTS,
      redirectTo: buildProjectHubPath('proj-uuid-001'),
    });
  });

  it('returns no-access for unknown project deep links', async () => {
    const result = await resolveProjectHubProjectEntry('unknown-project', null, createRepo(PROJECTS));

    expect(result).toEqual({
      mode: 'no-access',
      projects: PROJECTS,
      reason: 'project-not-found',
    });
  });

  it('falls back to the target control center for unsupported sections', async () => {
    const result = await resolveProjectHubProjectEntry(
      'proj-uuid-001',
      'unsupported',
      createRepo(PROJECTS),
    );

    expect(result).toEqual({
      mode: 'redirect',
      projects: PROJECTS,
      redirectTo: buildProjectHubPath('proj-uuid-001'),
    });
  });

  it('treats reports as a supported project-hub section', async () => {
    const result = await resolveProjectHubProjectEntry(
      'proj-uuid-001',
      'reports',
      createRepo(PROJECTS),
    );

    expect(result).toEqual({
      mode: 'project',
      projects: PROJECTS,
      project: PROJECTS[0],
      section: 'reports',
    });
  });

  it('switches to the same supported section when available', () => {
    expect(
      resolveProjectHubSwitchTarget({
        currentProjectId: 'proj-uuid-001',
        currentSection: 'health',
        targetProjectId: 'proj-uuid-002',
      }),
    ).toBe('/project-hub/proj-uuid-002/health');
  });

  it('falls back to the target control center when the current section is unsupported', () => {
    expect(
      resolveProjectHubSwitchTarget({
        currentProjectId: 'proj-uuid-001',
        currentSection: 'review',
        targetProjectId: 'proj-uuid-002',
      }),
    ).toBe('/project-hub/proj-uuid-002');
  });

  it('keeps the reports section during in-project switching', () => {
    expect(
      resolveProjectHubSwitchTarget({
        currentProjectId: 'proj-uuid-001',
        currentSection: 'reports',
        targetProjectId: 'proj-uuid-002',
      }),
    ).toBe('/project-hub/proj-uuid-002/reports');
  });

  // ── Section registry tests ──────────────────────────────────────────

  it('returns no-access for zero-projects root entry', async () => {
    const result = await resolveProjectHubRootEntry(createRepo([]));

    expect(result).toEqual({
      mode: 'no-access',
      projects: [],
      reason: 'zero-projects',
    });
  });

  it('resolves the financial section as a valid project-scoped route', async () => {
    const result = await resolveProjectHubProjectEntry(
      'proj-uuid-001',
      'financial',
      createRepo(PROJECTS),
    );

    expect(result).toEqual({
      mode: 'project',
      projects: PROJECTS,
      project: PROJECTS[0],
      section: 'financial',
    });
  });

  it('resolves the health section as a valid project-scoped route', async () => {
    const result = await resolveProjectHubProjectEntry(
      'proj-uuid-002',
      'health',
      createRepo(PROJECTS),
    );

    expect(result).toEqual({
      mode: 'project',
      projects: PROJECTS,
      project: PROJECTS[1],
      section: 'health',
    });
  });

  it('section registry contains all supported sections', () => {
    const slugs = PROJECT_HUB_SECTION_REGISTRY.map((entry) => entry.slug);
    expect(slugs).toContain('health');
    expect(slugs).toContain('reports');
    expect(slugs).toContain('financial');
    expect(slugs.length).toBe(3);
  });

  it('isSupportedProjectHubSection validates against the registry', () => {
    expect(isSupportedProjectHubSection('health')).toBe(true);
    expect(isSupportedProjectHubSection('reports')).toBe(true);
    expect(isSupportedProjectHubSection('financial')).toBe(true);
    expect(isSupportedProjectHubSection('schedule')).toBe(false);
    expect(isSupportedProjectHubSection(null)).toBe(true);
    expect(isSupportedProjectHubSection(undefined)).toBe(true);
  });

  it('buildProjectHubPath generates correct paths', () => {
    expect(buildProjectHubPath('proj-001')).toBe('/project-hub/proj-001');
    expect(buildProjectHubPath('proj-001', 'health')).toBe('/project-hub/proj-001/health');
    expect(buildProjectHubPath('proj-001', null)).toBe('/project-hub/proj-001');
  });

  it('returns no-access when project is not in accessible list', async () => {
    const singleProjectRepo = createRepo([PROJECTS[0]]);
    const result = await resolveProjectHubProjectEntry(
      'proj-uuid-002',
      null,
      singleProjectRepo,
    );

    // The normalization layer cannot resolve proj-uuid-002 in a repo that
    // only contains proj-uuid-001, so it returns project-not-found (the
    // normalization-level denial) rather than project-unavailable (the
    // access-list-level denial).
    expect(result.mode).toBe('no-access');
    expect(result).toHaveProperty('reason', 'project-not-found');
  });

  it('preserves the financial section during cross-project switching', () => {
    expect(
      resolveProjectHubSwitchTarget({
        currentProjectId: 'proj-uuid-001',
        currentSection: 'financial',
        targetProjectId: 'proj-uuid-002',
      }),
    ).toBe('/project-hub/proj-uuid-002/financial');
  });

  // ── Financial tool route tests (FIN-04 §1.1) ─────────────────────

  it('financial tool registry contains all canonical tool slugs', () => {
    const slugs = FINANCIAL_TOOL_REGISTRY.map((entry) => entry.slug);
    expect(slugs).toContain('budget');
    expect(slugs).toContain('forecast');
    expect(slugs).toContain('checklist');
    expect(slugs).toContain('gcgr');
    expect(slugs).toContain('cash-flow');
    expect(slugs).toContain('buyout');
    expect(slugs).toContain('review');
    expect(slugs).toContain('publication');
    expect(slugs).toContain('history');
    expect(slugs.length).toBe(9);
  });

  it('isSupportedFinancialTool validates against the tool registry', () => {
    expect(isSupportedFinancialTool('budget')).toBe(true);
    expect(isSupportedFinancialTool('forecast')).toBe(true);
    expect(isSupportedFinancialTool('gcgr')).toBe(true);
    expect(isSupportedFinancialTool('cash-flow')).toBe(true);
    expect(isSupportedFinancialTool('buyout')).toBe(true);
    expect(isSupportedFinancialTool('review')).toBe(true);
    expect(isSupportedFinancialTool('publication')).toBe(true);
    expect(isSupportedFinancialTool('history')).toBe(true);
    expect(isSupportedFinancialTool('checklist')).toBe(true);
    expect(isSupportedFinancialTool('unknown-tool')).toBe(false);
    expect(isSupportedFinancialTool(null)).toBe(true);
    expect(isSupportedFinancialTool(undefined)).toBe(true);
  });

  it('buildFinancialToolPath generates canonical tool routes', () => {
    expect(buildFinancialToolPath('proj-001', 'budget')).toBe(
      '/project-hub/proj-001/financial/budget',
    );
    expect(buildFinancialToolPath('proj-001', 'cash-flow')).toBe(
      '/project-hub/proj-001/financial/cash-flow',
    );
    expect(buildFinancialToolPath('proj-001', 'gcgr')).toBe(
      '/project-hub/proj-001/financial/gcgr',
    );
  });

  it('buildProjectHubPath supports the optional tool parameter', () => {
    expect(buildProjectHubPath('proj-001', 'financial', 'budget')).toBe(
      '/project-hub/proj-001/financial/budget',
    );
    expect(buildProjectHubPath('proj-001', 'financial', null)).toBe(
      '/project-hub/proj-001/financial',
    );
  });

  it('resolves a valid Financial tool entry', async () => {
    const result = await resolveFinancialToolEntry(
      'proj-uuid-001',
      'budget',
      createRepo(PROJECTS),
    );

    expect(result).toEqual({
      mode: 'tool',
      projects: PROJECTS,
      project: PROJECTS[0],
      tool: 'budget',
    });
  });

  it('redirects unsupported Financial tool slugs to Financial home', async () => {
    const result = await resolveFinancialToolEntry(
      'proj-uuid-001',
      'invalid-tool',
      createRepo(PROJECTS),
    );

    expect(result).toEqual({
      mode: 'redirect',
      projects: PROJECTS,
      redirectTo: '/project-hub/proj-uuid-001/financial',
    });
  });

  it('returns no-access for Financial tool with unknown project', async () => {
    const result = await resolveFinancialToolEntry(
      'unknown-project',
      'budget',
      createRepo(PROJECTS),
    );

    expect(result.mode).toBe('no-access');
  });

  it('preserves Financial tool during cross-project switching', () => {
    expect(
      resolveProjectHubSwitchTarget({
        currentProjectId: 'proj-uuid-001',
        currentSection: 'financial',
        currentTool: 'cash-flow',
        targetProjectId: 'proj-uuid-002',
      }),
    ).toBe('/project-hub/proj-uuid-002/financial/cash-flow');
  });

  it('falls back to Financial home when tool is not supported during switch', () => {
    expect(
      resolveProjectHubSwitchTarget({
        currentProjectId: 'proj-uuid-001',
        currentSection: 'financial',
        currentTool: 'unsupported',
        targetProjectId: 'proj-uuid-002',
      }),
    ).toBe('/project-hub/proj-uuid-002/financial');
  });

  it('does not add tool when switching to non-financial section', () => {
    expect(
      resolveProjectHubSwitchTarget({
        currentProjectId: 'proj-uuid-001',
        currentSection: 'health',
        currentTool: 'budget',
        targetProjectId: 'proj-uuid-002',
      }),
    ).toBe('/project-hub/proj-uuid-002/health');
  });
});
