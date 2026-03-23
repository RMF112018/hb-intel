import type { IForecastVersion } from '../src/financial/types/index.js';
import { createMockForecastVersion } from './createMockForecastVersion.js';

export const mockVersioningScenarios = {
  initialWorking: createMockForecastVersion(),

  confirmedVersion: createMockForecastVersion({
    forecastVersionId: 'ver-confirmed',
    versionType: 'ConfirmedInternal',
    versionNumber: 2,
    confirmedAt: '2026-03-23T14:00:00.000Z',
    confirmedBy: 'user-pm-001',
    checklistCompletedAt: '2026-03-23T14:00:00.000Z',
  }),

  reportCandidateVersion: createMockForecastVersion({
    forecastVersionId: 'ver-report-candidate',
    versionType: 'ConfirmedInternal',
    versionNumber: 3,
    isReportCandidate: true,
    confirmedAt: '2026-03-23T15:00:00.000Z',
    confirmedBy: 'user-pm-001',
    checklistCompletedAt: '2026-03-23T15:00:00.000Z',
  }),

  publishedVersion: createMockForecastVersion({
    forecastVersionId: 'ver-published',
    versionType: 'PublishedMonthly',
    versionNumber: 4,
    reportingMonth: '2026-03',
    isReportCandidate: false,
    confirmedAt: '2026-03-23T16:00:00.000Z',
    confirmedBy: 'user-pm-001',
    publishedAt: '2026-03-25T10:00:00.000Z',
    publishedByRunId: 'run-001',
    checklistCompletedAt: '2026-03-23T16:00:00.000Z',
  }),

  supersededVersion: createMockForecastVersion({
    forecastVersionId: 'ver-superseded',
    versionType: 'Superseded',
    versionNumber: 1,
  }),
} as const satisfies Record<string, IForecastVersion>;
