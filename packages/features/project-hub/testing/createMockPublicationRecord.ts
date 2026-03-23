import type { IPublicationRecord } from '../src/schedule/types/index.js';

export const createMockPublicationRecord = (
  overrides?: Partial<IPublicationRecord>,
): IPublicationRecord => ({
  publicationId: 'pub-001',
  projectId: 'proj-001',
  publicationLabel: 'March 2026 Monthly Update',
  publicationType: 'MonthlyUpdate',
  sourceVersionId: 'ver-001',
  baselineId: 'bl-001',
  lifecycleStatus: 'Draft',
  initiatedBy: 'user-001',
  initiatedByRole: 'PM',
  submittedForReviewAt: null,
  reviewedBy: null,
  reviewedAt: null,
  publishedAt: null,
  supersededAt: null,
  supersededBy: null,
  reconciliationSummary: null,
  publishBasisNotes: null,
  autoPublishEligible: false,
  autoPublishedAt: null,
  blockers: [],
  confidenceRecordId: null,
  ...overrides,
});
