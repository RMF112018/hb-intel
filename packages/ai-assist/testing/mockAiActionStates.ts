/**
 * mockAiActionStates — SF15-T02, D-10 (testing sub-path)
 *
 * Pre-built state snapshots for AI action lifecycle testing.
 */
import type { IAiActionResult } from '../src/types/index.js';

const mockSuccessResult: IAiActionResult = {
  outputType: 'text',
  text: 'Mock AI-generated summary',
  confidenceDetails: {
    confidenceScore: 0.85,
    confidenceBadge: 'high',
    citedSources: [],
    modelDeploymentName: 'gpt-4o',
    modelDeploymentVersion: '2024-08-06',
  },
};

/** Common AI action result states for testing lifecycle transitions. */
export const mockAiActionStates = {
  idle: {
    isLoading: false,
    result: null as IAiActionResult | null,
    error: null as Error | null,
  },
  loading: {
    isLoading: true,
    result: null as IAiActionResult | null,
    error: null as Error | null,
  },
  success: {
    isLoading: false,
    result: mockSuccessResult,
    error: null as Error | null,
  },
  error: {
    isLoading: false,
    result: null as IAiActionResult | null,
    error: new Error('Mock AI action error'),
  },
  cancelled: {
    isLoading: false,
    result: null as IAiActionResult | null,
    error: null as Error | null,
  },
} as const;
