import {
  BENCHMARK_GOVERNANCE_WARNING_DELTA,
  BENCHMARK_MIN_SAMPLE_SIZE,
  BENCHMARK_STALE_MS,
  BENCHMARK_STATUS_BANDS,
  BENCHMARK_SYNC_QUEUE_KEY,
} from './index.js';

describe('score benchmark contracts', () => {
  it('locks benchmark constants', () => {
    expect(BENCHMARK_MIN_SAMPLE_SIZE).toBe(5);
    expect(BENCHMARK_STALE_MS).toBe(86_400_000);
    expect(BENCHMARK_SYNC_QUEUE_KEY).toBe('score-benchmark-sync-queue');
    expect(BENCHMARK_STATUS_BANDS).toEqual(['loss-risk', 'below', 'borderline', 'win-zone']);
    expect(BENCHMARK_GOVERNANCE_WARNING_DELTA).toBe(0.25);
  });
});
