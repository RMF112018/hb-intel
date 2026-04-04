/**
 * HbcSafetyBanner — Phase 11 risk-aware action warning banner.
 *
 * Full-width banner that communicates the risk level of an admin action
 * with structured warning list. Non-dismissible for high/critical actions.
 */
import * as React from 'react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';
import type { HbcSafetyBannerProps, SafetyWarningItem } from './types.js';
import type { RiskLevel } from '../HbcRiskBadge/types.js';
import { HbcRiskBadge } from '../HbcRiskBadge/index.js';
import {
  HBC_STATUS_COLORS,
  HBC_STATUS_RAMP_RED,
  HBC_STATUS_RAMP_AMBER,
  HBC_STATUS_RAMP_INFO,
  HBC_STATUS_RAMP_GREEN,
  body,
  keyframes,
} from '../theme/index.js';
import { useHbcTheme } from '../theme/useHbcTheme.js';
import { HBC_SPACE_MD } from '../theme/grid.js';
import { Cancel, StatusAttentionIcon, StatusOverdueIcon, StatusInfoIcon } from '../icons/index.js';

export type { HbcSafetyBannerProps, SafetyWarningItem } from './types.js';

/* ── colour mapping ─────────────────────────────────────────── */
const RISK_BANNER_RAMP: Record<RiskLevel, { bg: string; text: string; accent: string }> = {
  'read-only': { bg: HBC_STATUS_RAMP_INFO['90'],  text: HBC_STATUS_RAMP_INFO['10'],  accent: HBC_STATUS_COLORS.info },
  low:         { bg: HBC_STATUS_RAMP_GREEN['90'], text: HBC_STATUS_RAMP_GREEN['10'], accent: HBC_STATUS_COLORS.success },
  moderate:    { bg: HBC_STATUS_RAMP_AMBER['90'], text: HBC_STATUS_RAMP_AMBER['10'], accent: HBC_STATUS_COLORS.warning },
  high:        { bg: HBC_STATUS_RAMP_RED['90'],   text: HBC_STATUS_RAMP_RED['10'],   accent: HBC_STATUS_COLORS.error },
  critical:    { bg: HBC_STATUS_RAMP_RED['90'],   text: HBC_STATUS_RAMP_RED['10'],   accent: '#991B1B' },
};

const FIELD_RISK_BANNER_RAMP: Record<RiskLevel, { bg: string; text: string; accent: string }> = {
  'read-only': { bg: 'rgba(59,130,246,0.12)',  text: '#93C5FD', accent: '#60A5FA' },
  low:         { bg: 'rgba(34,197,94,0.12)',   text: '#86EFAC', accent: '#22C55E' },
  moderate:    { bg: 'rgba(251,191,36,0.12)',  text: '#FDE68A', accent: '#FBBF24' },
  high:        { bg: 'rgba(239,68,68,0.12)',   text: '#FCA5A5', accent: '#EF4444' },
  critical:    { bg: 'rgba(153,27,27,0.25)',   text: '#FCA5A5', accent: '#DC2626' },
};

const SEVERITY_ICONS: Record<string, React.FC<{ size?: 'sm' | 'md' | 'lg'; color?: string }>> = {
  info: StatusInfoIcon,
  warning: StatusAttentionIcon,
  critical: StatusOverdueIcon,
};

/* ── styles ──────────────────────────────────────────────────── */
const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('8px'),
    ...shorthands.padding('12px', `${HBC_SPACE_MD}px`),
    ...shorthands.borderLeft('4px', 'solid', 'transparent'),
    width: '100%',
    animationName: keyframes.slideInUp as unknown as string,
    animationDuration: '250ms',
    animationTimingFunction: 'ease-out',
    animationFillMode: 'both',
    '@media (prefers-reduced-motion: reduce)': {
      animationDuration: '0ms',
    },
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
  },
  title: {
    ...body,
    fontWeight: 600,
    flexGrow: 1,
  },
  dismiss: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    ...shorthands.border('0px', 'none', 'transparent'),
    ...shorthands.borderRadius('4px'),
    ...shorthands.padding('0px'),
    opacity: 0.7,
    ':hover': { opacity: 1 },
  },
  warningList: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('4px'),
    ...shorthands.padding('0px'),
    ...shorthands.margin('0px'),
    listStyleType: 'none',
  },
  warningItem: {
    display: 'flex',
    alignItems: 'flex-start',
    ...shorthands.gap('6px'),
    fontSize: '13px',
    lineHeight: '18px',
  },
});

export const HbcSafetyBanner: React.FC<HbcSafetyBannerProps> = ({
  riskLevel,
  title,
  children,
  warnings,
  onDismiss,
  className,
}) => {
  const styles = useStyles();
  const { isFieldMode } = useHbcTheme();
  const ramp = isFieldMode ? FIELD_RISK_BANNER_RAMP[riskLevel] : RISK_BANNER_RAMP[riskLevel];
  const isHighRisk = riskLevel === 'high' || riskLevel === 'critical';
  const canDismiss = onDismiss && !isHighRisk;
  const role = isHighRisk ? 'alert' : 'status';
  const ariaLive = isHighRisk ? 'assertive' as const : 'polite' as const;

  return (
    <div
      data-hbc-ui="safety-banner"
      data-hbc-risk={riskLevel}
      role={role}
      aria-live={ariaLive}
      className={mergeClasses(styles.root, className)}
      style={{
        backgroundColor: ramp.bg,
        borderLeftColor: ramp.accent,
        color: ramp.text,
      }}
    >
      <div className={styles.header}>
        <HbcRiskBadge riskLevel={riskLevel} size="small" />
        <span className={styles.title}>{title}</span>
        {canDismiss && (
          <button
            type="button"
            className={styles.dismiss}
            onClick={onDismiss}
            aria-label="Dismiss"
            style={{ color: ramp.text }}
          >
            <Cancel size="sm" />
          </button>
        )}
      </div>
      {children}
      {warnings && warnings.length > 0 && (
        <ul className={styles.warningList}>
          {warnings.map((w, i) => {
            const WarnIcon = SEVERITY_ICONS[w.severity] ?? StatusInfoIcon;
            return (
              <li key={`${w.code}-${i}`} className={styles.warningItem}>
                <WarnIcon size="sm" color="currentColor" />
                <span>{w.message}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
