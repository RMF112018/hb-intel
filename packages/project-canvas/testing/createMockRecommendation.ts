/**
 * createMockRecommendation — D-SF13-T08, D-10 (testing sub-path)
 *
 * Factory for mock canvas recommendation instances with Partial overrides.
 */
import type { RecommendationSignal } from '../src/constants/canvasDefaults.js';

export interface MockRecommendation {
  tileKey: string;
  signal: RecommendationSignal;
  reason: string;
}

export function createMockRecommendation(
  overrides: Partial<MockRecommendation> = {},
): MockRecommendation {
  return {
    tileKey: 'mock-tile',
    signal: 'health',
    reason: 'Mock reason',
    ...overrides,
  };
}
