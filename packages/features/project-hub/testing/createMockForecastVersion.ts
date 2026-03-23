import type { IForecastVersion } from '../src/financial/types/index.js';

export const createMockForecastVersion = (
  overrides?: Partial<IForecastVersion>,
): IForecastVersion => {
  const base: IForecastVersion = {
    forecastVersionId: 'ver-001',
    projectId: 'project-001',
    versionType: 'Working',
    versionNumber: 1,
    reportingMonth: null,
    derivedFromVersionId: null,
    derivationReason: 'InitialSetup',
    isReportCandidate: false,
    createdAt: '2026-03-23T12:00:00.000Z',
    createdBy: 'user-pm-001',
    confirmedAt: null,
    confirmedBy: null,
    publishedAt: null,
    publishedByRunId: null,
    staleBudgetLineCount: 0,
    checklistCompletedAt: null,
    notes: null,
  };

  return { ...base, ...overrides };
};
