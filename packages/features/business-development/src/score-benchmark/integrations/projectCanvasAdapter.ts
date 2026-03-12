import type { RecommendationSignal } from '@hbc/project-canvas';
import type { IScoreBenchmarkStateResult } from '@hbc/score-benchmark';

export interface IScoreBenchmarkCanvasPlacement {
  tileKey: 'bic-my-items';
  recommendationSignal: RecommendationSignal;
  routeHref: string;
  escalationTargetIds: string[];
}

export const projectScoreBenchmarkToCanvasPlacement = (
  state: IScoreBenchmarkStateResult,
  routeHref: string
): IScoreBenchmarkCanvasPlacement => ({
  tileKey: 'bic-my-items',
  recommendationSignal: state.hasLossRiskOverlap ? 'deadline-change' : 'usage-history',
  routeHref,
  escalationTargetIds: state.bicOwnershipProjections
    .map((projection) => projection.owner?.userId)
    .filter((value): value is string => Boolean(value)),
});
