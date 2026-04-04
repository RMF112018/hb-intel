/**
 * SafetyConfirmationDialog — Phase 11 risk-tier-aware confirmation.
 *
 * Composes HbcModal with safety context: risk badge, scope summary,
 * and typed acknowledgment for enhanced confirmation.
 *
 * @design P11-06
 */
import * as React from 'react';
import { useState } from 'react';
import {
  HbcModal,
  HbcRiskBadge,
  HbcScopeSummaryCard,
  HbcButton,
  HbcBanner,
} from '@hbc/ui-kit';
import type {
  IAdminSafetyProfile,
  IAdminExecutionScope,
} from '@hbc/models/admin-control-plane';

export interface SafetyConfirmationDialogProps {
  /** Whether the dialog is open */
  readonly open: boolean;
  /** Safety profile for the action */
  readonly profile: IAdminSafetyProfile;
  /** Execution scope */
  readonly scope: IAdminExecutionScope;
  /** Typed acknowledgment phrase required for enhanced confirmation */
  readonly acknowledgmentPhrase?: string;
  /** Callback when operator confirms */
  readonly onConfirm: (acknowledgment: string) => void;
  /** Callback when operator cancels */
  readonly onCancel: () => void;
  /** Whether the confirm action is loading */
  readonly loading?: boolean;
}

export const SafetyConfirmationDialog: React.FC<SafetyConfirmationDialogProps> = ({
  open,
  profile,
  scope,
  acknowledgmentPhrase,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const [typedAcknowledgment, setTypedAcknowledgment] = useState('');
  const isEnhanced = profile.confirmationType === 'enhanced';
  const phrase = acknowledgmentPhrase ?? 'CONFIRM';
  const canConfirm = isEnhanced ? typedAcknowledgment === phrase : true;

  const riskLevel = profile.riskLevel as 'read-only' | 'low' | 'moderate' | 'high' | 'critical';
  const scopeForCard = {
    domain: scope.domain,
    targetEntityId: scope.targetEntityId,
    targetEntityLabel: scope.targetEntityLabel,
    affectedResourceCount: scope.affectedResourceCount,
    scopeDescription: scope.scopeDescription,
  };

  const isHighRisk = riskLevel === 'high' || riskLevel === 'critical';

  if (!open) return null;

  return (
    <HbcModal
      open={open}
      onClose={onCancel}
      title="Confirm Action"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {isHighRisk && (
          <HbcBanner variant="error">
            This is a {riskLevel}-risk action. Review the scope carefully before confirming.
          </HbcBanner>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HbcRiskBadge riskLevel={riskLevel} />
          <span style={{ fontSize: '13px', opacity: 0.8 }}>{profile.scopeDescription}</span>
        </div>

        <HbcScopeSummaryCard scope={scopeForCard} riskLevel={riskLevel} />

        {isEnhanced && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label
              htmlFor="safety-ack-input"
              style={{ fontSize: '12px', fontWeight: 600 }}
            >
              Type &ldquo;{phrase}&rdquo; to confirm:
            </label>
            <input
              id="safety-ack-input"
              type="text"
              value={typedAcknowledgment}
              onChange={(e) => setTypedAcknowledgment(e.target.value)}
              placeholder={phrase}
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
        )}

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <HbcButton variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </HbcButton>
          <HbcButton
            variant={isHighRisk ? 'danger' : 'primary'}
            onClick={() => onConfirm(isEnhanced ? typedAcknowledgment : 'confirm')}
            disabled={!canConfirm || loading}
            loading={loading}
          >
            {isHighRisk ? 'Confirm Destructive Action' : 'Confirm'}
          </HbcButton>
        </div>
      </div>
    </HbcModal>
  );
};
