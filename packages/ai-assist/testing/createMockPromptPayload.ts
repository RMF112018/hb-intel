/**
 * createMockPromptPayload — SF15-T02, D-10 (testing sub-path)
 *
 * Factory for mock IAiPromptPayload instances with Partial overrides.
 */
import type { IAiPromptPayload } from '../src/types/index.js';

export function createMockPromptPayload(
  overrides: Partial<IAiPromptPayload> = {},
): IAiPromptPayload {
  return {
    systemInstruction: 'You are a scorecard analyst.',
    userPrompt: 'Summarize this scorecard.',
    modelKey: 'gpt-4o',
    ...overrides,
  };
}
