/**
 * HbcBanner — Phase 4.9 Messaging & Feedback System
 * Reference: PH4.9-UI-Design-Plan.md §9
 *
 * Full-width status banner rendered in document flow (below header).
 * 4 variants: info | success | warning | error
 * Dismiss via onDismiss callback; omit for critical/non-dismissible.
 */
import * as React from 'react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';
import type { BannerVariant, HbcBannerProps } from './types.js';
import {
  HBC_STATUS_COLORS,
  HBC_STATUS_RAMP_GREEN,
  HBC_STATUS_RAMP_RED,
  HBC_STATUS_RAMP_AMBER,
  HBC_STATUS_RAMP_INFO,
  keyframes,
  TRANSITION_FAST,
  body,
} from '../theme/index.js';
import { useHbcTheme } from '../theme/useHbcTheme.js';
import { HBC_SPACE_MD } from '../theme/grid.js';
import {
  StatusInfoIcon,
  StatusCompleteIcon,
  StatusAttentionIcon,
  StatusOverdueIcon,
  Cancel,
} from '../icons/index.js';

/* ── colour mapping ─────────────────────────────────────────── */
const VARIANT_RAMP: Record<BannerVariant, { bg: string; text: string; accent: string }> = {
  info:    { bg: HBC_STATUS_RAMP_INFO['90'],  text: HBC_STATUS_RAMP_INFO['10'],  accent: HBC_STATUS_COLORS.info },
  success: { bg: HBC_STATUS_RAMP_GREEN['90'], text: HBC_STATUS_RAMP_GREEN['10'], accent: HBC_STATUS_COLORS.success },
  warning: { bg: HBC_STATUS_RAMP_AMBER['90'], text: HBC_STATUS_RAMP_AMBER['10'], accent: HBC_STATUS_COLORS.warning },
  error:   { bg: HBC_STATUS_RAMP_RED['90'],   text: HBC_STATUS_RAMP_RED['10'],   accent: HBC_STATUS_COLORS.error },
};

// UIF-028-addl: Dark-shell-compatible ramp for field/dark mode.
// Uses translucent tinted backgrounds with light text for readability on dark surfaces.
const FIELD_VARIANT_RAMP: Record<BannerVariant, { bg: string; text: string; accent: string }> = {
  info:    { bg: 'rgba(59,130,246,0.12)',  text: '#93C5FD', accent: '#60A5FA' },
  success: { bg: 'rgba(34,197,94,0.12)',   text: '#86EFAC', accent: '#22C55E' },
  warning: { bg: 'rgba(251,191,36,0.12)',  text: '#FDE68A', accent: '#FBBF24' },
  error:   { bg: 'rgba(239,68,68,0.12)',   text: '#FCA5A5', accent: '#EF4444' },
};

const VARIANT_ICON: Record<BannerVariant, React.FC<{ size?: 'sm' | 'md' | 'lg'; color?: string }>> = {
  info:    StatusInfoIcon,
  success: StatusCompleteIcon,
  warning: StatusAttentionIcon,
  error:   StatusOverdueIcon,
};

/* ── styles ──────────────────────────────────────────────────── */
const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('12px'),
    ...shorthands.padding('12px', `${HBC_SPACE_MD}px`),
    ...shorthands.borderLeft('4px', 'solid', 'transparent'),
    ...shorthands.borderRadius('0px'),
    width: '100%',
    animationName: keyframes.slideInUp as unknown as string,
    animationDuration: '250ms',
    animationTimingFunction: 'ease-out',
    animationFillMode: 'both',
    '@media (prefers-reduced-motion: reduce)': {
      animationDuration: '0ms',
    },
  },
  content: {
    ...body,
    flexGrow: 1,
    minWidth: 0,
  },
  dismiss: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...shorthands.padding('4px'),
    ...shorthands.border('0px', 'solid', 'transparent'),
    ...shorthands.borderRadius('4px'),
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: TRANSITION_FAST,
    transitionTimingFunction: 'ease-in-out',
    flexShrink: 0,
    ':hover': {
      backgroundColor: 'rgba(0,0,0,0.08)',
    },
  },
  iconWrap: {
    display: 'inline-flex',
    flexShrink: 0,
  },
});

/* ── component ───────────────────────────────────────────────── */
export const HbcBanner: React.FC<HbcBannerProps> = ({
  variant,
  children,
  icon,
  onDismiss,
  className,
}) => {
  const classes = useStyles();
  // UIF-028-addl: Select dark-compatible ramp in field/dark mode.
  const { isFieldMode } = useHbcTheme();
  const ramp = isFieldMode ? FIELD_VARIANT_RAMP[variant] : VARIANT_RAMP[variant];
  const DefaultIcon = VARIANT_ICON[variant];

  const role = variant === 'warning' || variant === 'error' ? 'alert' : 'status';
  const ariaLive = variant === 'warning' || variant === 'error' ? 'assertive' as const : 'polite' as const;

  return (
    <div
      role={role}
      aria-live={ariaLive}
      data-hbc-ui="banner"
      data-hbc-variant={variant}
      className={mergeClasses(classes.root, className)}
      style={{
        backgroundColor: ramp.bg,
        borderLeftColor: ramp.accent,
        color: ramp.text,
      }}
    >
      <span className={classes.iconWrap}>
        {icon ?? <DefaultIcon size="md" color={ramp.accent} />}
      </span>
      <div className={classes.content}>{children}</div>
      {onDismiss && (
        <button
          type="button"
          className={classes.dismiss}
          onClick={onDismiss}
          aria-label="Dismiss banner"
          style={{ color: ramp.text }}
        >
          <Cancel size="sm" />
        </button>
      )}
    </div>
  );
};

export type { HbcBannerProps, BannerVariant } from './types.js';
