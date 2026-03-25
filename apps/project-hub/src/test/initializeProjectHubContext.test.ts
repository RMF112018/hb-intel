import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createProjectRegistryService } from '@hbc/data-access';
import { useNavStore, useProjectStore } from '@hbc/shell';
import { initializeProjectHubContext } from '../spfx/initializeProjectHubContext.js';

vi.mock('@hbc/data-access', async () => {
  const actual = await vi.importActual('@hbc/data-access');
  return {
    ...actual,
    createProjectRegistryService: vi.fn(),
  };
});

const mockedCreateProjectRegistryService = vi.mocked(createProjectRegistryService);

const registryRecord = {
  projectId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  projectNumber: '26-001-01',
  siteUrl: 'https://tenant.sharepoint.com/sites/project-26-001-01',
  activatedAt: '2026-03-22T14:00:00.000Z',
  activatedByUpn: 'pm@example.com',
  sourceHandoffId: 'handoff-001',
  entraGroupSet: {
    leadersGroupId: 'leaders-001',
    teamGroupId: 'team-001',
    viewersGroupId: 'viewers-001',
  },
  projectName: 'Harbor View Medical Center',
  lifecycleStatus: 'Active',
  startDate: '2026-04-01T00:00:00.000Z',
  projectManagerUpn: 'pm@example.com',
  projectManagerName: 'Jane Smith',
  department: 'commercial',
  siteAssociations: [
    {
      siteUrl: 'https://tenant.sharepoint.com/sites/project-26-001-01',
      associationType: 'primary' as const,
      associatedAt: '2026-03-22T14:00:00.000Z',
      associatedByUpn: 'pm@example.com',
    },
  ],
};

describe('initializeProjectHubContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useProjectStore.getState().clear();
    useNavStore.getState().setActiveWorkspace(null);
  });

  it('resolves siteUrl to canonical project context and seeds the stores', async () => {
    mockedCreateProjectRegistryService.mockReturnValue({
      getBySiteUrl: vi.fn().mockResolvedValue(registryRecord),
    } as unknown as ReturnType<typeof createProjectRegistryService>);

    const result = await initializeProjectHubContext({
      spfxContext: {
        pageContext: {
          web: {
            absoluteUrl: registryRecord.siteUrl,
          },
        },
      },
    });

    expect(result).toEqual({
      status: 'resolved',
      siteUrl: registryRecord.siteUrl,
      projectId: registryRecord.projectId,
      projectName: registryRecord.projectName,
      projectNumber: registryRecord.projectNumber,
    });
    expect(useProjectStore.getState().activeProject?.id).toBe(registryRecord.projectId);
    expect(useProjectStore.getState().availableProjects).toHaveLength(1);
    expect(useNavStore.getState().activeWorkspace).toBe('project-hub');
  });

  it('returns not-found and clears stale project state when the site is not in the registry', async () => {
    useProjectStore.getState().setActiveProject({
      id: 'stale-project',
      name: 'Stale Project',
      number: '00-000-00',
      status: 'Active',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    });

    mockedCreateProjectRegistryService.mockReturnValue({
      getBySiteUrl: vi.fn().mockResolvedValue(null),
    } as unknown as ReturnType<typeof createProjectRegistryService>);

    const result = await initializeProjectHubContext({
      spfxContext: {
        pageContext: {
          web: {
            absoluteUrl: 'https://tenant.sharepoint.com/sites/unknown',
          },
        },
      },
    });

    expect(result.status).toBe('not-found');
    expect(useProjectStore.getState().activeProject).toBeNull();
    expect(useProjectStore.getState().availableProjects).toEqual([]);
  });

  it('returns error when the registry lookup throws', async () => {
    mockedCreateProjectRegistryService.mockReturnValue({
      getBySiteUrl: vi.fn().mockRejectedValue(new Error('Registry unavailable')),
    } as unknown as ReturnType<typeof createProjectRegistryService>);

    const result = await initializeProjectHubContext({
      spfxContext: {
        pageContext: {
          web: {
            absoluteUrl: registryRecord.siteUrl,
          },
        },
      },
    });

    expect(result).toEqual({
      status: 'error',
      siteUrl: registryRecord.siteUrl,
      message: 'Registry unavailable',
    });
    expect(useProjectStore.getState().activeProject).toBeNull();
  });
});
