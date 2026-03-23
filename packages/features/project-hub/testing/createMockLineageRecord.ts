import type { ILineageRecord } from '../src/constraints/lineage/types.js';

export const createMockLineageRecord = (
  overrides?: Partial<ILineageRecord>,
): ILineageRecord => ({
  lineageId: 'lin-001',
  projectId: 'proj-001',
  spawnAction: 'RiskToConstraint',
  parentLedger: 'Risk',
  parentRecordId: 'risk-005',
  parentRecordNumber: 'RISK-005',
  childLedger: 'Constraint',
  childRecordId: 'con-010',
  childRecordNumber: 'CON-010',
  spawnedAt: '2026-03-10T14:00:00Z',
  spawnedBy: 'user-001',
  inheritedFields: ['category', 'description', 'owner', 'bic', 'projectId'],
  inheritedValues: {
    category: 'SITE_CONDITIONS',
    description: 'Geotechnical uncertainty at Building A foundation',
    owner: 'user-002',
    bic: 'Project Management',
    projectId: 'proj-001',
  },
  ...overrides,
});
