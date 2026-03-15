import type { FC } from 'react';
import { HbcSpinner, HbcBanner, HbcButton } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';
import type { IApprovalAuthorityRule } from '../types/IApprovalAuthorityRule.js';
import { useApprovalAuthority } from '../hooks/useApprovalAuthority.js';
import { formatAlertTimestamp } from './helpers.js';

const RULES_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'No approval rules configured',
    description: 'Approval authority rules will appear here once created.',
    coachingTip: 'Rules are not persisted in Wave 0. Configuration changes will be lost on page reload (SF17-T05).',
  }),
};

const RULES_EMPTY_CONTEXT: IEmptyStateContext = {
  module: 'admin',
  view: 'approval-rules',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'admin',
  isLoadError: false,
};

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
    return (
      <HbcSmartEmptyState
        config={RULES_EMPTY_CONFIG}
        context={RULES_EMPTY_CONTEXT}
        variant="inline"
      />
    );
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
