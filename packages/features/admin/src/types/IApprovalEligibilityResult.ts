import type { ApprovalContext } from './ApprovalContext.js';

/**
 * Result of testing whether a user is eligible to approve in a given context.
 *
 * @design D-06
 */
export interface IApprovalEligibilityResult {
  readonly approvalContext: ApprovalContext;
  readonly userId: string;
  readonly eligible: boolean;
  readonly matchedBy: 'direct-user' | 'group-membership' | 'none';
}
