import type { IFieldAnnotation } from '../src/types/IFieldAnnotation';
import { createMockAnnotationReply } from './createMockAnnotationReply';

/**
 * Creates a mock IFieldAnnotation with sensible defaults (D-10).
 * Override any field as needed for specific test scenarios.
 *
 * @example
 * const annotation = createMockAnnotation({ intent: 'clarification-request', status: 'open' });
 */
export function createMockAnnotation(
  overrides?: Partial<IFieldAnnotation>
): IFieldAnnotation {
  return {
    annotationId: 'mock-annotation-001',
    recordType: 'bd-scorecard',
    recordId: 'mock-record-001',
    fieldKey: 'totalBuildableArea',
    fieldLabel: 'Total Buildable Area',
    intent: 'comment',
    status: 'open',
    author: {
      userId: 'mock-author-001',
      displayName: 'Mock Author',
      role: 'Estimator',
    },
    assignedTo: null,
    body: 'Mock annotation body text.',
    createdAt: '2026-03-09T14:00:00Z',
    createdAtVersion: null,
    resolvedAt: null,
    resolvedBy: null,
    resolutionNote: null,
    resolvedAtVersion: null,
    replies: [],
    ...overrides,
  };
}

export { createMockAnnotationReply };
