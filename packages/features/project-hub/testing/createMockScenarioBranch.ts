import type { IScenarioBranch } from '../src/schedule/types/index.js';

export const createMockScenarioBranch = (
  overrides?: Partial<IScenarioBranch>,
): IScenarioBranch => ({
  scenarioId: 'scenario-001',
  projectId: 'proj-001',
  scenarioName: 'Recovery Schedule — Weather Delay',
  scenarioType: 'RecoverySchedule',
  status: 'Draft',
  branchFromVersionId: 'ver-001',
  branchFromBaselineId: 'bl-001',
  assumptionSet: 'Assumes 6-day work weeks starting May 2026',
  scenarioNotes: null,
  createdBy: 'user-001',
  createdAt: '2026-03-20T09:00:00Z',
  reviewedBy: null,
  reviewedAt: null,
  promotionDisposition: 'None',
  promotedAt: null,
  promotedBy: null,
  ...overrides,
});
