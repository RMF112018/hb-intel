import type { FC } from 'react';
import { HbcSpinner, HbcBanner, HbcButton } from '@hbc/ui-kit';
import type { IApprovalAuthorityRule } from '../types/IApprovalAuthorityRule.js';
import { useApprovalAuthority } from '../hooks/useApprovalAuthority.js';
import { formatAlertTimestamp } from './helpers.js';

export interface ApprovalAuthorityTableProps {
  readonly onEditRule: (rule: IApprovalAuthorityRule) => void;
}

/**
 * Table component for displaying approval authority rules.
 *
 * @design D-05, D-06, SF17-T06
 */
export const ApprovalAuthorityTable: FC<ApprovalAuthorityTableProps> = ({ onEditRule }) => {
  const { rules, isLoading, error } = useApprovalAuthority();

  if (isLoading) {
    return (
      <div role="status" aria-label="Loading approval rules">
        <HbcSpinner label="Loading approval rules…" />
      </div>
    );
  }

  if (error) {
    return (
      <HbcBanner variant="error">
        Failed to load approval rules: {error.message}
      </HbcBanner>
    );
  }

  if (rules.length === 0) {
    return <p>No approval rules configured.</p>;
  }

  return (
    <table role="table" aria-label="Approval authority rules">
      <thead>
        <tr>
          <th>Context</th>
          <th>Approver Users</th>
          <th>Approver Groups</th>
          <th>Mode</th>
          <th>Modified By</th>
          <th>Modified At</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {rules.map((rule) => (
          <tr key={rule.ruleId} aria-label={`Rule: ${rule.approvalContext}`}>
            <td>{rule.approvalContext}</td>
            <td>{rule.approverUserIds.join(', ')}</td>
            <td>{rule.approverGroupIds.join(', ')}</td>
            <td>{rule.approvalMode}</td>
            <td>{rule.lastModifiedBy}</td>
            <td>{formatAlertTimestamp(rule.lastModifiedAt)}</td>
            <td>
              <HbcButton
                variant="secondary"
                size="sm"
                onClick={() => onEditRule(rule)}
                aria-label={`Edit rule: ${rule.approvalContext}`}
              >
                Edit
              </HbcButton>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
