/**
 * BIC module registration factory for BD Score Benchmark.
 * Follows Provisioning reference pattern. P2-C5 Blocker #2.
 */
import type { IBicModuleRegistration, IBicRegisteredItem } from '@hbc/bic-next-move';

export const BD_SCORE_BENCHMARK_BIC_KEY = 'bd-scorecard' as const;
export const BD_SCORE_BENCHMARK_BIC_LABEL = 'BD Score Benchmark' as const;

export function createBdScoreBenchmarkBicRegistration(
  queryFn: (userId: string) => Promise<IBicRegisteredItem[]>,
): IBicModuleRegistration {
  return {
    key: BD_SCORE_BENCHMARK_BIC_KEY,
    label: BD_SCORE_BENCHMARK_BIC_LABEL,
    queryFn,
  };
}
