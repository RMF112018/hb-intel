/**
 * @hbc/ai-assist — RelevanceScoringEngine (SF15-T03)
 *
 * Weighted 4-factor scoring for AI action relevance ranking.
 */

import type { IAiAction, IAiActionInvokeContext, IRelevanceScore } from '../types/index.js';
import { tierRank } from '@hbc/complexity';

const WEIGHT_BASE_PRIORITY = 0.4;
const WEIGHT_TAG_MATCH = 0.3;
const WEIGHT_COMPLEXITY = 0.15;
const WEIGHT_ROLE = 0.15;

function computeBasePriority(action: IAiAction): number {
  return Math.max(0, Math.min(100, action.basePriorityScore ?? 0));
}

function computeTagMatch(action: IAiAction, contextTags?: readonly string[]): number {
  const tags = action.relevanceTags;
  if (!tags || tags.length === 0) return 50; // neutral
  if (!contextTags || contextTags.length === 0) return 50; // neutral

  let matchCount = 0;
  for (const tag of tags) {
    if (contextTags.includes(tag)) {
      matchCount++;
    }
  }
  return (matchCount / tags.length) * 100;
}

function computeComplexityAlignment(action: IAiAction, context: IAiActionInvokeContext): number {
  if (!action.minComplexity) return 100;
  return tierRank(context.complexity) >= tierRank(action.minComplexity) ? 100 : 0;
}

function computeRoleMatch(action: IAiAction, context: IAiActionInvokeContext): number {
  if (!action.allowedRoles) return 100;
  return action.allowedRoles.includes(context.role) ? 100 : 0;
}

function scoreActions(
  actions: readonly IAiAction[],
  context: IAiActionInvokeContext,
  contextTags?: readonly string[],
): readonly IRelevanceScore[] {
  return actions
    .map((action) => {
      const basePriority = computeBasePriority(action);
      const tagMatch = computeTagMatch(action, contextTags);
      const complexityAlignment = computeComplexityAlignment(action, context);
      const roleMatch = computeRoleMatch(action, context);

      const score =
        basePriority * WEIGHT_BASE_PRIORITY +
        tagMatch * WEIGHT_TAG_MATCH +
        complexityAlignment * WEIGHT_COMPLEXITY +
        roleMatch * WEIGHT_ROLE;

      return {
        actionId: action.actionKey,
        score,
        factors: {
          basePriority,
          tagMatch,
          complexityAlignment,
          roleMatch,
        },
      };
    })
    .sort((a, b) => b.score - a.score);
}

/** Scoring engine for ranking AI actions by contextual relevance. */
export const RelevanceScoringEngine = {
  scoreActions,
} as const;
