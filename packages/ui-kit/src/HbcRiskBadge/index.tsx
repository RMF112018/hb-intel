/**
 * HbcRiskBadge — Phase 11 risk-tier indicator badge.
 *
 * Displays a colored badge indicating the risk level of an admin action.
 * Uses dual-channel signaling (color + icon shape) for accessibility.
 */
import * as React from 'react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';
import type { RiskLevel, HbcRiskBadgeProps } from './types.js';
import {
  HBC_STATUS_COLORS,
} from '../theme/index.js';
import { useHbcTheme } from '../theme/useHbcTheme.js';
import {
  StatusInfoIcon,
  StatusCompleteIcon,
  StatusAttentionIcon,
  StatusOverdueIcon,
} from '../icons/index.js';

export type { HbcRiskBadgeProps, RiskLevel } from './types.js';

/* ── colour mapping ─────────────────────────────────────────── */
const RISK_COLORS: Record<RiskLevel, { bg: string; text: string; border: string }> = {
  'read-only': { bg: '#F3F4F6', text: '#6B7280', border: '#D1D5DB' },
  low:         { bg: '#ECFDF5', text: '#065F46', border: HBC_STATUS_COLORS.success },
  moderate:    { bg: '#FFF7ED', text: '#9A3412', border: HBC_STATUS_COLORS.warning },
  high:        { bg: '#FEF2F2', text: '#991B1B', border: HBC_STATUS_COLORS.error },
  critical:    { bg: '#FEF2F2', text: '#FFFFFF', border: '#991B1B' },
};

const FIELD_RISK_COLORS: Record<RiskLevel, { bg: string; text: string; border: string }> = {
  'read-only': { bg: 'rgba(156,163,175,0.12)', text: '#9CA3AF', border: '#6B7280' },
  low:         { bg: 'rgba(34,197,94,0.12)',   text: '#86EFAC', border: '#22C55E' },
  moderate:    { bg: 'rgba(251,191,36,0.12)',  text: '#FDE68A', border: '#FBBF24' },
  high:        { bg: 'rgba(239,68,68,0.12)',   text: '#FCA5A5', border: '#EF4444' },
  critical:    { bg: 'rgba(153,27,27,0.25)',   text: '#FCA5A5', border: '#DC2626' },
};

const RISK_ICON: Record<RiskLevel, React.FC<{ size?: 'sm' | 'md' | 'lg'; color?: string }>> = {
  'read-only': StatusInfoIcon,
  low:         StatusCompleteIcon,
  moderate:    StatusAttentionIcon,
  high:        StatusOverdueIcon,
  critical:    StatusOverdueIcon,
};

const RISK_LABELS: Record<RiskLevel, string> = {
  'read-only': 'Read-only',
  low:         'Routine',
  moderate:    'Elevated',
  high:        'Destructive',
  critical:    'Tenant-sensitive',
};

/* ── styles ──────────────────────────────────────────────────── */
const useStyles = makeStyles({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    ...shorthands.gap('6px'),
    ...shorthands.borderRadius('4px'),
    ...shorthands.border('1px', 'solid', 'transparent'),
    fontWeight: 600,
    whiteSpace: 'nowrap',
    '@media (forced-colors: active)': {
      ...shorthands.border('1px', 'solid', 'ButtonText'),
    },
  },
  small: {
    ...shorthands.padding('2px', '8px'),
    fontSize: '11px',
    lineHeight: '16px',
  },
  medium: {
    ...shorthands.padding('4px', '10px'),
    fontSize: '12px',
    lineHeight: '18px',
  },
  critical: {
    fontWeight: 700,
  },
});

export const HbcRiskBadge: React.FC<HbcRiskBadgeProps> = ({
  riskLevel,
  label,
  size = 'medium',
  className,
}) => {
  const { isFieldMode } = useHbcTheme();
  const ramp = isFieldMode ? FIELD_RISK_COLORS[riskLevel] : RISK_COLORS[riskLevel];
  const Icon = RISK_ICON[riskLevel];
  const displayLabel = label ?? RISK_LABELS[riskLevel];

  return (
    <span
      data-hbc-ui="risk-badge"
      data-hbc-risk={riskLevel}
      aria-label={`Risk level: ${displayLabel}`}
      className={mergeClasses(
        useStyles().root,
        size === 'small' ? useStyles().small : useStyles().medium,
        riskLevel === 'critical' && useStyles().critical,
        className,
      )}
      style={{
        backgroundColor: ramp.bg,
        color: ramp.text,
        borderColor: ramp.border,
      }}
    >
      <Icon size="sm" color="currentColor" />
      {displayLabel}
    </span>
  );
};
