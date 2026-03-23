import type { ICashFlowForecastRecord } from '../src/financial/types/index.js';

export const createMockCashFlowForecastRecord = (
  overrides?: Partial<ICashFlowForecastRecord>,
): ICashFlowForecastRecord => {
  const base: ICashFlowForecastRecord = {
    monthlyRecordId: 'cf-forecast-001',
    forecastVersionId: 'ver-001',
    projectId: 'project-001',
    periodMonth: 14,
    calendarDate: '2027-02-01',
    recordType: 'Forecast',
    projectedInflows: 450000,
    projectedOutflows: 400000,
    projectedNetCashFlow: 50000,
    projectedCumulativeCashFlow: 150000,
    confidenceScore: 80,
    notes: null,
    lastEditedBy: null,
    lastEditedAt: null,
  };

  return { ...base, ...overrides };
};
