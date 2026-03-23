/**
 * SF24-T08 — Mock factory for IExportReviewStepState.
 */
import type { IExportReviewStepState } from '../src/types/index.js';

export function createMockReviewStepState(
  overrides?: Partial<IExportReviewStepState>,
): IExportReviewStepState {
  return {
    stepId: 'step-mock-001',
    blocking: true,
    ownerUpn: 'reviewer@example.com',
    ownerName: 'Bob Reviewer',
    status: 'pending',
    reassignmentHistory: [],
    ...overrides,
  };
}
