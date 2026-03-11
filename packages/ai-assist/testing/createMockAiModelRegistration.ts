/**
 * createMockAiModelRegistration — SF15-T02, D-10 (testing sub-path)
 *
 * Factory for mock IAiModelRegistration instances with Partial overrides.
 */
import type { IAiModelRegistration } from '../src/types/index.js';

export function createMockAiModelRegistration(
  overrides: Partial<IAiModelRegistration> = {},
): IAiModelRegistration {
  return {
    modelKey: 'gpt-4o',
    displayName: 'GPT-4o',
    deploymentName: 'gpt-4o-deployment',
    deploymentVersion: '2024-08-06',
    ...overrides,
  };
}
