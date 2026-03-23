import { describe, it, expect } from 'vitest';
import { planExecution, aggregateResults } from './executionEngine.js';
import type { IBulkItemExecutionResult } from '../types/index.js';

describe('planExecution', () => {
  it('creates chunks of default size', () => {
    const plan = planExecution(Array.from({ length: 120 }, (_, i) => `item-${i}`));
    expect(plan.totalChunks).toBe(3); expect(plan.chunkSize).toBe(50); expect(plan.totalItems).toBe(120);
  });
  it('uses custom chunk size', () => {
    const plan = planExecution(['a', 'b', 'c'], 2);
    expect(plan.totalChunks).toBe(2); expect(plan.chunks[0].itemIds).toEqual(['a', 'b']);
  });
  it('handles empty', () => { expect(planExecution([]).totalChunks).toBe(0); });
});

describe('aggregateResults', () => {
  const makeResult = (kind: 'succeeded' | 'failed' | 'skipped' | 'retryable', msg?: string): IBulkItemExecutionResult => ({
    itemRef: { id: `item-${Math.random()}`, moduleKey: 'test' }, resultKind: kind, message: msg ?? null, retryable: kind === 'retryable',
  });

  it('returns complete for all succeeded', () => {
    const r = aggregateResults('a1', [makeResult('succeeded'), makeResult('succeeded')]);
    expect(r.phase).toBe('complete'); expect(r.succeeded).toBe(2); expect(r.failed).toBe(0);
  });
  it('returns partial for mixed', () => {
    const r = aggregateResults('a1', [makeResult('succeeded'), makeResult('failed', 'Error')]);
    expect(r.phase).toBe('partial'); expect(r.groupedFailures).toHaveLength(1);
  });
  it('returns failed for all failed', () => {
    const r = aggregateResults('a1', [makeResult('failed', 'E1'), makeResult('failed', 'E1')]);
    expect(r.phase).toBe('failed'); expect(r.groupedFailures[0].itemCount).toBe(2);
  });
  it('groups failures by message', () => {
    const r = aggregateResults('a1', [makeResult('failed', 'A'), makeResult('failed', 'B'), makeResult('failed', 'A')]);
    expect(r.groupedFailures).toHaveLength(2);
  });
  it('counts retryable', () => {
    const r = aggregateResults('a1', [makeResult('retryable', 'Timeout')]);
    expect(r.retryable).toBe(1);
  });
});
