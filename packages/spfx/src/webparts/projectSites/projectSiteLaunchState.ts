import type {
  IProjectSiteDataQuality,
  IProjectSiteLaunchStatus,
} from './types.js';

export interface ProjectSiteLaunchInput {
  hasSiteUrl: boolean;
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

  if (hasCriticalDataIssueBeyondProvisioning(input.dataQuality)) {
    return {
      state: 'attention-needed',
      reasonCode: 'critical-data-issue',
      isLaunchable: false,
      userMessage: 'Record needs data correction before launch confidence can be established.',
    };
  }

  if (input.hasSiteUrl) {
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
