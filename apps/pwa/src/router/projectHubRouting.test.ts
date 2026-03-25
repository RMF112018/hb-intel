import { describe, expect, it, vi } from 'vitest';
import type { IActiveProject } from '@hbc/models';
import type { IProjectRepository } from '@hbc/data-access';
import {
  buildProjectHubPath,
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
});

