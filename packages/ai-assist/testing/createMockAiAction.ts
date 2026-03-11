/**
 * createMockAiAction — SF15-T02, D-10 (testing sub-path)
 *
 * Factory for mock IAiAction instances with Partial overrides.
 */
import type { IAiAction, IAiPromptPayload, IAiActionResult } from '../src/types/index.js';

export function createMockAiAction(
  overrides: Partial<IAiAction> = {},
): IAiAction {
  return {
    actionKey: 'mock-summarize-scorecard',
    label: 'Summarize Scorecard',
    description: 'AI-generated summary of scorecard data',
    modelKey: 'gpt-4o',
    relevanceTags: ['analysis', 'scorecard'],
    basePriorityScore: 100,
    buildPrompt: (_record: unknown): IAiPromptPayload => ({
      systemInstruction: 'You are a scorecard analyst.',
      userPrompt: 'Summarize this scorecard.',
      modelKey: 'gpt-4o',
    }),
    parseResponse: (_rawResponse: string): IAiActionResult => ({
      outputType: 'text',
      text: 'Mock parsed response',
      confidenceDetails: {
        confidenceScore: 0.85,
        confidenceBadge: 'high',
        citedSources: [],
        modelDeploymentName: 'gpt-4o',
        modelDeploymentVersion: '2024-08-06',
      },
    }),
    ...overrides,
  };
}
