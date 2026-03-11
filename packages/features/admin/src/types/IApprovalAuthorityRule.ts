import type { ApprovalContext } from './ApprovalContext.js';

/**
 * Represents an approval authority rule governing provisioning workflows.
 *
 * @design D-05, D-06, SF17-T02
 */
export interface IApprovalAuthorityRule {
  readonly ruleId: string;
  readonly approvalContext: ApprovalContext;
  readonly approverUserIds: readonly string[];
  readonly approverGroupIds: readonly string[];
  readonly approvalMode: 'any' | 'all';
  readonly lastModifiedBy: string;
  readonly lastModifiedAt: string;
}
