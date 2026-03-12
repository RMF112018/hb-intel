/**
 * Factory for mock `IHealthIndicatorState` objects used in
 * Estimating Bid Readiness tests.
 *
 * Stub: full implementation deferred to SF18-T08.
 */
export function createMockHealthIndicatorState(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    score: 0.75,
    status: 'warning',
    criteria: [],
    version: 1,
    ...overrides,
  };
}
