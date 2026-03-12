import type { ApprovalContext } from '../types/ApprovalContext.js';
import type { IApprovalEligibilityResult } from '../types/IApprovalEligibilityResult.js';
import type { IApprovalAuthorityRule } from '../types/IApprovalAuthorityRule.js';
import { ApprovalAuthorityApi } from '../api/ApprovalAuthorityApi.js';
import { resolveEligibility } from '../hooks/helpers.js';

/**
 * Acknowledgment / approval-party integration adapter.
 *
 * Defines the contract for resolving approval parties without
 * importing @hbc/acknowledgment directly.
 *
 * @design D-05, D-06, SF17-T07
 */

/** Resolution result for approval parties in a given context. */
export interface IApprovalPartyResolution {
  readonly context: ApprovalContext;
  readonly userId: string;
  readonly eligibility: IApprovalEligibilityResult;
  readonly resolvedAt: string;
}

/** Adapter interface for acknowledgment approval resolution. */
export interface IAcknowledgmentApprovalAdapter {
  /** Resolve approval parties for a user in a given context. */
  resolveApprovalParties(context: ApprovalContext, userId: string): Promise<IApprovalPartyResolution>;
}

/**
 * Reference implementation using ApprovalAuthorityApi and resolveEligibility.
 */
export class ReferenceAcknowledgmentAdapter implements IAcknowledgmentApprovalAdapter {
  private readonly api: ApprovalAuthorityApi;

  constructor(api?: ApprovalAuthorityApi) {
    this.api = api ?? new ApprovalAuthorityApi();
  }

  async resolveApprovalParties(
    context: ApprovalContext,
    userId: string,
  ): Promise<IApprovalPartyResolution> {
    const rules: readonly IApprovalAuthorityRule[] = await this.api.getRules();
    const eligibility = resolveEligibility(rules, context, userId);
    return {
      context,
      userId,
      eligibility,
      resolvedAt: new Date().toISOString(),
    };
  }
}
