import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCurrentUser, usePermissionStore } from '@hbc/auth';
import { useComplexity } from '@hbc/complexity';
import type { KpiCardData } from '@hbc/models';
import {
  createSpfxCanvasStorageAdapter,
  HbcProjectCanvas,
  registerReferenceTiles,
  ROLE_DEFAULT_TILES,
} from '@hbc/project-canvas';
import { useProjectStore } from '@hbc/shell';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { IEmptyStateContext, ISmartEmptyStateConfig } from '@hbc/smart-empty-state';
import {
  WorkspacePageShell,
} from '@hbc/ui-kit';
import {
  PROJECT_HUB_SPFX_MODULES,
  ProjectOperatingSurface,
} from '@hbc/features-project-hub';
import { createProjectHubSpfxCanvasPersistence } from '../spfx/createProjectHubSpfxCanvasPersistence.js';
import { useProjectHubRuntimeContext } from '../spfx/ProjectHubRuntimeContext.js';

registerReferenceTiles();

const CANVAS_ROLE_BY_AUTH_ROLE_ID: Record<string, string> = {
  'project-manager': 'Project Manager',
  'project-engineer': 'Project Engineer',
  'project-executive': 'VP of Operations',
  superintendent: 'Superintendent',
  'chief-estimator': 'Chief Estimator',
  'director-of-preconstruction': 'Director of Preconstruction',
};

const PERSONALIZATION_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'loading-failed',
    heading: 'Project personalization unavailable',
    description:
      'Project Hub could not determine a governed user or role for the SPFx personalization lane.',
    coachingTip:
      'Confirm the authenticated user, permissions, and canonical project context are all available before editing the project home canvas.',
  }),
};

function resolveCanvasRole(
  currentUser: ReturnType<typeof useCurrentUser>,
  permissions: string[],
): string | null {
  if (currentUser?.type === 'internal') {
    for (const role of currentUser.roles) {
      if (role.name in ROLE_DEFAULT_TILES) {
        return role.name;
      }
      const normalized = CANVAS_ROLE_BY_AUTH_ROLE_ID[role.id];
      if (normalized) {
        return normalized;
      }
    }
  }

  if (permissions.includes('project:approve')) {
    return 'VP of Operations';
  }
  if (permissions.includes('project:write') && permissions.includes('accounting:read')) {
    return 'Project Manager';
  }
  if (permissions.includes('estimating:write')) {
    return 'Chief Estimator';
  }
  if (permissions.includes('safety:read') && permissions.includes('quality-control:read')) {
    return 'Superintendent';
  }
  if (permissions.includes('project:read')) {
    return 'Project Engineer';
  }

  return null;
}

function resolveCanvasUserId(
  currentUser: ReturnType<typeof useCurrentUser>,
  loginName?: string,
): string | null {
  if (currentUser?.id) {
    return currentUser.id;
  }

  return loginName?.trim() ? `spfx-${loginName.trim()}` : null;
}

export function DashboardPage(): ReactNode {
  const navigate = useNavigate();
  const activeProject = useProjectStore((s) => s.activeProject);
  const currentUser = useCurrentUser();
  const permissions = usePermissionStore((s) => s.permissions);
  const { tier } = useComplexity();
  const { spfxContext, initState } = useProjectHubRuntimeContext();
  const loginName = spfxContext?.pageContext?.user?.loginName;
  const canvasRole = resolveCanvasRole(currentUser, permissions);
  const canvasUserId = resolveCanvasUserId(currentUser, loginName);
  const persistenceSiteUrl =
    initState?.status === 'resolved'
      ? initState.siteUrl
      : spfxContext?.pageContext?.web?.absoluteUrl ?? spfxContext?.pageContext?.web?.url;

  const persistenceAdapter = useMemo(() => {
    return persistenceSiteUrl
      ? createProjectHubSpfxCanvasPersistence(persistenceSiteUrl)
      : createSpfxCanvasStorageAdapter();
  }, [persistenceSiteUrl]);

  const moduleCounts = {
    fullOrBroad: PROJECT_HUB_SPFX_MODULES.filter((module) => module.depth === 'required' || module.depth === 'broad').length,
    readOnlyOrBaseline: PROJECT_HUB_SPFX_MODULES.filter((module) => module.depth === 'read-only' || module.depth === 'baseline-visible').length,
    launchToPwa: PROJECT_HUB_SPFX_MODULES.filter((module) => module.pwaEscalations.length > 0).length,
  };

  const summaryCards: KpiCardData[] = [
    { id: 'active-project', label: 'Active Project', value: activeProject?.name ?? 'No project' },
    { id: 'direct-spfx-modules', label: 'Direct SPFx Modules', value: String(moduleCounts.fullOrBroad) },
    { id: 'launch-to-pwa-modules', label: 'Launch-to-PWA Modules', value: String(moduleCounts.launchToPwa) },
    {
      id: 'canvas-persistence',
      label: 'Canvas Persistence',
      value: persistenceSiteUrl ? 'Local + SharePoint' : 'Local only',
    },
    {
      id: 'read-only-baseline-modules',
      label: 'Read-only/Baseline Modules',
      value: String(moduleCounts.readOnlyOrBaseline),
    },
  ];

  if (!activeProject || !canvasRole || !canvasUserId) {
    const context: IEmptyStateContext = {
      module: 'project-hub',
      view: 'spfx-personalization',
      hasActiveFilters: false,
      hasPermission: permissions.includes('project:read'),
      isFirstVisit: false,
      currentUserRole: 'user',
      isLoadError: false,
    };

    return (
      <WorkspacePageShell layout="dashboard" title="Project Hub" showDensityControl>
        <HbcSmartEmptyState
          config={PERSONALIZATION_EMPTY_CONFIG}
          context={context}
          variant="full-page"
        />
      </WorkspacePageShell>
    );
  }

  return (
    <WorkspacePageShell
      layout="dashboard"
      title="Project Hub"
      showDensityControl
      dashboardConfig={{ kpiCards: summaryCards }}
    >
      <ProjectOperatingSurface
        canvasSlot={
          <HbcProjectCanvas
            projectId={activeProject.id}
            userId={canvasUserId}
            role={canvasRole}
            persistenceAdapter={persistenceAdapter}
            complexityTier={tier}
            editable
            title=""
          />
        }
        onModuleOpen={(slug) => navigate({ to: `/${slug}` })}
      />
    </WorkspacePageShell>
  );
}
