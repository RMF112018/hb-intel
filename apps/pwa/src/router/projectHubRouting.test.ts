import { describe, expect, it, vi } from 'vitest';
import type { IActiveProject } from '@hbc/models';
import type { IProjectRepository } from '@hbc/data-access';
import {
  buildProjectHubPath,
  isSupportedProjectHubSection,
  PROJECT_HUB_SECTION_REGISTRY,
  resolveProjectHubProjectEntry,
  resolveProjectHubRootEntry,
  resolveProjectHubSwitchTarget,
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
});
