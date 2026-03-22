import { describe, expect, it, vi } from 'vitest';
import {
  detectProjectIdentifierKind,
  normalizeProjectIdentifier,
} from './normalizeProjectIdentifier.js';
import type { IProjectRepository } from '../ports/IProjectRepository.js';
import type { IActiveProject } from '@hbc/models';

function createMockProject(overrides?: Partial<IActiveProject>): IActiveProject {
  return {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    name: 'Test Project',
    number: '26-001-01',
    status: 'Active',
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2027-12-31T00:00:00.000Z',
    ...overrides,
  };
}

function createMockRepository(projects: IActiveProject[]): IProjectRepository {
  return {
    getProjects: vi.fn(),
    getProjectById: vi.fn(async (id: string) =>
      projects.find((p) => p.id === id) ?? null,
    ),
    getProjectByNumber: vi.fn(async (number: string) =>
      projects.find((p) => p.number === number) ?? null,
    ),
    createProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
    getPortfolioSummary: vi.fn(),
  };
}

describe('detectProjectIdentifierKind', () => {
  it('identifies UUID as projectId', () => {
    expect(detectProjectIdentifierKind('a1b2c3d4-e5f6-7890-abcd-ef1234567890')).toBe('projectId');
  });

  it('identifies ##-###-## format as projectNumber', () => {
    expect(detectProjectIdentifierKind('26-001-01')).toBe('projectNumber');
  });

  it('defaults ambiguous input to projectId', () => {
    expect(detectProjectIdentifierKind('project-abc123')).toBe('projectId');
  });

  it('handles uppercase UUID', () => {
    expect(detectProjectIdentifierKind('A1B2C3D4-E5F6-7890-ABCD-EF1234567890')).toBe('projectId');
  });
});

describe('normalizeProjectIdentifier', () => {
  const project = createMockProject();

  it('resolves UUID directly as projectId with no redirect', async () => {
    const repo = createMockRepository([project]);
    const result = await normalizeProjectIdentifier(project.id, repo);

    expect(result).toEqual({
      projectId: project.id,
      redirectRequired: false,
    });
    expect(repo.getProjectById).toHaveBeenCalledWith(project.id);
  });

  it('resolves projectNumber via lookup with redirect required', async () => {
    const repo = createMockRepository([project]);
    const result = await normalizeProjectIdentifier('26-001-01', repo);

    expect(result).toEqual({
      projectId: project.id,
      redirectRequired: true,
    });
    expect(repo.getProjectByNumber).toHaveBeenCalledWith('26-001-01');
  });

  it('returns null for unknown UUID', async () => {
    const repo = createMockRepository([]);
    const result = await normalizeProjectIdentifier(
      'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
      repo,
    );

    expect(result).toBeNull();
  });

  it('returns null for unknown projectNumber', async () => {
    const repo = createMockRepository([]);
    const result = await normalizeProjectIdentifier('99-999-99', repo);

    expect(result).toBeNull();
  });

  it('returns null for empty string', async () => {
    const repo = createMockRepository([project]);
    const result = await normalizeProjectIdentifier('', repo);

    expect(result).toBeNull();
  });

  it('returns null for whitespace-only string', async () => {
    const repo = createMockRepository([project]);
    const result = await normalizeProjectIdentifier('   ', repo);

    expect(result).toBeNull();
  });

  it('trims whitespace from input', async () => {
    const repo = createMockRepository([project]);
    const result = await normalizeProjectIdentifier('  26-001-01  ', repo);

    expect(result).toEqual({
      projectId: project.id,
      redirectRequired: true,
    });
  });

  it('falls back to number lookup for ambiguous non-UUID identifiers', async () => {
    const oddProject = createMockProject({
      id: 'uuid-odd',
      number: 'PRJ-ABC',
    });
    const repo = createMockRepository([oddProject]);

    // 'PRJ-ABC' is not UUID and not ##-###-## → defaults to projectId kind
    // getProjectById('PRJ-ABC') fails → falls back to getProjectByNumber('PRJ-ABC')
    const result = await normalizeProjectIdentifier('PRJ-ABC', repo);

    expect(result).toEqual({
      projectId: 'uuid-odd',
      redirectRequired: true,
    });
  });
});
