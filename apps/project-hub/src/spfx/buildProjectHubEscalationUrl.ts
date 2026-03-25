import {
  PROJECT_HUB_SPFX_ESCALATION_SCENARIO_MAP,
  type ProjectHubSpfxEscalationScenarioId,
  type ProjectHubSpfxLaunchAction,
} from '@hbc/features-project-hub';
import { buildPwaDeepLink } from '@hbc/shell';
import { resolvePwaBaseUrl } from './resolvePwaBaseUrl.js';

export interface ProjectHubEscalationContext {
  readonly projectId?: string;
  readonly reviewArtifactId?: string;
  readonly returnTo?: string;
}

function buildAbsoluteUrl(
  baseUrl: string,
  path: string,
  queryParams: Record<string, string | undefined>,
): string {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  const url = new URL(`${normalizedBaseUrl}${path}`);

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

export function buildProjectHubEscalationUrl(
  scenarioId: ProjectHubSpfxEscalationScenarioId,
  context: ProjectHubEscalationContext,
): string | null {
  const scenario = PROJECT_HUB_SPFX_ESCALATION_SCENARIO_MAP[scenarioId];
  const pwaBaseUrl = resolvePwaBaseUrl();

  if (scenario.requiresProjectId && !context.projectId) {
    return null;
  }

  if (scenario.requiresReviewArtifactId && !context.reviewArtifactId) {
    return null;
  }

  const returnTo = scenario.requiresReturnTo ? context.returnTo : undefined;

  switch (scenario.target) {
    case 'project-hub-root':
      return buildAbsoluteUrl(pwaBaseUrl, '/project-hub', {
        source: 'spfx',
      });
    case 'my-work':
      return buildAbsoluteUrl(pwaBaseUrl, '/my-work', {
        projectId: context.projectId,
        returnTo,
        source: 'spfx',
      });
    case 'project-activity':
      return buildAbsoluteUrl(
        pwaBaseUrl,
        `/project-hub/${encodeURIComponent(context.projectId!)}/activity`,
        {
          returnTo,
          source: 'spfx',
        },
      );
    case 'project-hub-control-center':
      return buildAbsoluteUrl(
        pwaBaseUrl,
        `/project-hub/${encodeURIComponent(context.projectId!)}`,
        {
          recovery: scenarioId === 'advanced-draft-recovery' ? 'true' : undefined,
          admin: scenarioId === 'advanced-canvas-admin' ? 'canvas' : undefined,
          returnTo,
          source: 'spfx',
        },
      );
    case 'project-hub-module':
      return buildPwaDeepLink(pwaBaseUrl, {
        projectId: context.projectId!,
        module: scenario.module,
        action: scenario.action,
        view: scenario.view,
        reviewArtifactId: context.reviewArtifactId,
        returnTo,
      });
  }
}

export function buildProjectModuleLaunchUrl(
  projectId: string,
  action: ProjectHubSpfxLaunchAction,
  context: Pick<ProjectHubEscalationContext, 'reviewArtifactId' | 'returnTo'> = {},
): string | null {
  if (action.scenarioId) {
    return buildProjectHubEscalationUrl(action.scenarioId, {
      projectId,
      reviewArtifactId: context.reviewArtifactId,
      returnTo: context.returnTo,
    });
  }

  return buildPwaDeepLink(resolvePwaBaseUrl(), {
    projectId,
    module: action.module,
    action: action.action,
    view: action.view,
    reviewArtifactId: context.reviewArtifactId,
    returnTo: context.returnTo,
  });
}
