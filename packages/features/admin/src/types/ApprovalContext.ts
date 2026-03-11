/**
 * Contexts in which approval authority rules apply.
 *
 * @design D-05, D-06
 */
export type ApprovalContext =
  | 'bd-scorecard-director-review'
  | 'living-strategic-intelligence-contribution'
  | 'provisioning-task-completion'
  | 'handoff-package-acknowledgment';
