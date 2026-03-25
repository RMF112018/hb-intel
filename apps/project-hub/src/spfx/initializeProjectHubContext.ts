import { createProjectRegistryService } from '@hbc/data-access';
import { toActiveProject } from '@hbc/models';
import { resolveSpfxProjectContext, useNavStore, useProjectStore } from '@hbc/shell';

interface SpfxPageContextLike {
  pageContext?: {
    web?: {
      absoluteUrl?: string;
      url?: string;
    };
  };
}

export type ProjectHubSpfxInitState =
  | {
      status: 'resolved';
      siteUrl: string;
      projectId: string;
      projectName: string;
      projectNumber: string;
    }
  | {
      status: 'not-found';
      siteUrl: string;
      message: string;
    }
  | {
      status: 'error';
      siteUrl: string;
      message: string;
    };

function clearProjectHubContext(): void {
  useProjectStore.getState().clear();
  useNavStore.getState().setActiveWorkspace('project-hub');
}

function getSiteUrl(spfxContext?: SpfxPageContextLike): string {
  return spfxContext?.pageContext?.web?.absoluteUrl ?? spfxContext?.pageContext?.web?.url ?? '';
}

export async function initializeProjectHubContext(params: {
  spfxContext?: SpfxPageContextLike;
}): Promise<ProjectHubSpfxInitState> {
  const siteUrl = getSiteUrl(params.spfxContext).trim();

  if (!siteUrl) {
    clearProjectHubContext();
    return {
      status: 'not-found',
      siteUrl: '',
      message: 'Project Hub could not determine the current SharePoint site URL.',
    };
  }

  try {
    const registryService = createProjectRegistryService();
    const registryRecord = await registryService.getBySiteUrl(siteUrl);
    const projectContext = resolveSpfxProjectContext({
      siteUrl,
      registryRecord: registryRecord
        ? {
            projectId: registryRecord.projectId,
            projectName: registryRecord.projectName,
            projectNumber: registryRecord.projectNumber,
            department: registryRecord.department,
          }
        : null,
    });

    if (!projectContext.resolved || !registryRecord) {
      clearProjectHubContext();
      return {
        status: 'not-found',
        siteUrl,
        message:
          'Project Hub could not match this SharePoint site to a canonical project registry record.',
      };
    }

    const activeProject = toActiveProject(registryRecord);
    useProjectStore.getState().setAvailableProjects([activeProject]);
    useProjectStore.getState().setActiveProject(activeProject);
    useProjectStore.getState().setLoading(false);
    useNavStore.getState().setActiveWorkspace('project-hub');

    return {
      status: 'resolved',
      siteUrl,
      projectId: projectContext.projectId!,
      projectName: projectContext.projectName!,
      projectNumber: projectContext.projectNumber!,
    };
  } catch (error) {
    clearProjectHubContext();
    return {
      status: 'error',
      siteUrl,
      message:
        error instanceof Error
          ? error.message
          : 'Project Hub failed to initialize project context from the registry.',
    };
  }
}
