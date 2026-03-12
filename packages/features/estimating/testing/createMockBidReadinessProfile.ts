/**
 * Factory for mock bid-readiness profile configurations used in
 * Estimating Bid Readiness tests.
 *
 * Stub: full implementation deferred to SF18-T08.
 */
export function createMockBidReadinessProfile(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    name: 'estimating-default',
    thresholds: { green: 0.8, yellow: 0.5 },
    criterionWeights: {},
    ...overrides,
  };
}
