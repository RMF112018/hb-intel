import { createContext, useContext } from 'react';
import type { ProjectHubSpfxInitState } from './initializeProjectHubContext.js';

export interface ProjectHubSpfxContextLike {
  pageContext?: {
    web?: {
      absoluteUrl?: string;
      url?: string;
    };
    user?: {
      loginName?: string;
      email?: string;
      displayName?: string;
    };
  };
}

interface ProjectHubRuntimeContextValue {
  spfxContext?: ProjectHubSpfxContextLike;
  initState?: ProjectHubSpfxInitState;
}

const ProjectHubRuntimeContext = createContext<ProjectHubRuntimeContextValue>({});

export const ProjectHubRuntimeProvider = ProjectHubRuntimeContext.Provider;

export function useProjectHubRuntimeContext(): ProjectHubRuntimeContextValue {
  return useContext(ProjectHubRuntimeContext);
}
