/**
 * SF27-T03 — Chunked execution engine.
 */
import type { IBulkExecutionPlan, IBulkExecutionChunk, IBulkExecutionResult, IBulkItemExecutionResult, IBulkGroupedFailureReason, IBulkActionItemRef, BulkResultKind } from '../types/index.js';
import { BULK_ACTIONS_DEFAULT_CHUNK_SIZE } from '../types/index.js';

export function planExecution(itemIds: string[], chunkSize: number = BULK_ACTIONS_DEFAULT_CHUNK_SIZE): IBulkExecutionPlan {
  const chunks: IBulkExecutionChunk[] = [];
  for (let i = 0; i < itemIds.length; i += chunkSize) {
    chunks.push({ chunkIndex: chunks.length, itemIds: itemIds.slice(i, i + chunkSize) });
  }
  return { totalItems: itemIds.length, chunkSize, totalChunks: chunks.length, chunks };
}

export function aggregateResults(actionId: string, itemResults: IBulkItemExecutionResult[], now?: Date): IBulkExecutionResult {
  const succeeded = itemResults.filter(r => r.resultKind === 'succeeded').length;
  const failed = itemResults.filter(r => r.resultKind === 'failed').length;
  const skipped = itemResults.filter(r => r.resultKind === 'skipped').length;
  const retryable = itemResults.filter(r => r.resultKind === 'retryable').length;

  const phase = failed === 0 && skipped === 0 ? 'complete' : failed > 0 && succeeded > 0 ? 'partial' : failed > 0 ? 'failed' : 'complete';

  const failureMap = new Map<string, IBulkActionItemRef[]>();
  for (const r of itemResults) {
    if (r.resultKind === 'failed' || r.resultKind === 'retryable') {
      const key = r.message ?? 'Unknown error';
      if (!failureMap.has(key)) failureMap.set(key, []);
      failureMap.get(key)!.push(r.itemRef);
    }
  }

  const groupedFailures: IBulkGroupedFailureReason[] = Array.from(failureMap.entries()).map(([msg, refs]) => ({
    reasonCode: 'execution-failure',
    message: msg,
    itemCount: refs.length,
    itemRefs: refs,
  }));

  return {
    actionId, phase, totalItems: itemResults.length,
    succeeded, failed, skipped, retryable,
    items: itemResults, groupedFailures,
    completedAtIso: (now ?? new Date()).toISOString(),
  };
}
