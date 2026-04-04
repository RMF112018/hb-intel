/**
 * PostRunValidationPanel — Phase 11 post-run validation results.
 *
 * Displays validation check results with accept/reject actions.
 *
 * @design P11-06
 */
import * as React from 'react';
import { HbcStatusBadge, HbcBanner, HbcButton } from '@hbc/ui-kit';
import type { IAdminPostRunValidationSummary } from '@hbc/models/admin-control-plane';

export interface PostRunValidationPanelProps {
  /** Validation summary from the backend */
  readonly validation: IAdminPostRunValidationSummary;
  /** Callback when operator accepts the outcome */
  readonly onAccept?: () => void;
  /** Callback when operator rejects the outcome */
  readonly onReject?: () => void;
}

export const PostRunValidationPanel: React.FC<PostRunValidationPanelProps> = ({
  validation,
  onAccept,
  onReject,
}) => {
  const allPassed = validation.checks.every(c => c.passed);
  const failedCount = validation.checks.filter(c => !c.passed).length;

  return (
    <div
      data-hbc-ui="post-run-validation-panel"
      role="region"
      aria-label="Post-run validation results"
      style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
    >
      <HbcBanner variant={allPassed ? 'success' : 'warning'}>
        {allPassed
          ? 'All post-run validation checks passed.'
          : `${failedCount} of ${validation.checks.length} validation check${failedCount !== 1 ? 's' : ''} failed.`}
      </HbcBanner>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {validation.checks.map((check) => (
          <div
            key={check.checkId}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '4px',
              backgroundColor: 'rgba(0,0,0,0.02)',
            }}
          >
            <HbcStatusBadge
              variant={check.passed ? 'success' : 'error'}
              label={check.passed ? 'Pass' : 'Fail'}
              size="small"
            />
            <div style={{ flexGrow: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>{check.label}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>{check.message}</div>
            </div>
          </div>
        ))}
      </div>

      {validation.comment && (
        <div style={{ fontSize: '13px', fontStyle: 'italic', opacity: 0.8, padding: '8px 12px' }}>
          {validation.comment}
        </div>
      )}

      {(onAccept || onReject) && (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          {onReject && (
            <HbcButton variant="secondary" onClick={onReject}>
              Reject Outcome
            </HbcButton>
          )}
          {onAccept && (
            <HbcButton variant="primary" onClick={onAccept}>
              Accept Outcome
            </HbcButton>
          )}
        </div>
      )}
    </div>
  );
};
