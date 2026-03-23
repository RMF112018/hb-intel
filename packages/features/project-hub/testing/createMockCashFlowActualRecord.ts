import type { ICashFlowActualRecord } from '../src/financial/types/index.js';

export const createMockCashFlowActualRecord = (
  overrides?: Partial<ICashFlowActualRecord>,
): ICashFlowActualRecord => {
  const base: ICashFlowActualRecord = {
    monthlyRecordId: 'cf-actual-001',
    forecastVersionId: 'ver-001',
    projectId: 'project-001',
    periodMonth: 1,
    calendarDate: '2026-01-01',
    recordType: 'Actual',
    inflowOwnerPayments: 500000,
    inflowOtherInflows: 25000,
    totalInflows: 525000,
    outflowSubcontractorPayments: 200000,
    outflowMaterialCosts: 100000,
    outflowLaborCosts: 80000,
    outflowOverhead: 30000,
    outflowEquipment: 15000,
    totalOutflows: 425000,
    netCashFlow: 100000,
    cumulativeCashFlow: 100000,
    workingCapital: null,
    retentionHeld: 52500,
    forecastAccuracy: null,
    recordedAt: '2026-02-01T00:00:00.000Z',
    notes: null,
  };

  return { ...base, ...overrides };
};
