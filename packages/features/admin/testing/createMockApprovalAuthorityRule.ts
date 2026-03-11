import type { IApprovalAuthorityRule } from '../src/types/IApprovalAuthorityRule.js';

/**
 * Factory for creating mock approval authority rules in tests.
 */
export function createMockApprovalAuthorityRule(overrides?: Partial<IApprovalAuthorityRule>): IApprovalAuthorityRule {
  return {
    ruleId: 'rule-001',
    approvalContext: 'provisioning-task-completion',
    approverUserIds: ['user-001'],
    approverGroupIds: ['group-001'],
    approvalMode: 'any',
    lastModifiedBy: 'admin-001',
    lastModifiedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}
