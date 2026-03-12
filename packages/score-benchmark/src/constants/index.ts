export const BENCHMARK_MIN_SAMPLE_SIZE = 5;
export const BENCHMARK_STALE_MS = 86_400_000;
export const BENCHMARK_SYNC_QUEUE_KEY = 'score-benchmark-sync-queue';
export const BENCHMARK_STATUS_BANDS = [
  'loss-risk',
  'below',
  'borderline',
  'win-zone',
] as const;
export const BENCHMARK_GOVERNANCE_WARNING_DELTA = 0.25;
