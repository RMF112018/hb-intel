import type { ILookAheadPlan } from '../src/schedule/types/index.js';

export const createMockLookAheadPlan = (
  overrides?: Partial<ILookAheadPlan>,
): ILookAheadPlan => ({
  lookAheadId: 'la-001',
  projectId: 'proj-001',
  windowStart: '2026-04-07',
  windowEnd: '2026-04-27',
  windowWeeks: 3,
  status: 'Draft',
  publishedBy: null,
  publishedAt: null,
  workPackageIds: ['wp-001', 'wp-002'],
  commitmentIds: ['fc-001', 'fc-002'],
  ppcNumerator: null,
  ppcDenominator: null,
  ppcPercent: null,
  createdBy: 'user-001',
  createdAt: '2026-04-06T08:00:00Z',
  ...overrides,
});
