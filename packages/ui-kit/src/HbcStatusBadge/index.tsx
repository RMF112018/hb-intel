/**
 * HbcStatusBadge — Consistent status indicators (V2.1 dual-channel)
 * Blueprint §1d — status variant → semantic color + mandatory shape icon
 * PH4.6 §Step 1 — Dual-channel: color + shape, never color alone (V2.1 Dec 26)
 * PH4.12 §Step 7 — animate prop: crossfade + pulse on variant change
 */
import * as React from 'react';
import { Badge, mergeClasses } from '@fluentui/react-components';
import { makeStyles } from '@griffel/react';
import { HBC_STATUS_COLORS } from '../theme/tokens.js';
import { TIMING, keyframes as kf } from '../theme/animations.js';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.js';
import {
  StatusCompleteIcon,
  StatusAttentionIcon,
  StatusOverdueIcon,
  StatusInfoIcon,
  StatusDraftIcon,
} from '../icons/index.js';
import type { HbcStatusBadgeProps, StatusVariant } from './types.js';

const STATUS_COLOR_MAP: Record<StatusVariant, string> = {
  success: HBC_STATUS_COLORS.success,
  warning: HBC_STATUS_COLORS.warning,
  error: HBC_STATUS_COLORS.error,
  info: HBC_STATUS_COLORS.info,
  neutral: HBC_STATUS_COLORS.neutral,
  onTrack: HBC_STATUS_COLORS.onTrack,
  atRisk: HBC_STATUS_COLORS.atRisk,
  critical: HBC_STATUS_COLORS.critical,
  pending: HBC_STATUS_COLORS.pending,
  inProgress: HBC_STATUS_COLORS.inProgress,
  completed: HBC_STATUS_COLORS.completed,
  draft: HBC_STATUS_COLORS.draft,
};

/**
 * V2.1 dual-channel icon map: each variant gets a distinct shape
 * so status is conveyed by both color AND shape (accessible in grayscale).
 */
const STATUS_ICON_MAP: Record<StatusVariant, React.FC<{ size?: 'sm' | 'md' | 'lg'; color?: string }>> = {
  success: StatusCompleteIcon,
  onTrack: StatusCompleteIcon,
  completed: StatusCompleteIcon,
  warning: StatusAttentionIcon,
  atRisk: StatusAttentionIcon,
  error: StatusOverdueIcon,
  critical: StatusOverdueIcon,
  info: StatusInfoIcon,
  inProgress: StatusInfoIcon,
  neutral: StatusDraftIcon,
  pending: StatusDraftIcon,
  draft: StatusDraftIcon,
};

const useStyles = makeStyles({
  badge: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  animating: {
    animationName: {
      '0%': { transform: 'scale(1)', opacity: 0.7 },
      '50%': { transform: 'scale(1.1)', opacity: 1 },
      '100%': { transform: 'scale(1)', opacity: 1 },
    },
    animationDuration: TIMING.badgePulse,
    animationTimingFunction: 'ease-in-out',
    animationFillMode: 'forwards',
  },
  reducedMotionAnimating: {
    animationName: kf.crossfade,
    animationDuration: TIMING.crossfade,
    animationFillMode: 'forwards',
  },
});

export const HbcStatusBadge: React.FC<HbcStatusBadgeProps> = ({
  variant,
  label,
  size = 'medium',
  icon,
  animate = false,
  className,
}) => {
  const styles = useStyles();
  const prefersReduced = usePrefersReducedMotion();
  const color = STATUS_COLOR_MAP[variant];

  // Track previous variant to detect changes
  const prevVariantRef = React.useRef(variant);
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    if (animate && prevVariantRef.current !== variant) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      prevVariantRef.current = variant;
      return () => clearTimeout(timer);
    }
    prevVariantRef.current = variant;
  }, [variant, animate]);

  // Auto-inject icon from variant map when not explicitly provided
  const IconComponent = STATUS_ICON_MAP[variant];
  const resolvedIcon = icon ?? <IconComponent size="sm" color="#FFFFFF" />;

  return (
    <Badge
      data-hbc-ui="status-badge"
      data-hbc-status={variant}
      className={mergeClasses(
        styles.badge,
        isAnimating && !prefersReduced && styles.animating,
        isAnimating && prefersReduced && styles.reducedMotionAnimating,
        className,
      )}
      size={size}
      icon={resolvedIcon as React.JSX.Element}
      appearance="filled"
      color="brand"
      style={{ backgroundColor: color }}
      aria-label={`${variant}: ${label}`}
    >
      {label}
    </Badge>
  );
};

export type { HbcStatusBadgeProps, StatusVariant } from './types.js';
