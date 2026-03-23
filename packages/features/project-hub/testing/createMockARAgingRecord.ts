import type { IARAgingRecord } from '../src/financial/types/index.js';

export const createMockARAgingRecord = (
  overrides?: Partial<IARAgingRecord>,
): IARAgingRecord => {
  const base: IARAgingRecord = {
    arAgeId: 'ar-001',
    projectId: 'project-001',
    projectName: 'Main Street Tower',
    projectManager: 'John Smith',
    percentComplete: 45.5,
    balanceToFinish: 5500000,
    retainage: 525000,
    totalAR: 750000,
    current0To30: 400000,
    current30To60: 200000,
    current60To90: 100000,
    current90Plus: 50000,
    comments: null,
    refreshedAt: '2026-03-23T06:00:00.000Z',
  };

  return { ...base, ...overrides };
};
