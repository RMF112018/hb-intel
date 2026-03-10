import type { IAnnotationReply } from '../src/types/IFieldAnnotation';

/**
 * Creates a mock IAnnotationReply with sensible defaults (D-10).
 * Override any field as needed for specific test scenarios.
 */
export function createMockAnnotationReply(
  overrides?: Partial<IAnnotationReply>
): IAnnotationReply {
  return {
    replyId: 'mock-reply-001',
    author: {
      userId: 'mock-replier-001',
      displayName: 'Mock Replier',
      role: 'Project Manager',
    },
    body: 'Mock reply body text.',
    createdAt: '2026-03-09T14:30:00Z',
    ...overrides,
  };
}
