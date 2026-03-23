import type { ICashFlowActualRecord, ICashFlowForecastRecord } from '../src/financial/types/index.js';
import { createMockCashFlowActualRecord } from './createMockCashFlowActualRecord.js';
import { createMockCashFlowForecastRecord } from './createMockCashFlowForecastRecord.js';

/** Three months of actual cash flow data — surplus scenario. */
export const surplusActualRecords: readonly ICashFlowActualRecord[] = [
  createMockCashFlowActualRecord({ monthlyRecordId: 'cf-a1', periodMonth: 1, calendarDate: '2026-01-01', netCashFlow: 100000, cumulativeCashFlow: 100000, totalInflows: 500000, totalOutflows: 400000 }),
  createMockCashFlowActualRecord({ monthlyRecordId: 'cf-a2', periodMonth: 2, calendarDate: '2026-02-01', netCashFlow: 50000, cumulativeCashFlow: 150000, totalInflows: 450000, totalOutflows: 400000 }),
  createMockCashFlowActualRecord({ monthlyRecordId: 'cf-a3', periodMonth: 3, calendarDate: '2026-03-01', netCashFlow: 75000, cumulativeCashFlow: 225000, totalInflows: 475000, totalOutflows: 400000 }),
];

/** Three months of forecast cash flow — continuing surplus. */
export const surplusForecastRecords: readonly ICashFlowForecastRecord[] = [
  createMockCashFlowForecastRecord({ monthlyRecordId: 'cf-f1', periodMonth: 4, calendarDate: '2026-04-01', projectedInflows: 480000, projectedOutflows: 420000, projectedNetCashFlow: 60000, projectedCumulativeCashFlow: 285000 }),
  createMockCashFlowForecastRecord({ monthlyRecordId: 'cf-f2', periodMonth: 5, calendarDate: '2026-05-01', projectedInflows: 460000, projectedOutflows: 410000, projectedNetCashFlow: 50000, projectedCumulativeCashFlow: 335000 }),
  createMockCashFlowForecastRecord({ monthlyRecordId: 'cf-f3', periodMonth: 6, calendarDate: '2026-06-01', projectedInflows: 440000, projectedOutflows: 400000, projectedNetCashFlow: 40000, projectedCumulativeCashFlow: 375000 }),
];

/** Deficit forecast scenario — negative projected months. */
export const deficitForecastRecords: readonly ICashFlowForecastRecord[] = [
  createMockCashFlowForecastRecord({ monthlyRecordId: 'cf-df1', periodMonth: 4, projectedInflows: 200000, projectedOutflows: 500000, projectedNetCashFlow: -300000, projectedCumulativeCashFlow: -75000 }),
  createMockCashFlowForecastRecord({ monthlyRecordId: 'cf-df2', periodMonth: 5, projectedInflows: 300000, projectedOutflows: 450000, projectedNetCashFlow: -150000, projectedCumulativeCashFlow: -225000 }),
  createMockCashFlowForecastRecord({ monthlyRecordId: 'cf-df3', periodMonth: 6, projectedInflows: 500000, projectedOutflows: 350000, projectedNetCashFlow: 150000, projectedCumulativeCashFlow: -75000 }),
];
