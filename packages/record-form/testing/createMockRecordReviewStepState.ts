/**
 * SF23-T08 — Mock factory for IRecordReviewStepState.
 */
import type { IRecordReviewStepState } from '../src/types/index.js';

export function createMockRecordReviewStepState(
  overrides?: Partial<IRecordReviewStepState>,
): IRecordReviewStepState {
  return {
    stepId: 'step-mock-001',
    blocking: true,
    phase: 'pre-submit',
    ownerUpn: 'reviewer@example.com',
    ownerName: 'Bob Reviewer',
    status: 'pending',
    reassignmentHistory: [],
    ...overrides,
  };
}
