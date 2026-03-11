/**
 * createMockAiActionResult — SF15-T02, D-10 (testing sub-path)
 *
 * Factory for mock IAiActionResult instances with Partial overrides.
 */
import type { IAiActionResult } from '../src/types/index.js';

export function createMockAiActionResult(
  overrides: Partial<IAiActionResult> = {},
): IAiActionResult {
  return {
    outputType: 'text',
    text: 'Mock AI-generated summary',
    confidenceDetails: {
      confidenceScore: 0.85,
      confidenceBadge: 'high',
      citedSources: [],
      modelDeploymentName: 'gpt-4o',
      modelDeploymentVersion: '2024-08-06',
    },
    ...overrides,
  };
}
