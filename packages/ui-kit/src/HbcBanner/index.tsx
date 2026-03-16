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
    ...shorthands.padding('12px', '16px'),
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
  const ramp = VARIANT_RAMP[variant];
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
