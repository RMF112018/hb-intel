/** SF27-T04 — Execution orchestration hook. */
import { useState, useCallback, useMemo } from 'react';
import type { IBulkExecutionPlan, IBulkExecutionResult, IBulkExecutionProgress, IBulkItemExecutionResult, BulkExecutionPhase } from '../types/index.js';
import { planExecution, aggregateResults } from '../execution/executionEngine.js';

export interface UseBulkActionExecutionOptions { actionId: string; itemIds: string[]; chunkSize?: number; }
export interface UseBulkActionExecutionResult {
  plan: IBulkExecutionPlan | null; progress: IBulkExecutionProgress | null; result: IBulkExecutionResult | null;
  phase: BulkExecutionPhase; isRunning: boolean;
  start: (executor: (chunkIds: string[]) => Promise<IBulkItemExecutionResult[]>) => Promise<IBulkExecutionResult>;
  reset: () => void;
}

export function useBulkActionExecution(options: UseBulkActionExecutionOptions): UseBulkActionExecutionResult {
  const { actionId, itemIds, chunkSize } = options;
  const [phase, setPhase] = useState<BulkExecutionPhase>('idle');
  const [result, setResult] = useState<IBulkExecutionResult | null>(null);
  const [progress, setProgress] = useState<IBulkExecutionProgress | null>(null);

  const plan = useMemo(() => itemIds.length > 0 ? planExecution(itemIds, chunkSize) : null, [itemIds, chunkSize]);

  const start = useCallback(async (executor: (chunkIds: string[]) => Promise<IBulkItemExecutionResult[]>): Promise<IBulkExecutionResult> => {
    if (!plan) throw new Error('No execution plan');
    setPhase('running');
    const allResults: IBulkItemExecutionResult[] = [];
    for (let i = 0; i < plan.chunks.length; i++) {
      setProgress({ phase: 'running', completedChunks: i, totalChunks: plan.totalChunks, processedItems: allResults.length, totalItems: plan.totalItems, estimatedRemainingMs: null });
      const chunkResults = await executor(plan.chunks[i].itemIds);
      allResults.push(...chunkResults);
    }
    const aggregated = aggregateResults(actionId, allResults);
    setResult(aggregated);
    setPhase(aggregated.phase);
    setProgress({ phase: aggregated.phase, completedChunks: plan.totalChunks, totalChunks: plan.totalChunks, processedItems: plan.totalItems, totalItems: plan.totalItems, estimatedRemainingMs: 0 });
    return aggregated;
  }, [plan, actionId]);

  const reset = useCallback(() => { setPhase('idle'); setResult(null); setProgress(null); }, []);

  return { plan, progress, result, phase, isRunning: phase === 'running', start, reset };
}
