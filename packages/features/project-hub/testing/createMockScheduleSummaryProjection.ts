import type { IScheduleSummaryProjection } from '../src/schedule/types/index.js';

export const createMockScheduleSummaryProjection = (
  overrides?: Partial<IScheduleSummaryProjection>,
): IScheduleSummaryProjection => ({
  summaryId: 'summary-001',
  projectId: 'proj-001',
  sourcePublicationId: 'pub-001',
  computedAt: '2026-03-23T12:00:00Z',
  overallStatus: 'OnTrack',
  schedulePercentComplete: 45,
  contractCompletionDate: '2026-12-15',
  publishedCompletionDate: '2026-12-10',
  varianceDays: -5,
  criticalPathActivityCount: 12,
  nearCriticalActivityCount: 8,
  confidenceLabel: 'High',
  milestoneSummary: {
    total: 10,
    achieved: 3,
    onTrack: 4,
    atRisk: 2,
    delayed: 1,
    critical: 0,
    notStarted: 0,
  },
  nextMilestone: {
    milestoneName: 'Substantial Completion',
    publishedForecastDate: '2026-12-10',
    varianceDays: -5,
    status: 'OnTrack',
  },
  qualityGrade: null,
  ...overrides,
});
