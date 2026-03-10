import type { IFieldAnnotation } from '../src/types/IFieldAnnotation';
import { createMockAnnotation } from './createMockAnnotation';
import { createMockAnnotationReply } from './createMockAnnotationReply';

/**
 * Six canonical annotation states for consistent testing (D-10).
 * Each state represents a distinct UI rendering scenario across all three components.
 */
export const mockAnnotationStates: Record<string, IFieldAnnotation[]> = {
  /** No annotations on the field — marker hidden */
  empty: [],

  /** Single open comment — blue dot */
  openComment: [
    createMockAnnotation({
      annotationId: 'state-comment-001',
      intent: 'comment',
      status: 'open',
      body: 'This value looks lower than last quarter.',
    }),
  ],

  /** Single open clarification-request — red dot, blocks BIC */
  openClarification: [
    createMockAnnotation({
      annotationId: 'state-clarification-001',
      intent: 'clarification-request',
      status: 'open',
      body: 'Can you clarify the source of this number?',
      assignedTo: {
        userId: 'mock-assignee-001',
        displayName: 'Jane Smith',
        role: 'Accounting Manager',
      },
    }),
  ],

  /** Single open flag-for-revision — amber dot, blocks BIC */
  openRevisionFlag: [
    createMockAnnotation({
      annotationId: 'state-revision-001',
      intent: 'flag-for-revision',
      status: 'open',
      body: 'This figure needs to be updated per the latest estimate.',
    }),
  ],

  /** Single resolved annotation — grey dot with checkmark */
  resolved: [
    createMockAnnotation({
      annotationId: 'state-resolved-001',
      intent: 'clarification-request',
      status: 'resolved',
      body: 'What was the basis for this estimate?',
      resolvedAt: '2026-03-09T16:00:00Z',
      resolvedBy: {
        userId: 'mock-resolver-001',
        displayName: 'Bob Resolver',
        role: 'Director',
      },
      resolutionNote: 'Updated with the revised estimate per meeting notes.',
      replies: [
        createMockAnnotationReply({
          replyId: 'state-reply-001',
          body: 'Based on the 2026 Q1 projections.',
        }),
      ],
    }),
  ],

  /** Mixed: 1 open clarification + 1 open comment + 1 resolved — red dot (highest priority) */
  mixed: [
    createMockAnnotation({
      annotationId: 'state-mixed-clarification',
      intent: 'clarification-request',
      status: 'open',
      body: 'Please verify these numbers with accounting.',
    }),
    createMockAnnotation({
      annotationId: 'state-mixed-comment',
      intent: 'comment',
      status: 'open',
      fieldKey: 'estimatedGMP',
      fieldLabel: 'Estimated GMP',
      body: 'Looks good but double-check units.',
    }),
    createMockAnnotation({
      annotationId: 'state-mixed-resolved',
      intent: 'flag-for-revision',
      status: 'resolved',
      body: 'Previously flagged — now addressed.',
      resolvedAt: '2026-03-08T10:00:00Z',
      resolvedBy: {
        userId: 'mock-resolver-002',
        displayName: 'Alice',
        role: 'VP',
      },
      resolutionNote: 'Fixed.',
    }),
  ],
};
