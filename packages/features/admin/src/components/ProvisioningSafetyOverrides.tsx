/**
 * ProvisioningSafetyOverrides — Phase 11 first-adopter safety compositions
 * for provisioning oversight actions.
 *
 * Wraps the existing provisioning actions (force retry, archive, state override)
 * with Phase 11 safety context: risk badges, safety banners, and risk-tier-aware
 * confirmation dialogs.
 *
 * @design P11-09
 */
import * as React from 'react';
import { useState } from 'react';
import {
  HbcModal,
  HbcButton,
  HbcBanner,
  HbcRiskBadge,
  HbcSafetyBanner,
  HbcScopeSummaryCard,
} from '@hbc/ui-kit';
import type { RiskLevel, SafetyWarningItem, ExecutionScope } from '@hbc/ui-kit';

// ─── Force Retry Confirmation ──────────────────────────────────────────────────

export interface ForceRetryConfirmationProps {
  readonly open: boolean;
  readonly projectNumber: string;
  readonly projectName: string;
  readonly retryCount: number;
  readonly retryCeiling: number;
  readonly failureClass?: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
  readonly loading?: boolean;
}

export const ForceRetryConfirmation: React.FC<ForceRetryConfirmationProps> = ({
  open,
  projectNumber,
  projectName,
  retryCount,
  retryCeiling,
  failureClass,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const attempt = retryCount + 1;
  const riskLevel: RiskLevel = 'moderate';

  const warnings: SafetyWarningItem[] = [];
  if (failureClass === 'structural' || failureClass === 'permissions') {
    warnings.push({
      severity: 'warning',
      code: 'non-idempotent-risk',
      message: `Force-retrying a ${failureClass} failure may produce duplicate partial state if the failed step was not idempotent.`,
      resource: projectNumber,
    });
  }
  if (attempt >= retryCeiling) {
    warnings.push({
      severity: 'critical',
      code: 'retry-ceiling-approaching',
      message: `This is retry attempt ${attempt} of ${retryCeiling}. Escalation will be required after this attempt.`,
      resource: null,
    });
  }

  const scope: ExecutionScope = {
    domain: 'provisioning-rollout',
    targetEntityId: projectNumber,
    targetEntityLabel: projectName,
    affectedResourceCount: 1,
    scopeDescription: `Retry provisioning for project ${projectNumber} from the last failed step.`,
  };

  if (!open) return null;

  return (
    <HbcModal open={open} onClose={onCancel} title="Force Retry">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <HbcSafetyBanner riskLevel={riskLevel} title="Elevated-risk action" warnings={warnings}>
          <span style={{ fontSize: '13px' }}>
            Retry attempt {attempt} of {retryCeiling}. Confirm only after investigating the failure cause.
          </span>
        </HbcSafetyBanner>

        <HbcScopeSummaryCard scope={scope} riskLevel={riskLevel} />

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <HbcButton variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </HbcButton>
          <HbcButton variant="danger" onClick={onConfirm} disabled={loading} loading={loading}>
            Force Retry
          </HbcButton>
        </div>
      </div>
    </HbcModal>
  );
};

// ─── Archive Confirmation ──────────────────────────────────────────────────────

export interface ArchiveConfirmationProps {
  readonly open: boolean;
  readonly projectNumber: string;
  readonly projectName: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
  readonly loading?: boolean;
}

export const ArchiveConfirmation: React.FC<ArchiveConfirmationProps> = ({
  open,
  projectNumber,
  projectName,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const riskLevel: RiskLevel = 'low';

  if (!open) return null;

  return (
    <HbcModal open={open} onClose={onCancel} title="Archive Failure">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HbcRiskBadge riskLevel={riskLevel} />
          <span style={{ fontSize: '13px' }}>
            Archive this failure? The request will be removed from the active failures queue.
          </span>
        </div>

        <div style={{ fontSize: '13px', opacity: 0.8 }}>
          <strong>Project:</strong> {projectNumber} — {projectName}
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <HbcButton variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </HbcButton>
          <HbcButton variant="primary" onClick={onConfirm} disabled={loading} loading={loading}>
            Archive
          </HbcButton>
        </div>
      </div>
    </HbcModal>
  );
};

// ─── State Override Confirmation ────────────────────────────────────────────────

export interface StateOverrideConfirmationProps {
  readonly open: boolean;
  readonly projectNumber: string;
  readonly projectName: string;
  readonly currentState: string;
  readonly targetState: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
  readonly loading?: boolean;
}

export const StateOverrideConfirmation: React.FC<StateOverrideConfirmationProps> = ({
  open,
  projectNumber,
  projectName,
  currentState,
  targetState,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const [typedAcknowledgment, setTypedAcknowledgment] = useState('');
  const riskLevel: RiskLevel = 'high';
  const expectedPhrase = 'OVERRIDE';
  const canConfirm = typedAcknowledgment === expectedPhrase;

  const warnings: SafetyWarningItem[] = [
    {
      severity: 'critical',
      code: 'state-consistency-risk',
      message: 'Manual state override bypasses the saga workflow. This may cause data inconsistency if steps have partially completed.',
      resource: projectNumber,
    },
    {
      severity: 'warning',
      code: 'no-automatic-rollback',
      message: 'This action cannot be automatically reversed. Recovery requires manual investigation.',
      resource: null,
    },
  ];

  const scope: ExecutionScope = {
    domain: 'provisioning-rollout',
    targetEntityId: projectNumber,
    targetEntityLabel: projectName,
    affectedResourceCount: 1,
    scopeDescription: `Override provisioning state from "${currentState}" to "${targetState}" for project ${projectNumber}.`,
  };

  if (!open) return null;

  return (
    <HbcModal open={open} onClose={onCancel} title="Manual State Override">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <HbcSafetyBanner riskLevel={riskLevel} title="Destructive action — last-resort recovery" warnings={warnings} />

        <HbcScopeSummaryCard scope={scope} riskLevel={riskLevel} />

        <HbcBanner variant="warning">
          State transition: <strong>{currentState}</strong> → <strong>{targetState}</strong>
        </HbcBanner>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label
            htmlFor="override-ack-input"
            style={{ fontSize: '12px', fontWeight: 600 }}
          >
            Type &ldquo;{expectedPhrase}&rdquo; to confirm:
          </label>
          <input
            id="override-ack-input"
            type="text"
            value={typedAcknowledgment}
            onChange={(e) => setTypedAcknowledgment(e.target.value)}
            placeholder={expectedPhrase}
            autoComplete="off"
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid rgba(0,0,0,0.2)',
              fontSize: '14px',
              fontFamily: 'monospace',
            }}
            aria-required="true"
          />
          {typedAcknowledgment.length > 0 && !canConfirm && (
            <span style={{ fontSize: '11px', color: '#DC2626' }}>
              Typed text does not match the required phrase.
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <HbcButton variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </HbcButton>
          <HbcButton
            variant="danger"
            onClick={onConfirm}
            disabled={!canConfirm || loading}
            loading={loading}
          >
            Override State
          </HbcButton>
        </div>
      </div>
    </HbcModal>
  );
};
