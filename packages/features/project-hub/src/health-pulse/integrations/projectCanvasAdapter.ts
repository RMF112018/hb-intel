import type { DataSourceBadge, ICanvasTilePlacement } from '@hbc/project-canvas';

import type { IProjectHealthPulse } from '../types/index.js';
import { toStableProjectionId } from './helpers.js';

export interface IProjectHealthPulseCanvasProjection {
  tileId: string;
  tileKey: string;
  placement: ICanvasTilePlacement;
  dataSource: DataSourceBadge;
  context: {
    projectId: string;
    overallStatus: IProjectHealthPulse['overallStatus'];
    overallScore: number;
    triageBucket: IProjectHealthPulse['triage']['bucket'];
    recommendationReasonCode: string | null;
  };
}

export interface IProjectHealthPulseCanvasProjectionInput {
  pulse: IProjectHealthPulse;
  placement?: Partial<ICanvasTilePlacement>;
}

const DEFAULT_PLACEMENT: ICanvasTilePlacement = {
  tileKey: 'project-health-pulse',
  colStart: 1,
  colSpan: 6,
  rowStart: 1,
  rowSpan: 2,
  isLocked: false,
};

export const projectHealthPulseToCanvasTile = (
  input: IProjectHealthPulseCanvasProjectionInput
): IProjectHealthPulseCanvasProjection => {
  const placement: ICanvasTilePlacement = {
    ...DEFAULT_PLACEMENT,
    ...input.placement,
    tileKey: 'project-health-pulse',
  };

  return {
    tileId: toStableProjectionId('project-health-pulse-tile', input.pulse.projectId),
    tileKey: placement.tileKey,
    placement,
    dataSource: 'Hybrid',
    context: {
      projectId: input.pulse.projectId,
      overallStatus: input.pulse.overallStatus,
      overallScore: input.pulse.overallScore,
      triageBucket: input.pulse.triage.bucket,
      recommendationReasonCode: input.pulse.topRecommendedAction?.reasonCode ?? null,
    },
  };
};
