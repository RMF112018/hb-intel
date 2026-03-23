import type { IBaselineRecord } from '../src/schedule/types/index.js';

export const createMockBaselineRecord = (
  overrides?: Partial<IBaselineRecord>,
): IBaselineRecord => ({
  baselineId: 'bl-001',
  projectId: 'proj-001',
  baselineLabel: 'Contract Baseline',
  baselineType: 'ContractBaseline',
  sourceVersionId: 'ver-001',
  dataDate: '2026-01-15',
  approvedBy: 'pe-user-001',
  approvedAt: '2026-01-16T14:00:00Z',
  approvalBasis: 'NTP issued',
  causationCode: null,
  isPrimary: true,
  supersededAt: null,
  supersededBy: null,
  ...overrides,
});
