/**
 * useAiActions — SF15-T04
 *
 * Discovers and ranks available AI actions for a given record context.
 * Synchronous discovery via in-memory registry + relevance scoring.
 */
import { useMemo } from 'react';
import type { IAiAction, IAiActionInvokeContext, IAiAssistPolicy, ComplexityTier } from '../types/index.js';
import { AiActionRegistry } from '../registry/AiActionRegistry.js';
import { RelevanceScoringEngine } from '../registry/RelevanceScoringEngine.js';

export interface UseAiActionsParams {
  readonly recordType: string;
  readonly recordId: string;
  readonly userId?: string;
  readonly currentRole: string;
  readonly complexityTier: ComplexityTier;
  readonly policyContext?: IAiAssistPolicy;
  readonly contextTags?: readonly string[];
}

export interface UseAiActionsResult {
  readonly actions: readonly IAiAction[];
  readonly isLoading: boolean;
}

export function useAiActions(params: UseAiActionsParams): UseAiActionsResult {
  const { recordType, recordId, userId, currentRole, complexityTier, policyContext, contextTags } = params;

  const actions = useMemo(() => {
    const context: IAiActionInvokeContext = {
      userId: userId ?? '',
      role: currentRole,
      recordType,
      recordId,
      complexity: complexityTier,
    };

    const filtered = AiActionRegistry.getForContext(context, policyContext);

    if (filtered.length === 0) {
      return filtered;
    }

    const scores = RelevanceScoringEngine.scoreActions(filtered, context, contextTags);
    const scoreMap = new Map(scores.map((s) => [s.actionId, s.score]));

    return [...filtered].sort((a, b) => {
      const scoreA = scoreMap.get(a.actionKey) ?? 0;
      const scoreB = scoreMap.get(b.actionKey) ?? 0;
      return scoreB - scoreA;
    });
  }, [recordType, recordId, userId, currentRole, complexityTier, policyContext, contextTags]);

  return { actions, isLoading: false };
}
