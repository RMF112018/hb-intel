import { useState, type ReactNode } from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import { useProjectStore } from '@hbc/shell';
import {
  HBC_DENSITY_TOKENS,
  HBC_SPACE_MD,
  HBC_SPACE_SM,
  Card,
  CardHeader,
  HbcButton,
  HbcTextField,
  Text,
  WorkspacePageShell,
  useDensity,
} from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { IEmptyStateContext, ISmartEmptyStateConfig } from '@hbc/smart-empty-state';
import {
  PROJECT_HUB_SPFX_MODULE_MAP,
  PROJECT_HUB_SPFX_REPORTS_REVIEW_ESCALATIONS,
  ProjectHubSpfxLaneSurface,
  type ProjectHubSpfxLaunchAction,
  type ProjectHubSpfxModuleSlug,
} from '@hbc/features-project-hub';
import {
  buildProjectHubEscalationUrl,
  buildProjectModuleLaunchUrl,
} from '../spfx/buildProjectHubEscalationUrl.js';

const MODULE_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: context.isLoadError ? 'loading-failed' : 'truly-empty',
    heading: 'Module surface unavailable',
    description: context.isLoadError
      ? 'Project Hub could not determine the active project context required to build this SPFx module surface.'
      : 'This route is not part of the governed Phase 3 SPFx module lane.',
    coachingTip:
      'Use the Project Hub tool picker to stay within the governed module set, or reopen the web part from a valid project site.',
  }),
};

const MODULE_EMPTY_CONTEXT: IEmptyStateContext = {
  module: 'project-hub',
  view: 'spfx-module-lane',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'user',
  isLoadError: false,
};

const useStyles = makeStyles({
  /** Stage 11.6: card weight differentiation per P3-C1 §14.2 */
  cardWeightPrimary: {
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.14)',
  },
  cardWeightSupporting: {
    boxShadow: 'none',
    backgroundColor: '#fafafa',
  },
  cardStack: {
    display: 'grid',
    gap: `${HBC_SPACE_SM}px`,
  },
  cardStackComfortable: {
    gap: `${Math.max(HBC_SPACE_SM, HBC_DENSITY_TOKENS.comfortable.tapSpacingMin)}px`,
  },
  cardStackTouch: {
    gap: `${Math.max(HBC_SPACE_MD, HBC_DENSITY_TOKENS.touch.tapSpacingMin)}px`,
  },
  actionGrid: {
    display: 'grid',
    gap: `${HBC_SPACE_MD}px`,
  },
  actionGridComfortable: {
    gap: `${Math.max(HBC_SPACE_MD, HBC_DENSITY_TOKENS.comfortable.tapSpacingMin)}px`,
  },
  actionGridTouch: {
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

function getReturnToPath(): string | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return `${window.location.pathname}${window.location.search}`;
}

export function ReportsReviewEscalationSurface({
  projectId,
}: {
  projectId: string;
}): ReactNode {
  const styles = useStyles();
  const { tier: densityTier } = useDensity();
  const [reviewArtifactId, setReviewArtifactId] = useState('');

  const handleLaunchScenario = (scenarioId: (typeof PROJECT_HUB_SPFX_REPORTS_REVIEW_ESCALATIONS)[number]['id']): void => {
    const targetUrl = buildProjectHubEscalationUrl(scenarioId, {
      projectId,
      reviewArtifactId: reviewArtifactId.trim() || undefined,
      returnTo: getReturnToPath(),
    });

    if (!targetUrl) {
      return;
    }

    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      data-testid="reports-review-escalation-surface"
      data-density-tier={densityTier}
      className={mergeClasses(
        styles.cardStack,
        densityTier === 'comfortable' && styles.cardStackComfortable,
        densityTier === 'touch' && styles.cardStackTouch,
      )}
    >
      <Card size="small" className={styles.cardWeightPrimary} data-card-weight="primary">
        <CardHeader
          header={<Text weight="semibold">Reports and executive-review depth</Text>}
          description={
            <Text>
              These Stage 10.3 affordances handle the deeper PWA workflows that stay outside the
              governed SPFx lane, including advanced recovery and executive-review comparison/history
              depth.
            </Text>
          }
        />
      </Card>

      <div
        className={mergeClasses(
          styles.actionGrid,
          densityTier === 'comfortable' && styles.actionGridComfortable,
          densityTier === 'touch' && styles.actionGridTouch,
        )}
      >
        {PROJECT_HUB_SPFX_REPORTS_REVIEW_ESCALATIONS
          .filter((scenario) => !scenario.requiresReviewArtifactId)
          .map((scenario) => (
            <Card key={scenario.id} size="small">
              <CardHeader
                header={<Text weight="semibold">{scenario.label}</Text>}
                description={
                  <div
                    className={mergeClasses(
                      styles.cardStack,
                      densityTier === 'comfortable' && styles.cardStackComfortable,
                      densityTier === 'touch' && styles.cardStackTouch,
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
                      <HbcButton variant="secondary" onClick={() => handleLaunchScenario(scenario.id)}>
                        {scenario.label}
                      </HbcButton>
                    </div>
                  </div>
                }
              />
            </Card>
          ))}
      </div>

      <Card size="small" className={styles.cardWeightSupporting} data-card-weight="supporting">
        <CardHeader
          header={<Text weight="semibold">Artifact-specific review thread management</Text>}
          description={
            <div
              className={mergeClasses(
                styles.cardStack,
                densityTier === 'comfortable' && styles.cardStackComfortable,
                densityTier === 'touch' && styles.cardStackTouch,
              )}
            >
              <Text>
                Open the exact executive-review thread in PWA once a review artifact is available
                from the reviewer-generated summary or annotation surface.
              </Text>
              <HbcTextField
                fieldId="review-artifact-id"
                label="Review artifact ID"
                value={reviewArtifactId}
                onChange={setReviewArtifactId}
                placeholder="Enter review artifact ID"
                validationMessage="Artifact-specific thread management requires a concrete review artifact context."
              />
              <div
                className={mergeClasses(
                  styles.buttonRow,
                  densityTier === 'comfortable' && styles.buttonRowComfortable,
                  densityTier === 'touch' && styles.buttonRowTouch,
                )}
              >
                <HbcButton
                  variant="secondary"
                  disabled={reviewArtifactId.trim().length === 0}
                  onClick={() => handleLaunchScenario('executive-review-thread-management')}
                >
                  Manage selected review thread
                </HbcButton>
              </div>
            </div>
          }
        />
      </Card>
    </div>
  );
}

export function ProjectModulePage({
  moduleSlug,
}: {
  moduleSlug: ProjectHubSpfxModuleSlug;
}): ReactNode {
  const { tier: densityTier } = useDensity();
  const activeProject = useProjectStore((state) => state.activeProject);
  const definition = PROJECT_HUB_SPFX_MODULE_MAP[moduleSlug];

  if (!definition || !activeProject) {
    return (
      <WorkspacePageShell
        layout={definition?.pageLayout ?? 'dashboard'}
        title={definition?.title ?? 'Project Hub'}
        showDensityControl
      >
        <HbcSmartEmptyState
          config={MODULE_EMPTY_CONFIG}
          context={{
            ...MODULE_EMPTY_CONTEXT,
            isLoadError: !activeProject,
            view: definition?.slug ?? MODULE_EMPTY_CONTEXT.view,
          }}
          variant="full-page"
        />
      </WorkspacePageShell>
    );
  }

  const handleLaunchAction = (action: ProjectHubSpfxLaunchAction): void => {
    const targetUrl = buildProjectModuleLaunchUrl(activeProject.id, action, {
      returnTo: getReturnToPath(),
    });

    if (!targetUrl) {
      return;
    }

    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <WorkspacePageShell
      layout={definition.pageLayout}
      title={definition.title}
      showDensityControl
    >
      <ProjectHubSpfxLaneSurface
        definition={definition}
        projectName={activeProject.name}
        projectNumber={activeProject.number}
        densityTier={densityTier}
        onLaunchAction={handleLaunchAction}
      />
      {moduleSlug === 'reports' ? (
        <ReportsReviewEscalationSurface projectId={activeProject.id} />
      ) : null}
    </WorkspacePageShell>
  );
}
