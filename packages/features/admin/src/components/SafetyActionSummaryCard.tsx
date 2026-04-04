/**
 * SafetyActionSummaryCard — Phase 11 action overview.
 *
 * Displays action key, domain, risk level, execution mode, and
 * required controls summary from a safety profile.
 *
 * @design P11-06
 */
import * as React from 'react';
import { HbcRiskBadge, HbcStatusBadge } from '@hbc/ui-kit';
import type { IAdminSafetyProfile } from '@hbc/models/admin-control-plane';

export interface SafetyActionSummaryCardProps {
  /** Safety profile for the action */
  readonly profile: IAdminSafetyProfile;
  /** Additional CSS class */
  readonly className?: string;
}

const MODE_LABELS: Record<string, string> = {
  seamless: 'Seamless',
  checkpointed: 'Checkpointed',
  destructive: 'Destructive',
  advisory: 'Advisory',
};

const MODE_VARIANTS: Record<string, 'info' | 'warning' | 'error' | 'neutral'> = {
  seamless: 'info',
  checkpointed: 'warning',
  destructive: 'error',
  advisory: 'neutral',
};

export const SafetyActionSummaryCard: React.FC<SafetyActionSummaryCardProps> = ({
  profile,
  className,
}) => {
  const riskLevel = profile.riskLevel as 'read-only' | 'low' | 'moderate' | 'high' | 'critical';
  const modeLabel = MODE_LABELS[profile.executionMode] ?? profile.executionMode;
  const modeVariant = MODE_VARIANTS[profile.executionMode] ?? 'neutral';

  return (
    <div
      data-hbc-ui="safety-action-summary-card"
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid rgba(0,0,0,0.08)',
        backgroundColor: 'rgba(0,0,0,0.02)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'monospace' }}>
          {profile.actionKey}
        </span>
        <HbcRiskBadge riskLevel={riskLevel} size="small" />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '12px', opacity: 0.6 }}>Domain:</span>
        <span style={{ fontSize: '12px' }}>{profile.domain}</span>
        <span style={{ fontSize: '12px', opacity: 0.6, marginLeft: '8px' }}>Mode:</span>
        <HbcStatusBadge variant={modeVariant} label={modeLabel} size="small" />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.6 }}>
          Controls:
        </span>
        {profile.requiredControls.map((control) => (
          <span
            key={control}
            style={{
              fontSize: '11px',
              padding: '1px 6px',
              borderRadius: '3px',
              backgroundColor: 'rgba(0,0,0,0.05)',
            }}
          >
            {control}
          </span>
        ))}
      </div>

      {profile.scopeDescription && (
        <div style={{ fontSize: '12px', opacity: 0.8 }}>
          {profile.scopeDescription}
        </div>
      )}
    </div>
  );
};
