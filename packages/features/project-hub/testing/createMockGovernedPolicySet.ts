import type { IGovernedPolicySet } from '../src/schedule/types/index.js';

export const createMockGovernedPolicySet = (
  overrides?: Partial<IGovernedPolicySet>,
): IGovernedPolicySet => ({
  policySetId: 'policy-001',
  projectId: 'proj-001',
  policyAreas: [
    { area: 'MilestoneStatusThresholds', description: 'AtRisk 14d, Delayed 30d' },
    { area: 'OverallStatusThresholds', description: 'AtRisk 7d, Delayed 21d' },
    { area: 'FloatNearCriticalThreshold', description: '40 hours' },
  ],
  policyVersionId: 'policy-v1',
  lastUpdatedBy: 'moe-user-001',
  lastUpdatedAt: '2026-03-01T00:00:00Z',
  ...overrides,
});
