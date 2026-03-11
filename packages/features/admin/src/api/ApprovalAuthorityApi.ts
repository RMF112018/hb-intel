import type { IApprovalAuthorityRule } from '../types/IApprovalAuthorityRule.js';
import type { IApprovalEligibilityResult } from '../types/IApprovalEligibilityResult.js';
import type { ApprovalContext } from '../types/ApprovalContext.js';

/**
 * API client for approval authority rule management.
 *
 * @design D-05, D-06, SF17-T04
 */
export class ApprovalAuthorityApi {
  /** Fetch all approval authority rules. */
  async getRules(): Promise<readonly IApprovalAuthorityRule[]> {
    // Persistence implementation deferred to SF17-T05
    return [];
  }

  /** Create or update an approval authority rule. */
  async upsertRule(
    _rule: Omit<IApprovalAuthorityRule, 'ruleId' | 'lastModifiedBy' | 'lastModifiedAt'>,
  ): Promise<IApprovalAuthorityRule> {
    // Persistence implementation deferred to SF17-T05
    return {
      ruleId: `rule-${Date.now()}`,
      lastModifiedBy: 'system',
      lastModifiedAt: new Date().toISOString(),
      ..._rule,
    };
  }

  /** Delete an approval authority rule by ID. */
  async deleteRule(_ruleId: string): Promise<void> {
    // Persistence implementation deferred to SF17-T05
  }

  /** Test whether a user is eligible to approve in a given context. */
  async testEligibility(
    _context: ApprovalContext,
    _userId: string,
  ): Promise<IApprovalEligibilityResult> {
    // Persistence implementation deferred to SF17-T05
    return {
      approvalContext: _context,
      userId: _userId,
      eligible: false,
      matchedBy: 'none',
    };
  }
}
