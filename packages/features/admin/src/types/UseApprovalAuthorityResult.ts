import type { IApprovalAuthorityRule } from './IApprovalAuthorityRule.js';
import type { IApprovalEligibilityResult } from './IApprovalEligibilityResult.js';
import type { ApprovalContext } from './ApprovalContext.js';

/**
 * Return type for the useApprovalAuthority hook.
 *
 * @design D-05, D-06
 */
export interface UseApprovalAuthorityResult {
  readonly rules: readonly IApprovalAuthorityRule[];
  readonly ruleByContext: (context: ApprovalContext) => IApprovalAuthorityRule | undefined;
  readonly upsertRule: (rule: IApprovalAuthorityRule) => Promise<void>;
  readonly deleteRule: (ruleId: string) => Promise<void>;
  readonly testEligibility: (context: ApprovalContext, userId: string) => Promise<IApprovalEligibilityResult>;
  readonly isLoading: boolean;
  readonly error: Error | null;
}
