import type { IBicNextMoveState, IBicOwner, IBicRegisteredItem } from '@hbc/bic-next-move';

import type { IProjectHealthPulse } from '../types/index.js';
import { toStableProjectionId } from './helpers.js';

export interface IProjectHealthPulseBicProjectionInput {
  pulse: IProjectHealthPulse;
  projectName: string;
  href: string;
  ownerDirectory?: Record<string, IBicOwner>;
}

export interface IProjectHealthPulseBicProjection {
  item: IBicRegisteredItem;
  officeSignalSummary: string;
}

const toBicUrgency = (status: IProjectHealthPulse['overallStatus']): IBicNextMoveState['urgencyTier'] => {
  if (status === 'critical' || status === 'at-risk') return 'immediate';
  if (status === 'watch') return 'watch';
  return 'upcoming';
};

const resolveOwner = (
  ownerKey: string | null,
  ownerDirectory?: Record<string, IBicOwner>
): IBicOwner | null => {
  if (!ownerKey) {
    return null;
  }

  const knownOwner = ownerDirectory?.[ownerKey];
  if (knownOwner) {
    return knownOwner;
  }

  return {
    userId: ownerKey,
    displayName: ownerKey,
    role: 'Project Health Owner',
  };
};

export const projectHealthPulseToBicItem = (
  input: IProjectHealthPulseBicProjectionInput
): IProjectHealthPulseBicProjection => {
  const { pulse } = input;
  const currentOwner = resolveOwner(pulse.topRecommendedAction?.owner ?? null, input.ownerDirectory);
  const highestOfficeRisk = pulse.compoundRisks.find((risk) => risk.affectedDimensions.includes('office'));

  const state: IBicNextMoveState = {
    currentOwner,
    expectedAction: pulse.topRecommendedAction?.actionText ?? 'Review project health pulse detail.',
    dueDate: null,
    isOverdue: pulse.overallStatus === 'critical',
    isBlocked: Boolean(highestOfficeRisk),
    blockedReason: highestOfficeRisk?.summary ?? null,
    previousOwner: null,
    nextOwner: null,
    escalationOwner: currentOwner,
    transferHistory: [],
    urgencyTier: toBicUrgency(pulse.overallStatus),
  };

  return {
    item: {
      itemKey: toStableProjectionId('project-health-pulse', pulse.projectId),
      moduleKey: 'project-health-pulse',
      moduleLabel: 'Project Health Pulse',
      state,
      href: input.href,
      title: `${input.projectName} Health Pulse`,
    },
    officeSignalSummary:
      highestOfficeRisk?.summary ??
      `Office status ${pulse.dimensions.office.status} (${pulse.dimensions.office.score}).`,
  };
};
