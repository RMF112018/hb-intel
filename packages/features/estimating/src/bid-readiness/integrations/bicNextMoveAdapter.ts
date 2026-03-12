/**
 * SF18-T07 BIC Next Move reference integration adapter.
 *
 * Projects readiness blockers/recommendations into deterministic next-action
 * references without invoking external runtime services.
 *
 * @design D-SF18-T07
 */
import type {
  IBidReadinessViewState,
  IReadinessActionPayload,
} from '../../types/index.js';
import type { PriorityLevel } from '../../constants/index.js';

const PRIORITY_RANK: Record<PriorityLevel, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export interface IBicNextMoveReferenceAction {
  readonly actionId: string;
  readonly title: string;
  readonly actionHref: string;
  readonly ownerUserId?: string;
  readonly priority: PriorityLevel;
  readonly sourceType: 'blocker' | 'recommendation';
  readonly rationale: string;
}

export interface IBidReadinessBicNextMoveProjection {
  readonly pursuitId: string;
  readonly generatedAt: string;
  readonly status: 'ready' | 'nearly-ready' | 'attention-needed' | 'not-ready' | 'unavailable';
  readonly actions: readonly IBicNextMoveReferenceAction[];
  readonly reason: 'derived' | 'no-view-state';
}

function toRecommendationAction(
  recommendationTitle: string,
  action: IReadinessActionPayload,
  priority: PriorityLevel,
): IBicNextMoveReferenceAction {
  return {
    actionId: action.actionId,
    title: action.label,
    actionHref: action.actionHref,
    ownerUserId: action.ownerUserId,
    priority,
    sourceType: 'recommendation',
    rationale: recommendationTitle,
  };
}

/**
 * Deterministically projects view state into BIC Next Move reference actions.
 *
 * @design D-SF18-T07
 */
export function projectBidReadinessToBicNextMove(params: {
  readonly pursuitId: string;
  readonly viewState: IBidReadinessViewState | null;
  readonly maxActions?: number;
  readonly generatedAt?: string;
}): IBidReadinessBicNextMoveProjection {
  const {
    pursuitId,
    viewState,
    maxActions = 5,
    generatedAt = new Date().toISOString(),
  } = params;

  if (!viewState) {
    return {
      pursuitId,
      generatedAt,
      status: 'unavailable',
      actions: [],
      reason: 'no-view-state',
    };
  }

  const blockerActions = viewState.criteria
    .filter(({ criterion, isComplete }) => criterion.isBlocker && !isComplete)
    .sort((left, right) => {
      if (left.criterion.weight !== right.criterion.weight) {
        return right.criterion.weight - left.criterion.weight;
      }
      return left.criterion.label.localeCompare(right.criterion.label);
    })
    .map((entry) => ({
      actionId: `resolve-${entry.criterion.criterionId}`,
      title: `Resolve blocker: ${entry.criterion.label}`,
      actionHref: entry.actionHref,
      ownerUserId: entry.assignee?.userId,
      priority: 'critical' as const,
      sourceType: 'blocker' as const,
      rationale: 'Blocker criterion must be completed before submission eligibility.',
    }));

  const recommendationActions = viewState.summary.recommendations
    .slice()
    .sort((left, right) => {
      const priorityDelta = PRIORITY_RANK[left.priority] - PRIORITY_RANK[right.priority];
      if (priorityDelta !== 0) {
        return priorityDelta;
      }
      return left.title.localeCompare(right.title);
    })
    .flatMap((recommendation) =>
      recommendation.actions.map((action) =>
        toRecommendationAction(recommendation.title, action, recommendation.priority),
      ))
    .sort((left, right) => {
      const priorityDelta = PRIORITY_RANK[left.priority] - PRIORITY_RANK[right.priority];
      if (priorityDelta !== 0) {
        return priorityDelta;
      }
      return left.title.localeCompare(right.title);
    });

  const dedupedByActionId = new Map<string, IBicNextMoveReferenceAction>();
  for (const action of [...blockerActions, ...recommendationActions]) {
    if (!dedupedByActionId.has(action.actionId)) {
      dedupedByActionId.set(action.actionId, action);
    }
  }

  return {
    pursuitId,
    generatedAt,
    status: viewState.status,
    actions: [...dedupedByActionId.values()].slice(0, Math.max(0, maxActions)),
    reason: 'derived',
  };
}
