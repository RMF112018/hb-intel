import type { UseApprovalAuthorityResult } from '../types/UseApprovalAuthorityResult.js';

/**
 * Hook for managing approval authority rules.
 *
 * @placeholder SF17-T02 contract — implementation in SF17-T04
 */
export function useApprovalAuthority(): UseApprovalAuthorityResult {
  return {
    rules: [],
    ruleByContext: () => undefined,
    upsertRule: async () => {},
    deleteRule: async () => {},
    testEligibility: async () => ({ approvalContext: 'provisioning-task-completion', userId: '', eligible: false, matchedBy: 'none' }),
    isLoading: false,
    error: null,
  };
}
