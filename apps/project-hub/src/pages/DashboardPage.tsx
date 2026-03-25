import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { makeStyles, mergeClasses } from '@griffel/react';
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
  HBC_DENSITY_TOKENS,
  HBC_SPACE_LG,
  HBC_SPACE_MD,
  HBC_SPACE_SM,
  Text,
  Card,
  CardHeader,
  WorkspacePageShell,
  HbcButton,
  useDensity,
} from '@hbc/ui-kit';
import {
  PROJECT_HUB_SPFX_DASHBOARD_SURFACES,
  PROJECT_HUB_SPFX_DASHBOARD_ESCALATIONS,
  PROJECT_HUB_SPFX_MODULES,
} from '@hbc/features-project-hub';
import { buildProjectHubEscalationUrl } from '../spfx/buildProjectHubEscalationUrl.js';
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

const useStyles = makeStyles({
  moduleGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: `${HBC_SPACE_MD}px`,
    marginTop: `${HBC_SPACE_LG}px`,
  },
  moduleGridComfortable: {
    gap: `${Math.max(HBC_SPACE_LG, HBC_DENSITY_TOKENS.comfortable.tapSpacingMin)}px`,
  },
  moduleGridTouch: {
    gap: `${Math.max(HBC_SPACE_LG, HBC_DENSITY_TOKENS.touch.tapSpacingMin)}px`,
  },
  canvasCard: {
    gridColumn: '1 / -1',
  },
  /** Stage 11.6: card weight differentiation per P3-C1 §14.2 */
  cardWeightPrimary: {
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.14)',
  },
  cardWeightSupporting: {
    boxShadow: 'none',
    backgroundColor: '#fafafa',
  },
  canvasBody: {
    display: 'grid',
    gap: `${HBC_SPACE_MD}px`,
  },
  canvasBodyComfortable: {
    gap: `${Math.max(HBC_SPACE_MD, HBC_DENSITY_TOKENS.comfortable.tapSpacingMin)}px`,
  },
  canvasBodyTouch: {
    gap: `${Math.max(HBC_SPACE_LG, HBC_DENSITY_TOKENS.touch.tapSpacingMin)}px`,
  },
  actionList: {
    display: 'grid',
    gap: `${HBC_SPACE_MD}px`,
  },
  actionListComfortable: {
    gap: `${Math.max(HBC_SPACE_MD, HBC_DENSITY_TOKENS.comfortable.tapSpacingMin)}px`,
  },
  actionListTouch: {
    gap: `${Math.max(HBC_SPACE_LG, HBC_DENSITY_TOKENS.touch.tapSpacingMin)}px`,
  },
  actionItem: {
    display: 'grid',
    gap: `${HBC_SPACE_SM}px`,
  },
  actionItemComfortable: {
    gap: `${Math.max(HBC_SPACE_SM, HBC_DENSITY_TOKENS.comfortable.tapSpacingMin)}px`,
  },
  actionItemTouch: {
    gap: `${Math.max(HBC_SPACE_MD, HBC_DENSITY_TOKENS.touch.tapSpacingMin)}px`,
  },
  buttonRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: `${HBC_SPACE_SM}px`,
    minHeight: `${HBC_DENSITY_TOKENS.compact.touchTargetMin}px`,
  },
  buttonRowComfortable: {
    gap: `${HBC_DENSITY_TOKENS.comfortable.tapSpacingMin}px`,
    minHeight: `${HBC_DENSITY_TOKENS.comfortable.touchTargetMin}px`,
  },
  buttonRowTouch: {
    gap: `${HBC_DENSITY_TOKENS.touch.tapSpacingMin}px`,
    minHeight: `${HBC_DENSITY_TOKENS.touch.touchTargetMin}px`,
  },
});

const DASHBOARD_ESCALATION_HUB_SURFACE = PROJECT_HUB_SPFX_DASHBOARD_SURFACES.find(
  (surface) => surface.id === 'escalation-hub',
);
const DASHBOARD_MODULE_LAUNCHER_SURFACE = PROJECT_HUB_SPFX_DASHBOARD_SURFACES.find(
  (surface) => surface.id === 'module-launchers',
);

function getReturnToPath(): string | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return `${window.location.pathname}${window.location.search}`;
}

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
  const styles = useStyles();
  const navigate = useNavigate();
  const { tier: densityTier } = useDensity();
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

  const handleEscalation = (
    scenarioId: (typeof PROJECT_HUB_SPFX_DASHBOARD_ESCALATIONS)[number]['id'],
  ): void => {
    const targetUrl = buildProjectHubEscalationUrl(scenarioId, {
      projectId: activeProject?.id,
      returnTo: getReturnToPath(),
    });

    if (!targetUrl) {
      return;
    }

    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

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
      <div
        data-density-tier={densityTier}
        className={mergeClasses(
          styles.moduleGrid,
          densityTier === 'comfortable' && styles.moduleGridComfortable,
          densityTier === 'touch' && styles.moduleGridTouch,
        )}
      >
        <Card size="small" className={mergeClasses(styles.canvasCard, styles.cardWeightPrimary)} data-card-weight="primary">
          <CardHeader
            header={<Text weight="semibold">Project home canvas</Text>}
            description={
              <Text>
                Stage 10.4 persists the governed SPFx home canvas immediately in local storage and
                mirrors it to a project-site SharePoint list when the host is available.
              </Text>
            }
          />
          <div
            className={mergeClasses(
              styles.canvasBody,
              densityTier === 'comfortable' && styles.canvasBodyComfortable,
              densityTier === 'touch' && styles.canvasBodyTouch,
            )}
          >
            <HbcProjectCanvas
              projectId={activeProject.id}
              userId={canvasUserId}
              role={canvasRole}
              persistenceAdapter={persistenceAdapter}
              complexityTier={tier}
              editable
              title=""
            />
          </div>
        </Card>

        <div
          data-testid="project-hub-dashboard-escalation-hub"
          data-density-tier={densityTier}
          data-surface-type={DASHBOARD_ESCALATION_HUB_SURFACE?.primaryDataSurfaceType}
        >
          <Card size="small" className={styles.cardWeightSupporting} data-card-weight="supporting">
            <CardHeader
              header={<Text weight="semibold">PWA escalation hub</Text>}
              description={
                <div
                  className={mergeClasses(
                    styles.actionList,
                    densityTier === 'comfortable' && styles.actionListComfortable,
                    densityTier === 'touch' && styles.actionListTouch,
                  )}
                >
                  <Text>
                    These Stage 10.3 actions handle the cross-project, workspace, work queue, activity,
                    and canvas-depth workflows that intentionally continue in the PWA.
                  </Text>
                  {PROJECT_HUB_SPFX_DASHBOARD_ESCALATIONS.map((scenario) => {
                    const targetUrl = buildProjectHubEscalationUrl(scenario.id, {
                      projectId: activeProject.id,
                      returnTo: getReturnToPath(),
                    });

                    return (
                      <div
                        key={scenario.id}
                        className={mergeClasses(
                          styles.actionItem,
                          densityTier === 'comfortable' && styles.actionItemComfortable,
                          densityTier === 'touch' && styles.actionItemTouch,
                        )}
                      >
                        <Text>{scenario.description}</Text>
                        <div
                          className={mergeClasses(
                            styles.buttonRow,
                            densityTier === 'comfortable' && styles.buttonRowComfortable,
                            densityTier === 'touch' && styles.buttonRowTouch,
                          )}
                        >
                          <HbcButton
                            variant="secondary"
                            disabled={!targetUrl}
                            onClick={() => handleEscalation(scenario.id)}
                          >
                            {scenario.label}
                          </HbcButton>
                        </div>
                      </div>
                    );
                  })}
                </div>
              }
            />
          </Card>
        </div>

        {PROJECT_HUB_SPFX_MODULES.map((module) => (
          <div
            key={module.slug}
            data-testid={`project-hub-dashboard-module-launcher-${module.slug}`}
            data-density-tier={densityTier}
            data-surface-type={DASHBOARD_MODULE_LAUNCHER_SURFACE?.primaryDataSurfaceType}
          >
            <Card size="small">
              <CardHeader
                header={<Text weight="semibold">{module.title}</Text>}
                description={
                  <div
                    className={mergeClasses(
                      styles.actionItem,
                      densityTier === 'comfortable' && styles.actionItemComfortable,
                      densityTier === 'touch' && styles.actionItemTouch,
                    )}
                  >
                    <Text>{module.summary}</Text>
                    <div
                      className={mergeClasses(
                        styles.buttonRow,
                        densityTier === 'comfortable' && styles.buttonRowComfortable,
                        densityTier === 'touch' && styles.buttonRowTouch,
                      )}
                    >
                      <HbcButton variant="secondary" onClick={() => navigate({ to: `/${module.slug}` })}>
                        Open {module.navLabel}
                      </HbcButton>
                    </div>
                  </div>
                }
              />
            </Card>
          </div>
        ))}
      </div>
    </WorkspacePageShell>
  );
}
