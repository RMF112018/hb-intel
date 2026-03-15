import { describe, it, expect } from 'vitest';
import {
  computeStateCounts,
  computeQueueHealthSummary,
  detectBottlenecks,
  FAILED_THRESHOLD,
  CLARIFICATION_AGING_HOURS,
  EXTERNAL_SETUP_AGING_DAYS,
} from '../utils/bottleneckRules.js';
import { createTestRequest } from './factories.js';

const NOW = '2026-03-15T12:00:00Z';

describe('computeStateCounts', () => {
  it('returns zero for all states when no requests', () => {
    const counts = computeStateCounts([]);
    expect(counts['Submitted']).toBe(0);
    expect(counts['Failed']).toBe(0);
    expect(counts['Completed']).toBe(0);
  });

  it('counts requests per state', () => {
    const requests = [
      createTestRequest({ state: 'Submitted' }),
      createTestRequest({ state: 'Submitted', requestId: 'r2' }),
      createTestRequest({ state: 'Failed', requestId: 'r3' }),
      createTestRequest({ state: 'Completed', requestId: 'r4' }),
    ];
    const counts = computeStateCounts(requests);
    expect(counts['Submitted']).toBe(2);
    expect(counts['Failed']).toBe(1);
    expect(counts['Completed']).toBe(1);
    expect(counts['UnderReview']).toBe(0);
  });
});

describe('computeQueueHealthSummary', () => {
  it('returns healthy when no failed or needs-attention requests', () => {
    const requests = [
      createTestRequest({ state: 'Submitted' }),
      createTestRequest({ state: 'Provisioning', requestId: 'r2' }),
    ];
    const summary = computeQueueHealthSummary(requests, NOW);
    expect(summary.activeCount).toBe(2);
    expect(summary.needsAttentionCount).toBe(0);
    expect(summary.overallHealth).toBe('healthy');
  });

  it('returns degraded when failed requests exist', () => {
    const requests = [
      createTestRequest({ state: 'Submitted' }),
      createTestRequest({ state: 'Failed', requestId: 'r2' }),
    ];
    const summary = computeQueueHealthSummary(requests, NOW);
    expect(summary.activeCount).toBe(1);
    expect(summary.needsAttentionCount).toBe(1);
    expect(summary.overallHealth).toBe('degraded');
  });

  it('counts recent completions within 7 days', () => {
    const requests = [
      createTestRequest({ state: 'Completed', requestId: 'r1', completedAt: '2026-03-14T00:00:00Z' }),
      createTestRequest({ state: 'Completed', requestId: 'r2', completedAt: '2026-03-01T00:00:00Z' }),
    ];
    const summary = computeQueueHealthSummary(requests, NOW);
    expect(summary.completedRecentCount).toBe(1);
  });

  it('returns all zeros for empty array', () => {
    const summary = computeQueueHealthSummary([], NOW);
    expect(summary.activeCount).toBe(0);
    expect(summary.needsAttentionCount).toBe(0);
    expect(summary.completedRecentCount).toBe(0);
    expect(summary.overallHealth).toBe('healthy');
  });
});

describe('detectBottlenecks', () => {
  it('detects failed requests above threshold', () => {
    const requests = [
      createTestRequest({ state: 'Failed' }),
    ];
    const indicators = detectBottlenecks(requests, NOW);
    expect(indicators).toHaveLength(1);
    expect(indicators[0].state).toBe('Failed');
    expect(indicators[0].type).toBe('count');
    expect(indicators[0].message).toContain('1 failed request');
  });

  it('returns no indicators when no bottlenecks', () => {
    const requests = [
      createTestRequest({ state: 'Submitted' }),
      createTestRequest({ state: 'Completed', requestId: 'r2' }),
    ];
    const indicators = detectBottlenecks(requests, NOW);
    expect(indicators).toEqual([]);
  });

  it('detects aging NeedsClarification requests', () => {
    const requests = [
      createTestRequest({
        state: 'NeedsClarification',
        clarificationRequestedAt: '2026-03-12T00:00:00Z', // ~84h ago from NOW
      }),
    ];
    const indicators = detectBottlenecks(requests, NOW);
    const aging = indicators.find((i) => i.state === 'NeedsClarification');
    expect(aging).toBeDefined();
    expect(aging!.type).toBe('aging');
    expect(aging!.message).toContain('>48h');
  });

  it('does not flag recent NeedsClarification requests', () => {
    const requests = [
      createTestRequest({
        state: 'NeedsClarification',
        clarificationRequestedAt: '2026-03-15T10:00:00Z', // 2h ago
      }),
    ];
    const indicators = detectBottlenecks(requests, NOW);
    expect(indicators.find((i) => i.state === 'NeedsClarification')).toBeUndefined();
  });

  it('detects aging AwaitingExternalSetup requests', () => {
    const requests = [
      createTestRequest({
        state: 'AwaitingExternalSetup',
        submittedAt: '2026-03-01T00:00:00Z', // 14 days ago
      }),
    ];
    const indicators = detectBottlenecks(requests, NOW);
    const aging = indicators.find((i) => i.state === 'AwaitingExternalSetup');
    expect(aging).toBeDefined();
    expect(aging!.type).toBe('aging');
    expect(aging!.message).toContain('>5 days');
  });

  it('returns empty array for no requests', () => {
    expect(detectBottlenecks([], NOW)).toEqual([]);
  });

  it('exports threshold constants', () => {
    expect(FAILED_THRESHOLD).toBe(1);
    expect(CLARIFICATION_AGING_HOURS).toBe(48);
    expect(EXTERNAL_SETUP_AGING_DAYS).toBe(5);
  });
});
