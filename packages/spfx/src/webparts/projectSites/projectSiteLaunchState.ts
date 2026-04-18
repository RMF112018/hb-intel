import type {
  IProjectSiteDataQuality,
  IProjectSiteLaunchStatus,
  ProjectSiteLaunchTargetKind,
} from './types.js';

export interface ProjectSiteLaunchInput {
  hasPrimarySiteUrl: boolean;
  hasLegacyFallbackFolderUrl: boolean;
  launchTargetKind: ProjectSiteLaunchTargetKind;
  projectStage: string;
  dataQuality: IProjectSiteDataQuality;
}

const INACTIVE_STAGE_SET = new Set([
  'archived',
  'inactive',
  'closed',
  'complete',
  'completed',
  'cancelled',
  'canceled',
]);

function hasCriticalDataIssueBeyondProvisioning(dataQuality: IProjectSiteDataQuality): boolean {
  return dataQuality.issues.some((issue) => issue !== 'missing-site-url');
}

function isInactiveStage(stage: string): boolean {
  const normalized = stage.trim().toLowerCase();
  return normalized.length > 0 && INACTIVE_STAGE_SET.has(normalized);
}

export function deriveProjectSiteLaunchStatus(input: ProjectSiteLaunchInput): IProjectSiteLaunchStatus {
  const inactiveStage = isInactiveStage(input.projectStage);
  const hasLaunchUrl = input.hasPrimarySiteUrl || input.hasLegacyFallbackFolderUrl;

  if (hasCriticalDataIssueBeyondProvisioning(input.dataQuality)) {
    return {
      state: 'attention-needed',
      reasonCode: 'critical-data-issue',
      isLaunchable: false,
      userMessage: 'Record needs data correction before launch confidence can be established.',
    };
  }

  if (hasLaunchUrl) {
    if (input.launchTargetKind === 'legacy-fallback') {
      if (inactiveStage) {
        return {
          state: 'archived',
          reasonCode: 'inactive-stage-legacy-fallback',
          isLaunchable: true,
          userMessage: 'Project is marked inactive/archived; legacy project files remain available for reference.',
        };
      }

      return {
        state: 'live',
        reasonCode: 'legacy-fallback-ready',
        isLaunchable: true,
        userMessage: 'Legacy project files are available from the fallback registry.',
      };
    }

    if (inactiveStage) {
      return {
        state: 'archived',
        reasonCode: 'inactive-stage-live-site',
        isLaunchable: true,
        userMessage: 'Project is marked inactive/archived; site remains available for reference.',
      };
    }

    return {
      state: 'live',
      reasonCode: 'live-site-ready',
      isLaunchable: true,
      userMessage: 'Live site is available and launch-ready.',
    };
  }

  if (inactiveStage) {
    return {
      state: 'archived',
      reasonCode: 'inactive-stage-no-site',
      isLaunchable: false,
      userMessage: 'Project is inactive/archived and no live site is available.',
    };
  }

  return {
    state: 'provisioning',
    reasonCode: 'site-not-provisioned',
    isLaunchable: false,
    userMessage: 'Site has not been provisioned yet.',
  };
}
